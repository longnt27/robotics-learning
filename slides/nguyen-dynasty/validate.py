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
# Production layout checks for the entire 15-slide deck.
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE_TYPE
from collections import defaultdict
import re

EMU=914400
def get_text(slide,value):
    found=[sh for sh in slide.shapes if sh.has_text_frame and sh.text.strip()==value]
    assert len(found)==1,(value,len(found))
    return found[0]
def verify_center(slide_number,value,expected):
    sh=get_text(prs.slides[slide_number-1],value)
    assert sh.text_frame.paragraphs[0].alignment==PP_ALIGN.CENTER,(slide_number,value,"not centered")
    actual=(sh.left+sh.width/2)/EMU
    assert abs(actual-expected)<=0.065,(slide_number,value,round(actual,3),expected)
for value in [
    'LỤC BỘ','SƠ ĐỒ LƯỢC GIẢN CÁC THIẾT CHẾ',
    'HOÀNG ĐẾ   /   TRIỀU ĐÌNH TRUNG ƯƠNG',
    '30 TỈNH   +   PHỦ THỪA THIÊN'
]:
    verify_center(5,value,8.38)
for value in ['LẠI','HỘ','LỄ','BINH','HÌNH','CÔNG']:
    sh=get_text(prs.slides[4],value)
    assert sh.text_frame.paragraphs[0].alignment==PP_ALIGN.CENTER,(5,value)
verify_center(2,'1802    →    1858    →    1884    →    1945',6.67)
verify_center(12,'NAM KỲ: THUỘC ĐỊA     •     BẮC & TRUNG KỲ: BẢO HỘ',6.645)

def bounds(shape):
    return tuple(v/EMU for v in (shape.left,shape.top,shape.left+shape.width,shape.top+shape.height))
def intersection(a,b):
    return max(0,min(a[2],b[2])-max(a[0],b[0]))*max(0,min(a[3],b[3])-max(a[1],b[1]))
for no,slide in enumerate(prs.slides,1):
    texts=[sh for sh in slide.shapes if sh.has_text_frame and sh.text.strip()]
    photos=[sh for sh in slide.shapes if sh.shape_type==MSO_SHAPE_TYPE.PICTURE]
    for i,a in enumerate(texts):
        for b in texts[i+1:]:
            assert intersection(bounds(a),bounds(b))<0.004,(no,a.text[:45],b.text[:45],"overlapping text")
    if no!=1:
        for ph in photos:
            for txtsh in texts:
                assert intersection(bounds(ph),bounds(txtsh))<0.18,(no,txtsh.text[:50],"photo/text overlap")

# The three-card layouts share symmetric side margins and equal gaps.
for no,backgrounds in [
    (2,['STATIC_panel','CLICK_G1_panel','CLICK_G2_panel']),
    (6,['AUTO_G0_background','CLICK_G1_background','CLICK_G2_background'])
]:
    slide=prs.slides[no-1]
    cards=[]
    for name in backgrounds:
        found=[sh for sh in slide.shapes if sh.name==name]
        assert len(found)==1,(no,name,len(found))
        cards.append(found[0])
    cards.sort(key=lambda sh:sh.left)
    margin_left=cards[0].left/EMU
    margin_right=(prs.slide_width-cards[-1].left-cards[-1].width)/EMU
    gaps=[(cards[i+1].left-cards[i].left-cards[i].width)/EMU for i in range(2)]
    assert abs(margin_left-margin_right)<0.10,(no,margin_left,margin_right)
    assert abs(gaps[0]-gaps[1])<0.01,(no,gaps)
    assert len({int(sh.width) for sh in cards})==1,(no,"card widths not equal")

# Check that every semantic unit is a single timing step; automatic
# first groups share a common entry trigger, remaining groups each wait
# for one click, and the number of cues matches Presenter Notes.
for no,slide in enumerate(prs.slides,1):
    xml=etree.fromstring(ZipFile(p).read(f'ppt/slides/slide{no}.xml'))
    lookup={int(n.get('id')):n.get('name','') for n in xml.findall('.//{'+P+'}cNvPr')}
    auto={sid for sid,name in lookup.items() if name.startswith('AUTO_G0_')}
    clicks=defaultdict(set)
    for sid,name in lookup.items():
        match=re.match(r'CLICK_G(\d+)_',name)
        if match: clicks[int(match.group(1))].add(sid)
    cues=re.findall(r'Click \d+:',slide.notes_slide.notes_text_frame.text)
    assert len(cues)==len(clicks),(no,"speaker notes click mismatch",len(cues),len(clicks))
    sequence=xml.find('.//{'+P+'}cTn[@nodeType="mainSeq"]')
    if auto or clicks:
        assert sequence is not None,(no,"animation sequence missing")
        steps=sequence.find('{'+P+'}childTnLst').findall('{'+P+'}par')
        assert len(steps)==1+len(clicks),(no,"wrong number of timing steps")
        expected=[auto]+[clicks[key] for key in sorted(clicks)]
        for index,(step,ids) in enumerate(zip(steps,expected)):
            got={int(t.get('spid')) for t in step.findall('.//{'+P+'}spTgt')}
            assert got==ids,(no,index,"shape group mismatch",got^ids)
            starts=step.findall('.//{'+P+'}cond[@evt="onBegin"]')
            assert bool(starts)==(index==0),(no,index,"incorrect start trigger")
            for effect in step.findall('.//{'+P+'}animEffect'):
                assert effect.get('filter')=='fade',(no,"inconsistent effect")
    else:
        assert sequence is None,(no,"unexpected animation sequence")
# Explicitly keep every item of slide 13's Tân Sở card in the same group.
right_card=prs.slides[12]
assert len([sh for sh in right_card.shapes if sh.name.startswith('CLICK_G1_')])==4
print('PASS: optical alignment, text and image clearance, card spacing, cue order, and 15-slide animation consistency')
print('PASS: 15 slides, notes, image-preserving compositions, grouped clicks and native Morph')
out=ROOT/'out'
subprocess.run(['libreoffice','-env:UserInstallation=file:///tmp/lo-nguyen','--headless','--convert-to','pdf','--outdir',str(out),str(p)],check=True,timeout=90)
pdf=p.with_suffix('.pdf')
assert pdf.exists() and pdf.stat().st_size>25000
print('PASS: LibreOffice PDF render',pdf.stat().st_size)
