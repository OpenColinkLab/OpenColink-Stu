/* Local visitor state: no accounts, host bridge, network writes or credentials. */
(() => {
  const $ = id => document.getElementById(id);
  const key = 'milkfrog.local-museum.v1';
  let state = {identity:null,spec:null,favorites:[],likes:[],comments:{},feedback:[]};
  try { state = {...state,...JSON.parse(localStorage.getItem(key)||'{}')}; } catch {}
  let result = state.spec, selected = state.identity?.avatarIndex || 0, customAvatar = state.identity?.customAvatar || '';
  let returnToProfile = false;
  const save = () => { try { localStorage.setItem(key,JSON.stringify(state)); } catch { toast('浏览器空间不足，当前操作仍可在本次参观中使用。'); } };
  const escape = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const works = () => [...MAIN_WORKS,...CHINA_WORKS];
  const toast = text => { let el=$('localToast');el.textContent=text;el.classList.add('visible');clearTimeout(el.timer);el.timer=setTimeout(()=>el.classList.remove('visible'),2800); };
  const download = (blob,name) => { const a=document.createElement('a');a.download=name;a.href=URL.createObjectURL(blob);a.click();setTimeout(()=>URL.revokeObjectURL(a.href),10000); };
  const avatarNames=['默认奶蛙','金星奶蛙','耳机奶蛙','雏菊奶蛙','皇冠奶蛙','眼镜奶蛙','贝雷帽奶蛙','叶子奶蛙'];
  const backgrounds=['#ede9dd','#dedbd0','#ece3f2','#e5eee5','#f7efcf','#cee7f3','#f5d7cb','#dee9cb'];
  function avatar(index) {
    const color=['#fff8dc','#3f4445','#c9b1e6','#e4efda','#f1d76e','#8bcbee','#efb7a7','#a7c685'][index];
    const extras=[ '', '<path d="m79 20 3 6 7 1-5 4 1 7-6-4-6 4 1-7-5-4 7-1z" fill="#e0ba4f"/>', '<path d="M25 56c0-42 54-42 54 0" fill="none" stroke="#9765be" stroke-width="4"/><rect x="21" y="48" width="8" height="19" rx="4" fill="#9765be"/><rect x="75" y="48" width="8" height="19" rx="4" fill="#9765be"/>', '<g fill="white" stroke="#e7bd3d"><circle cx="70" cy="30" r="7"/><circle cx="70" cy="30" r="2" fill="#e7bd3d"/></g>', '<path d="m39 29-2-12 9 7 6-12 6 12 9-7-2 12z" fill="#dbb448"/>', '<g fill="none" stroke="#39789e" stroke-width="2"><circle cx="37" cy="48" r="10"/><circle cx="67" cy="48" r="10"/><path d="M47 48h10"/></g>', '<ellipse cx="48" cy="24" rx="21" ry="9" fill="#d97868" transform="rotate(12 48 24)"/>', '<path d="M58 26Q59 10 77 15Q71 34 58 26" fill="#598654"/>'][index];
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 104"><rect width="104" height="104" fill="${backgrounds[index]}"/><path d="M14 104Q19 18 52 20Q86 18 91 104" fill="${color}"/><circle cx="37" cy="47" r="10" fill="#a6b97b"/><circle cx="67" cy="47" r="10" fill="#a6b97b"/><circle cx="37" cy="47" r="5" fill="#1c2522"/><circle cx="67" cy="47" r="5" fill="#1c2522"/><path d="M47 66h10" stroke="#504d34" stroke-width="1.5"/>${extras}</svg>`);
  }
  function renderAvatars() {
    $('avatarGrid').replaceChildren();
    avatarNames.forEach((name,i)=>{ const b=document.createElement('button');b.type='button';b.className='avatar-choice'+(!customAvatar&&selected===i?' selected':'');b.style.backgroundImage=`url("${avatar(i)}")`;b.setAttribute('aria-label','选择'+name);b.onclick=()=>{selected=i;customAvatar='';renderAvatars();};$('avatarGrid').append(b); });
    const b=document.createElement('button');b.type='button';b.className='avatar-choice avatar-custom'+(customAvatar?' selected':'');b.innerHTML='<span class="avatar-custom-plus">+</span><span class="avatar-custom-label">我的头像</span>';b.setAttribute('aria-label','选择本地头像');if(customAvatar)b.style.backgroundImage=`url("${customAvatar}")`;b.onclick=()=>{$('localAvatarUpload').click();};$('avatarGrid').append(b);
  }
  $('localAvatarUpload').onchange=async e=>{const f=e.target.files[0];if(!f)return;if(!f.type.startsWith('image/')||f.size>10*1024*1024){toast('请选择10MB以内的图片。');return;}try{const image=await createImageBitmap(f);const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');const size=Math.min(image.width,image.height);c.drawImage(image,(image.width-size)/2,(image.height-size)/2,size,size,0,0,256,256);image.close();customAvatar=canvas.toDataURL('image/webp',.85);renderAvatars();}catch{toast('这张图片暂时无法读取。');}e.target.value='';};
  renderAvatars();$('identityNameInput').value=state.identity?.name||'奶蛙访客';
  window.addEventListener('mfm:quiz-result',e=>{result=e.detail;renderAvatars();});
  $('quizPrimary').addEventListener('click',e=>{
    if(e.currentTarget.dataset.act!=='save')return;e.preventDefault();e.stopImmediatePropagation();
    state.identity={name:$('identityNameInput').value.trim().slice(0,24)||'奶蛙访客',no:state.identity?.no||'ID-'+String(Math.floor(Math.random()*9000)+1000),avatarIndex:selected,customAvatar,issued:state.identity?.issued||new Date().toLocaleDateString('sv-SE')};
    state.spec=result;save();$('quizClose').click();openProfile();toast('你的奶蛙身份证已签发。');
  },true);
  function specCard() { const s=state.spec;if(!s)return '<div class="profile-none">去鉴定所，发现属于你的奶蛙。</div>';return `<div class="pspec-img"><img src="${escape(s.img)}" alt="${escape(s.name)}"></div><div class="pspec-body"><span class="pspec-you">你是——</span><h4>${escape(s.name)}</h4><div class="pspec-rows"><div><span>馆藏编号</span><b>${escape(s.no)}</b></div><div><span>稀有度</span><b>${escape(s.rare)}</b></div><div><span>出没地点</span><b>${escape(s.habitat)}</b></div></div><div class="pspec-note">${s.comment.map(escape).join('<br>')}</div></div>`; }
  function renderProfile() {
    const id=state.identity;if(!id)return;
    $('profileHeroName').textContent=id.name;$('profileHeroMeta').textContent=`${id.no} · ${id.issued} 签发`;$('profileHeroAvatar').style.backgroundImage=`url("${id.customAvatar||avatar(id.avatarIndex)}")`;$('profileHeroAvatar').style.backgroundSize='cover';$('profileHeroAvatar').style.borderRadius='50%';$('profileStudioId').textContent='本地访客';$('profileCollectionCount').textContent=state.favorites.length+' 件';$('profileFavCount').textContent=state.favorites.length;
    $('profileSpecCard').innerHTML=specCard();$('profileSpecModalContent').innerHTML=specCard();
    $('profileCollection').replaceChildren();state.favorites.forEach(name=>{const w=works().find(x=>x.zh===name);if(!w)return;const b=document.createElement('button');b.className='profile-work';b.innerHTML=`<img loading="lazy" src="${escape(w.url)}" alt="${escape(w.zh)}"><b>${escape(currentLang==='en'?w.en:w.zh)}</b>`;b.onclick=()=>{closeProfile();returnToProfile=true;openLightbox(w);};$('profileCollection').append(b);});
    if(!state.favorites.length)$('profileCollection').innerHTML='<div class="profile-none">在作品详情里点亮星星，收藏你喜欢的作品。</div>';
    const comments=Object.entries(state.comments).flatMap(([name,list])=>list.map(c=>({...c,work:name})));$('profileActivityCount').textContent=state.likes.length+comments.length;
    $('profileActivity').replaceChildren();
    const label=document.createElement('div');label.className='profile-activity-label';label.textContent='喜欢的作品';$('profileActivity').append(label);
    const liked=document.createElement('div');liked.className='profile-activity-liked';state.likes.forEach(name=>{const w=works().find(x=>x.zh===name);if(!w)return;const b=document.createElement('button');b.textContent=name;b.onclick=()=>{closeProfile();returnToProfile=true;openLightbox(w);};liked.append(b);});$('profileActivity').append(liked);
    comments.slice(-6).reverse().forEach(c=>{const b=document.createElement('button');b.className='profile-activity-comment';b.innerHTML=`<b>${escape(c.work)}</b><span>${escape(c.text)}</span>`;b.onclick=()=>{const w=works().find(x=>x.zh===c.work);if(w){closeProfile();returnToProfile=true;openLightbox(w);}};$('profileActivity').append(b);});
  }
  function openProfile(){if(!state.identity){$('giftToggle').click();return;}renderProfile();$('profilePage').hidden=false;document.body.classList.add('profile-view');requestAnimationFrame(()=>$('profilePage').classList.add('is-visible'));$('profilePage').scrollTop=0;}
  function closeProfile(){$('profilePage').classList.remove('is-visible');$('profilePage').hidden=true;document.body.classList.remove('profile-view');syncPageLock();}
  window.MFM_IDENTITY={openProfile};$('profileToggle').onclick=openProfile;$('profileBack').onclick=closeProfile;
  $('profileRenameBtn').onclick=()=>{const value=prompt('给奶蛙起一个名字',state.identity.name);if(value===null)return;state.identity.name=value.trim().slice(0,24)||'奶蛙访客';save();renderProfile();};
  $('profileRetestBtn').onclick=()=>{closeProfile();$('giftToggle').click();};
  $('profileLogoutBtn').onclick=()=>{if(!confirm('清除这台设备保存的身份证和收藏？'))return;state.identity=null;state.spec=null;state.favorites=[];save();closeProfile();toast('已清除本机身份。');};
  $('profileSpecCard').onclick=()=>{$('profileSpecModal').hidden=false;$('profileSpecModal').classList.add('open');};$('profileSpecClose').onclick=()=>{$('profileSpecModal').hidden=true;$('profileSpecModal').classList.remove('open');};
  function currentWork(){return $('lbFavorite').dataset.workName;}
  function syncSocial(){const name=currentWork();if(!name)return;const liked=state.likes.includes(name),fav=state.favorites.includes(name);$('lbFavorite').dataset.state=fav?'on':'off';$('lbFavorite').querySelector('b').textContent=fav?'已收藏':'收藏馆藏';$('lbLike').dataset.state=liked?'on':'off';$('lbLikeCount').textContent=liked?'1':'0';$('lbAuthNotice').hidden=true;$('lbCommentAuth').hidden=true;$('lbCommentStatus').textContent='留言保存在这台设备上';$('lbCommentInput').placeholder='留下你对这件作品的看法……';
    const list=state.comments[name]||[];$('lbCommentCount').textContent=list.length;$('lbCommentList').replaceChildren();
    if(!list.length){const empty=document.createElement('div');empty.className='lb-comment-empty';empty.textContent='还没有观众留下评论。';$('lbCommentList').append(empty);}
    list.forEach(c=>{const item=document.createElement('div');item.className='lb-comment';item.innerHTML=`<div class="lb-comment-head"><b>${escape(c.name)}</b><small>${new Date(c.at).toLocaleDateString()}</small></div><p>${escape(c.text)}</p>`;const remove=document.createElement('button');remove.type='button';remove.textContent='删除';remove.className='local-comment-delete';remove.onclick=()=>{state.comments[name]=list.filter(x=>x.id!==c.id);save();syncSocial();};item.append(remove);$('lbCommentList').append(item);});
    const caption=$('lbCommentForm').querySelector('small');if(caption)caption.textContent='无需登录 · 仅保存在本机';
  }
  const oldOpen=openLightbox;openLightbox=function(w){oldOpen(w);syncSocial();};
  const oldClose=closeLightbox;closeLightbox=function(){oldClose();if(returnToProfile){returnToProfile=false;openProfile();}};
  $('lbClose').onclick=closeLightbox;$('lightbox').onclick=e=>{if(e.target===$('lightbox'))closeLightbox();};
  $('lbFavorite').onclick=()=>{const name=currentWork();state.favorites=state.favorites.includes(name)?state.favorites.filter(x=>x!==name):[...state.favorites,name];save();syncSocial();};
  $('lbLike').onclick=()=>{const name=currentWork();state.likes=state.likes.includes(name)?state.likes.filter(x=>x!==name):[...state.likes,name];save();syncSocial();};
  $('lbCommentForm').onsubmit=e=>{e.preventDefault();const text=$('lbCommentInput').value.trim();if(!text)return;const name=currentWork();state.comments[name]||=[];state.comments[name].push({id:crypto.randomUUID?.()||String(Date.now()),name:state.identity?.name||'奶蛙访客',text:text.slice(0,240),at:Date.now()});$('lbCommentInput').value='';save();syncSocial();};
  $('feedbackForm').addEventListener('submit',async e=>{e.preventDefault();e.stopImmediatePropagation();const text=$('feedbackText').value.trim();if(!text){$('feedbackStatus').textContent='请写下你的意见。';return;}const files=[...$('feedbackFiles').files];if(files.some(f=>f.size>10*1024*1024)||files.reduce((a,f)=>a+f.size,0)>20*1024*1024){$('feedbackStatus').textContent='单个附件不超过10MB，合计不超过20MB。';return;}
    const entry={message:text,createdAt:new Date().toISOString(),attachments:await Promise.all(files.slice(0,6).map(async f=>({name:f.name,type:f.type,data:await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(f);})})))};
    state.feedback.push({message:text,createdAt:entry.createdAt,attachments:entry.attachments.map(x=>({name:x.name}))});save();download(new Blob([JSON.stringify(entry,null,2)],{type:'application/json'}),'奶蛙意见-'+new Date().toLocaleDateString('sv-SE')+'.json');$('feedbackStatus').textContent='意见与附件已导出到本机，未发送邮件。';
  },true);
  $('feedbackForm').removeAttribute('action');$('feedbackForm').removeAttribute('target');$('feedbackSubmit').textContent='保存意见';$('feedbackLead').textContent='告诉馆长你希望下一次看到什么。意见可保存到本机。';
  const oldRender=renderGallery;renderGallery=function(){oldRender();if(currentLang==='en')localizeCollection();};
  function localizeCollection(){const en=currentLang==='en';document.querySelectorAll('.card').forEach(card=>{const w=works().find(x=>x.zh===card.dataset.workName);if(!w)return;card.querySelector('h3').textContent=en?w.en:w.zh;card.querySelector('.en').textContent=en?w.zh:w.en;const era=card.querySelector('.card-era span');era.textContent=(en?ERA_LABEL_EN:ERA_LABEL)[w.era]||w.era;});const map={all:'All',recent:'Recommended',week:'Last week',month:'Last month',year:'Last year',pottery:'Pottery / Bronze',sancai:'Sancai',sculpture:'Sculpture',mural:'Murals / Reliefs',gongbi:'Gongbi',xieyi:'Freehand ink',others:'Other'};document.querySelectorAll('#filters button,#chinaFilters button').forEach(b=>{const k=b.dataset.filter;if(en)b.textContent=ERA_LABEL_EN[k]||map[k]||b.textContent;});}
  $('langToggle').addEventListener('click',()=>{localizeCollection();if($('lightbox').classList.contains('open')){const w=works().find(x=>x.zh===currentWork());if(w)openLightbox(w);}});
  // All five applications are embedded and created only when the visitor enters.
  const roomData=JSON.parse($('localRooms').textContent);const names={gallery:'3D 展馆',town:'奶蛙小镇',tower:'奶蛙尖塔',factory:'奶蛙制造所',survivor:'奶龙幸存者'};
  function openRoom(name){if(!roomData[name])return;document.querySelectorAll('.open').forEach(el=>{if(el!==$('roomOverlay'))el.classList.remove('open');});$('roomTitle').textContent=names[name];$('roomOverlay').hidden=false;document.body.classList.add('room-view');$('roomFrame').srcdoc=roomData[name];history.replaceState(null,'','#room-'+name);}
  function closeRoom(){$('roomOverlay').hidden=true;$('roomFrame').srcdoc='';document.body.classList.remove('room-view');history.replaceState(null,'','#worlds');syncPageLock();$('worlds').scrollIntoView({block:'start'});}
  $('roomClose').onclick=closeRoom;
  document.addEventListener('click',e=>{const a=e.target.closest('[data-room]');if(a){e.preventDefault();openRoom(a.dataset.room);}});
  window.addEventListener('message',e=>{if(e.source!==$('roomFrame').contentWindow)return;if(e.data?.type==='mfm:return')closeRoom();if(e.data?.type==='mfm:room')openRoom(e.data.room);});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('profileSpecModal').hidden){$('profileSpecClose').click();}else if(e.key==='Escape'&&$('profilePage').hidden===false){closeProfile();}});
  $('downloadIdentity').onclick=async()=>{if(!state.identity)return;const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1460;const c=canvas.getContext('2d');c.fillStyle='#f4f0e8';c.fillRect(0,0,1080,1460);c.strokeStyle='#a8894f';c.strokeRect(30,30,1020,1400);c.textAlign='center';c.fillStyle='#a8894f';c.font='24px serif';c.fillText('MUSÉE DU MILK FROG · VISITOR ID',540,100);c.fillStyle='#1a1712';c.font='54px serif';c.fillText(state.identity.name,540,200);c.font='24px serif';c.fillText(state.identity.no+' · '+state.identity.issued,540,260);const image=new Image();image.crossOrigin='anonymous';await new Promise(resolve=>{image.onload=resolve;image.onerror=resolve;image.src=state.spec?.img||state.identity.customAvatar||avatar(selected);});if(image.naturalWidth){const ratio=Math.min(880/image.width,600/image.height);c.drawImage(image,(1080-image.width*ratio)/2,320,image.width*ratio,image.height*ratio);}c.font='34px serif';let y=1000;const chars=Array.from(state.spec?.name||'圆润而沉静的身影');for(let i=0;i<chars.length;i+=24){c.fillText(chars.slice(i,i+24).join(''),540,y);y+=50;}c.font='24px serif';c.fillText('奶蛙博物馆 · 本地访客身份证',540,1340);try{canvas.toBlob(blob=>blob&&download(blob,'奶蛙身份证.png'));}catch{toast('图片加载失败，请稍后再下载。');}};
  document.querySelectorAll('.identity-confirm,.identity-maker').forEach(el=>el.hidden=true);
  if(location.hash.startsWith('#room-'))openRoom(location.hash.slice(6));
})();
