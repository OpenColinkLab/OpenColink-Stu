const test = require('node:test');
const assert = require('node:assert/strict');
const { catalog, filterWorks, pageOf, eraOptions, contextOf, contextQuery, workById, routeOptions } = require('../miniprogram/services/catalog');
test('all works are reachable once by gallery pagination', () => {
  const reached = [];
  for (const gallery of catalog.galleries) {
    const first = pageOf({ gallery: gallery.id }, 1);
    assert.equal(first.total, gallery.count);
    for (let page = 1; page <= first.pages; page++) reached.push(...pageOf({ gallery: gallery.id }, page).works.map(work => work.id));
  }
  assert.equal(new Set(reached).size, catalog.works.length);
  assert.equal(reached.length, catalog.works.length);
});
test('gallery and era filters are isolated and ordered', () => {
  assert.equal(filterWorks({ gallery: 'china' }).length, 35);
  assert.equal(filterWorks({ era: 'renaissance' }).length, 5);
  assert.equal(filterWorks({ gallery: 'china', era: 'china-sui-tang' }).length, 7);
  const eras = eraOptions('china'); assert.equal(eras.length, 8); assert.equal(eras[0].id, 'all');
  const ordered = filterWorks({}).map(work => catalog.era_order.main.indexOf(work.era));
  assert.deepEqual(ordered, [...ordered].sort((a,b)=>a-b));
});
test('Chinese, English and artist search match catalog content', () => {
  assert.equal(filterWorks({ query: ' 星月 ' })[0].id, 'work-103');
  const sample = catalog.works.find(work => work.name_en);
  assert(filterWorks({ gallery:sample.gallery, query:sample.name_en.toUpperCase() }).some(work=>work.id===sample.id));
  assert(filterWorks({ gallery:sample.gallery, query:sample.artist }).some(work=>work.id===sample.id));
  assert.equal(filterWorks({ query: 'unmatched-catalog-term-$$$' }).length, 0);
});
test('malformed links and empty searches have safe pagination', () => {
  assert.equal(pageOf({}, 999).page, 5); assert.equal(pageOf({}, -1).page, 1);
  assert.equal(pageOf({}, 'NaN').page, 1); assert.equal(pageOf({}, Infinity).page, 1);
  assert.equal(pageOf({ query:'not-a-work-$$$' }, 5).pages, 1);
  assert.deepEqual(contextOf({ gallery:'invalid', era:'china-song' }), {gallery:'main',era:'all',query:''});
  assert.equal(workById('missing'), undefined);
});
test('share contexts round-trip punctuation, Chinese and percent characters', () => {
  const context = { gallery:'china', era:'china-song', query:'蛙 & + % / ?' };
  assert.deepEqual(contextOf(Object.fromEntries(new URLSearchParams(contextQuery(context)))), context);
});

test('raw WeChat route values decode exactly once',()=>{
 const text='蛙 & + %25 / ?';const encoded={gallery:'china',era:'china-song',query:encodeURIComponent(text)};
 assert.equal(routeOptions(encoded).query,text);
 assert.equal(contextOf(routeOptions({query:'%2525'})).query,'%25');
 assert.equal(routeOptions({query:'broken%'}).query,'broken%');
});
