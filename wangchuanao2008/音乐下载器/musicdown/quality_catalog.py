"""Quality labels and the public per-song NetEase quality catalog."""

import httpx


QUALITY_ORDER = (
    "standard", "higher", "exhigh", "lossless", "hires", "jymaster",
    "jyeffect", "sky", "dolby", "vivid",
)
QUALITY_NAMES = {
    "standard": "标准 128K", "higher": "较高 192K", "exhigh": "极高 320K",
    "lossless": "无损", "hires": "Hi-Res", "jymaster": "超清母带",
    "jyeffect": "高清臻音", "sky": "沉浸环绕声",
    "dolby": "杜比全景声", "vivid": "臻音全景声",
}
# Typical membership for the quality feature, not a promise that every track
# can be exported. Paid tracks can require separate rights even at 128K.
QUALITY_MEMBERSHIP = {
    "standard": "无需会员*", "higher": "无需会员*", "exhigh": "无需会员*",
    "lossless": "VIP", "hires": "VIP", "jymaster": "SVIP",
    "jyeffect": "VIP", "sky": "SVIP", "dolby": "SVIP", "vivid": "SVIP",
}
CATALOG_FIELDS = {
    "standard": "l", "higher": "m", "exhigh": "h", "lossless": "sq",
    "hires": "hr", "jymaster": "jm", "jyeffect": "je", "sky": "sk",
    "dolby": "db", "vivid": "vi",
}
CATALOG_URL = "https://music.163.com/api/song/music/detail/get"


def parse_quality_catalog(payload: dict) -> set[str]:
    if not isinstance(payload, dict) or payload.get("code") != 200:
        raise ValueError("网易云音质目录响应无效")
    data = payload.get("data")
    if not isinstance(data, dict):
        raise ValueError("网易云音质目录缺少歌曲数据")
    if not any(field in data for field in CATALOG_FIELDS.values()):
        raise ValueError("网易云音质目录缺少音质字段")
    available = {level for level, field in CATALOG_FIELDS.items() if data.get(field)}
    if data.get("sks"):
        available.add("sky")
    return available


def fetch_quality_catalog(song_id: str, client: httpx.Client) -> set[str]:
    response = client.get(CATALOG_URL, params={"songId": song_id}, timeout=15)
    response.raise_for_status()
    return parse_quality_catalog(response.json())
