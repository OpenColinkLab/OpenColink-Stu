#!/usr/bin/env python3
"""amdl 本地图形界面服务。

查询：调用 `amdl --debug`，它只打印各曲目的可用音质表、不下载任何文件。
下载：调用 `amdl --json` 加档位参数，结束后解析 JSON 得到文件清单。
仅监听 127.0.0.1，供本机/局域网内自用。
"""
import json
import os
import re
import shutil
import subprocess
import threading
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GUI_DIR = os.path.join(ROOT, "gui")
AMDL = os.path.join(ROOT, "amdl")
CONFIG = os.path.join(ROOT, "config.yaml")
TMP_DIR = os.path.join(ROOT, "gui-tmp")
SETTINGS_FILE = os.path.join(GUI_DIR, "settings.json")
LITE_URL = "http://127.0.0.1:12340"
PORT = 8890

QUALITY_FLAGS = {
    "aac": ["--aac"],
    "lossless-44100": ["--alac-max", "44100"],
    "lossless-96000": ["--alac-max", "96000"],
    "lossless-192000": [],
    "atmos": ["--atmos"],
}

TRACK_RE = re.compile(r"^Track \d+ of \d+:")
NAME_RE = re.compile(r"^\d{2,3}\. .+")
QUALITY_PREFIX = "Quality set to:"


class Job:
    def __init__(self, kind, url, flags):
        self.kind = kind  # "query" | "download"
        self.url = url
        self.flags = flags
        self.lines = []
        self.tracks = []
        self.files = []
        self.single = None  # 单曲模式信息 {name, requested, track_number, total}
        self.error = None
        self.returncode = None
        self.running = True
        self.proc = None


job_lock = threading.Lock()
current_job = None


def submit_job(kind, url, flags):
    global current_job
    with job_lock:
        if current_job is not None and current_job.running:
            return None
        current_job = Job(kind, url, flags)
        return current_job


def job_snapshot():
    with job_lock:
        j = current_job
        if j is None:
            return None
        return {
            "kind": j.kind,
            "url": j.url,
            "running": j.running,
            "lines": list(j.lines),
            "tracks": j.tracks,
            "files": j.files,
            "single": j.single,
            "error": j.error,
            "returncode": j.returncode,
        }


def lookup_single_track(url):
    """链接含 ?i= 单曲参数时，用 Apple 公开目录接口解析出歌名与曲目序号。

    失败（无参数、网络问题、接口变化）返回 None，此时不过滤。
    """
    params = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
    tid = (params.get("i") or [None])[0]
    if not tid or not tid.isdigit():
        return None
    m = re.search(r"/([a-z]{2})/album/", url)
    country = m.group(1) if m else "us"
    try:
        req = urllib.request.Request(
            f"https://itunes.apple.com/lookup?id={tid}&country={country}",
            headers={"User-Agent": "Mozilla/5.0"},
        )
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode())
        r = (data.get("results") or [None])[0]
        if not isinstance(r, dict) or r.get("wrapperType") != "track":
            return None
        return {
            "id": tid,
            "name": r.get("trackName") or "",
            "track_number": r.get("trackNumber"),
        }
    except Exception:
        return None


def apply_single_filter(job):
    """单曲链接：把查询结果过滤为对应那一首（amdl --debug 会查询整张专辑）。"""
    info = lookup_single_track(job.url)
    if not info:
        return
    total = len(job.tracks)
    if not total:
        return
    want = info["name"].casefold()
    num = info["track_number"]
    for t in job.tracks:
        name = t["name"] or ""
        stripped = re.sub(r"^\d{1,3}[.、-]\s*", "", name).casefold()
        by_name = want and (stripped == want or want in stripped or stripped in want)
        m = re.match(r"^(\d{1,3})[.、-]", name)
        by_number = num is not None and m and int(m.group(1)) == num
        if by_name or by_number:
            job.tracks = [t]
            job.single = {
                "name": name,
                "requested": info["name"],
                "track_number": num,
                "total": total,
            }
            return


def make_query_config():
    """生成输出路径指向临时目录的配置，作为查询不落盘的保险。"""
    os.makedirs(TMP_DIR, exist_ok=True)
    cfg_path = os.path.join(TMP_DIR, "query-config.yaml")
    with open(cfg_path, "w", encoding="utf-8") as fh:
        fh.write(config_with_paths(TMP_DIR))
    return cfg_path


