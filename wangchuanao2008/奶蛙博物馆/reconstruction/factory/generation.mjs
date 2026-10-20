import {generationStyles, generationPrompt, quadrantRects, normalizeCreativeDirection, emotionSets, emotionPrompt, pairScenes, pairPrompt, wearableKinds, wearablePrompt} from './generation-prompt.mjs';
import {authorizeGeneration, assertGenerationAccount, assertUploaded, getGenerationClient} from './generation-account.mjs';
import {downloadAvatar} from './download.mjs';
import {messageText} from './messages.mjs';
import {refinementPrompt, outputRects} from './refinement.mjs';
import {generationHairstyles,normalizeHairRequest} from './hair.mjs';

const ORIGINAL = 'https://public.cohub.live/p/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog-assets/library-v1/1d127ee562dbc3e69679-face-00.webp';
const $ = id => document.getElementById(id);
let client, home, busy = false, adding = false, references = [], job = null, outputs = [];
let mode = 'reimagine', accountRevision=0;
const referenceBanks = {reimagine:references,emotions:[],pairs:[null,null],wear:[null,null],refine:[]};
const roleMode=()=>mode==='pairs'||mode==='wear';
const referenceCount=()=>references.filter(Boolean).length;
const key = 'milkfrog.generation.pending.v1';
const status = message => { $('generation-status').textContent = messageText(message); };
const icons = () => window.lucide?.createIcons();

