const test=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {resolve}=require('node:path');
test('standalone asset server serves images and rejects private paths and writes',{timeout:10000},async t=>{
 const server=spawn(process.execPath,[resolve(__dirname,'../scripts/serve-assets.mjs')],{env:{...process.env,HOST:'127.0.0.1',PORT:'0'},stdio:['ignore','pipe','pipe']});
 t.after(()=>server.kill());
 const address=await new Promise((done,reject)=>{server.once('error',reject);server.once('exit',code=>reject(new Error('Server exited: '+code)));server.stderr.on('data',data=>reject(new Error(data.toString())));server.stdout.once('data',data=>{const url=data.toString().match(/http:\/\/[^\s]+/);if(url)done(new URL(url[0]).origin);else reject(new Error(data.toString()));});});
 const response=await fetch(address+'/museum/thumbnails/work-103.jpg');assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/jpeg');assert((await response.arrayBuffer()).byteLength>0);
 const head=await fetch(address+'/museum/thumbnails/work-103.jpg',{method:'HEAD'});assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);
 assert.equal((await fetch(address+'/source/birthday.svg')).status,404);
 assert.equal((await fetch(address+'/museum/artworks/missing.jpg')).status,404);
 assert.equal((await fetch(address+'/museum/thumbnails/work-103.jpg',{method:'POST'})).status,405);
 assert.equal((await fetch(address+'/%2e%2e/package.json')).status,404);
});
