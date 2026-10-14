#!/usr/bin/env python3
"""Audit and re-cut every existing source-paper figure with PDF-aware boundaries.

Run once per paper:
    python scripts/audit_recut_paper_figures.py --paper act

Preserves English/Vietnamese captions, source PDF URLs, page numbers, and
existing Markdown image paths. Fails closed on missing/invalid source PDFs.
"""
from __future__ import annotations

import argparse
from io import BytesIO
import json
import math
import re
from pathlib import Path

import fitz
import numpy as np
from PIL import Image, ImageStat
from extract_paper_figures import ROOT, MANIFEST, download_pdf

PUBLIC = ROOT / "public"
REPORTS = ROOT / "docs" / "figure-crop-audit"
CACHE = Path("/tmp/robotics-figure-completeness-pdfs")
SCALE = 3.6
MAX_EXPAND_TOP = 260
MAX_EXPAND_BOTTOM = 225


def exact_caption_label(page: fitz.Page, figure: dict) -> fitz.Rect | None:
    number = figure["number"]
    caption = figure.get("caption", "").strip()
    candidate_phrases = [
        f"Figure {number}.", f"Figure {number}:", f"Fig. {number}.",
        f"Fig. {number}:", f"FIGURE {number}.",
    ]
    pattern = re.match(r"^(?:Figure|Fig\.)\s*\d+\s*[:.]", caption, re.I)
    if pattern:
        candidate_phrases.insert(0, pattern.group())
    old_bottom = float(figure["bbox"][3])
    found = []
    for phrase in dict.fromkeys(candidate_phrases):
        for box in page.search_for(phrase):
            # The source caption follows the figure. Ignore far-away mentions.
            if old_bottom - 45 <= box.y0 <= old_bottom + MAX_EXPAND_BOTTOM + 12:
                found.append(box)
    if not found:
        return None
    # Prefer a literal caption at a line start, not a body-text citation.
    blocks = page.get_text("dict").get("blocks", [])
    def score(box):
        line_start = False
        font_bonus = 0
        for block in blocks:
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                spans = line.get("spans", [])
                if not spans:
                    continue
                b = fitz.Rect(line["bbox"])
                if abs(b.y0 - box.y0) < 4.5 and abs(b.x0 - box.x0) < 8:
                    line_start = True
                    font_bonus = int("bold" in spans[0].get("font", "").lower())
        return (0 if line_start else 1, abs(box.y0-old_bottom), -font_bonus)
    return min(found, key=score)


def known_caption_floor(page: fitz.Page, figure: dict, siblings: list[dict]) -> float:
    old = fitz.Rect(figure["bbox"])
    floor = page.rect.y0 + 18
    for other in siblings:
        if other is figure or other["page"] != figure["page"]:
            continue
        other_rect = fitz.Rect(other["bbox"])
        # Do not cross an earlier caption from the same occupied column.
        overlap = max(0, min(old.x1, other_rect.x1)-max(old.x0,other_rect.x0))
        if overlap < min(old.width, other_rect.width)*0.52:
            continue
        label = exact_caption_label(page, other)
        if label is None or label.y0 >= old.y0:
            continue
        cap_text = other.get("caption", "")
        # Conservative estimate of caption paragraph height, never the entire
        # PDF text block: those sometimes contain the next figure as well.
        estimated = min(102, 12 + math.ceil(len(cap_text)/105)*11)
        floor = max(floor, min(label.y0+estimated+3, old.y0-1))
    return floor


def image_anchors(page: fitz.Page, old: fitz.Rect, label_y: float) -> list[fitz.Rect]:
    anchors = []
    for info in page.get_image_info():
        box = fitz.Rect(info["bbox"])
        if box.is_empty or box.width < 30 or box.height < 16:
            continue
        if box.height > page.rect.height*.91:
            continue
        overlap_x = max(0, min(box.x1,old.x1)-max(box.x0,old.x0))
        if overlap_x < min(box.width, old.width)*0.48:
            continue
        # Raster figures may be made of stacked panels with small gaps.
        intersects = box.y0 < old.y1+8 and box.y1 > old.y0-33
        if not intersects or box.y0 >= label_y:
            continue
        anchors.append(box)
    return anchors


def vector_crossings(page: fitz.Page, old: fitz.Rect) -> list[fitz.Rect]:
    crosses = []
    for path in page.get_drawings():
        box = fitz.Rect(path["rect"])
        if box.is_empty or box.width < 12 or box.height < 8:
            continue
        overlap_x = max(0, min(box.x1,old.x1)-max(box.x0,old.x0))
        if overlap_x < min(box.width,old.width)*.50:
            continue
        # Only vectors that physically cross the old top/right/left boundary
        # are evidence of clipped artwork, not unrelated body content.
        vertical = box.y0 < old.y0+3 and box.y1 > old.y0+3
        side = box.y0 < old.y1 and box.y1 > old.y0 and (
            (box.x0 < old.x0+2 < box.x1) or
            (box.x0 < old.x1-2 < box.x1)
        )
        if vertical or side:
            crosses.append(box)
    return crosses


