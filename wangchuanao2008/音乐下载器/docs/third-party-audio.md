# Android 音频组件

使用 Maven Central 的 `dev.ffmpegkit-maintained:ffmpeg-kit-audio:8.1.7`（FFmpeg 8.1.2，非 GPL 扩展的 audio 变体），动态链接原生库。未修改库源码。FFmpegKit 的 Java 接口来自 Arthenica，维护分支为 [ffmpegkit-maintained/ffmpeg](https://github.com/ffmpegkit-maintained/ffmpeg)。对应版本源代码和构建脚本见该仓库版本标签/发布及 [Android audio 包目录](https://repo.maven.apache.org/maven2/dev/ffmpegkit-maintained/ffmpeg-kit-audio/8.1.7/)。库许可为 LGPL-3.0，并包含 LAME、Opus 等组件的各自许可。

原生库 AAR 自带的许可文本保存在 [licenses/](licenses/)，APK 也包含同名 raw 资源。FFmpegKit 上游旧的 source.txt 链接指向 Arthenica；当前实际维护代码应使用上面的维护分支。需要重新链接或修改库时，可用维护分支构建替代 AAR，再重建此应用；应用当前不启用混淆。

运行时异常组件 `com.arthenica:smart-exception-java:0.2.1` 和 `smart-exception-common:0.2.1` 使用 BSD-3-Clause，源代码为 [tanersener/smart-exception](https://github.com/tanersener/smart-exception)。本项目的依赖声明明确包含它，避免 audio 8.1.7 POM 缺失依赖造成的运行时错误。
