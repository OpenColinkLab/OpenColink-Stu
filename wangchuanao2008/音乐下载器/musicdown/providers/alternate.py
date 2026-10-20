"""Optional GD Studio lookup for a NetEase song ID."""

from urllib.parse import urlparse

import httpx

from ..models import AudioSource, DownloadError, Song


class AlternateProvider:
    """Query the same NetEase song through the optional third-party service."""

    endpoint = "https://music-api.gdstudio.xyz/api.php"

    def _get(self, client: httpx.Client, params: dict):
        try:
            response = client.get(self.endpoint, params=params, timeout=18)
            data = response.json()
            if response.is_error:
                response.raise_for_status()
            return data
        except (httpx.HTTPError, ValueError) as exc:
            raise DownloadError(f"备用音源接口失败：{exc}") from exc

    @staticmethod
    def _expected_host(url: str) -> bool:
        try:
            parsed = urlparse(url)
            host = parsed.hostname or ""
        except ValueError:
            return False
        if parsed.scheme != "https":
            return False
        return host == "music.126.net" or host.endswith(".music.126.net")

    def sources(self, song: Song, client: httpx.Client) -> list[AudioSource]:
        if song.platform != "netease":
            raise DownloadError("备用接口仅支持网易云音乐")
        sources = []
        errors = []
        for bitrate, label in ((999, "无损"), (320, "320K"), (128, "128K")):
            try:
                data = self._get(client, {"types": "url", "source": "netease", "id": song.song_id,
                                          "br": bitrate})
            except DownloadError as exc:
                errors.append(str(exc))
                continue
            url = data.get("url") if isinstance(data, dict) else None
            if isinstance(url, str) and self._expected_host(url):
                sources.append(AudioSource(url, f"网易云 · GD Studio 备用接口 · {label}"))
        if not sources:
            reason = "备用接口也未返回完整音频地址"
            if errors:
                reason += f"；{errors[0]}"
            raise DownloadError(reason)
        return sources
