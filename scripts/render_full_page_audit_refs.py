#!/usr/bin/env python3
"""Render selected *full* original PDF pages with a 50pt grid for human edits."""
from pathlib import Path
from io import BytesIO
import json,urllib.request
import fitz
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'content/paper-figures.json').read_text())
targets={"rt-1":[1,3],"act":[1,5,7],"vima":[4,7],"bridgedata-v2":[4,8],
"fast":[1,2],"octo":[4,6],"open-x-embodiment":[6],"diffusion-policy":[5,6],"lingbot-vla-2":[4,8,9,14,15,16],"groot-n1":[7,22,25],
"pi-0-5":[4,8],"rtc-inference":[3,5,8],"rtc-training":[2,3],
"mimicplay":[7],"libero":[9],"rt-2":[9],"openvla":[10],"qwen-vla":[24]}
out=ROOT/'.figure-review-previews'/'pages'
out.mkdir(parents=True,exist_ok=True)
FONT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
for slug, pages in targets.items():
    url=data[slug][0]['pdf']
    dest=Path('/tmp')/(slug+'-pageaudit.pdf')
    if not dest.exists():
        request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'application/pdf'})
        with urllib.request.urlopen(request,timeout=100) as f:raw=f.read()
        assert raw[:5]==b'%PDF-'
        dest.write_bytes(raw)
    with fitz.open(dest) as pdf:
        for p in pages:
            page=pdf[p-1]
            scale=1.75
            pix=page.get_pixmap(matrix=fitz.Matrix(scale,scale),alpha=False,colorspace=fitz.csRGB)
            im=Image.open(BytesIO(pix.tobytes('png'))).convert('RGB')
            draw=ImageDraw.Draw(im,'RGBA')
            for y in range(0,int(page.rect.y1),50):
                v=int(y*scale)
                draw.line([(0,v),(im.width,v)],fill=(0,0,255,45),width=2)
                draw.text((1,v+1),str(y),font=FONT,fill=(0,0,120,255))
            for x in range(0,int(page.rect.x1),100):
                u=int(x*scale)
                draw.line([(u,0),(u,im.height)],fill=(0,0,255,35),width=2)
                draw.text((u+1,1),str(x),font=FONT,fill=(0,0,120,255))
            for f in data[slug]:
                if f['page']!=p:continue
                x0,y0,x1,y1=f['bbox']
                draw.rectangle((x0*scale,y0*scale,x1*scale,y1*scale),outline=(255,0,0,255),width=5)
                draw.text((int(x0*scale)+8,int(y0*scale)+10),'FIG '+str(f['number']),font=FONT,fill=(255,0,0,255))
            dest_img=out/f'{slug}-p{p}.jpg'
            im.save(dest_img,quality=74,subsampling=2,optimize=True)
            print(dest_img,im.size,dest_img.stat().st_size,flush=True)
