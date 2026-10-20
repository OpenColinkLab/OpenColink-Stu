import {downloadAvatar,authorizeDownload,getRuntime} from './download.mjs';
let runtime;
export async function downloadSticker(button,makeFile,notify,ownerId){
 if(!matchMedia('(max-width:650px)').matches)return downloadAvatar(button,makeFile,notify,ownerId);
 if(button.disabled)return;button.disabled=true;
 try{
  if(!runtime)runtime=await getRuntime();
  const viewer=await authorizeDownload(runtime,ownerId),result=await makeFile();
  if((await runtime.context()).viewer?.userUuid!==viewer)throw Error('账号已切换，请重新下载。');
  const file=new File([result.blob],result.name,{type:result.blob.type}),href=URL.createObjectURL(file),dialog=document.createElement('dialog');dialog.className='meme-save-dialog';
  dialog.innerHTML='<div class="meme-row"><h2>保存表情</h2><button class="icon-button" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button></div><img alt="待保存表情"><div class="meme-row"><button class="button" data-share>系统分享</button><button class="button subtle" data-download>下载文件</button></div>';
  dialog.querySelector('img').src=href;dialog.querySelector('img').hidden=!file.type.startsWith('image/');
  const share=dialog.querySelector('[data-share]');share.hidden=!navigator.canShare?.({files:[file]});share.onclick=async()=>{try{if((await runtime.context()).viewer?.userUuid!==viewer)throw Error('账号已切换。');await navigator.share({files:[file]});}catch(e){if(e.name!=='AbortError')notify(e.message);}};
  dialog.querySelector('[data-download]').onclick=async()=>{if((await runtime.context()).viewer?.userUuid!==viewer){notify('账号已切换。');dialog.close();return;}const a=document.createElement('a');a.href=href;a.download=file.name;document.body.append(a);a.click();a.remove();};
  dialog.querySelector('.icon-button').onclick=()=>dialog.close();dialog.onclose=()=>{URL.revokeObjectURL(href);dialog.remove();};document.body.append(dialog);window.lucide?.createIcons();dialog.showModal();
 }catch(e){notify(e.message);}finally{button.disabled=false;}
}
