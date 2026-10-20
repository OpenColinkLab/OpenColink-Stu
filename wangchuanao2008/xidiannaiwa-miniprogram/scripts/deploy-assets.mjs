import { spawn } from 'node:child_process';
import { readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--host'||!/^[a-zA-Z0-9][a-zA-Z0-9_.@-]*$/.test(args[1]))throw new Error('Usage: npm run assets:deploy -- --host YOUR_SSH_HOST');
const host=args[1],root=resolve(import.meta.dirname,'..');
const release='assets-'+new Date().toISOString().replace(/[-:.TZ]/g,'');
const staging='/tmp/naiwa-'+release;
const target='/var/www/naiwa-miniprogram';
function run(command,argv){return new Promise((done,reject)=>{const child=spawn(command,argv,{stdio:'inherit'});child.once('error',reject);child.once('exit',code=>code===0?done():reject(new Error(command+' failed with '+code)));});}
const catalog=JSON.parse(await readFile(resolve(root,'content/catalog.json'),'utf8'));
const paths=[...new Set(catalog.works.flatMap(work=>[work.image,work.thumbnail]))].sort();
const manifest={};
for(const path of paths){if(!/^museum\/(artworks|thumbnails)\/[a-zA-Z0-9._-]+$/.test(path))throw new Error('Invalid image path');manifest[path]=createHash('sha256').update(await readFile(resolve(root,'assets',path))).digest('hex');}
const scratch=await mkdtemp(resolve(tmpdir(),'naiwa-deploy-'));
await writeFile(resolve(scratch,'manifest.json'),JSON.stringify(manifest));
await run('ssh',['-o','BatchMode=yes',host,'mkdir -p '+staging]);
await run('rsync',['-a','--checksum',resolve(root,'assets/museum'),host+':'+staging+'/']);
await writeFile(resolve(scratch,'verify.py'), "import hashlib,json,pathlib\nr=pathlib.Path(__file__).parent\nm=json.loads((r/'manifest.json').read_text())\nassert all(hashlib.sha256((r/p).read_bytes()).hexdigest()==h for p,h in m.items()), 'Image checksum mismatch'\nprint('Verified',len(m),'images')\n");
await run('scp',[resolve(scratch,'manifest.json'),resolve(scratch,'verify.py'),host+':'+staging+'/']);
// 校验全部图片后原子切换 current，旧版本保留供回滚。SSH 参数限制为安全字符。
await run('ssh',['-o','BatchMode=yes',host,"python3 "+staging+"/verify.py && sudo -n mkdir -p "+target+"/releases && sudo -n mv "+staging+" "+target+"/releases/"+release+" && sudo -n chown -R root:root "+target+"/releases/"+release+" && sudo -n chmod -R a+rX "+target+"/releases/"+release+" && sudo -n ln -s "+target+"/releases/"+release+" "+target+"/current-"+release+".next && sudo -n mv -Tf "+target+"/current-"+release+".next "+target+"/current"]);
console.log('Deployed '+paths.length+' images to '+host+':'+target+'/current. Nginx/TLS configuration is a separate initial setup step.');
