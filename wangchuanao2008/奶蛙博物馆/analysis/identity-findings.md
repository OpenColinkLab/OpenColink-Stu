# 身份、鉴定、互动、意见箱专项静态分析

本报告仅读取抓取的 `analysis/evidence/site/app.js`、`identity-runtime.bundle.js`、`index.html`，没有执行页面、提交意见、登录、点赞或评论。观察=源码直接证据；推断=据调用关系得出的行为；未知=静态证据不足。下文行号都是原始文件行号；bundle 的业务逻辑被压缩在第 66、77 行，同时给出函数名以便检索。

## 1. 身份相关界面和完整流程

| 功能 | 实现与证据 | 证据性质 / 边界 |
|---|---|---|
| 进入鉴定所 | 顶部 `giftToggle`、菜单 `data-drawer-action="quiz"` 打开同一 `.quiz`；`app.js:1295`、`1406`、`1465`、`2093`；HTML `401–474` | 观察：intro → questions → loading → result 的四阶段弹窗；无导航 URL。 |
| 四道问答 | `QUESTIONS` 含四题、每题四选项；点击将选项序号 push 到 `answers` 然后 next。`app.js:1299–1308,1416–1440` | 观察：问答答案存于闭包数组，无网络提交。 |
| 生成结果 | `analyse()` 随机挑 FROGS、避开上一只、随机编号稀有度评语；1700 ms 后显示。`app.js:1442–1451` | 观察：答案没有参与结果计算。推断：这是随机娱乐测试，不是按题目评分的性格测试；30 秒文案不是服务端处理时间。 |
| 发出结果事件 | `fillResult()` 填字段，发送 `mfm:quiz-result`，detail 有 name/no/rare/habitat/img/comment。`app.js:1456–1463` | 观察：两份脚本通过 DOM 和 CustomEvent 衔接。 |
| 昵称与头像 | HTML `448–463`：昵称 `maxlength=24`；bundle `77` `PP/OP`：8 个预置头像 + Studio 头像选项 | 观察：数组含 16 个头像名，但 `Rt=8` 并 `slice(0,Rt)`，实际仅前 8 个开放。不存在源码证据表明后 8 个可赚积分解锁。 |
| Studio 头像 | `PP()` 先 `Ba(...,"custom")` 再 `users.getProfiles`，使用 `avatarUrl`；无头像时提示去 Studio 设置。bundle `77` | 观察：所谓自定义头像是 Studio 账号头像，不是本地上传裁剪器。 |
| 签发身份证 | `TP()` 先登录，生成/沿用 ID-四位数、昵称、头像、签发日期；保存鉴定结果；关闭弹窗打开个人页。bundle `77` | 观察：随机数范围 1000–9999，无服务端唯一 ID 签发调用；日期用 UTC `toISOString().slice(0,10)`。推断：身份证编号只是前端展示号，Studio UUID 才是账号标识。 |
| 登录期间阻止关闭 | `Ba(...,"identity")` 置 `Ja`，捕获阶段阻断关闭按钮、背景、Escape；未完成身份时生效。bundle `66` `Ba`、`77` `Yp` 后事件 | 观察：鉴定问答本身可以关闭；登录签发阶段存在强制保留弹窗的处理。未知：异常 catch 路径没有明确 `Yp(false)`，可能使未签发时关闭持续受阻。 |
| 个人页 | `qa/Va` 显示身份、Studio ID、收藏数量、鉴定卡、收藏、互动，body 加 `profile-view`；HTML `165–205`；bundle `66–77` | 观察：个人页是同一 DOM 内的 hidden main，未建立独立路由。无身份点击个人入口会转鉴定。 |
| 改昵称 / 再鉴定 | `SP` prompt 截到 24 字并保存；`Ab` 在 >720 px 打开重新鉴定，在 ≤720 px 改文案为“鉴定卡”并打开卡片模态。bundle `77` | 观察：移动端同一按钮的实际功能不同；不是重新答题。改昵称无需再次登录调用。 |
| 收藏 / 取消收藏 | `FP` 登录并要求本地身份，然后按作品名称切换 favorites；存 name/url；详情更新按钮。bundle `77`；HTML `383` | 观察：收藏为本地数据，不向社交 JSON 写收藏。列表点击找到 `.card[data-work-name]` 再打开原有详情，关详情可返回个人页。 |
| 我的互动 | `rm` 遍历已加载公共社交数据，显示当前 UUID 或匿名 ID 的喜欢、当前 UUID 评论；最多 8 件喜欢和最新 6 条评论。bundle `77`；HTML `192–194` | 观察：显示数量可大于实际显示条目数；没有积分总计。 |
| 退出奶蛙身份 | `VP` 第二次点击确认，4200 ms 后取消确认；删当前身份 key 和基础身份 key，清内存身份、鉴定、收藏。bundle `77`；HTML `196–198` | 观察：不注销 Studio，不删除公共评论/喜欢，不删除匿名喜欢 ID、身份目录或 SDK token/grants。 |

