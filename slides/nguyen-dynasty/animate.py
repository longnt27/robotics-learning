#!/usr/bin/env python3
"""Patch PptxGenJS output with semantic click groups and selective native Morph."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree
import re,sys
P=Path(__file__).resolve().parent
BASE=P/"out"/"Viet_Nam_Thoi_Nha_Nguyen_15_Slides_REAL_PHOTOS_base.pptx"
OUT=P/"out"/"Viet_Nam_Thoi_Nha_Nguyen_15_Slides_REAL_PHOTOS.pptx"
NS='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
P14='http://schemas.microsoft.com/office/powerpoint/2010/main'
P159='http://schemas.microsoft.com/office/powerpoint/2015/09/main'
MC='http://schemas.openxmlformats.org/markup-compatibility/2006'
etree.register_namespace('p',NS)
def tag(n):return '{'+NS+'}'+n
def el(n,**attrs):return etree.Element(tag(n),**attrs)
MORPH={3:1600,15:1800} # Match specifically named photos; do NOT force Morph in every slide
def timing(groups):
    root=el('timing');lst=etree.SubElement(root,tag('tnLst'))
    par=etree.SubElement(lst,tag('par'));tm=etree.SubElement(par,tag('cTn'),id='1',dur='indefinite',restart='never',nodeType='tmRoot')
    children=etree.SubElement(tm,tag('childTnLst'))
    seq=etree.SubElement(children,tag('seq'),concurrent='1',nextAc='seek')
    main=etree.SubElement(seq,tag('cTn'),id='2',dur='indefinite',nodeType='mainSeq')
    mainchild=etree.SubElement(main,tag('childTnLst'))
    stepid=3
    for index,ids in enumerate(groups):
        # each group owns one click; each shape in that group starts together
        outer=etree.SubElement(mainchild,tag('par'))
        condnode=etree.SubElement(outer,tag('cTn'),id=str(stepid),fill='hold')
        stepid+=1
        cond=etree.SubElement(condnode,tag('stCondLst'))
        if index==0:
            etree.SubElement(cond,tag('cond'),delay='indefinite')
            t=etree.SubElement(cond,tag('cond'),evt='onBegin',delay='0')
            etree.SubElement(t,tag('tn'),val='2')
        else:
            etree.SubElement(cond,tag('cond'),delay='indefinite')
        child=etree.SubElement(condnode,tag('childTnLst'))
        for shapeid in ids:
            part=etree.SubElement(child,tag('par'))
            ct=etree.SubElement(part,tag('cTn'),id=str(stepid),dur='470',fill='hold',nodeType='withEffect',grpId=str(stepid),presetID='9',presetClass='entr',presetSubtype='0')
            stepid+=1; st=etree.SubElement(ct,tag('stCondLst'));etree.SubElement(st,tag('cond'),delay='0')
            childlist=etree.SubElement(ct,tag('childTnLst'))
            setter=etree.SubElement(childlist,tag('set'));cb=etree.SubElement(setter,tag('cBhvr'))
            c=etree.SubElement(cb,tag('cTn'),id=str(stepid),dur='1',fill='hold');stepid+=1
            st=etree.SubElement(c,tag('stCondLst'));etree.SubElement(st,tag('cond'),delay='0')
            target=etree.SubElement(cb,tag('tgtEl'));etree.SubElement(target,tag('spTgt'),spid=str(shapeid))
            an=etree.SubElement(cb,tag('attrNameLst'));etree.SubElement(an,tag('attrName')).text='style.visibility'
            to=etree.SubElement(setter,tag('to'));etree.SubElement(to,tag('strVal'),val='visible')
            effect=etree.SubElement(childlist,tag('animEffect'),transition='in',filter='fade')
            cb=etree.SubElement(effect,tag('cBhvr'));etree.SubElement(cb,tag('cTn'),id=str(stepid),dur='470');stepid+=1
            target=etree.SubElement(cb,tag('tgtEl'));etree.SubElement(target,tag('spTgt'),spid=str(shapeid))
    for typ in ('prev','next'):
        c=etree.SubElement(seq,tag(typ+'CondLst'))
        v=etree.SubElement(c,tag('cond'),evt=('onPrev' if typ=='prev' else 'onNext'),delay='0')
        tgt=etree.SubElement(v,tag('tgtEl'));etree.SubElement(tgt,tag('sldTgt'))
    return root
with ZipFile(BASE) as src, ZipFile(OUT,'w',ZIP_DEFLATED) as dst:
    for file in src.infolist():
        data=src.read(file.filename)
        mat=re.fullmatch(r'ppt/slides/slide(\d+).xml',file.filename)
        if not mat:
            dst.writestr(file,data);continue
        n=int(mat.group(1)); r=etree.fromstring(data)
        allnames={}
        for shp in r.findall('.//'+tag('sp'))+r.findall('.//'+tag('pic')):
            cn=shp.find('.//'+tag('cNvPr'))
            if cn is not None:
                allnames[int(cn.get('id'))]=cn.get('name','')
        groups={}
        automatic=[]
        for id,name in allnames.items():
            if name.startswith('AUTO_G0_'):
                automatic.append(id)
            if not name.startswith('CLICK_G'):continue
            m=re.match(r'CLICK_(G\d+)_',name)
            if m:groups.setdefault(int(m.group(1)[1:]),[]).append(id)
        old=r.find(tag('timing'))
        if old is not None:r.remove(old)
        if groups or automatic:
            # Automatic Fade on slide entry for the first content unit.
            # Every later group is one complete presenter-controlled click.
            ordered=[groups[i] for i in sorted(groups)]
            r.append(timing([automatic]+ordered))
        old=r.find(tag('transition'))
        if old is not None:r.remove(old)
        if n in MORPH:
            # A native Microsoft PowerPoint Morph transition with a Fade
            # fallback for incompatible presentation software.
            tr=etree.Element('{'+MC+'}AlternateContent',nsmap={'mc':MC})
            choice=etree.SubElement(tr,'{'+MC+'}Choice',nsmap={'p159':P159})
            choice.set('Requires','p159')
            native=etree.SubElement(choice,tag('transition'),spd='slow',advClick='1')
            native.set('{'+P14+'}dur',str(MORPH[n]))
            etree.SubElement(native,'{'+P159+'}morph',option='byObject')
            fallback=etree.SubElement(tr,'{'+MC+'}Fallback')
            fade=etree.SubElement(fallback,tag('transition'),spd='med',advClick='1')
            etree.SubElement(fade,tag('fade'))
        else:
            tr=el('transition',spd='med',advClick='1')
            tr.set('{'+P14+'}dur','650')
            etree.SubElement(tr,tag('fade'))
        # PowerPoint root elements: transition precedes timing
        timingnode=r.find(tag('timing'))
        if timingnode is not None:r.insert(list(r).index(timingnode),tr)
        else:r.append(tr)
        dst.writestr(file,etree.tostring(r,encoding='UTF-8',xml_declaration=True,standalone=True))
with ZipFile(OUT) as z:
    for n in range(1,16):
        r=etree.fromstring(z.read(f'ppt/slides/slide{n}.xml'))
        count=len(r.findall('.//'+tag('cTn')+'[@nodeType="withEffect"]'))
        print(f'Slide {n:02d}: {count} matched click-group objects, transition', 'Morph' if n in MORPH else 'Fade')
print('Generated:',OUT)
