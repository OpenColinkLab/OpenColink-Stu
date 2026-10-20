import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const out=new URL('./',import.meta.url);const file=new URL('../../奶蛙博物馆-完整版离线.html',import.meta.url);
const browser=await chromium.launch({headless:true,executablePath:process.env.MFM_CHROMIUM_PATH||chromium.executablePath(),args:['--disable-background-networking','--enable-unsafe-swiftshader']});
const context=await browser.newContext({offline:true,viewport:{width:1440,height:1000},locale:'zh-CN'});
const page=await context.newPage();const errors=[],network=[],consoleErrors=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text().slice(0,600));});
const result={mode:'file://, fresh profile, network offline',rooms:{},errors,network,consoleErrors};
try{
 console.log('Opening embedded HTML');await page.goto(file.href,{waitUntil:'load',timeout:120000});await page.waitForTimeout(1000);
 result.main=await page.evaluate(()=>({title:document.title,cards:document.querySelectorAll('.card').length,images:[...document.images].filter(i=>i.currentSrc).map(i=>({src:i.currentSrc,ok:i.complete&&i.naturalWidth>0})),missing:MFM_OFFLINE.missing.slice(),fontStatus:document.fonts.status}));await page.screenshot({path:fileURLToPath(new URL('main.png',out))});console.log('Main',result.main.cards,'cards',result.main.missing.length,'missing');
 await page.locator('#gallery .card:not(.hide)').first().click();await page.locator('#lbFavorite').click();await page.locator('#lbCommentInput').fill('离线参观测试');await page.locator('#lbCommentForm button').click();result.social={favorite:await page.locator('#lbFavorite').getAttribute('data-state'),comments:await page.locator('#lbCommentList').innerText()};await page.locator('#lbClose').click();await page.locator('#chinaVisit').click();result.chinaCards=await page.locator('#chinaGallery .card').count();await page.locator('#chinaBack').click();
 result.media=await page.evaluate(async()=>{const found=new Map();for(const [url,item]of Object.entries(MFM_OFFLINE.index))if(/\.(mp3|mp4|m4a|webm|ogg|wav)(?:\?|$)/i.test(url))found.set(item.id,{url,item});const output=[];for(const {url,item}of found.values()){const m=document.createElement(item.type.startsWith('video')?'video':'audio');m.preload='metadata';m.src=MFM_OFFLINE.resolve(url);const status=await new Promise(resolve=>{m.onloadedmetadata=()=>resolve({ok:true,duration:m.duration});m.onerror=()=>resolve({ok:false,error:m.error?.message});setTimeout(()=>resolve({ok:false,error:'metadata timeout'}),15000);m.load();});output.push({url,...status});m.removeAttribute('src');m.load();}return output;});
 for(const name of ['gallery','town','tower','factory','survivor']){
  console.log('Entering',name);await page.locator(`#worlds [data-room="${name}"]`).click();await page.waitForTimeout(3500);const frame=await (await page.locator('#roomFrame').elementHandle()).contentFrame();
  if(name==='gallery'){await frame.locator('#enterButton').click();await frame.locator('#mapButton').click();await frame.locator('#mapClose').click();}
  if(name==='town'){await frame.locator('[data-tab="bag"]').click();await frame.locator('#travel').click();}
  if(name==='tower'){await frame.locator('[data-ui="new"]').click();await frame.locator('[data-ui="deck"]').click();await frame.locator('[data-ui="close"]').click();}
  if(name==='factory'){
   await frame.locator('#loading').waitFor({state:'hidden',timeout:30000});await frame.locator('#random').click();const downloaded=page.waitForEvent('download');await frame.locator('#download').click();const dl=await downloaded;const pngPath=fileURLToPath(new URL('avatar-export.png',out));await dl.saveAs(pngPath);result.avatarExport={name:dl.suggestedFilename(),bytes:(await fs.stat(pngPath)).size};
   await frame.locator('#editor-emotions').click();await frame.locator('#m-templates button').first().click();await frame.locator('#m-generate').click();await frame.locator('#m-results figure').first().waitFor({timeout:30000});await frame.locator('#m-animate').click();await frame.locator('#m-trim').waitFor({state:'visible',timeout:30000});await frame.locator('#m-encode').click();await frame.locator('#m-gif').waitFor({state:'visible',timeout:60000});result.gif=(await frame.locator('#m-gif').getAttribute('src'))?.slice(0,90);
  }
  if(name==='survivor'){await page.keyboard.down('w');await page.waitForTimeout(700);await page.keyboard.up('w');await page.keyboard.press('j');}
  result.rooms[name]=await frame.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,1200),images:[...document.images].filter(i=>i.currentSrc).map(i=>({src:i.currentSrc,ok:i.complete&&i.naturalWidth>0})),canvases:document.querySelectorAll('canvas').length,missing:window.MFM_OFFLINE?.missing?.slice(),audio:[...document.querySelectorAll('audio,video')].map(a=>({src:a.currentSrc||a.src,ready:a.readyState,error:a.error?.message}))}));await page.screenshot({path:fileURLToPath(new URL(name+'.png',out))});await page.locator('#roomClose').click();
 }
 result.finalMissing=await page.evaluate(()=>MFM_OFFLINE.missing.slice());
}catch(e){result.failure=String(e);console.error('Failure',String(e));}
await fs.writeFile(new URL('result.json',out),JSON.stringify(result,null,2));await browser.close();console.log('Finished',JSON.stringify({errors:errors.length,network:network.length,missing:result.finalMissing?.length,failure:result.failure}));
