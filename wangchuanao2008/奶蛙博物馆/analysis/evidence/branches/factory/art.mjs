import { hairColors, headColors, stickerNames } from './state.mjs';
import { adjustedHead, drawBody, drawStickers } from './personalize.mjs';
import {finishSkin,eyeHighlights,detailBackdrop,framingTransform,surface,headpieces} from './character-details.mjs';
import {newHairstyles,colorHair} from './hair.mjs';
import {clothes,headphones,backwear,backgrounds} from './wardrobe.mjs';

let assetLinks;
const load = path => new Promise((resolve, reject) => {
  const src=assetLinks?.[path];
  if(typeof src!=='string'||!src.startsWith('https://public.cohub.live/')){reject(new Error(`Missing public artwork link: ${path}`));return;}
  const img = new Image(); img.crossOrigin='anonymous'; img.onload = () => resolve(img); img.onerror = () => reject(new Error(`Could not load ${src}`)); img.src = src;
});
const asset = key => load(`./assets/atelier/${key}.webp`);
function eyePosition(img){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0,256,256);
  const p=c.getImageData(0,0,256,256).data,halves=[{x:0,y:0,n:0},{x:0,y:0,n:0}];
  for(let y=64;y<145;y++)for(let x=45;x<211;x++){
    const i=(y*256+x)*4,r=p[i],g=p[i+1],b=p[i+2];
    if(p[i+3]<240||g<r-5||g<b+18||g<60)continue;
    const side=halves[x<128?0:1];side.x+=x*2;side.y+=y*2;side.n++;
  }
  if(halves.some(v=>v.n<40))throw Error('Could not locate Milkfrog eye discs');
  const [l,r]=halves.map(v=>({x:v.x/v.n,y:v.y/v.n}));
  return {x:(l.x+r.x)/2,y:(l.y+r.y)/2,span:r.x-l.x};
}
export async function loadAssets() {
  const response=await fetch(new URL('./assets.json',import.meta.url));
  if(!response.ok)throw new Error('The artwork manifest could not load.');
  assetLinks=await response.json();
  const [sky, heads, hair, eyewear, extra, stickers, additions, wardrobe] = await Promise.all([
    load('./assets/summer-sky.webp'),
    Promise.all(Array.from({ length: 17 }, (_, i) => load(`./assets/original-bust/face-${String(i).padStart(2,'0')}.webp`))),
    Promise.all([...Array.from({ length: 5 }, (_, i) => asset(`hair-${String(i).padStart(2,'0')}`)),Promise.resolve(null),...newHairstyles.map(h=>load(`./assets/hair/${h.id}.webp`))]),
    Promise.all(Array.from({ length: 5 }, (_, i) => asset(`eyewear-${String(i+1).padStart(2,'0')}`))),
    Promise.all([0,2,3,4,7].map(i => asset(`extra-${String(i).padStart(2,'0')}`))),
    Promise.all(Array.from({length:stickerNames.length},(_,i)=>load(`./assets/stickers/sticker-${String(i).padStart(2,'0')}.webp`))),
    Promise.all(['chin','fold','heart','wave','coffee','tea','flower','game','fan','towel','bandage','jade','silver',...headpieces.map(h=>h.id)].map(key=>load(`./assets/additions/${key}.webp`).then(img=>[key,img]))),
    Promise.all([...clothes,...headphones,...backwear,...backgrounds].map(v=>load(`./assets/wardrobe/${v.id}.webp`).then(img=>[v.id,img]))),
  ]);
  // Generated metal has slightly translucent interiors; keep antialiased edges, not see-through links.
  const metal=Object.assign(document.createElement('canvas'),{width:extra[4].width,height:extra[4].height});
  const mc=metal.getContext('2d',{willReadFrequently:true});mc.drawImage(extra[4],0,0);
  const pixels=mc.getImageData(0,0,metal.width,metal.height);
  for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i]>=240)pixels.data[i]=255;
  mc.putImageData(pixels,0,0);extra[4]=metal;
  return { sky, heads, hair, eyewear, stickers, wardrobe:Object.fromEntries(wardrobe),customTattoos:new Map(),additions:Object.fromEntries(additions), eyes:heads.slice(0,16).map(eyePosition), extra: Object.fromEntries([0,2,3,4,7].map((id,i)=>[id,extra[i]])), tinted: new Map(), adjusted:new Map(),layers:new Map() };
}