function remember() { sessionStorage.setItem(key, JSON.stringify(job)); }
function restore() {
  const raw = sessionStorage.getItem(key);
  if (!raw) return;
  const value = JSON.parse(raw);
  if (!value || typeof value.dir !== 'string' || !/^milkfrog\/generations\/[a-f0-9-]+$/.test(value.dir) || !value.home?.userUuid || !value.home?.id || !['submitting','pending','saved','failed'].includes(value.phase)) throw Error('保存的任务记录已损坏，未覆盖原记录。');
  if (!generationStyles.some(style=>style.id === value.style)) throw Error('保存的风格记录无效，未覆盖原记录。');
  job = value;
  if(value.mode!==undefined&&!Object.hasOwn(referenceBanks,value.mode))throw Error('保存的玩法记录无效。');
  if(value.mode==='emotions'&&!emotionSets.some(set=>set.id===value.emotion))throw Error('保存的表情记录无效。');
  if(value.mode==='pairs'&&!pairScenes.some(set=>set.id===value.pairScene))throw Error('保存的搭档记录无效。');
  if(value.mode==='wear'&&!wearableKinds.some(set=>set.id===value.wearable))throw Error('保存的装扮记录无效。');
  setMode(value.mode||'reimagine');
  $('generation-emotion').value = value.emotion || 'everyday';
  $('generation-pair').value=value.pairScene||'tea';$('generation-wear').value=value.wearable||'pin';
  $('generation-style').value = job.style;
  $('generation-prompt').value = normalizeCreativeDirection(job.creativeDirection === undefined ? '' : job.creativeDirection);
  const hair=normalizeHairRequest(job.hairRequest);$('generation-hair-style').value=hair.style;$('generation-hair-text').value=hair.text;
  $('generation-resume').hidden = !job.taskRunId;
  status(job.taskRunId ? '找到上次的任务，查看结果不会重复合成。' : '上次提交尚未返回任务编号，请先在 Cohub 核实任务，避免重复合成。');
}
function controls() {
  const locked = busy || adding || Boolean(job && !['saved','failed'].includes(job.phase));
  $('generation-submit').disabled = locked || referenceCount() === 0 || (roleMode()&&referenceCount()!==2);
  $('generation-resume').disabled = busy;
  $('generation-input').disabled = busy || adding;
  $('generation-style').disabled = busy;
  $('generation-prompt').disabled = busy;
  $('generation-hair-style').disabled=locked;$('generation-hair-text').disabled=locked;
  $('generation-emotion').disabled = busy;
  $('generation-pair').disabled=busy;$('generation-wear').disabled=busy;
  $('generation-wear-editor').disabled=locked||!$('loading').hidden;
  document.querySelectorAll('#generation-references input').forEach(input=>input.disabled=locked);
  document.querySelector('label[for="generation-prompt"] span').textContent=(mode==='emotions'&&$('generation-emotion').value==='custom')||(mode==='pairs'&&$('generation-pair').value==='custom')?'必填':'选填';
  $('editor-emotions').disabled = locked || !$('loading').hidden;
  document.querySelectorAll('[data-generation-mode], #generation-results button').forEach(button=>button.disabled=locked);
  document.querySelectorAll('#generation-references button').forEach(button => { button.disabled = busy || adding; });
  $('generation-submit').hidden=mode==='refine';
  $('generation-submit').querySelector('span').textContent = busy ? '正在制作…' : mode==='pairs'?'本地合成两组搭档':'本地合成四张';
  document.querySelectorAll('[data-style]').forEach(button=>button.disabled=busy);
}
function setMode(next) {
  mode=next;references=referenceBanks[mode];
  document.querySelectorAll('[data-generation-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.generationMode===mode)));
  const emotions=mode==='emotions';
  $('generation-workspace').dataset.creationMode=mode;
  $('generation-source-title').textContent=mode==='refine'?'精修这只奶蛙':emotions?'你的奶蛙':mode==='pairs'?'你和朋友':mode==='wear'?'戴点自己的':'你的参考图';
  $('generation-style').hidden=emotions||mode==='wear'||mode==='refine';
  document.querySelector('label[for="generation-style"]').hidden=emotions||mode==='wear'||mode==='refine';
  $('generation-style-grid').hidden=emotions||mode==='wear'||mode==='refine';
  $('generation-hair-settings').hidden=mode!=='reimagine';
  document.querySelector('.generation-upload').hidden=roleMode()||mode==='refine';
  $('generation-emotions').hidden=!emotions;
  $('generation-pair-settings').hidden=mode!=='pairs';$('generation-wear-settings').hidden=mode!=='wear';
  $('generation-input').multiple=!emotions;
  displayReferences();
}
function showWorkspace(generate) {
  const stickers=document.getElementById('sticker-workspace');if(stickers)stickers.hidden=true;
  $('manual-workspace').hidden=generate;$('generation-workspace').hidden=!generate;
  document.querySelector('.header-actions').hidden=generate;
  document.querySelectorAll('[data-workspace]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.workspace===(generate?'generate':'edit'))));
}
async function useCharacter(getFile,target='emotions') {
  if(busy||adding||(job&&!['saved','failed'].includes(job.phase)))return;
  adding=true;controls();
  const revision=accountRevision;
  try {
    const file=await getFile();
    if(revision!==accountRevision)throw Error('本地身份已切换，请重新选择图片。');
    if(target==='wear'){
      if(referenceBanks.wear[0])URL.revokeObjectURL(referenceBanks.wear[0].url);
      referenceBanks.wear[0]={file,url:URL.createObjectURL(file)};
    }else{
      referenceBanks.emotions.forEach(reference=>URL.revokeObjectURL(reference.url));
      referenceBanks.emotions=[{file,url:URL.createObjectURL(file)}];
    }
    setMode(target);$('generation-prompt').value='';showWorkspace(true);status('');
    $('generation-source-title').scrollIntoView({block:'start'});
  } catch(error){status(error.message);showWorkspace(true);}
  finally{adding=false;controls();}
}
function displayReferences() {
  $('generation-references').replaceChildren();
  if(roleMode()){
    const labels=mode==='pairs'?['你','朋友']:['奶蛙','你的物品'];
    for(let index=0;index<2;index++){
      const reference=references[index],item=document.createElement('div');item.className='generation-reference generation-role';
      const preview=document.createElement('div');preview.className='generation-role-preview';
      if(reference){const image=new Image();image.src=reference.url;image.alt=labels[index];preview.append(image);}else preview.innerHTML='<i data-lucide="image-plus"></i>';
      const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.ariaLabel=`上传${labels[index]}`;
      input.onchange=async()=>{
        const file=input.files[0];input.value='';if(!file||busy||adding)return;
        const revision=accountRevision;
        adding=true;controls();
        try{const normalized=await imageFile(file,index);if(revision!==accountRevision)throw Error('本地身份已切换，请重新选择图片。');if(references[index])URL.revokeObjectURL(references[index].url);references[index]={file:normalized,url:URL.createObjectURL(normalized)};status('');}
        catch(error){status(error.message);}finally{adding=false;displayReferences();}
      };
      preview.append(input);
      const label=document.createElement('span');label.textContent=labels[index];item.append(preview,label);
      if(reference){const remove=document.createElement('button');remove.className='icon-button';remove.type='button';remove.title=remove.ariaLabel=`移除${labels[index]}`;remove.innerHTML='<i data-lucide="x"></i>';remove.onclick=()=>{URL.revokeObjectURL(reference.url);references[index]=null;displayReferences();};item.append(remove);}
      $('generation-references').append(item);
    }
  }else{
  references.forEach((reference, index) => {
    const item = document.createElement('div'); item.className = 'generation-reference';
    const image = new Image(); image.src = reference.url; image.alt = `参考图 ${index + 1}`;
    const label = document.createElement('span'); label.textContent = index === 0 ? '01 · 主参考图' : String(index + 1).padStart(2,'0');
    const remove = document.createElement('button'); remove.className = 'icon-button'; remove.type = 'button'; remove.title = remove.ariaLabel = `移除参考图 ${index + 1}`; remove.innerHTML = '<i data-lucide="x"></i>';
    remove.onclick = () => { URL.revokeObjectURL(reference.url); references.splice(index,1); displayReferences(); };
    item.append(image,label,remove); $('generation-references').append(item);
  });
  }
  $('generation-count').textContent = `${referenceCount()} / ${roleMode()?2:['emotions','refine'].includes(mode)?1:8}`;
  controls(); icons();
}
const png = canvas => new Promise((resolve,reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(Error('PNG 导出失败，请重试。')), 'image/png'));
async function imageFile(file, index) {
  if (!['image/png','image/jpeg','image/webp'].includes(file.type) || !file.size || file.size > 20 * 1024 * 1024) throw Error('请选择 PNG、JPEG 或 WebP 图片，单张不超过 20 MB。');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 50000000) throw Error('图片像素过大，请缩小后再上传。');
    const scale = Math.min(1,1536 / Math.max(bitmap.width,bitmap.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1,Math.round(bitmap.width*scale)); canvas.height = Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
    return new File([await png(canvas)], `reference-${index+1}.png`, {type:'image/png'});
  } finally { bitmap.close(); }
}
async function base64(blob) {
  return new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = () => reject(Error('图片读取失败，请重新上传。')); reader.readAsDataURL(blob); });
}
async function connect() {
  if (!client) {
    client = await getGenerationClient();
    client.app?.onContextChanged(context => {
      if (!home || context.viewer?.userUuid === home.userUuid) return;
      accountRevision++;
      if($('refine-dialog').open)$('refine-dialog').close();
      outputs.forEach(url=>URL.revokeObjectURL(url)); outputs = [];
      for(const name of Object.keys(referenceBanks)){referenceBanks[name].filter(Boolean).forEach(reference=>URL.revokeObjectURL(reference.url));referenceBanks[name]=[];}
      references=referenceBanks[mode];
      $('generation-prompt').value = '';
      $('generation-results').replaceChildren(); $('generation-empty').hidden = false;
      $('generation-pair-downloads').replaceChildren();
      displayReferences(); home = null;
      status('本地身份已切换，请重新连接。');
    });
  }
  status('准备本地画布…');
  home = await authorizeGeneration(client);
  $('generation-account').textContent = `本地合成预览 · 保存到 ${home.name} · 无需登录`;
}
async function upload(files, dir) {
  await assertGenerationAccount(client,home);
  return assertUploaded(await client.space(home.id).files.upload(files,dir), files.map(file=>file.name));
}
async function resultBlob(source) {
  if (source?.type === 'base64' && /^image\/(png|jpeg|webp)$/.test(source.mediaType)) {
    return new Blob([Uint8Array.from(atob(source.data), char=>char.charCodeAt(0))],{type:source.mediaType});
  }
  if (source?.type !== 'url' || new URL(source.url).protocol !== 'https:') throw Error('生成结果的图片地址无效，原任务已保留。');
  const response = await fetch(source.url,{credentials:'omit'});
  if (!response.ok) throw Error(`图片下载失败（${response.status}），点“查看结果”重试，不会重复生成。`);
  return response.blob();
}
async function displayOutputs(blobs) {
  const resultHome=home,pairs=[];
  if(job.mode==='pairs')for(let pair=0;pair<2;pair++){
    const left=await createImageBitmap(blobs[pair*2]);let right;
    try{
      right=await createImageBitmap(blobs[pair*2+1]);
      const canvas=document.createElement('canvas');canvas.width=left.width+right.width;canvas.height=Math.max(left.height,right.height);
      const c=canvas.getContext('2d');c.drawImage(left,0,0);c.drawImage(right,left.width,0);
      pairs.push(new File([await png(canvas)],`pair-${pair+1}.png`,{type:'image/png'}));
    }finally{left.close();right?.close();}
  }
  await assertGenerationAccount(client,resultHome);
  if(home?.id!==resultHome.id||home?.userUuid!==resultHome.userUuid)throw Error('本地身份已切换，请重新连接。');
  outputs.forEach(output=>URL.revokeObjectURL(output)); outputs = [];
  $('generation-results').replaceChildren();
  $('generation-pair-downloads').replaceChildren();
  blobs.forEach((blob,index)=>{
    const url = URL.createObjectURL(blob); outputs.push(url);
    const item = document.createElement('figure');
    const image = new Image(); image.src = url; image.alt = `生成的奶蛙 ${index+1}`;
    const caption = document.createElement('figcaption');
    const label = document.createElement('span'); label.textContent = job.mode==='pairs'?`搭档 ${Math.floor(index/2)+1} · ${index%2?'朋友':'你'}`:`奶蛙 ${String(index+1).padStart(2,'0')}`;
    const link = document.createElement('button'); link.type='button';link.className = 'icon-button'; link.title = link.ariaLabel = `下载奶蛙 ${index+1}`; link.innerHTML = '<i data-lucide="download"></i>';
    link.onclick=()=>downloadAvatar(link,async()=>({blob,name:`milkfrog-${index+1}.png`}),status,resultHome.userUuid);
    const expressions=document.createElement('button');expressions.className='icon-button';expressions.type='button';expressions.title=expressions.ariaLabel=`用奶蛙 ${index+1} 做表情`;expressions.innerHTML='<i data-lucide="smile-plus"></i>';
    expressions.onclick=()=>window.dispatchEvent(new CustomEvent('milkfrog:sticker',{detail:{blob,ownerId:resultHome.userUuid}}));
    const wear=document.createElement('button');wear.className='icon-button';wear.type='button';wear.title=wear.ariaLabel=`给奶蛙 ${index+1} 做装扮`;wear.innerHTML='<i data-lucide="gem"></i>';wear.onclick=()=>useCharacter(async()=>new File([blob],`milkfrog-${index+1}.png`,{type:blob.type}),'wear');
    const actions=document.createElement('div');actions.className='generation-result-actions';actions.append(expressions,wear,link);
    const refine=document.createElement('button');refine.className='icon-button';refine.type='button';refine.title=refine.ariaLabel=`精修奶蛙 ${index+1}`;refine.innerHTML='<i data-lucide="scan-face"></i>';refine.onclick=()=>confirmRefinement(blob,index);actions.prepend(refine);
    caption.append(label,actions); item.append(image,caption); $('generation-results').append(item);
  });
  pairs.forEach((file,pair)=>{
      const url=URL.createObjectURL(file);outputs.push(url);
      const link=document.createElement('button');link.type='button';link.className='button subtle';link.innerHTML=`<i data-lucide="download"></i><span>下载搭档 ${pair+1}</span>`;link.onclick=()=>downloadAvatar(link,async()=>({blob:file,name:file.name}),status,resultHome.userUuid);$('generation-pair-downloads').append(link);
  });
  $('generation-empty').hidden = true; icons();controls();
  return pairs;
}
async function finish() {
  await assertGenerationAccount(client,home);
  if (job.home.id !== home.id || job.home.userUuid !== home.userUuid) throw Error('这次生成属于另一个账号，不能在当前账号读取。');
  if (job.phase === 'saved') {
    status('正在读取本机头像…');
    const blobs = [], sizes = [];
    for (let index=1; index<=(job.mode==='refine'?1:4); index++) {
      // Resolve with authorization, then fetch the file URL without forwarding SDK headers.
      const url = await client.space(home.id).files.resolveUrl(`${job.dir}/avatar-${index}.png`);
      if (!url || !/^(https:\/\/|data:image\/)/.test(url)) throw Error('空间图片暂时无法读取，可点“查看结果”重试。');
      const response = await fetch(url,{credentials:'omit'});
      if (!response.ok) throw Error(`空间图片读取失败（${response.status}），可点“查看结果”重试。`);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);
      sizes.push(bitmap.width,bitmap.height); bitmap.close(); blobs.push(blob);
    }
    await assertGenerationAccount(client,home);
    await displayOutputs(blobs);
    const low = Math.min(...sizes), high = Math.max(...sizes);
    $('generation-dimensions').textContent = low === high ? `${blobs.length} 张 PNG · ${low} × ${high}` : `${blobs.length} 张 PNG · ${low}–${high} px`;
    status(`已保存在这台设备上。`);
    return;
  }
  status('正在制作你的奶蛙…');
  let result;
  try {
    result = await client.generations.wait(job.taskRunId,{intervalMs:3000,timeoutMs:15*60*1000,onPoll:detail=>{
      if (detail.run.status === 'failed') { job.phase = 'failed'; remember(); }
    }});
  } catch(error) { throw Error(`${error.message} 点“查看结果”可继续此任务，不会重复生成。`); }
  const images = result.output.filter(block=>block.type==='image');
  if (images.length !== 1) throw Error('返回的图片数量不正确，原任务已保留在 Cohub。');
  const sheet = await resultBlob(images[0].source);
  const bitmap = await createImageBitmap(sheet);
  const crops = [];
  try {
    for (const rect of outputRects(job.mode,bitmap.width,bitmap.height)) {
      const canvas = document.createElement('canvas'); canvas.width = rect.width; canvas.height = rect.height;
      canvas.getContext('2d').drawImage(bitmap,rect.x,rect.y,rect.width,rect.height,0,0,rect.width,rect.height);
      crops.push(await png(canvas));
    }
    const side = Math.floor(bitmap.width/2);
    $('generation-dimensions').textContent = job.mode==='refine'?`1 张 PNG · ${bitmap.width} × ${bitmap.height}`:bitmap.width % 2 ? `4 张 PNG · ${side}–${side+1} px` : `4 张 PNG · ${side} × ${side}`;
  } finally { bitmap.close(); }
  await assertGenerationAccount(client,home);
  const pairs=await displayOutputs(crops);
  status('正在保存到这台设备…');
  const extension = sheet.type.includes('jpeg') ? 'jpg' : sheet.type.includes('webp') ? 'webp' : 'png';
  await upload([new File([sheet],`sheet.${extension}`,{type:sheet.type}), ...crops.map((blob,index)=>new File([blob],`avatar-${index+1}.png`,{type:'image/png'})),...pairs],job.dir);
  const manifest = {version:5,taskRunId:job.taskRunId,model:result.model,mode:job.mode||'reimagine',emotion:job.emotion||null,pairScene:job.pairScene||null,wearable:job.wearable||null,style:job.style,hairRequest:normalizeHairRequest(job.hairRequest),creativeDirection:job.creativeDirection ?? '',referenceCount:job.referenceCount,files:[...crops.map((_,i)=>`avatar-${i+1}.png`),...pairs.map(file=>file.name)]};
  await upload([new File([JSON.stringify(manifest,null,2)],'result.json',{type:'application/json'})],job.dir);
  job.phase = 'saved'; remember();
  status(`已保存在这台设备上。`);
}
async function execute(resume,refineConfirmed=false) {
  if (busy || adding) return;
  if(!resume&&mode==='refine'&&!refineConfirmed)return;
  busy = true; controls();
  try {
    await connect();
    if (resume) { if (!job?.taskRunId) throw Error('没有可恢复的任务编号。'); await finish(); return; }
    if (job && !['saved','failed'].includes(job.phase)) throw Error('请先查看进行中的任务，避免重复生成。');
    const style = $('generation-style').value;
    const creativeDirection = normalizeCreativeDirection($('generation-prompt').value);
    const hairRequest=normalizeHairRequest(mode==='reimagine'?{style:$('generation-hair-style').value,text:$('generation-hair-text').value}:undefined);
    const emotion=$('generation-emotion').value;
    if(mode==='emotions'&&references.length!==1)throw Error('做表情需要一张奶蛙图片。');
    if(roleMode()&&(!references[0]||!references[1]))throw Error('请补齐两张参考图。');
    const pairScene=$('generation-pair').value,wearable=$('generation-wear').value;
    const prompt = mode==='refine'?refinementPrompt(creativeDirection):mode==='emotions'?emotionPrompt(emotion,creativeDirection):mode==='pairs'?pairPrompt(pairScene,style,creativeDirection):mode==='wear'?wearablePrompt(wearable,creativeDirection):generationPrompt(style,references.length,creativeDirection,hairRequest);
    const files = [];
    for (const [index,reference] of references.entries()) files.push(await imageFile(reference.file,index));
    const dir = `milkfrog/generations/${crypto.randomUUID()}`;
    status('正在准备本地参考图…');
    await upload(files,dir+'/references');
    const content = [{type:'text',text:prompt}];
    for (const file of files) content.push({type:'image',source:{type:'base64',mediaType:file.type,data:await base64(file)}});
    if(mode==='reimagine'||mode==='pairs')content.push({type:'image',source:{type:'url',url:ORIGINAL}});
    await assertGenerationAccount(client,home);
    job = {home,dir,style,mode,hairRequest,emotion:mode==='emotions'?emotion:null,pairScene:mode==='pairs'?pairScene:null,wearable:mode==='wear'?wearable:null,creativeDirection,referenceCount:files.length,phase:'submitting'}; remember();
    status('正在提交生成任务…');
    let created;
    try { created = await client.generations.create({spaceId:home.id,model:'gpt-image-2.5',content,parameters:{size:'1024x1024',quality:'high'}}); }
    catch(error) {
      if ([400,401,402,403,404,413,422,429].includes(error.status)) { job.phase = 'failed'; remember(); }
      throw error;
    }
    if (!created?.taskRunId) throw Error('Cohub 尚未返回任务编号，请先核实已有任务，避免重复合成。');
    job.taskRunId = created.taskRunId; job.phase = 'pending'; remember();
    $('generation-resume').hidden = false;
    await finish();
  } catch(error) { if(job&&job.phase!=='saved'){job.phase='failed';remember();} status(error.message); }
  finally { busy = false; controls(); }
}

