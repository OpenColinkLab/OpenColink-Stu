import './app.mjs';
import './generation.mjs';
import './memes.mjs';
window.addEventListener('click',e=>{const a=e.target.closest('a[data-local-room]');if(!a)return;e.preventDefault();const room=a.dataset.localRoom==='museum'?null:a.dataset.localRoom;parent.postMessage(room?{type:'mfm:room',room}:{type:'mfm:return'},'*');});

const brand=document.querySelector('header a');if(brand){brand.href='#manual';brand.addEventListener('click',e=>{e.preventDefault();document.querySelector('[data-workspace="edit"]').click();window.scrollTo(0,0);});}
