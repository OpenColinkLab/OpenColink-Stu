import json,hashlib,subprocess,concurrent.futures,re,time,sys,base64
from pathlib import Path
root=Path(__file__).resolve().parent;cache=root/'cache';items=json.loads((root/'manifest.json').read_text());start=time.monotonic()
def get(item):
 u=item['url'];key=hashlib.sha256(u.encode()).hexdigest();file=cache/(key+'.bin');meta=cache/(key+'.json');part=cache/(key+'.part');head=cache/(key+'.resumeheaders');prior=json.loads(meta.read_text())if meta.exists()else{}
 if prior.get('ok')and file.exists():return prior
 result={'url':u,'rooms':item['rooms'],'ok':False};total=None;mime=prior.get('content_type','');md5=None
 for attempt in range(80):
  r=subprocess.run(['curl','--http1.1','-L','--fail','--silent','--show-error','--connect-timeout','8','--max-time','25','--continue-at','-','-D',str(head),'-o',str(part),'-w','%{http_code}',u],capture_output=True,text=True)
  headers=head.read_text(errors='replace')if head.exists()else''
  length=re.findall(r'^content-length:\s*(\d+)',headers,re.M|re.I);ranges=re.findall(r'^content-range:.*?/(\d+)',headers,re.M|re.I);types=re.findall(r'^content-type:\s*([^\r\n]+)',headers,re.M|re.I);digests=re.findall(r'^content-md5:\s*([^\r\n]+)',headers,re.M|re.I)
  if ranges:total=int(ranges[-1])
  elif length and r.stdout[-3:]=='200':total=int(length[-1])
  if types:mime=types[-1]
  if digests:md5=digests[-1]
  if part.exists()and (r.returncode==0 or total is not None and part.stat().st_size==total):
   b=part.read_bytes()
   if not b or 'text/html'in mime:result['error']='Unexpected HTML or empty payload';break
   if md5 and base64.b64encode(hashlib.md5(b).digest()).decode()!=md5:result['error']='Source MD5 mismatch';part.unlink();continue
   result.update(ok=True,http_status=r.stdout[-3:],content_type=mime,error='',bytes=len(b),sha256=hashlib.sha256(b).hexdigest(),path='cache/'+key+'.bin',attempts=attempt+1)
   part.replace(file);break
  if r.returncode==33:part.unlink(missing_ok=True)
  if r.returncode==22 and r.stdout[-3:]in ['404','403']:result.update(error=r.stderr,http_status=r.stdout[-3:]);break
  result.update(error=r.stderr[-500:],http_status=r.stdout[-3:])
 head.unlink(missing_ok=True);meta.write_text(json.dumps(result,ensure_ascii=False,indent=2));return result
pending=[]
for it in items:
 m=cache/(hashlib.sha256(it['url'].encode()).hexdigest()+'.json')
 if not m.exists()or not json.loads(m.read_text()).get('ok'):pending.append(it)
print('Pending',len(pending),flush=True);results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=16)as pool:
 for f in concurrent.futures.as_completed([pool.submit(get,it)for it in pending]):
  results.append(f.result());print(json.dumps({'done':len(results),'total':len(pending),'ok':results[-1]['ok'],'url':results[-1]['url']if not results[-1]['ok']else None,'seconds':round(time.monotonic()-start)}),flush=True)
(root/'resume-result.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print('Complete',len(results),sum(not r['ok']for r in results),flush=True)
