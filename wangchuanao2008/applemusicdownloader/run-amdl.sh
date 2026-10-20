#!/bin/bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
cd "$here"
if [[ ! -f config.yaml ]]; then
  cp config.example.yaml config.yaml
  chmod 600 config.yaml
fi
exec ./amdl "$@"
