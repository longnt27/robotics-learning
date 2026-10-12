#!/usr/bin/env python3
"""Crop figures from the cited original PDFs, preserving paper provenance.

Uses actual PDF pixels, not recreated diagrams or generative imagery.
Run: python scripts/extract_paper_figures.py --only act,rt-2
"""
from __future__ import annotations

import argparse
import json
import re
import time
import urllib.request
from pathlib import Path

import fitz
from PIL import Image, ImageStat

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "paper-figures"
MANIFEST = ROOT / "content" / "paper-figures.json"
CAPTION_RE = re.compile(r"^(?:fig(?:ure)?\.?)\s*(\d{1,2})(?=\s|[:.\-–])", re.I)
UA = "RoboticsAtlas-EducationalFigureExtractor/1.0"


def sources():
    text = (ROOT / "lib" / "papers.ts").read_text()
    entries = dict(re.findall(r'\bslug:\s*"([^"]+)"[\s\S]*?\bpdf:\s*"([^"]+)"', text))
    if len(entries) != 22:
        raise RuntimeError(f"Expected 22 source PDFs, got {len(entries)}")
    allowed = ("https://arxiv.org/pdf/", "https://www.roboticsproceedings.org/",
               "https://proceedings.mlr.press/")
    for slug, url in entries.items():
        if not url.startswith(allowed):
            raise ValueError(f"Unapproved PDF source for {slug}: {url}")
    return entries


def download_pdf(url, dest):
    if dest.exists() and dest.stat().st_size > 20000:
        return
    err = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/pdf"})
            with urllib.request.urlopen(req, timeout=95) as response:
                data = response.read(100 * 1024 * 1024)
            if not data.startswith(b"%PDF-"):
                raise ValueError("PDF endpoint returned something other than PDF bytes")
            dest.write_bytes(data)
            return
        except Exception as exc:
            err = exc
            time.sleep(2 + attempt * 3)
    raise RuntimeError(f"Unable to download {url}: {err}")


def captions(page):
    result = []
    for block in page.get_text("blocks", sort=True):
        x0, y0, x1, y1, text, *_ = block
        line = text.strip().replace("\n", " ")
        match = CAPTION_RE.match(line)
        if not match:
            continue
        try:
            number = int(match.group(1))
        except ValueError:
            continue
        if number > 99 or len(line) < 18:
            continue
        result.append({"num": number, "bbox": fitz.Rect(x0, y0, x1, y1),
                       "caption": " ".join(line.split())})
    return result


def choose_box(page, caption, nearby):
    rect = page.rect
    cap = caption["bbox"]
    # Respect one-column vs two-column figure placement.
    page_width = rect.width
    center = (cap.x0 + cap.x1) / 2
    is_wide = cap.width > page_width * 0.52 or (
        cap.x0 < page_width * .26 and cap.x1 > page_width * .74
    )
    if is_wide:
        left, right = rect.x0 + 22, rect.x1 - 22
    elif center < page_width / 2:
        left, right = rect.x0 + 21, rect.x0 + page_width / 2 - 5
    else:
        left, right = rect.x0 + page_width / 2 + 5, rect.x1 - 21

    # Embedded raster regions are the most reliable anchors; vector-only figures
    # intentionally fall back to a fixed upper band.
    pictures = []
    for entry in page.get_image_info():
        box = fitz.Rect(entry["bbox"])
        xoverlap = max(0.0, min(box.x1, right) - max(box.x0, left))
        if (box.width >= 32 and box.height >= 18
                and xoverlap / box.width > .50
                and box.y0 < cap.y0 - 12 and box.y1 > cap.y0 - 370
                and box.y1 < cap.y0 + 6):
            pictures.append(box)
    previous = [c["bbox"].y1 for c in nearby
                if c["bbox"].y1 < cap.y0 and
                (is_wide or abs(((c["bbox"].x0 + c["bbox"].x1) / 2) - center) < page_width / 3)]
    top_floor = max(rect.y0 + 18, max(previous, default=rect.y0 + 18) + 7)
    if pictures:
        chosen = [b for b in pictures if b.y1 > cap.y0 - 330]
        top = max(top_floor, min(b.y0 for b in chosen) - 13)
        # Don't clip nearby line-art or image legends: include a little context.
        top = max(top_floor, min(top, cap.y0 - 120))
    else:
        top = max(top_floor, cap.y0 - (270 if is_wide else 225))
    bottom = min(cap.y0 - 5, rect.y1 - 15)
    if bottom - top < 85:
        top = max(top_floor, bottom - 115)
    if bottom - top < 60 or right - left < 160:
        return None
    return fitz.Rect(left, top, right, bottom)


def crop(doc, output, page_idx, item, others):
    page = doc[page_idx]
    box = choose_box(page, item, others)
    if box is None:
        return None
    pix = page.get_pixmap(matrix=fitz.Matrix(3.6, 3.6), clip=box,
                          alpha=False, colorspace=fitz.csRGB)
    from io import BytesIO
    img = Image.open(BytesIO(pix.tobytes("png"))).convert("RGB")
    # A blank/near-empty crop is not a source figure.
    stat = ImageStat.Stat(img)
    if max(stat.stddev) < 9:
        return None
    if img.width > 2300 or img.height > 2600:
        img.thumbnail((2300, 2600), Image.Resampling.LANCZOS)
    output.parent.mkdir(parents=True, exist_ok=True)
    img.save(output, "WEBP", quality=91, method=5)
    return {"page": page_idx + 1, "bbox": [round(v, 1) for v in box],
            "width": img.width, "height": img.height, "bytes": output.stat().st_size}


def extract_one(slug, url, pdf_cache):
    dest = pdf_cache / f"{slug}.pdf"
    download_pdf(url, dest)
    with fitz.open(dest) as doc:
        found = []
        for page_index in range(len(doc)):
            for item in captions(doc[page_index]):
                found.append((page_index, item))
        # Prefer numbered figures in the front of the paper, with one figure per number.
        by_number = {}
        for page_index, item in found:
            by_number.setdefault(item["num"], (page_index, item))
        candidates = sorted(by_number.items(), key=lambda kv: kv[0])
        output = []
        for number, (page_idx, item) in candidates:
            output_path = ASSETS / slug / f"figure-{number}.webp"
            peer_captions = [c for idx, c in found if idx == page_idx]
            result = crop(doc, output_path, page_idx, item, peer_captions)
            if not result:
                continue
            result.update({"number": number, "image": f"/paper-figures/{slug}/figure-{number}.webp",
                           "caption": item["caption"], "pdf": url})
            output.append(result)
            
        return output


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default="", help="Comma-separated paper slugs")
    args = parser.parse_args()
    available = sources()
    slugs = [s.strip() for s in args.only.split(",") if s.strip()] or list(available)
    bad = sorted(set(slugs) - set(available))
    if bad:
        parser.error(f"Unknown slugs: {bad}")
    cache = Path("/tmp/robotics-papers-pdf-cache")
    cache.mkdir(exist_ok=True)
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    errors = {}
    for slug in slugs:
        try:
            figures = extract_one(slug, available[slug], cache)
            if not figures:
                errors[slug] = "No printable figure caption or crop found"
            manifest[slug] = figures
            for fig in figures:
                print(f"{slug} FIG {fig['number']} PDF page {fig['page']} {fig['width']}x{fig['height']} -> {fig['image']}", flush=True)
        except Exception as exc:
            errors[slug] = str(exc)
            print(f"WARN {slug}: {exc}", flush=True)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(f"SUMMARY: {sum(bool(v) for v in manifest.values())}/{len(manifest)} papers with figures; errors={errors}", flush=True)
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
