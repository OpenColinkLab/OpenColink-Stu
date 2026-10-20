import {detailControls,detailMenus,detailDefaults,headpieces} from './character-details.mjs';
import {clone} from './state.mjs';
import {clothes,headphones,backwear} from './wardrobe.mjs';
const sections=[
 ['look','再搭一点',['earwear','jewelry','headpiece','clothing','backwear','neckwear','bandage','pose','prop']],
 ['tune','眼神',['highlight','gazeX','gazeY','asymmetry','lid']],
 ['tune','皮肤的小细节',['blush','freckles','beauty','pattern','patternSize','patternStrength','density']],
 ['palette','摸起来像什么',['material','materialStrength']],
 ['palette','出片',['light','lightStrength','framing','backdrop']],
];
export const themes=[
 {name:'下班了',state:{face:4,hair:-1,eyewear:-1,extra:-1,headColor:0,background:4},details:{earwear:1,prop:1,pose:0,material:0}},
 {name:'甜酷一点',state:{face:2,hair:0,hairColor:3,eyewear:3,extra:-1,headColor:2,background:7},details:{jewelry:2,bandage:1,material:4,materialStrength:35,blush:20}},
 {name:'今天放空',state:{face:4,hair:-1,eyewear:-1,extra:-1,headColor:0,background:5},details:{headpiece:1,neckwear:1,lid:15,material:0}},
 {name:'东方小雅',state:{face:0,hair:-1,eyewear:-1,extra:3,headColor:0,background:7},details:{jewelry:3,prop:5,material:1,backdrop:2}},
 {name:'游戏搭子',state:{face:2,hair:1,hairColor:0,eyewear:-1,extra:-1,headColor:4,background:3},details:{earwear:1,prop:4,highlight:2,material:0}},
 {name:'下班起飞',state:{face:4,hair:-1,eyewear:-1,extra:-1,headColor:0,background:13},details:{headpiece:11,clothing:1,backwear:2}},
 {name:'东北洗浴王',state:{face:4,hair:-1,eyewear:2,extra:-1,headColor:0,background:9},details:{headpiece:12,clothing:2,jewelry:1}},
 {name:'一杯奶蛙',state:{face:2,hair:-1,eyewear:-1,extra:-1,headColor:5,background:10},details:{headpiece:8,clothing:6}},
 {name:'赛博摸鱼',state:{face:1,hair:6,hairColor:5,eyewear:2,extra:-1,headColor:7,background:8},details:{earwear:5,clothing:5,backwear:3}},
 {name:'功德加一',state:{face:0,hair:-1,eyewear:-1,extra:-1,headColor:0,background:11},details:{headpiece:13,clothing:4,backwear:4}},
 {name:'今天是蝴蝶',state:{face:8,hair:17,hairColor:4,eyewear:-1,extra:-1,headColor:2,background:15},details:{clothing:3,backwear:1,earwear:2}},
];
export function applyTheme(s,index){const t=themes[index];if(!t)throw Error('Unknown outfit');return {...clone(s),...t.state,gradient:null,hairDye:null,details:{...detailDefaults,...t.details}};}
export function createDetailsStudio({getState,finish,paint,isReady}){
 const sectionsDOM=[];
 for(const[panel,title,ids]of sections){
  const section=document.createElement('section');section.className='detail-section';section.innerHTML=`<h2>${title}</h2><div class="detail-controls">${ids.map(id=>{
   const menu=detailMenus.find(c=>c.id===id);if(menu)return `<label class="detail-menu">${menu.name}<select aria-label="${menu.name}" data-detail="${id}">${menu.options.map((s,i)=>`<option value="${i}">${s}</option>`).join('')}</select></label>`;
   const c=detailControls.find(c=>c.id===id);return `<label class="detail-range">${c.name}<output data-detail-output="${id}"></output><input type="range" aria-label="${c.name}" data-detail="${id}" min="${c.min}" max="${c.max}" step="1"><button type="button" class="icon-button" data-detail-reset="${id}" aria-label="还原${c.name}" data-tip="还原${c.name}"><i data-lucide="rotate-ccw"></i></button></label>`;
  }).join('')}</div>`;
  document.getElementById(panel+'-panel').append(section);sectionsDOM.push(section);
 }
 const themesDOM=document.createElement('section');themesDOM.className='detail-section theme-section';themesDOM.innerHTML=`<h2>今天是哪一种</h2><div class="theme-grid">${themes.map((t,i)=>`<button class="part theme-choice" data-theme="${i}" aria-label="搭配：${t.name}"><canvas width="200" height="200"></canvas><span class="part-label">${t.name}</span></button>`).join('')}</div>`;
 document.getElementById('look-panel').append(themesDOM);
 const hatsDOM=document.createElement('section');hatsDOM.className='detail-section headpiece-section';hatsDOM.innerHTML=`<h2>帽子戏法</h2><div class="theme-grid headpiece-grid">${['不戴头饰',...headpieces.map(h=>h.name)].map((name,i)=>`<button type="button" class="part theme-choice" data-headpiece="${i}" aria-label="${name}" aria-pressed="false"><canvas width="200" height="200"></canvas><span class="part-label">${name}</span></button>`).join('')}</div>`;
 sectionsDOM[0].after(hatsDOM);
 const wardrobeDOM=document.createElement('section');wardrobeDOM.className='detail-section wardrobe-section';
 wardrobeDOM.innerHTML='<h2>穿搭实验室</h2><div class="wardrobe-tabs" role="tablist" aria-label="装扮部位">'+[['clothing','上衣'],['earwear','耳机'],['backwear','背部']].map(([id,name],i)=>`<button type="button" role="tab" data-wardrobe-tab="${id}" aria-selected="${i===0}">${name}</button>`).join('')+'</div>'+[['clothing',clothes,0],['earwear',[{name:'原版头戴耳机'},...headphones],0],['backwear',backwear,0]].map(([slot,items])=>`<div class="headpiece-grid theme-grid" data-wardrobe-panel="${slot}" ${slot==='clothing'?'':'hidden'}>${[{name:'不添加'},...items].map((item,i)=>`<button type="button" class="part theme-choice" data-wardrobe="${slot}" data-value="${i}" aria-label="${item.name}" aria-pressed="false"><canvas width="200" height="200"></canvas><span class="part-label">${item.name}</span></button>`).join('')}</div>`).join('');
 hatsDOM.after(wardrobeDOM);
 const eye=sectionsDOM[1],pad=document.createElement('div');pad.className='gaze-pad';pad.tabIndex=0;pad.setAttribute('role','group');pad.setAttribute('aria-label','视线方向');pad.innerHTML='<span class="gaze-dot"></span>';
 eye.querySelector('h2').after(pad);let pointer=null,draft=null;
 const change=(id,value)=>{const s=clone(draft||getState());s.details[id]=value;
  // Move legacy single-slot wearables into their independent slot when explicitly edited.
  if(id==='earwear'&&s.eyewear===5)s.eyewear=-1;
  if(id==='jewelry'&&s.extra===7)s.extra=-1;
  if(id==='blush'&&s.extra===5)s.extra=-1;
  if(id==='freckles'&&s.extra===6)s.extra=-1;
  if(id==='prop'&&value)s.details.pose=0;
  if(id==='pose'&&value)s.details.prop=0;
  draft=s;paint(s);render(s);};
 const end=()=>{if(draft){const s=draft;draft=null;finish(s);}};
 for(const root of sectionsDOM){
  root.addEventListener('input',e=>{if(isReady()&&e.target.dataset.detail)change(e.target.dataset.detail,Number(e.target.value));});
  root.addEventListener('change',end);
  root.addEventListener('click',e=>{const b=e.target.closest('[data-detail-reset]');if(b&&isReady()){change(b.dataset.detailReset,detailDefaults[b.dataset.detailReset]);end();}});
 }
 function position(e){const r=pad.getBoundingClientRect();change('gazeX',Math.round(Math.max(-100,Math.min(100,((e.clientX-r.left)/r.width-.5)*200))));change('gazeY',Math.round(Math.max(-100,Math.min(100,((e.clientY-r.top)/r.height-.5)*200))));}
 pad.onpointerdown=e=>{if(!isReady()||e.button!==0)return;e.preventDefault();pointer=e.pointerId;pad.setPointerCapture(pointer);position(e);};
 pad.onpointermove=e=>{if(pointer===e.pointerId)position(e);};
 pad.onpointerup=e=>{if(pointer!==e.pointerId)return;position(e);pointer=null;end();};
 pad.onlostpointercapture=()=>{pointer=null;end();};
 pad.onpointercancel=()=>{pointer=null;draft=null;paint(getState());render();};
 pad.onkeydown=e=>{const directions={ArrowLeft:['gazeX',-5],ArrowRight:['gazeX',5],ArrowUp:['gazeY',-5],ArrowDown:['gazeY',5]};if(!directions[e.key]||!isReady())return;e.preventDefault();const[k,delta]=directions[e.key];change(k,Math.max(-100,Math.min(100,getState().details[k]+delta)));end();};
 themesDOM.onclick=e=>{const b=e.target.closest('[data-theme]');if(b&&isReady())finish(applyTheme(getState(),Number(b.dataset.theme)));};
 hatsDOM.onclick=e=>{const b=e.target.closest('[data-headpiece]');if(!b||!isReady())return;const s=clone(getState()),value=Number(b.dataset.headpiece);s.details.headpiece=s.details.headpiece===value?0:value;finish(s);};
 wardrobeDOM.onclick=e=>{const tab=e.target.closest('[data-wardrobe-tab]');if(tab){for(const b of wardrobeDOM.querySelectorAll('[data-wardrobe-tab]'))b.setAttribute('aria-selected',String(b===tab));for(const panel of wardrobeDOM.querySelectorAll('[data-wardrobe-panel]'))panel.hidden=panel.dataset.wardrobePanel!==tab.dataset.wardrobeTab;render();return;}const b=e.target.closest('[data-wardrobe]');if(!b||!isReady())return;const s=clone(getState()),slot=b.dataset.wardrobe,value=Number(b.dataset.value);if(slot==='earwear'&&s.eyewear===5)s.eyewear=-1;s.details[slot]=s.details[slot]===value?0:value;finish(s);};
 function render(s=getState()){
  for(const root of sectionsDOM){for(const input of root.querySelectorAll('[data-detail]')){const k=input.dataset.detail;input.value=k==='earwear'&&s.eyewear===5?1:k==='jewelry'&&s.extra===7?1:s.details[k];input.disabled=!isReady();}for(const out of root.querySelectorAll('[data-detail-output]'))out.value=s.details[out.dataset.detailOutput];for(const b of root.querySelectorAll('button'))b.disabled=!isReady();}
  pad.querySelector('span').style.transform=`translate(${s.details.gazeX*.72}px,${s.details.gazeY*.5}px)`;
  for(const b of themesDOM.querySelectorAll('button'))b.disabled=!isReady();
  for(const b of hatsDOM.querySelectorAll('button')){b.disabled=!isReady();const selected=Number(b.dataset.headpiece)===s.details.headpiece;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));}
  for(const b of wardrobeDOM.querySelectorAll('[data-wardrobe]')){b.disabled=!isReady();b.setAttribute('aria-pressed',String(Number(b.dataset.value)===s.details[b.dataset.wardrobe]));}
 }
 let thumbnailDraw,thumbnailAssets;
 const canvases=[...themesDOM.querySelectorAll('canvas'),...hatsDOM.querySelectorAll('canvas'),...wardrobeDOM.querySelectorAll('canvas')];
 function drawThumbnail(c){if(!thumbnailDraw||!thumbnailAssets)return;const b=c.parentElement;let s=clone(getState());if(b.dataset.theme!==undefined)s=applyTheme(s,Number(b.dataset.theme));else if(b.dataset.headpiece!==undefined)s.details.headpiece=Number(b.dataset.headpiece);else{s.details[b.dataset.wardrobe]=Number(b.dataset.value);if(b.dataset.wardrobe==='earwear')s.eyewear=-1;}thumbnailDraw(c,s,thumbnailAssets);}
 // Only render the visible catalog rows; scrolling reveals previews of the current avatar, not stale snapshots.
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)drawThumbnail(e.target);});for(const c of canvases)observer.observe(c);
 return {render,drawThemes(draw,assets){thumbnailDraw=draw;thumbnailAssets=assets;const pane=document.querySelector('.editor-scroll').getBoundingClientRect();for(const c of canvases){const r=c.getBoundingClientRect();if(r.width&&r.height&&r.bottom>Math.max(0,pane.top)&&r.top<Math.min(innerHeight,pane.bottom))drawThumbnail(c);}}};
}
