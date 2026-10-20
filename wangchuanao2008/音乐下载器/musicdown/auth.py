"""NetEase account sessions are validated and stored in the operating system credential store."""

import json
import sys

import httpx
import keyring

from .models import DownloadError


SERVICE = "MusicDown.Netease"
ACCOUNT = "session"
STORE_NAME = "Windows 凭据管理器" if sys.platform == "win32" else "macOS 钥匙串"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
           "Referer": "https://music.163.com/"}


def account_profile(client: httpx.Client, cookies: dict[str, str]) -> dict:
    merged = {cookie.name: cookie.value for cookie in client.cookies.jar
              if cookie.domain.endswith("music.163.com")}
    merged.update({key: value for key, value in cookies.items() if value})
    cookie_header = "; ".join(f"{key}={value}" for key, value in merged.items())
    response = client.get("https://music.163.com/api/nuser/account/get", headers={"Cookie": cookie_header})
    response.raise_for_status()
    data = response.json()
    profile = data.get("profile") if isinstance(data, dict) else None
    if not isinstance(profile, dict) or not profile.get("userId"):
        raise DownloadError("登录状态无效或已过期，请在官网重新登录")
    return profile


class AccountStore:
    def load(self) -> dict:
        try:
            raw = keyring.get_password(SERVICE, ACCOUNT)
            data = json.loads(raw) if raw else {}
            return data if isinstance(data, dict) and data.get("MUSIC_U") else {}
        except (ValueError, keyring.errors.KeyringError):
            return {}

    def save(self, cookies: dict, profile: dict) -> None:
        token = cookies.get("MUSIC_U")
        if not token:
            raise DownloadError("网易云网页未返回有效登录会话")
        payload = {"MUSIC_U": token, "__csrf": cookies.get("__csrf", ""),
                   "userId": str(profile["userId"]), "nickname": profile.get("nickname", "")}
        try:
            keyring.set_password(SERVICE, ACCOUNT, json.dumps(payload, ensure_ascii=False))
        except keyring.errors.KeyringError as exc:
            raise DownloadError(f"无法将登录状态保存到 {STORE_NAME}：{exc}") from exc

    def clear(self) -> None:
        try:
            keyring.delete_password(SERVICE, ACCOUNT)
        except keyring.errors.PasswordDeleteError:
            pass
        except keyring.errors.KeyringError as exc:
            raise DownloadError(f"无法从 macOS 钥匙串删除登录状态：{exc}") from exc
