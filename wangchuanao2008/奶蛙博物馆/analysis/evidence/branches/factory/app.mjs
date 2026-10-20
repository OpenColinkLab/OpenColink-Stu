import { groups, initial, hairColors, headColors, clone, encode, decode, validState, randomize, history, migrateLegacy, migrateV3, migrateV5, migrateV6, migrateV7, migrateV8, togglePart } from './state.mjs';
import {hasCustomTattoos,prepareCustomTattoos} from './tattoo.mjs';
import {createHairStudio} from './hair-studio.mjs';
import { drawAvatar, drawPartThumbnail, loadAssets } from './art.mjs';
import { createStudio } from './studio.mjs';
import { messageText } from './messages.mjs';
import {downloadAvatar} from './download.mjs';

const $ = id => document.getElementById(id);
const storageKey = 'milkfrog.avatar.v9';
let studio,hairStudio;
let assets, category = 'face', crop = false, toastTimer, ready = false;
const locks = new Set();
let boot = clone(initial), bootError = '';
try {
  const shared = new URLSearchParams(location.hash.slice(1)).get('frog');
  if (shared !== null) boot = decode(shared);
  else {
    let version = 9, saved = localStorage.getItem(storageKey);
    if (saved === null) { version = 8; saved = localStorage.getItem('milkfrog.avatar.v8'); }
    if (saved === null) { version = 7; saved = localStorage.getItem('milkfrog.avatar.v7'); }
    if (saved === null) { version = 6; saved = localStorage.getItem('milkfrog.avatar.v6'); }
    if (saved === null) { version = 5; saved = localStorage.getItem('milkfrog.avatar.v5'); }
    if (saved === null) { version = 4; saved = localStorage.getItem('milkfrog.avatar.v4'); }
    if (saved === null) { version = 3; saved = localStorage.getItem('milkfrog.avatar.v3'); }
    if (saved === null) { version = 2; saved = localStorage.getItem('milkfrog.avatar.v2'); }
    if (saved === null) { version = 1; saved = localStorage.getItem('milkfrog.avatar.v1'); }
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      const candidate = version === 9 ? parsed : version === 8 ? migrateV8(parsed) : version === 7 ? migrateV7(parsed) : version === 6 ? migrateV6(parsed) : version >= 4 ? migrateV5(parsed) : version === 3 ? migrateV3(parsed) : migrateLegacy(parsed, version);
      if (!validState(candidate)) throw new Error('Your saved avatar could not be read. It has not been overwritten.');
      boot = candidate;
    }
  }
} catch (error) { bootError = error.message; }
const timeline = history(boot);
const icon = name => `<i data-lucide="${name}"></i>`;
function icons() { window.lucide?.createIcons(); }
function notify(message) {
  message=messageText(message);
  clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4200);
}
function persist() {
  if(bootError){notify('无法读取的原记录已保留，请分享或下载以保存这次修改。');return;}
  try { localStorage.setItem(storageKey, JSON.stringify(timeline.state)); }
  catch { notify('浏览器无法保存当前编辑，请在离开前下载头像。'); }
}
function updateAddress() {
  const url = new URL(location.href); url.hash = hasCustomTattoos(timeline.state)?'':'frog=' + encode(timeline.state);
  try { window.history.replaceState(null, '', url); } catch { /* The editor still works in sandboxed previews. */ }
}
function commit(next) {
  if (timeline.commit(next)) { persist(); updateAddress(); render(); }
}
function drawPreviews(state=timeline.state) {
  if (!assets) return;
  drawAvatar($('avatar'), state, assets, { circle: crop });
  for (const name of ['mini64', 'mini40', 'mini24']) drawAvatar($(name), state, assets, { circle: true });
  $('stage').classList.toggle('round', crop);
  $('stage').classList.toggle('transparent', timeline.state.background === -1);
}
function renderTabs() {
  $('categories').innerHTML = groups.map(g => `<button id="tab-${g.id}" class="category" role="tab" aria-controls="parts-panel" aria-selected="${g.id === category}" tabindex="${g.id === category ? 0 : -1}" data-category="${g.id}">${icon(g.icon)}<span>${g.name}</span>${locks.has(g.id) ? '<i class="tab-lock" data-lucide="lock"></i>' : ''}</button>`).join('');
  $('parts-panel').setAttribute('aria-labelledby', 'tab-' + category);
}
function renderParts() {
  if($('look-panel').hidden)return;
  const g = groups.find(g => g.id === category), s = timeline.state;
  const options=g.options.map((name,index)=>({name,index})).filter(({index})=>!(category==='eyewear'&&index===5)&&!(category==='extra'&&index>=5));
  $('category-title').textContent = g.name;
  $('option-count').textContent = options.length + ' 款';
  $('selection-name').textContent = s[g.id] === -1 ? '不添加' : g.options[s[g.id]];
  $('clear-part').disabled = !ready || s[g.id] === -1;
  $('lock').setAttribute('aria-pressed', String(locks.has(category)));
  $('lock').setAttribute('aria-label', `${locks.has(category) ? '解锁' : '锁定'} ${g.name}`);
  $('lock').innerHTML = icon(locks.has(category) ? 'lock' : 'lock-open') + `<span>${locks.has(category) ? '已锁定' : '锁定'}</span>`;
  $('parts').innerHTML = options.map(({name,index:i}) => `<button class="part" aria-label="${name}" aria-pressed="${s[g.id] === i}" data-part="${i}"><canvas width="256" height="256" aria-hidden="true"></canvas><span class="part-check">${icon('check')}</span><span class="part-label">${name}</span></button>`).join('');
  if (assets) $('parts').querySelectorAll('canvas').forEach(canvas => drawPartThumbnail(canvas, { ...s, [g.id]: Number(canvas.parentElement.dataset.part) }, assets, g.id));
  const palette = category === 'hair' ? hairColors : null;
  $('swatches').hidden = !palette;
  $('swatches').innerHTML = palette ? palette.map((col, i) => `<button class="swatch" style="--color:${col}" aria-label="发色 ${i+1}" aria-pressed="${!s.hairDye&&s[category+'Color'] === i}" data-color="${i}"></button>`).join('') : '';
  hairStudio?.show(category);
}
function render() {
  drawPreviews(); renderTabs(); renderParts();
  $('head-colors').innerHTML = headColors.map((col, i) => `<button class="swatch head-swatch" style="--color:${col.bottom?`linear-gradient(180deg,${col.hex},${col.bottom})`:col.hex}" aria-label="${col.name}色" data-tip="${col.name}" aria-pressed="${!timeline.state.gradient&&timeline.state.headColor === i}" data-head-color="${i}"></button>`).join('');
  $('head-color-name').textContent = timeline.state.gradient?'自定义渐变':headColors[timeline.state.headColor].name;
  $('undo').disabled = !timeline.canUndo || !ready; $('redo').disabled = !timeline.canRedo || !ready;
  $('random').disabled = !ready || locks.size === groups.length;
  $('random').querySelector('span').textContent = locks.size === groups.length ? '全部装扮已锁定' : '换个搭配';
  $('locks').innerHTML = groups.filter(g => locks.has(g.id)).map(g => `<button class="lock-tag" data-unlock="${g.id}" aria-label="解锁${g.name}">${icon('lock')} ${g.name} ${icon('x')}</button>`).join('');
  icons();
  studio?.render();
}
function changeCategory(id, focus = false) {
  hairStudio?.cancel();
  category = id; renderTabs(); renderParts(); icons();
  if (focus) $('tab-' + category).focus();
}
$('categories').addEventListener('click', e => { const b = e.target.closest('[data-category]'); if (b) changeCategory(b.dataset.category); });
$('categories').addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault(); let i = groups.findIndex(g => g.id === category);
  i = e.key === 'Home' ? 0 : e.key === 'End' ? groups.length-1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + groups.length) % groups.length;
  changeCategory(groups[i].id, true);
});
$('parts').addEventListener('click', e => {
  const b = e.target.closest('[data-part]'); if (!b || !ready) return;
  const index = b.dataset.part,s=timeline.state;
  if(category==='eyewear'&&s.eyewear===5){s.eyewear=-1;s.details.earwear=1;}
  if(category==='extra'&&s.extra===7){s.extra=-1;s.details.jewelry=1;}
  if(category==='extra'&&s.extra===5){s.extra=-1;s.details.blush=65;}
  if(category==='extra'&&s.extra===6){s.extra=-1;s.details.freckles=65;}
  commit(togglePart(s, category, Number(index)));
  $('parts').querySelector(`[data-part="${index}"]`)?.focus({ preventScroll: true });
});
$('swatches').addEventListener('click', e => {
  const b = e.target.closest('[data-color]'); if (!b || !ready) return;
  const index = b.dataset.color; commit({ ...timeline.state,hairDye:null, [category+'Color']: timeline.state[category+'Color'] === Number(index) ? 0 : Number(index) });
  $('swatches').querySelector(`[data-color="${index}"]`)?.focus({ preventScroll: true });
});
$('clear-part').addEventListener('click', () => { if (ready) commit({ ...timeline.state, [category]: -1 }); });
$('head-colors').addEventListener('click', e => {
  const b = e.target.closest('[data-head-color]'); if (!b || !ready) return;
  const index = Number(b.dataset.headColor);
  commit({ ...timeline.state, gradient:null, headColor: !timeline.state.gradient&&timeline.state.headColor === index ? initial.headColor : index });
  $('head-colors').querySelector(`[data-head-color="${index}"]`)?.focus({ preventScroll: true });
});
$('lock').addEventListener('click', () => { if (locks.has(category)) locks.delete(category); else locks.add(category); render(); });
$('locks').addEventListener('click', e => { const b = e.target.closest('[data-unlock]'); if (b) { locks.delete(b.dataset.unlock); render(); } });
$('random').addEventListener('click', () => { if (ready) commit(randomize(timeline.state, locks)); });
$('reset').addEventListener('click', () => { if (ready) { locks.clear(); commit(clone(initial)); render(); notify('已还原原味奶蛙。'); } });
function travel(direction) {
  if (!ready) return;
  studio?.cancel();
  hairStudio?.cancel();
  timeline[direction](); persist(); updateAddress(); render();
}
$('undo').addEventListener('click', () => travel('undo'));
$('redo').addEventListener('click', () => travel('redo'));
document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z' || /INPUT|TEXTAREA/.test(e.target.tagName)||e.target.closest('dialog')) return;
  e.preventDefault(); travel(e.shiftKey ? 'redo' : 'undo');
});
for (const id of ['square', 'circle']) $(id).addEventListener('click', () => {
  crop = id === 'circle';
  for (const key of ['square', 'circle']) { $(key).classList.toggle('active', key === id); $(key).setAttribute('aria-pressed', String(key === id)); }
  drawPreviews();
});
$('download').addEventListener('click', async () => {
  if (!ready) return;
  persist();
  await downloadAvatar($('download'),async()=>{
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024;
    drawAvatar(canvas, timeline.state, assets, {circle:crop});
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('The browser could not create your PNG. Please try again.');
    return {blob,name:'milkfrog-avatar.png'};
  },notify);
});
export async function editorReference() {
  if (!ready) throw Error('Wait for your Milkfrog to finish loading.');
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
  drawAvatar(canvas,timeline.state,assets,{circle:false});
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw Error('Your Milkfrog could not be exported.');
  return new File([blob],'my-milkfrog.png',{type:'image/png'});
}
$('share').addEventListener('click', () => {
  if(hasCustomTattoos(timeline.state)){notify('搭配含本机保存的纹身，请下载 PNG 分享。原图不会自动公开。');return;}
  // The Cohub host forwards this hash to the current version of the app.
  const url = new URL('https://cohub.live/atou/milkfrog/w/milkfrog'); url.hash = 'frog=' + encode(timeline.state);
  $('share-url').value = url.href; $('copy-status').textContent = ''; $('share-dialog').showModal();
});
$('close-share').addEventListener('click', () => $('share-dialog').close());
$('share-dialog').addEventListener('click', e => { if (e.target === $('share-dialog')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
$('copy-link').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('share-url').value); $('copy-status').textContent = '链接已复制。'; }
  catch { $('share-url').focus(); $('share-url').select(); $('copy-status').textContent = '无法使用剪贴板，已选中链接，可手动复制。'; }
});
window.addEventListener('hashchange', async () => {
  const value = new URLSearchParams(location.hash.slice(1)).get('frog');
  if (value === null) return;
  try {const next=decode(value);if(assets)await prepareCustomTattoos(next,assets);commit(next);} catch (error) { notify(error.message); }
});

hairStudio=createHairStudio({getState:()=>timeline.state,commit,preview:drawPreviews,isReady:()=>ready});
studio=createStudio({getState:()=>timeline.state,commit,preview:drawPreviews,getAssets:()=>assets,isReady:()=>ready,notify,onModeChange:()=>{hairStudio.cancel();renderParts();icons();}});
for (const id of ['random', 'reset', 'download', 'share']) $(id).disabled = true;
render();
try {
  assets = await loadAssets();await prepareCustomTattoos(timeline.state,assets); ready = true;
  $('editor-emotions').disabled = false;
  for (const id of ['random', 'reset', 'download', 'share']) $(id).disabled = false;
  $('loading').hidden = true; render();
  if (bootError) notify(bootError);
} catch (error) { $('loading').textContent = hasCustomTattoos(timeline.state)?'自传纹身或素材加载失败，原记录已保留，请刷新重试。':'素材加载失败，请刷新重试。'; console.error(error); }
