#!/usr/bin/env python3
"""Remove preceding figure captions accidentally included in adjacent PDF crops.

PDF text sometimes merges a chart's lettering and its caption into a single text
block. The normal caption-block bounding box can therefore overlap the next
figure's actual drawing. Anchor on the literal caption label instead, and
exclude the previous caption's estimated text extent from the next crop.
Never alter source English, Vietnamese translations, or PDF page provenance.
"""
from __future__ import annotations

from io import BytesIO
import json
import math
import re
from pathlib import Path

import fitz
from PIL import Image, ImageStat
from extract_paper_figures import ROOT, MANIFEST, ASSETS, download_pdf

CACHE = Path("/tmp/robotics-figure-crop-cache")


def caption_label(caption: str) -> str | None:
    match = re.match(r"(?i)(Figure|Fig\.)\s*\d+\s*[:.]", caption.strip())
    return match.group(0).strip() if match else None


def find_label_y(page, figure: dict) -> float | None:
    label = caption_label(figure["caption"])
    if not label:
        return None
    found = page.search_for(label)
    if not found:
        return None
    # The image crop ends directly before its own caption label.
    # If a figure is mentioned in the body, the nearest text to the image
    # boundary is much likelier to be the actual caption.
    expected = figure["bbox"][3]
    return min(found, key=lambda r: abs(r.y0-expected)).y0


def main() -> None:
    CACHE.mkdir(exist_ok=True)
    data = json.loads(MANIFEST.read_text())
    changed = 0
    inspected = 0
    for slug, figures in data.items():
        # One paper may use an official and an arXiv source if a publisher
        # rejects automated downloading. Group by the precise PDF URL.
        by_pdf = {}
        for fig in figures:
            by_pdf.setdefault(fig["pdf"], []).append(fig)
        for source_pdf, refs in by_pdf.items():
            dest = CACHE / f"{slug}-{abs(hash(source_pdf)) % 999999}.pdf"
            download_pdf(source_pdf, dest)
            with fitz.open(dest) as pdf:
                by_page = {}
                for fig in refs:
                    by_page.setdefault(fig["page"], []).append(fig)
                for page_number, page_figures in by_page.items():
                    if len(page_figures) < 2:
                        continue
                    page = pdf[page_number-1]
                    located = [(find_label_y(page, fig), fig) for fig in page_figures]
                    located = [(y, fig) for y, fig in located if y is not None]
                    located.sort(key=lambda x: x[0])
                    for (prev_y,prev_fig),(current_y,fig) in zip(located,located[1:]):
                        inspected += 1
                        old = fitz.Rect(fig["bbox"])
                        # Approximate the previous caption's paragraph extent;
                        # don't reuse a PyMuPDF block box merged with figure text.
                        chars = len(prev_fig["caption"])
                        estimated_caption_end = (prev_y +
                            min(115, math.ceil(chars / 100)*11 + 13))
                        top = min(max(old.y0, estimated_caption_end+6), current_y-45)
                        if top <= old.y0+18 or top >= old.y1-45:
                            continue
                        new_box = fitz.Rect(old.x0, top, old.x1, old.y1)
                        pix = page.get_pixmap(matrix=fitz.Matrix(3.6,3.6),
                                             clip=new_box, alpha=False,
                                             colorspace=fitz.csRGB)
                        image = Image.open(BytesIO(pix.tobytes("png"))).convert("RGB")
                        if max(ImageStat.Stat(image).stddev)<9:
                            raise ValueError(f"{slug}/Figure {fig['number']}: corrected crop blank")
                        image.thumbnail((2300,2600),Image.Resampling.LANCZOS)
                        out = ROOT / "public" / fig["image"].lstrip("/")
                        image.save(out,"WEBP",quality=91,method=5)
                        print(f"CROP {slug} Fig {fig['number']}: "
                              f"top {old.y0:.1f} -> {top:.1f}, "
                              f"prev Fig {prev_fig['number']} heading {prev_y:.1f}",
                              flush=True)
                        fig.update({"bbox":[round(v,1) for v in new_box],
                                    "width":image.width,"height":image.height,
                                    "bytes":out.stat().st_size})
                        changed += 1
    MANIFEST.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
    print(f"Inspected {inspected} adjacent figure pairs; repaired {changed} "
          "caption-overlapping crops",flush=True)


if __name__=="__main__":
    main()
