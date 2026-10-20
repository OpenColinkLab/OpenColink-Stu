# 网易云音乐下载器 · Windows 1.2.1

[历史发布的 Windows x64 安装程序](https://github.com/wangchuanao2008/netease-music-downloader/releases)。安装程序含 Python 运行时及界面依赖，按向导安装后从开始菜单启动。

本版与 macOS 共用根目录 `musicdown/`。粘贴网易云单曲链接或多条分享文字，先查看歌曲、封面和音质目录，再选择音质并点击下载；也可批量下载已选音质。点击登录直接进入官方登录页，支持扫码及安全验证，登录会话保存在 Windows 凭据管理器中，退出可清除。支持账号会员音质、源格式、MP3 转换、标签/封面、取消重试、重复下载记录及在资源管理器中显示文件。指定音质被降级、试听或截断会失败；自动音质可回退网易云公开来源；备用来源在音质菜单中单独选择，选择后直接查询 GD Studio，实际音质以文件检测为准。

转换和特殊音频检测需 `ffmpeg.exe` 与 `ffprobe.exe`。从 [FFmpeg 下载页](https://ffmpeg.org/download.html)选择 Windows 构建，将两个文件加入 PATH 或放在安装后的应用 EXE 旁边。AV3A 可验证音频包并原样保存，不能解码或转换；杜比检查仅确认 AC-3/E-AC-3，不能证明 Atmos 混音。

## 运行和打包

需要完整仓库，Windows 文件夹不再包含独立桌面源码。使用 Windows 10/11、x64 Python 3.10+：

```powershell
cd windows
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe run.py
```

安装 [Inno Setup 7](https://jrsoftware.org/isdl.php) 后运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build_windows.ps1
```

脚本读取根目录 VERSION，执行共享桌面测试与平台测试，生成 EXE 版本资源，再打包安装器。最终产物 `../dist/netease-music-downloader-windows-x64-setup-v1.2.1.exe`。安装器没有 Authenticode 签名。本次使用 Parallels Windows 11 ARM64 中的 x64 Python 构建，并按用户要求通过 `-SkipTests` 跳过测试；未进行 Windows 验收。记录见 [发布验证](../docs/release-1.2.1.md)。
