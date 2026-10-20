from pathlib import Path
from html.parser import HTMLParser
import json,re,html,hashlib,base64,urllib.parse,sys
root=Path(__file__).resolve().parents[1];off=root/'offline';src=(root/'奶蛙博物馆.html').read_text();runtime=(off/'runtime.js').read_text()
roomblock=re.search(r'<script id="localRooms"[^>]*>(.*?)</script>',src,re.S);rooms=json.loads(roomblock[1]);src=src.replace(roomblock[0],'@@ROOMS@@')
manifest=json.loads((off/'manifest.json').read_text());fonts=json.loads((off/'fonts.json').read_text());allitems=manifest+fonts['items'];index={};blobs={};missing=[]
for item in allitems:
 u=item['url'];meta=off/'cache'/(hashlib.sha256(u.encode()).hexdigest()+'.json')
 if not meta.exists():missing.append(u);continue
 rec=json.loads(meta.read_text())
 if not rec.get('ok'):missing.append(u);continue
 chosen=rec;opt=off/'optimized'/(rec['sha256']+'.json')
 if opt.exists()and (optimized:=json.loads(opt.read_text())).get('used'):chosen=optimized
 payload=(off/chosen['path']).read_bytes();sha=hashlib.sha256(payload).hexdigest();mime=chosen.get('content_type',rec['content_type']).split(';')[0]
 ident=sha[:24];index[u]={'id':ident,'type':mime,'bytes':len(payload)};blobs.setdefault(ident,{'path':chosen['path'],'sha256':sha,'type':mime,'bytes':len(payload)})
# Both literal Unicode URLs and browser-normalized percent-encoded URLs resolve to the same asset.
for u,item in list(index.items()):
 parsed=urllib.parse.urlsplit(u);encoded=urllib.parse.urlunsplit((parsed.scheme,parsed.netloc,urllib.parse.quote(urllib.parse.unquote(parsed.path),safe='/@:!$&\'()*+,;='),parsed.query,''));index[encoded]=item
if missing and '--partial'not in sys.argv:raise SystemExit('Resources still missing: '+str(len(missing)))
def jsjson(value):return json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
fontstyles={name:''for name in ['main',*rooms]}
for sheet in fonts['stylesheets']:
 for name in sheet['rooms']:fontstyles[name]+=(off/sheet['css_original_file']).read_text()+'\n'
bases={'main':'https://works.cohub.live/w/157e937b-95da-4c17-add4-f916e37c3574/milk-frog-museum/2c0b53941f17/content/'}
for name in rooms:bases[name]=(root/f'analysis/evidence/branches/{name}/inner.url').read_text().strip().split('index.html')[0]
csp="default-src 'none'; img-src blob: data:; media-src blob: data:; font-src blob: data:; connect-src blob: data:; script-src 'unsafe-inline' blob: data:; style-src 'unsafe-inline' blob: data:; worker-src blob: data:; frame-src 'self' blob: data:; form-action 'none'; base-uri 'none'"
class Transform(HTMLParser):
 def __init__(self,name):super().__init__(convert_charrefs=False);self.name=name;self.parts=[];self.instyle=False
 def handle_decl(self,t):self.parts.append('<!'+t+'>')
 def handle_starttag(self,t,attrs):
  d=dict(attrs)
  if t=='link'and d.get('rel')in ['stylesheet','preconnect','dns-prefetch']and str(d.get('href','')).startswith('https://fonts.'):return
  if t=='base':return
  changed=False;nextattrs=[]
  for k,v in attrs:
   if (t in ['img','audio','video','source']and k in ['src','poster'] or t=='link'and d.get('rel')in ['icon','shortcut icon']and k=='href')and v and not v.startswith(('data:','blob:')):k='data-offline-'+k;changed=True
   if k=='style'and v and 'url('in v:k='data-offline-style';changed=True
   nextattrs.append((k,v))
  if t=='style':self.instyle=True;nextattrs=[(k,v)for k,v in nextattrs if k!='type']+[('type','text/offline-css')];changed=True
  if t=='script'and d.get('type','').lower()not in ['application/json','application/octet-stream']:
   self.parts.append('<script>MFM_OFFLINE.hydrate(document);</script>')
  self.parts.append('<'+t+''.join(' '+k+('="'+html.escape(v,quote=True)+'"'if v is not None else'')for k,v in nextattrs)+'>'if changed else self.get_starttag_text())
  if t=='head':
   self.parts.append('<meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="'+html.escape(csp,quote=True)+'">')
   if self.name=='main':self.parts.append('@@ASSETS@@'+'<script>window.MFM_OFFLINE_INDEX='+jsjson(index)+';</script>')
   self.parts.append('<script>window.MFM_OFFLINE_CONFIG='+jsjson({'base':bases[self.name],'room':self.name})+';'+runtime+'</script>')
   self.parts.append('<style type="text/offline-css">'+fontstyles[self.name]+'</style>')
 def handle_endtag(self,t):
  if t=='style':self.instyle=False
  if t=='head':self.parts.append('<script>MFM_OFFLINE.hydrate(document);</script>')
  self.parts.append('</'+t+'>')
 def handle_startendtag(self,t,a):self.handle_starttag(t,a)
 def handle_data(self,d):
  if self.instyle:d=re.sub(r"""@import\s*(?:url\(\s*['"][^'"]*['"]\s*\)|['"][^'"]*['"])\s*;""",'',d)
  self.parts.append(d)
 def handle_entityref(self,n):self.parts.append('&'+n+';')
 def handle_charref(self,n):self.parts.append('&#'+n+';')
 def handle_comment(self,c):self.parts.append('<!--'+c+'-->')
 def run(self,s):self.feed(s);return ''.join(self.parts)
rooms['factory']=rooms['factory'].replace("{type:'module'}),timer=setTimeout","{}),timer=setTimeout")
transformed={name:Transform(name).run(s)for name,s in rooms.items()};main=Transform('main').run(src)
main=main.replace('@@ROOMS@@','<script id="localRooms" type="application/json">'+jsjson(transformed)+'</script>')
# Offline edition only: contact actions stay in the local feedback flow.
main=main.replace('mailto:','offline-contact:')
start,end=main.split('@@ASSETS@@');target=root/'奶蛙博物馆-完整版离线.html'
with target.open('w')as f:
 f.write(start)
 for ident,b in blobs.items():
  f.write('<script type="application/octet-stream" id="mfm-asset-'+ident+'">');f.write(base64.b64encode((off/b['path']).read_bytes()).decode());f.write('</script>\n')
 f.write(end)
report={'html':str(target),'html_bytes':target.stat().st_size,'unique_assets':len(blobs),'resource_urls':len(allitems),'embedded_bytes':sum(b['bytes']for b in blobs.values()),'missing':missing,'rooms':list(rooms),'assets':blobs}
(off/'build-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v if k!='missing'else len(v) for k,v in report.items()if k!='assets'},ensure_ascii=False))
