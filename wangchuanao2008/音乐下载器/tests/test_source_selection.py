import threading
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from musicdown.models import DownloadError, Song
from musicdown.worker import DownloadManager, Events


class SourceSelectionTests(unittest.TestCase):
    def setUp(self):
        self.manager = DownloadManager.__new__(DownloadManager)
        self.manager.events = Events()
        self.song = Song("netease", "123", "测试歌", "歌手", "专辑", "", 120)
        self.provider = Mock()
        self.cancelled = threading.Event()

    def run_source(self, quality):
        return self.manager._download_source(1, self.song, self.provider, Mock(),
                                             {"MUSIC_U": "private-session"}, quality,
                                             Path("/tmp"), False, self.cancelled, None)

    def test_alternate_is_direct_and_receives_no_account_credentials(self):
        with patch("musicdown.worker.AlternateProvider") as alternate, \
             patch("musicdown.worker.NeteaseMemberProvider") as official, \
             patch("musicdown.worker.download_audio", return_value=(Path("/tmp/test.flac"), {})) as save:
            self.run_source("alternate")
            official.assert_not_called()
            self.provider.sources.assert_not_called()
            alternate.return_value.sources.assert_called_once()
            self.assertEqual(len(alternate.return_value.sources.call_args.args), 2)
            self.assertIs(save.call_args.args[1], alternate.return_value.sources.return_value)

    def test_auto_failure_does_not_silently_use_alternate(self):
        self.provider.sources.side_effect = DownloadError("公开音源失败")
        with patch("musicdown.worker.NeteaseMemberProvider") as official, \
             patch("musicdown.worker.AlternateProvider") as alternate:
            official.return_value.sources.side_effect = DownloadError("原音源失败")
            with self.assertRaisesRegex(DownloadError, "可单独选择备用音源"):
                self.run_source("auto")
            alternate.assert_not_called()

    def test_selected_tier_failure_does_not_fall_back(self):
        with patch("musicdown.worker.NeteaseMemberProvider") as official, \
             patch("musicdown.worker.AlternateProvider") as alternate:
            official.return_value.sources.side_effect = DownloadError("实际降级")
            with self.assertRaisesRegex(DownloadError, "实际降级"):
                self.run_source("hires")
            self.provider.sources.assert_not_called()
            alternate.assert_not_called()

    def test_cancelled_alternate_does_not_request_any_source(self):
        self.cancelled.set()
        with patch("musicdown.worker.AlternateProvider") as alternate:
            with self.assertRaisesRegex(DownloadError, "已取消"):
                self.run_source("alternate")
            alternate.assert_not_called()
