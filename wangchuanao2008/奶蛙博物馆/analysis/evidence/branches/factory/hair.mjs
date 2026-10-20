export const newHairstyles=[
 {id:'locs',name:'脏辫',bounds:[62,15,388,282]},
 {id:'mohawk',name:'莫西干',bounds:[204,4,104,118]},
 {id:'watermelon',name:'西瓜头',bounds:[84,22,344,145]},
 {id:'bowl',name:'锅盖头',bounds:[69,16,374,192]},
 {id:'mullet',name:'狼尾',bounds:[65,18,382,301]},
 {id:'afro',name:'爆炸头',bounds:[42,0,428,241]},
 {id:'hime',name:'姬发式',bounds:[72,20,368,330]},
 {id:'buzz',name:'寸头',bounds:[96,34,320,112]},
 {id:'cornrows',name:'玉米辫',bounds:[88,25,336,150]},
 {id:'ponytail',name:'高马尾',bounds:[85,0,390,287]},
 {id:'braids',name:'双麻花辫',bounds:[67,22,378,338]},
 {id:'wavy',name:'波浪短鲍伯',bounds:[62,20,388,290]},
];
export const dyeModes=[['solid','纯色'],['gradient','渐变'],['tips','发尾染'],['streaks','挑染'],['split','左右双色']];
export const generationHairstyles=[{id:'messy',name:'蓬松碎发'},{id:'soft',name:'柔软短发'},{id:'curtain',name:'中分垂发'},{id:'buns',name:'双丸子'},{id:'crop',name:'利落短发'},...newHairstyles];
export const dyeDefaults=Object.freeze({mode:'gradient',base:'#35363e',accent:'#eaa2c3',position:55,softness:45,angle:0,width:30});
export const dyePresets=[
 {name:'黑樱发尾',mode:'tips',base:'#35363e',accent:'#ed86aa'},
 {name:'海盐渐变',mode:'gradient',base:'#e0e6e8',accent:'#7dc9dc'},
 {name:'奶茶挑染',mode:'streaks',base:'#6c4645',accent:'#edcca0'},
 {name:'黑白双拼',mode:'split',base:'#35363e',accent:'#eee9e2'},
 {name:'莓果渐变',mode:'gradient',base:'#793f75',accent:'#ec9cba'},
 {name:'薄荷挑染',mode:'streaks',base:'#35363e',accent:'#95ddbb'},
];
export function validDye(d){
 if(d===null)return true;
 return !!d&&typeof d==='object'&&!Array.isArray(d)&&Object.keys(d).length===7&&dyeModes.some(([id])=>id===d.mode)
  &&['base','accent'].every(k=>typeof d[k]==='string'&&/^#[0-9a-f]{6}$/i.test(d[k]))
  &&[['position',0,100],['softness',1,100],['angle',0,360],['width',5,80]].every(([k,min,max])=>Number.isInteger(d[k])&&d[k]>=min&&d[k]<=max);
}
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
export function dyeAmount(d,x,y){
 if(d.mode==='solid')return 0;
 const soft=d.softness/100,position=d.position/100;
 if(d.mode==='split')return smooth((x-position)/Math.max(.01,soft*.22)+.5);
 if(d.mode==='tips')return smooth((y-position)/Math.max(.01,soft*.45)+.5);
 if(d.mode==='streaks'){
  const flow=.5+(x-.5)/(.62+.6*y)+Math.sin(y*4.5)*.045;
  const phase=((flow*4+position)%1+1)%1;
  return 1-smooth((Math.abs(phase-.5)-d.width/200)/Math.max(.01,soft*.18)+.5);
 }
 const a=d.angle*Math.PI/180,dx=Math.sin(a),dy=Math.cos(a),extent=Math.abs(dx)+Math.abs(dy);
 return smooth((((x-.5)*dx+(y-.5)*dy)/extent+.5-position)/soft+.5);
}
export function colorHair(image,d){
 if(!validDye(d)||!d)throw Error('Invalid hair dye');
 const c=document.createElement('canvas');c.width=image.naturalWidth||image.width;c.height=image.naturalHeight||image.height;
 const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,c.width,c.height),p=pixels.data;
 const rgb=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16)),base=rgb(d.base),accent=rgb(d.accent);
 const tops=new Int32Array(c.width).fill(c.height),bottoms=new Int32Array(c.width);
 if(d.mode==='tips')for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(p[(y*c.width+x)*4+3]>24){tops[x]=Math.min(tops[x],y);bottoms[x]=y;}
 for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;const x=i/4%c.width,y=Math.floor(i/4/c.width);
  // Each column's visible lock length anchors tip dye; transparency and strand shading survive.
  const yy=d.mode==='tips'?(y-tops[x])/Math.max(1,bottoms[x]-tops[x]):y/c.height;
  const mix=dyeAmount(d,x/c.width,yy),lum=p[i]*.2126+p[i+1]*.7152+p[i+2]*.0722;
  const light=Math.min(1.15,.38+lum/150),shine=Math.max(0,lum-125)*.18;
  for(let k=0;k<3;k++)p[i+k]=Math.min(255,(base[k]*(1-mix)+accent[k]*mix)*light+shine);
 }
 ctx.putImageData(pixels,0,0);return c;
}
export function normalizeHairRequest(value){
 const v=value===undefined?{style:'keep',text:''}:value;
 if(!v||typeof v!=='object'||Object.keys(v).length!==2||!['keep','custom',...generationHairstyles.map(h=>h.id)].includes(v.style)||typeof v.text!=='string'||v.text.length>500)throw Error('发型要求无效，文字最多 500 字。');
 return {style:v.style,text:v.text.trim()};
}
export function hairDirection(value){
 const v=normalizeHairRequest(value);if(v.style==='keep'&&!v.text)return '';
 const name=generationHairstyles.find(h=>h.id===v.style)?.name;
 return `\nUSER HAIR DESIGN: ${JSON.stringify({hairstyle:name||'Follow the hair instructions below; otherwise retain reference hair',details:v.text})}. Apply the requested hairstyle and dye placement consistently in ALL FOUR avatars. This is an explicit hair-only override of reference hairstyle/hair color, not permission to discard reference facial identity, skin palette, glasses, signature objects or Milkfrog anatomy. Keep strand volume and natural scalp fit, hairline follows the round Milkfrog crown. Tip dye follows lock ends; highlights follow individual locks, not stripes painted over skin. If general user creative direction explicitly conflicts with this hair suggestion, follow their explicit text. Image count and reference roles remain unchanged.\n`;
}
