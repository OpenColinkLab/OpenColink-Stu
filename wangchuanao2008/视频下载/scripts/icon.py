from PIL import Image, ImageDraw
from pathlib import Path
root=Path('resources/icon.iconset');root.mkdir(exist_ok=True)
im=Image.new('RGBA',(1024,1024),(0,0,0,0));d=ImageDraw.Draw(im)
d.rounded_rectangle((40,40,984,984),radius=225,fill='#f0f3ea')
d.rounded_rectangle((103,103,921,921),radius=181,fill='#547663')
d.rounded_rectangle((470,250,554,620),radius=35,fill='#f0f3ea')
d.line([(348,482),(512,648),(676,482)],fill='#f0f3ea',width=78)
d.rounded_rectangle((291,707,733,776),radius=32,fill='#f0f3ea')
for n in [16,32,128,256,512]:
 im.resize((n,n),Image.Resampling.LANCZOS).save(root/f'icon_{n}x{n}.png')
 im.resize((n*2,n*2),Image.Resampling.LANCZOS).save(root/f'icon_{n}x{n}@2x.png')
im.save('resources/icon.png')
