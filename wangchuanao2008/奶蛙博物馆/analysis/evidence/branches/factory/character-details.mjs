import {newHeadwear,clothes,headphones,backwear} from './wardrobe.mjs';
export const detailControls = [
 {id:'gazeX',name:'左右看',min:-100,max:100,value:0},
 {id:'gazeY',name:'上下看',min:-100,max:100,value:0},
 {id:'asymmetry',name:'左右眼差异',min:-100,max:100,value:0},
 {id:'lid',name:'眼睑放松',min:0,max:100,value:0},
 {id:'materialStrength',name:'材质强度',min:0,max:100,value:65},
 {id:'blush',name:'腮红',min:0,max:100,value:0},
 {id:'freckles',name:'雀斑',min:0,max:100,value:0},
 {id:'beauty',name:'小痣',min:0,max:100,value:0},
 {id:'patternSize',name:'花纹大小',min:10,max:100,value:50},
 {id:'patternStrength',name:'花纹浓度',min:0,max:100,value:45},
 {id:'density',name:'花纹密度',min:10,max:100,value:50},
 {id:'lightStrength',name:'光照强度',min:0,max:100,value:50},
];
// Keep saved headpiece indices stable; new accessories append after the original bath cap.
export const headpieces = [
 {id:'bath',name:'云朵浴帽',bounds:[100,5,312,160],coversHair:true},
 {id:'delivery',name:'袋鼠耳黄头盔',bounds:[87,-160,338,330],coversHair:true,helmet:true,headroom:170},
 {id:'blue',name:'竹蜻蜓蓝头盔',bounds:[88,-90,336,250],coversHair:true,helmet:true,headroom:100},
 {id:'snow',name:'雪王皇冠',bounds:[190,0,132,78]},
 {id:'rollers',name:'包租婆卷发筒',bounds:[83,14,346,188],coversHair:true},
 {id:'wukong',name:'悟空紧箍',bounds:[113,88,286,72]},
 {id:'wealth',name:'财神帽',bounds:[60,0,392,151],coversHair:true},
 ...newHeadwear,
];
export const detailMenus = [
 {id:'earwear',name:'耳机',options:['不添加','头戴耳机',...headphones.map(v=>v.name)]},
 {id:'clothing',name:'上衣',options:['不穿衣服',...clothes.map(v=>v.name)]},
 {id:'backwear',name:'背部装饰',options:['不添加',...backwear.map(v=>v.name)]},
 {id:'jewelry',name:'项链',options:['不添加','金链子','银链子','玉环细绳']},
 {id:'pose',name:'手势',options:['不添加','托腮','抱臂','比心','挥手']},
 {id:'prop',name:'手里拿着',options:['不添加','咖啡','奶茶','山茶花','游戏手柄','折扇']},
 {id:'headpiece',name:'头饰',options:['不添加',...headpieces.map(h=>h.name)]},
 {id:'neckwear',name:'浴巾',options:['不添加','柔软浴巾']},
 {id:'bandage',name:'创可贴',options:['不添加','粉色布贴']},
 {id:'material',name:'本体材质',options:['原版软胶','哑光陶瓷','短绒毛','半透果冻','珍珠光泽']},
 {id:'highlight',name:'眼睛高光',options:['原版','水光','星星','爱心']},
 {id:'pattern',name:'皮肤花纹',options:['不添加','双色肚皮','细小斑点','柔软条纹','晒痕','局部珠光']},
 {id:'light',name:'灯光',options:['原版柔光','窗边侧光','闪光灯']},
 {id:'framing',name:'取景',options:['标准半身','头像特写','圆形安全构图']},
 {id:'backdrop',name:'背景构成',options:['纯色原景','双色拼接','纸片拼贴','窗边一角']},
];
export const detailDefaults=Object.freeze(Object.fromEntries([...detailControls.map(c=>[c.id,c.value]),...detailMenus.map(c=>[c.id,0])]));
export function validDetails(d){
 return !!d&&typeof d==='object'&&!Array.isArray(d)&&Object.keys(d).length===Object.keys(detailDefaults).length
  &&detailControls.every(c=>Number.isInteger(d[c.id])&&d[c.id]>=c.min&&d[c.id]<=c.max)
  &&detailMenus.every(c=>Number.isInteger(d[c.id])&&d[c.id]>=0&&d[c.id]<c.options.length);
}
export const surface=()=>Object.assign(document.createElement('canvas'),{width:512,height:512});
const clamp=n=>Math.max(0,Math.min(255,n));
const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
// Modify only the original yellow skin mask. Irises, mouth and wearable layers stay untouched.
export function finishSkin(image,original,s){
 const d=s.details;
 if(!d.material&&!d.blush&&!d.freckles&&!d.beauty&&!d.pattern&&!d.light)return image;
 const out=surface(),c=out.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0,512,512);
 const src=surface(),sc=src.getContext('2d',{willReadFrequently:true});sc.drawImage(original,0,0,512,512);
 const a=sc.getImageData(0,0,512,512).data,pixels=c.getImageData(0,0,512,512),p=pixels.data;
 const strength=d.materialStrength/100,scale=8+d.patternSize*.42;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const i=(y*512+x)*4,r=a[i],g=a[i+1],b=a[i+2];
  if(!a[i+3]||r<60||r-g<6||g-b<12)continue;
  const mask=Math.min(1,(r-g-6)/8)*Math.min(1,(g-b-8)/20),cx=(x-256)/240,cy=(y-250)/270;
  let light=0;
  if(d.material===1)light=((r*.3+g*.6+b*.1)-210)*-.18*strength;
  if(d.material===2)light=(hash(Math.floor(x/2),Math.floor(y/3))*2-1)*9*strength+Math.sin(x*1.4+y*.7)*2*strength;
  if(d.material===3)light=(Math.pow(Math.abs(cx),4)*42+Math.exp(-((cx+.36)**2/.006+(cy+.43)**2/.028))*90-7)*strength;
  if(d.material===4)light=(Math.sin(cx*6+cy*3)*7+Math.exp(-((cx+.3)**2/.025+(cy+.45)**2/.1))*28)*strength;
  if(d.light===1)light+=(.22-cx)*32*d.lightStrength/100;
  if(d.light===2)light+=Math.max(0,1-cx*cx-cy*cy)*26*d.lightStrength/100;
  for(let k=0;k<3;k++)p[i+k]=clamp(p[i+k]+light*mask+(d.material===4?Math.sin(cx*4+cy*5+k*2)*7*strength*mask:0));
  if(d.material===3)p[i+3]*=1-strength*.12*mask;
  let blend=0,target=[248,241,216];
  const torso=y>300, belly=(cx/.63)**2+((y-470)/160)**2;
  if(d.pattern===1&&torso)blend=Math.max(0,Math.min(1,(1-belly)*7));
  if(d.pattern===2&&torso){const gx=Math.floor(x/scale),gy=Math.floor(y/scale),dx=x/scale-gx-.5,dy=y/scale-gy-.5;blend=hash(gx,gy)<d.density/100?Math.max(0,Math.min(1,(.11-dx*dx-dy*dy)*18)):0;target=[120,94,115];}
  if(d.pattern===3&&torso){blend=Math.max(0,Math.sin(y/scale*6+cx*cx*3)-.35);target=[120,107,159];}
  if(d.pattern===4){blend=torso?Math.max(0,Math.min(1,(y-330-Math.abs(cx)*50)/12)):0;target=[184,114,78];}
  if(d.pattern===5&&torso){blend=hash(x,y)>.997-d.density*.00003?1:0;target=[255,255,245];}
  blend*=d.patternStrength/100*mask;
  if(blend)for(let k=0;k<3;k++)p[i+k]=p[i+k]*(1-blend)+target[k]*(.64+(r*.3+g*.6+b*.1)/650)*blend;
  const cheek=Math.exp(-((Math.abs(x-256)-109)**2/500+(y-275)**2/125));
  const blush=cheek*d.blush/100*.45*mask;
  if(blush)for(let k=0;k<3;k++)p[i+k]=p[i+k]*(1-blush)+[222,112,134][k]*blush;
  const freckle=cheek>.25&&hash(Math.floor(x/7),Math.floor(y/7))<d.freckles/160&&((x%7-3)**2+(y%7-3)**2)<2;
  const beauty=d.beauty&&((x-319)**2+(y-288)**2)<(1+d.beauty/30)**2;
  if(freckle||beauty)for(let k=0;k<3;k++)p[i+k]*=1-.48*mask;
 }
 c.putImageData(pixels,0,0);return out;
}
export function eyeHighlights(c,s,anchor){
 if(!s.details.highlight||s.face<0)return;
 const d=s.details,p=c.getImageData(0,0,512,512).data;c.save();c.fillStyle='#fffdf1';
 for(const side of[-1,1]){
  const ex=anchor.x+side*(anchor.span/2+s.eyeSpacing*.1),ey=anchor.y;let sx=0,sy=0,n=0;
  for(let y=Math.max(0,Math.floor(ey-28));y<Math.min(512,ey+28);y++)for(let x=Math.max(0,Math.floor(ex-28));x<Math.min(512,ex+28);x++){const i=(y*512+x)*4;if(p[i]<65&&p[i+1]<70&&p[i+2]<65&&p[i+3]>200){sx+=x;sy+=y;n++;}}
  if(n<100)continue;
  const x=sx/n-4,y=sy/n-6;
  c.save();c.translate(x,y);c.beginPath();
  if(d.highlight===1)c.ellipse(0,0,5,7,-.35,0,Math.PI*2);
  if(d.highlight===2)for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?2.5:8;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(r,0);}
  if(d.highlight===3){c.moveTo(0,6);c.bezierCurveTo(-12,-1,-5,-11,0,-4);c.bezierCurveTo(5,-11,12,-1,0,6);}
  c.fill();c.restore();
 }c.restore();
}
export function detailBackdrop(c,s){
 const d=s.details;if(!d.backdrop||s.background<0)return;
 c.save();
 if(d.backdrop===1){c.fillStyle='#b9ced6';c.beginPath();c.moveTo(512,80);c.lineTo(512,512);c.lineTo(0,512);c.closePath();c.fill();}
 if(d.backdrop===2){for(const[x,y,w,h,angle,col]of [[25,55,180,300,-.15,'#f7edd8'],[340,15,140,235,.17,'#c0d5ce'],[70,370,400,120,-.05,'#c7bfdc']]){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=col;c.fillRect(0,0,w,h);c.restore();}}
 if(d.backdrop===3){c.fillStyle='#c0d6db';c.fillRect(280,30,200,320);c.strokeStyle='#f7f4ed';c.lineWidth=12;c.strokeRect(280,30,200,320);c.beginPath();c.moveTo(380,30);c.lineTo(380,350);c.moveTo(280,170);c.lineTo(480,170);c.stroke();c.fillStyle='#b5bcb4';c.fillRect(0,436,512,76);}
 c.restore();
}
export function framingTransform(c,s){
 const headroom=headpieces[s.details.headpiece-1]?.headroom||0;
 if(headroom){const scale=512/(512+headroom);c.translate(256,512);c.scale(scale,scale);c.translate(-256,-512);}
 const framing=s.details.framing;
 if(framing===1){c.translate(256,210);c.scale(1.18,1.18);c.translate(-256,-210);}
 if(framing===2){c.translate(256,290);c.scale(.88,.88);c.translate(-256,-290);}
}
