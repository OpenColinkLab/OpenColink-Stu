export const customTattooKind=15;
export const validInlineImage=value=>typeof value==='string'&&value.length<=110000&&/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/.test(value);
export const hasCustomTattoos=s=>s.stickers.some(v=>v.kind===customTattooKind);
export function webpDimensions(bytes){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),tag=o=>String.fromCharCode(...bytes.slice(o,o+4));
 if(bytes.length<30||tag(0)!=='RIFF'||tag(8)!=='WEBP')throw Error('纹身图片格式损坏，原记录未覆盖。');
 for(let at=12;at+8<=bytes.length;){const type=tag(at),length=view.getUint32(at+4,true),p=at+8;if(p+length>bytes.length)throw Error('纹身图片不完整。');
  if(type==='VP8X'&&length>=10)return [1+bytes[p+4]+(bytes[p+5]<<8)+(bytes[p+6]<<16),1+bytes[p+7]+(bytes[p+8]<<8)+(bytes[p+9]<<16)];
  if(type==='VP8 '&&length>=10)return [view.getUint16(p+6,true)&16383,view.getUint16(p+8,true)&16383];
  if(type==='VP8L'&&length>=5&&bytes[p]===47){const packed=view.getUint32(p+1,true);return [1+(packed&16383),1+((packed>>>14)&16383)];}at=p+length+(length%2);
 }throw Error('纹身图片缺少尺寸信息。');
}
export async function prepareCustomTattoos(s,assets){
 assets.customTattoos??=new Map();
 for(const v of s.stickers){if(v.kind!==customTattooKind||assets.customTattoos.has(v.image))continue;
  if(!validInlineImage(v.image))throw Error('自传纹身记录无效，原记录未覆盖。');
  const blob=await(await fetch(v.image)).blob(),dimensions=webpDimensions(new Uint8Array(await blob.arrayBuffer()));
  if(dimensions.some(n=>n<1||n>384))throw Error('自传纹身尺寸无效，原记录未覆盖。');
  const bitmap=await createImageBitmap(blob);
  if(bitmap.width>384||bitmap.height>384||bitmap.width<1||bitmap.height<1){bitmap.close();throw Error('自传纹身尺寸无效，原记录未覆盖。');}
  assets.customTattoos.set(v.image,bitmap);
 }
}
export function stencilPixels(data,{mode='ink',color='#242723',cutoff=80}){
 const ink=color.slice(1).match(/../g).map(v=>parseInt(v,16)),threshold=255-cutoff*1.8;
 for(let i=0;i<data.length;i+=4){
  const light=data[i]*.299+data[i+1]*.587+data[i+2]*.114;
  if(mode==='ink'){data[i+3]*=Math.max(0,Math.min(1,(threshold-light)/42));for(let k=0;k<3;k++)data[i+k]=ink[k];}
  else if(cutoff>0)data[i+3]*=Math.max(0,Math.min(1,(255-Math.min(data[i],data[i+1],data[i+2]))/(cutoff*.65)));
 }
 return data;
}
export function createTattooUpload({add,notify,isReady}){
 const section=document.createElement('section');section.className='tattoo-upload';
 section.innerHTML='<button type="button" id="tattoo-upload" class="button"><i data-lucide="image-plus"></i>上传图片做纹身</button><input id="tattoo-file" type="file" accept="image/png,image/jpeg,image/webp" hidden>';
 document.querySelector('#stickers-panel .tune-heading').after(section);
 const dialog=document.createElement('dialog');dialog.id='tattoo-dialog';dialog.innerHTML='<h2>这张图，纹在身上</h2><canvas id="tattoo-preview" width="320" height="320"></canvas><label>效果<select id="tattoo-mode"><option value="ink">单色纹身</option><option value="original">保留原色</option></select></label><label id="tattoo-color-label">墨色<input type="color" id="tattoo-color" value="#242723"></label><label>去底强度<input type="range" id="tattoo-cutoff" min="0" max="100" value="80"></label><p id="tattoo-error" role="status"></p><div class="tattoo-actions"><button type="button" id="tattoo-cancel" class="button">取消</button><button type="button" id="tattoo-confirm" class="button primary">贴上去</button></div>';
 document.body.append(dialog);const q=id=>document.getElementById(id);let source=null,result=null,busy=false;
 function update(){if(!source)return;const c=document.createElement('canvas');c.width=c.height=384;const ctx=c.getContext('2d');const scale=360/Math.max(source.width,source.height),w=source.width*scale,h=source.height*scale;ctx.drawImage(source,(384-w)/2,(384-h)/2,w,h);const pixels=ctx.getImageData(0,0,384,384);stencilPixels(pixels.data,{mode:q('tattoo-mode').value,color:q('tattoo-color').value,cutoff:Number(q('tattoo-cutoff').value)});ctx.putImageData(pixels,0,0);result=c;q('tattoo-color-label').hidden=q('tattoo-mode').value!=='ink';const pc=q('tattoo-preview').getContext('2d');pc.clearRect(0,0,320,320);pc.drawImage(c,0,0,320,320);q('tattoo-error').textContent='';}
 q('tattoo-upload').onclick=()=>{if(isReady()&&!busy)q('tattoo-file').click();};
 q('tattoo-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file||busy)return;busy=true;
  try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||!file.size||file.size>10*1024*1024)throw Error('请选择不超过 10 MB 的 PNG、JPEG 或 WebP 图片。');
   source=await createImageBitmap(file);if(source.width*source.height>32000000)throw Error('图片像素太大，请先缩小到 3200 万像素以内。');q('tattoo-mode').value='ink';q('tattoo-cutoff').value=80;update();dialog.showModal();
  }catch(error){source?.close();source=null;notify(error.message);}finally{busy=false;}
 };
 for(const id of ['tattoo-mode','tattoo-color','tattoo-cutoff'])q(id).oninput=update;
 function release(){source?.close();source=null;result=null;}
 function close(){release();dialog.close();}
 q('tattoo-cancel').onclick=()=>{if(!busy)close();};dialog.oncancel=e=>{if(busy)e.preventDefault();else release();};
 // Native close events are queued; an old close must not clear a newly opened upload.
 dialog.onclose=()=>{if(!dialog.open)release();};
 q('tattoo-confirm').onclick=async()=>{if(busy||!result)return;busy=true;q('tattoo-confirm').disabled=true;
  try{const pixels=result.getContext('2d').getImageData(0,0,384,384).data;let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>12)visible++;if(visible<20)throw Error('图案已被去掉了，请降低去底强度或选择保留原色。');
   const image=result.toDataURL('image/webp',.88);if(!validInlineImage(image))throw Error('图案太复杂，请选择更简洁的图片。');await add(image);close();
  }catch(error){q('tattoo-error').textContent=error.message;}finally{busy=false;q('tattoo-confirm').disabled=false;}
 };
}
