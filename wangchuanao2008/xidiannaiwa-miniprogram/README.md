# 奶蛙电子科技大学 · 微信小程序

> 本 OpenColink-Stu 源码副本按维护者要求省略了部分图片，保留上传时已经完成的图片及小型矢量图标。需要完整本地图片时，请向维护者取得原项目图片目录；图片相关检查应在资源恢复后执行。

由奶蛙大学静态网站迁移的**微信原生小程序**，包含校园首页、校徽发布文章、奶蛙博物馆和作品详情。现有 149 件馆藏、2 个展馆、22 个主题展厅，支持关键词搜索、展厅筛选、每页 24 件作品、上一件/下一件、高清图预览及分享直达。

页面使用 WXML / WXSS / JavaScript，不使用 Vue、React、uni-app、Taro 或网页套壳。**运行无需云开发、云函数、数据库、登录和第三方 npm 包。** 原型工程的云开发 QuickStart 已退出活动代码。

## 依赖与环境

| 项目 | 要求 | 是否必需 |
| --- | --- | --- |
| 微信开发者工具 | 安装当前稳定版；项目最低基础库基线 2.20.1，使用 WebView 渲染 | 开发、预览及发布必需 |
| 小程序 AppID | 当前配置为维护者的真实 AppID；接手者需换自己的 AppID | 正式联调与发布必需 |
| Node.js | **22.12.0 或以上**，脚本使用 Node 内置模块和内置测试运行器 | 图片服务、检查和数据同步必需 |
| npm | 随 Node.js 安装 | 作为脚本入口；根目录没有 npm 依赖 |
| 线上图片存储 | 由维护者自有 Ubuntu/Nginx 提供的公开 HTTPS 图片服务 | 真机及正式运行必需 |
| 云开发、数据库、AppSecret | 当前功能不使用 | 不需要 |
| Playwright Core + Chromium | 只用于重新导出两张轮播图，单独锁定在 `tools/banner-export/` | 可选；普通开发不需要 |

当前默认图片地址为 `https://123.207.179.245/miniprogram-assets`，由维护者自己的服务器提供。没有云存储套餐或云环境依赖。IP HTTPS 使用公开信任的 IP 证书；微信 request/downloadFile 合法域名不能填写 IP，后续增加这类 API 时应接入合规域名，当前图片显示/预览需在目标手机验收。

服务器部署脚本额外需要电脑端 OpenSSH（ssh/scp）、rsync；服务器需 Python 3、rsync、Nginx 与非交互 sudo 权限；证书工具使用独立 Python 环境，依赖快照位于 `deploy/certbot-requirements.txt`。这些仅用于部署，不进入小程序。

无需执行“构建 npm”或上传云函数。根目录 `npm ci` 可执行，但不会安装第三方包。可选图片导出工具的依赖与前端、常规测试完全分开。

## 五分钟本地启动

1. 克隆仓库并进入本项目目录。**本副本仅含部分馆藏图片**；完整资源集约 254 MiB。完全本机运行及资源完整性检查需要先恢复 `assets/museum/` 和 `assets/source/` 中缺少的文件。默认公网图片地址仍按下方配置使用，其可用性取决于资源服务。
2. 默认使用已配置的公网图片服务。需要完全离线本机联调时，先运行 `npm run assets:configure -- --url http://127.0.0.1:5174`，再确认 `node --version` ≥ 22.12.0 并运行：

   ```sh
   npm run check
   npm test
   npm run assets:serve
   ```

   图片服务默认监听 `http://127.0.0.1:5174`。在浏览器打开 `http://127.0.0.1:5174/museum/thumbnails/work-103.jpg` 确认图片可用。服务只提供馆藏图片，不会公开源码。
3. 微信开发者工具**导入仓库根目录**（其中包含 `project.config.json`），不要只导入 `miniprogram/`。无自己的 AppID 时使用测试号/游客体验入口；若工具要求登录或 AppID，按工具提示选择自己的测试号。
4. 开发者工具的“详情 → 本地设置”中，仅为本机 HTTP 联调勾选“不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书”。配置文件仍默认开启 `urlCheck`；该开发选项不会授予正式环境的域名权限。
5. 编译。首页轮播、校徽及新闻封面随代码包提供；展馆图片通过本地服务读取。保持上述服务终端运行。

