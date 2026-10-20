import re
from urllib.parse import parse_qs, urljoin, urlparse

import httpx

from .models import DownloadError


URL_RE = re.compile(r"https?://[^\s<>\"'，。；;）)\]】]+", re.I)
SHORT_HOSTS = {"163cn.tv"}


def extract_urls(text: str) -> list[str]:
    """Extract URLs from arbitrary share text, preserving order and removing repeats."""
    return list(dict.fromkeys(m.group(0).rstrip(".,!?:") for m in URL_RE.finditer(text)))


def _platform(host: str) -> str:
    host = host.lower()
    if host == "music.163.com" or host == "y.music.163.com":
        return "netease"
    raise DownloadError("仅支持网易云音乐的歌曲分享链接")


def resolve_link(url: str, client: httpx.Client) -> tuple[str, str, str]:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise DownloadError("链接协议无效")
    if parsed.hostname in SHORT_HOSTS:
        try:
            for _ in range(8):
                with client.stream("GET", url, follow_redirects=False) as response:
                    if response.status_code not in (301, 302, 303, 307, 308):
                        response.raise_for_status()
                        break
                    location = response.headers.get("location")
                    if not location:
                        raise DownloadError("短链接缺少跳转地址")
                    target = urljoin(url, location)
                    target_host = urlparse(target).hostname or ""
                    if target_host not in SHORT_HOSTS:
                        _platform(target_host)
                    url = target
            else:
                raise DownloadError("短链接跳转次数过多")
            parsed = urlparse(url)
        except httpx.HTTPError as exc:
            raise DownloadError(f"短链接跳转失败：{exc}") from exc
    platform = _platform(parsed.hostname or "")
    full = parsed.path + "?" + parsed.query + "#" + parsed.fragment
    q = parse_qs(parsed.query)
    if not q.get("id") and parsed.fragment:
        fragment = parsed.fragment.split("?", 1)
        q = parse_qs(fragment[1]) if len(fragment) > 1 else {}
    match = re.search(r"/(?:song|m/song)/(\d+)", full)
    song_id = (q.get("id") or [match.group(1) if match else ""])[0]
    if "song" not in full or not song_id.isdecimal():
        raise DownloadError("不是网易云音乐单曲链接，或缺少歌曲 ID")
    return platform, song_id, url
