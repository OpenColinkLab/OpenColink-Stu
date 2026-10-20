import {stickerMatrix,containsSticker} from './sticker-transform.mjs';
const surface = () => Object.assign(document.createElement('canvas'), {width:512,height:512});
export function adjustedHead(image, state, anchor, cache, original=image) {
  const details=state.details;
  if(state.face<0 || (!state.eyeColor&&!state.eyeSize&&!state.eyeSpacing&&!state.pupilSize&&!details.gazeX&&!details.gazeY&&!details.asymmetry&&!details.lid))return image;
  const key=JSON.stringify([state.face,state.headColor,state.gradient,state.eyeColor,state.eyeSize,state.eyeSpacing,state.pupilSize,details]);
  if(cache.has(key))return cache.get(key);
  const src=surface(),c=src.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0,512,512);
  const data=c.getImageData(0,0,512,512),p=data.data;
  const mask=surface(),mc=mask.getContext('2d',{willReadFrequently:true});mc.drawImage(original,0,0,512,512);const originalPixels=mc.getImageData(0,0,512,512).data;
  const centers=[{x:anchor.x-anchor.span/2,y:anchor.y},{x:anchor.x+anchor.span/2,y:anchor.y}];
  // Locate each pupil in the original eye region, including asymmetric expressions.
  for(const eye of centers){
    let sx=0,sy=0,n=0;
    for(let y=Math.max(0,Math.floor(eye.y-32));y<Math.min(512,eye.y+32);y++)for(let x=Math.max(0,Math.floor(eye.x-32));x<Math.min(512,eye.x+32);x++){
      const i=(y*512+x)*4;if(p[i]<65&&p[i+1]<70&&p[i+2]<65&&p[i+3]>240){sx+=x;sy+=y;n++;}
    }
    eye.px=n?sx/n:eye.x;eye.py=n?sy/n:eye.y;eye.visible=n>20;
  }
  if(state.eyeColor){
    const rgb=state.eyeColor.slice(1).match(/../g).map(v=>parseInt(v,16));
    for(let y=90;y<300;y++)for(let x=60;x<452;x++){
      const i=(y*512+x)*4,r=originalPixels[i],g=originalPixels[i+1],b=originalPixels[i+2];
      if(!centers.some(e=>Math.hypot(x-e.x,y-e.y)<55)||g<60||g<r-5||g<b+18||p[i+3]<240)continue;
      const blend=Math.min(1,(g-b-15)/10)*Math.min(1,(g-r+8)/7),light=(r*.3+g*.6+b*.1)/160;
      for(let k=0;k<3;k++)p[i+k]=p[i+k]*(1-blend)+Math.min(255,rgb[k]*light)*blend;
    }
  }
  const out=surface(),oc=out.getContext('2d',{willReadFrequently:true}),dest=oc.createImageData(512,512);
  // Smooth inverse displacement avoids holes and duplicate eye edges.
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    let u=x,v=y;
    for(let side=0;side<2;side++){
      const e=centers[side],shift=(side?1:-1)*state.eyeSpacing*.10;
      const dx=x-e.x-shift,dy=y-e.y,r2=dx*dx+dy*dy;
      if(r2>110*110)continue;
      const weight=Math.exp(-r2/(52*52));
      u-=shift*weight;
      const scale=1+(state.eyeSize*.0018+(side?1:-1)*details.asymmetry*.0008)*weight;
      u=e.x+(u-e.x)/scale;v=e.y+(v-e.y)/(scale*(1-details.lid*.0035*weight));
      if(e.visible){
        const gazeWeight=Math.exp(-((u-e.px)**2+(v-e.py)**2)/(27*27));
        u-=details.gazeX*.065*gazeWeight;v-=details.gazeY*.045*gazeWeight;
        const px=u-e.px,py=v-e.py,pw=Math.exp(-(px*px+py*py)/(21*21));
        const ps=1+state.pupilSize*.0025*pw;
        u=e.px+px/ps;v=e.py+py/ps;
      }
    }
    u=Math.max(0,Math.min(511,u));v=Math.max(0,Math.min(511,v));
    const x0=Math.floor(u),y0=Math.floor(v),x1=Math.min(511,x0+1),y1=Math.min(511,y0+1),fx=u-x0,fy=v-y0;
    const i=(y*512+x)*4,a=(y0*512+x0)*4,b=(y0*512+x1)*4,d=(y1*512+x0)*4,e=(y1*512+x1)*4;
    for(let k=0;k<4;k++)dest.data[i+k]=(p[a+k]*(1-fx)+p[b+k]*fx)*(1-fy)+(p[d+k]*(1-fx)+p[e+k]*fx)*fy;
  }
  oc.putImageData(dest,0,0);if(cache.size>18)cache.clear();cache.set(key,out);return out;
}

export function drawBody(c,layer,s){
  const padding=layer.topPadding||0;
  if(!s.width&&!s.height){c.drawImage(layer,0,-padding);return;}
  const h=1+s.height*.0009;
  // Horizontal strips form a continuous waist-free deformation; all worn parts share it.
  for(let y=-padding;y<512;y+=2){
    const w=1+s.width*.0012*(.65+.35*y/512),top=512+(y-512)*h;
    c.drawImage(layer,0,y+padding,512,2,256-256*w,top,512*w,2*h+.35);
  }
}
export function drawStickers(c,s,images,layer='all',custom){
  for(const sticker of s.stickers||[]){
    if(layer==='tattoo'&&sticker.kind<12||layer==='sticker'&&sticker.kind>=12)continue;
    const img=sticker.kind===15?custom?.get(sticker.image):images?.[sticker.kind];if(!img)throw Error('纹身素材未就绪，无法绘制完整头像。');
    c.save();c.translate(sticker.x,sticker.y);c.transform(...stickerMatrix(sticker),0,0);
    if(sticker.kind>=12)c.globalCompositeOperation='multiply';c.globalAlpha=(sticker.opacity??(sticker.kind>=12?86:100))/100;
    c.drawImage(img,-sticker.size/2,-sticker.size/2,sticker.size,sticker.size);c.restore();
  }
}
export function hitSticker(s,x,y){
  const topFirst=[...s.stickers].reverse();
  return [...topFirst.filter(v=>v.kind<12),...topFirst.filter(v=>v.kind>=12)].find(v=>containsSticker(v,x,y));
}
