# 联网媒体版的资源来源

来源快照日期：2026-10-13。本文件描述本项目保留的原站公开 URL，不表示这些服务器由本项目维护，也不保证它们永久可访问。

联网媒体版已经内嵌主馆和五个分馆的页面代码及浏览器依赖。外部图片、音视频和字体仍按原始 URL 加载；身份、收藏和留言等交互保存在本机，不调用原站登录或付费接口。

## 原站与各分馆版本目录

原站入口：[奶蛙博物馆](https://neta.art/w/yizhizhi/naiwa/milk-frog-museum)。媒体路径包含作品 ID 与发布版本，不是 GitHub 仓库中的相对资源路径。

| 应用 | 原始发布物的资源根目录 |
| --- | --- |
| 主馆 | `https://works.cohub.live/w/157e937b-95da-4c17-add4-f916e37c3574/milk-frog-museum/2c0b53941f17/content/` |
| 3D 展馆 | `https://works.cohub.live/w/157e937b-95da-4c17-add4-f916e37c3574/milk-frog-3d-gallery/ba518f92d4d0/content/` |
| 奶蛙小镇 | `https://works.cohub.live/w/d8386a89-4a09-4470-9b8a-5bebf98572b0/naiwa-town/502d979a5c76/content/` |
| 奶蛙尖塔 | `https://works.cohub.live/w/a3c46aa6-ce65-4cf7-9d69-3d564bdb7f5a/milk-frog-spire/bae45df10a91/content/` |
| 奶蛙制造所 | `https://works.cohub.live/w/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog/8c27a0f17a88/content/` |
| 奶龙幸存者 | 主要视觉为代码几何体；原页面中的音乐和笑声已内嵌为 Base64，战斗音效由 Web Audio 合成 |

主馆的部分馆藏、封面、角色参考图和手机视频另使用 `https://router-files.neta.art/files/…`。每个作品对应的完整 URL 见 [馆藏清单](../analysis/evidence/catalog-inventory.json)。

## 制造所部件库

制造所的头像部件来自公开库：

```text
https://public.cohub.live/p/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog-assets/…
```

其中的版本目录包含表情、发型、眼镜、头饰、衣物、握持物、细节和其它装饰。完整映射见 [assets.json](../reconstruction/factory/assets.json)，风格参考图见 [styles.json](../reconstruction/factory/styles.json)。本机 Canvas 读取这些图片后进行图层合成；本项目不上传用户参考图。

## 音视频

- 主馆的手机入口影像来自 `router-files.neta.art` 的 MP4，桌面入口及备用资源也保留 `works.cohub.live` 的原始地址。
- 主馆环境音乐及声音文件位于主馆 `content/assets/audio/`；3D 展馆音乐位于其 `content/assets/`。
- 尖塔的两首背景音乐为其 `content/assets/登塔.m4a` 和 `content/assets/决战.m4a`。
- 幸存者的既有 Base64 声音不需要外部下载；制造所生成的 WebM 与 GIF 是本机 Canvas 和编码器的输出。

逐项地址可在 [offline/manifest.json](../offline/manifest.json) 中按 `.mp3`、`.mp4`、`.m4a` 查询；每条记录说明由哪些分馆使用。

## 字体

联网版的 Google Fonts CSS 与字体分片由 `fonts.googleapis.com` 和 `fonts.gstatic.com` 提供。使用的字体族包括 Cormorant Garamond、Jost、Noto Serif SC、Noto Sans SC、Source Sans 3；制造所另有原版本目录中的 Nunito 字体文件。

完整 CSS 地址见 [font-css.json](../offline/font-css.json)，222 个 WOFF2 分片 URL 和摘要见 [fonts.json](../offline/fonts.json)。原 CSS 快照保留在 [offline/fonts](../offline/fonts/)。

## 追溯与可用性

本项目保留了四种记录：馆藏清单说明作品对应图片；制造所映射说明部件对应图片；全站资源清单说明资源被哪些分馆使用；解码与打包验证记录保存字节数和摘要。它们可以用来追溯原始来源，而非仅凭文件名推测。

联网版需要设备连接到上述 CDN。原站资源被移除、CDN 限制访问、CORS 或浏览器策略发生变化时，显示或画布导出可能受到影响。没有为这些外部服务建立镜像服务器，也不会在失败后悄悄上传文件到其它平台。

本机曾生成并验证完整离线版本，将这些资源写入单个 HTML。按照当前发布范围，该大文件未上传 GitHub；仓库只包含联网版压缩快照、源码、打包工具、资源来源与验证证据。
