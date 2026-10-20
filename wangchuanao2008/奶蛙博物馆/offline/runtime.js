/* Embedded public assets. The page never needs a server or network connection. */
(function(){
'use strict';
const root=window.parent!==window&&window.parent.MFM_OFFLINE ? window.parent.MFM_OFFLINE : null;
const config=window.MFM_OFFLINE_CONFIG;
const store=root||{index:window.MFM_OFFLINE_INDEX,cache:new Map(),missing:[],requests:[],bytes:0};
const base=config.base;
function key(u){try{let value=String(u).replace(/&amp;/g,'&');if(value.includes('/https://'))value=value.slice(value.lastIndexOf('https://'));return new URL(value,base).href.split('#')[0];}catch{return String(u);}}
function resolve(u){
 if(!u||/^(data:|blob:|#)/i.test(String(u)))return u;
 const normalized=key(u),item=store.index[normalized];
 if(!item){if(/^(https?:|mfm-asset:)/.test(normalized)){if(!store.missing.includes(normalized)){store.missing.push(normalized);console.error('离线包未收录资源',normalized);}return 'data:application/octet-stream;base64,';}return u;}
 if(!store.cache.has(item.id)){
  const doc=root?window.parent.document:document;
  const encoded=doc.getElementById('mfm-asset-'+item.id).textContent.trim();
  const parts=[];const chunk=131072;for(let at=0;at<encoded.length;at+=chunk){const raw=atob(encoded.slice(at,at+chunk));const buf=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)buf[i]=raw.charCodeAt(i);parts.push(buf);}
  const blob=new Blob(parts,{type:item.type});store.bytes+=blob.size;store.cache.set(item.id,(root?window.parent.URL:URL).createObjectURL(blob));
 }
 return store.cache.get(item.id);
}
function css(text){return String(text).replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g,(all,q,u)=>`url("${resolve(u)}")`);}
function markup(text){return String(text).replace(/\b(src|poster)\s*=\s*(["'])(.*?)\2/gi,(all,k,q,u)=>`${k}=${q}${resolve(u)}${q}`).replace(/\bstyle\s*=\s*(["'])(.*?)\1/gi,(all,q,s)=>`style=${q}${css(s).replaceAll(q,q==='"'?'&quot;':'&#39;')}${q}`);}
function hook(proto,name,convert){const d=Object.getOwnPropertyDescriptor(proto,name);if(!d?.set||!d.configurable)return;Object.defineProperty(proto,name,{...d,set(v){d.set.call(this,convert(v));}});}
for(const [proto,prop]of [[HTMLImageElement.prototype,'src'],[HTMLImageElement.prototype,'srcset'],[HTMLMediaElement.prototype,'src'],[HTMLSourceElement.prototype,'src'],[HTMLVideoElement.prototype,'poster']])hook(proto,prop,resolve);
hook(Element.prototype,'innerHTML',markup);hook(Element.prototype,'outerHTML',markup);hook(CSSStyleDeclaration.prototype,'cssText',css);
for(const prop of ['backgroundImage','background','maskImage','borderImageSource','listStyleImage'])hook(CSSStyleDeclaration.prototype,prop,css);
const attribute=Element.prototype.setAttribute;Element.prototype.setAttribute=function(k,v){if(/^(src|poster)$/i.test(k))v=resolve(v);if(k==='style')v=css(v);return attribute.call(this,k,v);};
const attributeNS=Element.prototype.setAttributeNS;Element.prototype.setAttributeNS=function(ns,k,v){if(/^(src|poster|href)$/i.test(k)&&this instanceof SVGImageElement)v=resolve(v);return attributeNS.call(this,ns,k,v);};
const property=CSSStyleDeclaration.prototype.setProperty;CSSStyleDeclaration.prototype.setProperty=function(k,v,p){return property.call(this,k,css(v),p);};
const adjacent=Element.prototype.insertAdjacentHTML;Element.prototype.insertAdjacentHTML=function(p,s){return adjacent.call(this,p,markup(s));};
const NativeAudio=window.Audio;window.Audio=function(src){const a=new NativeAudio();if(src)a.src=resolve(src);return a;};window.Audio.prototype=NativeAudio.prototype;
const nativeFetch=window.fetch.bind(window);window.fetch=function(input,options){const u=typeof input==='string'?input:input instanceof URL?input.href:input.url;const resolved=resolve(u);store.requests.push(u);if(/^https?:/.test(resolved)||resolved==='data:application/octet-stream;base64,')return Promise.reject(new Error('离线资源不存在: '+u));return nativeFetch(resolved,options);};
const xhrOpen=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(method,u,...rest){return xhrOpen.call(this,method,resolve(u),...rest);};
const NativeFontFace=window.FontFace;if(NativeFontFace){window.FontFace=function(f,s,d){return new NativeFontFace(f,typeof s==='string'?css(s):s,d);};window.FontFace.prototype=NativeFontFace.prototype;}
function hydrate(scope){
 scope.querySelectorAll('style[type="text/offline-css"]').forEach(s=>{const content=css(s.textContent);s.type='text/css';s.textContent=content;});
 scope.querySelectorAll('[data-offline-style]').forEach(el=>{el.style.cssText=css(el.getAttribute('data-offline-style'));el.removeAttribute('data-offline-style');});
 for(const name of ['src','poster','href'])scope.querySelectorAll('[data-offline-'+name+']').forEach(el=>{el.setAttribute(name,resolve(el.getAttribute('data-offline-'+name)));el.removeAttribute('data-offline-'+name);});
}
const api={...store,resolve,css,hydrate};if(root){api.index=store.index;api.cache=store.cache;api.missing=store.missing;api.requests=store.requests;}window.MFM_OFFLINE=api;
// Assignment through CSS properties differs between browsers; observe late styles too.
new MutationObserver(records=>{for(const r of records){if(r.type==='childList'){for(const n of r.addedNodes)if(n.nodeType===1){hydrate(n);if(n.matches?.('[data-offline-src]'))n.src=resolve(n.getAttribute('data-offline-src'));}}else if(r.attributeName==='style'){const v=r.target.getAttribute('style');if(v&&/https?:/.test(v)){const fixed=css(v);if(fixed!==v)attribute.call(r.target,'style',fixed);}}}}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['style']});
window.addEventListener('DOMContentLoaded',()=>hydrate(document));
})();
