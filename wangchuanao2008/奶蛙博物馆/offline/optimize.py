from pathlib import Path
from PIL import Image
import hashlib,json,io,concurrent.futures
root=Path(__file__).resolve().parent;out=root/'optimized';out.mkdir(exist_ok=True)
records=[json.loads(p.read_text())for p in (root/'cache').glob('*.json')];items={r['sha256']:r for r in records if r.get('ok')and 'image/png'in r.get('content_type','')}
def one(item):
 sha,r=item;dest=out/(sha+'.webp');meta=out/(sha+'.json')
 if meta.exists():return json.loads(meta.read_text())
 source=(root/r['path']);result={'original_sha256':sha,'original_bytes':source.stat().st_size,'used':False}
 try:
  with Image.open(source)as img:
   if getattr(img,'n_frames',1)>1:return result
   rgba=img.convert('RGBA');buf=io.BytesIO();rgba.save(buf,format='WEBP',lossless=True,method=6,exact=True)
   payload=buf.getvalue();test=Image.open(io.BytesIO(payload)).convert('RGBA')
   if test.size!=rgba.size or test.tobytes()!=rgba.tobytes():raise ValueError('Pixels changed')
   if len(payload)<source.stat().st_size:
    dest.write_bytes(payload);result.update(used=True,path='optimized/'+dest.name,bytes=len(payload),sha256=hashlib.sha256(payload).hexdigest(),content_type='image/webp')
 except Exception as e:result['error']=str(e)
 meta.write_text(json.dumps(result));return result
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:results=list(pool.map(one,items.items()))
(root/'optimization.json').write_text(json.dumps(results,indent=2));print(json.dumps({'tested':len(results),'used':sum(r['used']for r in results),'saved_MiB':round(sum(r['original_bytes']-r.get('bytes',r['original_bytes'])for r in results)/1024**2,1)}))
