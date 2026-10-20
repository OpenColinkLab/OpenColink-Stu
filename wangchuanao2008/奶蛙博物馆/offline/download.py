import json,hashlib,subprocess,time,concurrent.futures,re,sys
from pathlib import Path
root=Path(__file__).resolve().parent;cache=root/'cache';cache.mkdir(exist_ok=True)
mode=sys.argv[1];allitems=json.loads((root/'manifest.json').read_text());items=[x for x in allitems if ('main'in x['rooms'])==(mode=='main')]
results=[];started=time.monotonic()
def get(item):
 u=item['url'];key=hashlib.sha256(u.encode()).hexdigest();file=cache/(key+'.bin');meta=cache/(key+'.json');temp=cache/(key+'.part');head=cache/(key+'.headers')
 if file.exists()and meta.exists():
  prior=json.loads(meta.read_text())
  if prior.get('ok')and hashlib.sha256(file.read_bytes()).hexdigest()==prior['sha256']:return prior
 r=subprocess.run(['curl','-L','--fail','--silent','--show-error','--connect-timeout','15','--max-time','90','--retry','2','--retry-delay','1','-D',str(head),'-o',str(temp),'-w','%{http_code}',u],capture_output=True,text=True)
 headers=head.read_text(errors='replace')if head.exists()else'';ct=re.findall(r'^content-type:\s*([^\r\n]+)',headers,re.M|re.I);head.unlink(missing_ok=True)
 result={'url':u,'rooms':item['rooms'],'ok':r.returncode==0,'http_status':r.stdout[-3:],'content_type':ct[-1]if ct else'', 'error':r.stderr[-600:]if r.returncode else''}
 if r.returncode==0 and temp.exists():
  b=temp.read_bytes();result.update({'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'path':'cache/'+key+'.bin'})
  if not b or ('text/html'in result['content_type'] and not re.search(r'\.html(?:\?|$)',u)):result['ok']=False;result['error']='Unexpected empty or HTML media payload'
  if result['ok']:temp.replace(file)
 temp.unlink(missing_ok=True);meta.write_text(json.dumps(result,ensure_ascii=False,indent=2));return result
with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:
 for f in concurrent.futures.as_completed([pool.submit(get,it)for it in items]):
  results.append(f.result())
  if len(results)%25==0 or not results[-1]['ok']:print(json.dumps({'done':len(results),'total':len(items),'MiB':round(sum(x.get('bytes',0)for x in results)/1024**2,1),'failed':sum(not x['ok']for x in results),'last':results[-1]['url']if not results[-1]['ok']else None}),flush=True)
results.sort(key=lambda x:x['url']);(root/('download-'+mode+'.json')).write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps({'finished':mode,'count':len(results),'failed':sum(not x['ok']for x in results),'seconds':round(time.monotonic()-started),'MiB':round(sum(x.get('bytes',0)for x in results)/1024**2,1)}),flush=True)