function tint(image, key, hex, assets, kind, bottom, gradient, skinMask) {
  if (assets.tinted.has(key)) return assets.tinted.get(key);
  const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth||image.width; canvas.height = image.naturalHeight||image.height;
  const c = canvas.getContext('2d',{willReadFrequently:true}); c.drawImage(image,0,0);
  const pixels = c.getImageData(0,0,canvas.width,canvas.height), p = pixels.data;
  const handMask=skinMask?.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
  const target = hex.slice(1).match(/../g).map(v=>parseInt(v,16));
  const end = bottom?.slice(1).match(/../g).map(v=>parseInt(v,16));
  const angle=(gradient?.angle||0)*Math.PI/180,dx=Math.sin(angle),dy=Math.cos(angle),extent=Math.abs(dx)+Math.abs(dy);
  for(let i=0;i<p.length;i+=4){
    const r=p[i],g=p[i+1],b=p[i+2]; if(!p[i+3])continue;
    let amount,light;
    if(kind==='skin'||kind==='hand'){
      // Recolor yellow skin across both face and torso, preserving green eye discs and black pupils.
      if(r<60 || r-g<6 || g-b<12)continue;
      amount=Math.min(1,(r-g-6)/8)*Math.min(1,(g-b-8)/20);
      if(handMask)amount*=handMask[i+3]/255;
      light=(r*.3+g*.6+b*.1)/222;
    }else{
      const l=(r+g+b)/3;
      // Keep light hair's broad highlights below clipping so the sculpted volume survives recoloring.
      amount=Math.min(1,Math.max(0,(l-24)/30)); light=Math.min(1.07,.52+l*.0038);
    }
    const x=(i/4%canvas.width)/canvas.width,y=Math.floor(i/4/canvas.width)/canvas.height;
    const position=gradient?Math.max(0,Math.min(1,(((x-.5)*dx+(y-.5)*dy)/extent+.5-gradient.midpoint/100)/(gradient.softness/100)+.5)):Math.max(0,Math.min(1,(y-.1)/.85));
    const blend=position*position*(3-2*position);
    for(let j=0;j<3;j++){
      const color=end?target[j]*(1-blend)+end[j]*blend:target[j];
      p[i+j]=p[i+j]*(1-amount)+Math.min(255,color*light)*amount;
    }
  }
  c.putImageData(pixels,0,0);
  if(assets.tinted.size>=24)assets.tinted.delete(assets.tinted.keys().next().value);
  assets.tinted.set(key,canvas); return canvas;
}
function headImage(s,a){
  const index=s.face===-1?16:s.face;
  if(s.gradient)return tint(a.heads[index],`face:${index}:${JSON.stringify(s.gradient)}`,s.gradient.start,a,'skin',s.gradient.end,s.gradient);
  return s.headColor===0?a.heads[index]:tint(a.heads[index],`face:${index}:${s.headColor}`,headColors[s.headColor].hex,a,'skin',headColors[s.headColor].bottom);
}
function hairImage(s,a){
  if(s.hair<0||s.hair===5)return null;
  if(s.hairDye){const key=`dye:${s.hair}:${JSON.stringify(s.hairDye)}`;if(!a.tinted.has(key)){if(a.tinted.size>=24)a.tinted.delete(a.tinted.keys().next().value);a.tinted.set(key,colorHair(a.hair[s.hair],s.hairDye));}return a.tinted.get(key);}
  return s.hairColor===0?a.hair[s.hair]:tint(a.hair[s.hair],`hair:${s.hair}:${s.hairColor}`,hairColors[s.hairColor],a,'hair');
}
function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function background(c,s,a){
  if(s.background===-1)return;
  if(s.background>=8){c.drawImage(a.wardrobe[backgrounds[s.background-8].id],0,0,512,512);return;}
  const colors=['#a3d5ef','#e9d6dc','#eee5c8','#dbd8e9','#d6e4e7','#dce7df','#3c475d','#f0f1ed'];
  c.fillStyle=colors[s.background];c.fillRect(0,0,512,512);
  if(s.background===0)c.drawImage(a.sky,0,0,512,512);
  if(s.background===6){
    c.strokeStyle='#ecdfbd';c.lineWidth=1.5;
    for(const [x,y]of [[61,79],[401,65],[465,222],[43,329],[363,98],[114,39],[444,399]]){c.beginPath();c.moveTo(x-3,y);c.lineTo(x+3,y);c.moveTo(x,y-3);c.lineTo(x,y+3);c.stroke();}
    ellipse(c,421,126,19,19,'#f5e6b6');ellipse(c,430,118,18,18,colors[6]);
  }
}
function fit(c,img,x,y,w,h){
  const scale=Math.min(w/img.width,h/img.height),iw=img.width*scale,ih=img.height*scale;
  c.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);
}
function drawHair(c,s,a){
  if(headpieces[s.details.headpiece-1]?.coversHair)return;
  const img=hairImage(s,a);if(!img)return;
  const bounds=s.hair>=6?newHairstyles[s.hair-6].bounds:[[80,22,352,220],[79,24,354,314],[80,24,352,266],[62,5,388,232],[81,23,350,209]][s.hair];
  c.drawImage(img,...bounds);
}
function drawEyewear(c,s,a){
  if(s.eyewear<=0||s.eyewear===5)return;
  const img=a.eyewear[s.eyewear-1];
  const eyes=a.eyes[s.face<0?0:s.face];
  const width=(eyes.span+(s.eyeSpacing||0)*.20)*(s.eyewear===3?1.7:1.85)*(1+(s.eyeSize||0)*.0005),height=width*img.height/img.width;
  const y=eyes.y+(s.eyewear===3?12:0);
  c.drawImage(img,eyes.x-width/2,y-height/2,width,height);
}
function drawHeadphones(c,s,a){
  if(headpieces[s.details.headpiece-1]?.helmet)return;
  if(s.details.earwear>=2){const item=headphones[s.details.earwear-2];c.drawImage(a.wardrobe[item.id],...item.bounds);return;}
  if(s.eyewear!==5&&!s.details.earwear)return;
  // Head and foreground hair occlude the inner cushions and rear crown band.
  c.drawImage(a.eyewear[4],30,23,451,326);
}
function drawExtra(c,s,a){
  const img=a.extra[s.extra];
  if(img){
    if(s.extra===7)return;
    const bounds={0:[220,0,74,70],2:[325,75,90,80],3:[330,84,78,78],4:[328,81,80,78],7:[98,282,316,150]};
    fit(c,img,...bounds[s.extra]);return;
  }
  if(s.extra===5)for(const x of[144,368])ellipse(c,x,278,23,10,'#cf89974a');
  if(s.extra===6)for(const x of[144,368])for(const[dx,dy]of[[-10,-3],[1,4],[12,-1],[3,-8]])ellipse(c,x+dx,278+dy,1.7,1.4,'#796c5880');
}
function drawChain(c,s,a,front=false){
  if(s.extra!==7&&!s.details.jewelry)return;
  if([2,3].includes(s.details.jewelry)){
    if(!front)return;
    c.save();c.shadowColor='#35260f44';c.shadowBlur=2;c.shadowOffsetY=2;
    c.drawImage(s.details.jewelry===2?a.additions.silver:a.additions.jade,70,s.details.jewelry===2?250:240,372,s.details.jewelry===2?170:210);
    c.shadowColor='transparent';c.globalCompositeOperation='destination-in';c.drawImage(a.heads[0],0,0,512,512);c.restore();return;
  }
  c.save();
  if(front){c.shadowColor='#35260f66';c.shadowBlur=3;c.shadowOffsetY=3;}
  c.drawImage(a.extra[7],63,200,386,220);
  if(front){
    // The rear arc stays behind the body; front links remain solid at the side turns.
    c.shadowColor='transparent';c.globalCompositeOperation='destination-in';
    c.beginPath();c.moveTo(0,274);c.lineTo(96,274);
    c.bezierCurveTo(103,290,109,302,124,310);
    c.bezierCurveTo(180,339,332,339,388,310);
    c.bezierCurveTo(403,302,409,290,416,274);
    c.lineTo(512,274);c.lineTo(512,512);c.lineTo(0,512);c.closePath();
    c.fillStyle='black';c.fill();
  }
  c.restore();
}
function drawHeadpiece(c,s,a,front=true){
 const hat=headpieces[s.details.headpiece-1];if(!hat||(!front&&hat.id!=='wukong'&&!hat.rear)||(front&&hat.rear))return;
 c.save();
 if(front){
  if(hat.id==='wukong'){
   // The circlet's upper lateral arc wraps behind the head; only its lower arc and center spirals are in front.
   const [x,y,w,h]=hat.bounds;c.beginPath();c.rect(x+w*.23,y,w*.54,h);c.rect(x,y+h*.52,w,h*.48);c.clip();
  }
  c.shadowColor='#30251738';c.shadowBlur=2;c.shadowOffsetY=2;
 }
 c.drawImage(a.additions[hat.id],...hat.bounds);c.restore();
}
function additions(c,s,a){
 const d=s.details,draw=(key,bounds)=>c.drawImage(a.additions[key],...bounds);
 drawHeadpiece(c,s,a);
 if(d.neckwear)draw('towel',[98,288,316,224]);
 if(d.bandage){c.save();c.translate(340,282);c.rotate(-.15);draw('bandage',[-23,-9,46,18]);c.restore();}
}
function activeArms(s){return {left:!!(s.details.pose||s.details.prop),right:[2,3].includes(s.details.pose)||s.details.prop===4};}
function posedBody(image,s,original){
 const {left,right}=activeArms(s);if(!left&&!right)return image;
 const out=surface(),c=out.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0,512,512);
 const pixels=c.getImageData(0,0,512,512),p=pixels.data,reference=surface();reference.getContext('2d').drawImage(original,0,0,512,512);
 const a=reference.getContext('2d').getImageData(0,0,512,512).data;
 // Reconstruct torso lighting over the resting arm crease, preserving the original smooth silhouette and gradient.
 for(let y=330;y<512;y++){
  const t=Math.min(1,(y-330)/65),blend=t*t*(3-2*t);
  for(let x=0;x<512;x++){
   const distance=left&&x<256?x:right&&x>=256?512-x:256;if(distance>=145)continue;
   const i=(y*512+x)*4,j=(y*512+(x<256?150:362))*4;
   if(!a[i+3])continue;
   const shade=.9+.1*Math.min(1,distance/145),weight=blend*Math.min(1,(145-distance)/35);
   for(let k=0;k<3;k++){const factor=1+(Math.min(4,a[j+k]*shade/Math.max(1,a[i+k]))-1)*weight;p[i+k]=Math.min(255,p[i+k]*factor);}
  }
 }
 c.putImageData(pixels,0,0);return out;
}
function arms(c,s,a){
 const d=s.details;
 const poses=[null,['chin',[70,257,180,240]],['fold',[66,345,380,167]],['heart',[90,330,332,178]],['wave',[5,205,154,297]]];
 const props=[null,['coffee',[38,293,206,253]],['tea',[42,293,202,253]],['flower',[40,269,207,277]],['game',[77,355,358,180]],['fan',[38,285,230,261]]];
 const choice=props[d.prop]||poses[d.pose];if(!choice)return;
 const[key,bounds]=choice,original=a.additions[key],col=headColors[s.headColor];
 const originalPlaced=surface();originalPlaced.getContext('2d').drawImage(original,...bounds);
 const mask=surface(),mc=mask.getContext('2d',{willReadFrequently:true});mc.drawImage(originalPlaced,0,0);
 const mp=mc.getImageData(0,0,512,512);
 for(let i=0;i<mp.data.length;i+=4){const[r,g,b]=mp.data.subarray(i,i+3),y=Math.floor(i/4/512);if(r<130||g<110||g<r*.82||g>r*.98||b>g*.82||(key==='flower'&&y<bounds[1]+bounds[3]*.30)||(key==='fan'&&y<bounds[1]+bounds[3]*.45))mp.data[i+3]=0;}
 mc.putImageData(mp,0,0);
 const placed=s.headColor||s.gradient?tint(originalPlaced,`arm:${key}:${s.headColor}:${JSON.stringify(s.gradient)}`,s.gradient?.start||col.hex,a,'hand',s.gradient?.end||col.bottom,s.gradient,mask):originalPlaced;
 const finished=surface(),fc=finished.getContext('2d',{willReadFrequently:true});fc.drawImage(finishSkin(placed,mask,s),0,0);
 const pixels=fc.getImageData(0,0,512,512),p=pixels.data;
 // Blend cropped forearm edges into the torso without fading the gripping hands.
 if(d.prop)for(let y=bounds[1];y<512;y++)for(let x=bounds[0];x<bounds[0]+bounds[2];x++){
  const distance=key==='game'?Math.min(x-bounds[0],bounds[0]+bounds[2]-x):x-bounds[0];
  if(distance<18){const t=Math.max(0,distance/18);p[(y*512+x)*4+3]*=t*t*(3-2*t);}
 }
 const joints={chin:[[.12,.43]],fold:[[.14,.12],[.86,.12]],heart:[[.12,.82],[.88,.82]],wave:[[.83,.85]],coffee:[[.13,.94]],tea:[[.13,.94]],flower:[[.13,.94]],game:[[.12,.86],[.88,.86]],fan:[[.13,.94]]}[key];
 for(const[jx,jy]of joints){const x0=bounds[0]+bounds[2]*jx,y0=bounds[1]+bounds[3]*jy;
  for(let y=Math.max(0,Math.floor(y0-26));y<Math.min(512,y0+26);y++)for(let x=Math.max(0,Math.floor(x0-26));x<Math.min(512,x0+26);x++){
   const edge=100-(y-340)*.17;if(y<340||x<edge+4||x>512-edge-4)continue;
   const distance=Math.hypot(x-x0,y-y0);if(distance<26)p[(y*512+x)*4+3]*=.2+.8*Math.min(1,distance/26);
  }
 }
 fc.putImageData(pixels,0,0);c.drawImage(finished,0,0);
}
const renderSurfaces=new WeakMap();
export function drawAvatar(canvas,state,assets,{circle=false,backgroundVisible=true}={}){
  // Composite at one resolution before resampling, so overlapping arm alpha uses the same path in previews and exports.
  let scene=renderSurfaces.get(canvas);if(!scene){scene=surface();renderSurfaces.set(canvas,scene);}
  const c=scene.getContext('2d',{willReadFrequently:true});c.clearRect(0,0,512,512);c.save();
  c.imageSmoothingQuality='high';
  c.lineJoin='round';c.lineCap='round';
  if(circle){c.beginPath();c.arc(256,256,256,0,Math.PI*2);c.clip();}
  if(backgroundVisible){background(c,state,assets);detailBackdrop(c,state);}
  c.save();framingTransform(c,state);
  const key=JSON.stringify({...state,stickers:[],background:-1,width:0,height:0});
  let layer=assets.layers.get(key);
  if(!layer){
    const topPadding=headpieces[state.details.headpiece-1]?.headroom||0;
    layer=Object.assign(document.createElement('canvas'),{width:512,height:512+topPadding,topPadding});const lc=layer.getContext('2d',{willReadFrequently:true});lc.translate(0,topPadding);
    drawHeadphones(lc,state,assets);
    const back=backwear[state.details.backwear-1];if(back)lc.drawImage(assets.wardrobe[back.id],...back.bounds);
    drawHeadpiece(lc,state,assets,false);
    // Opaque inner lining fills the helmet opening behind the curved skull, not in front of the face.
    if(headpieces[state.details.headpiece-1]?.helmet)ellipse(lc,256,86,124,90,state.details.headpiece===2?'#292b2b':'#074368');
    drawChain(lc,state,assets);
    const original=assets.heads[state.face<0?16:state.face],anchor=assets.eyes[state.face<0?0:state.face];
    lc.drawImage(finishSkin(posedBody(adjustedHead(headImage(state,assets),state,anchor,assets.adjusted,original),state,original),original,state),0,0,512,512);
    eyeHighlights(lc,state,anchor);
    drawHair(lc,state,assets);drawEyewear(lc,state,assets);drawExtra(lc,state,assets);
    additions(lc,state,assets);
    if(state.details.pose||state.details.prop){layer.armLayer=surface();arms(layer.armLayer.getContext('2d',{willReadFrequently:true}),state,assets);}
    lc.putImageData(lc.getImageData(0,0,512,layer.height),0,0);
    if(layer.armLayer){const ac=layer.armLayer.getContext('2d');ac.putImageData(ac.getImageData(0,0,512,512),0,0);}
    if(assets.layers.size>24)assets.layers.clear();assets.layers.set(key,layer);
  }
  drawBody(c,layer,state);
  c.restore();drawStickers(c,state,assets.stickers,'tattoo',assets.customTattoos);c.save();framingTransform(c,state);
  const clothing=clothes[state.details.clothing-1];
  if(clothing){const cacheKey='garment:'+clothing.id;let garment=assets.layers.get(cacheKey);if(!garment){garment=surface();const gc=garment.getContext('2d',{willReadFrequently:true});gc.drawImage(assets.wardrobe[clothing.id],...clothing.bounds);
    // Cloth is opaque, even when generated alpha is 252-254; keep the actual soft silhouette edges.
    const pixels=gc.getImageData(0,0,512,512);for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i]>=245)pixels.data[i]=255;gc.putImageData(pixels,0,0);
    if(clothing.rearCollar){const[x,y,w,h]=clothing.bounds,[cx,cy,cw,ch]=clothing.rearCollar;gc.clearRect(x+cx*w,y+cy*h,cw*w,ch*h);}
    assets.layers.set(cacheKey,garment);}drawBody(c,garment,state);}
  if(state.extra===7||state.details.jewelry){
    const chainKey=state.details.jewelry===3?'chainJade':state.details.jewelry===2?'chainSilver':'chainFront';
    if(!assets[chainKey]){assets[chainKey]=surface();drawChain(assets[chainKey].getContext('2d',{willReadFrequently:true}),state,assets,true);}
    drawBody(c,assets[chainKey],state);
  }
  if(layer.armLayer)drawBody(c,layer.armLayer,state);
  c.restore();
  drawStickers(c,state,assets.stickers,'sticker',assets.customTattoos);c.restore();
  const output=canvas.getContext('2d',{willReadFrequently:true});output.save();output.resetTransform();output.clearRect(0,0,canvas.width,canvas.height);output.imageSmoothingQuality='high';output.drawImage(scene,0,0,canvas.width,canvas.height);output.restore();
}
export function drawPartThumbnail(canvas,state,assets,group){
  // A dressed preview makes the fit visible before selection.
  drawAvatar(canvas,{...state,stickers:[]},assets);
}
