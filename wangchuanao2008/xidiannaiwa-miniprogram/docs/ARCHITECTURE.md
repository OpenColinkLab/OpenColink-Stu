# 架构与移植决策

## 页面和状态

首页 → 校徽文章，或首页 → 展馆 → 作品详情。采用原生 WXML/WXSS 和 Page 数据绑定，WebView 渲染，不启用 Skyline，不引入 UI 库。浏览器 `document`、`dialog`、Hash 路由、Swiper 库分别替换为原生组件、独立页面、页面栈和内置 swiper。

展馆 Page 保存 gallery / era / query / page；进入详情使用 navigateTo，返回 navigateBack 保留原页面及滚动位置。无上级页面时，页内返回按钮 redirectTo 到首页或带上下文的展馆。系统导航栏的直接入口行为由微信控制。

详情路由以稳定 ID 为核心：`/pages/artwork/index?id=work-103&gallery=main&era=all&query=...`。`services/catalog.js` 统一校验参数，未知 ID 显示空态；不匹配的筛选上下文回退到作品所属展馆。上一件/下一件在筛选后的完整结果中循环，不局限于单个列表分页。分享使用当前显示作品的 ID，因此翻到下一件再分享仍能定位正确作品。

搜索最多 100 字，输入后防抖 180ms；切换展馆清空关键词和展厅，切换筛选回到第一页；清空/确认搜索立即刷新。快速输入期间点卡片以实际已显示列表的上下文为准。navigateTo/分享参数统一编码一次，在页面 onLoad 调用 routeOptions 解码一次；内部 filterWorks/contextOf 不再解码，避免破坏包含百分号的原始搜索词。

## 数据与图片

`content/catalog.json` → `scripts/sync-catalog.mjs` → `miniprogram/data/catalog.js`。原始 JSON 是编辑源，JS 模块是随包运行数据。页面只把当前页展示字段送入 setData；完整目录在逻辑层由模块共享。

图片 URL 由统一配置拼接，馆藏路径必须是 `museum/artworks/文件名` 或 `museum/thumbnails/文件名`。没有远程目录 API、云函数、数据库和自动同步任务。可在普通对象存储或现有 Nginx 托管。

首页校徽、轮播、新闻封面本地可用；列表图支持懒加载及重试；详情以缩略图过渡到原图，失败保留缩略图并显示重试。高清预览一次打开当前作品，不预下载全部 149 件原图。

## 模块边界与后续扩展

- `services/catalog.js` 只处理纯数据，不能调用 wx API。
- `utils/assets.js` 只拼资源路径，不访问网络。
- 页面负责 wx 导航、分享、预览和显示状态。
- 自定义组件仅负责列表图片及失败状态。
- `scripts/` 是电脑端 Node 工具，不能被小程序 require。

如未来需要动态更新目录，可替换数据读取层并增加缓存/版本管理。届时应新增网络失败测试，并配置 request 域名；无需为现在的静态目录预先部署后端。

## 原模板处理

迁移前目标目录是微信云开发 QuickStart。活动项目不再包含 cloudfunctions、envList、示例页、云开发图片或上传脚本，project.config.json 也不声明云函数目录。原文件存入本机 `.migration-backup/`，Git 忽略；新维护者不需要获得该备份或原环境权限。
