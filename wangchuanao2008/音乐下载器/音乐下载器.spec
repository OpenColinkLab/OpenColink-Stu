# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['run.py'],
    pathex=[],
    binaries=[],
    datas=[('VERSION', '.')],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='音乐下载器',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch='arm64',
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='音乐下载器',
)
app = BUNDLE(
    coll,
    name='音乐下载器.app',
    icon=None,
    bundle_identifier='io.github.musicdown.desktop',
    version=open('VERSION', encoding='utf-8').read().strip(),
    info_plist={'CFBundleShortVersionString': open('VERSION', encoding='utf-8').read().strip(),
                'CFBundleVersion': open('VERSION', encoding='utf-8').read().strip()},
)
