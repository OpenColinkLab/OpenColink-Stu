#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

if [[ -z "${JAVA_HOME:-}" && -x "/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/java" ]]; then
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
fi

if [[ -z "${ANDROID_HOME:-}" && -d "$HOME/Library/Android/sdk" ]]; then
  export ANDROID_HOME="$HOME/Library/Android/sdk"
fi

BASELINE_APK="${BASELINE_APK:-../dist/网易云音乐下载器-Android-v1.0.1.apk}"
VERSION="$(tr -d '[:space:]' < ../VERSION)"
OUTPUT_APK="../dist/netease-music-downloader-android-v${VERSION}.apk"
APKSIGNER="$ANDROID_HOME/build-tools/36.1.0/apksigner"
if [[ ! -x "$APKSIGNER" ]]; then
  APKSIGNER="$(find "$ANDROID_HOME/build-tools" -name apksigner -type f | sort -V | tail -1)"
fi
if [[ ! -f "$BASELINE_APK" || ! -x "$APKSIGNER" ]]; then
  echo "缺少基线 APK 或 apksigner，无法确认覆盖安装签名" >&2
  exit 1
fi
BASELINE_CERT="$("$APKSIGNER" verify --print-certs "$BASELINE_APK" | sed -n 's/.*SHA-256 digest: //p' | head -1)"
if [[ -z "$BASELINE_CERT" ]]; then
  echo "无法读取基线 APK 签名证书" >&2
  exit 1
fi

if [[ "${MUSICDOWN_SKIP_TESTS:-0}" == "1" ]]; then
  ./gradlew --no-daemon :app:assembleRelease
else
  ./gradlew --no-daemon clean :app:lint :app:test :app:assembleRelease
fi
NEW_APK="app/build/outputs/apk/release/app-release.apk"
NEW_CERT="$("$APKSIGNER" verify --print-certs "$NEW_APK" | sed -n 's/.*SHA-256 digest: //p' | head -1)"
if [[ "$NEW_CERT" != "$BASELINE_CERT" ]]; then
  echo "签名证书不匹配，拒绝交付覆盖安装 APK" >&2
  echo "基线：$BASELINE_CERT" >&2
  echo "新包：$NEW_CERT" >&2
  exit 1
fi
mkdir -p ../dist
cp "$NEW_APK" "$OUTPUT_APK"
"$APKSIGNER" verify --verbose "$OUTPUT_APK"
echo "APK: $SCRIPT_DIR/$OUTPUT_APK"
echo "Signing certificate SHA-256: $NEW_CERT"