def ink_stats(page: fitz.Page, rect: fitz.Rect, scale: float = 1.5):
    rect &= page.rect
    if rect.is_empty:
        return None
    pix = page.get_pixmap(matrix=fitz.Matrix(scale,scale), clip=rect,
                          colorspace=fitz.csGRAY, alpha=False)
    pixels = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height,pix.width)
    row_density = (pixels < 231).mean(axis=1)
    return row_density, rect.y0, scale


def find_figure_start(page: fitz.Page, old: fitz.Rect, floor: float) -> tuple[float, str]:
    """Find preceding full-width whitespace only when old top cuts through ink."""
    if old.y0 - floor < 10:
        return old.y0, "top-margin"
    area = fitz.Rect(old.x0, max(floor,old.y0-MAX_EXPAND_TOP), old.x1, old.y0+13)
    result = ink_stats(page, area, scale=2)
    if result is None:
        return old.y0, "no-ink-data"
    rows, y0, scale = result
    boundary = int((old.y0-y0)*scale)
    width = len(rows)
    lo, hi = max(0,boundary-13), min(width,boundary+13)
    ink_above = float(np.mean(rows[lo:boundary])) if boundary>lo else 0
    ink_below = float(np.mean(rows[boundary:hi])) if hi>boundary else 0
    # A clean whitespace strip at the old boundary indicates no cut.
    if ink_above < .0035 or ink_below < .0035:
        return old.y0, "clean-top-border"
    # Search up for whitespace at least 8pt tall. Body text interline
    # whitespace is typically ~2-4pt; a longer break indicates separation.
    active = rows[:boundary]
    is_clear = active < .0025
    gaps = []
    end = None
    for i in range(len(is_clear)-1,-1,-1):
        if is_clear[i] and end is None:
            end = i+1
        elif not is_clear[i] and end is not None:
            if end-(i+1) >= 16:
                gaps.append((i+1,end))
            end = None
    if end is not None and end >= 16:
        gaps.append((0,end))
    # First good gap ascending in distance from original cut.
    for start,end in gaps:
        candidate = y0 + end/scale - 3
        if candidate < old.y0-3 and candidate >= floor:
            return candidate, "ink-continuity-expanded"
    return max(floor,old.y0-65), "no-whitespace-break-review"


def choose_recut(page: fitz.Page, figure: dict, siblings: list[dict]):
    old = fitz.Rect(figure["bbox"])
    label = exact_caption_label(page, figure)
    label_y = label.y0 if label else old.y1 + 5
    floor = known_caption_floor(page,figure,siblings)
    evidence = []
    top, reason = find_figure_start(page, old, floor)
    evidence.append(reason)
    anchors = image_anchors(page,old,label_y)
    for anchor in anchors:
        if anchor.y0 < old.y0 - 3 and anchor.y1 > old.y0-34:
            top = min(top,anchor.y0-10)
            evidence.append("recovered-source-raster")
    crossing = vector_crossings(page,old)
    for box in crossing:
        if box.y0 < old.y0-3:
            top = min(top,box.y0-7)
            evidence.append("recovered-source-vector")
    # The caption's literal label is authoritative when a PDF parser merges
    # figure lettering into its text block.
    bottom = min(label_y-3, page.rect.y1-12)
    if bottom > old.y1+2:
        evidence.append("restored-bottom-before-caption")
    elif bottom < old.y1-2:
        evidence.append("excluded-caption")
    else:
        bottom = old.y1
    if bottom < old.y1-35 and "excluded-caption" in evidence:
        evidence.append("caption-position-review")
    top = min(old.y0,top)
    top = max(top, floor, old.y0-MAX_EXPAND_TOP)
    if bottom <= top+52:
        # This must never replace a valid figure with a collapsed crop.
        raise ValueError(f"Figure {figure['number']}: invalid crop {top:.1f}..{bottom:.1f}")
    left,right = old.x0,old.x1
    # Recover source artwork crossing a fixed column crop edge.
    for box in anchors+crossing:
        if box.y1 < top or box.y0 > bottom:
            continue
        if box.x0 < left+2 and box.x1 > left:
            left = min(left,box.x0-5)
            evidence.append("restored-left")
        if box.x1 > right-2 and box.x0 < right:
            right = max(right,box.x1+5)
            evidence.append("restored-right")
    left = max(page.rect.x0+11,left)
    right = min(page.rect.x1-11,right)
    result = fitz.Rect(left,top,right,bottom)
    if not page.rect.contains(result):
        raise ValueError(f"Figure {figure['number']}: crop outside PDF page")
    if label and result.y1 >= label.y0 - .5:
        raise ValueError(f"Figure {figure['number']}: crop swallowed its caption label")
    # Tiny changes from rounding should not destabilize content.
    if max(abs(a-b) for a,b in zip(old,result))<1.5:
        result=old
    return result,sorted(set(evidence)),label_y


