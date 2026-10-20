import {dyeDefaults,dyeModes,dyePresets} from './hair.mjs';
import {hairColors,clone} from './state.mjs';
export function createHairStudio({getState,commit,preview,isReady}){
 const root=document.createElement('section');root.id='hair-studio';root.className='hair-studio';root.hidden=true;
 root.innerHTML=`<div class="control-label"><h2>染发间</h2><button id="hair-dye-reset" class="icon-button" aria-label="还原染发" data-tip="还原染发"><i data-lucide="rotate-ccw"></i></button></div><div class="hair-dye-presets">${dyePresets.map((p,i)=>`<button class="swatch" data-dye-preset="${i}" style="--color:linear-gradient(135deg,${p.base} 25%,${p.accent} 85%)" aria-label="${p.name}" data-tip="${p.name}" aria-pressed="false"></button>`).join('')}</div><label class="detail-menu">染色方式<select id="hair-dye-mode" aria-label="染色方式"><option value="original">原发色</option>${dyeModes.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><div id="hair-dye-controls" hidden><div class="gradient-colors"><label>底色<input type="color" id="hair-dye-base" aria-label="头发底色"></label><label id="hair-accent-label">染色<input type="color" id="hair-dye-accent" aria-label="头发染色"></label></div>${[['position','染色位置',0,100],['softness','过渡柔和度',1,100],['angle','渐变方向',0,360],['width','挑染宽度',5,80]].map(([id,name,min,max])=>`<label class="gradient-range" data-dye-row="${id}">${name}<output id="hair-dye-value-${id}"></output><input type="range" id="hair-dye-${id}" min="${min}" max="${max}" step="1" aria-label="${name}"></label>`).join('')}</div>`;
 document.getElementById('swatches').after(root);
 let draft=null,raf=0;const $=id=>document.getElementById(id);
 const defaults=s=>({...dyeDefaults,base:hairColors[s.hairColor]});
 function cancel(){cancelAnimationFrame(raf);raf=0;draft=null;preview(getState());}
 function finish(s){cancelAnimationFrame(raf);draft=null;commit(s);preview(getState());show();}
 function show(s=getState()){
  const d=s.hairDye||defaults(s),disabled=!isReady()||s.hair<0||s.hair===5;
  root.querySelectorAll('input,select,button').forEach(el=>el.disabled=disabled);
  $('hair-dye-mode').value=s.hairDye?.mode||'original';$('hair-dye-controls').hidden=!s.hairDye;
  $('hair-dye-reset').disabled=disabled||!s.hairDye;
  $('hair-accent-label').hidden=d.mode==='solid';
  for(const key of ['base','accent','position','softness','angle','width']){
   $('hair-dye-'+key).value=d[key];const output=$('hair-dye-value-'+key);if(output)output.value=d[key]+(key==='angle'?'°':'%');
  }
  for(const row of root.querySelectorAll('[data-dye-row]')){const k=row.dataset.dyeRow;row.hidden=d.mode==='solid'||(k==='angle'&&d.mode!=='gradient')||(k==='width'&&d.mode!=='streaks');}
  for(const b of root.querySelectorAll('[data-dye-preset]')){const p=dyePresets[+b.dataset.dyePreset];b.setAttribute('aria-pressed',String(!!s.hairDye&&['mode','base','accent'].every(k=>d[k]===p[k])));}
 }
 $('hair-dye-mode').onchange=e=>{const s=getState();s.hairDye=e.target.value==='original'?null:{...(s.hairDye||defaults(s)),mode:e.target.value};finish(s);};
 $('hair-dye-reset').onclick=()=>finish({...getState(),hairDye:null});
 root.addEventListener('click',e=>{const b=e.target.closest('[data-dye-preset]');if(b&&!b.disabled){const {name,...preset}=dyePresets[+b.dataset.dyePreset];finish({...getState(),hairDye:{...dyeDefaults,...preset}});}});
 for(const key of ['base','accent','position','softness','angle','width']){
  $('hair-dye-'+key).oninput=e=>{if(!isReady())return;const s=clone(draft||getState());if(!s.hairDye)return;s.hairDye[key]=['base','accent'].includes(key)?e.target.value:+e.target.value;draft=s;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{preview(s);show(s);});};
  $('hair-dye-'+key).onchange=()=>{if(draft)finish(draft);};
 }
 return {show(category){root.hidden=category!=='hair';show();},cancel};
}
