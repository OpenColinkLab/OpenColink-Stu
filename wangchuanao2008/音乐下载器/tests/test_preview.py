import threading
import unittest
from unittest.mock import patch

import httpx

from musicdown.models import DownloadError
from musicdown.worker import DownloadManager, Events


class PreviewTests(unittest.TestCase):
    def test_preview_reads_song_and_tiers_without_starting_download(self):
        requests = []

        def handler(request):
            requests.append(request.url.path)
            if request.url.path == "/api/song/detail/":
                return httpx.Response(200, json={"songs": [{
                    "name": "测试歌", "duration": 120000,
                    "artists": [{"name": "歌手"}], "album": {"name": "专辑"},
                }]})
            if request.url.path == "/api/song/music/detail/get":
                return httpx.Response(200, json={"code": 200, "data": {
                    "l": {"br": 128000}, "m": None, "h": None, "sq": {"br": 900000},
                    "hr": None, "jm": None, "je": None, "sk": None,
                    "db": None, "vi": None,
                }})
            self.fail(f"preview unexpectedly requested {request.url}")

        manager = DownloadManager.__new__(DownloadManager)
        manager.events = Events()
        received = {"info": [], "qualities": [], "ready": []}
        manager.events.info.connect(lambda *args: received["info"].append(args))
        manager.events.qualities.connect(lambda *args: received["qualities"].append(args))
        manager.events.preview_ready.connect(lambda *args: received["ready"].append(args))
        with patch("musicdown.worker.download_audio", side_effect=AssertionError("download started")), \
             httpx.Client(transport=httpx.MockTransport(handler)) as client:
            manager._preview_one(7, "https://music.163.com/song?id=12345", client, threading.Event())
        self.assertEqual(requests, ["/api/song/detail/", "/api/song/music/detail/get"])
        self.assertEqual(received["qualities"], [(7, {"standard", "lossless"})])
        self.assertEqual(received["ready"], [(7,)])
        self.assertEqual(received["info"][0][1].title, "测试歌")

    def test_preview_rejects_invalid_link_before_download(self):
        manager = DownloadManager.__new__(DownloadManager)
        manager.events = Events()
        with httpx.Client(transport=httpx.MockTransport(lambda _: self.fail("unexpected request"))) as client:
            with self.assertRaises(DownloadError):
                manager._preview_one(2, "https://example.com/song?id=1", client, threading.Event())


if __name__ == "__main__":
    unittest.main()
