import {transformControls} from './sticker-transform.mjs';
import {detailDefaults,validDetails} from './character-details.mjs';
import {newHairstyles,validDye} from './hair.mjs';
import {backgrounds} from './wardrobe.mjs';
import {customTattooKind,validInlineImage} from './tattoo.mjs';
export const groups = [
  { id: 'face', name: '表情', icon: 'smile', options: ['淡定', '浅浅一笑', '小得意', '笑开了', '困了', '就这？', '诶？', '害羞', '眨眨眼', '委屈', '亲一个', '不高兴', '眼泪汪汪', '略略略', '期待', '安心'] },
  { id: 'hair', name: '发型', icon: 'scissors', options: ['蓬松碎发', '柔软短发', '中分垂发', '双丸子', '利落短发', '不戴发型',...newHairstyles.map(h=>h.name)] },
  { id: 'eyewear', name: '眼镜', icon: 'glasses', options: ['不添加', '圆框眼镜', '小墨镜', '细框眼镜', '爱心眼镜', '耳机'] },
  { id: 'extra', name: '小装扮', icon: 'sprout', options: ['小嫩芽', '不添加', '丝缎蝴蝶结', '山茶花', '月牙发夹', '腮红', '小雀斑', '金链子'] },
  { id: 'background', name: '背景', icon: 'image', options: ['晴空', '玫瑰粉', '奶油黄', '淡紫', '冰蓝', '薄荷绿', '夜色', '云白',...backgrounds.map(v=>v.name)] },
];
export const hairColors = ['#35363e', '#6c4645', '#e9cf9e', '#ece8e4', '#b7657b', '#729591'];
export const headColors = [
  { name: '原味奶黄', hex: '#f3df91' }, { name: '开心果', hex: '#bccb9c' },
  { name: '玫瑰粉', hex: '#efadc5' }, { name: '丁香紫', hex: '#c0b4ee' },
  { name: '天空蓝', hex: '#97d2eb' }, { name: '蜜桃', hex: '#f4b389' },
  { name: '珍珠白', hex: '#eeeae1' }, { name: '石墨灰', hex: '#737a87' },
  { name: '糖果渐变', hex: '#efadc5', bottom: '#97d2eb' },
  { name: '日落渐变', hex: '#f3df91', bottom: '#f09b7d' },
  { name: '极光渐变', hex: '#b9e5cd', bottom: '#bc9cde' },
];
export const outfitColors = ['#577b83', '#a15060', '#d5af55', '#434853', '#e6ded6', '#85936a'];
// Keep the two retired clothing fields so existing saved avatars and v1 links remain readable.
const legacyInitial = { face: 0, hair: -1, outfit: 0, eyewear: -1, extra: -1, background: 4, hairColor: 0, outfitColor: 0, headColor: 0 };
export const adjustments = [
  {id:'width',name:'胖瘦'}, {id:'height',name:'高矮'},
  {id:'eyeSize',name:'眼睛大小'}, {id:'eyeSpacing',name:'眼距'}, {id:'pupilSize',name:'瞳孔大小'},
];
export const stickerNames = ['珍珠星星','粉色爱心','山茶花','绸缎结','小音符','闪光','月牙','樱桃','雏菊','粉色相框','流星','气泡','玫瑰纹身','火焰纹身','月亮纹身'];
export const stickerLabel=v=>v.kind===customTattooKind?'自传纹身':stickerNames[v.kind];
export const eyeColors = ['#a6b78b','#9ec9db','#ac91cf','#ca9169','#799d90','#c4a352'];
export const initial = Object.freeze({...legacyInitial,width:0,height:0,eyeSize:0,eyeSpacing:0,pupilSize:0,eyeColor:null,gradient:null,hairDye:null,stickers:Object.freeze([]),details:detailDefaults});
export const clone = s => ({ ...s, hairDye:s.hairDye?{...s.hairDye}:null, details:{...s.details}, gradient:s.gradient?{...s.gradient}:null, stickers:(s.stickers || []).map(v=>({...v})) });

