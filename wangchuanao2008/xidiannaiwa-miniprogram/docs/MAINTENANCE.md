# 维护指南

## 修改馆藏

1. 修改 `content/catalog.json`。每件作品必须有稳定唯一的 `id`、`gallery`、`era`、`name`、`era_name`、`image` 和 `thumbnail`；保留 `intro`、`name_en`、`artist`、`year`、`curatorial`，空文案可用空字符串。
2. 高清图放 `assets/museum/artworks/`，缩略图放 `assets/museum/thumbnails/`。清单路径相对于 `assets/`，不要写绝对路径、开发电脑地址或线上域名。
3. 同步更新 `galleries[].count`、`galleries[].eras[].count`、`era_order`、`era_labels`；展厅 ID 必须匹配所属展馆。
4. 执行 `npm run catalog:sync`、`npm run check`、`npm test`。当前测试还核对 35 件中国馆、7 件隋唐等基准；有意调整这些内容时更新相应预期，不可直接跳过测试。
5. 修改首页新闻中静态的馆藏/展厅数量文案。上传变动图片，再发布包含新数据模块的小程序，避免先发布指向不存在图片的清单。

建议列表缩略图长边约 640px，并在保持观感的前提下继续压缩。若替换线上同名文件，注意对象存储/CDN 缓存；推荐更新文件名并保留旧文件一段时间，使旧版本客户端可继续访问。

## 修改轮播与校徽

`miniprogram/assets/logo.png` 保留完整高清校名校徽。两张轮播源文件在 `assets/source/`，包含原位图与局部字形修补，不能用单独的 `*-edited.png` 替代最终画面。

随包 JPG 已导出并提交，普通开发无需以下步骤。需要重新导出时：

```sh
npm --prefix tools/banner-export ci
# 可选 A：下载与锁定 Playwright 版本配套的 Chromium
cd tools/banner-export
npx --no-install playwright-core install chromium
cd ../..
node tools/banner-export/export.mjs
```

或可选 B：使用本机现成 Chromium，指定真实可执行文件路径：

```sh
CHROMIUM_PATH=/absolute/path/to/chromium node tools/banner-export/export.mjs
```

安装过程需要网络；导出过程只读取仓库本地 SVG。导出工具依赖 playwright-core 1.58.2 和 Chromium，不进小程序包。替换后运行 `npm run check` 检查体积。当前以 750×422、JPEG 质量 88 导出，保留原合成效果。

## 日常交接

修改前确认配置是本地还是线上资源地址。修改后查看受影响的四页、跑检查与测试。提交时同时提交原始清单与生成模块；不要只在生成模块补数据。不要将微信页面逻辑改回依赖 DOM 或 fetch 的网页代码。

新增依赖需说明用途、版本、运行端、安装步骤及许可证，并提交锁文件；只有微信兼容的依赖才能进入小程序。运行时引入 npm 后，另行补充微信开发者工具“构建 npm”流程，当前不需要这一步。
