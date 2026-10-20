# 当前服务器架构

更新时间：2026-10-20，Asia/Shanghai。主机公网 IP 为 123.207.179.245，Ubuntu 24.04 / Nginx 1.24.0，通过本机 SSH 别名 ubuntu 登录。密钥由本机 SSH 配置管理，未复制进仓库。

## 请求链路

```text
手机小程序（页面/馆藏文字在小程序代码包）
  └─ HTTPS :443 → Nginx
       └─ /miniprogram-assets/museum/...
            └─ /var/www/naiwa-miniprogram/current/museum/...

浏览器 → HTTP :80 / HTTPS :443 → Nginx
  └─ / → /var/www/naiwa/current（原网站）

Certbot → HTTP :80 /.well-known/acme-challenge/...
  └─ /var/lib/naiwa-acme（证书验证目录）
```

小程序图片是静态文件服务，不运行 Node 常驻业务进程、云函数或数据库。服务器原有的其他服务没有因本次图片部署而重配。

## 实际目录

| 用途 | 服务器路径 |
| --- | --- |
| 原网站当前版本 | /var/www/naiwa/current → /var/www/naiwa/releases/20261014-hd-logo |
| 图片版本 | /var/www/naiwa-miniprogram/releases/assets-20261020114741152（后续以 current 实际指向为准） |
| 图片入口 | /var/www/naiwa-miniprogram/current → releases/对应版本 |
| 图片内容 | museum/artworks/ 149 张原图；museum/thumbnails/ 149 张缩略图，合计 249.85 MiB |
| HTTP 站点配置 | /etc/nginx/sites-available/naiwa |
| HTTPS 站点配置 | /etc/nginx/sites-available/naiwa-https |
| 图片路由 | /etc/nginx/snippets/naiwa-miniprogram-assets.conf |
| ACME 验证路由 | /etc/nginx/snippets/naiwa-acme.conf |
| 原 Nginx 配置备份 | /etc/nginx/backups/naiwa-before-assets-* |
| 证书与私钥 | /etc/letsencrypt/live/naiwa-ip/（私钥仅留服务器） |
| Certbot 独立环境 | /opt/naiwa-certbot/，Certbot 5.4.0 |
| 续期钩子 | /usr/local/sbin/naiwa-certbot-deploy-hook |
| 续期服务/定时器 | /etc/systemd/system/naiwa-certbot-renew.service / .timer |

图片服务关闭目录索引，仅允许 GET/HEAD，正确返回 image/jpeg 或 image/webp，缓存 1 天。公开路由只映射 museum/，不暴露部署校验脚本、清单、源码或私钥。部署前逐文件验证 SHA-256，通过后原子切换 current，旧版本保留。

## 证书与续期

使用 Let’s Encrypt 免费公网 IP 证书，SAN 为 IP Address:123.207.179.245，颁发链为 Let's Encrypt YE1。当前证书到期为北京时间 2026-10-27 10:51:19。续期后以服务器证书实际日期为准。

IP 证书有效期短（约160小时）；systemd 定时器按 Asia/Shanghai 每日 00:00、08:00、16:00 检查，每次随机延迟0–30分钟，停机后可补执行。证书更新后执行 nginx -t，通过再 reload。当前未配置告警邮件地址，接手者应自行安排证书/定时器监测。

检查命令：

```sh
ssh ubuntu 'sudo nginx -t'
ssh ubuntu 'systemctl list-timers naiwa-certbot-renew.timer --no-pager'
ssh ubuntu 'sudo journalctl -u naiwa-certbot-renew.service -n 30 --no-pager'
ssh ubuntu 'sudo /opt/naiwa-certbot/bin/certbot certificates'
```

Nginx/定时器的源码副本在 deploy/，Python 证书工具实际依赖快照见 deploy/certbot-requirements.txt，方便审查和迁移。自动续期 dry-run（含部署钩子）已通过。没有额外云存储套餐；服务器本身的流量/带宽仍沿用现有云主机计费。

## 网络与微信边界

2026-10-20 20:03（Asia/Shanghai），用户修正实例入站 TCP443 规则后，从开发电脑直接访问公网 JPG 缩略图与 WebP 原图均返回 HTTP/2 200；未关闭 TLS 证书校验。此前443超时期间，服务器未收到测试连接的 TCP 握手。公网 HTTP 也返回200。后续迁移实例时需要同时放行80（证书 HTTP-01 验证）和443（图片 HTTPS）。手机体验版仍需重新上传并实际验收。

IP HTTPS 不等于微信域名白名单。当前仅用 image 与 wx.previewImage，实际手机仍需验证；未来使用 wx.request / wx.downloadFile 等需域名能力，应使用微信支持的合规域名。

## 端口与现有服务

| 监听范围 | 服务 | 用途 |
| --- | --- | --- |
| 公网 TCP22 | OpenSSH | 管理和部署，沿用已有密钥配置 |
| 公网 TCP80 | Nginx | 原网站与 ACME 验证 |
| 公网 TCP443 | Nginx | 原网站 HTTPS 与小程序图片 |
| 仅127.0.0.1:7890、9090 | 原有 Mihomo | 本机代理及管理接口，本次未修改其配置 |
| 仅本机53 | systemd-resolved | 系统 DNS |

现场资源快照：内存约1.9 GiB、Swap约1.9 GiB；根盘40 GiB，已用9.4 GiB、可用29 GiB。图片访问不启动额外应用后端。