def render_figure(page: fitz.Page, rect: fitz.Rect, dest: Path):
    pix = page.get_pixmap(matrix=fitz.Matrix(SCALE,SCALE),clip=rect,
                          colorspace=fitz.csRGB,alpha=False)
    picture = Image.open(BytesIO(pix.tobytes("png"))).convert("RGB")
    if picture.width<180 or picture.height<170:
        raise ValueError(f"Tiny figure image {picture.size}")
    if max(ImageStat.Stat(picture).stddev)<8:
        raise ValueError("Source crop is blank")
    picture.thumbnail((2300,2600),Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True,exist_ok=True)
    picture.save(dest,"WEBP",quality=90,method=5)
    if dest.stat().st_size>700000:
        picture.save(dest,"WEBP",quality=84,method=5)
    return picture.width,picture.height,dest.stat().st_size


def recovered_words(page: fitz.Page, old: fitz.Rect, recut: fitz.Rect):
    n=0
    for x0,y0,x1,y1,*_ in page.get_text("words"):
        token=fitz.Rect(x0,y0,x1,y1)
        if recut.contains(token) and not old.contains(token):
            n+=1
    return n


def process_paper(slug: str, figures: list[dict]):
    pdf_urls = {f["pdf"] for f in figures}
    if len(pdf_urls)!=1:
        raise RuntimeError(f"{slug}: paper uses {len(pdf_urls)} distinct PDF versions")
    pdf_url = next(iter(pdf_urls))
    CACHE.mkdir(parents=True,exist_ok=True)
    pdf_path=CACHE/(slug+".pdf")
    download_pdf(pdf_url,pdf_path)
    per_paper=[]
    with fitz.open(pdf_path) as document:
        for figure in figures:
            number=figure["number"]
            original=fitz.Rect(figure["bbox"])
            page_index=figure["page"]-1
            if page_index<0 or page_index>=len(document):
                raise ValueError(f"{slug}/{number}: invalid PDF source page")
            page=document[page_index]
            new,why,label_y=choose_recut(page,figure,figures)
            src=figure["image"]
            expected=f"/paper-figures/{slug}/figure-{number}.webp"
            if src!=expected:
                raise ValueError(f"{slug}/{number}: path mismatch {src}")
            dest=PUBLIC/src.lstrip("/")
            width,height,bytes_=render_figure(page,new,dest)
            was_changed=any(abs(a-b)>1.5 for a,b in zip(original,new))
            words=recovered_words(page,original,new)
            figure.update({
                "bbox":[round(n,1) for n in new],
                "width":width,"height":height,"bytes":bytes_,
            })
            per_paper.append((number,figure["page"],original,new,words,why,bytes_))
            print(f"AUDIT {slug} Fig.{number}: page={figure['page']} "
                  f"old={tuple(round(v,1) for v in original)} "
                  f"new={tuple(round(v,1) for v in new)} "
                  f"recovered_words={words} reasons={','.join(why)} "
                  f"changed={was_changed}",flush=True)
    report=[
        f"# Figure crop audit: {slug}",
        "",
        "All source figures for this paper were re-rendered directly from the",
        "original PDF at the recorded page and coordinates. Figure captions,",
        "translations, and Markdown references were preserved.",
        "",
        f"Source PDF: {pdf_url}",
        "",
        f"Verified figures: {len(per_paper)}",
        "",
        "| Figure | PDF page | Old (x0,y0,x1,y1) | New (x0,y0,x1,y1) | Newly included PDF words | Crop notes |",
        "| --- | ---: | --- | --- | ---: | --- |",
    ]
    for n,p,old,new,words,why,size in per_paper:
        old_str=", ".join(f"{v:.1f}" for v in old)
        new_str=", ".join(f"{v:.1f}" for v in new)
        report.append(f"| {n} | {p} | {old_str} | {new_str} | {words} | {', '.join(why)} |")
    report += [
        "",
        "Quality checks: each output is a nonempty WebP raster of the cited PDF;",
        "the crop is constrained to its source page, stops above the source",
        "caption label when located, and is prevented from overlapping known",
        "preceding captions in the same column. Original paths and text survive.",
        "",
        "Automated geometry checks cannot guarantee visual perfection for vector",
        "figures or unusually complex multicolumn layouts. Review the output",
        "images against the cited PDF if any edge-content issue remains.",
        "",
    ]
    REPORTS.mkdir(parents=True,exist_ok=True)
    (REPORTS/(slug+".md")).write_text("\n".join(report),encoding="utf-8")
    return per_paper


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--paper",required=True)
    args=parser.parse_args()
    manifest=json.loads(MANIFEST.read_text(encoding="utf-8"))
    slug=args.paper
    if slug not in manifest:
        parser.error(f"No manifest for paper {slug}")
    originals=[(f["number"],f["page"],f["image"],f["caption"],f.get("caption_vi"))
               for f in manifest[slug]]
    rows=process_paper(slug,manifest[slug])
    assert len(rows)==len(originals)>0
    assert originals==[(f["number"],f["page"],f["image"],f["caption"],f.get("caption_vi"))
                       for f in manifest[slug]],"Original source provenance changed"
    MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"DONE {slug}: audited and regenerated {len(rows)} figures",flush=True)


if __name__=="__main__":
    main()
