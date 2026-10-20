import os
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")

from PySide6.QtWidgets import QApplication

from musicdown.models import Song
from musicdown.worker import Events


class FakeSettings:
    def __init__(self, *_):
        self.items = {"folder": os.environ["MUSICDOWN_TEST_FOLDER"]}

    def value(self, key, default=None, _type=None):
        return self.items.get(key, default)

    def setValue(self, key, value):
        self.items[key] = value


class FakeAccount:
    def load(self):
        return {}


class FakeManager:
    def __init__(self):
        self.events = Events()
        self.account = FakeAccount()
        self.previews = []
        self.downloads = []

    def preview(self, *args):
        self.previews.append(args)

    def add(self, *args):
        self.downloads.append(args)


class GuiFlowTests(unittest.TestCase):
    def test_paste_only_previews_until_quality_and_download_click(self):
        app = QApplication.instance() or QApplication([])
        with TemporaryDirectory() as folder, \
             patch.dict(os.environ, {"MUSICDOWN_TEST_FOLDER": folder}), \
             patch("musicdown.gui.DownloadManager", FakeManager), \
             patch("musicdown.gui.QSettings", FakeSettings):
            from musicdown.gui import MainWindow
            window = MainWindow()
            window.input.setPlainText("https://music.163.com/song?id=12345")
            window._parse_input()
            self.assertEqual(len(window.manager.previews), 1)
            self.assertFalse(window.manager.downloads)

            song = Song("netease", "12345", "测试歌", "歌手", "专辑", "", 120)
            window._on_info(1, song, None)
            window._on_qualities(1, {"standard", "lossless"})
            window._on_preview_ready(1)
            self.assertFalse(window.download_button.isEnabled())
            window.table.setCurrentCell(0, window.COL_TITLE)
            self.assertTrue(window.quality.model().item(window.quality.findData("lossless")).isEnabled())
            self.assertFalse(window.quality.model().item(window.quality.findData("hires")).isEnabled())

            window.quality.setCurrentIndex(window.quality.findData("lossless"))
            self.assertTrue(window.download_button.isEnabled())
            self.assertFalse(window.manager.downloads)
            window._download_selected()
            self.assertEqual(len(window.manager.downloads), 1)
            self.assertEqual(window.manager.downloads[0][-1], "lossless")
            self.assertEqual(Path(window.manager.downloads[0][2]), Path(folder))
            window._on_complete(1, "已完成", str(Path(folder) / "test.m4a"),
                                {"codec": "AVS3 Audio Vivid (av3a)", "bitrate_kbps": 832,
                                 "sample_rate_hz": 44100, "bit_depth": 0, "channels": 12,
                                 "lossless": False, "decodable": False, "source": "网易云账号音源"})
            self.assertEqual(window.table.item(0, window.COL_STATUS).text(), "已保存（未验证解码）")
            self.assertIn("未验证解码", window.table.item(0, window.COL_ACTUAL).text())
            window.close()
        del app

    def test_alternate_can_be_selected_when_official_catalog_is_empty(self):
        app = QApplication.instance() or QApplication([])
        with TemporaryDirectory() as folder, \
             patch.dict(os.environ, {"MUSICDOWN_TEST_FOLDER": folder}), \
             patch("musicdown.gui.DownloadManager", FakeManager), \
             patch("musicdown.gui.QSettings", FakeSettings):
            from musicdown.gui import MainWindow
            window = MainWindow()
            window._add_task("https://music.163.com/song?id=12345")
            window._on_qualities(1, set())
            window._on_preview_ready(1)
            window.table.setCurrentCell(0, window.COL_TITLE)
            self.assertFalse(window.quality.model().item(window.quality.findData("auto")).isEnabled())
            index = window.quality.findData("alternate")
            self.assertTrue(window.quality.model().item(index).isEnabled())
            window.quality.setCurrentIndex(index)
            self.assertFalse(window.manager.downloads)
            window.download_button.click()
            self.assertEqual(window.manager.downloads[0][-1], "alternate")
            window._on_complete(1, "失败", "备用来源暂不可用", None)
            self.assertEqual(window.tasks[1]["phase"], "ready")
            window._retry()
            self.assertEqual(len(window.manager.downloads), 2)
            window.close()
        del app


if __name__ == "__main__":
    unittest.main()
