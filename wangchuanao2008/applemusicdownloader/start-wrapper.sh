#!/bin/bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
qemu_bin="$(command -v qemu-system-x86_64 || true)"
if [[ -z "$qemu_bin" ]]; then
  echo "未找到 QEMU，请先运行 brew install qemu。" >&2
  exit 1
fi

cd "$here/wrapper-lite"
export QEMU_BIN="$qemu_bin"
umask 077
if [[ ! -f qemu/data.img ]]; then
  if [[ ! -f qemu/data-template.img ]]; then
    echo "未找到空白登录磁盘，请下载并解压 GitHub Release 的完整运行包。" >&2
    exit 1
  fi
  cp qemu/data-template.img qemu/data.img
fi
trap 'rm -f "$here/wrapper-lite/qemu/.lite-qemu-args"' EXIT
./wrapper-lite-qemu-local --accel tcg "$@"