## 2. 鉴定资源与随机逻辑

- **观察**：`FROGS` 实际有 `assets/quiz/f01.jpg` 到 `f30.jpg` 共 30 项（`app.js:1311–1363`）；开头“12 只”的注释已经过时。每项至少含图、名字、出没地点；前 12 项预设了编号、星级、3 条评语，后 18 项只配 signature，但运行时会随机重写编号和星级。
- **观察**：`randNo()`：55% 概率前缀 N，否则从 `ABCDEFGHJKLMNPRSTWXYZ` 均匀选，数字 0001–9999。`randRare()`：5 星 12%、4 星 38%、3 星 50%。评语取该蛙首句或 sig，另从 24 句共享池洗牌取 2 句；不做跨 signature 去重。`app.js:1366–1382,1442–1449`。
- **观察**：原始 `saveCard()` 能 canvas 合成宽 1080 px、按文字/图片算高度的 PNG，分日夜配色，下载名“奶蛙鉴定-编号.png”（`app.js:1477–1559`）。但是 module 脚本的 `quizPrimary` 捕获监听在 act=save 时 stopImmediatePropagation，改执行 `TP()`（bundle `77`）；HTML 按钮文案也被运行时改为“进入博物馆”（`app.js:1398`）。
- **推断**：在 identity runtime 正常加载的当前版本，原有 PNG 下载代码属于保留实现，结果主按钮走领取身份而非保存图片。**未知**：模块失败时的降级实际运行表现、是否有另处导出入口；限定三份源码未见其它保存卡按钮。

## 3. 数据模型与存储位置

| Key / 文件 | 内容、访问 | 原始证据 |
|---|---|---|
| `mfm-visitor-identity-v2` | 初始基础 localStorage key，`A={identity:null,spec:null,favorites:[]}` | bundle `66` `ja/Wn/Cb/Hn` |
| `mfm-visitor-identity-v2:<userUuid>` | 登录 UUID 后切换分区 key；存身份、鉴定卡、收藏；若目标分区无身份而之前内存有身份，则整体沿用并存入新 key | bundle `66` `Wp` |
| `mfm-anonymous-like-id-v1` | localStorage 匿名点赞 ID，`anon-<randomUUID>` 或时间+随机；存储异常回退 `anon-session` | bundle `66` `Sb/Ma` |
| `mfm-identity-directory-v1` | 本设备 userUuid → name/avatarIndex/customAvatar/updatedAt 的昵称头像目录，评论渲染时优先于平台 profile | bundle `77` `Lb/UP/Mb/RP` |
| `cohub:app-token:1bbf7fb7-8920-45af-8481-27f4dfc7e692` | SDK 保存 app 访问 token 的 localStorage key；无需读取任何真实 token 即可从生成逻辑确定 | bundle `66` `nb/lP/ensureStorageKeys/readStoredToken/writeStoredToken` |
| `cohub:app-auth-grants:1bbf7fb7-8920-45af-8481-27f4dfc7e692` | SDK 保存 space/scopes 授权 grant 数组 | bundle `66` `ib/lP/readStoredGrants/writeStoredGrants` |
| `data/milk-frog-social-v1.json` | Cohub homeSpace 或 currentSpace 内的公共互动文件；`{version:1,works:{[workName]:{likes:[],comments:[]}}}` | bundle `66` `Kp/Wp`、`77` `CP/Ub/Yn/Xp/Fa` |