function syncStyles(){document.querySelectorAll('[data-style]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.style===$('generation-style').value)));}
for(const {id,name}of [{id:'keep',name:'保留参考图发型'},...generationHairstyles,{id:'custom',name:'自己设计'}]){const option=document.createElement('option');option.value=id;option.textContent=name;$('generation-hair-style').append(option);}
for (const style of generationStyles) {
  const option = document.createElement('option'); option.value = style.id; option.textContent = style.name; $('generation-style').append(option);
  const button=document.createElement('button');button.type='button';button.dataset.style=style.id;button.className='style-choice';button.ariaLabel=style.name;
  const image=new Image();image.alt='';image.dataset.styleImage=style.id;const label=document.createElement('span');label.textContent=style.name;button.append(image,label);button.onclick=()=>{$('generation-style').value=style.id;syncStyles();};$('generation-style-grid').append(button);
}
Promise.resolve({
  "original": "https://public.cohub.live/p/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog-assets/quality-v1/a50fd860df7cff1e953f-original.webp",
  "plush": "https://public.cohub.live/p/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog-assets/quality-v1/5621ab88431b721f931f-plush.webp",
  "clay": "https://public.cohub.live/p/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog-assets/quality-v1/71d4e1cadf9283f9bdcf-clay.webp",
  "comic": "https://public.cohub.live/p/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog-assets/quality-v1/29e04e597a1d12d9949f-comic.webp",
  "pixel": "https://public.cohub.live/p/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog-assets/quality-v1/1d7bef663e18bfbc0b8d-pixel.webp",
  "flat": "https://public.cohub.live/p/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog-assets/quality-v1/ab8536f2ab2c208f00ee-flat.webp",
  "apple": "https://public.cohub.live/p/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog-assets/quality-v1/64899b236f741e1108b7-apple.webp",
  "chinese": "https://public.cohub.live/p/5990ff16-a7fb-4bcf-91fe-66eb8206d499/milkfrog-assets/quality-v1/e7286da41c07fc46d55f-chinese.webp"
}).then(styles=>{for(const image of document.querySelectorAll('[data-style-image]')){const url=styles[image.dataset.styleImage];if(!url?.startsWith('https://public.cohub.live/'))throw Error('风格预览地址无效。');image.src=url;}}).catch(error=>status(error.message));
$('generation-style').addEventListener('change',syncStyles);
let refinementSelection=null;
function confirmRefinement(blob,index){
  if(busy||adding||(job&&!['saved','failed'].includes(job.phase)))return;
  refinementSelection={blob,index,style:job.style};
  $('refine-preview').src=URL.createObjectURL(blob);$('refine-prompt').value='';$('refine-dialog').showModal();
}
$('refine-cancel').onclick=()=>$('refine-dialog').close();
$('refine-dialog').addEventListener('close',()=>{URL.revokeObjectURL($('refine-preview').src);$('refine-preview').removeAttribute('src');refinementSelection=null;});
$('refine-confirm').onclick=()=>{
  if(!refinementSelection||busy)return;
  const {blob,index,style}=refinementSelection,direction=$('refine-prompt').value;
  referenceBanks.refine.forEach(reference=>URL.revokeObjectURL(reference.url));
  referenceBanks.refine=[{file:new File([blob],`milkfrog-${index+1}.png`,{type:blob.type}),url:URL.createObjectURL(blob)}];
  $('generation-style').value=style;$('generation-prompt').value=direction;setMode('refine');syncStyles();$('refine-dialog').close();execute(false,true);
};
for(const set of emotionSets){const option=document.createElement('option');option.value=set.id;option.textContent=set.name;$('generation-emotion').append(option);}
for(const [id,items] of [['generation-pair',pairScenes],['generation-wear',wearableKinds]])for(const item of items){const option=document.createElement('option');option.value=item.id;option.textContent=item.name;$(id).append(option);}
$('generation-emotion').onchange=controls;
$('generation-pair').onchange=controls;
$('generation-wear-editor').onclick=()=>useCharacter(async()=>{const {editorReference}=await import('./app.mjs');return editorReference();},'wear');
$('editor-emotions').onclick=async()=>{try{const {editorReference}=await import('./app.mjs');window.dispatchEvent(new CustomEvent('milkfrog:sticker',{detail:{blob:await editorReference()}}));}catch(error){status(error.message);}};
document.querySelectorAll('[data-generation-mode]').forEach(button=>button.onclick=()=>{if(!button.disabled)setMode(button.dataset.generationMode);});
$('generation-input').onchange = async event => {
  const revision=accountRevision;
  const files = [...event.target.files]; event.target.value = '';
  const limit=mode==='emotions'?1:8;
  if (files.length + references.length > limit) { status(mode==='emotions'?'这里只需要一张奶蛙图片，请先移除原图再更换。':'最多可添加八张参考图。'); return; }
  const added = [];
  adding = true; controls();
  try {
    for (const file of files) {
      if (!['image/png','image/jpeg','image/webp'].includes(file.type) || !file.size || file.size>20*1024*1024) throw Error('请选择 PNG、JPEG 或 WebP 图片，单张不超过 20 MB。');
      const bitmap = await createImageBitmap(file); const valid = bitmap.width * bitmap.height <= 50000000; bitmap.close();
      if (!valid) throw Error('图片像素过大，请缩小后再上传。');
      added.push({file,url:URL.createObjectURL(file)});
    }
    if(revision!==accountRevision)throw Error('本地身份已切换，请重新选择图片。');
    references.push(...added); displayReferences(); status('');
  } catch(error) { added.forEach(item=>URL.revokeObjectURL(item.url)); status(error.message); }
  finally { adding = false; controls(); }
};
$('generation-submit').onclick = () => execute(false);
$('generation-resume').onclick = () => execute(true);
document.querySelectorAll('[data-workspace]').forEach(button=>button.onclick=()=>{
  if(button.dataset.workspace!=='stickers')showWorkspace(button.dataset.workspace === 'generate');
});
try { restore(); } catch(error) { busy = true; status(error.message); }
syncStyles();controls();
// Use the hand-made frog without requesting an account or an external upload.
const localReference=document.createElement('button');localReference.type='button';localReference.id='generation-local-reference';localReference.className='button subtle';localReference.innerHTML='<i data-lucide="smile-plus"></i><span>用我捏好的奶蛙</span>';
document.querySelector('.generation-upload').after(localReference);
localReference.onclick=()=>useCharacter(async()=>{const {editorReference}=await import('./app.mjs');return editorReference();},'emotions');
