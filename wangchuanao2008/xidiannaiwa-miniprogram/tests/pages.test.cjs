const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { createRequire } = require('node:module');
const vm = require('node:vm');
function page(name) {
  const file = resolve(__dirname, '../miniprogram/pages', name, 'index.js');
  const calls = [];
  const wx = Object.fromEntries(['navigateTo','redirectTo','navigateBack','pageScrollTo','previewImage','showToast','setNavigationBarTitle'].map(method => [method, options => calls.push({method,options})]));
  let definition;
  const nativeRequire = createRequire(file);
  const sandbox = { wx, setTimeout, clearTimeout, Page(value) { definition = value; }, require(id) {
    if(id.endsWith('/utils/navigation')) return { backOrHome(fallback) { wx.redirectTo({url:fallback||'/pages/index/index'}); } };
    return nativeRequire(id);
  } };
  vm.runInNewContext(readFileSync(file,'utf8'), sandbox, {filename:file});
  const instance = Object.assign({}, definition, { data: structuredClone(definition.data || {}), setData(update, callback) { Object.assign(this.data, update); if(callback)callback(); } });
  return { instance, calls };
}
const tap = dataset => ({ currentTarget:{dataset} });
test('museum browse, filter, search, paging and deep-link share', async () => {
  const {instance:p,calls} = page('museum');p.onLoad({});
  assert.equal(p.data.total,114);assert.equal(p.data.works.length,24);
  p.changePage(tap({offset:1}));assert.equal(p.data.page,2);
  p.changeGallery(tap({gallery:'china'}));assert.equal(p.data.total,35);assert.equal(p.data.page,1);
  p.changeEra({detail:{value:4}});assert.equal(p.data.total,7);
  p.changeGallery(tap({gallery:'main'}));p.onSearch({detail:{value:'星月'}});
  await new Promise(done=>setTimeout(done,210));assert.equal(p.data.total,1);assert.equal(p.data.works[0].id,'work-103');
  p.openWork(tap({id:'work-103'}));assert(calls.at(-1).options.url.includes('id=work-103'));
  const share = p.onShareAppMessage();assert.equal(new URLSearchParams(share.path.split('?')[1]).get('query'),'星月');
  p.onUnload();
});
test('pending input cannot change clicked artwork context or leave stale query', () => {
  const {instance:p,calls} = page('museum');p.onLoad({gallery:'china',era:'china-song'});
  const work=p.data.works[0];p.onSearch({detail:{value:'unmatched'}});p.openWork(tap({id:work.id}));
  assert.equal(p.data.query,'');assert.equal(p.searchTimer,null);
  const params=new URLSearchParams(calls.at(-1).options.url.split('?')[1]);assert.equal(params.get('era'),'china-song');assert.equal(params.get('query'),'');
});
test('shared artwork restores filtered siblings and cycles within the result', () => {
  const {instance:p,calls} = page('artwork');p.onLoad({id:'work-103',query:encodeURIComponent('星月')});
  assert.equal(p.data.total,1);assert.equal(p.data.work.id,'work-103');
  const share=p.onShareAppMessage();assert(share.path.includes('id=work-103'));
  p.changeWork(tap({offset:1}));assert.equal(p.data.work.id,'work-103');
  p.previewImage();assert.equal(calls.at(-1).method,'previewImage');
  p.imageError(tap({id:'work-103'}));assert.equal(p.data.imageFailed,true);
  p.retryImage();assert.equal(p.data.imageFailed,false);assert(p.data.fullImage.endsWith('work-103.jpg'));
  p.imageReady(tap({id:'old-work'}));assert.equal(p.data.imageLoaded,false);
  p.imageReady(tap({id:'work-103'}));assert.equal(p.data.imageLoaded,true);
  p.back();assert(calls.at(-1).options.url.includes('/pages/museum/index?'));
});
test('all artwork links can open and share; invalid IDs show an empty state', () => {
  const {catalog}=require('../miniprogram/services/catalog');
  for(const work of catalog.works){const {instance:p}=page('artwork');p.onLoad({id:work.id});assert.equal(p.data.work.id,work.id);assert(p.onShareAppMessage().path.includes(work.id));}
  const {instance:p}=page('artwork');p.onLoad({id:'missing'});assert.equal(p.data.missing,true);assert.equal(p.onShareAppMessage().path,'/pages/museum/index');
});
test('artwork navigation wraps and falls back from mismatched gallery',()=>{
  const {instance:p}=page('artwork');p.onLoad({id:'work-103',gallery:'china'});assert.equal(p.context.gallery,'main');
  const first=p.siblings[0].id,last=p.siblings.at(-1).id;p.showWork(first);p.changeWork(tap({offset:-1}));assert.equal(p.data.work.id,last);p.changeWork(tap({offset:1}));assert.equal(p.data.work.id,first);
});
test('direct navigation uses fallback; normal navigation preserves previous page',()=>{
  const file=resolve(__dirname,'../miniprogram/utils/navigation.js');let count=1;const calls=[];const sandbox={module:{exports:{}},wx:{redirectTo:o=>calls.push(['redirect',o.url]),navigateBack:()=>calls.push(['back'])},getCurrentPages:()=>Array(count)};
  vm.runInNewContext(readFileSync(file,'utf8'),sandbox);sandbox.module.exports.backOrHome('/pages/museum/index');assert.equal(calls[0][0],'redirect');count=2;sandbox.module.exports.backOrHome();assert.equal(calls[1][0],'back');
});

test('museum share path restores encoded search and page',()=>{
 const {instance:p}=page('museum');p.onLoad({query:encodeURIComponent('星月'),page:'999'});assert.equal(p.data.query,'星月');assert.equal(p.data.total,1);assert.equal(p.data.page,1);
});
