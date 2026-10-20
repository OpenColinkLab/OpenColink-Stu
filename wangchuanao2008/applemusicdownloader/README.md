# Apple Music Downloader

适用于 **Apple Silicon Mac** 的 Apple Music 本地下载工具集。通过中文网页界面查询歌曲或专辑的可用音质，选择 AAC、ALAC 无损、Hi-Res 或杜比全景声，并在本机查看任务日志和下载结果。

[下载发布版](https://github.com/wangchuanao2008/applemusic-downloader/releases) · [安装与启动](#安装发布版) · [图形界面](#图形界面使用) · [命令行](#命令行使用) · [常见问题](#常见问题) · [上游与许可](#上游与许可)

## 功能概览

| 功能 | 说明 |
| --- | --- |
| 音质查询 | 按曲目显示 AAC、Lossless、Hi-Res Lossless 和 Dolby Atmos 的可用情况 |
| 单曲与专辑 | 接受 Apple Music 歌曲、专辑链接；带 `?i=` 的链接用于指定专辑中的单曲 |
| 音质选择 | 网页支持 AAC、ALAC 44.1 kHz 上限、Hi-Res 96 / 192 kHz 上限和 Dolby Atmos |
| 本地任务管理 | 查询与下载共用一个任务队列，可查看实时日志、停止当前任务 |
| 下载目录 | 使用默认的音质分类目录，或在网页中指定一个平铺保存目录 |
| 歌词与封面 | 默认嵌入歌词和封面；网页下载结束后清理本次产生的独立封面图片 |
| 命令行使用 | 保留 `amdl` 的命令行参数，可查询、下载和调整采样率上限 |
| 个人数据隔离 | 个人配置、下载文件、临时文件和登录磁盘不纳入 Git 版本管理 |

本仓库维护网页界面、启动脚本、配置模板和文档。下载引擎 `amdl` 与 `wrapper-lite` 来自上游项目，编译后的运行文件通过 Release 提供。请使用自己的 Apple Music 账号访问有权使用的内容。

## 工作方式

```text
浏览器 http://127.0.0.1:8890
          │
          ▼
    本地 Python 网页服务 ──▶ amdl ──▶ 本地下载目录
                              │
                              ▼
                wrapper-lite / QEMU 虚拟机
                  http://127.0.0.1:12340
```

网页服务和 wrapper 后端需要分别启动。**查询音质可以在 wrapper 后端未启动时进行；下载需要已登录的 wrapper 后端。** 查询仍需要网络访问 Apple 的目录和音质信息。

## 环境要求

| 项目 | 要求 |
| --- | --- |
| 系统与架构 | macOS、Apple Silicon（M 系列芯片 / ARM64）；当前运行包只面向该平台 |
| Python | Python 3，网页服务使用标准库，无需安装 pip 依赖 |
| QEMU | 提供 `qemu-system-x86_64`；启动脚本使用 TCG 模式运行 x86_64 Linux 客体 |
| ffmpeg | 提供 `ffmpeg` 和 `ffprobe`，供媒体处理与格式检查使用 |
| 账号与网络 | 下载需要可访问目标内容的 Apple Music 账号及相应访问权限；支持交互式两步验证 |

安装依赖前需已有 [Homebrew](https://brew.sh/)。

## 安装发布版

### 1. 下载运行包与校验文件

打开 [Releases](https://github.com/wangchuanao2008/applemusic-downloader/releases)，在 `v0.1.0` 的 Assets 中下载：

- `applemusicdownloader-v0.1.0-macos-arm64.tar.gz`：完整运行包，约 66.4 MiB。
- `SHA256SUMS.txt`：SHA-256 校验文件。

`v0.1.0` 的附件名称与解压后的 `applemusicdownloader` 目录保留首次发布时的名称。GitHub 自动生成的 **Source code** 压缩包只包含仓库文件，运行时还需要完整运行包中的二进制文件和虚拟机资源。

### 2. 安装依赖、校验并解压

在保存上述两个下载文件的目录执行：

```bash
brew install python qemu ffmpeg
shasum -a 256 -c SHA256SUMS.txt
tar -xzf applemusicdownloader-v0.1.0-macos-arm64.tar.gz
cd applemusicdownloader
```

校验成功时会显示压缩包名称和 `OK`。运行包包含 `amdl`、QEMU 启动器、Linux 内核、初始文件系统以及全新的空白登录磁盘模板；QEMU、Python 和 ffmpeg 使用系统安装的版本。

可检查依赖是否在 `PATH` 中：

```bash
python3 --version
qemu-system-x86_64 --version
ffmpeg -version
```

### 3. 首次登录

```bash
./login-wrapper.sh
```

按终端提示输入 Apple ID、密码以及需要的两步验证码。输入密码时终端不会回显字符。登录前应停止已运行的 wrapper 后端。

首次启动 wrapper 会从 `wrapper-lite/qemu/data-template.img` 复制个人登录磁盘 `data.img`。后续登录状态保存在该个人磁盘中，不需要每次使用都登录；失效后可重新运行登录脚本。

### 4. 启动后端与网页服务

在第一个终端中运行并保持窗口开启：

```bash
./start-wrapper.sh
```

在另一个终端进入同一工具目录，检查后端状态：

```bash
curl http://127.0.0.1:12340/status
```

接口返回的 `data.regions` 有值时，再进行下载。`regions: []` 表示服务已响应，但当前没有可供下载使用的地区信息，应检查登录情况和后端日志。

随后启动网页服务：

```bash
./start-gui.sh
```

**手动在浏览器中打开 <http://127.0.0.1:8890>。** 网页服务只监听本机地址，不要直接双击 `gui/index.html`。使用结束后，在相应终端按 `Ctrl+C` 停止服务。

首次运行 `start-gui.sh` 或 `run-amdl.sh` 时，会从 `config.example.yaml` 创建个人配置 `config.yaml`，已有配置会保留。

## 图形界面使用

1. 粘贴 `https://music.apple.com/` 开头的歌曲或专辑链接，点击「查询音质」。
2. 查看各曲目的可用格式，选择一个可用音质档位。
3. 确认 wrapper 后端已经启动并完成登录，点击「下载所选音质」。
4. 在「任务」区域查看输出日志和下载结果；需要中止时点击「停止当前任务」。

专辑中可能只有部分曲目提供某一档位，界面会提示可用曲目数。`Not Available` 表示源内容没有提供该格式，选择更高的上限不会生成不存在的音质。

带 `?i=` 的单曲链接会尝试通过 Apple 公开目录接口定位目标曲目，再过滤查询结果；如果目录查询失败，可能显示整张专辑的音质信息。下载时由 `amdl` 处理链接中的单曲参数。

### 下载目录与封面

| 设置 | 保存行为 |
| --- | --- |
| 下载目录留空 | 使用 `config.yaml` 的 `AM-Lossless`、`AM-Atmos`、`AM-AAC`、`AM-MV`，按模板组织歌手与专辑目录 |
| 指定自定义目录 | 点击「浏览…」选择文件夹，或填写绝对路径（支持 `~`）后保存；网页下载直接保存在该目录，不建歌手、专辑子目录 |
| 清空自定义目录并保存 | 恢复使用配置文件中的默认目录 |

网页目录设置保存在 `gui/settings.json`，只对网页任务生效。平铺保存时，不同专辑的同名曲目可能冲突或覆盖，同一首歌重复下载可能被跳过；需要长期整理曲库时，可以使用默认目录结构。

网页下载结束后会清理下载目录中本次任务开始后产生的独立图片文件，封面仍按配置嵌入音频。命令行下载按 `config.yaml` 的设置处理图片。

下载结果会显示文件路径。「在 Finder 中显示」当前仅支持工具目录内的文件；如果自定义目录位于工具目录外，请按显示的路径手动打开该文件夹。

## 命令行使用

以下示例均在工具目录中运行。URL 中包含 `?`、`&` 等字符时，应给整个链接加引号。

```bash
song_url='https://music.apple.com/us/album/the-nights/1440829274?i=1440829549'

# 只查询音质，不下载；无需启动 wrapper 后端
./run-amdl.sh --debug "$song_url"

# 下载：先启动并登录 wrapper 后端
./run-amdl.sh "$song_url"                    # 默认 ALAC，上限来自配置
./run-amdl.sh --alac-max 44100 "$song_url"   # ALAC，采样率上限 44.1 kHz
./run-amdl.sh --alac-max 96000 "$song_url"   # ALAC，采样率上限 96 kHz
./run-amdl.sh --alac-max 192000 "$song_url"  # ALAC，采样率上限 192 kHz
./run-amdl.sh --aac "$song_url"             # AAC
./run-amdl.sh --atmos "$song_url"           # Dolby Atmos，需源内容提供

# 查看版本与完整参数
./run-amdl.sh --version
./run-amdl.sh --help
```

将示例 URL 替换为自己的歌曲或专辑链接即可。查询专辑时，命令行会逐曲输出音质表；即使链接带 `?i=`，`--debug` 也可能输出整张专辑，下载模式则使用该单曲参数。

### 理解音质参数

| 格式 / 参数 | 含义 |
| --- | --- |
| AAC | 有损音频；网页档位标注为 256 kbps，实际规格以源内容与查询结果为准 |
| ALAC / Lossless | 无损音频，实际位深与采样率由源内容决定 |
| Hi-Res Lossless | 源内容提供的更高规格无损档位，是否可用因曲目而异 |
| `--alac-max` | 采样率上限，单位 Hz；不会升采样，也不会强制生成高规格版本 |
| `--atmos` | 请求杜比全景声版本，需曲目提供相应资源 |
| `--atmos-max` | 全景声码率上限，例如 `--atmos-max 2448`；默认值见配置模板 |

`.m4a` 是容器扩展名，ALAC 和 AAC 都可以保存在 `.m4a` 中。检查文件的实际编码、位深与采样率：

```bash
ffprobe -v error -select_streams a:0 \
  -show_entries stream=codec_name,bits_per_raw_sample,sample_rate,channels \
  -of default=noprint_wrappers=1 '/path/to/song.m4a'
```

更改同一种格式的音质上限后，如果已有同名文件被跳过，可先把原文件移到其他目录，再重新下载比较。

## 配置说明

编辑个人文件 `config.yaml` 即可调整下载行为。[config.example.yaml](config.example.yaml) 包含完整选项及注释。常用默认值如下：

| 配置项 | 默认值 | 用途 |
| --- | --- | --- |
| `general.lite-server` | `http://127.0.0.1:12340` | 下载器访问 wrapper 后端的地址 |
| `general.storefront` | `us` | 搜索或 URL 未指定地区时使用的默认地区 |
| `general.proxy` | 空 | 下载器使用的代理地址 |
| `general.media-user-token` | 空 | 电台下载需要自行填写的媒体用户令牌 |
| `media.alac-max` | `192000` | ALAC 采样率上限 |
| `media.atmos-max` | `2768` | Dolby Atmos 码率上限 |
| `media.aac-type` | `aac-lc` | AAC 格式选择 |
| `paths.alac / atmos / aac / mv` | `AM-Lossless / AM-Atmos / AM-AAC / AM-MV` | 各类型默认输出目录 |
| `metadata.lyrics.embed` | `true` | 将歌词嵌入音频 |
| `metadata.lyrics.save-file` | `false` | 默认不保存独立歌词文件 |
| `metadata.artwork.embed` | `true` | 将封面嵌入音频 |
| `convert.after-download` | `false` | 默认不在下载结束后转码 |

网页的「最高 192 kHz」档位使用配置中的默认 `media.alac-max`；如果修改了该值，实际下载上限以配置为准。网页的后端状态检测固定访问 `127.0.0.1:12340`，因此使用网页时建议保留默认后端地址与端口。

## 目录结构

以下是完整运行包及首次使用后常见的文件布局：

```text
applemusicdownloader/
├── amdl                         # macOS ARM64 下载引擎（Release）
├── config.example.yaml          # 配置模板（Git）
├── config.yaml                  # 个人配置，首次运行生成
├── login-wrapper.sh             # 交互式账号登录
├── start-wrapper.sh             # 启动 QEMU / wrapper 后端
├── run-amdl.sh                  # 命令行入口
├── start-gui.sh                 # 网页服务入口
├── gui/
│   ├── index.html               # 网页界面（Git）
│   ├── server.py                # Python 服务（Git）
│   └── settings.json            # 个人网页设置，保存后生成
├── wrapper-lite/
│   ├── wrapper-lite-qemu-local  # 本地启动器（Release）
│   └── qemu/
│       ├── vmlinuz-lite-qemu    # Linux 内核（Release）
│       ├── lite-initramfs.cpio.gz # 初始文件系统（Release）
│       ├── data-template.img    # 空白磁盘模板（Release）
│       └── data.img             # 个人登录磁盘，首次启动生成
├── gui-tmp/                     # 查询 / 下载临时配置
└── AM-*/                       # 默认下载目录
```

`config.yaml`、`gui/settings.json`、登录磁盘、临时目录和下载文件均被 `.gitignore` 排除。登录状态存储在个人磁盘中；登录过程中的凭据会暂时传给启动器，并写入权限受限的参数文件，脚本退出时会清理该文件。备份或分享时应单独处理这些个人文件。

## 源码与开发

```bash
git clone https://github.com/wangchuanao2008/applemusic-downloader.git
cd applemusic-downloader
```

仅修改网页或脚本时，可直接编辑 `gui/index.html`、`gui/server.py` 和根目录的 Shell 脚本。需要实际运行时，将 Release 中的以下文件复制到克隆目录的同名位置：

- 根目录的 `amdl`。
- `wrapper-lite/wrapper-lite-qemu-local`。
- `wrapper-lite/qemu/vmlinuz-lite-qemu`、`lite-initramfs.cpio.gz`、`data-template.img`。

然后按安装章节完成登录和启动即可。仓库不包含下载器的 Go 源码，也不包含本地启动器构建对应的 C++ 源码；上游源码入口见下文。

可进行轻量语法检查：

```bash
bash -n login-wrapper.sh start-wrapper.sh run-amdl.sh start-gui.sh
python3 -m py_compile gui/server.py
```

## 常见问题

| 现象 | 排查方式 |
| --- | --- |
| `未找到 QEMU` | 运行 `brew install qemu`，检查 `command -v qemu-system-x86_64` 是否有输出 |
| `./amdl` 或虚拟机资源不存在 | 确认下载了 Release 的完整运行包；源码压缩包不含这些运行文件 |
| `Permission denied` | 检查解压是否保留执行权限；必要时执行 `chmod +x ./*.sh ./amdl ./wrapper-lite/wrapper-lite-qemu-local` |
| 网页无法连接或直接打开 HTML 没有结果 | 在终端运行 `./start-gui.sh`，手动访问 `http://127.0.0.1:8890` |
| 网页显示「后端未运行」 | 在另一个终端运行 `./start-wrapper.sh`，等待初始化，并用 `/status` 检查 |
| 后端可连接，但地区显示 `-` 或 `regions: []` | 查看后端登录日志；停止后端后运行 `./login-wrapper.sh`，完成登录再启动 |
| 登录时提示先停止 wrapper | 在运行后端的终端按 `Ctrl+C`；登录与常驻服务使用同一个端口和个人磁盘 |
| `Address already in use` 或端口转发失败 | 检查 `lsof -nP -iTCP:8890 -sTCP:LISTEN`、`lsof -nP -iTCP:12340 -sTCP:LISTEN`，停止重复启动的服务 |
| 「已有任务在运行」 | 等待查询或下载结束，或点击「停止当前任务」后再提交；当前不支持并发任务 |
| 某一音质显示 `Not Available` | 该源内容未提供相应格式，可换其他可用档位；调高上限无法改变源内容 |
| 修改音质后文件没有变化 | 已有同名文件可能被跳过；把原文件移到其他目录后重试 |
| 自定义目录后「在 Finder 中显示」失败 | 当前只允许定位工具目录内文件；按下载结果的绝对路径手动打开外部目录 |

如果需要反馈问题，请提供运行包版本、Mac 芯片类型、操作步骤和相关错误日志。分享日志前移除 Apple ID、密码、验证码和令牌。

## 上游与许可

- 下载引擎：[zhaarey/apple-music-downloader](https://github.com/zhaarey/apple-music-downloader)，当前运行包包含 `amdl v0.1.0`。
- 后端：[WorldObservationLog/wrapper · lite 分支](https://github.com/WorldObservationLog/wrapper/tree/lite)。
- 第三方组件与许可说明：[THIRD_PARTY.md](THIRD_PARTY.md)。
- 当前发布说明：[RELEASE_NOTES.md](RELEASE_NOTES.md)。

第三方组件保留各自的权利与许可，随运行包保留已有的许可证和说明文件。
