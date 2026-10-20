from pathlib import Path
from html.parser import HTMLParser
import json,re,html,urllib.parse,collections
root=Path(__file__).resolve().parents[1]
s=(root/'奶蛙博物馆.html').read_text()
class P(HTMLParser):
 def __init__(self):super().__init__();self.on=False;self.buf=''
 def handle_starttag(self,t,a):
  if t=='script' and dict(a).get('id')=='localRooms':self.on=True
 def handle_data(self,d):
  if self.on:self.buf+=d
 def handle_endtag(self,t):
  if t=='script':self.on=False
p=P();p.feed(s);rooms=json.loads(p.buf)
main=re.sub(r'<script id="localRooms"[^>]*>[\s\S]*?</script>','',s)
texts={'main':main,**rooms};urls={};fontcss={};dynamic=[]
pattern=r'''https?://[^\s"'<>`\\]+'''
for name,text in texts.items():
 for m in re.finditer(pattern,text):
  u=html.unescape(m.group()).rstrip(');,')
  if '${' in u or any(ch in u for ch in '{}[]'):dynamic.append((name,u));continue
  if re.search(r'\.(png|jpe?g|webp|gif|mp3|mp4|webm|woff2?|ttf|ogg|wav|m4a|aac|flac|avif|svg)(?:\?|$)',u,re.I):urls.setdefault(u,set()).add(name)
  if u.startswith('https://fonts.googleapis.com/'):fontcss.setdefault(u,set()).add(name)
# Expand the only image filename template; all its alternatives occur in the literal tables too.
base=(root/'analysis/evidence/branches/factory/inner.url').read_text().strip().split('index.html')[0]
for i in [1,3,2,5,7,9]:urls.setdefault(base+f'assets/sticker-{i}.png',set()).add('factory')
urls.setdefault(base+'assets/nunito-latin.woff2',set()).add('factory')
# Previous immutable reference inventory includes all main artwork reference/portrait/quiz images.
for item in json.loads((root/'analysis/evidence/media-manifest.json').read_text()):urls.setdefault(item['url'],set()).add('main')
items=[{'url':u,'rooms':sorted(v)}for u,v in sorted(urls.items())]
(root/'offline/manifest.json').write_text(json.dumps(items,ensure_ascii=False,indent=2))
(root/'offline/font-css.json').write_text(json.dumps([{'url':u,'rooms':sorted(v)}for u,v in fontcss.items()],ensure_ascii=False,indent=2))
(root/'offline/dynamic-references.json').write_text(json.dumps(dynamic,ensure_ascii=False,indent=2))
print('resources',len(items),'by room',dict(collections.Counter(name for it in items for name in it['rooms'])),'font css',len(fontcss),'dynamic',dynamic)
