import { chromium } from 'playwright-core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root=resolve(import.meta.dirname,'../..');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
try {
 const page=await browser.newPage({viewport:{width:750,height:422},deviceScaleFactor:1});
 for(const name of ['birthday','welcome']) {
  await page.goto(pathToFileURL(resolve(root,'assets/source',name+'.svg')).href);
  await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('image')].map(async image=>{const img=new Image();img.src=image.getAttribute('href');await img.decode();}));});
  await page.screenshot({path:resolve(root,'miniprogram/assets',name+'.jpg'),type:'jpeg',quality:88});
  console.log('Exported '+name+'.jpg');
 }
} finally { await browser.close(); }
