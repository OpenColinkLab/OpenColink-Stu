import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rollup} from 'rollup';
const root=path.dirname(fileURLToPath(import.meta.url)),dir=path.join(root,'factory'),source=path.join(root,'../analysis/evidence/branches/factory');
const json=await fs.readFile(path.join(dir,'assets.json'),'utf8'),styles=await fs.readFile(path.join(dir,'styles.json'),'utf8');
let art=await fs.readFile(path.join(dir,'art.mjs'),'utf8');art=art.replace("const response=await fetch(new URL('./assets.json',import.meta.url));\n  if(!response.ok)throw new Error('The artwork manifest could not load.');\n  assetLinks=await response.json();",'assetLinks='+json+';');await fs.writeFile(path.join(dir,'art.mjs'),art);
let gen=await fs.readFile(path.join(dir,'generation.mjs'),'utf8');gen=gen.replace("fetch('./styles.json').then(async response=>{if(!response.ok)throw Error('风格预览加载失败，请刷新重试。');return response.json();})",'Promise.resolve('+styles+')');gen=gen.replace("} catch(error) { status(error.status === 402 ? 'Cohub 余额不足，本次未开始生成。' : error.message); }","} catch(error) { if(job&&job.phase!=='saved'){job.phase='failed';remember();} status(error.message); }");await fs.writeFile(path.join(dir,'generation.mjs'),gen);
const workerBundle=await rollup({input:path.join(dir,'meme-worker.mjs')});const worker=(await workerBundle.generate({format:'iife'})).output[0].code;await workerBundle.close();
let media=await fs.readFile(path.join(dir,'meme-media.mjs'),'utf8');media=media.replace("new URL('./meme-worker.mjs',import.meta.url)",'URL.createObjectURL(new Blob(['+JSON.stringify(worker)+'],{type:"text/javascript"}))');await fs.writeFile(path.join(dir,'meme-media.mjs'),media);
const replacements=[
 ['使用你的 Cohub 余额 · 存入 ${home.name}','本地合成预览 · 保存到 ${home.name} · 无需登录'],['等待 Cohub 授权…','准备本地画布…'],['使用你的 Cohub 余额','本地合成 · 非 AI · 无需登录'],['Image 2.5 ·','本地画布 ·'],['生成 5 秒视频 · H3','合成 5 秒摇摆视频'],['H3 Max Turbo · 768P · 约 $0.20，最终以 Cohub 计费为准','本地动画 · WebM · 768 px'],['如原图无透明通道，另用 BiRefNet 去背景，最多 $0.007 / 张。GIF 使用白色背景。','本地色键去背景，适合纯色图。GIF使用白色背景。'],['确认付费精修','确认本地合成'],['生成四张','本地合成四张'],['生成两组搭档','本地合成两组搭档'],['生成表情包','本地合成表情包'],['连接我的 Cohub','启用本地工坊'],['我的 Cohub 已连接','本地工坊已就绪'],['登录后下载 PNG','下载 PNG'],['去背景 · $0.007','本地去背景'],['继续去背景（另计费）','继续本地去背景'],['已保存到你授权的空间。','已保存在这台设备上。'],['正在保存到你授权的空间…','正在保存到这台设备…'],['正在从你授权的空间 读取头像…','正在读取本机头像…'],['正在把参考图存入你授权的空间…','正在准备本地参考图…'],['不会重复生成或扣费','不会重复合成'],['避免重复扣费','避免重复合成'],['生成中，可以稍后连接账号并查看原任务…','正在本地合成…'],['Cohub 账号','本地身份'],['Cohub 任务','本地任务']
];
for(const file of (await fs.readdir(dir)).filter(f=>f.endsWith('.mjs')&&!['generation-account.mjs'].includes(f))){let s=await fs.readFile(path.join(dir,file),'utf8');for(const[a,b]of replacements)s=s.replaceAll(a,b);if(file==='app.mjs'){
 s=s.replace("new URLSearchParams(location.hash.slice(1)).get('frog')","new URLSearchParams((window.parent!==window?parent.location.hash:location.hash).slice(1)).get('frog')");
 s=s.replace("const url = new URL('https://cohub.live/atou/milkfrog/w/milkfrog'); url.hash = 'frog=' + encode(timeline.state);","const url = new URL(parent.location.href); url.hash = 'room-factory&frog=' + encode(timeline.state);");}
 if(file==='memes.mjs')s=s.replace("!source.url.startsWith('https://')","!['https:','data:','blob:'].some(prefix=>source.url.startsWith(prefix))");
 await fs.writeFile(path.join(dir,file),s);
}
// Preserve top-level await using an async closure around the fully linked ES output.
const bundle=await rollup({input:path.join(dir,'entry.mjs'),onwarn:w=>{if(w.code!=='CIRCULAR_DEPENDENCY')console.error(w.message);}});const code=(await bundle.generate({format:'es',inlineDynamicImports:true})).output[0].code;await bundle.close();
let html=await fs.readFile(path.join(source,'index.html'),'utf8');html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g,'').replace(/<link\b[^>]*rel="icon"[^>]*>/g,'<link rel="icon" href="data:,">');
const friends={'1bbf7fb7-8920-45af-8481-27f4dfc7e692':'museum','6f97ac11-95f5-451f-b4c6-214c3f02668a':'gallery','337d4274-ff22-43c7-9e3c-7f03e58766e8':'town','c659fde8-8117-4fc4-82ed-751c781308c4':'tower','68438093-6659-4747-87b7-4d8e47dc093b':'survivor'};for(const[id,room]of Object.entries(friends))html=html.replace('href="https://neta.art/w/'+id+'" target="_blank"','href="#room-'+room+'" data-local-room="'+room+'"');
let css='';for(const name of ['style.css','generation.css','design.css','memes.css'])css+='\n'+await fs.readFile(path.join(source,name),'utf8');html=html.replace('</head>','<style>'+css+'</style></head>');
const base=(await fs.readFile(path.join(source,'inner.url'),'utf8')).trim().split('index.html')[0];html=html.replace(/\b(src|poster)="\.\/([^\"]+)"/g,(_,k,v)=>k+'="'+base+v+'"');
html=html.replace(/<p>将使用 Image 2\.5[\s\S]*?<\/p>/,'<p>本地合成预览保留你的参考图与奶蛙，不调用 AI、不上传、不收费。</p>');for(const[a,b]of replacements)html=html.replaceAll(a,b);
html=html.replace(/<p class="generation[^"]*">[^<]*Cohub[^<]*<\/p>/g,'<p>本地合成预览 · 无需登录</p>');
const icons=await fs.readFile(path.join(source,'vendor/lucide.min.js'),'utf8');const script=s=>'<script>'+s.replaceAll('</script','<\\/script')+'</script>';
html=html.replace('</body>',()=>script(icons)+script('(async()=>{'+code+'})().catch(e=>{console.error(e);document.getElementById("loading").textContent="素材暂时无法加载，请联网后重试。";});')+'<style>.generation-account,.generation-meta{font-size:11px}#localFactoryLabel{position:fixed;right:14px;bottom:10px;color:#74856d;font:10px sans-serif;z-index:1000;pointer-events:none}</style><div id="localFactoryLabel">本地合成 · 非 AI · 无需登录</div></body>');
await fs.writeFile(path.join(root,'branches/factory.html'),html);console.log('factory.html',html.length,'characters');
