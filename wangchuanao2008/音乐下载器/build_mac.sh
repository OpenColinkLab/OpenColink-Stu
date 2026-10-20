#!/bin/zsh
set -e
cd "${0:A:h}"
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt 'pyinstaller>=6.18'
.venv/bin/pyinstaller --noconfirm --clean 音乐下载器.spec

# PyInstaller currently treats QtWebEngineCore.framework/Resources as a second
# framework version. Restore the layout expected by Qt WebEngine on macOS.
.venv/bin/python - <<'PY'
from pathlib import Path
import shutil

versions = Path("dist/音乐下载器.app/Contents/Frameworks/PySide6/Qt/lib/QtWebEngineCore.framework/Versions")
misplaced = versions / "Resources"
current = versions / "A"
if misplaced.is_dir():
    for item in (misplaced / "Resources").iterdir():
        destination = current / "Resources" / item.name
        if not destination.exists():
            shutil.move(str(item), str(destination))
    helpers = misplaced / "Helpers"
    if helpers.exists() and not (current / "Helpers").exists():
        shutil.move(str(helpers), str(current / "Helpers"))
    shutil.rmtree(misplaced)
assert (current / "Resources/qtwebengine_resources.pak").is_file()
assert (current / "Helpers/QtWebEngineProcess.app/Contents/MacOS/QtWebEngineProcess").is_file()
PY

framework="dist/音乐下载器.app/Contents/Frameworks/PySide6/Qt/lib/QtWebEngineCore.framework"
helper="$framework/Versions/A/Helpers/QtWebEngineProcess.app"
codesign --force --sign - --entitlements "$helper/Contents/Resources/QtWebEngineProcess.entitlements" "$helper"
codesign --force --sign - "$framework"
codesign --force --sign - 'dist/音乐下载器.app'
codesign --verify --deep --strict 'dist/音乐下载器.app'
echo "应用位于 dist/音乐下载器.app"

VERSION="$(tr -d '[:space:]' < VERSION)"
ditto -c -k --sequesterRsrc --keepParent 'dist/音乐下载器.app' "dist/netease-music-downloader-macos-arm64-v${VERSION}.zip"
