import json
import queue
import threading
from pathlib import Path

import httpx
from PySide6.QtCore import QObject, Signal, QStandardPaths

from .audio import cover_bytes, download_audio, inspect_audio
from .auth import AccountStore
from .links import resolve_link
from .models import DownloadError
from .providers import PROVIDERS
from .providers.alternate import AlternateProvider
from .providers.netease_member import NeteaseMemberProvider
from .quality_catalog import fetch_quality_catalog


class Events(QObject):
    info = Signal(int, object, object)
    qualities = Signal(int, object)
    preview_ready = Signal(int)
    preview_failed = Signal(int, str)
    progress = Signal(int, int)
    state = Signal(int, str)
    complete = Signal(int, str, object, object)


class DownloadManager:
    def __init__(self):
        self.events = Events()
        self.account = AccountStore()
        self.pending = queue.Queue()
        self.preview_pending = queue.Queue()
        self.cancellations = {}
        self.preview_cancellations = {}
        self.active_keys = set()
        self.lock = threading.Lock()
        app_data = Path(QStandardPaths.writableLocation(QStandardPaths.StandardLocation.AppDataLocation))
        app_data.mkdir(parents=True, exist_ok=True)
        self.manifest_path = app_data / "downloads.json"
        try:
            self.manifest = json.loads(self.manifest_path.read_text())
        except (OSError, ValueError):
            self.manifest = {}
        threading.Thread(target=self._loop, daemon=True, name="download-worker").start()
        threading.Thread(target=self._preview_loop, daemon=True, name="song-preview-worker").start()

    def preview(self, task_id: int, url: str) -> None:
        cancelled = threading.Event()
        self.preview_cancellations[task_id] = cancelled
        self.preview_pending.put((task_id, url, cancelled))

    def cancel_preview(self, task_id: int) -> None:
        if task_id in self.preview_cancellations:
            self.preview_cancellations[task_id].set()

    def add(self, task_id: int, url: str, folder: str, mp3: bool, quality: str = "auto") -> None:
        event = threading.Event()
        self.cancellations[task_id] = event
        self.pending.put((task_id, url, Path(folder), mp3, quality, event))

    def cancel(self, task_id: int) -> None:
        if task_id in self.cancellations:
            self.cancellations[task_id].set()

    def _save_manifest(self) -> None:
        temp = self.manifest_path.with_suffix(".tmp")
        temp.write_text(json.dumps(self.manifest, ensure_ascii=False, indent=2))
        temp.replace(self.manifest_path)

    def _preview_loop(self) -> None:
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
                   "Referer": "https://music.163.com/"}
        with httpx.Client(headers=headers, follow_redirects=True, timeout=20) as client:
            while True:
                task_id, url, cancelled = self.preview_pending.get()
                try:
                    self._preview_one(task_id, url, client, cancelled)
                except (DownloadError, httpx.HTTPError, OSError, ValueError, KeyError) as exc:
                    if not cancelled.is_set():
                        self.events.preview_failed.emit(task_id, str(exc))
                finally:
                    if self.preview_cancellations.get(task_id) is cancelled:
                        self.preview_cancellations.pop(task_id, None)
                    self.preview_pending.task_done()

    def _preview_one(self, task_id: int, url: str, client: httpx.Client,
                     cancelled: threading.Event) -> None:
        if cancelled.is_set():
            return
        platform, song_id, _ = resolve_link(url, client)
        if cancelled.is_set():
            return
        song = PROVIDERS[platform].song(song_id, client)
        if cancelled.is_set():
            return
        self.events.info.emit(task_id, song, None)
        levels = fetch_quality_catalog(song_id, client)
        if cancelled.is_set():
            return
        self.events.qualities.emit(task_id, levels)
        self.events.preview_ready.emit(task_id)
        cover = cover_bytes(song, client)
        if cancelled.is_set():
            return
        self.events.info.emit(task_id, song, cover)

    def _loop(self) -> None:
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
                   "Referer": "https://music.163.com/"}
        with httpx.Client(headers=headers, follow_redirects=True, timeout=20) as client:
            while True:
                task_id, url, folder, mp3, quality, cancelled = self.pending.get()
                try:
                    if cancelled.is_set():
                        raise DownloadError("已取消")
                    self.events.state.emit(task_id, "解析链接")
                    platform, song_id, final_url = resolve_link(url, client)
                    cookies = self.account.load()
                    account_id = cookies.get("userId", "guest")
                    key = f"quality-v3:{platform}:{song_id}:{'mp3' if mp3 else 'source'}:{quality}:{account_id}"
                    with self.lock:
                        if key in self.active_keys:
                            raise DownloadError("同一歌曲已在下载队列中")
                        self.active_keys.add(key)
                    try:
                        provider = PROVIDERS[platform]
                        self.events.state.emit(task_id, "获取歌曲信息")
                        song = provider.song(song_id, client)
                        cover = cover_bytes(song, client)
                        self.events.info.emit(task_id, song, cover)
                        old_entry = self.manifest.get(key)
                        old = old_entry.get("path") if isinstance(old_entry, dict) else old_entry
                        if old and Path(old).is_file() and Path(old).parent == folder:
                            try:
                                details = inspect_audio(Path(old))
                                if isinstance(old_entry, dict):
                                    details["source"] = old_entry.get("source", "")
                                    details["actual_level"] = old_entry.get("actual_level", "")
                                self.events.complete.emit(task_id, "已存在", str(old), details)
                                continue
                            except DownloadError:
                                pass
                        if cancelled.is_set():
                            raise DownloadError("已取消")
                        path, details = self._download_source(task_id, song, provider, client, cookies,
                                                              quality, folder, mp3, cancelled, cover)
                        self.manifest[key] = {"path": str(path), "source": details.get("source", ""),
                                              "actual_level": details.get("actual_level", "")}
                        self._save_manifest()
                        self.events.complete.emit(task_id, "已完成", str(path), details)
                    finally:
                        with self.lock:
                            self.active_keys.discard(key)
                except DownloadError as exc:
                    self.events.complete.emit(task_id, "已取消" if cancelled.is_set() else "失败", str(exc), None)
                except (httpx.HTTPError, OSError, ValueError, KeyError) as exc:
                    self.events.complete.emit(task_id, "失败", f"网络或文件错误：{exc}", None)
                finally:
                    self.cancellations.pop(task_id, None)
                    self.pending.task_done()

    def _download_source(self, task_id, song, provider, client, cookies, quality,
                         folder, mp3, cancelled, cover):
        def save(sources):
            self.events.state.emit(task_id, "下载备用音源" if quality == "alternate" else "下载中")
            return download_audio(song, sources, folder, mp3, client, cancelled,
                                  lambda percent: self.events.progress.emit(task_id, percent),
                                  lambda state: self.events.state.emit(task_id, state), cover)

        if cancelled.is_set():
            raise DownloadError("已取消")
        if quality == "alternate":
            self.events.state.emit(task_id, "查询备用音源")
            # Only the original song ID is sent; account cookies stay in the credential store.
            return save(AlternateProvider().sources(song, client))
        self.events.state.emit(task_id, "查询网易云音质")
        try:
            return save(NeteaseMemberProvider().sources(song, client, cookies, quality))
        except DownloadError as exc:
            if cancelled.is_set() or quality != "auto":
                raise
            self.events.state.emit(task_id, "下载公开音源")
            try:
                return save(provider.sources(song, client))
            except DownloadError as public_exc:
                raise DownloadError(f"网易云音质接口：{exc}；公开音源：{public_exc}；可单独选择备用音源重试") from public_exc
