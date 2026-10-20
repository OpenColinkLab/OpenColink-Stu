# 第三方组件

本项目整理本地网页界面、启动脚本和 macOS ARM64 运行包。第三方组件保留各自的权利与许可，不额外授予第三方组件的许可。

- `amdl` v0.1.0：来自 [zhaarey/apple-music-downloader](https://github.com/zhaarey/apple-music-downloader)。下载器的 Go 源码不包含在本仓库；运行文件随 Release 分发。
- `wrapper-lite`：来自 [WorldObservationLog/wrapper 的 lite 分支](https://github.com/WorldObservationLog/wrapper/tree/lite)。现有本地启动器、Linux 内核与初始文件系统随 Release 分发，附带原有的 `wrapper-lite/LICENSE`、`wrapper-lite/README.md`、`wrapper-lite/qemu/LICENSE` 和 `wrapper-lite/qemu/README.md`。初始文件系统内保留其已有的第三方许可文件。
- QEMU、ffmpeg、Python：通过 Homebrew 安装，不包含在本项目发布包中。

本地启动器使用 QEMU TCG 模式；当前文件夹只提供编译后的启动器，不包含该本地构建对应的 C++ 源码。