图片配置在 `miniprogram/config/assets.js`。本机 HTTP 配置会被发布检查拒绝；切回公网执行 `npm run assets:configure -- --url https://123.207.179.245/miniprogram-assets`，随后重新编译并上传。

## 真机与发布

2026-10-20 已验证公网 HTTPS 的 JPG/WebP 返回200，TLS 证书校验通过，免费证书自动续期演练成功；详见 [验证记录](docs/VALIDATION.md)。手机需重新编译、上传并设置体验版后验收，旧体验版不会自动更换图片地址。

服务器目录、端口、路由和免费 IP 证书续期方式见 [当前服务器架构](docs/SERVER_ARCHITECTURE.md)。若公网 HTTPS 连接超时，检查云平台安全组/实例防火墙是否放行 TCP443；服务器本机 HTTPS 成功不能替代公网验证。


当前部署直接使用自有服务器的 IP HTTPS。若改用域名，替换图片基地址并按微信平台要求配置。**手机上的 `127.0.0.1` 指手机本身，不是电脑**。仅做局域网调试可用 `HOST=0.0.0.0 npm run assets:serve`，将图片配置改为电脑局域网 IP，并在真机调试模式中确认相关校验设置；这不属于正式发布方案。

部署到现有服务器可运行 `npm run assets:deploy -- --host ubuntu`，SSH 别名由本机 ~/.ssh/config 配置；新接手者替换为自己的 SSH 主机。此命令校验所有图片、创建版本目录并原子切换 current，不改变 Nginx/证书。初次服务器配置与架构见 [部署文档](docs/DEPLOYMENT.md)。

正式发布步骤：

1. 将 `assets/museum/` 上传到静态存储。若配置 `baseUrl: 'https://static.your-domain.cn/naiwa'`，必须能直接访问 `https://static.your-domain.cn/naiwa/museum/thumbnails/work-103.jpg`，原图同理。URL 基地址不要重复添加 `/museum`。
2. 在 `miniprogram/config/assets.js` 填入自己的 HTTPS 基地址，在 `project.config.json` 填入自己的 AppID（AppID 是公开标识；不要写入 AppSecret、上传密钥或访问令牌）。
3. 确认证书受手机信任。IP 证书不等于微信合法域名：若使用 wx.downloadFile/getImageInfo 等需域名能力，应提供合规域名并配置对应白名单；若新增远程 JSON 请求，还需配置 request 合法域名。当前只用 image 与 wx.previewImage，需实际手机确认，不宣称通过域名白名单。
4. 运行 `npm run catalog:sync`（改过数据时）、`npm run check`、`npm test`、`npm run check:release`。发布检查只校验本地配置和文件，不会替你验证线上域名、审核资质或访问权限。
5. 在开发者工具中检查实际上传包与依赖分析；在 iOS / Android 真机确认图片、预览、搜索、返回、分享直达和弱网重试，再上传、提交审核和发布。

服务器/CDN 必须允许微信客户端公开读取图片，返回正确 MIME 类型，避免依赖 Cookie、登录、Referer 白名单或短期签名链接。121 张原图是 WebP，请在目标设备验证；若需改为 JPEG，可替换图片后更新清单路径。无需将全量图片放进小程序包。

## 目录与维护入口

```text
miniprogram/                  唯一小程序上传根目录
  app.js / app.json / app.wxss 应用配置与公共样式
  assets/                     随包校徽、两张轮播图、展馆封面
  config/assets.js            图片服务基地址（开发与上线切换处）
  data/catalog.js             自动生成的数据模块，不手工改
  services/catalog.js         搜索、排序、筛选、分页及路由上下文
  utils/                      图片 URL 与返回导航
  components/image-view/      列表图与加载失败重试
  pages/index/                校园首页
  pages/emblem/               校徽文章
  pages/museum/               展馆与列表
  pages/artwork/              作品详情、高清预览及分享
content/catalog.json          馆藏数据唯一编辑源
assets/museum/artworks/        高清图；进 Git、进资源服务器，不进小程序包
assets/museum/thumbnails/      缩略图；进 Git、进资源服务器，不进小程序包
assets/source/                两张最终合成 SVG，保留编辑和重导出能力
scripts/                      Node 内置模块实现的维护脚本
tests/                       数据、页面逻辑、图片 HTTP 服务测试
tools/banner-export/         可选轮播导出工具及独立依赖锁文件
docs/                        架构、维护、部署、验证与素材说明
project.config.json           团队共享的开发者工具配置
project.private.config.json   本机个人配置，Git 忽略
```