**观察**：身份字段为 `name,no,avatarIndex,customAvatar,issued`；鉴定 `spec` 为 `name,no,rare,habitat,img,comment`；收藏仅 `name,url`（bundle `77` `TP/EP/jb/FP`）。本地状态迁移 `Nb` 会将非 ID- 身份编号归整为 ID-展示号，并在无 spec 时将旧身份复制到 spec（bundle `66`）。**推断**：没有观察到跨设备同步身份证/收藏的接口。用户从 A 账号切到未建身份的 B 账号时，`Wp` 的整体内存沿用分支可能复制 A 的本地资料到 B；这是一项源码边界，不代表已实际测试。

## 4. 网络与认证

下表只列与本站业务调用关系明确的通道。bundle 内还打包了 channels、billing、generation、desktop 等通用 SDK API，单凭它们存在不能认定博物馆使用。

| 通道 | 用途 | 证据、性质 |
|---|---|---|
| `https://api.cohub.live` | SDK prod API base；Bearer token；401 时刷新重试 | bundle `1` `Qn/Ya`，业务 `66,77` 创建 prod SDK；观察 |
| `POST /api/users/profiles/batch` | 读取本人 Studio 昵称/头像、评论者资料；body `userUuids`；SDK 限制最多 100 个唯一 UUID | bundle `66` `Rv.getProfiles`、`Wp`，`77` `PP/LP`；观察 |
| `GET /api/spaces/<spaceId>/fs/file?path=data%2Fmilk-frog-social-v1.json` | 读取公共点赞/评论文件，返回 content/mtimeMs/size | bundle `63` `Ux.read`、`77` `Xp/Fa`；观察 |
| `PUT /api/spaces/<spaceId>/fs/file` | 将整个社交 JSON 写回；含 path/content/encoding/expected `{mtimeMs,size}`/mutationId | bundle `63` `Ux.write`、`77` `Fa`；观察 |
| iframe 父窗口 `postMessage` | `cohub.app.context`、`cohub.app.authorize`、token、context changed；桥接模式 | bundle `66` `Vn/pP/lP`；观察；运行时是否有授权未知 |
| `https://cohub.live/app-auth?app=<appId>&origin=<origin>` | 非 iframe 时的 popup 授权 broker，480×640；校验 source/origin/requestId，120 秒 timeout | bundle `66` `cP`；观察；真实登录路径依赖 Studio 外壳 |
| `https://formsubmit.co/1610636536@qq.com` | 意见箱 multipart 表单直投邮箱 | HTML `131–140`；观察；未进行真实投稿 |

**观察**：本站 `Ba` 请求的 scope 仅 `user.space.list`，原因文本随签发/头像/收藏/评论变化；已有 `Pr.viewer.userUuid` 就直接视为登录（bundle `66`）。不知道平台是否通过 app/viewer scopes 赋予公共文件读写，不应把声明的 scope 当作写成功证明。业务社交请求包裹 6000 ms `Promise.race` timeout；该超时没有取消底层请求，超时后的实际服务端写入结果未知（bundle `77` `Tr/Fa`）。

**推断（适用条件）**：独立资源页的 broker `context` stub 返回 app/space/permissions，没有 viewer，而业务 `$e()` 只认 viewer.userUuid。因此独立打开资源页可能无法完成身份读取；Neta 外壳 iframe 则由 parent bridge 返回真实 context。此项需运行证据验证，不等于目标正常外壳必然失效（bundle `66` `cP.request/pP/$e/Ba`）。

## 5. 点赞、评论、删除、举报限制

- **观察**：喜欢 `MP()` 不走 `Ba()`，使用 `Ma()` 匿名 ID 切换 likes；已登录也走匿名浏览器 ID。收藏 `FP()` 和评论/删除/举报 `nm()` 则要求 Studio UUID 和本地身份（bundle `77`）。**推断**：喜欢无需业务登录流程，但能否写入取决于空间运行时和服务端权限。
- **观察**：评论 trim 后不得空，≤240 个 JS 字符；HTML 也有 `maxlength=240`。全馆同一 userUuid 15 秒内只能评论一次；每件作品最多 100 条未 removed 评论；创建 id 用 randomUUID，存 userId/name/avatarIndex/text/createdAt/reports（bundle `77` `BP`；HTML `392`）。未保存 customAvatar 到评论对象，评论头像经本地目录补充。
- **观察**：自己的评论可以 `removed=true` 软删除；其他人的评论可举报，reports 按 UUID 去重，达到 3 人举报直接置 removed；提示“馆长会复核”但限定源码未见复核管理后台/通知链路（bundle `77` `qP/ZP/Er`）。**未知**：后端是否另有审核、防滥用和内容过滤；客户端限制不证明服务端强制。
- **观察**：`Fa` 每次重新读最新完整文件，按 expected mtimeMs/size 乐观写，失败最多 4 次重读重试。详情打开时立即读，开启 20 秒刷新，关闭时停。评论者 profile 请求失败被忽略；本地字段与评论内容用 textContent 或 `Oe()` HTML 转义显示（bundle `77` `Fa/Xp/LP/JP/Er`；bundle `66` `Oe`）。
- **未知**：没有对公开 JSON 内容、后端写授权、冲突响应和同步后的在线数值进行实际请求。无法确认不同账号/设备的评论是否已真正共享、文件是否初始化、服务端是否给匿名点赞权限。

