from urllib.parse import quote

import httpx

from ..models import AudioSource, DownloadError, Song


class NeteaseProvider:
    name = "网易云音乐"

    def song(self, song_id: str, client: httpx.Client) -> Song:
        try:
            response = client.get("https://music.163.com/api/song/detail/", params={"ids": f"[{song_id}]"})
            response.raise_for_status()
            songs = response.json().get("songs") or []
        except (httpx.HTTPError, ValueError) as exc:
            raise DownloadError(f"网易云歌曲信息获取失败：{exc}") from exc
        if not songs:
            raise DownloadError("网易云歌曲不存在或链接已失效")
        raw = songs[0]
        album = raw.get("album") or {}
        artists = raw.get("artists") or []
        fee = raw.get("fee", 0)
        restriction = "需要会员或购买" if fee in (1, 4) else ""
        cover = album.get("picUrl", "")
        if cover and "music.126.net" in cover:
            cover += ("&" if "?" in cover else "?") + "param=300y300"
        return Song("netease", song_id, raw.get("name") or song_id,
                    "、".join(a.get("name", "") for a in artists) or "未知歌手",
                    album.get("name", ""), cover,
                    (raw.get("duration") or 0) / 1000, restriction)

    def sources(self, song: Song, client: httpx.Client) -> list[AudioSource]:
        # Public outer URL yields only the quality that the service makes available.
        return [AudioSource(f"https://music.163.com/song/media/outer/url?id={quote(song.song_id)}.mp3", "公开音源")]
