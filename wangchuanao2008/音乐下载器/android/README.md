# 网易云音乐下载器 · Android 1.2.1

[历史发布的 APK](https://github.com/wangchuanao2008/netease-music-downloader/releases)。包名 `com.musicdown.netease`，versionName 来自根目录 VERSION，versionCode 为 `major*10000+minor*100+patch`，当前 10201。最低 Android 8.0（API 26），目标 API 35。音频库支持 arm64-v8a 与 x86_64。

粘贴/分享网易云单曲链接、短链或多条分享文字。先解析歌曲、封面和音质目录，再选择音质并下载，可点击“下载全部已选音质”。点击登录直接进入官方登录页，页面适配窄屏；扫码及安全验证后校验并保存会话，使用 Android Keystore AES-GCM 加密；应用数据不参与云备份。保存使用系统文件夹选择器，不申请广泛存储权限。

与桌面版一致地支持账号音质、指定档位拒绝降级、试听/传输截断校验、网易云公开来源回退和独立备用音源、取消/重试及重复下载记录。从 1.2.0 开始内置 FFmpeg/FFprobe，检测真实编码、采样率、位深、声道数；支持 MP3 转换以及 MP3/FLAC/M4A 的歌曲、歌手、专辑和封面标签。MP4 仅修改元数据并调整分块偏移，不改变媒体数据，支持无法解码的 AV3A 原样保留。

杜比请求仅接受 AC-3/E-AC-3，不证明带有 Atmos 元数据。AV3A 检查容器时长和音频包完整性并显示“未验证解码”，不能转换为 MP3。其他格式转 MP3 后为有损音频，不能保留空间混音属性。后台下载受系统进程管理影响，进程结束后需要重新打开并重试。

界面按系统状态栏、导航栏、刘海和键盘的实际 inset 留出空间，避免顶部标题与状态栏重叠。备用音源在音质菜单中与官方档位并列，选择后直接查询 GD Studio，不携带网易云登录会话，也不承诺固定音质。

## 构建和验证

Java 17、AGP 8.5.2、Gradle 8.7、Android SDK 35：

```sh
cd android
./build_android.sh
# 连接 arm64/x86_64 Android 设备或启动模拟器后运行原生音频测试：
./gradlew :app:connectedDebugAndroidTest
```

输出 `../dist/netease-music-downloader-android-v1.2.1.apk`。脚本执行 clean、lint、单元测试和 Release 构建，检查与本地旧 APK 相同的签名，保护覆盖安装。无基线时可设置 BASELINE_APK 为已有同证书安装包。当前使用开发证书侧载签名，证书 SHA-256：`acc56f5c827230bf24a783e215919cb09db65c75c32d5816bd0139af3f0ef781`。

新增原生测试覆盖 FLAC 封面标签、MP3 转换、MP4 元数据及媒体字节保留、E-AC-3 检测、AV3A 合成容器和截断拒绝。验证范围见 [发布记录](../docs/release-1.2.1.md)。音频库、许可与对应源代码位置见 [第三方说明](../docs/third-party-audio.md)。

本次按用户要求使用 `MUSICDOWN_SKIP_TESTS=1 ./build_android.sh` 仅构建，未进行 Android 验收、JVM 单元测试或原生音频设备测试。
