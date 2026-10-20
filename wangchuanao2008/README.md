# wangchuanao2008 的项目

本目录收录独立项目源码、开发说明和依赖清单。进入对应子目录，按其 README 准备环境；这里没有统一的安装或启动命令。

| 项目 | 内容 | 开发入口 |
| --- | --- | --- |
| [奶蛙博物馆](奶蛙博物馆/README.md) | 主馆与五个分馆的网页复现及单文件打包工具 | Python / Node.js，具体构建与媒体依赖见项目说明 |
| [dorm](dorm/README.md) | Three.js 宿舍场景 | Node.js 22.12+；`npm ci`、`npm run dev` |
| [xidiannaiwa-miniprogram](xidiannaiwa-miniprogram/README.md) | 原生微信小程序、馆藏图片与资源部署工具 | 微信开发者工具、Node.js 22.12+；先读图片服务配置 |
| [音乐下载器](音乐下载器/README.md) | 网易云音乐下载器，含 macOS / Windows / Android 源码 | Python、Qt，原生平台构建另见项目说明 |
| [视频下载](视频下载/README.md) | 哔哩哔哩视频下载器 | Node.js、Electron；运行前需另外准备媒体组件 |
| [applemusicdownloader](applemusicdownloader/README.md) | Apple Music 网页界面、配置模板和启动脚本 | Python 标准库；下载引擎与虚拟机资源须从原项目 Release 取得 |
| [XDU](XDU/README.md) | 机器学习实验笔记本与 C/C++ 练习 | 各子目录独立开发 |

## 使用说明

源码快照保留各项目自己的 README、锁文件、测试和构建脚本；不包含嵌套 Git 仓库、开发依赖目录、本机配置、账号会话、个人下载及大体积应用安装包。按维护者要求，本副本省略尚未上传的图片，保留已上传图片和小型矢量图标。**图片资源并不完整**，包括小程序本地图片服务在内的资源检查，需先向维护者获取并恢复对应图片目录。小程序默认公网图片配置仍保留，其可用性取决于资源服务。

Apple Music 目录不含下载引擎和本地启动器的完整源码，其开发范围以该项目说明为准。各项目已有的来源与许可说明继续适用，本目录不为第三方代码、图片和音乐附加新的授权。
