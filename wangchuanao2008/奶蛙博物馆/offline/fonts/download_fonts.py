import json,hashlib,subprocess,time,concurrent.futures,re
from pathlib import Path
root=Path(__file__).resolve().parents[1];cache=root/'cache';cache.mkdir(exist_ok=True)
ua='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
cssitems=json.loads((root/'font-css.json').read_text()); urls={}
for i,item in enumerate(cssitems):
 css=(root/'fonts'/f'css-{i}.css').read_text()
 for u in set(re.findall(r'url\(["\']?([^\)"\']+)',css)):
  rec=urls.setdefault(u,{'url':u,'rooms':[]})
  rec['rooms']=sorted(set(rec['rooms']+item['rooms']))
 item.update({'css_original_file':f'fonts/css-{i}.css','urls':sorted(set(re.findall(r'url\(["\']?([^\)"\']+)',css)))})
results=[];started=time.monotonic()
def get(item):
 u=item['url'];key=hashlib.sha256(u.encode()).hexdigest();file=cache/(key+'.bin');meta=cache/(key+'.json');temp=cache/(key+'.fontpart');head=cache/(key+'.fontheaders')
 if file.exists()and meta.exists():
  prior=json.loads(meta.read_text())
  if prior.get('ok')and hashlib.sha256(file.read_bytes()).hexdigest()==prior['sha256']:return prior
 r=subprocess.run(['curl','-L','--fail','--silent','--show-error','--connect-timeout','15','--max-time','90','--retry','2','--retry-delay','1','-A',ua,'-D',str(head),'-o',str(temp),'-w','%{http_code}',u],capture_output=True,text=True)
 headers=head.read_text(errors='replace')if head.exists()else'';ct=re.findall(r'^content-type:\s*([^\r\n]+)',headers,re.M|re.I);head.unlink(missing_ok=True)
 result={'url':u,'rooms':item['rooms'],'ok':r.returncode==0,'http_status':r.stdout[-3:],'content_type':ct[-1]if ct else'', 'error':r.stderr[-600:]if r.returncode else''}
 if r.returncode==0 and temp.exists():
  b=temp.read_bytes();result.update({'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'path':'cache/'+key+'.bin'})
  if b[:4]!=b'wOF2':result['ok']=False;result['error']='Downloaded font is not WOFF2'
  if result['ok']:temp.replace(file)
 temp.unlink(missing_ok=True);meta.write_text(json.dumps(result,ensure_ascii=False,indent=2));return result
with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:
 for f in concurrent.futures.as_completed([pool.submit(get,it)for it in urls.values()]):
  results.append(f.result())
  if len(results)%25==0 or not results[-1]['ok']:print(json.dumps({'done':len(results),'total':len(urls),'MiB':round(sum(x.get('bytes',0)for x in results)/1024**2,2),'failed':sum(not x['ok']for x in results),'last':results[-1]['url']if not results[-1]['ok']else None}),flush=True)
results.sort(key=lambda x:x['url'])
# Deduplication points all equal-content URLs to one canonical cache binary.
canonical={}
for r in results:
 if r['ok']:
  r['canonical_path']=canonical.setdefault(r['sha256'],r['path'])
summary={'unique_urls':len(results),'unique_blobs':len(canonical),'failed':sum(not x['ok']for x in results),'download_bytes':sum(x.get('bytes',0)for x in results),'unique_bytes':sum(next(x['bytes']for x in results if x.get('sha256')==sha)for sha in canonical),'seconds':round(time.monotonic()-started),'format':'woff2','families':['Cormorant Garamond','Jost','Noto Serif SC','Noto Sans SC','Source Sans 3']}
(root/'fonts.json').write_text(json.dumps({'items':results,'stylesheets':cssitems,'summary':summary},ensure_ascii=False,indent=2))
print(json.dumps(summary),flush=True)
