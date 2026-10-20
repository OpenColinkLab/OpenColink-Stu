// 图片由维护者自己的 Ubuntu/Nginx 托管；保持 /museum/... 相对路径。
// 本机调试可运行 npm run assets:configure -- --url http://127.0.0.1:5174
module.exports = {
  baseUrl: 'https://123.207.179.245/miniprogram-assets',
  // 服务器使用公开信任的 IP 证书。IP 不能作为微信 request/downloadFile 合法域名。
  allowIpHttps: true
};
