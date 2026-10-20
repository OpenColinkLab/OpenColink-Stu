# 第三方组件

- Electron 44.4.3：MIT，https://github.com/electron/electron ，运行时许可随 Electron 保留。
- React / React DOM：MIT，https://github.com/facebook/react
- Lucide：ISC，https://github.com/lucide-icons/lucide
- yt-dlp 2026.08.19：项目主体 Unlicense，独立发行包含其他许可的组件。官方发行与许可：https://github.com/yt-dlp/yt-dlp/releases/tag/2026.08.19 ，https://github.com/yt-dlp/yt-dlp/blob/master/LICENSE
- FFmpeg / FFprobe 9.0.2 ARM64：GPLv3 构建，未启用 nonfree。来自 https://ffmpeg.martin-riedl.de/download/macos/arm64/1789931890_9.0.2/ 。构建脚本、组件版本与源码来源：https://git.martin-riedl.de/ffmpeg/build-script ，https://ffmpeg.martin-riedl.de/download/macos/arm64/1789931890_9.0.2/versions.txt 。FFmpeg 源码：https://ffmpeg.org/releases/ ，许可：https://ffmpeg.org/legal.html 。如需向其他人分发二进制，需一并提供相应源码及许可证，履行 GPL 等第三方许可要求。此目录交付针对本机使用。

下载组件的版本、校验值及来源记录在 resources/binaries.json。网站支持规则不由此应用控制。

Windows x64 版的组件清单为 resources/binaries-win-x64.json。yt-dlp 使用同版本官方 Windows 独立发行。FFmpeg / FFprobe 9.0.2 使用 Gyan Doshi 提供的 GPLv3 静态 essentials 构建：https://www.gyan.dev/ffmpeg/builds/ 。原构建 LICENSE 和 README 随应用 resources/bin 保留，源代码参考 https://github.com/FFmpeg/FFmpeg/commit/946fcce07b 。Electron 的 LICENSE 和 LICENSES.chromium.html 随 Windows 程序目录保留。
