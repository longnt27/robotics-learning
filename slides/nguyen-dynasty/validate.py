#!/usr/bin/env python3
"""Verify source attribution, notes, media, animation references, and slide count."""
from pathlib import Path
from zipfile import ZipFile
from lxml import etree
from pptx import Presentation
import json,subprocess
ROOT=Path(__file__).resolve().parent
p=ROOT/'out'/'Viet_Nam_Thoi_Nha_Nguyen_15_Slides_REAL_PHOTOS.pptx'
prs=Presentation(p)
assert len(prs.slides)==15,len(prs.slides)
credits=json.loads((ROOT/'assets'/'credits.json').read_text())['assets']
assert len(credits)>=2 and any(x in credits for x in ('ngo_mon','hue_citadel'))
for i,s in enumerate(prs.slides,1):
    assert s.has_notes_slide,f'No notes on {i}'
    assert '[Sources]' in s.notes_slide.notes_text_frame.text,f'No sources on {i}'
    for sh in s.shapes:
        if sh.has_text_frame and sh.text.strip():
            assert sh.left>=0 and sh.top>=0,f'out of bounds {i}'
            assert sh.left+sh.width<=prs.slide_width+10000,f'out of bounds {i}'
            assert sh.top+sh.height<=prs.slide_height+10000,f'out of bounds {i}'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
with ZipFile(p) as z:
    assert z.testzip() is None
    for i in range(1,16):
        r=etree.fromstring(z.read(f'ppt/slides/slide{i}.xml'))
        spids={int(x.get('id')) for x in r.findall('.//{'+P+'}cNvPr')}
        for x in r.findall('.//{'+P+'}spTgt'):
            assert int(x.get('spid')) in spids,(i,x.get('spid'))
        assert r.findall('.//{'+P+'}transition'),f'missing transition on slide {i}'
        names={int(x.get('id')):x.get('name','') for x in r.findall('.//{'+P+'}cNvPr')}
        animated={int(x.get('spid')) for x in r.findall('.//{'+P+'}spTgt')}
        for sid,name in names.items():
            if name.startswith('CLICK_'):
                assert sid in animated,f'click-group component missing animation: slide {i}, {name}'
        if i in (3,15):
            ns15='http://schemas.microsoft.com/office/powerpoint/2015/09/main'
            assert len(r.findall('.//{'+ns15+'}morph'))==1,f'missing Morph: slide {i}'
            mc='http://schemas.openxmlformats.org/markup-compatibility/2006'
            assert r.find('{'+mc+'}AlternateContent') is not None,f'missing Morph fallback: {i}'
audit=json.loads((ROOT/'out'/'image_composition_audit.json').read_text())
assert audit and len(audit)>=12,'missing composition audit'
assert sum(x['mode']=='cover' for x in audit)==1,'unexpected documentary image crop'
assert all(x['mode']=='preserve' or (x['slide']==1 and x['decorative']) for x in audit)
assert any(x['key']=='tourane_1858' and x['slide']==11 for x in audit)
for s in prs.slides:
    texts=' '.join(sh.text for sh in s.shapes if sh.has_text_frame)
    assert 'không phải ảnh chiến sự' not in texts
print('PASS: 15 slides, notes, image-preserving compositions, grouped clicks and native Morph')
out=ROOT/'out'
subprocess.run(['libreoffice','-env:UserInstallation=file:///tmp/lo-nguyen','--headless','--convert-to','pdf','--outdir',str(out),str(p)],check=True,timeout=90)
pdf=p.with_suffix('.pdf')
assert pdf.exists() and pdf.stat().st_size>25000
print('PASS: LibreOffice PDF render',pdf.stat().st_size)