## 6. 意见箱完整行为

- **观察**：顶部、日志、菜单三个入口共用 `openFeedback`，抽屉+遮罩，通过 class/aria-hidden 和页面锁控制（HTML `42,66,78,128–142`；`app.js:2012–2047`）。文本字段不设 maxlength，也没有实名/登录检查。
- **观察**：`_subject=奶蛙博物馆意见箱`、`_captcha=false`、`_template=table`；附件 input accept 图片/PDF/DOC/DOCX/TXT/ZIP，multiple。仅 accept 是选择器提示，提交处理没有再次检查 MIME/后缀（HTML `132–136`；`app.js:2070–2085`）。
- **观察**：跨多次选择积累附件，按 name+size+lastModified 去重，保留前 6 个；可看图片预览、名字、大小并移除。单文件不超过 10 MiB，总附件不超过 20 MiB，至少一段非空意见；用 DataTransfer 回填 input，然后 native form 发 multipart POST 到隐藏 iframe（`app.js:2053–2085`）。
- **观察**：提交时禁用按钮；只要 iframe 触发 load 且 submitting=true，就清空意见/附件、恢复按钮、显示“意见已投递到馆长邮箱”。没有读取响应状态、确认码或邮件回执（`app.js:2086–2089`）。**推断**：页面成功提示不能作为 FormSubmit 接受或邮箱送达的证据。**未知**：FormSubmit 邮箱是否已激活、附件受理政策、后台风控、失败页行为及真实送达。

## 7. 积分、隐藏解锁和页脚彩蛋

- **观察**：三份限定源码的博物馆业务中未见积分余额、积分计算、签到、任务、等级、成就、兑换或隐藏关卡存储 key/接口。bundle 的通用 SDK 有 billing.getCredits/commerce.consumeCredits 等定义（bundle `66`），但 `var ja=` 起的业务调用没有使用它们。**结论边界**：只能说这份抓取版本没有实现证据，不能以静态未见否定外部平台或未加载版本存在积分。
- **观察**：`unlockBgm` 为浏览器音频自动播放限制解除，监听鼠标/点击/键盘/滚动/触摸；不是积分解锁（`app.js:1594–1624`）。文案“登录后解锁自定义头像”具体是 Studio 头像登录门槛（bundle `77` `We/PP`）。
- **观察**：页脚鼠标在空白暗色区移动，180 ms 节流，随机创建 4 张 `assets/hover-frogs/frog-01…04.png` 之一，随机旋转、动画结束删除，同时不超过 10 只；笑声 `assets/audio/frog-hover.mp3` 会暂停 BGM，最多 8 个笑声并行，最后结束恢复 BGM（`app.js:1576–1591,1656–1697`）。移动端 coarse pointer 页脚进入视口即循环笑声并每 1250 ms 放一只随机蛙；出视口停，点击非链接/按钮处也生蛙（`app.js:1699–1741`）。
- **推断**：这是基于鼠标/视口触发的彩蛋，不积累访问进度、积分或登录解锁状态。音频在浏览器是否实际获准播放、对触摸设备的影响仍需运行验证。

## 8. 限定证据最重要的未知项

没有执行登录、领取身份、收藏、点赞、评论、举报、意见提交；这些功能的流程来自源码，不是成功交易的记录。不能确认后端空间权限/JSON文件初始化、跨账号写隔离、防刷规则、真实用户资料、邮箱送达、Studio bridge 是否返回 expected context，以及 SDK 中未被业务调用的功能是否在其它站点使用。模块主按钮拦截、移动端个人页按钮分支和独立页 broker viewer 缺失应由主调查的实际页面证据交叉验证。
