#!/usr/bin/env python3
"""Produce source-PDF image reference sheets for HUMAN visual inspection.

Absolutely NO automated crop decisions. Draw existing crop in red and show
adjacent PDF content as evidence to let the reviewer select coordinates.
"""
import io,json,sys,math,urllib.request,time
from pathlib import Path
import fitz
from PIL import Image,ImageDraw,ImageFont,ImageOps
ROOT=Path(__file__).resolve().parents[1]
SHEETS=ROOT/'.figure-review-previews'
SHEETS.mkdir(exist_ok=True)
data=json.loads((ROOT/'content/paper-figures.json').read_text())
slugs=sys.argv[1:] or list(data)
FONT=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',19)
SMALL=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
W,H=1000,670
def download(url,slug):
    path=Path('/tmp')/(slug+'-manual-source.pdf')
    if path.exists(): return path
    variants=[url]
    fallback={'act':'https://arxiv.org/pdf/2304.13705','rt-1':'https://arxiv.org/pdf/2212.06817','diffusion-policy':'https://arxiv.org/pdf/2303.04137'}
    if slug in fallback:variants.append(fallback[slug])
    for u in variants:
        try:
            req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0','Accept':'application/pdf'})
            with urllib.request.urlopen(req,timeout=80) as res:
                blob=res.read()
            if blob.startswith(b'%PDF-'):
                path.write_bytes(blob)
                return path
        except Exception as ex:
            print('WARN',slug,u,ex,flush=True)
    raise RuntimeError('No PDF for '+slug)

for slug in slugs:
    figs=data[slug]
    p=download(figs[0]['pdf'],slug)
    with fitz.open(p) as doc:
        cells=[]
        for f in figs:
            pg=doc[f['page']-1]
            x0,y0,x1,y1=f['bbox']
            left=max(pg.rect.x0,x0-25)
            right=min(pg.rect.x1,x1+25)
            top=max(pg.rect.y0,min(y0-100,y0-(y1-y0)*0.5))
            bottom=min(pg.rect.y1,y1+75)
            if bottom-top>750:top=max(0,bottom-750)
            view=fitz.Rect(left,top,right,bottom)
            # Always include existing red-bordered bbox and neighboring content.
            px=pg.get_pixmap(matrix=fitz.Matrix(2.0,2.0),clip=view,alpha=False)
            src=Image.open(io.BytesIO(px.tobytes('png'))).convert('RGB')
            overlay=ImageDraw.Draw(src)
            s=2.0
            overlay.rectangle(((x0-left)*s,(y0-top)*s,(x1-left)*s,(y1-top)*s),
                              outline=(220,0,0),width=5)
            # Coordinates printed in black on white at top left of each cell
            cell=Image.new('RGB',(W,H),'white')
            draw=ImageDraw.Draw(cell)
            draw.text((13,9),f'{slug} | FIG {f["number"]} | PDF page {f["page"]}',font=FONT,fill=(5,5,5))
            draw.text((13,38),f'EXISTING bbox: {f["bbox"]}   SOURCE viewport: {[round(v,1) for v in view]}',font=SMALL,fill=(40,40,40))
            scaled=ImageOps.contain(src,(W-35,H-126),Image.Resampling.LANCZOS)
            cell.paste(scaled,((W-scaled.width)//2,68))
            # show y-axis scale for reviewers, including exact y of red lines
            draw=ImageDraw.Draw(cell)
            draw.text((13,H-50),f'Figure page source area, red rectangle = pre-existing crop',font=SMALL,fill=(165,0,0))
            draw.text((13,H-28),f'PDF url: {f["pdf"]}',font=SMALL,fill=(60,60,60))
            cells.append(cell)
        cols=2
        rows=math.ceil(len(cells)/cols)
        canvas=Image.new('RGB',(cols*W,rows*H),(232,232,232))
        for i,c in enumerate(cells):
            canvas.paste(c,((i%cols)*W,(i//cols)*H))
        canvas.save(SHEETS/(slug+'.jpg'),quality=79,optimize=True,subsampling=0)
        print(f'SHEET {slug} pages={len(doc)} figures={len(figs)} output={(SHEETS/(slug+".jpg")).stat().st_size}',flush=True)
