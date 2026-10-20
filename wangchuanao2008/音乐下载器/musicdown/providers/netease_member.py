"""Request NetEase's own player URL at the selected quality, with an account session."""

import hashlib
import json
import random
import time
from urllib.parse import urlparse

import httpx
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

from ..models import AudioSource, DownloadError, Song


LEVEL_NAMES = {
    "jymaster": "超清母带", "hires": "Hi-Res", "lossless": "无损",
    "exhigh": "极高 320K", "higher": "较高 192K", "standard": "标准 128K",
    "jyeffect": "高清臻音", "sky": "沉浸环绕声", "dolby": "杜比全景声",
    "vivid": "臻音全景声",
}
# Spatial mixes are different presentations, not steps in a bitrate ladder.
AUTO_LEVELS = ("jymaster", "hires", "lossless", "exhigh", "higher", "standard")
MEMBER_LEVELS = set(LEVEL_NAMES) - {"standard", "higher", "exhigh"}
LOSSLESS_LEVELS = {"jymaster", "hires", "lossless", "jyeffect"}
API_PATH = "/api/song/enhance/player/url/v1"
EAPI_URL = "https://interface3.music.163.com/eapi/song/enhance/player/url/v1"


def _audio_host(url: str) -> bool:
    parsed = urlparse(url)
    host = parsed.hostname or ""
    return parsed.scheme in ("http", "https") and (host == "music.126.net" or host.endswith(".music.126.net"))


def _encode_eapi(data: dict) -> str:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    digest = hashlib.md5(f"nobody{API_PATH}use{payload}md5forencrypt".encode()).hexdigest()
    message = f"{API_PATH}-36cd479b6b5-{payload}-36cd479b6b5-{digest}"
    return AES.new(b"e82ckenh8dichen8", AES.MODE_ECB).encrypt(pad(message.encode(), 16)).hex().upper()


def player_url(song: Song, client: httpx.Client, cookies: dict, level: str,
               dolby_effect: bool = False) -> dict:
    header = {"os": "android" if level == "vivid" else "pc",
              "appver": "9.5.61" if level == "vivid" else "8.0.0",
              "requestId": f"{int(time.time() * 1000)}_{random.randrange(1000):04}"}
    for name in ("MUSIC_U", "__csrf"):
        if cookies.get(name):
            header[name] = cookies[name]
    request = {"ids": f"[{song.song_id}]", "level": "hires" if dolby_effect else level,
               "encodeType": "mp3" if level == "vivid" else "mp4" if level == "dolby" else "flac",
               "header": header}
    if level == "sky":
        request["immerseType"] = "c51"
    if dolby_effect:
        request["effects"] = ["dolby"]
    cookie_header = "; ".join(f"{name}={value}" for name, value in header.items())
    try:
        response = client.post(EAPI_URL, data={"params": _encode_eapi(request)},
                               headers={"Cookie": cookie_header, "Referer": "https://music.163.com/"}, timeout=20)
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise DownloadError(f"网易云音质接口失败：{exc}") from exc
    if not isinstance(data, dict):
        raise DownloadError("网易云音质接口响应无效")
    if data.get("code") not in (None, 200):
        raise DownloadError(f"网易云音质接口拒绝请求：{data.get('message') or data.get('code')}")
    items = data.get("data") or []
    if not isinstance(items, list) or not items or not isinstance(items[0], dict):
        raise DownloadError("网易云音质接口未返回歌曲数据")
    return items[0]


class NeteaseMemberProvider:
    def sources(self, song: Song, client: httpx.Client, cookies: dict, quality: str) -> list[AudioSource]:
        if quality not in LEVEL_NAMES and quality != "auto":
            raise DownloadError("未知音质选项")
        if quality in MEMBER_LEVELS and not cookies.get("MUSIC_U"):
            raise DownloadError("所选音质需要先扫码登录有相应权益的网易云账号")
        levels = (AUTO_LEVELS if quality == "auto" and cookies.get("MUSIC_U") else
                  AUTO_LEVELS[3:] if quality == "auto" else (quality,))
        errors = []
        fallback = None
        dolby_candidates = []
        rank = {name: len(AUTO_LEVELS) - index for index, name in enumerate(AUTO_LEVELS)}
        for level in levels:
            for dolby_effect in ((False, True) if level == "dolby" else (False,)):
                try:
                    item = player_url(song, client, cookies, level, dolby_effect)
                except DownloadError as exc:
                    errors.append(str(exc))
                    continue
                url = item.get("url")
                actual = item.get("level")
                trial = item.get("freeTimeTrialPrivilege") or {}
                if item.get("freeTrialInfo") or item.get("trialInfo") or trial.get("type"):
                    errors.append("网易云仅返回试听片段")
                    continue
                if not isinstance(url, str) or not _audio_host(url):
                    errors.append("网易云没有返回可用的原站音频地址")
                    continue
                if dolby_effect:
                    # This variant asks for a Dolby effect on a Hi-Res URL. The
                    # response may still report the base level; the downloaded
                    # codec is checked before it can be marked successful.
                    actual = "dolby"
                if quality != "auto" and actual != level:
                    errors.append(f"请求{LEVEL_NAMES[level]}，网易云实际只提供{LEVEL_NAMES.get(actual, actual or '未知音质')}")
                    continue
                if quality == "auto" and actual not in rank:
                    errors.append(f"网易云返回了不在自动音质范围内的档位：{actual or '未知'}")
                    continue
                label = f"网易云账号音源 · {LEVEL_NAMES.get(actual, actual or level)}" if cookies.get("MUSIC_U") else \
                        f"网易云官方音源 · {LEVEL_NAMES.get(actual, actual or level)}"
                if level == "dolby":
                    label = "网易云账号音源 · 杜比音频候选（需文件校验）"
                source = AudioSource(url, label, actual in LOSSLESS_LEVELS,
                                     requested_level=level, actual_level=actual or "")
                if level == "dolby":
                    if not any(candidate.url == url for candidate in dolby_candidates):
                        dolby_candidates.append(source)
                    continue
                if quality != "auto" or actual == level:
                    return [source]
                if fallback is None or rank.get(actual, 0) > rank.get(fallback[0], 0):
                    fallback = (actual, source)
        if dolby_candidates:
            return dolby_candidates
        if fallback:
            return [fallback[1]]
        raise DownloadError("；".join(dict.fromkeys(errors)) or "网易云没有返回可用音频")
