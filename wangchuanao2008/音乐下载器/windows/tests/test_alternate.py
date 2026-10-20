import unittest

import httpx

from musicdown.models import DownloadError, Song
from musicdown.providers.alternate import AlternateProvider


class AlternateTests(unittest.TestCase):
    def test_uses_netease_song_id(self):
        song = Song("netease", "210049", "布拉格广场", "蔡依林、周杰伦", "看我72变", "", 294.6)
        requests = []

        def handler(request):
            requests.append(dict(request.url.params))
            return httpx.Response(200, json={"url": "https://m801.music.126.net/example.flac"})

        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            sources = AlternateProvider().sources(song, client)
        self.assertEqual(len(sources), 3)
        self.assertEqual([request["source"] for request in requests], ["netease"] * 3)
        self.assertEqual([request["id"] for request in requests], [song.song_id] * 3)
        self.assertEqual([request["types"] for request in requests], ["url"] * 3)

    def test_exact_song_requires_platform_audio_host(self):
        song = Song("netease", "210049", "布拉格广场", "蔡依林、周杰伦", "看我72变", "", 294.6)

        def handler(request):
            return httpx.Response(200, json={"url": "https://example.com/fake.flac", "br": 999})

        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            with self.assertRaisesRegex(DownloadError, "未返回完整音频地址"):
                AlternateProvider().sources(song, client)

    def test_only_netease_songs_are_accepted(self):
        song = Song("qq", "004Z8Ihr0JIu5s", "七里香", "周杰伦", "七里香", "", 299)
        with httpx.Client(transport=httpx.MockTransport(lambda request: self.fail("unexpected request"))) as client:
            with self.assertRaisesRegex(DownloadError, "仅支持网易云音乐"):
                AlternateProvider().sources(song, client)


if __name__ == "__main__":
    unittest.main()
