import { EventEmitter } from "node:events";
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  isBilibiliURL,
  isYoukuURL,
  durationProblem,
  redactLog,
} from "./auth-utils";
import type { Task, Settings, Snapshot, AuthStatus } from "./types";
export function validateURL(input: string): string {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    throw new Error("请输入完整的视频网址，例如 https://example.com/video.mp4");
  }
  if (
    !["http:", "https:"].includes(u.protocol) ||
    !u.hostname ||
    u.username ||
    u.password
  )
    throw new Error("仅支持不含账号密码的 HTTP 或 HTTPS 视频网址。");
  return u.href;
}
export function friendlyError(s: string, url?: string): string {
  if (/ACCESS: |INCOMPLETE: /.test(s))
    return s.replace(/^.*?(?:ACCESS: |INCOMPLETE: )/, "");
  if (/ENOSPC|No space left|disk full/i.test(s))
    return "磁盘空间不足。请释放空间或更换保存位置后重试。";
  if (/EACCES|EPERM|Permission denied|read-only/i.test(s))
    return "无法写入保存目录。请检查权限或选择其他文件夹。";
  if (/ENOENT|not found.*ffmpeg|ffmpeg.*not found/i.test(s))
    return "应用运行依赖或保存路径缺失。请检查保存目录，必要时重新安装完整应用。";
  if (/DRM|copyright.protected|encrypted media/i.test(s))
    return "此视频使用受保护的媒体流，当前下载引擎无法保存。请使用平台提供的官方离线功能。";
  if (isYoukuURL(url || "") && /-3007|观看此节目，请先登录/.test(s))
    return "优酷服务端仍将此下载请求视为未登录。请在应用内重新打开优酷登录窗口，确认官网个人中心显示会员状态后重试；若官网已登录仍报此错，当前下载引擎可能不支持该视频。";
  if (
    isYoukuURL(url || "") &&
    /VIP|会员|付费|试看|login|sign in|cookies|authentication|403|401/i.test(
      s,
    )
  )
    return "优酷拒绝提供完整视频。请确认官网登录账号有观看权限后重试；若官网可正常播放但仍失败，当前下载引擎可能不支持该 VIP 视频。";
  if (
    /login|sign in|cookies|private|members.only|authentication|403|401|age.restrict|bot/i.test(
      s,
    )
  )
    return "此视频需要登录、授权，或网站限制了访问。请先登录对应平台上有观看权限的账号后重试。";
  if (/404|410|not available|unavailable|removed|does not exist/i.test(s))
    return "视频不存在、已失效或在当前地区不可用。请在浏览器中确认链接。";
  if (
    /Unsupported URL|No video formats|not a valid URL|Unsupported video/i.test(
      s,
    )
  )
    return "暂时无法从此链接提取视频。请使用具体视频页面或 MP4 等视频直链。";
  if (
    /timed out|timeout|network|resolve|connection|SSL|certificate|urlopen|Remote end/i.test(
      s,
    )
  )
    return "网络连接失败或超时。请检查网络、确认网站可以访问，然后重试。";
  return "下载未能完成。请确认链接可公开访问后重试，展开技术日志可查看具体原因。";
}
export class Engine extends EventEmitter {
  tasks: Task[] = [];
  auth: AuthStatus = {
    state: "logged-out",
    message: "尚未登录 B 站",
    remembered: false,
  };
  youkuAuth: AuthStatus = {
    state: "logged-out",
    message: "尚未登录优酷",
    remembered: false,
  };
  authorize?: (
    url: string,
  ) => Promise<{ args: string[]; cleanup: () => Promise<void> }>;
  checkAccess?: (url: string) => Promise<void>;
  settings: Settings;
  dependencies = { ok: true, message: "下载引擎已就绪" };
  private children = new Map<string, ChildProcess>();
  private active = false;
  private activeTask?: string;
  private parsing = new Map<string, Task>();
  private revisions = new Map<string, number>();
  private stopped = false;
  private timer?: NodeJS.Timeout;
  constructor(
    public bin: string,
    public stateDir: string,
    defaultDirectory: string,
  ) {
    super();
    fs.mkdirSync(stateDir, { recursive: true });
    this.settings = { directory: defaultDirectory, theme: "system" };
    try {
      const s = JSON.parse(
        fs.readFileSync(path.join(stateDir, "state.json"), "utf8"),
      );
      this.settings = { ...this.settings, ...s.settings };
      this.tasks = (s.tasks || []).map((t: Task) => ({
        ...t,
        status: [
          "pending",
          "queued",
          "parsing",
          "downloading",
          "merging",
          "verifying",
        ].includes(t.status)
          ? "failed"
          : t.status,
        error: [
          "pending",
          "queued",
          "parsing",
          "downloading",
          "merging",
          "verifying",
        ].includes(t.status)
          ? "上次退出时任务尚未完成，点击重试继续下载。"
          : t.error,
      }));
      for (const task of this.tasks) {
        if (
          task.status === "failed" &&
          isYoukuURL(task.url) &&
          task.logs.some((line) => /-3007|观看此节目，请先登录/.test(line))
        )
          task.error = friendlyError("Youku server reported error -3007", task.url);
      }
    } catch {}
    for (const n of ["yt-dlp", "ffmpeg", "ffprobe"]) {
      try {
        fs.accessSync(this.executable(n), fs.constants.X_OK);
      } catch {
        this.dependencies = {
          ok: false,
          message: "缺少内置下载组件，请重新安装完整应用。",
        };
      }
    }
  }
  executable(n: string) {
    if (n === "yt-dlp" && process.platform === "darwin")
      return path.join(this.bin, "yt-dlp-runtime", "yt-dlp_macos");
    return path.join(
      this.bin,
      n + (process.platform === "win32" ? ".exe" : ""),
    );
  }
  snapshot(): Snapshot {
    return {
      auth: this.auth,
      youkuAuth: this.youkuAuth,
      tasks: this.tasks,
      settings: this.settings,
      dependencies: this.dependencies,
    };
  }
  persist() {
    fs.writeFileSync(
      path.join(this.stateDir, "state.tmp"),
      JSON.stringify(this.snapshot()),
    );
    fs.renameSync(
      path.join(this.stateDir, "state.tmp"),
      path.join(this.stateDir, "state.json"),
    );
  }
  changed() {
    this.emit("update", this.snapshot());
    if (!this.timer)
      this.timer = setTimeout(() => {
        this.timer = undefined;
        this.persist();
      }, 600);
  }
  async checkDirectory(dir: string) {
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.access(dir, fs.constants.W_OK);
    const f = path.join(dir, `.vd-write-${randomUUID()}`);
    await fs.promises.writeFile(f, "", { flag: "wx" });
    await fs.promises.unlink(f);
    const stats = await fs.promises.statfs(dir);
    if (stats.bavail * stats.bsize < 20 * 1024 * 1024)
      throw new Error("ENOSPC");
  }
  get(id: string) {
    const t = this.tasks.find((t) => t.id === id);
    if (!t) throw new Error("找不到此任务。");
    return t;
  }
  add(input: string, inspect = false) {
    if (!this.dependencies.ok) throw new Error(this.dependencies.message);
    const url = validateURL(input);
    const task: Task = {
      id: randomUUID(),
      url,
      title: "正在读取视频信息",
      source: new URL(url).hostname,
      status: "pending",
      inspectOnly: inspect,
      createdAt: new Date().toISOString(),
      directory: this.settings.directory,
      heights: [],
      logs: [],
    };
    this.tasks.unshift(task);
    this.changed();
    this.pumpParsers();
    return task.id;
  }
  private revision(t: Task) {
    return this.revisions.get(t.id) || 0;
  }
  private invalidate(t: Task) {
    this.revisions.set(t.id, this.revision(t) + 1);
    const draft = this.parsing.get(t.id);
    if (draft) draft.status = "cancelled";
    const child = this.children.get(t.id);
    if (child) this.kill(child);
  }
  private pumpParsers() {
    if (this.stopped) return;
    while (this.parsing.size < 2) {
      const t = this.tasks
        .slice()
        .reverse()
        .find((t) => t.status === "pending" && !this.parsing.has(t.id));
      if (!t) break;
      const version = this.revision(t);
      const draft: Task = { ...t, logs: [...t.logs], heights: [...t.heights] };
      this.parsing.set(t.id, draft);
      t.status = "parsing";
      this.changed();
      void this.resolveMetadata(t, draft, version);
    }
  }
  private async resolveMetadata(t: Task, draft: Task, version: number) {
    const current = () =>
      !this.stopped &&
      this.tasks.includes(t) &&
      this.revision(t) === version &&
      t.status === "parsing";
    try {
      await this.parse(draft);
      if (!current()) return;
      Object.assign(t, {
        title: draft.title,
        thumbnail: draft.thumbnail,
        duration: draft.duration,
        expectedDuration: draft.expectedDuration,
        source: draft.source,
        heights: draft.heights,
        expectedAudio: draft.expectedAudio,
        logs: draft.logs,
        parsedAt: Date.now(),
        status: t.inspectOnly ? "ready" : "queued",
      });
      this.changed();
    } catch (e) {
      if (current()) {
        t.logs = draft.logs;
        this.fail(t, e);
      }
    } finally {
      this.parsing.delete(t.id);
      this.pumpParsers();
      void this.pump();
    }
  }
  refreshAuthorization(matches: (url: string) => boolean = isBilibiliURL) {
    for (const t of this.tasks) {
      if (
        t.id !== this.activeTask &&
        matches(t.url) &&
        ["pending", "parsing", "queued", "ready"].includes(t.status)
      ) {
        this.invalidate(t);
        t.status = "pending";
        t.parsedAt = undefined;
      }
    }
    this.changed();
    this.pumpParsers();
  }
  start(id: string, quality?: number) {
    const t = this.get(id);
    if (t.status !== "ready") throw new Error("任务尚未解析完成。");
    if (quality !== undefined && !t.heights.includes(quality))
      throw new Error("此视频没有提供所选清晰度。");
    t.quality = quality;
    t.inspectOnly = false;
    t.status = "queued";
    this.changed();
    void this.pump();
  }
  async pump() {
    if (this.active || this.stopped) return;
    const t = this.tasks
      .slice()
      .reverse()
      .find(
        (t) =>
          !t.inspectOnly && ["pending", "parsing", "queued"].includes(t.status),
      );
    if (!t || t.status !== "queued" || this.parsing.has(t.id)) return;
    // Refresh old metadata through the same bounded parser pool.
    if (!t.parsedAt || Date.now() - t.parsedAt > 5 * 60_000) {
      t.status = "pending";
      this.changed();
      this.pumpParsers();
      return;
    }
    this.active = true;
    this.activeTask = t.id;
    try {
      await this.download(t);
    } catch (e) {
      this.fail(t, e);
    } finally {
      this.active = false;
      this.activeTask = undefined;
      void this.pump();
    }
  }
  fail(t: Task, e: unknown) {
    if (t.status === "cancelled") return;
    t.status = "failed";
    t.error = friendlyError(String(e), t.url);
    this.log(t, String(e));
    this.changed();
  }
  log(t: Task, line: string) {
    t.logs.push(redactLog(line).slice(0, 2000));
    if (t.logs.length > 100) t.logs.shift();
  }
  async run(
    t: Task,
    exe: string,
    args: string[],
    line?: (s: string) => void,
    timeout = 0,
  ): Promise<string> {
    const youkuProcess = exe === this.executable("yt-dlp") && isYoukuURL(t.url);
    const lease =
      exe === this.executable("yt-dlp") &&
      (isBilibiliURL(t.url) || isYoukuURL(t.url)) &&
      this.authorize
        ? await this.authorize(t.url)
        : undefined;
    try {
      const command = [...(lease?.args || []), ...args];
      if (youkuProcess) {
        try {
          // An inactive system proxy can break Youku's metadata endpoint.
          // Start directly, then use the configured proxy only if the network fails.
          return await this.runProcess(
            t,
            exe,
            ["--proxy", "", ...command],
            line,
            timeout,
          );
        } catch (error) {
          if (
            t.status === "cancelled" ||
            !/SSL|timeout|timed out|network|resolve|connection|urlopen|Remote end/i.test(
              String(error),
            )
          )
            throw error;
          this.log(t, "优酷直连遇到网络错误，尝试系统代理后重试。");
        }
      }
      return await this.runProcess(t, exe, command, line, timeout);
    } finally {
      await lease?.cleanup();
    }
  }
  private runProcess(
    t: Task,
    exe: string,
    args: string[],
    line?: (s: string) => void,
    timeout = 0,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (t.status === "cancelled") return reject(new Error("cancelled"));
      const child = spawn(exe, args, {
        shell: false,
        windowsHide: true,
        detached: process.platform !== "win32",
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });
      this.children.set(t.id, child);
      let stdout = "",
        stderr = "",
        pending = "";
      let expired = false;
      const deadline = timeout
        ? setTimeout(() => {
            expired = true;
            this.kill(child);
          }, timeout)
        : undefined;
      child.stdout?.on("data", (b: Buffer) => {
        stdout += b.toString();
        if (stdout.length > 16_000_000) stdout = stdout.slice(-16_000_000);
        pending += b.toString();
        const lines = pending.split(/\r?\n/);
        pending = lines.pop() || "";
        lines.forEach((s) => line?.(s));
      });
      child.stderr?.on("data", (b: Buffer) => {
        const s = b.toString();
        stderr = (stderr + s).slice(-20000);
        s.trim()
          .split("\n")
          .forEach((s) => (line ? line(s) : this.log(t, s)));
      });
      child.on("error", (e) => {
        if (deadline) clearTimeout(deadline);
        this.children.delete(t.id);
        reject(e);
      });
      child.on("close", (code) => {
        if (deadline) clearTimeout(deadline);
        this.children.delete(t.id);
        if (pending) line?.(pending);
        if (expired) reject(new Error("network timeout"));
        else if (code !== 0) reject(new Error(stderr || `进程退出码 ${code}`));
        else resolve(stdout);
      });
    });
  }
  kill(c: ChildProcess) {
    if (!c.pid) return;
    try {
      if (process.platform === "win32") {
        const killer = spawn("taskkill", ["/pid", String(c.pid), "/T", "/F"], {
          windowsHide: true,
        });
        killer.on("error", () => {
          try {
            c.kill();
          } catch {}
        });
        return;
      } else process.kill(-c.pid, "SIGTERM");
    } catch {}
    const pid = c.pid;
    setTimeout(() => {
      if (c.exitCode === null && c.signalCode === null)
        try {
          process.kill(-pid, "SIGKILL");
        } catch {}
    }, 1500).unref();
  }
  base() {
    return [
      "--ignore-config",
      "--no-playlist",
      "--no-colors",
      "--no-cache-dir",
      "--no-plugin-dirs",
      "--socket-timeout",
      "20",
      "--retries",
      "2",
      "--ffmpeg-location",
      this.bin,
    ];
  }
  async parse(t: Task) {
    t.status = "parsing";
    this.changed();
    await this.checkAccess?.(t.url);
    if (t.status === ("cancelled" as string)) return;
    const raw = await this.run(
      t,
      this.executable("yt-dlp"),
      [...this.base(), "--dump-single-json", "--skip-download", "--", t.url],
      undefined,
      90000,
    );
    if (t.status === ("cancelled" as string)) return;
    const info = JSON.parse(raw);
    if (info._type === "playlist" || info.entries)
      throw new Error("Unsupported URL: 请使用单个视频链接");
    if (info.is_live)
      throw new Error("Unsupported video: 首版暂不支持直播，请等待直播结束");
    t.title = info.title || "未命名视频";
    t.thumbnail =
      typeof info.thumbnail === "string" && /^https?:\/\//.test(info.thumbnail)
        ? info.thumbnail
        : undefined;
    t.duration = info.duration;
    t.expectedDuration = info.duration;
    t.source =
      info.extractor_key &&
      !["Generic", "HTML5MediaEmbed"].includes(info.extractor_key)
        ? info.extractor_key
        : new URL(t.url).hostname;
    t.heights = [
      ...new Set<number>(
        (info.formats || [])
          .filter(
            (f: any) =>
              f.vcodec !== "none" && Number.isFinite(f.height) && !f.has_drm,
          )
          .map((f: any) => f.height),
      ),
    ].sort((a, b) => b - a);
    t.expectedAudio = (info.formats || [info]).some(
      (f: any) => f.acodec && f.acodec !== "none",
    );
    this.changed();
  }
  async download(t: Task) {
    await this.checkDirectory(t.directory);
    if (t.status === "cancelled") return;
    // yt-dlp resolves fresh media URLs below; keep the prefetched metadata visible.
    await this.checkAccess?.(t.url);
    if (t.status === ("cancelled" as string)) return;
    if (t.quality && !t.heights.includes(t.quality))
      throw new Error(
        "ACCESS: 当前账号已无法使用所选画质，请重新解析并选择可用清晰度。",
      );
    t.status = "downloading";
    t.error = undefined;
    t.progress = undefined;
    this.changed();
    const format = t.quality
      ? `bestvideo[height=${t.quality}]+bestaudio/best[height=${t.quality}]`
      : "bv*+ba/b";
    const template = path.join(
      t.directory,
      `%(title).100B [${t.id.slice(0, 8)}${t.attempt ? "-r" + t.attempt : ""}].%(ext)s`,
    );
    await this.run(
      t,
      this.executable("yt-dlp"),
      [
        ...this.base(),
        "--newline",
        "--progress",
        "--progress-delta",
        "0.3",
        "--no-simulate",
        "--no-overwrites",
        "--windows-filenames",
        "--trim-filenames",
        "180",
        "--format",
        format,
        "--merge-output-format",
        "mkv",
        "--output",
        template,
        "--print",
        "before_dl:VD_META:%(.{title,height,width,format_note})j",
        "--print",
        "after_move:VD_FILE:%(filepath)j",
        "--progress-template",
        "download:VD_PROGRESS:%(progress)j",
        "--progress-template",
        "postprocess:VD_POST:%(progress.status)s",
        "--",
        t.url,
      ],
      (line) => {
        if (t.status === "cancelled") return;
        if (line.startsWith("VD_PROGRESS:")) {
          try {
            const p = JSON.parse(line.slice(12));
            t.status = "downloading";
            t.downloaded = p.downloaded_bytes;
            t.total = p.total_bytes || p.total_bytes_estimate;
            t.progress = t.total
              ? Math.min(100, (100 * (t.downloaded || 0)) / t.total)
              : undefined;
            t.speed = typeof p.speed === "number" ? p.speed : undefined;
            t.eta = typeof p.eta === "number" ? p.eta : undefined;
          } catch {}
        } else if (line.startsWith("VD_FILE:")) {
          try {
            t.file = JSON.parse(line.slice(8));
          } catch {}
        } else if (line.startsWith("VD_META:")) {
          try {
            const m = JSON.parse(line.slice(8));
            t.actualQuality = m.height ? `${m.height}p` : undefined;
          } catch {}
        } else if (line.startsWith("VD_POST:") || /\[Merger\]/.test(line)) {
          t.status = "merging";
          t.speed = undefined;
          t.eta = undefined;
        } else this.log(t, line);
        this.changed();
      },
    );
    if (t.status === ("cancelled" as string)) return;
    if (
      !t.file ||
      path.dirname(path.resolve(t.file)) !== path.resolve(t.directory)
    )
      throw new Error("下载完成但未能确认输出文件。");
    t.status = "verifying";
    this.changed();
    const stat = await fs.promises.stat(t.file);
    if (!stat.size) throw new Error("输出视频为空。");
    const probe = JSON.parse(
      await this.run(
        t,
        this.executable("ffprobe"),
        ["-v", "error", "-show_streams", "-show_format", "-of", "json", t.file],
        undefined,
        30000,
      ),
    );
    const video = probe.streams?.find((s: any) => s.codec_type === "video");
    if (!video) throw new Error("源文件不包含视频画面。");
    if (
      t.expectedAudio &&
      !probe.streams.some((s: any) => s.codec_type === "audio")
    )
      throw new Error("输出文件缺少来源提供的音轨。");
    t.actualQuality = video.height ? `${video.height}p` : undefined;
    t.actualDuration = Number(probe.format?.duration) || undefined;
    if (durationProblem(t.expectedDuration, t.actualDuration))
      throw new Error(
        `INCOMPLETE: 文件不完整：原视频约 ${Math.round(t.expectedDuration!)} 秒，下载文件仅 ${Math.round(t.actualDuration!)} 秒，可能只取得了试看内容。请登录拥有完整观看权限的账号后重试。已保留文件，但不会标记为下载完成。`,
      );
    if (t.expectedDuration && !t.actualDuration)
      throw new Error("INCOMPLETE: 无法确认下载文件的完整时长，请重试。");
    t.duration = t.actualDuration || t.duration;
    t.total = stat.size;
    if (t.status === ("cancelled" as string)) return;
    if (!t.thumbnail) {
      const cover = path.join(this.stateDir, t.id + ".jpg");
      try {
        await this.run(
          t,
          this.executable("ffmpeg"),
          [
            "-v",
            "error",
            "-y",
            "-i",
            t.file,
            "-frames:v",
            "1",
            "-vf",
            "scale=320:-2",
            "-q:v",
            "5",
            cover,
          ],
          undefined,
          15000,
        );
        t.thumbnail =
          "data:image/jpeg;base64," + fs.readFileSync(cover).toString("base64");
      } catch (e) {
        this.log(t, "封面生成跳过：" + String(e));
      } finally {
        try {
          fs.unlinkSync(cover);
        } catch {}
      }
    }
    if (t.status === ("cancelled" as string)) return;
    t.status = "completed";
    t.progress = 100;
    t.speed = undefined;
    t.eta = undefined;
    this.changed();
  }
  cancel(id: string) {
    const t = this.get(id);
    if (
      ![
        "pending",
        "queued",
        "parsing",
        "ready",
        "downloading",
        "merging",
        "verifying",
      ].includes(t.status)
    )
      return;
    this.invalidate(t);
    t.status = "cancelled";
    t.error = undefined;
    const c = this.children.get(id);
    if (c) this.kill(c);
    this.changed();
    this.pumpParsers();
    void this.pump();
  }
  retry(id: string) {
    const t = this.get(id);
    if (!["failed", "cancelled"].includes(t.status)) return;
    if (this.activeTask === id)
      throw new Error("正在停止上一次下载，请稍后重试。");
    this.invalidate(t);
    t.status = "pending";
    t.parsedAt = undefined;
    t.error = undefined;
    t.progress = undefined;
    t.speed = undefined;
    t.eta = undefined;
    t.file = undefined;
    t.attempt = (t.attempt || 0) + 1;
    t.actualDuration = undefined;
    this.changed();
    this.pumpParsers();
    void this.pump();
  }
  remove(id: string) {
    const t = this.get(id);
    if (!["completed", "failed", "cancelled"].includes(t.status))
      throw new Error("请先取消任务。");
    this.tasks = this.tasks.filter((x) => x.id !== id);
    this.changed();
  }
  async setDirectory(dir: string) {
    await this.checkDirectory(dir);
    this.settings.directory = dir;
    this.changed();
  }
  shutdown() {
    this.stopped = true;
    for (const draft of this.parsing.values()) draft.status = "cancelled";
    for (const t of this.tasks)
      if (
        [
          "pending",
          "parsing",
          "downloading",
          "merging",
          "verifying",
          "queued",
        ].includes(t.status)
      ) {
        t.status = "failed";
        t.error = "应用关闭时任务尚未完成，点击重试继续。";
      }
    for (const c of this.children.values()) this.kill(c);
    if (this.timer) clearTimeout(this.timer);
    this.persist();
  }
}
