from pathlib import Path
from PIL import Image
import json,hashlib,concurrent.futures,subprocess,shutil,os
root=Path(__file__).resolve().parent;items={}
for p in (root/'cache').glob('*.json'):
 r=json.loads(p.read_text())
 if r.get('ok'):items.setdefault(r['sha256'],r)
def check(r):
 p=root/r['path'];raw=p.read_bytes();result={'url':r['url'],'sha256':r['sha256'],'ok':hashlib.sha256(raw).hexdigest()==r['sha256'],'bytes':len(raw),'type':r['content_type']}
 try:
  if 'image/'in r['content_type']:
   with Image.open(p)as im:result.update(width=im.width,height=im.height,format=im.format);im.verify()
  elif 'font/'in r['content_type']:assert raw[:4]in [b'wOF2',b'wOFF'], 'Invalid font header'
  elif any(x in r['content_type']for x in ['audio/','video/']):
   proc=subprocess.run([os.environ.get('MFM_FFPROBE_PATH') or shutil.which('ffprobe') or 'ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,codec_type,width,height','-of','json',str(p)],capture_output=True,text=True)
   assert proc.returncode==0,proc.stderr;result['media']=json.loads(proc.stdout)
 except Exception as e:result.update(ok=False,error=str(e))
 return result
with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:results=list(pool.map(check,items.values()))
(root/'asset-validation.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps({'checked':len(results),'failed':[r for r in results if not r['ok']]}))
