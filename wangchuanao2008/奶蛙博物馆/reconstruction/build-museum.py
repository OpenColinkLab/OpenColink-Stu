from pathlib import Path
import re,json,gzip
root=Path(__file__).resolve().parent
source=root.parent/'analysis/evidence/site'
base='https://works.cohub.live/w/157e937b-95da-4c17-add4-f916e37c3574/milk-frog-museum/2c0b53941f17/content/'
html=(source/'index.html').read_text()
html=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',html)
html=re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*href="style.css[^>]*>','',html)
html=html.replace('assets/',base+'assets/')
html=re.sub(r' action="https://formsubmit.co/[^"]+"','',html)
html=html.replace(' target="feedbackSubmitFrame"','').replace('正在唤起 Neta Studio 登录……','无需登录，保存到本机。').replace('Studio ID 与收藏馆藏','本地访客编号与收藏馆藏')
html=html.replace('登录 Studio 后可评论','无需登录 · 仅保存到本机').replace('完成奶蛙身份证后留下你的看法……','留下你对这件作品的看法……')
html=html.replace('登录 Studio 后自动填入','起一个属于你的名字').replace('昵称默认与 Studio 账号一致，也可以自行修改。','无需登录，直接领取本机保存的身份证。').replace('默认使用 Studio 昵称，可修改，最多 24 字','昵称最多 24 字').replace('STUDIO ID','VISITOR ID').replace('仅清除本设备的身份证与收藏，不影响 Studio 账号','仅清除本设备的身份证与收藏')
html=re.sub(r'<a href="/cdn-cgi/l/email-protection"[^>]*>[^<]*</a>','<a href="mailto:1610636536@qq.com">1610636536@qq.com</a>',html)
ids={'6f97ac11-95f5-451f-b4c6-214c3f02668a':'gallery','337d4274-ff22-43c7-9e3c-7f03e58766e8':'town','c659fde8-8117-4fc4-82ed-751c781308c4':'tower','8a36fbe6-51f2-4ad9-9f28-46f933f756b1':'factory','68438093-6659-4747-87b7-4d8e47dc093b':'survivor'}
for id,room in ids.items():html=html.replace('href="https://neta.art/w/'+id+'"','href="#room-'+room+'" data-room="'+room+'"')
html=html.replace('<div class="profile-hero-actions">','<div class="profile-hero-actions"><button id="downloadIdentity" type="button">下载身份证</button>')
html=html.replace('<div class="fcopy">','<div class="local-edition">本地免登录版 · 收藏与留言保存到本机</div><div class="fcopy">')
css=(source/'style.css').read_text()+'\n'+(root/'local-museum.css').read_text()
html=html.replace('</head>','<link rel="icon" href="data:,"><style>'+css+'</style></head>')
app=(source/'app.js').read_text().replace('assets/',base+'assets/')
# Preserve the known gothic collection under its explicit era instead of fallbacks.
app=app.replace('medieval:"medieval",','medieval:"medieval",')
app=app.replace('["medieval","中世纪"],','["medieval","中世纪"],\n  ["gothic","哥特"],')
app=app.replace("prehistoric:'PRE', ancient:'ANT', medieval:'MED', renaissance:","prehistoric:'PRE', ancient:'ANT', medieval:'MED', gothic:'GOT', renaissance:")
# Ensure initial source animation is keyboard/viewport friendly.
def read_room(name):
    path=root/'branches'/f'{name}.html'
    return path.read_text() if path.exists() else gzip.decompress(path.with_suffix('.html.gz').read_bytes()).decode('utf-8')
rooms={name:read_room(name) for name in ['gallery','town','tower','factory','survivor']}
roomdata=json.dumps(rooms,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
addon=(root/'local-museum.js').read_text().replace("openRoom(location.hash.slice(6))","openRoom(location.hash.slice(6).split('&')[0])")
addon=addon.replace("history.replaceState(null,'','#room-'+name);","if(!location.hash.startsWith('#room-'+name))history.replaceState(null,'','#room-'+name);")
script=lambda js:'<script>'+js.replace('</script','<\\/script')+'</script>'
extra='<input id="localAvatarUpload" type="file" accept="image/*" hidden><div id="localToast" class="local-toast" role="status" aria-live="polite"></div><div class="room-overlay" id="roomOverlay" hidden><div class="room-bar"><button id="roomClose" type="button">← 返回博物馆</button><strong id="roomTitle"></strong><span>无需登录</span></div><iframe id="roomFrame" class="room-frame" title="奶蛙分馆" allow="autoplay; fullscreen; gamepad"></iframe></div>'
html=html.replace('</body>',extra+'<script id="localRooms" type="application/json">'+roomdata+'</script>'+script(app)+script(addon)+'</body>')
(root/'奶蛙博物馆.html').write_text(html)
(root.parent/'奶蛙博物馆.html').write_text(html)
print('HTML bytes',len(html.encode()),'embedded rooms',len(rooms))
