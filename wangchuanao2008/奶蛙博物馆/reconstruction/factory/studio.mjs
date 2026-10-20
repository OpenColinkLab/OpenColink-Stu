import {adjustments,eyeColors,stickerNames,stickerLabel,headColors,clone} from './state.mjs';
import {createTattooUpload,prepareCustomTattoos,customTattooKind} from './tattoo.mjs';
import {hitSticker} from './personalize.mjs';
import {stickerMatrix,stickerPoint,transformControls} from './sticker-transform.mjs';
import {createDetailsStudio} from './details-studio.mjs';
import {drawAvatar} from './art.mjs';
const $=id=>document.getElementById(id);
const icon=name=>`<i data-lucide="${name}"></i>`;
export function createStudio({getState,commit,preview,getAssets,isReady,notify,onModeChange}){
  let mode='look',selected=null,drag=null,draft=null,raf=0;
  const stage=$('stage');
  const gradientEditor=document.createElement('div');gradientEditor.className='gradient-editor';
  gradientEditor.innerHTML=`<label class="gradient-toggle"><input id="gradient-enabled" type="checkbox">自定义渐变</label><div id="gradient-controls" hidden><div class="gradient-colors"><label>起点<input id="gradient-start" type="color" aria-label="渐变起点色"></label><label>终点<input id="gradient-end" type="color" aria-label="渐变终点色"></label></div>${[['angle','方向',0,360],['midpoint','过渡位置',10,90],['softness','柔和度',5,100]].map(([id,name,min,max])=>`<label class="gradient-range">${name}<output id="gradient-value-${id}"></output><input id="gradient-${id}" type="range" min="${min}" max="${max}" step="1" aria-label="渐变${name}"></label>`).join('')}</div>`;
  document.querySelector('.head-palette').append(gradientEditor);
  const defaultGradient=s=>({start:headColors[s.headColor].hex,end:headColors[s.headColor].bottom||'#97d2eb',angle:0,midpoint:50,softness:85});
  $('gradient-enabled').addEventListener('change',e=>{if(isReady()){const s=getState();s.gradient=e.target.checked?defaultGradient(s):null;finish(s);}});
  for(const key of ['start','end','angle','midpoint','softness']){
    $('gradient-'+key).addEventListener('input',e=>{
      if(!isReady())return;const s=clone(draft||getState());if(!s.gradient)return;
      s.gradient[key]=['start','end'].includes(key)?e.target.value:Number(e.target.value);paint(s);
    });
    $('gradient-'+key).addEventListener('change',()=>{if(draft)finish(draft);});
  }
  const overlay=document.createElement('div');overlay.className='sticker-outline';overlay.hidden=true;stage.append(overlay);
  const handles={};
  for(const [action,name,glyph]of [['resize','缩放贴纸','maximize-2'],['rotate','旋转贴纸','rotate-cw']]){
    const button=document.createElement('button');button.className='sticker-handle';button.dataset.handle=action;button.setAttribute('aria-label',name);button.dataset.tip=name;button.innerHTML=icon(glyph);button.hidden=true;stage.append(button);handles[action]=button;
  }
  stage.classList.add('sticker-mode');stage.tabIndex=0;stage.setAttribute('aria-label','奶蛙画布');
  $('tune-panel').innerHTML=`<div class="tune-heading"><h1>捏出你的样子</h1></div><div class="eye-palette"><div class="control-label"><span>眼睛颜色</span><button id="reset-eye" class="icon-button" aria-label="还原眼睛颜色" data-tip="还原眼睛颜色">${icon('rotate-ccw')}</button></div><div class="eye-swatches">${eyeColors.map((c,i)=>`<button class="swatch" data-eye="${c}" style="--color:${c}" aria-label="眼睛颜色 ${i+1}" aria-pressed="false"></button>`).join('')}<label class="custom-color" title="自定义眼睛颜色"><input type="color" id="eye-custom" value="#a6b78b" aria-label="自定义眼睛颜色">${icon('pipette')}</label></div></div><div class="adjustments">${adjustments.map(a=>`<div class="adjustment"><div class="control-label"><label for="tune-${a.id}">${a.name}</label><output for="tune-${a.id}" id="value-${a.id}">0</output><button class="icon-button" data-reset="${a.id}" aria-label="还原${a.name}" data-tip="还原${a.name}">${icon('rotate-ccw')}</button></div><div class="range-track"><input type="range" min="-100" max="100" step="1" value="0" id="tune-${a.id}" data-tune="${a.id}"></div></div>`).join('')}</div>`;
  $('stickers-panel').innerHTML=`<div class="tune-heading"><h1>贴一点喜欢的</h1><span id="sticker-count" class="count">0 / 24</span></div><div class="sticker-grid" id="sticker-catalog">${stickerNames.map((name,i)=>`<button class="sticker-tile" data-sticker="${i}" aria-label="添加${name}"><canvas width="160" height="160"></canvas><span>${name}</span></button>`).join('')}</div><div id="sticker-edit" hidden><div class="control-label"><strong id="sticker-name"></strong><div class="sticker-actions"><button class="icon-button" id="sticker-back" aria-label="贴纸下移一层" data-tip="下移一层">${icon('send-to-back')}</button><button class="icon-button" id="sticker-front" aria-label="贴纸上移一层" data-tip="上移一层">${icon('bring-to-front')}</button><button class="icon-button" id="sticker-delete" aria-label="删除贴纸" data-tip="删除贴纸">${icon('trash-2')}</button></div></div><label class="sticker-range">大小<input id="sticker-size" type="range" min="24" max="220" step="1" aria-label="贴纸大小"></label><label class="sticker-range">旋转<input id="sticker-rotation" type="range" min="-180" max="180" step="1" aria-label="贴纸旋转"></label></div><div id="placed-stickers" class="placed-stickers" aria-label="已放置的贴纸"></div>`;
  document.querySelector('.editor-scroll').prepend($('sticker-edit'));
  $('sticker-edit').classList.add('global-sticker-editor');
  const deformation=document.createElement('div');deformation.className='sticker-deformation';
  deformation.innerHTML=transformControls.map(c=>`<label class="sticker-range">${c.name}<input id="sticker-${c.id}" type="range" min="${c.min}" max="${c.max}" value="${c.default}" step="1" aria-label="贴纸${c.name}"></label>`).join('');
  $('sticker-edit').append(deformation);
  const opacity=document.createElement('label');opacity.className='sticker-range';opacity.innerHTML='浓淡<input id="sticker-opacity" type="range" min="5" max="100" step="1" aria-label="贴纸浓淡">';$('sticker-edit').append(opacity);
  createTattooUpload({isReady,notify,async add(image){if(!isReady())throw Error('请等待素材加载完成。');const s=getState();if(s.stickers.length>=24||s.stickers.filter(v=>v.kind===customTattooKind).length>=4)throw Error('最多放置 24 张贴纸，其中自传纹身最多 4 张。');const id=Math.max(-1,...s.stickers.map(v=>v.id))+1;s.stickers.push({id,kind:customTattooKind,image,x:256,y:350,size:130,rotation:0,opacity:86});await prepareCustomTattoos(s,getAssets());selected=id;finish(s);}});
  const resetTransform=document.createElement('button');resetTransform.className='icon-button';resetTransform.id='sticker-reset-transform';resetTransform.setAttribute('aria-label','还原贴纸变形');resetTransform.dataset.tip='还原变形';resetTransform.innerHTML=icon('rotate-ccw');$('sticker-edit').querySelector('.sticker-actions').prepend(resetTransform);
  resetTransform.addEventListener('click',()=>{const s=getState(),v=s.stickers.find(v=>v.id===selected);if(!v)return;v.size=104;v.rotation=0;for(const c of transformControls)v[c.id]=c.default;finish(s);});
  function show(s=getState()){
    $('gradient-enabled').checked=!!s.gradient;$('gradient-enabled').disabled=!isReady();$('gradient-controls').hidden=!s.gradient;
    const gradient=s.gradient||defaultGradient(s);
    for(const key of ['start','end','angle','midpoint','softness']){
      $('gradient-'+key).value=gradient[key];$('gradient-'+key).disabled=!isReady()||!s.gradient;
      if($('gradient-value-'+key))$('gradient-value-'+key).value=gradient[key]+(key==='angle'?'°':'%');
    }
    const v=s.stickers.find(v=>v.id===selected);overlay.hidden=!v;
    for(const h of Object.values(handles))h.hidden=!v;
    if(v){
      Object.assign(overlay.style,{left:`${v.x/512*100}%`,top:`${v.y/512*100}%`,width:`${v.size/512*100}%`,height:`${v.size/512*100}%`,transform:`translate(-50%,-50%) matrix(${stickerMatrix(v).join(',')},0,0)`});
      const unit=512/Math.max(1,stage.getBoundingClientRect().width);
      for(const [key,p,padding,minimum]of [['resize',stickerPoint(v,v.size/2,v.size/2),12,42],['rotate',stickerPoint(v,0,-v.size/2),28,52]]){
        const dx=p.x-v.x,dy=p.y-v.y,length=Math.max(1,Math.hypot(dx,dy)),distance=Math.max(length+padding*unit,minimum*unit);
        Object.assign(handles[key].style,{left:`${(v.x+dx/length*distance)/512*100}%`,top:`${(v.y+dy/length*distance)/512*100}%`});
      }
    }
  }
  function paint(s){draft=s;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{preview(s);show(s);});}
  new ResizeObserver(()=>show(draft||getState())).observe(stage);
  function finish(s){cancelAnimationFrame(raf);draft=null;commit(s);preview(getState());show();}
  function cancel(){const pointer=drag?.pointer;drag=null;if(pointer!==undefined&&stage.hasPointerCapture(pointer))stage.releasePointerCapture(pointer);cancelAnimationFrame(raf);draft=null;preview(getState());show();}
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{
    mode=b.dataset.mode;cancel();
    document.querySelectorAll('[data-mode]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));
    for(const key of ['look','palette','tune','stickers'])$(key+'-panel').hidden=key!==mode;
    document.querySelector('.editor-scroll').scrollTop=0;
    onModeChange();render();
  }));
  $('tune-panel').addEventListener('input',e=>{
    if(!isReady())return;
    const s=getState(),key=e.target.dataset.tune;
    if(key){s[key]=Number(e.target.value);$('value-'+key).value=s[key]>0?'+'+s[key]:s[key];}
    else if(e.target.id==='eye-custom')s.eyeColor=e.target.value;
    else return;paint(s);
  });
  $('tune-panel').addEventListener('change',()=>{if(draft)finish(draft);});
  $('tune-panel').addEventListener('click',e=>{
    if(!isReady())return;const reset=e.target.closest('[data-reset]'),color=e.target.closest('[data-eye]');
    if(reset)finish({...getState(),[reset.dataset.reset]:0});
    if(color)finish({...getState(),eyeColor:color.dataset.eye});
  });
  $('reset-eye').addEventListener('click',()=>{if(isReady())finish({...getState(),eyeColor:null});});
  $('sticker-catalog').addEventListener('click',e=>{
    const b=e.target.closest('[data-sticker]');if(!b||!isReady())return;const s=getState();
    if(s.stickers.length>=24){notify('最多放置 24 张贴纸，请先移除一张。');return;}
    const id=Math.max(-1,...s.stickers.map(v=>v.id))+1;selected=id;
    const kind=Number(b.dataset.sticker),tattoo=kind>=12;
    s.stickers.push({id,kind,x:tattoo?256+(s.stickers.length%3-1)*35:360-(s.stickers.length%4)*25,y:tattoo?330+(s.stickers.length%3)*30:145+(s.stickers.length%4)*30,size:tattoo?90:104,rotation:0});finish(s);
  });
  function edit(key,value){const s=getState(),v=s.stickers.find(v=>v.id===selected);if(!v)return;v[key]=value;paint(s);}
  for(const key of ['size','rotation','opacity',...transformControls.map(c=>c.id)]){
    $('sticker-'+key).addEventListener('input',e=>edit(key,Number(e.target.value)));
    $('sticker-'+key).addEventListener('change',()=>{if(draft)finish(draft);});
  }
  function removeSticker(){if(selected===null||!isReady())return;cancel();const s=getState();s.stickers=s.stickers.filter(v=>v.id!==selected);selected=null;finish(s);}
  $('sticker-delete').addEventListener('click',removeSticker);
  for(const [key,delta] of [['back',-1],['front',1]])$('sticker-'+key).addEventListener('click',()=>{
    const s=getState(),i=s.stickers.findIndex(v=>v.id===selected),j=i+delta;
    if(i<0||j<0||j>=s.stickers.length)return;[s.stickers[i],s.stickers[j]]=[s.stickers[j],s.stickers[i]];finish(s);
  });
  $('placed-stickers').addEventListener('click',e=>{const b=e.target.closest('[data-placed]');if(b){selected=Number(b.dataset.placed);render();}});
  const point=e=>{const r=stage.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*512,y:(e.clientY-r.top)/r.height*512};};
  stage.addEventListener('pointerdown',e=>{
    if(!isReady()||e.button!==0||drag)return;
    const action=e.target.closest('[data-handle]')?.dataset.handle||'move';
    const p=point(e),s=getState(),v=action==='move'?hitSticker(s,p.x,p.y):s.stickers.find(v=>v.id===selected);selected=v?.id??null;render();if(!v)return;
    e.preventDefault();stage.focus({preventScroll:true});stage.setPointerCapture(e.pointerId);drag={pointer:e.pointerId,start:p,state:clone(s),sticker:{...v},action};
  });
  function moveSticker(e){
    if(!drag||drag.pointer!==e.pointerId)return;const p=point(e),s=clone(drag.state),v=s.stickers.find(v=>v.id===drag.sticker.id),old=drag.sticker;
    if(drag.action==='resize'){
      const ratio=Math.hypot(p.x-old.x,p.y-old.y)/Math.max(1,Math.hypot(drag.start.x-old.x,drag.start.y-old.y));v.size=Math.round(Math.max(24,Math.min(220,old.size*ratio)));
    }else if(drag.action==='rotate'){
      const delta=(Math.atan2(p.y-old.y,p.x-old.x)-Math.atan2(drag.start.y-old.y,drag.start.x-old.x))*180/Math.PI;v.rotation=Math.round(((old.rotation+delta+540)%360)-180);
    }else{
      v.x=Math.round(Math.max(0,Math.min(512,old.x+p.x-drag.start.x)));v.y=Math.round(Math.max(0,Math.min(512,old.y+p.y-drag.start.y)));
    }paint(s);
  }
  function finishDrag(e){
    if(!drag||drag.pointer!==e.pointerId)return;
    const s=draft;drag=null;if(s)finish(s);
  }
  stage.addEventListener('pointermove',moveSticker);
  stage.addEventListener('pointerup',e=>{
    if(!drag||drag.pointer!==e.pointerId)return;
    moveSticker(e);finishDrag(e);
    if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);
  });
  stage.addEventListener('pointercancel',e=>{if(drag?.pointer===e.pointerId){drag=null;cancel();}});
  // Losing capture is not an explicit cancellation: preserve the last valid position.
  stage.addEventListener('lostpointercapture',finishDrag);
  document.addEventListener('keydown',e=>{
    if(e.defaultPrevented||e.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),dialog'))return;
    if((e.key==='Backspace'||e.key==='Delete')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&selected!==null){e.preventDefault();removeSticker();}
    if(e.key==='Escape'){cancel();selected=null;render();}
  });
  const detailsStudio=createDetailsStudio({getState,finish,paint,isReady});
  let catalogDrawn=false;
  function render(){
    const s=getState(),ready=isReady();
    for(const a of adjustments){$('tune-'+a.id).value=s[a.id];$('value-'+a.id).value=s[a.id]>0?'+'+s[a.id]:s[a.id];}
    $('eye-custom').value=s.eyeColor||eyeColors[0];
    document.querySelectorAll('[data-eye]').forEach(b=>b.setAttribute('aria-pressed',String(s.eyeColor===b.dataset.eye)));
    for(const panel of ['tune-panel','stickers-panel','sticker-edit'])$(panel).querySelectorAll('button,input').forEach(b=>b.disabled=!ready);
    const v=s.stickers.find(v=>v.id===selected);$('sticker-edit').hidden=!v;
    if(v){$('sticker-name').textContent=stickerLabel(v);$('sticker-size').value=v.size;$('sticker-rotation').value=v.rotation;$('sticker-opacity').value=v.opacity??(v.kind>=12?86:100);const i=s.stickers.indexOf(v);$('sticker-back').disabled=i===0;$('sticker-front').disabled=i===s.stickers.length-1;}
    if(v)for(const c of transformControls)$('sticker-'+c.id).value=v[c.id]??c.default;
    $('sticker-count').textContent=s.stickers.length+' / 24';
    $('placed-stickers').innerHTML=s.stickers.map((v,i)=>`<button data-placed="${v.id}" aria-label="选中${stickerLabel(v)} ${i+1}" aria-pressed="${v.id===selected}">${stickerLabel(v)} <span>${i+1}</span></button>`).join('');
    const a=getAssets();if(a&&!catalogDrawn){$('sticker-catalog').querySelectorAll('canvas').forEach((c,i)=>c.getContext('2d').drawImage(a.stickers[i],0,0,160,160));catalogDrawn=true;}
    detailsStudio.render(s);if(a&&!$('look-panel').hidden)detailsStudio.drawThemes(drawAvatar,a);
    show(s);window.lucide?.createIcons();
  }
  return {render,cancel};
}
