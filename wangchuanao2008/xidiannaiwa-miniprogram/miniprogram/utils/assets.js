const { baseUrl } = require('../config/assets');
function assetUrl(relative) {
  const base = String(baseUrl || '').replace(/\/+$/, '');
  if (!base || !relative || relative.startsWith('/') || relative.includes('..') || !/^museum\/(artworks|thumbnails)\/[a-zA-Z0-9._-]+$/.test(relative)) return '';
  return base + '/' + relative;
}
module.exports = { assetUrl };
