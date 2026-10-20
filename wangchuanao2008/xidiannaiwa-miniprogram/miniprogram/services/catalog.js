const catalog = require('../data/catalog');
const PAGE_SIZE = 24;
function contextOf(options) {
  const input = options || {};
  const gallery = catalog.galleries.some(item => item.id === input.gallery) ? input.gallery : 'main';
  const eras = catalog.era_order[gallery];
  return { gallery, era: eras.includes(input.era) ? input.era : 'all', query: String(input.query || '').slice(0, 100) };
}
function filterWorks(options) {
  const context = contextOf(options);
  const keyword = context.query.trim().toLowerCase();
  const order = catalog.era_order[context.gallery];
  return catalog.works.filter(work => work.gallery === context.gallery && (context.era === 'all' || work.era === context.era) && (!keyword || [work.name, work.name_en, work.artist, work.era_name].join(' ').toLowerCase().includes(keyword)))
    .sort((a, b) => order.indexOf(a.era) - order.indexOf(b.era));
}
function pageOf(options, requestedPage) {
  const works = filterWorks(options);
  const pages = Math.max(1, Math.ceil(works.length / PAGE_SIZE));
  const number = Number(requestedPage);
  const page = Math.max(1, Math.min(pages, Number.isFinite(number) ? Math.floor(number) : 1));
  return { works: works.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: works.length, page, pages };
}
function eraOptions(gallery) {
  const context = contextOf({ gallery });
  return [{ id: 'all', name: '全部展厅' }].concat(catalog.era_order[context.gallery].map(id => ({ id, name: catalog.era_labels[id] })));
}
function workById(id) { return catalog.works.find(work => work.id === id); }
// navigateTo/share 编码一次；仅在 onLoad 边界解码一次，内部上下文始终使用原始字符串。
function routeOptions(options) {
  const input = options || {};
  const decoded = {};
  for (const key of ['id', 'gallery', 'era', 'query', 'page']) {
    if (input[key] == null) continue;
    try { decoded[key] = decodeURIComponent(String(input[key])); }
    catch (_) { decoded[key] = String(input[key]); }
  }
  return decoded;
}
function contextQuery(options) {
  const context = contextOf(options);
  return ['gallery', 'era', 'query'].map(key => key + '=' + encodeURIComponent(context[key])).join('&');
}
module.exports = { catalog, PAGE_SIZE, contextOf, filterWorks, pageOf, eraOptions, workById, contextQuery, routeOptions };
