#!/bin/bash
# 启动 amdl 图形界面（http://127.0.0.1:8890）。后端仍需另行运行 ./start-wrapper.sh
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
cd "$here"
if [[ ! -f config.yaml ]]; then
  cp config.example.yaml config.yaml
  chmod 600 config.yaml
fi
exec python3 gui/server.py
