# 自有服务器部署

当前通过 SSH 别名 ubuntu 管理服务器 123.207.179.245。OpenSSH 密钥由本机 ~/.ssh/config 指定，仓库不包含私钥。项目不使用微信云开发、云存储或数据库。

## 目录与路由

- 原网站：/var/www/naiwa/current，现有 Nginx 80 端口服务。
- 小程序图片：/var/www/naiwa-miniprogram/releases/<版本>/museum/{artworks,thumbnails}/。
- 生效版本：/var/www/naiwa-miniprogram/current 软链接。
- 对外路径：/miniprogram-assets/museum/...；小程序 baseUrl 为 https://123.207.179.245/miniprogram-assets。
- Nginx 路由片段源文件：deploy/naiwa-miniprogram-assets.conf，安装到 /etc/nginx/snippets/naiwa-miniprogram-assets.conf，并在相关 server 中 include。

只部署馆藏图，不发布源码、密钥或本机备份。图片 GET/HEAD 可读，目录索引关闭，缓存一天。更新时推荐换文件名，并保留旧版资源，保证旧客户端可用。

## 更新图片

电脑需 Node ≥22.12、ssh/scp、rsync；服务器需 rsync、Python3 和非交互 sudo。根目录无 npm 包依赖。配置自己的 SSH 别名后：

```sh
npm run assets:deploy -- --host ubuntu
```

脚本生成 SHA-256 清单、传输到远端临时目录、校验所有图片，再创建新版本并原子切换 current。旧版本保留。不修改已有网站目录或自动删除任何旧版本。不要让不可信用户修改传输目录或脚本；服务器写操作均使用当前 SSH 身份。

## HTTPS 与 IP 的边界

123.207.179.245 是公网 IPv4 地址，不是 DNS 域名。Let’s Encrypt 已支持有效期约 160 小时的免费 IP 证书，需要现代 Certbot、HTTP-01 验证和频繁自动续期。证书是否成功签发、443 是否公网可达，以本次验证记录为准，不因模板存在而认定完成。

IP HTTPS 能提供 TLS，但不能填入微信 request/downloadFile 合法域名。当前代码仅通过 image 与 wx.previewImage 加载图片，需在真实手机验证；以后引入 wx.request、wx.downloadFile、getImageInfo 等能力，应使用微信支持的合规域名。不要把公开证书误当成微信平台资质。

## 在新服务器首次配置

当前服务器已经完成以下操作；这是接手者迁移主机时的说明。不要在不检查已有站点的情况下覆盖 Nginx 配置。示例以 Ubuntu24.04 / Python3.12 为准；其他版本需调整系统包名。

1. 安装系统依赖 `nginx rsync python3.12-venv`，执行上方图片部署脚本；仓库不包含原网站的部署流程，已有 `/var/www/naiwa/current` 应单独维护。
2. 放行云平台**入站 TCP80 和443**。80供 HTTP-01 验证，443供图片。SSH22沿用自己的安全策略。
3. 将 `deploy/naiwa-miniprogram-assets.conf` 安装为 `/etc/nginx/snippets/naiwa-miniprogram-assets.conf`，将 `deploy/naiwa-acme.nginx.conf` 安装为 `/etc/nginx/snippets/naiwa-acme.conf`；建立 `/var/lib/naiwa-acme`。在 HTTP server 中 include 这两个片段，检查 `nginx -t` 后 reload。
4. 使用独立虚拟环境安装证书工具，再签发免费 IP 证书：

   ```sh
   sudo python3.12 -m venv /opt/naiwa-certbot
   sudo /opt/naiwa-certbot/bin/pip install -r deploy/certbot-requirements.txt
   sudo /opt/naiwa-certbot/bin/certbot certonly --non-interactive --agree-tos --register-unsafely-without-email --preferred-profile shortlived --webroot --webroot-path /var/lib/naiwa-acme --ip-address 123.207.179.245 --cert-name naiwa-ip
   ```

   在服务器仓库副本执行 pip 命令；没有克隆仓库时先复制 requirements 文件。换服务器 IP 时同时修改证书命令、Nginx server_name 和小程序 baseUrl。当前未登记邮箱，接手者可改用自己的通知邮箱。该依赖快照记录本次环境，不代表永远免维护。
5. 证书存在后，再将 `deploy/naiwa-https.nginx.conf` 安装为 `/etc/nginx/sites-available/naiwa-https` 并链接到 sites-enabled。核对 root、IP、证书路径，执行 `nginx -t` 通过后 reload。不要在证书未签发时启用引用它的站点。
6. 将 `deploy/naiwa-certbot-deploy-hook.sh` 安装到 `/usr/local/sbin/naiwa-certbot-deploy-hook`（root所有、0755），将 service/timer 安装到 `/etc/systemd/system/`（0644）。执行 `sudo systemctl daemon-reload` 和 `sudo systemctl enable --now naiwa-certbot-renew.timer`。检查服务器时区，当前为 Asia/Shanghai。
7. 执行续期演练，再从服务器外部和手机访问 HTTPS：

   ```sh
   sudo /opt/naiwa-certbot/bin/certbot renew --cert-name naiwa-ip --dry-run --no-random-sleep-on-renew --run-deploy-hooks --deploy-hook /usr/local/sbin/naiwa-certbot-deploy-hook
   curl --noproxy '*' --fail --head https://123.207.179.245/miniprogram-assets/museum/thumbnails/work-103.jpg
   ```

IP证书约160小时有效，必须保持定时器和80验证入口可用。当前无额外云存储套餐；自有服务器流量/带宽费用沿用原主机计费。证书私钥只在 `/etc/letsencrypt/`，不提交 Git。

## 配置与发布

```sh
npm run assets:configure -- --url https://123.207.179.245/miniprogram-assets
npm run check
npm test
npm run check:release
```

check:release 只检查本地配置，不验证线上可达性或微信实际行为。重新编译、上传并重新设置体验版后，手机才能使用新配置。检查缩略图、JPG/WebP 原图、放大预览、返回与分享。故障先在手机浏览器打开一张 HTTPS 图片区分服务器访问与微信组件问题。

## 回滚

将 /var/www/naiwa-miniprogram/current 原子切回上一版本目录即可回滚资源。若改过图片清单或小程序基地址，还需恢复相应小程序版本。Nginx 配置应先备份，执行 nginx -t 通过后再 reload。

参考：[Let’s Encrypt IP 证书](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability)、[Certbot 配置](https://letsencrypt.org/2026/03/11/shorter-certs-certbot.html)。
