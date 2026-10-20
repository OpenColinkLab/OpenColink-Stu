import json
import unittest
from unittest.mock import patch

import httpx

from musicdown.auth import AccountStore, account_profile
from musicdown.models import DownloadError, Song
from musicdown.providers.netease_member import NeteaseMemberProvider, player_url


SONG = Song("netease", "33894312", "测试歌", "歌手", "专辑", "", 250)
URL = "https://m801.music.126.net/example.flac"


class MemberTests(unittest.TestCase):
    def test_auto_accepts_actual_level_and_uses_official_host(self):
        requests = []

        def handler(request):
            requests.append(request)
            actual = "exhigh" if len(requests) == 1 else "lossless"
            return httpx.Response(200, json={"code": 200, "data": [{"url": URL, "level": actual,
                                                               "freeTrialInfo": None}]})

        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            sources = NeteaseMemberProvider().sources(SONG, client, {"MUSIC_U": "test-session"}, "auto")
        self.assertEqual(len(sources), 1)
        self.assertIn("无损", sources[0].label)
        self.assertTrue(sources[0].required_lossless)
        self.assertEqual(len(requests), 3)
        self.assertEqual(requests[0].url.host, "interface3.music.163.com")
        self.assertEqual(requests[0].method, "POST")
        self.assertIn("MUSIC_U=test-session", requests[0].headers["cookie"])

    def test_every_listed_quality_accepts_only_its_own_level(self):
        from musicdown.providers.netease_member import LEVEL_NAMES

        for level in LEVEL_NAMES:
            with self.subTest(level=level):
                def handler(request):
                    return httpx.Response(200, json={"code": 200, "data": [{"url": URL, "level": level}]})

                with httpx.Client(transport=httpx.MockTransport(handler)) as client:
                    source = NeteaseMemberProvider().sources(SONG, client, {"MUSIC_U": "test-session"}, level)[0]
                self.assertEqual(source.actual_level, level)
                self.assertEqual(source.requested_level, level)

    def test_dolby_effect_variant_can_be_checked_after_download(self):
        requests = []

        def handler(request):
            requests.append(request)
            level = "hires" if len(requests) == 2 else "lossless"
            return httpx.Response(200, json={"code": 200, "data": [{"url": URL, "level": level}]})

        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            source = NeteaseMemberProvider().sources(SONG, client, {"MUSIC_U": "test-session"}, "dolby")[0]
        self.assertEqual(len(requests), 2)
        self.assertEqual(source.actual_level, "dolby")
        self.assertEqual(source.requested_level, "dolby")

    def test_dolby_keeps_second_candidate_for_codec_fallback(self):
        requests = []

        def handler(request):
            requests.append(request)
            return httpx.Response(200, json={"code": 200, "data": [{
                "url": f"https://m801.music.126.net/dolby{len(requests)}.m4a",
                "level": "dolby" if len(requests) == 1 else "hires"}]})

        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            sources = NeteaseMemberProvider().sources(SONG, client, {"MUSIC_U": "test-session"}, "dolby")
        self.assertEqual(len(sources), 2)
        self.assertNotEqual(sources[0].url, sources[1].url)
        self.assertEqual([source.actual_level for source in sources], ["dolby", "dolby"])

    def test_special_quality_requests_include_required_parameters(self):
        payloads = []
        def capture(data):
            payloads.append(data)
            return "test"

        with patch("musicdown.providers.netease_member._encode_eapi", side_effect=capture):
            with httpx.Client(transport=httpx.MockTransport(
                    lambda request: httpx.Response(200, json={"code": 200, "data": [{"url": URL}]}))) as client:
                for level in ("jymaster", "jyeffect", "sky", "vivid", "dolby"):
                    player_url(SONG, client, {"MUSIC_U": "test-session"}, level)
                player_url(SONG, client, {"MUSIC_U": "test-session"}, "dolby", True)
        self.assertEqual(payloads[0]["level"], "jymaster")
        self.assertEqual(payloads[2]["immerseType"], "c51")
        self.assertEqual(payloads[3]["header"]["os"], "android")
        self.assertEqual(payloads[3]["encodeType"], "mp3")
        self.assertEqual(payloads[4]["encodeType"], "mp4")
        self.assertEqual(payloads[5]["level"], "hires")
        self.assertEqual(payloads[5]["effects"], ["dolby"])

    def test_selected_lossless_rejects_downgrade(self):
        def handler(request):
            return httpx.Response(200, json={"code": 200, "data": [{"url": URL, "level": "exhigh"}]})

        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            with self.assertRaisesRegex(DownloadError, "只提供极高"):
                NeteaseMemberProvider().sources(SONG, client, {"MUSIC_U": "test-session"}, "lossless")

    def test_preview_and_other_hosts_are_rejected(self):
        for item in ({"url": URL, "level": "lossless", "freeTrialInfo": {"start": 0, "end": 30}},
                     {"url": "https://example.com/audio.flac", "level": "lossless"}):
            with self.subTest(item=item):
                with httpx.Client(transport=httpx.MockTransport(
                        lambda request: httpx.Response(200, json={"code": 200, "data": [item]}))) as client:
                    with self.assertRaises(DownloadError):
                        NeteaseMemberProvider().sources(SONG, client, {"MUSIC_U": "test-session"}, "lossless")

    def test_member_quality_requires_login(self):
        with httpx.Client(transport=httpx.MockTransport(lambda request: self.fail("unexpected request"))) as client:
            with self.assertRaisesRegex(DownloadError, "扫码登录"):
                NeteaseMemberProvider().sources(SONG, client, {}, "hires")

    def test_account_store_uses_keyring(self):
        stored = {}
        with patch("musicdown.auth.keyring.set_password", side_effect=lambda service, name, value: stored.update({"value": value})), \
             patch("musicdown.auth.keyring.get_password", side_effect=lambda service, name: stored.get("value")), \
             patch("musicdown.auth.keyring.delete_password", side_effect=lambda service, name: stored.clear()):
            store = AccountStore()
            store.save({"MUSIC_U": "secret", "__csrf": "csrf"}, {"userId": 42, "nickname": "测试"})
            self.assertEqual(store.load()["MUSIC_U"], "secret")
            self.assertEqual(json.loads(stored["value"])["userId"], "42")
            store.clear()
            self.assertEqual(store.load(), {})

    def test_session_check_rejects_guest(self):
        with httpx.Client(transport=httpx.MockTransport(
                lambda request: httpx.Response(200, json={"code": 200, "account": None, "profile": None}))) as client:
            with self.assertRaisesRegex(DownloadError, "登录状态无效"):
                account_profile(client, {})


if __name__ == "__main__":
    unittest.main()
