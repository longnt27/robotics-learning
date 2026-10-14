#!/usr/bin/env python3
"""Render only visually approved coordinates from original paper PDFs.

This script DOES NOT detect, infer, resize, extend, or choose crop boundaries.
A human reviewer inspected the original source pages and recorded each exact
rectangle in content/manually-reviewed-figure-boxes.json.
"""
from __future__ import annotations

import argparse
from io import BytesIO
import json
import os
from pathlib import Path
import tempfile
import time
from urllib.request import Request, urlopen

import fitz
from PIL import Image, ImageStat

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"content/paper-figures.json"
DECISIONS=ROOT/"content/manually-reviewed-figure-boxes.json"
IMAGE_ROOT=ROOT/"public"
REPORTS=ROOT/"docs"/"figure-crop-manual-review"
PDF_CACHE=Path(tempfile.gettempdir())/"robotics-papers-manual-review-pdf-cache"
SCALE=3.6


def source_pdf(url: str, slug: str) -> Path:
    """The exact PDF in the manifest, never a different edition."""
    PDF_CACHE.mkdir(parents=True,exist_ok=True)
    cache=PDF_CACHE/(slug+".pdf")
    if cache.exists() and cache.stat().st_size>25000:
        return cache
    error=None
    for attempt in range(4):
        try:
            req=Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; RoboticsFigureReview/1.0)",
                                     "Accept":"application/pdf"})
            with urlopen(req,timeout=125) as response:
                content=response.read(120*1024*1024)
            if content[:5]!=b"%PDF-":
                raise ValueError("Endpoint did not return a PDF")
            cache.write_bytes(content)
            return cache
        except Exception as exc:
            error=exc
            time.sleep(3+3*attempt)
    raise RuntimeError(f"Cannot fetch original source PDF for {slug}: {error}")


def render_approved(page: fitz.Page, coords: list[float], output:Path) -> tuple[int,int,int]:
    """Mechanical rendering only. Exact coordinates are author-reviewed."""
    if len(coords)!=4 or not all(isinstance(x,(int,float)) for x in coords):
        raise ValueError("Expected manually chosen [x0,y0,x1,y1]")
    rect=fitz.Rect(coords)
    if not rect.is_valid or rect.is_empty or not page.rect.contains(rect):
        raise ValueError(f"Manually selected rectangle outside source page: {coords} of {page.rect}")
    pix=page.get_pixmap(matrix=fitz.Matrix(SCALE,SCALE),clip=rect,
                         alpha=False,colorspace=fitz.csRGB)
    im=Image.open(BytesIO(pix.tobytes("png"))).convert("RGB")
    if im.width<150 or im.height<150 or max(ImageStat.Stat(im).stddev)<8:
        raise ValueError(f"Invalid hand-chosen crop image: {output}")
    im.thumbnail((2300,2600),Image.Resampling.LANCZOS)
    output.parent.mkdir(parents=True,exist_ok=True)
    im.save(output,"WEBP",quality=93,method=5)
    return im.width,im.height,output.stat().st_size


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--paper",required=True)
    args=parser.parse_args()
    data=json.loads(MANIFEST.read_text(encoding="utf-8"))
    decisions=json.loads(DECISIONS.read_text(encoding="utf-8"))
    slug=args.paper
    if slug not in data or slug not in decisions["papers"]:
        parser.error(f"Unknown paper: {slug}")
    instructions=decisions["papers"][slug]
    if instructions["reviewed_all_figures"] is not True:
        raise ValueError(f"{slug}: not yet reviewed")
    overrides=instructions["overrides"]
    figures=data[slug]
    assert figures
    numbers={str(f["number"]) for f in figures}
    if not set(overrides).issubset(numbers):
        raise ValueError(f"Unknown figure reference in {slug}: {set(overrides)-numbers}")
    sources={f["pdf"] for f in figures}
    if len(sources)!=1:
        raise RuntimeError(f"{slug} uses multiple PDF editions")
    pdf_url=next(iter(sources))
    report=[
        f"# Visually reviewed figure crops: {slug}","",
        "Decision source: direct visual inspection of the original PDF pages.",
        "The script was used **only** to render manually selected coordinates.",
        "It never automatically expands, trims, or determines figure boundaries.","",
        f"Source: {pdf_url}","",
        "| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |",
        "| --- | ---: | --- | --- | --- | --- |",
    ]
    changed=0
    with fitz.open(source_pdf(pdf_url,slug)) as doc:
        for figure in figures:
            number=figure["number"]
            page_no=figure["page"]
            expected=f"/paper-figures/{slug}/figure-{number}.webp"
            if figure["image"]!=expected:
                raise ValueError(f"Unexpected image reference: {figure['image']}")
            old=list(figure["bbox"])
            reviewed=overrides.get(str(number))
            if reviewed is None:
                coords=old
                decision="Inspected; source crop retained"
                explanation="Existing rectangle contains the whole figure in source preview."
            else:
                coords=reviewed["bbox"]
                decision="Manually recut"
                explanation=reviewed["why"]
                output=IMAGE_ROOT/figure["image"].lstrip("/")
                if page_no<1 or page_no>len(doc):
                    raise ValueError(f"Wrong source page {page_no} for {slug}/{number}")
                width,height,size=render_approved(doc[page_no-1],coords,output)
                figure.update({"bbox":[round(c,1) for c in coords],
                               "width":width,"height":height,"bytes":size})
                changed+=1
            report.append(
                f"| {number} | {page_no} | {decision} | "
                f"{', '.join(str(x) for x in old)} | "
                f"{', '.join(str(x) for x in coords)} | {explanation} |"
            )
            print(f"{slug} FIG {number}: {decision} "
                  f"page={page_no} rect={coords}",flush=True)
    REPORTS.mkdir(parents=True,exist_ok=True)
    report += ["",f"Total visually audited: {len(figures)}. Rectangles manually corrected: {changed}.",
               f"Original figure paths and original/translated captions were preserved.", ""]
    (REPORTS/(slug+".md")).write_text("\n".join(report),encoding="utf-8")
    MANIFEST.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"PASS: {slug}: reviewed {len(figures)}; manually adjusted {changed}",flush=True)


if __name__=="__main__":
    main()
