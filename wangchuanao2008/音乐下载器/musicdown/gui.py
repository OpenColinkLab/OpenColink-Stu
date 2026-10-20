import sys
import threading
from pathlib import Path

import httpx
from PySide6.QtCore import QObject, QSettings, Qt, QTimer, QUrl, Signal
from PySide6.QtGui import QPixmap
from PySide6.QtWebEngineCore import QWebEnginePage, QWebEngineProfile
from PySide6.QtWebEngineWidgets import QWebEngineView
from PySide6.QtWidgets import (QApplication, QCheckBox, QComboBox, QDialog, QFileDialog, QHBoxLayout, QLabel,
                               QMainWindow, QPlainTextEdit, QProgressBar,
                               QPushButton, QTableWidget, QTableWidgetItem, QVBoxLayout, QWidget)

from .auth import account_profile, HEADERS
from .models import DownloadError
from .links import extract_urls
from .quality_catalog import QUALITY_MEMBERSHIP, QUALITY_NAMES, QUALITY_ORDER
from .worker import DownloadManager
from .version import VERSION


class LoginCheckEvents(QObject):
    success = Signal(object)
    failure = Signal(str)


class AccountCheckEvents(QObject):
    loaded = Signal(int, object)
    cleared = Signal(int)
    failure = Signal(int, str)


class LoginDialog(QDialog):
    def __init__(self, store, parent=None):
        super().__init__(parent)
        self.setWindowTitle("网易云官网登录")
        self.resize(1050, 790)
        self.store = store
        self.cookies = {}
        self.verifying = False
        self.cancelled = threading.Event()
        self.logged_profile = None
        self.events = LoginCheckEvents()
        self.events.success.connect(self._success)
        self.events.failure.connect(self._failure)
        layout = QVBoxLayout(self)
        self.state = QLabel("以下为网易云官网 music.163.com。请直接扫码并完成官方安全验证。")
        self.state.setWordWrap(True)
        layout.addWidget(self.state)
        self.profile = QWebEngineProfile(self)
        self.profile.cookieStore().cookieAdded.connect(self._on_cookie)
        self.view = QWebEngineView(self)
        self.view.setPage(QWebEnginePage(self.profile, self.view))
        self.view.loadFinished.connect(self._on_load)
        self.view.setUrl(QUrl("https://music.163.com/#/login"))
        layout.addWidget(self.view, 1)
        row = QHBoxLayout(); layout.addLayout(row)
        self.verify_button = QPushButton("完成登录后验证")
        self.verify_button.clicked.connect(self._verify)
        row.addWidget(self.verify_button)
        row.addStretch(1)
        close = QPushButton("关闭"); close.clicked.connect(self.reject); row.addWidget(close)

    def _on_load(self, ok: bool):
        if not ok:
            self.state.setText("网易云官网加载失败，请检查网络后重新打开登录窗口")

    def _on_cookie(self, cookie):
        if not cookie.domain().lstrip(".").endswith("music.163.com"):
            return
        name = bytes(cookie.name()).decode(errors="replace")
        value = bytes(cookie.value()).decode(errors="replace")
        if name and value:
            self.cookies[name] = value
        if name == "MUSIC_U":
            self.state.setText("已收到网易云登录会话，正在验证账号…")
            QTimer.singleShot(900, self._verify)

    def _verify(self):
        if self.verifying or self.cancelled.is_set():
            return
        if not self.cookies.get("MUSIC_U"):
            self.state.setText("尚未取得网易云登录会话；请先在网页中完成登录和安全验证")
            return
        self.verifying = True
        cookies = dict(self.cookies)

        def check():
            try:
                with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=15) as client:
                    profile = account_profile(client, cookies)
                if self.cancelled.is_set():
                    return
                self.store.save(cookies, profile)
                self.events.success.emit(profile)
            except (DownloadError, httpx.HTTPError, OSError, ValueError) as exc:
                self.events.failure.emit(str(exc))

        threading.Thread(target=check, daemon=True, name="netease-web-login-check").start()

    def _success(self, profile: dict):
        self.logged_profile = profile
        self.state.setText(f"已登录：{profile.get('nickname', '')}")
        self.accept()

    def _failure(self, message: str):
        self.verifying = False
        self.state.setText(f"网页登录尚未通过账号校验：{message}。请继续在网页内完成验证，再点“完成登录后验证”。")

    def done(self, result):
        self.cancelled.set()
        self.view.setUrl(QUrl("about:blank"))
        super().done(result)


