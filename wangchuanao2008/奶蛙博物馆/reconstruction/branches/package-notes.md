# 分馆 HTML 封装说明

- `gallery.html`：原 3D 首展馆 HTML/CSS/app.js 与已采集的 Three.js vendor 完整内联；40件作品、步行、楼层、地图、涂鸦与声音按原逻辑保留。
- `town.html`：原小镇 app.js/town.js 使用本地 Rollup 合成 IIFE；Lucide 内联。居民、旅行、属性、制作、装饰、相册与存档沿用原规则。图片加载补充 `crossOrigin="anonymous"`，以允许本地跨域合成与导出照片。
- `tower.html`：原构建 CSS/JS 完整内联；`美术资源.json` 内嵌为同内容配置，免除本地 JSON fetch。战斗、地图、卡组、营地与存档保持原逻辑。
- `survivor.html`：原 Three.js 0.160.0（原公开 importmap URL）与游戏模块由本地 Rollup 合成 IIFE；原游戏内音乐、笑声已经是 data URL，保留内嵌。

四馆均不含登录、Neta SDK、账号鉴权、统计脚本或 Neta 外跳；原资源引用转换为对应 `inner.url` 的公开绝对 URL，脚本无需外部服务器。普通媒体与 gallery 的原 Google 字体需要联网；survivor 全部资源已内嵌。

右上返回按钮在 iframe 中发送 `parent.postMessage({type:'mfm:return'}, '*')`。直接打开分馆时返回相对本地入口 `../奶蛙博物馆.html`（以 `window.location.href` 为基准解析）。

验证：通过 HTML parser 提取全部脚本，逐个 `node --check` 成功；四馆外部 `<script src>` 数量为0；不存在 Neta/login/SDK 引用。公开小镇背景资源针对 `Origin: null` 返回200及 `Access-Control-Allow-Origin: *`。本次分工未操作浏览器，画面与交互由主任务统一验证。