function validLegacy(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(legacyInitial);
  if (Object.keys(value).length !== keys.length || !keys.every(k => Object.hasOwn(value, k))) return false;
  return groups.every(g => Number.isInteger(value[g.id]) && value[g.id] >= -1 && value[g.id] < g.options.length)
    && Number.isInteger(value.outfit) && value.outfit >= 0 && value.outfit < 6
    && Number.isInteger(value.hairColor) && value.hairColor >= 0 && value.hairColor < hairColors.length
    && Number.isInteger(value.outfitColor) && value.outfitColor >= 0 && value.outfitColor < outfitColors.length
    && Number.isInteger(value.headColor) && value.headColor >= 0 && value.headColor < headColors.length;
}

export function validState(s) {
  if(!s || typeof s!=='object' || Object.keys(s).length!==Object.keys(initial).length) return false;
  if(!validDetails(s.details))return false;
  if(!validDye(s.hairDye))return false;
  if(!validLegacy(Object.fromEntries(Object.keys(legacyInitial).map(k=>[k,s[k]]))))return false;
  if(!adjustments.every(a=>Number.isInteger(s[a.id]) && Math.abs(s[a.id])<=100))return false;
  if(s.eyeColor!==null && (typeof s.eyeColor!=='string'||!/^#[0-9a-f]{6}$/i.test(s.eyeColor)))return false;
  if(s.gradient!==null){
    const g=s.gradient;
    if(!g||typeof g!=='object'||Object.keys(g).length!==5||!['start','end'].every(k=>typeof g[k]==='string'&&/^#[0-9a-f]{6}$/i.test(g[k])))return false;
    if(![['angle',0,360],['midpoint',10,90],['softness',5,100]].every(([k,min,max])=>Number.isInteger(g[k])&&g[k]>=min&&g[k]<=max))return false;
  }
  if(!Array.isArray(s.stickers) || s.stickers.length>24)return false;
  if(s.stickers.filter(v=>v?.kind===customTattooKind).length>4)return false;
  const ids=new Set();
  return s.stickers.every(v=>{
    const required=['id','kind','rotation','size','x','y'],allowed=[...required,'opacity',...transformControls.map(c=>c.id),...(v?.kind===customTattooKind?['image']:[])];
    if(!v || !required.every(k=>Object.hasOwn(v,k))||Object.keys(v).some(k=>!allowed.includes(k)))return false;
    if(!transformControls.every(c=>!Object.hasOwn(v,c.id)||(Number.isInteger(v[c.id])&&v[c.id]>=c.min&&v[c.id]<=c.max)))return false;
    if(!Object.entries(v).every(([k,n])=>k==='image'||Number.isInteger(n))||v.id<0||v.id>1000000||ids.has(v.id))return false;
    if(Object.hasOwn(v,'opacity')&&(v.opacity<5||v.opacity>100))return false;
    if(v.kind===customTattooKind&&!validInlineImage(v.image))return false;
    ids.add(v.id);
    return v.kind>=0&&v.kind<=customTattooKind&&v.x>=0&&v.x<=512&&v.y>=0&&v.y<=512&&v.size>=24&&v.size<=220&&Math.abs(v.rotation)<=180;
  });
}
export function migrateV3(s) {
  if(!validLegacy(s))throw new Error('Your saved avatar could not be read. It has not been overwritten.');
  return {...clone(initial),...s};
}
export function encode(s) {
  if (!validState(s)) throw new Error('Invalid avatar');
  return 'v9.' + btoa(JSON.stringify(s)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function migrateV8(s){
 if(!s||!s.details||Object.hasOwn(s.details,'clothing')||Object.hasOwn(s.details,'backwear'))throw Error('Your saved avatar could not be read. It has not been overwritten.');
 const next={...s,details:{...s.details,clothing:0,backwear:0}};
 if(!validState(next))throw Error('Your saved avatar could not be read. It has not been overwritten.');return clone(next);
}
export function migrateV7(s){
  if(!s||typeof s!=='object'||Object.hasOwn(s,'hairDye')||Object.keys(s).length!==Object.keys(initial).length-1)throw Error('Your saved avatar could not be read. It has not been overwritten.');
  const next={...s,hairDye:null};
  return migrateV8(next);
}
export function migrateV6(s){
  if(!s||typeof s!=='object'||Object.hasOwn(s,'details')||Object.keys(s).length!==Object.keys(initial).length-2)throw Error('Your saved avatar could not be read. It has not been overwritten.');
  const {clothing,backwear,...oldDetails}=detailDefaults;
  const next={...s,details:oldDetails};
  return migrateV7(next);
}
export function migrateV5(s){
  if(!s||typeof s!=='object'||Object.hasOwn(s,'gradient')||Object.keys(s).length!==Object.keys(initial).length-3)throw Error('Your saved avatar could not be read. It has not been overwritten.');
  return migrateV6({...s,gradient:null});
}

export function migrateLegacy(s, version = 1) {
  const next = { ...s, headColor: 0 };
  if (!s || Object.keys(s).length !== 8 || !validLegacy(next) || groups.some(g => s[g.id] < 0) || s.face > (version === 1 ? 7 : 9)) throw new Error('This avatar contains unknown parts.');
  return migrateV3({ ...next, face: version === 1 ? [0, 1, 4, 3, 8, 5, 6, 2][s.face] : s.face });
}

export function decode(text) {
  if(typeof text==='string' && /^v[456789]\./.test(text)){
    if(text.length>(text[1]==='9'?650000:14000) || !/^v[456789]\.[A-Za-z0-9_-]+$/.test(text))throw new Error('This avatar link is not valid.');
    let s;try{s=JSON.parse(atob(text.slice(3).replaceAll('-','+').replaceAll('_','/')));}catch{throw new Error('This avatar link is not valid.');}
    if(text[1]==='8')s=migrateV8(s);else if(text[1]==='7')s=migrateV7(s);else if(text[1]==='6')s=migrateV6(s);else if(text[1]!=='9')s=migrateV5(s);
    if(!validState(s))throw new Error('This avatar link contains unknown parts.');
    return clone(s);
  }
  if (!/^(?:v[12](?:\.\d){8}|v3(?:\.(?:-1|\d{1,2})){9})$/.test(text)) throw new Error('This avatar link is not valid.');
  const values = text.split('.').slice(1).map(Number);
  const version = Number(text[1]);
  const keys = Object.keys(legacyInitial).slice(0, version === 3 ? 9 : 8);
  const s = Object.fromEntries(keys.map((k, i) => [k, values[i]]));
  if (version !== 3) return migrateLegacy(s, version);
  return migrateV3(s);
}

export function togglePart(s, category, index) {
  return { ...s, [category]: s[category] === index ? -1 : index };
}

export function randomize(s, locks, rng = Math.random) {
  const next = clone(s);
  const choose = (n, current) => current === -1 ? Math.floor(rng() * n) : (current + 1 + Math.floor(rng() * (n - 1))) % n;
  for (const g of groups) if (!locks.has(g.id)) next[g.id] = choose(g.options.length, s[g.id]);
  if (!locks.has('hair')) {next.hairColor = choose(hairColors.length, s.hairColor);next.hairDye=null;}
  return next;
}

export function history(start) {
  let current = clone(start), past = [], future = [];
  return {
    get state() { return clone(current); },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
    commit(s) {
      if (!validState(s)) throw new Error('Invalid avatar');
      if (encode(s) === encode(current)) return false;
      past.push(current); if (past.length > 100) past.shift();
      current = clone(s); future = []; return true;
    },
    undo() { if (!past.length) return; future.push(current); current = past.pop(); },
    redo() { if (!future.length) return; past.push(current); current = future.pop(); },
  };
}