class MainWindow(QMainWindow):
    COL_COVER = 0
    COL_TITLE = 1
    COL_ARTIST = 2
    COL_PLATFORM = 3
    COL_AVAILABLE = 4
    COL_ACTUAL = 5
    COL_PROGRESS = 6
    COL_STATUS = 7

    def __init__(self):
        super().__init__()
        self.setWindowTitle(f"网易云音乐下载器 {VERSION}")
        self.resize(1380, 720)
        self.settings = QSettings("MusicDown", "MusicDown")
        self.manager = DownloadManager()
        self.account_events = AccountCheckEvents()
        self.account_events.loaded.connect(self._on_account_loaded)
        self.account_events.cleared.connect(self._on_account_cleared)
        self.account_events.failure.connect(self._on_account_failure)
        self.account_generation = 0
        self.next_id = 1
        self.tasks = {}
        self.rows = {}
        self._setup()
        self.manager.events.info.connect(self._on_info)
        self.manager.events.qualities.connect(self._on_qualities)
        self.manager.events.preview_ready.connect(self._on_preview_ready)
        self.manager.events.preview_failed.connect(self._on_preview_failed)
        self.manager.events.progress.connect(self._on_progress)
        self.manager.events.state.connect(self._on_state)
        self.manager.events.complete.connect(self._on_complete)
        self._update_account_label()
        QTimer.singleShot(0, self._choose_first_directory)

    def _setup(self):
        root = QWidget(); self.setCentralWidget(root)
        layout = QVBoxLayout(root); layout.setContentsMargins(22, 20, 22, 18); layout.setSpacing(12)
        title = QLabel(f"网易云音乐下载器 {VERSION}"); title.setObjectName("title"); layout.addWidget(title)
        subtitle = QLabel("粘贴单曲链接后先解析音质；选择档位并点击下载。支持分享文字与一次粘贴多条链接。")
        subtitle.setObjectName("subtitle"); layout.addWidget(subtitle)
        folder_row = QHBoxLayout(); layout.addLayout(folder_row)
        folder_row.addWidget(QLabel("保存到"))
        self.folder_label = QLabel(self.settings.value("folder", "首次使用请选择目录")); self.folder_label.setObjectName("folder")
        folder_row.addWidget(self.folder_label, 1)
        choose = QPushButton("选择目录"); choose.clicked.connect(self._choose_directory); folder_row.addWidget(choose)
        account_row = QHBoxLayout(); layout.addLayout(account_row)
        account_row.addWidget(QLabel("网易云账号"))
        self.account_label = QLabel(); account_row.addWidget(self.account_label, 1)
        self.account_label.setText("正在检查登录状态…")
        login = QPushButton("官网登录"); login.clicked.connect(self._login); account_row.addWidget(login)
        logout = QPushButton("退出登录"); logout.clicked.connect(self._logout); account_row.addWidget(logout)
        self.input = QPlainTextEdit(); self.input.setPlaceholderText("把分享链接或整段分享文字粘贴到这里，自动解析歌曲和可选音质…")
        self.input.setFixedHeight(95); layout.addWidget(self.input)
        self.paste_timer = QTimer(self); self.paste_timer.setSingleShot(True)
        self.paste_timer.timeout.connect(self._parse_input)
        self.input.textChanged.connect(lambda: self.paste_timer.start(650))
        options = QHBoxLayout(); layout.addLayout(options)
        self.mp3 = QCheckBox("转换为 MP3（需要 ffmpeg）")
        self.mp3.setToolTip("转换后文件将是有损 MP3，不再保留母带、无损或空间音频格式。")
        self.mp3.setChecked(self.settings.value("mp3", False, bool)); self.mp3.toggled.connect(lambda v: self.settings.setValue("mp3", v))
        options.addWidget(self.mp3)
        options.addStretch(1)
        self.notice = QLabel("粘贴后只解析歌曲，不会开始下载")
        options.addWidget(self.notice)
        self.table = QTableWidget(0, 8); self.table.setHorizontalHeaderLabels(["封面", "歌曲", "歌手", "平台", "该曲目录音质", "实际音质", "进度", "状态"])
        self.table.verticalHeader().setVisible(False); self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers); self.table.setAlternatingRowColors(True)
        self.table.setColumnWidth(0, 58); self.table.setColumnWidth(1, 200); self.table.setColumnWidth(2, 140)
        self.table.setColumnWidth(3, 75); self.table.setColumnWidth(4, 260)
        self.table.setColumnWidth(5, 190); self.table.setColumnWidth(6, 105)
        self.table.setColumnWidth(7, 285)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.cellDoubleClicked.connect(lambda *_: self._reveal())
        self.table.currentCellChanged.connect(lambda *_: self._refresh_quality_choices())
        layout.addWidget(self.table, 1)
        download_row = QHBoxLayout(); layout.addLayout(download_row)
        download_row.addWidget(QLabel("所选歌曲音质"))
        self.quality = QComboBox()
        self.quality.addItem("请选择音质", None)
        self.quality.addItem("自动最高可用（普通/母带）", "auto")
        self.quality.addItem("备用音源（GD Studio · 实际音质以文件为准）", "alternate")
        for level in ("jymaster", "hires", "lossless", "exhigh", "higher", "standard",
                      "jyeffect", "sky", "dolby", "vivid"):
            self.quality.addItem(f"{QUALITY_NAMES[level]} · 通常{QUALITY_MEMBERSHIP[level]}", level)
        self.quality.setEnabled(False)
        self.quality.setMinimumWidth(310)
        self.quality.setToolTip("该曲目录未列出的档位不可选。实际能否下载及文件格式仍须下载后验证。*免费档位只指音质功能，会员歌曲仍需歌曲权益。")
        self.quality.currentIndexChanged.connect(self._on_quality_changed)
        download_row.addWidget(self.quality)
        self.download_button = QPushButton("下载所选歌曲")
        self.download_button.setEnabled(False)
        self.download_button.clicked.connect(self._download_selected)
        download_row.addWidget(self.download_button)
        self.download_all_button = QPushButton("下载全部已选音质")
        self.download_all_button.setEnabled(False)
        self.download_all_button.clicked.connect(self._download_all_selected)
        download_row.addWidget(self.download_all_button)
        download_row.addStretch(1)
        actions = QHBoxLayout(); layout.addLayout(actions)
        for caption, handler in (("取消所选", self._cancel), ("重试所选", self._retry), ("在资源管理器中显示" if sys.platform == "win32" else "在 Finder 中显示", self._reveal)):
            button = QPushButton(caption); button.clicked.connect(handler); actions.addWidget(button)
        actions.addStretch(1)
        hint = QLabel("目录音质是网易云列出的档位，不保证当前账号有下载权限；选定具体档位后只接受完整且符合该档位的音频；备用音源单独选择，实际音质以文件检测为准。*免费档位也可能遇到会员歌曲。")
        hint.setWordWrap(True)
        hint.setObjectName("hint"); layout.addWidget(hint)
        self.setStyleSheet("""
            QWidget { font-size: 13px; } #title { font-size: 26px; font-weight: 700; }
            #subtitle, #hint { color: #6c7180; } #folder { color: #366da6; }
            QPlainTextEdit { border: 1px solid #cfd5de; border-radius: 8px; padding: 10px; }
            QPushButton { padding: 7px 12px; border-radius: 6px; background: #e9edf3; }
            QPushButton:hover { background: #dce6f2; }
            QTableWidget { border: 1px solid #d7dce4; border-radius: 6px; }
        """)

    def _choose_first_directory(self):
        folder = self.settings.value("folder", "")
        if not folder or not Path(folder).is_dir():
            self._choose_directory()

    def _choose_directory(self):
        folder = QFileDialog.getExistingDirectory(self, "选择音乐保存目录", self.settings.value("folder", str(Path.home() / "Music")))
        if folder:
            self.settings.setValue("folder", folder); self.folder_label.setText(folder)

    def _update_account_label(self):
        self.account_generation += 1
        generation = self.account_generation

        def check():
            try:
                self.account_events.loaded.emit(generation, self.manager.account.load())
            except Exception as exc:
                self.account_events.failure.emit(generation, str(exc))

        threading.Thread(target=check, daemon=True, name="netease-account-check").start()

    def _on_account_loaded(self, generation: int, account: dict):
        if generation == self.account_generation:
            self.account_label.setText(f"已登录：{account.get('nickname') or account.get('userId')}" if account else "未登录")

    def _on_account_cleared(self, generation: int):
        if generation == self.account_generation:
            self.account_label.setText("未登录")
            self.notice.setText("已退出网易云账号")

    def _on_account_failure(self, generation: int, message: str):
        if generation == self.account_generation:
            self.account_label.setText("登录状态读取失败")
            self.notice.setText(message)

    def _login(self):
        dialog = LoginDialog(self.manager.account, self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            self.account_generation += 1
            profile = dialog.logged_profile or {}
            self.account_label.setText(f"已登录：{profile.get('nickname') or profile.get('userId')}")
            self.notice.setText("网易云账号已登录；请选择歌曲音质并点击下载")

    def _logout(self):
        self.account_generation += 1
        generation = self.account_generation
        self.account_label.setText("正在退出登录…")

        def clear():
            try:
                self.manager.account.clear()
                self.account_events.cleared.emit(generation)
            except Exception as exc:
                self.account_events.failure.emit(generation, str(exc))

        threading.Thread(target=clear, daemon=True, name="netease-account-logout").start()

    def _parse_input(self):
        text = self.input.toPlainText().strip()
        if not text:
            return
        urls = extract_urls(text)
        if not urls:
            self.notice.setText("没有找到 http(s) 歌曲链接")
            return
        self.input.blockSignals(True); self.input.clear(); self.input.blockSignals(False)
        for url in urls:
            self._add_task(url)
        self.notice.setText(f"正在解析 {len(urls)} 条链接；解析完成后请选择音质")

    def _add_task(self, url: str):
        task_id = self.next_id; self.next_id += 1
        row = self.table.rowCount(); self.table.insertRow(row); self.table.setRowHeight(row, 58)
        self.rows[task_id] = row
        self.tasks[task_id] = {"url": url, "quality": None, "qualities": None,
                               "status": "解析中", "phase": "preview", "path": ""}
        for col, value in ((self.COL_TITLE, url), (self.COL_ARTIST, "—"),
                           (self.COL_PLATFORM, "—"), (self.COL_AVAILABLE, "查询中"),
                           (self.COL_ACTUAL, "—"), (self.COL_STATUS, "解析中")):
            self.table.setItem(row, col, QTableWidgetItem(value))
        cover = QLabel("♪"); cover.setAlignment(Qt.AlignmentFlag.AlignCenter); self.table.setCellWidget(row, self.COL_COVER, cover)
        progress = QProgressBar(); progress.setRange(0, 100); progress.setValue(0)
        self.table.setCellWidget(row, self.COL_PROGRESS, progress)
        self.manager.preview(task_id, url)

    def _on_info(self, task_id, song, cover):
        row = self.rows[task_id]
        self.table.item(row, self.COL_TITLE).setText(song.title)
        self.table.item(row, self.COL_TITLE).setToolTip(f"{song.album}\n{self.tasks[task_id]['url']}")
        self.table.item(row, self.COL_ARTIST).setText(song.artist)
        self.table.item(row, self.COL_PLATFORM).setText("网易云")
        if cover:
            pixmap = QPixmap(); pixmap.loadFromData(cover)
            label = self.table.cellWidget(row, self.COL_COVER)
            label.setPixmap(pixmap.scaled(48, 48, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation))

    def _on_qualities(self, task_id, levels):
        row = self.rows[task_id]
        self.tasks[task_id]["qualities"] = levels
        item = self.table.item(row, self.COL_AVAILABLE)
        if levels is None:
            item.setText("目录查询失败")
            item.setToolTip("无法读取网易云该曲的音质目录；请重试解析")
            return
        names = [QUALITY_NAMES[level] for level in QUALITY_ORDER if level in levels]
        item.setText("、".join(names) if names else "目录未列出音质")
        item.setToolTip("网易云目录列出（账号权限和导出能力待实际验证）：\n" +
                        "\n".join(f"{QUALITY_NAMES[level]} · 通常{QUALITY_MEMBERSHIP[level]}" for level in QUALITY_ORDER if level in levels))
        if self._selected_id() == task_id:
            self._refresh_quality_choices()

    def _on_preview_ready(self, task_id):
        task = self.tasks[task_id]
        if task["phase"] != "preview":
            return
        task["phase"] = "ready"
        task["status"] = "等待选择音质"
        self.table.item(self.rows[task_id], self.COL_STATUS).setText("等待选择音质")
        self._refresh_quality_choices()
        self.notice.setText("歌曲已解析；点击歌曲行、选择音质后点击下载")

    def _on_preview_failed(self, task_id, reason):
        task = self.tasks[task_id]
        if task["phase"] != "preview":
            return
        task["phase"] = "preview_error"
        task["status"] = "解析失败"
        item = self.table.item(self.rows[task_id], self.COL_STATUS)
        item.setText(f"解析失败：{reason}")
        item.setToolTip(reason)
        available = self.table.item(self.rows[task_id], self.COL_AVAILABLE)
        if available.text() == "查询中":
            available.setText("无法取得目录")
        self.notice.setText(f"解析失败：{reason}")
        self._refresh_quality_choices()

    def _refresh_quality_choices(self):
        task_id = self._selected_id()
        task = self.tasks.get(task_id) if task_id is not None else None
        self.quality.blockSignals(True)
        can_choose = bool(task and task["phase"] == "ready" and task.get("qualities") is not None)
        for index in range(1, self.quality.count()):
            level = self.quality.itemData(index)
            enabled = bool(can_choose and (level == "alternate" or (level == "auto" and bool(task["qualities"])) or level in task["qualities"]))
            self.quality.model().item(index).setEnabled(enabled)
        saved = self.quality.findData(task["quality"] if can_choose else None)
        self.quality.setCurrentIndex(max(0, saved))
        self.quality.setEnabled(can_choose)
        self.quality.blockSignals(False)
        self._refresh_download_buttons()

    def _on_quality_changed(self, _index):
        task_id = self._selected_id()
        if task_id is None or self.tasks[task_id]["phase"] != "ready":
            return
        task = self.tasks[task_id]
        task["quality"] = self.quality.currentData()
        if task["status"] in ("等待选择音质", "待下载"):
            task["status"] = "待下载" if task["quality"] else "等待选择音质"
            self.table.item(self.rows[task_id], self.COL_STATUS).setText(task["status"])
        self._refresh_download_buttons()

    def _refresh_download_buttons(self):
        task_id = self._selected_id()
        task = self.tasks.get(task_id) if task_id is not None else None
        self.download_button.setEnabled(bool(task and task["phase"] == "ready" and task["quality"]))
        self.download_all_button.setEnabled(any(t["phase"] == "ready" and t["quality"] for t in self.tasks.values()))

    def _start_download(self, task_id: int) -> bool:
        task = self.tasks[task_id]
        if task["phase"] != "ready" or not task["quality"]:
            return False
        if task["quality"] == "vivid" and self.mp3.isChecked():
            self.notice.setText("臻音全景声暂不能解码转换为 MP3；请关闭 MP3 转换以保存原始 AV3A 文件")
            return False
        folder = self.settings.value("folder", "")
        if not folder or not Path(folder).is_dir():
            self.notice.setText("请先选择有效的保存目录")
            return False
        task.update({"phase": "download", "status": "排队下载", "folder": folder,
                     "mp3": self.mp3.isChecked()})
        self.table.item(self.rows[task_id], self.COL_STATUS).setText("排队下载")
        self.manager.add(task_id, task["url"], folder, task["mp3"], task["quality"])
        self._refresh_quality_choices()
        return True

    def _download_selected(self):
        task_id = self._selected_id()
        if task_id is not None and self._start_download(task_id):
            self.notice.setText("已加入下载队列")

    def _download_all_selected(self):
        count = sum(self._start_download(task_id) for task_id in list(self.tasks))
        if count:
            self.notice.setText(f"已将 {count} 首歌曲加入下载队列")

    def _on_progress(self, task_id, percent):
        bar = self.table.cellWidget(self.rows[task_id], self.COL_PROGRESS)
        if percent < 0:
            bar.setRange(0, 0)
        else:
            bar.setRange(0, 100); bar.setValue(min(100, percent))

    def _on_state(self, task_id, state):
        self.tasks[task_id]["status"] = state
        self.table.item(self.rows[task_id], self.COL_STATUS).setText(state)

    def _on_complete(self, task_id, state, detail, audio):
        task = self.tasks[task_id]
        task["status"] = state
        task["phase"] = "done" if state in ("已完成", "已存在") else "ready" if task.get("qualities") is not None else "preview_error"
        row = self.rows[task_id]
        item = self.table.item(row, self.COL_STATUS)
        source = audio.get("source", "") if audio else ""
        if state in ("已完成", "已存在"):
            item.setText(("已保存（未验证解码）" if audio and audio.get("decodable") is False else state) +
                         ("（备用来源）" if "GD Studio" in source else ""))
        else:
            item.setText(f"{state}：{detail}")
        item.setToolTip(detail)
        if audio:
            self.tasks[task_id]["path"] = detail
            bitrate = f"{audio['bitrate_kbps']} kbps" if audio["bitrate_kbps"] else "未知码率"
            rate = audio.get("sample_rate_hz") or 0
            depth = audio.get("bit_depth") or 0
            channels = audio.get("channels") or 0
            format_detail = (f" · {rate / 1000:g} kHz" if rate else "") + (f"/{depth} bit" if depth else "")
            format_detail += f" · {channels} 声道" if channels else ""
            quality = f"{audio['codec']} · {bitrate}" + (" · 无损" if audio["lossless"] else "") + format_detail
            if audio.get("decodable") is False:
                quality += " · 未验证解码"
            self.table.item(row, self.COL_ACTUAL).setText(quality)
            self.table.item(row, self.COL_ACTUAL).setToolTip(
                f"实际音频：{quality}\n来源与接口档位：{source or '原平台公开音源'}" +
                ("\n文件已核对容器、时长和全部音频包；当前 FFmpeg 无法验证播放。" if audio.get("decodable") is False else ""))
            item.setToolTip(f"{detail}\n来源：{source or '原平台公开音源'}")
            self.table.cellWidget(row, self.COL_PROGRESS).setRange(0, 100); self.table.cellWidget(row, self.COL_PROGRESS).setValue(100)
        else:
            self.table.cellWidget(row, self.COL_PROGRESS).setRange(0, 100)
            self.table.cellWidget(row, self.COL_PROGRESS).setValue(0)
        self._refresh_quality_choices()

    def _selected_id(self):
        row = self.table.currentRow()
        return next((task_id for task_id, value in self.rows.items() if value == row), None)

    def _cancel(self):
        task_id = self._selected_id()
        if task_id is None:
            return
        task = self.tasks[task_id]
        if task["phase"] == "preview":
            self.manager.cancel_preview(task_id)
            task["phase"] = "preview_error"
            task["status"] = "已取消"
            self.table.item(self.rows[task_id], self.COL_STATUS).setText("已取消")
            self._refresh_quality_choices()
        elif task["phase"] == "download":
            self.manager.cancel(task_id)
            self._on_state(task_id, "取消中")

    def _retry(self):
        task_id = self._selected_id()
        if task_id is None:
            return
        task = self.tasks[task_id]
        if task["phase"] == "preview_error":
            task["phase"] = "preview"
            task["status"] = "解析中"
            task["qualities"] = None
            task["quality"] = None
            self.table.item(self.rows[task_id], self.COL_STATUS).setText("解析中")
            self.table.item(self.rows[task_id], self.COL_AVAILABLE).setText("查询中")
            self.manager.preview(task_id, task["url"])
            self._refresh_quality_choices()
        elif task["phase"] == "ready" and task["status"] in ("失败", "已取消"):
            self._start_download(task_id)

    def _reveal(self):
        task_id = self._selected_id()
        if task_id and self.tasks[task_id]["path"]:
            import subprocess
            path = str(Path(self.tasks[task_id]["path"]).resolve())
            if sys.platform == "win32":
                subprocess.Popen(["explorer.exe", "/select,", path])
            else:
                subprocess.Popen(["open", "-R", path])


def main():
    app = QApplication(sys.argv)
    app.setOrganizationName("MusicDown"); app.setApplicationName("MusicDown")
    window = MainWindow(); window.show()
    sys.exit(app.exec())
