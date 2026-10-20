const { _electron: electron } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { fixtures } = require('./fixtures.cjs');
async function main(){
  const executablePath=process.env.VD_INSTALLED_EXE;
  assert(executablePath && fs.existsSync(executablePath));
  const bin=path.join(path.dirname(executablePath),'resources','bin');
  process.env.VD_TEST_FFMPEG=path.join(bin,'ffmpeg.exe');
  const root=fs.mkdtempSync(path.resolve('test-artifacts/installed-'));
  const fixture=await fixtures(path.resolve('test-artifacts/fixtures'));
  const env={...process.env,VD_TEST_STATE:root,VD_TEST_DOWNLOADS:path.join(root,'downloads')};
  delete env.ELECTRON_RUN_AS_NODE;
  const app=await electron.launch({executablePath,args:[],env,timeout:90000});
  try{
    const page=await app.firstWindow();
    await page.waitForSelector('#video-url');
    await page.locator('#video-url').fill(fixture.url+'/sample.mp4');
    await page.getByRole('button',{name:'下载视频',exact:true}).click();
    await page.locator('.state-completed').waitFor({timeout:90000});
    const snap=await page.evaluate(()=>window.downloader.snapshot());
    const file=snap.tasks[0].file;
    assert(fs.existsSync(file));
    const p=JSON.parse(execFileSync(path.join(bin,'ffprobe.exe'),['-v','error','-show_streams','-of','json',file],{encoding:'utf8',windowsHide:true}));
    assert(p.streams.some(s=>s.codec_type==='video'));
    assert(p.streams.some(s=>s.codec_type==='audio'));
    console.log('PASS: silent-installed Windows app launched and downloaded playable video with audio.');
  }finally{await app.close();await fixture.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
