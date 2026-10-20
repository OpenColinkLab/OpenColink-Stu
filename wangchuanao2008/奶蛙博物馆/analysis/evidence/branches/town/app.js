import {
  Town, RESIDENTS, DESTINATIONS, ITEMS, PERSONALITIES, REACTIONS, ITEM_BASE,
  STATS, CONDITIONS, CARE_KINDS, moodLabel, rankOf,
  MATERIALS, MATERIAL_KEYS, EQUIPMENT, EQUIPMENT_KEYS, EQUIP_SLOTS, SLOT_KEYS, materialPrice,
  timeOf, slotAt, SEASONS, SPOTS, TENDENCIES,
  LUGGAGE, LUGGAGE_MAX, SKILLS, SOUVENIR_EVENTS, DECO,
  loadSaved, saveTown,
} from './town.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const town = new Town(loadSaved());
const images = {};
const roles = ['早点铺老板娘', '巨幕放映员', '表情练习生'];
const $ = (id) => document.getElementById(id);
let selected = town.agents[0], speed = 1, zoom = 1;
let width = 1, height = 1, dpr = 1, view = { scale: 1, x: 0, y: 0 };
let lastDay = town.day, lastHud = 0, lastSave = 0, last = performance.now();
let ready = false, panelOpen = true, activeTab = 'resident';
let pendingTravelFrog = null, lastToastTimer = 0;
const hitboxes = new Map();
const itemHitboxes = new Map();

/* ---------------------------------------------------------------- 资源 */
function image(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`画面素材未载入：${src}`));
    img.src = src;
  });
}
function resize() {
  const r = canvas.parentElement.getBoundingClientRect();
  width = Math.max(1, r.width); height = Math.max(1, r.height);
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  updateView();
}
function updateView() {
  if (!images.town) return;
  const iw = images.town.width, ih = images.town.height;
  const base = width < 600
    ? Math.max(width / iw, Math.min(height / ih, width * 1.4 / iw))
    : Math.min(width / iw, height / ih);
  const scale = base * zoom;
  view = { scale, x: (width - iw * scale) / 2, y: (height - ih * scale) / 2 };
  $('zoomReset').textContent = `${Math.round(zoom * 100)}%`;
}

/* 广场坐标 -> 屏幕坐标。渲染与点击命中用同一套换算，缩放不会让奶蛙和它的点击区脱节。 */
function projectPoint(x, y) {
  const u = (x - 1) / 24, v = (y - 1) / 13;
  const px = 610 + 255 * u - 270 * v;
  const py = 438 + 140 * u + 145 * v;
  return {
    x: view.x + (px / 1200) * images.town.width * view.scale,
    y: view.y + (py / 896) * images.town.height * view.scale,
    depth: (u + v) / 2,
  };
}
function project(a) { return projectPoint(a.x, a.y); }
function frogHeightAt(depth) {
  return Math.max(width < 600 ? 37 : 50, (74 + depth * 14) * (images.town.width / 1200) * view.scale);
}
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }

/* ---------------------------------------------------------------- 绘制 */
function easeOut(t) { return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3); }