常见修改：

- **改文字和样式**：对应 `pages/*/index.wxml` 与 `.wxss`。首页馆藏数量文案目前是静态新闻文案，增减馆藏后同步更新。
- **新增/修改馆藏**：编辑 `content/catalog.json`，补齐 `assets/museum/` 图片，运行 `npm run catalog:sync` 和检查。详见 [维护指南](docs/MAINTENANCE.md)。
- **改图片域名**：只改 `miniprogram/config/assets.js`，保持目录结构不变；HTTPS 资源不要指向电脑本机地址。
- **换轮播图**：直接替换随包 JPG；如需保留现有合成效果重导出，见 [维护指南](docs/MAINTENANCE.md)。
- **添加用户系统等功能**：当前无相应后端，需另行设计。不要恢复模板云调用作为隐含依赖。

## 检查与已知边界

`npm run check` 检查 JS 语法、页面/组件文件、数据同步、图片文件、馆藏数量和源代码体积（工程预算 < 1.5 MiB）。`npm test` 使用 Node 内置测试，不要求网络、微信登录或浏览器；HTTP 服务测试需要允许监听本机端口。

这些检查不等同于微信运行时验收。WXML/WXSS 可使用本机微信编译器进一步验证，详见 [测试指南](docs/TESTING.md)。真机视觉、分享入口和网络行为仍需开发者工具及手机验证；本仓库不包含虚构的真机通过记录。

- 新增独立四页替代网页弹窗/Hash 路由。普通返回保留展馆实例和筛选；分享直达详情会按作品 ID 恢复数据，返回按钮可回展馆。
- 首次启动不拉取全部馆藏图片；列表每页 24 件并懒加载，详情使用缩略图过渡再显示原图。原图最大约 5 MiB，网络与流量成本取决于访问量。
- 目前不自动更新线上馆藏数据；修改后需同步生成模块并发布小程序，资源文件另行部署。
- 未内置统计、支付、用户信息采集或云环境初始化。

## 常见问题

- **首页正常、展馆图片不出现**：确认图片服务在运行，baseUrl 与服务端口匹配；本机 HTTP 仅用于开发联调，正式图片地址必须使用 HTTPS。
- **端口 5174 已被占用**：复用已经启动的本项目图片服务，或执行 `PORT=5175 npm run assets:serve` 并相应修改 baseUrl。
- **模拟器提示 HTTP 升级 HTTPS**：本地联调可能出现该提示；上线前替换真实 HTTPS 地址，不能靠开发设置解决正式访问问题。
- **基础库或游客 API 告警**：本机个人配置可覆盖共享基础库版本。优先用稳定基础库及自己的 AppID 复测；游客模式只验证本地展示和逻辑，不能证明分享、账号能力或真机权限正常。

## GitHub 与交接

`.github/workflows/check.yml` 会在 push / pull request 时用 Node.js 22 与 24 执行检查及测试，无需云端凭证或第三方 npm 安装。CI 不访问生产服务器，不运行需要部署配置的 `check:release`。

原项目资源目录采用普通 Git，不依赖 Git LFS；本副本按维护者要求只保留部分图片，当前保留的单个资源小于 6 MiB。请提交根锁文件和可选工具锁文件，勿提交 `node_modules/`、`.env`、私钥、`project.private.config.json` 或 `.migration-backup/`。原工程的本机备份只在迁移机器保留，不是新工程运行依赖。

代码迁移并不自动赋予所有图片和原作的再分发权。发布公开仓库前，应由维护者核实素材来源及授权；本工程未擅自为既有图片指定开源许可证。详见 [素材说明](docs/ASSETS.md)。

接手者先读本文件，再读 [架构](docs/ARCHITECTURE.md)、[维护](docs/MAINTENANCE.md)、[测试](docs/TESTING.md) 和 [部署](docs/DEPLOYMENT.md)。所有开发所需内容均在仓库中，不依赖原网站所在路径。

参考：[微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/) · [图片预览](https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.previewImage.html) · [网络配置](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)
