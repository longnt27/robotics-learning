#!/usr/bin/env python3
"""Restore complete *author-written* figure captions and render sharp full-view images.

PDF provenance stays in content/paper-figures.json. No LLM or translated captions.
Each figure is read from the exact original PDF page/bbox recorded by the
previous extractor; do not change the crop position while restoring captions.
"""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
import json
import re

import fitz
from PIL import Image
from extract_paper_figures import ROOT, MANIFEST, ASSETS, captions, download_pdf, sources


def comparable(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip().lower()


# Publisher PDF servers sometimes reject automated Accept headers. Use the author's
# arXiv version ONLY to recover the same caption, while keeping the existing crop
# and original PDF page link if the publisher PDF cannot be retrieved.
ALTERNATE_PDFS = {
    "rt-1": "https://arxiv.org/pdf/2212.06817",
    "diffusion-policy": "https://arxiv.org/pdf/2303.04137",
    "act": "https://arxiv.org/pdf/2304.13705",
}


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    pdfs = sources()
    cache = Path("/tmp/robotics-papers-pdf-cache")
    cache.mkdir(exist_ok=True)
    updated = 0

    for slug, figures in manifest.items():
        pdf_url = pdfs[slug]
        pdf_path = cache / f"{slug}.pdf"
        fallback = False
        try:
            download_pdf(pdf_url, pdf_path)
        except RuntimeError as error:
            alternate = ALTERNATE_PDFS.get(slug)
            if not alternate:
                raise
            print(f"WARN {slug}: publisher download failed ({error}); trying arXiv for exact caption", flush=True)
            pdf_path = cache / f"{slug}-arxiv.pdf"
            download_pdf(alternate, pdf_path)
            fallback = True

        with fitz.open(pdf_path) as document:
            for figure in figures:
                if fallback:
                    pages_and_captions = (
                        (page, c)
                        for page in document
                        for c in captions(page)
                        if c["num"] == figure["number"]
                    )
                else:
                    page = document[figure["page"] - 1]
                    pages_and_captions = ((page, c) for c in captions(page) if c["num"] == figure["number"])
                matches = list(pages_and_captions)
                if not matches:
                    raise RuntimeError(f"{slug} fig {figure['number']}: no source caption")
                # When multiple matching blocks exist, require matching original prefix.
                old = comparable(figure["caption"])[:75]
                matched = [(p, c) for p, c in matches if comparable(c["caption"]).startswith(old[:45])]
                if len(matched) != 1:
                    raise RuntimeError(f"{slug} fig {figure['number']}: ambiguous caption source")
                page, caption = matched[0]
                full = " ".join(caption["caption"].split())
                if len(full) < len(figure["caption"]) or len(full) < 35:
                    raise RuntimeError(f"{slug} fig {figure['number']}: caption unexpectedly shortened")

                figure["caption"] = full
                # Bboxes are from the publisher version; never blindly reuse
                # them to crop a different-pagination arXiv revision.
                if not fallback:
                    rect = fitz.Rect(figure["bbox"])
                    pixmap = page.get_pixmap(matrix=fitz.Matrix(3.6, 3.6), clip=rect,
                                             alpha=False, colorspace=fitz.csRGB)
                    image = Image.open(BytesIO(pixmap.tobytes("png"))).convert("RGB")
                    if image.width > 2300 or image.height > 2600:
                        image.thumbnail((2300, 2600), Image.Resampling.LANCZOS)
                    path = ASSETS / slug / f"figure-{figure['number']}.webp"
                    image.save(path, "WEBP", quality=91, method=5)
                    figure["width"] = image.width
                    figure["height"] = image.height
                    figure["bytes"] = path.stat().st_size
                updated += 1
                print(f"{slug} Figure {figure['number']}: {len(full)} caption chars"
                      + (" [caption matched in arXiv revision]" if fallback else
                         f", {figure['width']}x{figure['height']}px, {figure['bytes']} bytes"), flush=True)

    if updated != 44:
        raise RuntimeError(f"Expected 44 figures, refreshed {updated}")
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"Refreshed {updated} full original captions and high-resolution figure crops", flush=True)


if __name__ == "__main__":
    main()
