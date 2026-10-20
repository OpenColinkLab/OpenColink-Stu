import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import './style.css';

const host=document.querySelector('#scene');
const scene=new THREE.Scene();scene.background=new THREE.Color('#eef0f2');
const camera=new THREE.PerspectiveCamera(36,host.clientWidth/host.clientHeight,.1,80);
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});}catch(e){document.querySelector('#loading').textContent='无法启动 3D 显示，请使用支持 WebGL 的浏览器并开启硬件加速。';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;host.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.rotateSpeed=.55;controls.zoomSpeed=.8;controls.panSpeed=.6;controls.minDistance=5.2;controls.maxDistance=18;controls.minPolarAngle=.22;controls.maxPolarAngle=Math.PI*.455;controls.screenSpacePanning=false;controls.autoRotate=false;controls.autoRotateSpeed=.18;
const mats={};function mat(key,color,opts={}){return mats[key]??=(new THREE.MeshStandardMaterial({color,roughness:.78,...opts}));}
const metal=mat('metal','#303537',{roughness:.52,metalness:.35}), wood=mat('wood','#b38a60'),edge=mat('edge','#99734e'),white=mat('white','#eeeae0'),wallmat=mat('wall','#e3e5e1'),dark=mat('dark','#343e48'),cream=mat('cream','#d9d0b0'),silver=mat('silver','#a0a6a6',{metalness:.5,roughness:.4});
// All measurements are visual estimates in metres, reconciled across four photographs.
const room=new THREE.Group();scene.add(room);const walls=[];const W=3.6,L=5.8,H=3.25;
function box(parent,w,h,d,x,y,z,m,r=0){const a=new THREE.Mesh(r?new RoundedBoxGeometry(w,h,d,2,r):new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a;}
function rod(parent,a,b,r=.018,m=metal){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),10),m);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());o.castShadow=true;parent.add(o);return o;}
function cyl(parent,rt,rb,h,x,y,z,m,n=24){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function torus(parent,r,t,x,y,z,m){const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,32),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);parent.add(o);return o;}
function group(parent,x=0,y=0,z=0,rot=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;parent.add(g);return g;}
function label(text,bg='#a54038',fg='#fff',w=256,h=64){const c=document.createElement('canvas');c.width=w;c.height=h;const a=c.getContext('2d');a.fillStyle=bg;a.fillRect(0,0,w,h);a.fillStyle=fg;a.font=`500 ${h*.5}px sans-serif`;a.textAlign='center';a.textBaseline='middle';a.fillText(text,w/2,h/2);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshStandardMaterial({map:tx,roughness:.9});}
// Subtle grain keeps all furniture in one restrained material language.
function grain(){const c=document.createElement('canvas');c.width=128;c.height=256;const q=c.getContext('2d');q.fillStyle='#b59069';q.fillRect(0,0,128,256);let seed=13;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let i=0;i<260;i++){q.strokeStyle=`rgba(${rand()>.5?'72,46,24':'235,210,177'},${rand()*.08})`;q.beginPath();const x=rand()*128;q.moveTo(x,0);q.bezierCurveTo(x+5,80,x-3,160,x+2,256);q.stroke();}const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.wrapS=tx.wrapT=THREE.RepeatWrapping;return tx;}wood.map=grain();wood.color.set('#e4c9a5');
// Floating architectural plinth, tile grout and a soft contact shadow.
box(room,W+.24,.19,L+.24,0,-.14,0,mat('base','#d5d9dc'),.025);
box(room,W+.12,.055,L+.12,0,-.035,0,mat('grout','#adafa7'));
for(let i=0;i<6;i++)for(let j=0;j<10;j++)box(room,.594,.025,.574,-1.5+i*.6,-.003,-2.61+j*.58,mat('tile'+(i+j)%4,['#ccc8b9','#d1cdbf','#cdcabe','#cfccbf'][(i+j)%4]),.002);
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;let sc=shadowCanvas.getContext('2d'),grad=sc.createRadialGradient(64,64,4,64,64,64);grad.addColorStop(0,'rgba(35,46,60,.28)');grad.addColorStop(.55,'rgba(35,46,60,.12)');grad.addColorStop(1,'rgba(35,46,60,0)');sc.fillStyle=grad;sc.fillRect(0,0,128,128);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(8.5,10),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.251;scene.add(shadow);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.10}));ground.rotation.x=-Math.PI/2;ground.position.y=-.245;ground.receiveShadow=true;scene.add(ground);
function wall(side){const g=group(room);walls.push({g,side});return g;}
const left=wall('left');box(left,.12,H,L,-W/2-.06,H/2,0,wallmat);box(left,.035,.12,L,-W/2+.01,.06,0,mat('skirt','#767774'));
const right=wall('right');for(const z of [-1.705,1.705])box(right,.12,H,2.39,W/2+.06,H/2,z,wallmat);box(right,.12,1.06,1.02,W/2+.06,2.72,0,wallmat);
for(const z of [-1.72,1.72])box(right,.035,.12,2.36,W/2-.01,.06,z,mat('skirt','#767774'));
// Side entrance and split air conditioner, as seen above the door in IMG_2733.
const entrance=group(right,W/2-.04,0,0,Math.PI/2);
for(const x of [-.53,.53])box(entrance,.055,2.22,.12,x,1.11,0,edge,.009);box(entrance,1.11,.055,.12,0,2.22,0,edge,.006);
const door=group(entrance,-.5,0,.02,-.64);box(door,.97,2.13,.045,.485,1.065,0,mat('door','#bdaf91'),.008);box(door,.025,.13,.06,.84,1.05,-.045,silver,.006);
box(entrance,.12,.19,.028,-.69,1.25,-.075,cream,.008);box(entrance,.08,.07,.01,-.69,1.24,-.097,white);
box(entrance,1.02,.36,.23,0,2.81,-.09,mat('ac','#edeee6'),.045);box(entrance,.86,.045,.016,0,2.705,-.216,mat('vent','#848b88'),.006);for(let i=0;i<3;i++)box(entrance,.82,.007,.02,0,2.694+i*.013,-.227,white);box(entrance,.07,.035,.005,.34,2.85,-.21,mat('led','#9cbcb6'));
rod(right,[1.79,2.82,.52],[1.79,2.82,1],.032,white);
const back=wall('back');box(back,W,.90,.12,0,.45,-L/2-.06,wallmat);box(back,W,.67,.12,0,2.915,-L/2-.06,wallmat);for(const x of [-1.235,1.235])box(back,1.13,1.68,.12,x,1.74,-L/2-.06,wallmat);box(back,W,.12,.025,0,.06,-L/2+.015,mat('skirt','#767774'));
// Real window behind the closed warm beige curtain.
box(back,1.34,1.63,.04,0,1.72,-2.925,silver);box(back,1.24,1.53,.02,0,1.72,-2.897,mat('glass','#a9bdc8',{roughness:.27}));box(back,.035,1.53,.025,0,1.72,-2.875,white);box(back,1.24,.035,.025,0,1.72,-2.875,white);box(back,1.48,.055,.21,0,.91,-2.86,white);
function cloth(parent,width,height,x,y,z,color,folds=9,opacity=1){const geo=new THREE.PlaneGeometry(width,height,folds*6,14);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const xx=p.getX(i),yy=p.getY(i);p.setZ(i,Math.sin((xx/width+.5)*Math.PI*2*folds)*.010+Math.sin(yy*9+xx*5)*.006);p.setY(i,yy+Math.cos(xx*19)*.009*(.5-yy/height));}geo.computeVertexNormals();const m=new THREE.MeshStandardMaterial({color,roughness:.96,side:THREE.DoubleSide,transparent:opacity<1,opacity,depthWrite:opacity===1});const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=opacity===1;o.receiveShadow=true;parent.add(o);return o;}
cloth(back,1.33,1.54,0,1.71,-2.8,'#cfc6a8',10);rod(back,[-.74,2.51,-2.79],[.74,2.51,-2.79],.019,silver);
const front=wall('front');for(const x of [-1.35,1.35])box(front,.9,H,.12,x,H/2,2.96,wallmat);box(front,1.8,.43,.12,0,3.035,2.96,wallmat);
// Small balcony recess, visible through the end opening.
const balcony=group(front);box(balcony,1.8,.1,.64,0,-.02,3.21,mat('tile0','#ccc8b9'));for(const x of [-.88,.88])box(balcony,.06,2.66,.62,x,1.33,3.2,white);box(balcony,1.74,2.54,.045,0,1.39,3.52,silver);box(balcony,1.64,2.42,.025,0,1.39,3.49,mat('balconyglass','#a1b5be',{roughness:.38}));for(const x of [-.81,0,.81])box(balcony,.035,2.44,.035,x,1.39,3.455,white);for(const y of [.2,.95,1.9,2.61])box(balcony,1.65,.035,.035,0,y,3.455,white);for(const y of [.45,.7,.95])rod(balcony,[-.8,y,3.36],[.8,y,3.36],.016,cream);cloth(front,.29,2.6,.76,1.39,2.84,'#cfc6a8',5);rod(front,[-.9,2.77,2.82],[.9,2.77,2.82],.017,silver);
rod(balcony,[-.58,.15,3.18],[-.45,1.12,3.31],.014,edge);box(balcony,.26,.07,.10,-.58,.11,3.18,mat('broom','#855a50'));
// Loft bed unit: desk faces local +Z; two units on each long wall.
function book(parent,x,y,z,i){const colors=['#ded7c3','#617665','#ab7864','#f0e8d9','#687987','#c5b697'];const h=.22+(i%3)*.035;box(parent,.035,h,.16,x,y+h/2,z,mat('book'+i%6,colors[i%6]),.002);box(parent,.026,.009,.003,x,y+h*.75,z+.083,cream);}
function laptop(p,x,z,on=true){const g=group(p,x,.827,z);box(g,.39,.017,.265,0,0,0,mat('laptop','#b2b9bb'),.01);box(g,.31,.005,.12,0,.01,-.025,mat('keyboard','#58616a'),.004);for(let i=0;i<4;i++)box(g,.28,.001,.002,0,.013,-.068+i*.026,silver);box(g,.09,.003,.055,0,.011,.083,silver,.003);const s=group(g,0,.018,-.122,-0);s.rotation.x=-.16;box(s,.385,.25,.015,0,.125,0,dark,.009);const cm=on?label('','#253c4b','#fff',256,160):mat('offscreen','#222d33');if(on){const ctx=cm.map.image.getContext('2d');const gr=ctx.createLinearGradient(0,0,256,160);gr.addColorStop(0,'#527287');gr.addColorStop(.5,'#2d405c');gr.addColorStop(1,'#b09084');ctx.fillStyle=gr;ctx.fillRect(0,0,256,160);ctx.fillStyle='#d6e1e3';ctx.fillRect(18,23,91,3);for(let j=0;j<5;j++){ctx.fillStyle='#a3b8bf';ctx.fillRect(18,36+j*7,65-j*6,2);}ctx.fillStyle='#1e2b39';ctx.fillRect(140,18,94,117);ctx.fillStyle='#91a7b2';for(let j=0;j<11;j++)ctx.fillRect(150,29+j*8,35+(j%3)*10,2);cm.map.needsUpdate=true;}box(s,.354,.219,.002,0,.127,.009,cm);}
function bottle(p,x,y,z,color,h=.17){const m=mat('bottle'+color,color);cyl(p,.035,.04,h,x,y+h/2,z,m,14);cyl(p,.015,.019,.025,x,y+h+.012,z,white,12);box(p,.08,.013,.018,x+.018,y+h+.032,z,white,.005);}
function chair(p,x,z,office=false,coat=false){const g=group(p,x,0,z,Math.PI);const seat=office?mat('seat','#414849'):wood;box(g,.45,.06,.43,0,.48,0,seat,.025);if(office){rod(g,[0,.12,0],[0,.45,0],.036,metal);for(let i=0;i<5;i++){let a=i*Math.PI*2/5;rod(g,[0,.16,0],[Math.sin(a)*.31,.07,Math.cos(a)*.31],.02);cyl(g,.04,.04,.035,Math.sin(a)*.31,.045,Math.cos(a)*.31,metal,12);}box(g,.45,.51,.09,0,.79,-.18,seat,.06);for(const x of [-.27,.27]){rod(g,[x,.43,0],[x,.67,0],.02);box(g,.055,.035,.26,x,.69,0,seat,.015);}}else{for(const x of [-.19,.19])for(const z of [-.18,.18])rod(g,[x,.03,z],[x,.49,z],.016);for(const x of [-.20,.20])rod(g,[x,.4,-.18],[x,1.02,-.21],.017);for(const y of [.68,.83,.98])rod(g,[-.2,y,-.2],[.2,y,-.2],.018);}if(coat){cloth(g,.48,.61,0,.79,-.23,office?'#a5a9aa':'#75806a',5);box(g,.46,.035,.32,0,.53,-.04,mat('coat'+office,office?'#a5a9aa':'#75806a'),.025);}}
const beds=[];const cutFurniture=[];
function bed(side,z,index,tint,office=false){const g=group(room,side*1.285,0,z,side===-1?Math.PI/2:-Math.PI/2);beds.push(g);
const B=2.05,D=1.01;const pale=index===3;const furniture=pale?mat('pale','#c4c3b7'):wood;
for(const x of [-B/2,B/2])for(const zz of [-D/2,D/2])rod(g,[x,.02,zz],[x,2.03,zz],.028);
box(g,B,.09,D,0,1.76,0,edge,.012);for(const zz of [-.50,.50])rod(g,[-1.045,1.79,zz],[1.045,1.79,zz],.025);
box(g,1.99,.11,.96,0,1.85,0,mat('mattress','#d5d6cb'),.04);box(g,1.53,.05,.88,-.15,1.93,0,mat('blanket'+index,['#8192a4','#a1aab0','#b5c1c4','#718799'][index-1]),.025);box(g,.40,.09,.7,.71,1.98,0,mat('pillow','#e0e0d6'),.045);
// Upright safety guards and end rails.
for(const x of [-1.025,1.025]){rod(g,[x,1.8,-.5],[x,2.21,-.5],.025);rod(g,[x,2.21,-.5],[x,2.21,.5],.025);rod(g,[x,2.21,.5],[x,1.8,.5],.025);for(const zz of [-.22,.18])rod(g,[x,1.8,zz],[x,2.21,zz],.013);}
for(const y of [1.94,2.13])rod(g,[-.74,y,.52],[.69,y,.52],.016);for(const x of [-.74,0,.69])rod(g,[x,1.8,.52],[x,2.13,.52],.014);
// Thin blue canopy frame, folded mesh curtain, and small stitched edge.
const fabric=mat('canopy'+index,tint);for(const x of [-.99,.99])for(const zz of [-.46,.46])rod(g,[x,1.93,zz],[x,2.96,zz],.009,silver);
box(g,2.02,.038,.99,0,2.98,0,fabric,.01);for(const zz of [-.485,.485])box(g,2.025,.10,.018,0,2.923,zz,fabric);for(const x of [-1,1])box(g,.018,.1,.97,x,2.923,0,fabric);
cloth(g,1.98,.88,0,2.46,-.47,tint,12);for(const x of [-1,1]){const end=cloth(g,.94,.88,x,2.46,0,'#a3aeb5',6,.73);end.rotation.y=Math.PI/2;}
// Mostly closed mosquito net, with a modest opening matching the photo folds.
cloth(g,1.62,.85,-.18,2.455,.477,index===3?'#b3bfc3':'#a6adb6',12,.64);cloth(g,.18,.9,.90,2.44,.49,tint,4);box(g,1.67,.045,.02,-.18,2.012,.50,fabric,.008);
for(const x of [-.99,.64])rod(g,[x,2.04,.505],[x,2.88,.505],.006,white);
const badge=new THREE.Mesh(new THREE.PlaneGeometry(.20,.065),label(`杏宜 ${index}号`));badge.position.set(.69,1.785,.555);g.add(badge);
// Wardrobe at the left end, writing surface, upper bookshelf, storage pedestals.
box(g,.50,1.64,.81,-.75,.84,-.07,furniture,.008);box(g,.464,1.54,.018,-.75,.88,.348,furniture,.009);rod(g,[-.60,.90,.37],[-.60,1.06,.37],.009,metal);
box(g,1.48,.045,.63,.27,.805,.015,furniture,.006);const backboard=box(g,1.48,1.0,.025,.27,1.26,-.414,furniture);cutFurniture.push({g,backboard});box(g,1.48,.035,.25,.27,1.33,-.28,furniture,.004);box(g,1.48,.035,.27,.27,1.68,-.27,furniture,.004);
for(const x of [-.46,.69,1.02])box(g,.028,.84,.28,x,1.27,-.28,furniture);
box(g,.31,.035,.27,.85,1.07,-.27,furniture);box(g,.31,.035,.27,.85,1.48,-.27,furniture);
box(g,.35,.70,.56,.81,.42,.0,furniture,.006);box(g,.315,.19,.016,.81,.69,.29,furniture);box(g,.315,.44,.017,.81,.35,.29,furniture);rod(g,[.74,.71,.31],[.86,.71,.31],.008,metal);rod(g,[.92,.31,.31],[.92,.43,.31],.008,metal);
box(g,.94,.12,.51,.15,.714,-.01,furniture);box(g,.87,.014,.48,.15,.641,0,edge);
for(let i=0;i<8;i++)book(g,-.37+i*.054,1.35,-.28,i+index);for(let j=0;j<2;j++)box(g,.23,.037,.17,.32,1.37+j*.04,-.28,mat('book'+(j+index)%6,'#a18c75'),.003);
laptop(g,.12,.06,index!==1);box(g,.21,.012,.25,.50,.839,.12,mat('pad','#aaa697'),.008);box(g,.05,.031,.083,.50,.862,.14,dark,.016);
box(g,.22,.014,.17,-.28,.837,.08,white);bottle(g,.86,.83,.16,index===1?'#cba5a0':'#ded1aa');cyl(g,.036,.032,.17,.9,.925,-.22,mat('cup','#e4e1d6'));
const lampmat=mat('lamp','#e5ded0');cyl(g,.073,.073,.014,.58,.839,-.24,lampmat);rod(g,[.58,.85,-.24],[.58,1.18,-.24],.012,lampmat);box(g,.44,.017,.033,.39,1.185,-.24,lampmat,.008);box(g,.4,.008,.028,.39,1.174,-.24,mat('glow','#ffdfac',{emissive:'#ffd19a',emissiveIntensity:1.2}));const task=new THREE.PointLight('#ffdcaa',.42,.9,2);task.position.set(.30,1.11,-.12);g.add(task);
// Ladder on the aisle-facing end, clear of the desktop and chair.
for(const x of [-1.02,-.70])rod(g,[x,.05,.67],[x,1.82,.54],.018,silver);for(let i=0;i<6;i++)rod(g,[-1.02,.24+i*.265,.653-i*.019],[-.70,.24+i*.265,.653-i*.019],.016,silver);
chair(g,.17,.81,office,index===2||index===4);
if(index===3){cloth(g,.43,.46,-.96,1.33,.58,'#91b0c2',5);cloth(g,.21,.51,-.68,1.29,.59,'#b8beba',3);}if(index===1){cloth(g,.36,.50,.94,1.29,.54,'#bfc4c3',5);}
// Bedside wire basket.
const basket=group(g,.13,2.08,.61);box(basket,.36,.025,.16,0,-.04,0,metal);for(const xx of [-.18,.18])rod(basket,[xx,-.04,.08],[xx,.13,.08],.006);for(const yy of [0,.045,.09,.13])rod(basket,[-.18,yy,.08],[.18,yy,.08],.004);for(let i=0;i<8;i++)rod(basket,[-.175+i*.05,-.04,.08],[-.175+i*.05,.13,.08],.003);box(basket,.13,.035,.07,.045,-.01,0,mat('basketitem','#bbb9a8'),.008);
}
bed(-1,1.73,2,'#7c909e');bed(-1,-1.73,3,'#90abb8');bed(1,1.73,1,'#6d849c');bed(1,-1.73,4,'#607e95',true);
// Communal wash-basin / shoe rack in the gap opposite the entrance.
const rack=group(room,-1.33,0,0,Math.PI/2);for(const x of [-.37,.37])for(const z of [-.22,.22])rod(rack,[x,.02,z],[x,.82,z],.013,silver);for(const y of [.15,.42,.73])box(rack,.77,.025,.47,0,y,0,wood,.003);
function basin(p,x,y,z,r,color){const m=mat('basin'+color,color);cyl(p,r*.97,r*.74,.12,x,y+.06,z,m);torus(p,r,.015,x,y+.12,z,m);cyl(p,r*.79,r*.72,.003,x,y+.121,z,mat('basininside'+color,color));box(p,r*.8,.052,r*.7,x,y+.14,z,mat('laundry','#d4d9d5'),.025);}
basin(rack,-.17,.746,0,.19,'#d2cdb0');basin(rack,.08,.434,0,.18,'#d6d2bd');basin(rack,-.16,.163,0,.15,'#aaa68a');
cyl(rack,.095,.075,.17,.22,.827,.02,mat('washbasket','#9eafb0'),16);for(let i=0;i<5;i++)box(rack,.012,.10,.005,.155+i*.03,.83,.108,mat('holes','#627c80'));
bottle(rack,.31,.75,-.12,'#b7a0ac',.18);bottle(rack,.1,.75,-.12,'#91a9a3',.15);
box(room,.18,.26,.60,-1.70,.88,0,mat('trunk','#39413f'),.025);box(room,.20,.025,.64,-1.70,.74,0,wood);for(const z of [-.2,.2])box(room,.19,.02,.04,-1.70,1.005,z,dark);
function cardboard(x,z,w=.40,d=.37){const g=group(room,x,0,z,.12),m=mat('cardboard','#b4976c');box(g,w,.018,d,0,.018,0,m);for(const xx of [-w/2,w/2])box(g,.012,.28,d,xx,.15,0,m);for(const zz of [-d/2,d/2])box(g,w,.28,.012,0,.15,zz,m);for(const xx of [-1,1]){const flap=box(g,.17,.01,d,xx*(w/2+.065),.32,0,m);flap.rotation.z=xx*.6;}const flap=box(g,w,.01,.17,0,.33,-d/2-.04,m);flap.rotation.x=-.65;box(g,.13,.003,.10,0,.032,0,white);}
cardboard(-.76,-.05,.40,.43);cardboard(-.70,.50,.30,.31);
const suitcase=group(room,0,0,-2.53,-.05);box(suitcase,.37,.60,.23,0,.34,0,mat('case','#756759'),.035);for(const x of [-.13,0,.13])box(suitcase,.015,.52,.005,x,.34,.119,cream);for(const y of [.13,.3,.47,.6])box(suitcase,.34,.015,.005,0,y,.12,cream);for(const x of [-.14,.14])cyl(suitcase,.035,.035,.025,x,.036,0,metal);rod(suitcase,[-.08,.67,0],[.08,.67,0],.017,metal);
function slipper(x,z,rot){const g=group(room,x,.028,z,rot);const m=mat('slippers','#d8d3c3');box(g,.10,.035,.24,0,0,0,m,.03);box(g,.105,.052,.095,0,.035,-.025,m,.025);box(g,.072,.014,.072,0,.011,.074,mat('slipperInner','#bdb8ab'),.018);}
slipper(-.22,.29,.4);slipper(.05,.50,-.25);
// Two fluorescent ceiling fixtures retained in a roofless architectural section.
const ceiling=group(room);for(const z of [-1.60,1.60]){box(ceiling,1.04,.055,.18,0,3.20,z,mat('fixture','#c5c7bf'),.008);for(const dz of [-.05,.05])rod(ceiling,[-.47,3.164,z+dz],[.47,3.164,z+dz],.022,mat('tube','#ffffe9',{emissive:'#fff5d7',emissiveIntensity:.5}));}
// Ceiling is represented by the cut perimeter so it never obscures the room.
for(const x of [-1.77,1.77])box(x<0?left:right,.065,.09,L,x,3.21,0,white);for(const z of [-2.87,2.87])box(z<0?back:front,W,.09,.065,0,3.21,z,white);
scene.add(new THREE.HemisphereLight('#e9f4ff','#b5ab97',2.0));scene.add(new THREE.AmbientLight('#fff5e7',.35));const sun=new THREE.DirectionalLight('#fff6df',2.2);sun.position.set(-3,8,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-5;sun.shadow.camera.right=5;sun.shadow.camera.top=5;sun.shadow.camera.bottom=-5;sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;sun.shadow.radius=4;scene.add(sun);const fill=new THREE.DirectionalLight('#dceaff',1.1);fill.position.set(4,5,-4);scene.add(fill);
// Batch repeated opaque furniture parts to keep mobile draw calls low.
function batchOpaque(root){root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(), batches=new Map(), skip=new Set(cutFurniture.map(x=>x.backboard));root.traverse(o=>{if(!o.isMesh||o.material.transparent||skip.has(o)||Array.isArray(o.material))return;const key=o.material.uuid;if(!batches.has(key))batches.set(key,{material:o.material,meshes:[]});batches.get(key).meshes.push(o);});for(const {material,meshes} of batches.values()){if(meshes.length<2)continue;const parts=meshes.map(o=>{const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(inverse.clone().multiply(o.matrixWorld));return geo;});const geometry=mergeGeometries(parts);if(!geometry)continue;const merged=new THREE.Mesh(geometry,material);merged.castShadow=true;merged.receiveShadow=true;root.add(merged);meshes.forEach(o=>o.removeFromParent());parts.forEach(g=>g.dispose());}}
for(const g of [...beds,...walls.map(w=>w.g),rack,ceiling])batchOpaque(g);
const isMobile=()=>innerWidth<650;
let resetAnimation=null;function defaultPosition(){const direction=new THREE.Vector3(-6.8,7.6,11.8);if(isMobile()){const aspect=host.clientWidth/host.clientHeight;return direction.normalize().multiplyScalar(Math.max(13.5,11.8/aspect));}return direction;}
function defaultTarget(){return new THREE.Vector3(isMobile()?0:-.45,isMobile()?1.45:1.08,0);}
function reset(animate=true){resetAnimation=null;controls.enableDamping=false;controls.update();controls.enableDamping=true;const dest=defaultPosition(),target=defaultTarget();if(animate)resetAnimation={t:0,from:camera.position.clone(),fromTarget:controls.target.clone(),dest,target};else{camera.position.copy(dest);controls.target.copy(target);controls.update();}setRotate(false);}
function setRotate(value){controls.autoRotate=value;document.querySelector('#rotate').setAttribute('aria-pressed',String(value));document.querySelector('#rotate-state').textContent=value?'开':'关';}
reset(false);document.querySelector('#reset').addEventListener('click',()=>reset());document.querySelector('#rotate').addEventListener('click',()=>{resetAnimation=null;setRotate(!controls.autoRotate);});
let toastTimeout;function toast(text){const el=document.querySelector('#message');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('visible'),2800);}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('当前浏览器不支持全屏，请使用横屏浏览。');}catch{toast('当前浏览器暂时无法进入全屏。');}}
document.querySelector('#fullscreen').addEventListener('click',fullscreen);document.addEventListener('fullscreenchange',()=>{document.querySelector('#fullscreen span').textContent=document.fullscreenElement?'退出全屏':'全屏';});
controls.addEventListener('start',()=>{resetAnimation=null;setRotate(false);});renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r')reset();if(e.key.toLowerCase()==='f')fullscreen();});
let previousMobile=isMobile();window.addEventListener('resize',()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));if(isMobile()||previousMobile!==isMobile()){previousMobile=isMobile();reset(false);}});
// Nearest exterior walls are cut away as the viewing angle changes.
function updateCutaway(){const direction=camera.position.clone().sub(controls.target);for(const {g,side} of walls){const dot=side==='left'?-direction.x:side==='right'?direction.x:side==='front'?direction.z:-direction.z;g.visible=dot<.7;}for(const {g,backboard} of cutFurniture){const local=g.worldToLocal(camera.position.clone());backboard.visible=local.z>-.1;}ceiling.visible=camera.position.y<6.3;}
let last=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(resetAnimation){const a=resetAnimation;a.t+=dt;const t=Math.min(a.t/.8,1),v=1-Math.pow(1-t,3);camera.position.lerpVectors(a.from,a.dest,v);controls.target.lerpVectors(a.fromTarget,a.target,v);if(t===1)resetAnimation=null;}const before=controls.target.clone();controls.target.x=THREE.MathUtils.clamp(controls.target.x,-1,1);controls.target.z=THREE.MathUtils.clamp(controls.target.z,-1.3,1.3);controls.target.y=THREE.MathUtils.clamp(controls.target.y,.4,1.8);camera.position.add(controls.target.clone().sub(before));controls.update(dt);updateCutaway();renderer.render(scene,camera);}
requestAnimationFrame(frame);document.querySelector('#loading').style.opacity='0';setTimeout(()=>document.querySelector('#loading').remove(),550);
// Read-only scene diagnostics used for browser validation.
window.__dorm={scene,camera,controls,renderer,bedCount:beds.length,roomSize:{width:W,length:L,height:H},reset:()=>reset(false)};
