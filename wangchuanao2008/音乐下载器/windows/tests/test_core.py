import threading
import shutil
import subprocess
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory

import httpx

from musicdown.audio import download_audio
from musicdown.links import extract_urls, resolve_link
from musicdown.models import AudioSource, DownloadError, Song


class LocalHandler(BaseHTTPRequestHandler):
    source = None
    full_source = None

    def do_GET(self):
        if self.path == "/error":
            self.send_response(503); self.end_headers(); return
        data = (self.full_source if self.path == "/full" else self.source).read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers(); self.wfile.write(data)

    def log_message(self, *args):
        pass


class CoreTests(unittest.TestCase):
    def test_share_text_and_invalid_link(self):
        text = "分享 https://music.163.com/#/song?id=33894312 和 https://music.163.com/song?id=210049。"
        urls = extract_urls(text)
        self.assertEqual(len(urls), 2)
        with httpx.Client() as client:
            for url in ("https://example.com/song?id=1", "https://music.163.com/playlist?id=1",
                        "https://y.qq.com/n/ryqq/songDetail/003mAan70zUy5O"):
                with self.assertRaises(DownloadError):
                    resolve_link(url, client)

    def test_network_failure_and_preview_are_not_success(self):
        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg:
            self.skipTest("需要 ffmpeg 生成独立测试音频")
        with TemporaryDirectory() as assets, TemporaryDirectory() as folder:
            LocalHandler.source = Path(assets) / "tone.mp3"
            subprocess.run([ffmpeg, "-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=2",
                            "-c:a", "libmp3lame", str(LocalHandler.source)], check=True)
            LocalHandler.full_source = Path(assets) / "full.mp3"
            subprocess.run([ffmpeg, "-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=10",
                            "-c:a", "libmp3lame", str(LocalHandler.full_source)], check=True)
            server = ThreadingHTTPServer(("127.0.0.1", 0), LocalHandler)
            thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
            base = f"http://127.0.0.1:{server.server_port}"
            try:
                with httpx.Client() as client:
                    song = Song("netease", "test", "测试", "测试", "", "", 2)
                    with self.assertRaisesRegex(DownloadError, "503"):
                        download_audio(song, [AudioSource(base + "/error", "测试")], Path(folder), False,
                                       client, threading.Event(), lambda x: None, lambda x: None, None)
                    long_song = Song("netease", "test", "测试", "测试", "", "", 10)
                    with self.assertRaisesRegex(DownloadError, "试听片段"):
                        download_audio(long_song, [AudioSource(base + "/audio", "测试")], Path(folder), False,
                                       client, threading.Event(), lambda x: None, lambda x: None, None)
                    self.assertFalse(list(Path(folder).iterdir()))
                    path, details = download_audio(long_song,
                                                   [AudioSource(base + "/audio", "试听"), AudioSource(base + "/full", "完整")],
                                                   Path(folder), False, client, threading.Event(), lambda x: None,
                                                   lambda x: None, None)
                    self.assertTrue(path.exists())
                    self.assertGreater(details["duration_seconds"], 9)
            finally:
                server.shutdown(); server.server_close()


if __name__ == "__main__":
    unittest.main()
