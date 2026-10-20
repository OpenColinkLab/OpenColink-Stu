const appId='8a36fbe6-51f2-4ad9-9f28-46f933f756b1';
let runtimePromise,busy=false;
export async function getRuntime(){
 if(!runtimePromise)runtimePromise=import('https://esm.sh/@neta-art/cohub@8.13.0').then(({createAppRuntime})=>createAppRuntime()).catch(error=>{runtimePromise=null;throw error;});
 return runtimePromise;
}
function viewer(context){
 if(context?.app?.id!==appId)throw Error('请在 Cohub 中打开奶蛙，再下载头像。');
 const id=context.viewer?.userUuid;return typeof id==='string'&&id.trim()?id:null;
}
export async function authorizeDownload(runtime,ownerId){
 const before=viewer(await runtime.context());
 // Ask the host for a fresh base session only: no cached grants, Home access or generation consent.
 const token=await runtime.getAccessToken({forceRefresh:true});
 if(typeof token!=='string'||!token.trim())throw Error('请先登录 Cohub，登录后再点击下载。');
 const id=viewer(await runtime.context());
 if(!id)throw Error('请先登录 Cohub，登录后再点击下载。');
 if((before&&id!==before)||(ownerId&&id!==ownerId))throw Error('Cohub 账号已切换，请重新打开当前账号的头像。');
 return id;
}
export async function downloadAvatar(button,makeFile,notify,ownerId){
 if(busy)return;busy=true;const disabled=button.disabled;button.disabled=true;button.setAttribute('aria-busy','true');
 try{
  const runtime=await getRuntime(),id=await authorizeDownload(runtime,ownerId);
  const {blob,name}=await makeFile();
  if(!(blob instanceof Blob)||!blob.size)throw Error('头像导出失败，请重试。');
  if(viewer(await runtime.context())!==id)throw Error('Cohub 账号已切换，请重新登录后下载。');
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notify('头像已导出。');
 }catch(error){notify(error.message||'暂时无法确认 Cohub 登录状态，请重试。');}
 finally{busy=false;button.disabled=disabled;button.removeAttribute('aria-busy');}
}