def load_settings():
    try:
        with open(SETTINGS_FILE, encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return {}


def save_settings(settings):
    with open(SETTINGS_FILE, "w", encoding="utf-8") as fh:
        json.dump(settings, fh, ensure_ascii=False, indent=2)


def download_dir_setting():
    d = str(load_settings().get("download_dir") or "").strip()
    return os.path.expanduser(d) if d else None


def config_with_paths(target):
    """生成"平铺"配置：所有音质直接存到 target 根目录，不建任何子文件夹。

    - paths 段的 alac/atmos/aac/mv 全部指向 target 本身；
    - artist-folder/album-folder 模板置空（config.yaml 注明支持 ""），amdl 不再
      按 歌手/专辑 分层。
    只匹配带引号取值的 alac/atmos/aac/mv 键，media 段的 alac-max 等不受影响，
    也不修改原 config.yaml。
    """
    with open(CONFIG, encoding="utf-8") as fh:
        text = fh.read()
    os.makedirs(target, exist_ok=True)
    text = re.sub(
        r'(?m)^(\s*(?:alac|atmos|aac|mv):\s*)("[^"]*")(.*)$',
        lambda m: f'{m.group(1)}"{target}"{m.group(3)}',
        text,
    )
    text = re.sub(r'(?m)^(\s*artist-folder:\s*)("[^"]*")(.*)$', r'\1""\3', text)
    text = re.sub(
        r'(?m)^(\s*album-folder:\s*)("[^"]*")(.*)$',
        lambda m: f'{m.group(1)}"."{m.group(3)}',
        text,
    )
    return text


def parse_tracks(lines):
    """从 amdl 输出解析每首曲目的名称、实际音质行和可用音质表。

    音质表结构: 表头行 → 分隔线 → 若干 "名称 : 值" 行 → 分隔线。
    """
    tracks = []
    cur = None
    state = "idle"  # idle | wait_dash | rows
    for raw in lines:
        line = raw.rstrip()
        if TRACK_RE.match(line):
            cur = {"name": None, "formats": {}, "quality": None}
            tracks.append(cur)
            state = "idle"
            continue
        if cur is None:
            continue
        if cur["name"] is None:
            s = line.strip()
            if NAME_RE.match(s):
                cur["name"] = s
            continue
        if line.startswith(QUALITY_PREFIX):
            cur["quality"] = line[len(QUALITY_PREFIX):].strip()
            continue
        if line.startswith("Available Audio Formats:"):
            state = "wait_dash"
            continue
        s = line.strip()
        dashed = bool(s) and set(s) == {"-"}
        if state == "wait_dash":
            if dashed:
                state = "rows"
        elif state == "rows":
            if dashed:
                state = "idle"
                continue
            m = re.match(r"^(.+?)\s*:\s*(.*)$", s)
            if m:
                cur["formats"][m.group(1).strip()] = m.group(2).strip()
    return tracks


def parse_files(lines):
    """amdl --json 会在最后一行输出文件清单 JSON。"""
    files = []
    for raw in reversed(lines):
        s = raw.strip()
        if not s.startswith("["):
            continue
        try:
            data = json.loads(s)
        except ValueError:
            continue
        if isinstance(data, list):
            files = [
                {k: f.get(k) for k in ("path", "artist", "album", "song")}
                for f in data
                if isinstance(f, dict) and f.get("path")
            ]
            break
    for f in files:
        p = f["path"]
        f["abs"] = p if os.path.isabs(p) else os.path.join(ROOT, p)
    return files


def cleanup_tmp():
    shutil.rmtree(TMP_DIR, ignore_errors=True)


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def cleanup_artwork(job, started):
    """删除本次下载产生的独立封面图片文件（封面仍内嵌在音频文件里）。

    只清理下载文件所在目录中、任务开始之后新出现的图片，不碰用户已有文件。
    """
    dirs = {os.path.dirname(f["abs"]) for f in job.files if f.get("abs")}
    removed = []
    for d in dirs:
        try:
            names = os.listdir(d)
        except OSError:
            continue
        for name in names:
            p = os.path.join(d, name)
            try:
                if (os.path.isfile(p)
                        and os.path.splitext(name)[1].lower() in IMAGE_EXTS
                        and os.path.getmtime(p) >= started):
                    os.remove(p)
                    removed.append(os.path.basename(p))
            except OSError:
                pass
    if removed:
        job.lines.append(f"[gui] 已删除独立封面文件: {', '.join(removed)}")


def run_job(job):
    global current_job
    try:
        started = time.time()
        if job.kind == "query":
            cmd = [AMDL, "--debug", "-c", make_query_config(), job.url]
        else:
            cmd = [AMDL, "--json", *job.flags]
            ddir = download_dir_setting()
            if ddir:
                os.makedirs(TMP_DIR, exist_ok=True)
                cfg_path = os.path.join(TMP_DIR, "download-config.yaml")
                with open(cfg_path, "w", encoding="utf-8") as fh:
                    fh.write(config_with_paths(ddir))
                cmd += ["-c", cfg_path]
                job.lines.append(f"[gui] 下载目录: {ddir}")
            else:
                job.lines.append("[gui] 下载目录: 默认（config.yaml 的 AM-Lossless / AM-Atmos / AM-AAC / AM-MV）")
            cmd.append(job.url)
        job.lines.append("$ " + " ".join(cmd))
        proc = subprocess.Popen(
            cmd, cwd=ROOT,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, bufsize=1,
        )
        job.proc = proc
        while True:
            line = proc.stdout.readline()
            if not line:
                break
            with job_lock:
                job.lines.append(line.rstrip("\n"))
        proc.wait()
        job.returncode = proc.returncode
        job.tracks = parse_tracks(job.lines)
        if job.kind == "download":
            job.files = parse_files(job.lines)
            cleanup_artwork(job, started)
        else:
            apply_single_filter(job)
            cleanup_tmp()
    except Exception as exc:
        job.error = str(exc)
        job.lines.append(f"[gui] 任务异常: {exc}")
    finally:
        job.running = False


def backend_status():
    try:
        with urllib.request.urlopen(LITE_URL + "/status", timeout=2) as resp:
            data = json.loads(resp.read().decode())
        regions = (data.get("data") or {}).get("regions") or []
        return {"running": True, "regions": regions}
    except Exception:
        return {"running": False, "regions": []}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n)) if n else {}

    def do_GET(self):
        if self.path == "/":
            try:
                with open(os.path.join(GUI_DIR, "index.html"), encoding="utf-8") as fh:
                    body = fh.read().encode()
            except OSError:
                self._json({"error": "index.html 缺失"}, 500)
                return
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif self.path == "/api/status":
            self._json(backend_status())
        elif self.path == "/api/job":
            self._json({"job": job_snapshot()})
        elif self.path == "/api/settings":
            self._json({"download_dir": load_settings().get("download_dir", "")})
        else:
            self._json({"error": "not found"}, 404)

    def do_POST(self):
        body = self._body()
        if self.path == "/api/query":
            url = (body.get("url") or "").strip()
            if not url.startswith("https://music.apple.com/"):
                self._json({"error": "请填写 music.apple.com 的歌曲或专辑链接"}, 400)
                return
            job = submit_job("query", url, [])
            if job is None:
                self._json({"error": "已有任务在运行，请稍候"}, 409)
                return
            threading.Thread(target=run_job, args=(job,), daemon=True).start()
            self._json({"ok": True})
        elif self.path == "/api/download":
            url = (body.get("url") or "").strip()
            quality = body.get("quality")
            if not url.startswith("https://music.apple.com/"):
                self._json({"error": "请填写 music.apple.com 的歌曲或专辑链接"}, 400)
                return
            if quality not in QUALITY_FLAGS:
                self._json({"error": f"未知音质档位: {quality}"}, 400)
                return
            job = submit_job("download", url, QUALITY_FLAGS[quality])
            if job is None:
                self._json({"error": "已有任务在运行，请稍候"}, 409)
                return
            threading.Thread(target=run_job, args=(job,), daemon=True).start()
            self._json({"ok": True})
        elif self.path == "/api/stop":
            with job_lock:
                j = current_job
                if j and j.running and j.proc:
                    j.proc.terminate()
            self._json({"ok": True})
        elif self.path == "/api/settings":
            d = str(body.get("download_dir") or "").strip()
            if not d:
                s = load_settings()
                s["download_dir"] = ""
                save_settings(s)
                self._json({"ok": True, "download_dir": ""})
                return
            if '"' in d:
                self._json({"error": "路径不能包含引号"}, 400)
                return
            d = os.path.expanduser(d)
            if not os.path.isabs(d):
                self._json({"error": "请填写绝对路径（可用 ~ 开头）"}, 400)
                return
            try:
                os.makedirs(d, exist_ok=True)
                if not os.access(d, os.W_OK):
                    raise PermissionError("目录不可写")
            except OSError as exc:
                self._json({"error": f"无法使用该目录: {exc}"}, 400)
                return
            d = d.rstrip("/") or "/"
            s = load_settings()
            s["download_dir"] = d
            save_settings(s)
            self._json({"ok": True, "download_dir": d})
        elif self.path == "/api/browse":
            # Native macOS folder picker; returns {"canceled": true} on cancel.
            # NOTE: choose folder does not support "giving up after".
            start_dir = download_dir_setting() or os.path.expanduser("~")
            script = (
                'POSIX path of (choose folder with prompt "Select download folder" '
                f'default location POSIX file "{start_dir}")'
            )
            try:
                proc = subprocess.run(
                    ["osascript", "-e", script],
                    capture_output=True, text=True, timeout=600,
                )
            except subprocess.TimeoutExpired:
                self._json({"canceled": True})
                return
            out = proc.stdout.strip().rstrip("/")
            stderr = proc.stderr or ""
            canceled = (
                proc.returncode < 0          # killed by signal (e.g. SIGTERM/-15)
                or "-128" in stderr          # AppleScript user-cancel error no.
                or "canceled" in stderr.lower()
                or "已取消" in stderr
            )
            if proc.returncode == 0 and out:
                self._json({"ok": True, "path": out})
            elif canceled:
                self._json({"canceled": True})
            else:
                self._json({"error": f"Cannot open folder picker: {stderr.strip()}"}, 500)
        elif self.path == "/api/reveal":
            path = body.get("path") or ""
            if not os.path.isabs(path) or not os.path.realpath(path).startswith(ROOT):
                self._json({"error": "路径不在本工具目录内"}, 400)
                return
            subprocess.Popen(["open", "-R", path])
            self._json({"ok": True})
        else:
            self._json({"error": "not found"}, 404)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"amdl 图形界面: http://127.0.0.1:{PORT}  (Ctrl+C 退出)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
