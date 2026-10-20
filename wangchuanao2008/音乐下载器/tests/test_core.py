import threading
import shutil
import subprocess
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory

import httpx

from musicdown.audio import download_audio, inspect_audio
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
    def test_audio_vivid_container_is_saved_but_truncation_and_mp3_conversion_are_rejected(self):
        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg or not shutil.which("ffprobe"):
            self.skipTest("需要 ffmpeg 和 ffprobe 检查 MP4 音频包")
        with TemporaryDirectory() as assets, TemporaryDirectory() as folder:
            sample = Path(assets) / "audio-vivid.m4a"
            subprocess.run([ffmpeg, "-v", "error", "-f", "lavfi", "-i", "sine=duration=2",
                            "-c:a", "aac", "-movflags", "+faststart", str(sample)], check=True)
            data = sample.read_bytes()
            self.assertEqual(data.count(b"mp4a"), 1)
            # A container fixture: relabel its MP4 sample entry to test the
            # unknown-codec path. Real AV3A was separately tested end to end.
            sample.write_bytes(data.replace(b"mp4a", b"av3a", 1))
            details = inspect_audio(sample)
            self.assertEqual(details["codec"], "AVS3 Audio Vivid (av3a)")
            self.assertFalse(details["decodable"])
            self.assertAlmostEqual(details["duration_seconds"], 2.0)

            truncated = Path(assets) / "truncated.m4a"
            truncated.write_bytes(sample.read_bytes()[:sample.stat().st_size // 2])
            with self.assertRaisesRegex(DownloadError, "音频包"):
                inspect_audio(truncated)

            LocalHandler.full_source = sample
            server = ThreadingHTTPServer(("127.0.0.1", 0), LocalHandler)
            thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
            try:
                with httpx.Client() as client:
                    song = Song("netease", "test", "臻音测试", "测试", "", "", 2)
                    source = AudioSource(f"http://127.0.0.1:{server.server_port}/full", "臻音全景声",
                                         requested_level="vivid", actual_level="vivid")
                    with self.assertRaisesRegex(DownloadError, "不能转换为 MP3"):
                        download_audio(song, [source], Path(folder), True, client, threading.Event(),
                                       lambda x: None, lambda x: None, None)
                    self.assertFalse(list(Path(folder).iterdir()))
            finally:
                server.shutdown(); server.server_close()

    def test_spatial_codec_reports_real_format(self):
        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg:
            self.skipTest("需要 ffmpeg 生成 E-AC-3 测试音频")
        with TemporaryDirectory() as folder:
            path = Path(folder) / "dolby.m4a"
            subprocess.run([ffmpeg, "-v", "error", "-f", "lavfi", "-i", "sine=duration=2",
                            "-c:a", "eac3", "-b:a", "192k", "-f", "mp4", str(path)], check=True)
            details = inspect_audio(path)
            self.assertEqual(details["codec"], "E-AC-3")
            self.assertEqual(details["extension"], "m4a")
            self.assertFalse(details["lossless"])
            self.assertGreater(details["bitrate_kbps"], 180)
            self.assertEqual(details["bit_depth"], 0)

    def test_flac_with_embedded_cover_is_audio(self):
        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg:
            self.skipTest("需要 ffmpeg 生成带封面的 FLAC 测试音频")
        with TemporaryDirectory() as folder:
            path = Path(folder) / "cover.flac"
            subprocess.run([ffmpeg, "-v", "error", "-f", "lavfi", "-i", "sine=duration=2",
                            "-f", "lavfi", "-i", "color=c=red:s=120x120:d=1", "-map", "0:a",
                            "-map", "1:v", "-c:a", "flac", "-c:v", "png", "-disposition:v",
                            "attached_pic", "-f", "flac", str(path)], check=True)
            details = inspect_audio(path)
            self.assertEqual(details["codec"], "FLAC")
            self.assertTrue(details["lossless"])

            video = Path(folder) / "video.mp4"
            subprocess.run([ffmpeg, "-v", "error", "-f", "lavfi", "-i", "sine=duration=2",
                            "-f", "lavfi", "-i", "color=c=red:s=120x120:d=2", "-map", "0:a",
                            "-map", "1:v", "-c:a", "aac", "-c:v", "mpeg4", "-f", "mp4",
                            str(video)], check=True)
            with self.assertRaisesRegex(DownloadError, "不是纯音频"):
                inspect_audio(video)

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
                    song = Song("netease", "test", "测试", "测试", "", "", 2, "需要会员或购买")
                    with self.assertRaisesRegex(DownloadError, "503") as failure:
                        download_audio(song, [AudioSource(base + "/error", "测试")], Path(folder), False,
                                       client, threading.Event(), lambda x: None, lambda x: None, None)
                    self.assertNotIn("需要会员或购买", str(failure.exception))
                    long_song = Song("netease", "test", "测试", "测试", "", "", 10)
                    with self.assertRaisesRegex(DownloadError, "试听片段"):
                        download_audio(long_song, [AudioSource(base + "/audio", "测试")], Path(folder), False,
                                       client, threading.Event(), lambda x: None, lambda x: None, None)
                    self.assertFalse(list(Path(folder).iterdir()))
                    with self.assertRaisesRegex(DownloadError, "不是无损格式"):
                        download_audio(long_song, [AudioSource(base + "/full", "无损请求", True)], Path(folder), False,
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
