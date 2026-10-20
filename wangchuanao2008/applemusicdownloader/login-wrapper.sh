#!/bin/bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
if lsof -nP -iTCP:12340 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "请先停止正在运行的 wrapper-lite（启动它的终端按 Ctrl+C），再登录。" >&2
  exit 1
fi

read -r -p "Apple ID: " apple_id
read -r -s -p "Apple Music 密码: " apple_password
printf '\n'
"$here/start-wrapper.sh" --login "$apple_id:$apple_password"
unset apple_password
