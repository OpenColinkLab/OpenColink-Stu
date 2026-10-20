// Local canvas composition. References never leave this browser.
export const generationScopes=[], accountScopes=[];
const visitor={id:'local',name:'本机',userUuid:'local-visitor'},tasks=new Map(),files=new Map();
const context={app:{id:'8a36fbe6-51f2-4ad9-9f28-46f933f756b1'},viewer:{userUuid:visitor.userUuid}};
const database=new Promise(resolve=>{try{const r=indexedDB.open('milkfrog-local-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);}catch{resolve(null);}});
async function store(path,blob){files.set(path,blob);const db=await database;if(db)await new Promise(resolve=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(blob,path);tx.oncomplete=resolve;tx.onerror=resolve;});}
async function read(path){if(files.has(path))return files.get(path);const db=await database;if(!db)return null;return new Promise(resolve=>{const r=db.transaction('files').objectStore('files').get(path);r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);});}
const dataUrl=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('本地图片读取失败。'));r.readAsDataURL(blob);});
const fromSource=async s=>s.type==='base64'?new Blob([Uint8Array.from(atob(s.data),c=>c.charCodeAt(0))],{type:s.mediaType}):await(await fetch(s.url,{credentials:'omit'})).blob();
const png=c=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('导出失败。')),'image/png'));
function fit(c,img,x,y,w,h){const r=Math.min(w/img.width,h/img.height);c.drawImage(img,x+(w-img.width*r)/2,y+(h-img.height*r)/2,img.width*r,img.height*r);}
async function sheet(o){
 const stickers=!document.getElementById('sticker-workspace').hidden,mode=document.getElementById('generation-workspace').dataset.creationMode;
 const count=stickers?Number(document.querySelector('[data-count][aria-pressed="true"]').dataset.count):mode==='refine'?1:4,n=Math.sqrt(count),side=1024/n;
 const canvas=Object.assign(document.createElement('canvas'),{width:1024,height:1024}),c=canvas.getContext('2d'),refs=[];
 for(const b of o.content||[])if(b.type==='image'){try{refs.push(await createImageBitmap(await fromSource(b.source)));}catch{}}
 let avatar;try{if(document.getElementById('loading').hidden)avatar=await createImageBitmap(document.getElementById('avatar'));}catch{}
 if(!avatar&&refs.length)avatar=refs[0];if(!avatar)throw Error('请等待奶蛙素材加载，或添加一张参考图。');
 const colors=['#e9efda','#f4e0d1','#e5e7f4','#f3ebcb','#deece7','#f3dfeb','#e2edf5','#ede8d6','#efe1d6'],phrases=['今天也在努力','收到','好耶','先躺为敬','我很好','谢谢','不可以','充电中','下班啦'];
 for(let i=0;i<count;i++){const x=i%n*side,y=Math.floor(i/n)*side;c.save();c.beginPath();c.rect(x,y,side,side);c.clip();if(!(stickers&&document.getElementById('m-alpha').checked)){c.fillStyle=colors[i];c.fillRect(x,y,side,side);}c.save();c.translate(x+side/2,y+side/2);c.rotate((i%3-1)*.055);fit(c,avatar,-side*.39,-side*.38,side*.78,side*.72);c.restore();
 if(mode==='pairs'&&refs.length){const r=refs[i%Math.min(refs.length,2)];c.fillStyle='#fffaf0';c.beginPath();c.roundRect(x+side*.68,y+side*.69,side*.26,side*.26,side*.03);c.fill();fit(c,r,x+side*.70,y+side*.70,side*.22,side*.22);}else if(mode==='wear'&&refs[1])fit(c,refs[1],x+side*.38,y+side*.58,side*.24,side*.24);else if(mode==='reimagine'&&refs[0]){c.save();c.beginPath();c.arc(x+side*.83,y+side*.16,side*.10,0,Math.PI*2);c.clip();fit(c,refs[0],x+side*.73,y+side*.06,side*.20,side*.20);c.restore();}
 c.fillStyle='#344f42';c.textAlign='center';c.font=`600 ${Math.round(side*.05)}px sans-serif`;c.fillText(stickers||mode==='emotions'?phrases[i]:'MILK FROG · '+String(i+1).padStart(2,'0'),x+side/2,y+side*.93);c.restore();}
 refs.forEach(img=>img.close());if(!refs.includes(avatar))avatar.close();return{blob:await png(canvas),type:'image'};
}
async function remove(o){const img=await createImageBitmap(await fromSource(o.content.find(b=>b.type==='image').source)),canvas=Object.assign(document.createElement('canvas'),{width:img.width,height:img.height}),c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0);img.close();const image=c.getImageData(0,0,canvas.width,canvas.height),p=image.data,corner=[p[0],p[1],p[2]];for(let i=0;i<p.length;i+=4){const d=Math.abs(p[i]-corner[0])+Math.abs(p[i+1]-corner[1])+Math.abs(p[i+2]-corner[2]);if(d<100)p[i+3]=Math.round(p[i+3]*Math.max(0,(d-40)/60));}c.putImageData(image,0,0);return{blob:await png(canvas),type:'image'};}
async function video(o){
 if(!window.MediaRecorder)throw Error('此浏览器不支持本地视频。');const img=await createImageBitmap(await fromSource(o.content.find(b=>b.type==='image').source)),canvas=Object.assign(document.createElement('canvas'),{width:768,height:768}),c=canvas.getContext('2d'),stream=canvas.captureStream(24),chunks=[];
 const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!mime)throw Error('此浏览器不支持本地视频格式。');const rec=new MediaRecorder(stream,{mimeType:mime}),done=new Promise(resolve=>{rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};rec.onstop=()=>resolve(new Blob(chunks,{type:'video/webm'}));});rec.start();const start=performance.now();await new Promise(resolve=>{function frame(){const t=(performance.now()-start)/1000;c.fillStyle='#fff';c.fillRect(0,0,768,768);c.save();c.translate(384,384+Math.sin(t*2*Math.PI)*12);c.rotate(Math.sin(t*2*Math.PI)*.08);fit(c,img,-340,-340,680,680);c.restore();if(t<5)requestAnimationFrame(frame);else resolve();}frame();});rec.stop();const blob=await done;stream.getTracks().forEach(t=>t.stop());img.close();return{blob,type:'video'};
}
const client={app:{onContextChanged(){}},context:async()=>context,spaces:{list:async()=>[{...visitor,slug:'home'}]},space:()=>({files:{upload:async(input,dir)=>{const uploaded=[];for(const f of input){const path=dir+'/'+f.name;await store(path,f);uploaded.push({path});}return{uploaded,errors:[]};},resolveUrl:async path=>{const blob=await read(path);if(!blob)throw Error('本地文件未找到，请重新合成。');return dataUrl(blob);}}}),generations:{create:async o=>{const taskRunId=crypto.randomUUID();tasks.set(taskRunId,o.model==='birefnet-general'?remove(o):/minimax/.test(o.model)?video(o):sheet(o));return{taskRunId};},wait:async id=>{if(!tasks.has(id))throw Error('本地任务已结束，请重新合成。');const {blob,type}=await tasks.get(id),data=await dataUrl(blob);return{model:'local-canvas',output:[{type,source:{type:'base64',mediaType:blob.type,data:data.split(',')[1]}}]};}}};
export async function getGenerationClient(){return client;}
export async function authorizeGeneration(){return visitor;}
export async function assertGenerationAccount(){}
export function ownedSpace(){return visitor;}
export function ownHome(){return visitor;}
export function assertUploaded(r){if(r?.errors?.length)throw Error('本地保存失败。');return r.uploaded;}