function renderAgent(a) {
  const p = project(a);
  const frogHeight = frogHeightAt(p.depth);
  const side = a.moving && (a.dir === 'left' || a.dir === 'right');
  const pose = side ? images.side : a.moving && a.dir === 'up' ? images.back : images.front;
  const frogWidth = (frogHeight * pose.width) / pose.height;
  const bob = a.moving ? Math.sin(town.t * 9 + a.idx) * Math.min(1.2, view.scale * 1.3) : 0;

  // 互动动作：位移 / 旋转 / 缩放
  let scale = 1, rot = 0;
  if (a.act && a.act.phase === 'play') {
    const k = easeOut(a.act.progress / 0.24);
    scale = 1 + (a.act.pose.frogScale - 1) * k;
    rot = ((a.act.pose.rot || 0) * 0.55 * k * Math.PI) / 180;
  }

  ctx.fillStyle = '#50634a28';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 2, frogHeight * 0.21 * scale, frogHeight * 0.068 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  if (selected === a) {
    ctx.strokeStyle = '#70917985'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, frogHeight * 0.3, frogHeight * 0.1, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  if (side && a.dir === 'right') ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(pose, -frogWidth / 2, -frogHeight, frogWidth, frogHeight);

  // 穿戴的装备：头 / 颈 / 手，按奶蛙身高比例定位（与奶蛙同一变换，动作时会跟着动）
  for (const slot of SLOT_KEYS) {
    const id = a.equipped ? a.equipped[slot] : null;
    if (!id || !EQUIPMENT[id]) continue;
    if (slot === 'hand' && a.dir === 'up') continue;
    const eimg = images[`equip-${id}`];
    if (!eimg) continue;
    const look = EQUIPMENT[id].look;
    const iw = frogHeight * look.w;
    const ih = (iw * eimg.height) / eimg.width;
    const dx = a.dir === 'right' ? -look.dx : look.dx;
    ctx.drawImage(eimg, dx * frogHeight - iw / 2, look.cy * frogHeight - ih / 2, iw, ih);
  }

  // 纪念物装饰槽：独立一层，不占普通装备槽
  const decoDef = a.deco ? DECO[a.deco] : null;
  const decoImg = decoDef ? images[`item-${a.deco}`] : null;
  if (decoDef && decoImg) {
    const dw = frogHeight * decoDef.scale;
    const dh = (dw * decoImg.height) / decoImg.width;
    ctx.save();
    ctx.rotate(((decoDef.rot || 0) * Math.PI) / 180);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(decoImg, -dw / 2, decoDef.dy * frogHeight - dh, dw, dh);
    ctx.restore();
  }
  ctx.restore();

  // 睡着了画一串 z
  if (a.plan && a.plan.key === 'sleep' && !a.hidden) {
    const tz = town.t * 1.6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(70, 92, 76, 0.9)';
    for (let i = 0; i < 3; i++) {
      const k = ((tz + i * 0.55) % 1.65) / 1.65;
      ctx.globalAlpha = 1 - k;
      ctx.font = `600 ${Math.max(9, Math.round(frogHeight * (0.16 + i * 0.045)))}px system-ui`;
      ctx.fillText('z', p.x + frogHeight * (0.32 + k * 0.2), p.y - frogHeight * (0.92 + k * 0.5));
    }
    ctx.globalAlpha = 1;
  }

  const font = width < 600 ? 10 : 11;
  ctx.font = `500 ${font}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const labelW = ctx.measureText(a.name).width + 15;
  ctx.fillStyle = selected === a ? '#526f58' : '#fffffff2';
  roundRect(ctx, p.x - labelW / 2, p.y + 4, labelW, 19, 4); ctx.fill();
  ctx.fillStyle = selected === a ? 'white' : '#5c6b59';
  ctx.fillText(a.name, p.x, p.y + 13.5);
  hitboxes.set(a.id, { x: p.x, y: p.y, w: Math.max(30, frogWidth), h: frogHeight });
}

function itemScreen(item) {
  const p = projectPoint(item.x, item.y);
  const fh = frogHeightAt(p.depth);
  return { p, base: fh * ITEM_BASE, fh };
}

function drawItem(item) {
  const { p, base, fh } = itemScreen(item);
  const img = images[`item-${item.item}`];
  if (!img) return;
  const users = town.agents.filter((a) => a.act && a.act.itemId === item.id && a.act.phase === 'play');
  const inEvent = town.event && town.event.itemId === item.id;
  const drawOne = (dx, dy, scale, rot) => {
    const h = base * scale;
    const w = (h * img.width) / img.height;
    ctx.save();
    ctx.translate(p.x + dx, p.y + dy);
    ctx.rotate(rot);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
    return { w, h };
  };

  let box;
  if (inEvent) {
    const h = base * 1.28;
    const grd = ctx.createRadialGradient(p.x, p.y - h * 0.4, 0, p.x, p.y - h * 0.4, h * 1.5);
    grd.addColorStop(0, 'rgba(255,250,225,0.75)');
    grd.addColorStop(1, 'rgba(255,250,225,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(p.x, p.y - h * 0.4, h * 1.5, 0, Math.PI * 2); ctx.fill();
    box = drawOne(0, 0, 1.28, 0);
  } else if (!users.length) {
    // 没人用时就是地上那一件，带影子
    ctx.fillStyle = '#50634a24';
    ctx.beginPath(); ctx.ellipse(p.x, p.y, base * 0.34, base * 0.11, 0, 0, Math.PI * 2); ctx.fill();
    box = drawOne(0, 0, 1, 0);
  } else {
    // 多人同时互动：每人一份独立副本，互不干扰
    for (const u of users) {
      const k = easeOut(u.act.progress / 0.24);
      const dx = u.act.pose.itemDx * fh * k;
      const dy = u.act.pose.itemDy * fh * k;
      const sc = 1 + (u.act.pose.itemScale - 1) * k;
      const rot = ((u.act.pose.rot || 0) * k * Math.PI) / 180;
      box = drawOne(dx, dy, sc, rot);
    }
  }
  // 命中区仍留在地上那件的位置，方便再次点击
  itemHitboxes.set(item.id, { x: p.x, y: p.y, w: Math.max(26, box.w), h: box.h });
}

function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#edeee8'; ctx.fillRect(0, 0, width, height);
  if (!ready) return;
  ctx.drawImage(images.town, view.x, view.y, images.town.width * view.scale, images.town.height * view.scale);
  hitboxes.clear(); itemHitboxes.clear();

  const drawables = [
    ...town.placed.map((it) => ({ y: projectPoint(it.x, it.y).y, draw: () => drawItem(it) })),
    ...town.agents.filter((a) => !a.hidden).map((a) => ({ y: project(a).y, draw: () => renderAgent(a) })),
  ].sort((a, b) => a.y - b.y);
  for (const d of drawables) d.draw();

  const said = town.lastSaid;
  const bubble = $('bubble');
  const showBubble = said && town.t <= said.until && hitboxes.has(said.agentId);
  if (showBubble) {
    const a = town.byId(said.agentId), h = hitboxes.get(a.id);
    bubble.hidden = false;
    $('bubbleName').textContent = a.name;
    if ($('bubbleText').textContent !== said.text) $('bubbleText').textContent = said.text;
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    bubble.style.left = `${Math.max(10, Math.min(width - bw - 10, h.x - bw / 2))}px`;
    bubble.style.top = `${Math.max(90, h.y - h.h - bh - 12)}px`;
  } else {
    bubble.hidden = true;
  }
  drawGhost();
  drawEvent();
  drawWork();
  drawLighting();
  drawWeather(0.02 * speed);
}

/* ---------------------------------------------------------------- 纪念图合成 */
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
function chip(g, text, x, y, opts = {}) {
  g.font = opts.font || '600 15px system-ui';
  const pad = opts.pad || 9;
  const w = g.measureText(text).width + pad * 2;
  const h = (opts.h || 30);
  const left = opts.right ? x - w : x;
  g.fillStyle = opts.bg || 'rgba(255,255,255,0.92)';
  roundRect(g, left, y, w, h, opts.r || 7); g.fill();
  g.fillStyle = opts.fg || '#3f5c48';
  g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText(text, left + pad, y + h / 2 + 0.5);
  return { w, h, left };
}

function composeTravel(req) {
  const dest = DESTINATIONS.find((d) => d.key === req.dest);
  const bg = images[`travel-${dest.key}`];
  const W = 720, H = 540;
  const c = makeCanvas(W, H), g = c.getContext('2d');
  const s = Math.max(W / bg.width, H / bg.height);
  g.drawImage(bg, (W - bg.width * s) / 2, (H - bg.height * s) / 2, bg.width * s, bg.height * s);
  // 结伴出门时两只同框：一左一右，近的那只略大一点，各自带落地阴影
  const frogs = req.frogs && req.frogs.length ? req.frogs : [req.frog];
  const base = dest.shot.h * H;
  frogs.forEach((name, i) => {
    const scale = frogs.length > 1 ? (i === 0 ? 1 : 0.94) : 1;
    const fh = base * scale;
    const fw = (fh * images.front.width) / images.front.height;
    const fx = dest.shot.x * W + (frogs.length > 1 ? (i === 0 ? -0.11 : 0.12) * W : 0);
    const fy = dest.shot.y * H + (frogs.length > 1 && i === 1 ? 0.016 * H : 0);
    g.fillStyle = 'rgba(60,52,36,0.24)';
    g.beginPath(); g.ellipse(fx, fy, fw * 0.36, fh * 0.052, 0, 0, Math.PI * 2); g.fill();
    g.imageSmoothingQuality = 'high';
    g.drawImage(images.front, fx - fw / 2, fy - fh, fw, fh);
  });
  // 照片标注：目的地 + 奶蛙昵称
  chip(g, `${dest.name} · ${frogs.join('、')}`, 16, H - 54, { font: '600 17px system-ui', h: 34 });
  chip(g, '到此一游', 16, H - 86, { font: '500 13px system-ui', h: 26, bg: 'rgba(255,255,255,0.86)', fg: '#6f8a73' });
  return c.toDataURL('image/jpeg', 0.8);
}

function composePlay(req) {
  const reaction = REACTIONS[req.personality][req.item];
  const pose = reaction.pose;
  const W = 512, H = 512;
  const c = makeCanvas(W, H), g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#fcfbf6'); grad.addColorStop(1, '#eceee5');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  const fh = H * 0.6;
  const fw = (fh * images.front.width) / images.front.height;
  const fx = W * 0.44, fy = H * 0.86;
  g.fillStyle = 'rgba(110,120,100,0.13)';
  g.beginPath(); g.ellipse(fx, fy, fw * 0.5, fh * 0.05, 0, 0, Math.PI * 2); g.fill();

  const itemImg = images[`item-${req.item}`];
  const itemH = fh * ITEM_BASE * pose.itemScale;
  const itemW = (itemH * itemImg.width) / itemImg.height;
  const ix = fx + pose.itemDx * fh;
  const iy = fy + pose.itemDy * fh;
  const rot = ((pose.rot || 0) * Math.PI) / 180;

  g.save();
  g.translate(fx, fy);
  g.scale(pose.frogScale, pose.frogScale);
  g.rotate(rot * 0.5);
  g.drawImage(images.front, -fw / 2, -fh, fw, fh);
  g.restore();

  g.save();
  g.translate(ix, iy);
  g.rotate(rot);
  g.drawImage(itemImg, -itemW / 2, -itemH, itemW, itemH);
  g.restore();

  const title = `${req.frog}与它的新宝贝 · ${ITEMS[req.item].name}`;
  chip(g, title, 16, H - 52, { font: '600 15px system-ui', h: 32 });
  chip(g, `「${reaction.line}」`, 16, H - 88, { font: '500 13px system-ui', h: 28, bg: 'rgba(255,255,255,0.86)', fg: '#6f8a73' });
  return c.toDataURL('image/png');
}

function consumePhotoRequests() {
  for (const req of town.takePhotoRequests()) {
    const key = town.photoKey(req);
    const cached = town.photoCache[key];
    const image_ = cached || (req.kind === 'travel' ? composeTravel(req) : composePlay(req));
    const dest = req.kind === 'travel' ? DESTINATIONS.find((d) => d.key === req.dest) : null;
    const who = req.kind === 'travel' && req.frogs && req.frogs.length > 1 ? req.frogs.join('、') : req.frog;
    let caption;
    if (req.kind === 'travel') {
      const extra = [...(req.beats || [])];
      for (const sk of req.skills || []) extra.push(`${sk.frog}学会了${sk.name}（跟${sk.who}学的）`);
      const luggageText = (req.luggage && req.luggage.length)
        ? `带了${req.luggage.map((k) => (LUGGAGE.find((l) => l.key === k) || {}).name || k).join('、')}`
        : '';
      caption = [`带回${ITEMS[req.item].name}：「${req.quote}」`, luggageText, ...extra].filter(Boolean).join('\n');
    } else {
      caption = `${PERSONALITIES[req.personality].name}：「${reactionLine(req)}」`;
    }
    town.addAlbumPhoto({
      key, kind: req.kind, frog: req.frog,
      item: req.item, dest: req.dest || null,
      title: req.kind === 'travel' ? `${dest.name} · ${who}` : `${req.frog}与它的新宝贝`,
      caption, image: image_, at: Date.now(),
      ext: req.kind === 'play' ? 'png' : 'jpg',
    });
    // 自己出门的，用「回来汇报」卡片告知；玩家派出去的，直接弹照片
    if (req.kind === 'travel' && !req.self) {
      openPhoto(town.album[0]);
      const got = (req.skills || []).map((sk) => `${sk.frog}学会了${sk.name}`).join('，');
      if (got) setTimeout(() => showToast(`回来路上有收获：${got}`), 900);
    }
    else if (req.kind === 'play') showToast(`已存入相册：${req.frog}与它的新宝贝`, '看看', () => openPhoto(town.album[0]));
    renderAlbum();
  }
}
function reactionLine(req) {
  return REACTIONS[req.personality][req.item].line;
}

/* ---------------------------------------------------------------- 界面 */
function select(a, reveal = false) {
  // 奶蛙对象会在 reset / 刷新后重建，按 id 取当前这一只，避免闭包里的旧对象
  selected = town.byId(a.id) || a;
  if (reveal && !panelOpen) togglePanel(true);
  if (reveal) tab('resident');
  document.querySelectorAll('.resident-button').forEach((b) => b.classList.toggle('active', b.dataset.resident === a.id));
  $('profileName').textContent = a.name;
  $('profileRole').textContent = roles[a.idx];
  $('profileTrait').textContent = PERSONALITIES[a.personality]?.name || '安静型';
  $('profileText').textContent = a.identity;
  $('portrait').alt = a.name;
  hud();
}
function tab(name) {
  activeTab = name;
  document.querySelector('.side-scroll').scrollTop = 0;
  document.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
  const panels = { resident: 'residentPanel', stats: 'statsPanel', bag: 'bagPanel', album: 'albumPanel', journal: 'journalPanel' };
  for (const [k, id] of Object.entries(panels)) $(id).hidden = k !== name;
}
function togglePanel(force) {
  panelOpen = typeof force === 'boolean' ? force : !panelOpen;
  document.querySelector('.main').classList.toggle('panel-closed', !panelOpen);
  $('panelToggle').setAttribute('aria-expanded', String(panelOpen));
  requestAnimationFrame(resize);
}
let signature = '';
let statSig = '';

function barColor(v) {
  if (v >= 75) return '#5f9670';
  if (v >= 50) return '#7fa87f';
  if (v >= 30) return '#c3b06a';
  return '#c08b72';
}

// 互动性格：与日程倾向分成两组，字段独立（personality / tendency），可各选一项
function renderPersonalityRow() {
  const row = $('personalityRow');
  if (!row || !selected) return;
  row.replaceChildren();
  for (const key of Object.keys(PERSONALITIES)) {
    const b = document.createElement('button');
    b.className = 'mini' + (selected.personality === key ? ' owner' : '');
    b.textContent = PERSONALITIES[key].name;
    b.setAttribute('aria-pressed', String(selected.personality === key));
    b.onclick = () => {
      const r = town.setPersonality(selected.id, key);
      if (!r.ok) { showToast(r.reason); return; }
      saveTown(town);
      signature = '';
      statSig = '';
      hud();
      showToast(`${selected.name} 的互动性格改为${r.name}，下次互动生效`);
    };
    row.append(b);
  }
}

// 纪念物装饰槽：显示当前戴着什么，可摘下；戴上在背包页
function renderDecoRow() {
  const row = $('decoRow');
  if (!row || !selected) return;
  row.replaceChildren();
  const cur = selected.deco ? DECO[selected.deco] : null;
  const info = document.createElement('span');
  info.className = 'hint';
  info.textContent = cur ? `戴着：${cur.name}` : '还没戴。到「背包 · 广场上的东西」里戴上。';
  row.append(info);
  if (cur) {
    const b = document.createElement('button');
    b.className = 'mini';
    b.textContent = '摘下';
    b.onclick = () => {
      town.clearDeco(selected.id);
      saveTown(town);
      signature = '';
      statSig = '';
      hud();
      showToast(`${selected.name} 摘下了${cur.name}`);
    };
    row.append(b);
  }
}

function renderSchedule() {
  if (!selected) return;
  const t = timeOf(town.t);
  const slot = slotAt(t.hour);
  $('scheduleHint').textContent = `${t.weekday} · ${t.season.name} · 第 ${t.dayInSeason} 天 · ${t.clock} · ${slot.name}${t.festival ? ` · 今日节日：${t.festival.name}` : ''}`;
  const row = $('tendencyRow');
  row.replaceChildren();
  for (const tend of TENDENCIES) {
    const b = document.createElement('button');
    b.className = 'mini' + (selected.tendency === tend.key ? ' owner' : '');
    b.textContent = tend.name;
    b.onclick = () => {
      selected.tendency = tend.key;
      saveTown(town);
      signature = '';
      statSig = '';
      hud();
      showToast(`${selected.name} 的日程倾向改为${tend.name}`);
    };
    row.append(b);
  }
  const note = document.createElement('span');
  note.className = 'hint';
  note.textContent = '倾向只影响安排，仍有随机偏离。';
  row.append(note);

  const list = $('planList');
  list.replaceChildren();
  for (const a of town.agents) {
    const li = document.createElement('li');
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = a.name;
    const body = document.createElement('span');
    let text;
    const trip = town.tripOf(a.id);
    if (trip) {
      const dest = DESTINATIONS.find((d) => d.key === trip.dest);
      text = `出门旅行 · ${dest ? dest.name : ''}（不在广场）`;
    } else if (a.hidden && a.plan) text = `${a.plan.name} · ${SPOTS[a.plan.spot].name}（不在广场）`;
    else if (a.plan) text = `${a.plan.name} · ${SPOTS[a.plan.spot].name}${a.plan.phase === 'go' ? ' · 正在过去' : ''}`;
    else if (a.state === 'talk') text = '正在和人说话';
    else if (t.night) text = '夜里，在家';
    else text = '空闲';
    body.textContent = `${text}　·　倾向 ${TENDENCIES.find((x) => x.key === a.tendency).name}`;
    li.append(who, body);
    list.append(li);
  }
  if (t.festival) {
    const li = document.createElement('li');
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = '节日';
    const body = document.createElement('span');
    body.textContent = `${t.festival.name}：${t.festival.note}`;
    li.append(who, body);
    list.append(li);
  }
}

const CARE_LABEL = { feed: '喂一顿', sleep: '睡一觉', groom: '洗澡' };

/* 季节粒子：冬雪 / 秋叶 / 春花（屏幕坐标，轻量） */
let particles = [];
let particleSeason = null;
function ensureParticles(seasonKey) {
  if (particleSeason === seasonKey) return;
  particleSeason = seasonKey;
  const count = seasonKey === 'winter' ? 60 : seasonKey === 'autumn' ? 34 : seasonKey === 'spring' ? 26 : 0;
  particles = Array.from({ length: count }, () => ({
    x: Math.random(), y: Math.random(),
    vy: 0.02 + Math.random() * 0.05, vx: (Math.random() - 0.5) * 0.03,
    r: 1.2 + Math.random() * 2.2, sway: Math.random() * Math.PI * 2,
  }));
}

function drawLighting() {
  const t = timeOf(town.t);
  const h = t.hours;
  let night = 0;
  if (h < 5) night = 0.42;
  else if (h < 7) night = (0.42 * (7 - h)) / 2;
  else if (h < 17) night = 0;
  else if (h < 20) night = (0.3 * (h - 17)) / 3;
  else night = 0.3 + 0.12 * Math.min(1, (h - 20) / 2);
  if (night > 0.01) {
    ctx.fillStyle = `rgba(38, 48, 78, ${night.toFixed(3)})`;
    ctx.fillRect(0, 0, width, height);
  }
  if (h >= 16 && h < 19) {
    const k = Math.max(0, 0.16 * (1 - Math.abs(h - 17.5) / 1.5));
    if (k > 0.01) {
      ctx.fillStyle = `rgba(255, 196, 120, ${k.toFixed(3)})`;
      ctx.fillRect(0, 0, width, height);
    }
  }
  if (t.season) {
    ctx.fillStyle = t.season.tint;
    ctx.fillRect(0, 0, width, height);
  }
}

function drawWeather(dt) {
  const t = timeOf(town.t);
  if (!t.season) return;
  ensureParticles(t.season.key);
  if (!particles.length) return;
  const color = t.season.key === 'winter' ? 'rgba(255,255,255,0.85)'
    : t.season.key === 'autumn' ? 'rgba(214, 176, 108, 0.75)'
    : 'rgba(246, 226, 200, 0.7)';
  ctx.fillStyle = color;
  for (const p of particles) {
    p.y += p.vy * dt * 3;
    p.sway += dt * 1.4;
    p.x += (p.vx + Math.sin(p.sway) * 0.012) * dt * 3;
    if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
    if (p.x > 1.05) p.x = -0.05;
    if (p.x < -0.05) p.x = 1.05;
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderConditions() {
  if (!selected) return;
  const view = town.conditionView(selected);
  const list = $('condList');
  list.replaceChildren();
  for (const c of CONDITIONS) {
    const v = c.key === 'mood' ? selected.stats.mood : selected.conditions[c.key];
    const goodness = c.higherIsWorse ? 100 - v : v;
    const li = document.createElement('li');
    const head = document.createElement('div');
    head.className = 'stat-head';
    const name = document.createElement('span');
    name.textContent = c.key === 'mood' ? `${c.name} · ${moodLabel(v)}` : c.name;
    const num = document.createElement('strong');
    num.textContent = String(v);
    head.append(name, num);
    const track = document.createElement('div');
    track.className = 'bar';
    const fill = document.createElement('i');
    fill.style.width = `${Math.max(0, Math.min(100, v))}%`;
    fill.style.background = barColor(goodness);
    track.append(fill);
    li.append(head, track);
    list.append(li);
  }

  const chips = $('condChips');
  chips.replaceChildren();
  const debuffs = town.activeDebuffs(selected);
  const buffs = town.activeBuffs(selected);
  if (!debuffs.length && !buffs.length) {
    const em = document.createElement('span');
    em.className = 'hint';
    em.textContent = '当前没有状态影响。';
    chips.append(em);
  }
  for (const d of debuffs) {
    const b = document.createElement('span');
    b.className = 'badge badge--debuff';
    b.textContent = `${d.name}${d.refuse ? '（拒绝互动）' : ''}`;
    chips.append(b);
  }
  for (const b of buffs) {
    const el = document.createElement('span');
    el.className = 'badge badge--buff';
    el.textContent = b.name;
    chips.append(el);
  }

  const row = $('careRow');
  row.replaceChildren();
  for (const kind of CARE_KINDS) {
    const b = document.createElement('button');
    b.className = 'mini';
    const wait = Math.ceil((selected.careAt[kind] || 0) - town.t);
    const ready = wait <= 0;
    b.textContent = ready ? CARE_LABEL[kind] : `${CARE_LABEL[kind]} ${wait}s`;
    b.disabled = !ready;
    b.onclick = () => {
      const r = town.care(selected.id, kind);
      if (!r.ok) showToast(r.reason);
      saveTown(town);
      statSig = '';
      hud();
    };
    row.append(b);
  }
  const note = document.createElement('span');
  note.className = 'hint';
  note.textContent = '不照顾会掉状态并触发 debuff。';
  row.append(note);

  const el = $('eventList');
  el.replaceChildren();
  const mine = town.events.filter((e) => e.frog === selected.name);
  if (!mine.length) {
    const li = document.createElement('li');
    li.className = 'hint';
    li.textContent = '状态好时（精神饱满）才会触发额外事件。';
    el.append(li);
  }
  for (const ev of mine.slice(0, 6)) {
    const li = document.createElement('li');
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = `第 ${ev.day} 天`;
    const body = document.createElement('span');
    body.textContent = ev.text;
    li.append(who, body);
    el.append(li);
  }
}

function renderStats() {
  if (!selected) return;
  renderConditions();
  renderSchedule();
  renderPersonalityRow();
  renderDecoRow();
  const list = $('statList');
  const bonusMap = town.equipBonus(selected);
  const rows = STATS.map((s) => {
    let v;
    if (s.key === 'affinity') {
      const vals = Object.values(selected.affinity);
      v = vals.length ? Math.round((vals.reduce((n, x) => n + x, 0) / vals.length) * 10) / 10 : 50;
    } else {
      v = town.effective(selected, s.key);
    }
    return { s, v, bonus: bonusMap[s.key] || 0 };
  });
  list.replaceChildren();
  for (const { s, v, bonus } of rows) {
    const li = document.createElement('li');
    const head = document.createElement('div');
    head.className = 'stat-head';
    const name = document.createElement('span');
    name.textContent = s.name;
    if (s.key === 'mood') name.textContent = `${s.name} · ${moodLabel(v)}`;
    const num = document.createElement('strong');
    num.textContent = bonus ? `${v}（${selected.stats[s.key]}+${bonus}）` : String(v);
    head.append(name, num);
    const track = document.createElement('div');
    track.className = 'bar';
    const fill = document.createElement('i');
    fill.style.width = `${Math.max(0, Math.min(100, v))}%`;
    fill.style.background = barColor(v);
    track.append(fill);
    li.append(head, track);
    list.append(li);
  }

  const aff = Object.entries(selected.affinity)
    .map(([id, v]) => `${town.byId(id)?.name || id} ${Math.round(v)}`)
    .join('　');
  $('statHint').textContent = `等级 ${rankOf(selected.stats.skill)}　好感明细：${aff || '—'}`;

  const worn = $('wornChips');
  worn.replaceChildren();
  let any = false;
  for (const s of EQUIP_SLOTS) {
    const id = selected.equipped ? selected.equipped[s.key] : null;
    const b = document.createElement('span');
    b.className = 'badge';
    b.textContent = id ? `${s.name}·${EQUIPMENT[id].name}` : `${s.name}·空`;
    if (id) any = true;
    worn.append(b);
  }
  const bonus = town.equipBonus(selected);
  const sum = document.createElement('span');
  sum.className = 'hint';
  sum.textContent = any
    ? `装备加成：${Object.entries(bonus).map(([k, v]) => `${STATS.find((x) => x.key === k)?.name || k} +${v}`).join('　')}`
    : '还没有穿戴任何装备。';
  worn.append(sum);

  const badges = $('badgeList');
  badges.replaceChildren();
  const owned = town.unlockLog.filter(
    (u) => u.frog === selected.name && (u.kind === 'job' || u.kind === 'talent'),
  );
  if (!owned.length) {
    const em = document.createElement('span');
    em.className = 'hint';
    em.textContent = '还没有解锁。数值过阈值会自动解锁。';
    badges.append(em);
  }
  for (const u of owned) {
    const b = document.createElement('span');
    b.className = `badge badge--${u.kind}`;
    b.textContent = `${u.kindLabel}·${u.name}`;
    badges.append(b);
  }

  const ul = $('unlockList');
  ul.replaceChildren();
  if (!town.unlockLog.length) {
    const li = document.createElement('li');
    li.className = 'hint';
    li.textContent = '小镇还没有解锁记录。';
    ul.append(li);
  }
  for (const u of town.unlockLog.slice(0, 10)) {
    const li = document.createElement('li');
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = u.frog;
    const body = document.createElement('span');
    body.textContent = `${u.kindLabel}·${u.name}（第 ${u.day} 天）${u.line ? `　${u.line}` : ''}`;
    li.append(who, body);
    ul.append(li);
  }

  const sl = $('statLogList');
  sl.replaceChildren();
  if (!selected.statLog.length) {
    const li = document.createElement('li');
    li.className = 'hint';
    li.textContent = '还没有行动记录。';
    sl.append(li);
  }
  for (const e of selected.statLog.slice(0, 8)) {
    const li = document.createElement('li');
    const act = document.createElement('span');
    act.className = 'who';
    act.textContent = e.action;
    const body = document.createElement('span');
    body.textContent = Object.entries(e.deltas)
      .map(([k, d]) => `${statName(k)} ${d > 0 ? '+' : ''}${d}`)
      .join('　');
    li.append(act, body);
    sl.append(li);
  }
}

function statName(key) {
  const hit = STATS.find((s) => s.key === key);
  return hit ? hit.name : key;
}
function hud() {
  const tt = timeOf(town.t);
  $('clock').textContent = `第 ${tt.day} 天 · ${tt.weekday} · ${tt.season.name} · ${tt.clock}`;
  $('phase').textContent = tt.hours < 5 ? '深夜' : tt.hours < 8 ? '清晨' : tt.hours < 16 ? '白天' : tt.hours < 19 ? '黄昏' : tt.hours < 22 ? '夜晚' : '深夜';
  $('talkCount').textContent = `对话 ${town.journal.length} 句`;
  $('story').textContent = town.story || '今日尚未记事。';
  const memories = town.agents.flatMap((a) => a.memories.map((m) => ({ ...m, owner: a.name }))).sort((a, b) => b.at - a.at);
  $('memCount').textContent = `记忆 ${memories.length} 条`;
  $('note').textContent = `${town.agents.length} 位居民 · 相册 ${town.album.length} 张 · 消息 ${town.messages.length} 条`;
  const sig = JSON.stringify([memories.slice(0, 30).map((m) => [m.owner, m.text, m.at]), town.placed.length, town.album.length, town.messages.length, town.messages[0]?.read, town.coins, Object.values(town.backpack).reduce((n, b) => n + b.length, 0), town.placed.map((i) => `${i.id}:${i.x.toFixed(2)}:${i.y.toFixed(2)}`).join(','), town.materials, town.owned, selected ? selected.equipped : null]);
  if (sig !== signature) {
    signature = sig;
    $('memlist').replaceChildren();
    if (!memories.length) { const li = document.createElement('li'); li.textContent = '还没有新的记忆。'; $('memlist').append(li); }
    for (const m of memories.slice(0, 30)) {
      const li = document.createElement('li'), name = document.createElement('strong'), imp = document.createElement('span'), body = document.createElement('span');
      name.textContent = m.owner; imp.className = 'importance'; imp.textContent = `重要度 ${m.importance}`;
      name.append(imp); body.textContent = m.text; li.append(name, body); $('memlist').append(li);
    }
    renderWorkshop(); renderAlbum(); renderMessages();
  }
  // 背包与人物栏跟选中项、摆放状态都有关，每次都重绘（节点很少，不会卡）
  renderBag(); renderResidentStrip();
  // 自己出门回来的，主动跟你汇报
  if (lookFrogId && !$('lookCard').hidden) renderLookIn();
  if (town.work && town.work.id !== lastWorkId) {
    lastWorkId = town.work.id;
    const f = town.byId(town.work.frogId);
    if (f) showToast(`${f.name}去${town.work.place}${town.work.role}了`);
  }
  if (town.event && town.event.id !== lastEventId) {
    lastEventId = town.event.id;
    const def = SOUVENIR_EVENTS[town.event.item];
    if (def) showToast(`小镇小事：${def.start}`);
  }
  const unread = town.messages.find((m) => !m.read);
  if (unread && unread.id !== lastReportId && $('lookCard').hidden) { lastReportId = unread.id; showReport(unread); }
  renderSkills(selected);
  if (selected) {
    $('residentState').textContent = town.frozen ? '暂停中'
      : town.tripOf(selected.id) ? '出门旅行'
      : town.work && town.work.frogId === selected.id ? `在${town.work.place}${town.work.role}`
      : selected.act ? '正在玩' : selected.state === 'talk' ? '交谈中'
      : selected.stats.stamina < 20 && selected.rest > 0 ? '体力不支，休息中'
      : '散步中';
    const recent = town.journal.filter((j) => j.from === selected.name).at(-1);
    $('recentSaying').textContent = recent ? recent.text : '还没有新对话。';
    const ssig = JSON.stringify([
      selected.id, selected.stats, selected.affinity, selected.unlocked,
      selected.statLog.slice(0, 8), town.unlockLog.slice(0, 10).map((u) => [u.frog, u.id]),
      selected.conditions, selected.careAt, selected.equipped, town.equipBonus(selected), selected.tendency,
      selected.plan, town.agents.map((x) => x.plan ? x.plan.name + x.plan.phase : '-'),
      town.events.slice(0, 6).map((e) => e.id),
    ]);
    if (ssig !== statSig) { statSig = ssig; renderStats(); }
  }
}

// 旅行中只在左下角人物栏显示：头像压暗 + 一枚小徽标，不遮画面
function renderResidentStrip() {
  for (const a of town.agents) {
    const btn = document.querySelector(`.resident-button[data-resident="${a.id}"]`);
    if (!btn) continue;
    const trip = town.tripOf(a.id);
    btn.classList.toggle('is-away', !!trip);
    const badge = btn.querySelector('.resident-badge');
    if (!badge) continue;
    badge.hidden = !trip;
    if (trip) {
      const dest = DESTINATIONS.find((d) => d.key === trip.dest);
      badge.textContent = (trip.phase === 'away' ? '旅行中 · ' : '在路上 · ') + (dest ? dest.name : '');
    }
  }
}

// 角色资料里的技能：名称、跟谁学的、学过几次、最近一次的经历
function renderSkills(frog) {
  const list = $('skillList');
  if (!list) return;
  list.replaceChildren();
  const skills = (frog && frog.skills) || [];
  if (!skills.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = '还没有学到什么。出门旅行有时会学到东西。';
    list.append(li);
    return;
  }
  for (const sk of skills) {
    const li = document.createElement('li');
    const t = document.createElement('strong');
    t.textContent = `${sk.name}${sk.count > 1 ? ` ×${sk.count}` : ''}`;
    const recent = (sk.experiences || [])[0];
    const meta = document.createElement('span');
    meta.className = 'skill-meta';
    meta.textContent = recent
      ? `跟${recent.who}学的 · ${recent.where} · 第 ${recent.day} 天${sk.count > 1 ? ` · 一共学过 ${sk.count} 次` : ''}`
      : '';
    const story = document.createElement('span');
    story.className = 'skill-story';
    story.textContent = recent ? recent.story : '';
    li.append(t, meta, story);
    list.append(li);
  }
}

// 技能上手：在店门口挂一个小牌子，让人看得出它在干什么
let lastWorkId = null;
function drawWork() {
  const w = town.work;
  if (!w || !ready) return;
  const f = town.byId(w.frogId);
  if (!f) return;
  const p = project(f);
  const fh = frogHeightAt(p.depth);
  const label = `${w.place} · ${w.role}`;
  ctx.font = '600 11px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const wd = ctx.measureText(label).width + 18;
  const ly = p.y + 26;   // 挂在名字下方，避免和头顶的对话气泡打架
  ctx.fillStyle = 'rgba(238,246,236,0.96)';
  roundRect(ctx, p.x - wd / 2, ly - 9, wd, 18, 9); ctx.fill();
  ctx.strokeStyle = 'rgba(150,180,152,0.75)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#3f6a49';
  ctx.fillText(label, p.x, ly + 0.5);
  // 岗位上的一点动静：小圈一点点扩散
  const k = (town.t * 0.5) % 1;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, fh * (0.26 + k * 0.5), fh * (0.09 + k * 0.18), 0, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(150,175,150,${0.3 * (1 - k)})`;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

// 纪念物小事件：只在纪念物上方画一点动静，不占画面
let lastEventId = null;
function drawEvent() {
  const ev = town.event;
  if (!ev || !ready) return;
  const item = town.placed.find((p) => p.id === ev.itemId);
  if (!item) return;
  const p = projectPoint(item.x, item.y);
  const fh = frogHeightAt(p.depth);
  const t = town.t;
  if (ev.key === 'tide') {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.5 + i / 3) % 1;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, fh * (0.34 + k * 0.95), fh * (0.11 + k * 0.34), 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(122,152,170,${0.34 * (1 - k)})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  } else if (ev.key === 'fireflies') {
    for (let i = 0; i < 7; i++) {
      const a = t * 0.6 + i * 1.05;
      const r = fh * (0.72 + 0.24 * Math.sin(t * 0.9 + i * 1.7));
      const x = p.x + Math.cos(a) * r;
      const y = p.y - fh * 0.85 + Math.sin(a * 1.3) * fh * 0.34;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, fh * 0.11);
      grd.addColorStop(0, 'rgba(255,246,180,0.95)');
      grd.addColorStop(1, 'rgba(255,246,180,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x, y, fh * 0.11, 0, Math.PI * 2); ctx.fill();
    }
  } else if (ev.key === 'music') {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.8 + i / 3) % 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y - fh * 0.6, fh * (0.34 + k * 0.8), -Math.PI * 0.78, -Math.PI * 0.22);
      ctx.strokeStyle = `rgba(152,122,92,${0.4 * (1 - k)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  const label = ev.name;
  ctx.font = '600 11px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(label).width + 20;
  const ly = Math.max(14, p.y - fh * 2.05);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, p.x - w / 2, ly - 11, w, 22, 11); ctx.fill();
  ctx.strokeStyle = 'rgba(150,170,150,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#4f7256';
  ctx.fillText(label, p.x, ly + 0.5);
}

function renderBag() {
  const name = selected?.name;
  const bag = town.backpack[name] || [];
  const list = $('bagList');
  list.replaceChildren();
  $('bagHint').textContent = bag.length ? '放在广场上，别的奶蛙也会来玩。' : '出门旅行会带回纪念品。';
  for (const [bagOwner, bag] of Object.entries(town.backpack)) {
    for (const entry of bag) {
      const li = document.createElement('li');
      const img = document.createElement('img'); img.src = ITEMS[entry.item].file; img.alt = ITEMS[entry.item].name;
      const meta = document.createElement('div'); meta.className = 'meta';
      const t = document.createElement('strong'); t.textContent = `${ITEMS[entry.item].name} · ${bagOwner} 带回`;
      const q = document.createElement('span'); q.textContent = `来自${entry.from}　「${entry.quote}」`;
      meta.append(t, q);
      const ops = document.createElement('div'); ops.className = 'ops';
      const put = document.createElement('button'); put.className = 'mini'; put.textContent = '放到广场';
      put.onclick = () => beginPlacement('new', { ownerName: bagOwner, souvenirId: entry.id, item: entry.item });
      ops.append(put);
      li.append(img, meta, ops);
      list.append(li);
    }
  }
  if (!bag.length) {
    const li = document.createElement('li');
    li.style.gridTemplateColumns = '1fr';
    li.innerHTML = '<span class="hint">背包是空的。</span>';
    list.append(li);
  }

  const placedList = $('placedList');
  placedList.replaceChildren();
  for (const it of town.placed) {
    const li = document.createElement('li');
    const img = document.createElement('img'); img.src = ITEMS[it.item].file; img.alt = ITEMS[it.item].name;
    const meta = document.createElement('div'); meta.className = 'meta';
    const t = document.createElement('strong'); t.textContent = `${ITEMS[it.item].name} · ${it.owner} 带回来的`;
    const q = document.createElement('span'); q.textContent = `「${it.quote}」`;
    meta.append(t, q);
    const ops = document.createElement('div'); ops.className = 'ops';
    const move = document.createElement('button');
    move.className = 'mini';
    move.textContent = '挪一挪';
    move.onclick = () => beginPlacement('move', { itemId: it.id, item: it.item, ownerName: it.owner });
    const take = document.createElement('button');
    take.className = 'mini owner';
    take.textContent = '收回背包';
    take.onclick = () => {
      const r = town.retrieveToBackpack(it.id);
      if (!r.ok) showToast(r.reason);
      else showToast(`收回了${ITEMS[it.item].name}，回到 ${r.owner} 的背包`);
      saveTown(town); signature = ''; statSig = ''; hud();
    };
    const wear = document.createElement('button');
    wear.className = 'mini';
    const wearing = !!(selected && selected.deco === it.item);
    wear.textContent = wearing ? '摘下' : '戴上';
    wear.disabled = !selected;
    wear.title = selected ? (wearing ? '摘下这件装饰' : `让${selected.name}戴上`) : '先选一只奶蛙';
    wear.onclick = () => {
      if (!selected) return;
      const r = wearing ? town.clearDeco(selected.id) : town.setDeco(selected.id, it.item);
      if (!r.ok) { showToast(r.reason); return; }
      saveTown(town);
      signature = '';
      statSig = '';
      hud();
      showToast(wearing
        ? `${selected.name} 摘下了${DECO[it.item].name}`
        : `${selected.name} 戴上了${DECO[it.item].name}`);
    };
    ops.append(wear, move, take);
    li.append(img, meta, ops);
    placedList.append(li);
  }
  if (!town.placed.length) {
    const li = document.createElement('li');
    li.style.gridTemplateColumns = '1fr';
    li.innerHTML = '<span class="hint">广场上还没有摆放东西。</span>';
    placedList.append(li);
  }
}

function bonusText(item) {
  const parts = Object.entries(item.bonuses).map(([k, v]) => {
    const s = STATS.find((x) => x.key === k);
    return `${s ? s.name : k} +${v}`;
  });
  return parts.length ? parts.join('　') : '无加成';
}

function renderWorkshop() {
  $('coinCount').textContent = `奶币 ${Math.round(town.coins)}`;

  const mat = $('matList');
  mat.replaceChildren();
  for (const k of MATERIAL_KEYS) {
    const li = document.createElement('li');
    const img = document.createElement('img'); img.src = MATERIALS[k].file; img.alt = MATERIALS[k].name;
    const meta = document.createElement('div'); meta.className = 'meta';
    const t = document.createElement('strong'); t.textContent = `${MATERIALS[k].name} ×${town.materials[k] || 0}`;
    meta.append(t);
    li.append(img, meta);
    mat.append(li);
  }

  const slots = $('slotList');
  slots.replaceChildren();
  for (const s of EQUIP_SLOTS) {
    const id = selected && selected.equipped ? selected.equipped[s.key] : null;
    const li = document.createElement('li');
    const meta = document.createElement('div'); meta.className = 'meta';
    const t = document.createElement('strong'); t.textContent = `${s.name}：${id ? EQUIPMENT[id].name : '空着'}`;
    const b = document.createElement('span'); b.textContent = id ? bonusText(EQUIPMENT[id]) : '—';
    meta.append(t, b);
    const ops = document.createElement('div'); ops.className = 'ops';
    if (id) {
      const btn = document.createElement('button');
      btn.className = 'mini owner';
      btn.textContent = '脱下';
      btn.onclick = () => {
        const r = town.unequipSlot(selected.id, s.key);
        if (!r.ok) showToast(r.reason);
        saveTown(town); signature = ''; statSig = ''; hud();
      };
      ops.append(btn);
    }
    li.append(meta, ops);
    slots.append(li);
  }

  // 可以穿的：持有中、或穿在别的奶蛙身上
  const wear = $('wearList');
  wear.replaceChildren();
  const wearRows = [];
  for (const k of EQUIPMENT_KEYS) {
    const eq = EQUIPMENT[k];
    const owner = town.agents.find((a) => a.equipped && a.equipped[eq.slot] === k);
    const free = town.owned[k] || 0;
    if (!free && !owner) continue;
    wearRows.push({ k, eq, owner: owner || null, free });
  }
  if (!wearRows.length) {
    const li = document.createElement('li');
    li.style.gridTemplateColumns = '1fr';
    li.innerHTML = '<span class="hint">还没有可以穿的东西。先在下面制作，或去小卖部买。</span>';
    wear.append(li);
  }
  for (const { k, eq, owner, free } of wearRows) {
    const li = document.createElement('li');
    const img = document.createElement('img'); img.src = eq.file; img.alt = eq.name;
    const meta = document.createElement('div'); meta.className = 'meta';
    const t = document.createElement('strong'); t.textContent = `${eq.name}（${EQUIP_SLOTS.find((s) => s.key === eq.slot).name} · ${bonusText(eq)}）`;
    const state = document.createElement('span');
    state.textContent = owner
      ? `现在在 ${owner.name} 身上${free ? `，另有 ${free} 件` : ''}`
      : `持有 ${free} 件`;
    meta.append(t, state);
    const ops = document.createElement('div'); ops.className = 'ops';
    if (free > 0 && (!selected || !selected.equipped || selected.equipped[eq.slot] !== k)) {
      const put = document.createElement('button');
      put.className = 'mini owner';
      put.textContent = selected ? `给${selected.name}穿上` : '穿上';
      put.onclick = () => {
        const r = town.equipItem(selected.id, k);
        if (!r.ok) showToast(r.reason);
        saveTown(town); signature = ''; statSig = ''; hud();
      };
      ops.append(put);
    }
    if (owner && selected && owner.id !== selected.id) {
      const take = document.createElement('button');
      take.className = 'mini';
      take.textContent = `从${owner.name}取来`;
      take.onclick = () => {
        const off = town.unequipSlot(owner.id, eq.slot);
        if (!off.ok) { showToast(off.reason); return; }
        const put = town.equipItem(selected.id, k);
        if (!put.ok) showToast(put.reason);
        saveTown(town); signature = ''; statSig = ''; hud();
      };
      ops.append(take);
    }
    li.append(img, meta, ops);
    wear.append(li);
  }

  const craft = $('craftList');
  craft.replaceChildren();
  for (const k of EQUIPMENT_KEYS) {
    const eq = EQUIPMENT[k];
    const li = document.createElement('li');
    const img = document.createElement('img'); img.src = eq.file; img.alt = eq.name;
    const meta = document.createElement('div'); meta.className = 'meta';
    const t = document.createElement('strong'); t.textContent = `${eq.name}（${bonusText(eq)}）`;
    const cost = Object.entries(eq.cost).map(([m, n]) => `${MATERIALS[m].name}×${n}`).join('＋');
    const s = document.createElement('span');
    s.textContent = `配方：${cost}　持有 ${town.owned[k] || 0}`;
    meta.append(t, s);
    const ops = document.createElement('div'); ops.className = 'ops';
    const can = town.canCraft(k);
    const btn = document.createElement('button');
    btn.className = 'mini';
    btn.textContent = '制作';
    btn.disabled = !can.ok;
    btn.title = can.ok ? '' : can.reason;
    btn.onclick = () => {
      const r = town.craft(k, selected ? selected.id : undefined);
      if (!r.ok) { showToast(r.reason); return; }
      showToast(`做好了${eq.name}，去「可以穿的」里给它穿上`);
      saveTown(town); signature = ''; statSig = ''; hud();
    };
    ops.append(btn);
    li.append(img, meta, ops);
    craft.append(li);
  }

  const shop = $('shopList');
  shop.replaceChildren();
  for (const k of MATERIAL_KEYS) {
    const price = materialPrice(k);
    const li = document.createElement('li');
    const img = document.createElement('img'); img.src = MATERIALS[k].file; img.alt = MATERIALS[k].name;
    const meta = document.createElement('div'); meta.className = 'meta';
    const t = document.createElement('strong'); t.textContent = `${MATERIALS[k].name} · 奶币 ${price}`;
    meta.append(t);
    const ops = document.createElement('div'); ops.className = 'ops';
    const btn = document.createElement('button');
    btn.className = 'mini';
    btn.textContent = '买 1';
    btn.disabled = town.coins < price;
    btn.onclick = () => {
      const r = town.buyMaterial(k, 1);
      if (!r.ok) { showToast(r.reason); return; }
      saveTown(town); signature = ''; statSig = ''; hud();
    };
    ops.append(btn);
    li.append(img, meta, ops);
    shop.append(li);
  }
  for (const k of EQUIPMENT_KEYS) {
    const eq = EQUIPMENT[k];
    if (!eq.price) continue;
    const li = document.createElement('li');
    const img = document.createElement('img'); img.src = eq.file; img.alt = eq.name;
    const meta = document.createElement('div'); meta.className = 'meta';
    const t = document.createElement('strong'); t.textContent = `${eq.name} · 奶币 ${eq.price}`;
    const s = document.createElement('span'); s.textContent = bonusText(eq);
    meta.append(t, s);
    const ops = document.createElement('div'); ops.className = 'ops';
    const btn = document.createElement('button');
    btn.className = 'mini';
    btn.textContent = '买下';
    btn.disabled = town.coins < eq.price;
    btn.onclick = () => {
      const r = town.buyItem(k);
      if (!r.ok) { showToast(r.reason); return; }
      showToast(`买下了${eq.name}`);
      saveTown(town); signature = ''; statSig = ''; hud();
    };
    ops.append(btn);
    li.append(img, meta, ops);
    shop.append(li);
  }
}

/* ---------------------------------------------------------------- 点开旅行中的头像 */
// 只弹一张左下角小卡：目的地缩略图 + 此刻它在做什么，不占满画面
let lookFrogId = null;

function openLookIn(frog) {
  if (!town.tripLookIn(frog.id)) return;
  lookFrogId = frog.id;
  renderLookIn();
  $('lookCard').hidden = false;
  $('reportCard').hidden = true;   // 两张卡都在左下角，先让位
}

function closeLookIn() {
  lookFrogId = null;
  $('lookCard').hidden = true;
}

function renderLookIn() {
  if (!lookFrogId) return;
  const frog = town.byId(lookFrogId);
  const info = frog && town.tripLookIn(frog.id);
  if (!info) { closeLookIn(); return; }   // 回来了就自动收起来
  $('lookThumb').src = `assets/travel-${info.dest}.webp`;
  $('lookName').textContent = `${frog.name} · ${info.destName}${info.joint ? '（结伴）' : ''}`;
  $('lookPhase').textContent = info.phase === 'away' ? '正在目的地' : '在路上';
  $('lookLines').textContent = info.lines.join('\n');
  $('lookMeta').textContent = info.phase === 'away'
    ? `在外面待了约 ${info.hours} 小时`
    : '还没走到 / 正在往回走';
}

$('lookClose').onclick = () => closeLookIn();

/* ---------------------------------------------------------------- 自由摆放 */
// 放置者自己挑位置：进入摆放模式后，物品跟着指针走，点在广场上放下（Esc 或「取消」退出）
let placement = null;
let suppressClick = false;

function unproject(sx, sy) {
  const px = ((sx - view.x) / (images.town.width * view.scale)) * 1200;
  const py = ((sy - view.y) / (images.town.height * view.scale)) * 896;
  const det = 255 * 145 + 270 * 140;
  const u = (145 * (px - 610) + 270 * (py - 438)) / det;
  const v = (255 * (py - 438) - 140 * (px - 610)) / det;
  return { x: 1 + 24 * u, y: 1 + 13 * v };
}

function beginPlacement(mode, payload) {
  placement = { mode, item: payload.item, x: 0, y: 0, valid: false, ...payload };
  // 先放在广场中间，避免还没移动时状态是空的
  placement.x = 12.5;
  placement.y = 9.5;
  placement.valid = true;
  $('placeText').textContent = mode === 'new'
    ? `把${ITEMS[payload.item].name}放到你想放的地方`
    : `把${ITEMS[payload.item].name}挪到新位置`;
  $('placeBar').hidden = false;
  showToast(mode === 'new' ? '点广场空地放下' : '点广场空地挪过去');
  document.querySelector('.stage').scrollIntoView({ block: 'nearest' });
}

function cancelPlacement() {
  placement = null;
  $('placeBar').hidden = true;
}

function updateGhost(sx, sy) {
  if (!placement) return;
  const p = unproject(sx, sy);
  placement.x = Math.min(25, Math.max(1, p.x));
  placement.y = Math.min(14, Math.max(1, p.y));
  placement.valid = town.canPlaceAt(placement.x, placement.y, placement.mode === 'move' ? placement.itemId : null);
}

function commitPlacement() {
  const pl = placement;
  if (!pl) return;
  if (!pl.valid) { showToast('这里放不下，换个空一点的地方。'); return; }
  const res = pl.mode === 'new'
    ? town.placeAt(pl.ownerName, pl.souvenirId, pl.x, pl.y)
    : town.movePlaced(pl.itemId, pl.x, pl.y);
  if (!res.ok) { showToast(res.reason); return; }
  cancelPlacement();
  saveTown(town);
  signature = '';
  hud();
  showToast(pl.mode === 'new' ? `${ITEMS[pl.item].name}放好了` : '挪好了');
}

function drawGhost() {
  if (!placement || !ready) return;
  const img = images[`item-${placement.item}`];
  if (!img) return;
  const p = projectPoint(placement.x, placement.y);
  const h = frogHeightAt(p.depth) * ITEM_BASE;
  const w = (h * img.width) / img.height;
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, h * 0.34, h * 0.11, 0, 0, Math.PI * 2);
  ctx.fillStyle = placement.valid ? 'rgba(80,110,80,0.22)' : 'rgba(170,70,60,0.22)';
  ctx.fill();
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, p.x - w / 2, p.y - h, w, h);
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, h * 0.44, h * 0.16, 0, 0, Math.PI * 2);
  ctx.strokeStyle = placement.valid ? '#5d8a63' : '#b4553f';
  ctx.lineWidth = 2;
  ctx.stroke();
}

$('placeCancel').onclick = () => cancelPlacement();
window.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (placement) cancelPlacement(); if (lookFrogId) closeLookIn(); });

function showToast(text, actionLabel, action) {
  const t = $('toast');
  t.replaceChildren();
  const span = document.createElement('span'); span.textContent = text;
  t.append(span);
  if (actionLabel) {
    const b = document.createElement('button'); b.textContent = actionLabel; b.onclick = () => { action?.(); t.hidden = true; };
    t.append(b);
  }
  t.hidden = false;
  clearTimeout(lastToastTimer);
  lastToastTimer = setTimeout(() => { t.hidden = true; }, actionLabel ? 8000 : 2600);
}

function renderAlbum() {
  const box = $('album');
  box.replaceChildren();
  if (!town.album.length) {
    const d = document.createElement('div');
    d.className = 'empty';
    d.textContent = '还没有照片。出门旅行，或者让奶蛙去玩广场上的东西。';
    box.append(d);
    return;
  }
  for (const photo of town.album) {
    const fig = document.createElement('figure');
    const img = document.createElement('img'); img.src = photo.image; img.alt = photo.title;
    const cap = document.createElement('figcaption'); cap.textContent = photo.title;
    const dl = document.createElement('button'); dl.className = 'dl'; dl.title = '下载照片';
    dl.innerHTML = '<i data-lucide="download"></i>';
    dl.onclick = () => download(photo.image, `${photo.title}.${photo.ext === 'png' ? 'png' : 'jpg'}`);
    fig.append(img, dl, cap);
    box.append(fig);
  }
  window.lucide?.createIcons();
}

/* 奶蛙自己出门回来后的汇报：卡片 + 手记里的消息列表 */
let lastReportId = null;
let reportTimer = 0;

function messageTime(m) {
  return `第 ${m.day} 天`;
}

function showReport(m) {
  const card = $('reportCard');
  // 结伴回来是两个人在讲同一段旅途，逐句列出来
  const joint = Array.isArray(m.turns) && m.turns.length > 0;
  $('reportName').textContent = joint ? m.turns.map((t) => t.who).filter((v, i, a) => a.indexOf(v) === i).join('、') : m.frog;
  const lines = joint ? m.turns.map((t) => `${t.who}：${t.text}`) : [m.line];
  // 行李、路上情节、学到的技能都写在同一条汇报里
  const parts = [];
  if (Array.isArray(m.luggage) && m.luggage.length) {
    parts.push(`带了${m.luggage.map((k) => (LUGGAGE.find((l) => l.key === k) || {}).name || k).join('、')}`);
  }
  const beats = Array.isArray(m.beats) ? m.beats : [];
  for (const sk of Array.isArray(m.skills) ? m.skills : []) {
    const who = joint ? `${sk.frog}：` : '';
    parts.push(`${who}学会了${sk.name}（跟${sk.who}学的${sk.isNew ? '' : '，又学了一次'}）`);
  }
  $('reportLine').textContent = [...lines, ...beats].join('\n');
  $('reportItem').textContent = [`带回${ITEMS[m.item].name} · 来自${m.destName}`, ...parts].join(' · ');
  $('reportPhoto').hidden = !town.album.some((p) => p.key === m.photoKey);
  card.hidden = false;
  card.classList.remove('leaving');
  clearTimeout(reportTimer);
  reportTimer = setTimeout(() => dismissReport(m.id), 14000);
}

function dismissReport(id) {
  const card = $('reportCard');
  if (!card.hidden) {
    card.classList.add('leaving');
    setTimeout(() => { card.hidden = true; card.classList.remove('leaving'); }, 260);
  }
  clearTimeout(reportTimer);
  if (id) town.markMessageRead(id);
  saveTown(town);
  hud();
}

function renderMessages() {
  const list = $('msgList');
  list.replaceChildren();
  if (!town.messages.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = '还没有消息。奶蛙有时会自己出门，回来会跟你说。';
    list.append(li);
    return;
  }
  for (const m of town.messages.slice(0, 8)) {
    const li = document.createElement('li');
    const joint = Array.isArray(m.turns) && m.turns.length > 0;
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = joint ? m.turns.map((t) => t.who).filter((v, i, a) => a.indexOf(v) === i).join('、') : m.frog;
    const body = document.createElement('span');
    if (!m.read) body.className = 'unread';
    const said = joint ? m.turns.map((t) => `${t.who}：${t.text}`).join(' ') : m.line;
    body.textContent = `${said}（${messageTime(m)}）`;
    li.append(who, body);
    list.append(li);
  }
}

function download(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename;
  document.body.append(a); a.click(); a.remove();
}

let currentPhoto = null;
function openPhoto(photo) {
  if (!photo) return;
  currentPhoto = photo;
  $('photoImg').src = photo.image;
  $('photoTitle').textContent = photo.title;
  $('photoCaption').textContent = photo.caption || '';
  $('photoModal').hidden = false;
  window.lucide?.createIcons();
}
$('photoClose').onclick = () => { $('photoModal').hidden = true; };
$('reportOk').onclick = () => {
  const unread = town.messages.find((m) => !m.read);
  dismissReport(unread?.id);
};
$('reportPhoto').onclick = () => {
  const m = town.messages.find((x) => !x.read) || town.messages[0];
  const photo = m && town.album.find((p) => p.key === m.photoKey);
  if (photo) openPhoto(photo);
  else showToast('这张照片还在冲洗。');
};
$('photoDownload').onclick = () => currentPhoto && download(currentPhoto.image, `${currentPhoto.title}.${currentPhoto.ext === 'png' ? 'png' : 'jpg'}`);
$('closeTravel').onclick = () => { $('travelSheet').hidden = true; };

/* ---------------------------------------------------------------- 旅行 */
let travelLuggage = [];

function renderLuggageChips() {
  const box = $('luggageChips');
  if (!box) return;
  box.replaceChildren();
  for (const l of LUGGAGE) {
    const b = document.createElement('button');
    const on = travelLuggage.includes(l.key);
    b.className = 'luggage-chip' + (on ? ' on' : '');
    b.textContent = l.name;
    b.setAttribute('aria-pressed', String(on));
    b.disabled = !on && travelLuggage.length >= LUGGAGE_MAX;
    b.onclick = () => {
      travelLuggage = on ? travelLuggage.filter((k) => k !== l.key) : [...travelLuggage, l.key];
      renderLuggageChips();
    };
    box.append(b);
  }
}

function openTravel() {
  const frog = selected;
  if (!frog) return;
  if (town.trip) { showToast('已经有一只奶蛙在路上。'); return; }
  pendingTravelFrog = frog;
  travelLuggage = [];
  renderLuggageChips();
  $('travelWho').textContent = `${frog.name}（${PERSONALITIES[frog.personality]?.name}）要去哪里？可以顺手带点东西，也可以空手出门。`;
  const list = $('destList');
  list.replaceChildren();
  for (const d of DESTINATIONS) {
    const b = document.createElement('button');
    b.className = 'dest';
    const left = document.createElement('div');
    const t = document.createElement('strong'); t.textContent = d.name;
    const s = document.createElement('span'); s.textContent = `带回${ITEMS[d.item].name}　「${d.quote}」`;
    left.append(t, s);
    const em = document.createElement('em'); em.textContent = '出发';
    b.append(left, em);
    b.onclick = () => {
      const r = town.startTrip(frog.id, d.key, { luggage: travelLuggage });
      $('travelSheet').hidden = true;
      if (!r.ok) { showToast(r.reason); return; }
      saveTown(town);
      const withWhat = travelLuggage.length
        ? `，带着${travelLuggage.map((k) => LUGGAGE.find((l) => l.key === k).name).join('、')}`
        : '，空手出门';
      showToast(`${frog.name} 出发去${d.name}了${withWhat}`);
    };
    list.append(b);
  }
  $('travelSheet').hidden = false;
  window.lucide?.createIcons();
}

/* ---------------------------------------------------------------- 交互 */
canvas.addEventListener('click', (e) => {
  if (suppressClick) { suppressClick = false; return; }
  if (placement) return;                    // 摆放模式由 pointer 事件接管
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  // 先看物品，再看奶蛙
  for (const [id, h] of [...itemHitboxes].reverse()) {
    if (Math.abs(x - h.x) < h.w / 2 + 6 && y > h.y - h.h - 6 && y < h.y + 12) {
      if (!selected) { showToast('先选一只奶蛙。'); return; }
      const res = town.startInteraction(selected.id, id);
      if (!res.ok) showToast(res.reason);
      else { saveTown(town); tab('resident'); hud(); }
      return;
    }
  }
  for (const [id, h] of [...hitboxes].reverse()) {
    if (Math.abs(x - h.x) < h.w / 2 + 8 && y > h.y - h.h - 5 && y < h.y + 25) { select(town.byId(id), true); break; }
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (!placement) return;
  const r = canvas.getBoundingClientRect();
  updateGhost(e.clientX - r.left, e.clientY - r.top);
});
canvas.addEventListener('pointerdown', (e) => {
  if (!placement) return;
  const r = canvas.getBoundingClientRect();
  updateGhost(e.clientX - r.left, e.clientY - r.top);
});
canvas.addEventListener('pointerup', (e) => {
  if (!placement) return;
  const r = canvas.getBoundingClientRect();
  updateGhost(e.clientX - r.left, e.clientY - r.top);
  suppressClick = true;
  commitPlacement();
});
canvas.addEventListener('wheel', (e) => { e.preventDefault(); setZoom(zoom - Math.sign(e.deltaY) * 0.06); }, { passive: false });
function setZoom(value) { zoom = Math.min(1.55, Math.max(0.85, value)); updateView(); }
$('zoomIn').onclick = () => setZoom(zoom + 0.1);
$('zoomOut').onclick = () => setZoom(zoom - 0.1);
$('zoomReset').onclick = () => setZoom(1);
$('panelToggle').onclick = () => togglePanel();
$('travel').onclick = openTravel;
document.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => tab(b.dataset.tab)));
$('writeStory').onclick = () => { town.writeStory(); saveTown(town); hud(); };
$('freeze').onclick = () => {
  town.frozen = !town.frozen;
  $('freeze').setAttribute('aria-pressed', String(town.frozen));
  $('freeze').innerHTML = `<i data-lucide="${town.frozen ? 'play' : 'pause'}"></i>${town.frozen ? '继续' : '暂停'}`;
  window.lucide?.createIcons(); hud();
};
document.querySelectorAll('[data-speed]').forEach((b) => (b.onclick = () => {
  speed = Number(b.dataset.speed);
  document.querySelectorAll('[data-speed]').forEach((n) => n.classList.toggle('active', n === b));
}));
$('reset').onclick = () => {
  if (!confirm('重置会删除此浏览器里保存的小镇记忆、背包和相册。确定重置吗？')) return;
  town.reset(null); lastDay = town.day; signature = ''; town.lastSaid = null;
  selected = town.agents[0]; select(selected); saveTown(town); hud();
};
window.addEventListener('pagehide', () => saveTown(town));
document.addEventListener('visibilitychange', () => { if (document.hidden) saveTown(town); last = performance.now(); });

/* ---------------------------------------------------------------- 主循环 */
function frame(now) {
  const dt = Math.min(0.06, (now - last) / 1000) * speed;
  last = now;
  town.step(dt);
  consumePhotoRequests();
  if (town.day !== lastDay) { lastDay = town.day; town.writeStory(); }

  if (now - lastHud > 400) { lastHud = now; hud(); }
  if (now - lastSave > 5000) { lastSave = now; saveTown(town); }
  render();
  requestAnimationFrame(frame);
}

async function boot() {
  try {
    const keys = ['town'];
    const loaders = [
      image('assets/town-isometric.webp'),
      image('assets/frog-front.png'),
      image('assets/frog-side.png'),
      image('assets/frog-back.png'),
      ...Object.values(ITEMS).map((i) => image(i.file)),
      ...DESTINATIONS.map((d) => image(d.backdrop)),
      ...EQUIPMENT_KEYS.map((k) => image(EQUIPMENT[k].file)),
      ...MATERIAL_KEYS.map((k) => image(MATERIALS[k].file)),
    ];
    const [townImg, front, side, back, ...rest] = await Promise.all(loaders);
    images.town = townImg; images.front = front; images.side = side; images.back = back;
    const itemKeys = Object.values(ITEMS).map((i) => i.key);
    itemKeys.forEach((k, i) => { images[`item-${k}`] = rest[i]; });
    DESTINATIONS.forEach((d, i) => { images[`travel-${d.key}`] = rest[itemKeys.length + i]; });
    const base = itemKeys.length + DESTINATIONS.length;
    EQUIPMENT_KEYS.forEach((k, i) => { images[`equip-${k}`] = rest[base + i]; });
    MATERIAL_KEYS.forEach((k, i) => { images[`mat-${k}`] = rest[base + EQUIPMENT_KEYS.length + i]; });

    for (const a of town.agents) {
      const b = document.createElement('button');
      b.className = 'resident-button'; b.dataset.resident = a.id; b.setAttribute('aria-label', `查看${a.name}`);
      const img = document.createElement('img'); img.src = 'assets/frog-front.png'; img.alt = '';
      const badge = document.createElement('span'); badge.className = 'resident-badge'; badge.hidden = true;
      const name = document.createElement('span'); name.textContent = a.name;
      b.append(img, badge, name);
      b.onclick = () => {
        if (town.tripOf(a.id)) openLookIn(a);
        else { closeLookIn(); select(a, true); }
      };
      $('residents').append(b);
    }
    ready = true;
    $('loadState').hidden = true;
    resize(); select(selected); hud(); renderAlbum();
    last = performance.now();
    requestAnimationFrame(frame);
  } catch (e) {
    $('loadState').classList.add('error');
    $('loadState').textContent = e.message;
    const b = document.createElement('button'); b.textContent = '重新载入'; b.onclick = () => location.reload();
    $('loadState').append(b);
    console.error(e);
  }
}
new ResizeObserver(resize).observe(canvas.parentElement);
window.__town = town;
window.__view = () => ({ ...view, width, height, ready, hitboxes: Object.fromEntries(hitboxes), itemHitboxes: Object.fromEntries(itemHitboxes) });
window.__compose = { travel: composeTravel, play: composePlay };
window.__projPoint = projectPoint;
window.__placement = () => placement;
window.__reactions = REACTIONS;
window.__items = ITEMS;
window.__timeOf = timeOf;
window.__equip = EQUIPMENT;
window.__img = images;
window.__slots = SLOT_KEYS;
window.__mats = MATERIALS;
window.__dests = DESTINATIONS;
window.__save = () => saveTown(town);
window.lucide?.createIcons();
boot();
