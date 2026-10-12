#!/usr/bin/env python3
"""Extract all captioned paper figures, translate captions, and embed them by topic.

No fixed quota. Keep original caption, PDF provenance and separate Vietnamese
translation. The generated figure gallery is inserted into relevant sections.
"""
from __future__ import annotations
import json
import re
import time
from pathlib import Path

import fitz
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
from extract_paper_figures import (
    ROOT, MANIFEST, ASSETS, sources, download_pdf,
    captions, crop
)
from refresh_paper_captions import ALTERNATE_PDFS

PAPERS = ROOT / "content" / "papers"
BEGIN = "<!-- BEGIN SUPPLEMENTARY FIGURES -->"
END = "<!-- END SUPPLEMENTARY FIGURES -->"
# Local translation avoids IP-based rate limits on public translation APIs.
MODEL_NAME = "Helsinki-NLP/opus-mt-en-vi"
torch.set_num_threads(4)
TOKENIZER = AutoTokenizer.from_pretrained(MODEL_NAME)
MODEL = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
MODEL.eval()
HEADING_HINTS = {
    "why": ["motivation", "overview", "framework", "architecture", "system", "main", "example"],
    "method": ["framework", "architecture", "pipeline", "training", "network", "policy", "model", "method", "attention", "token"],
    "results": ["result", "performance", "comparison", "evaluation", "experiment", "success", "benchmark", "ablation"],
    "limitations": ["failure", "limitation", "error", "challeng"],
}

def translate(text, slug, number, previous):
    if previous and previous.get("caption") == text and previous.get("caption_vi"):
        return previous["caption_vi"]
    # Keep caption parts below the translator's input limit, without silently
    # truncating the source. Translate each complete sentence, preserving order.
    chunks = []
    raw = re.split(r"(?<=[.!?])\s+(?=[A-Z(0-9])", text)
    current = ""
    for sentence in raw:
        if len(current) + len(sentence) > 2600 and current:
            chunks.append(current.strip())
            current = ""
        current += " " + sentence
    if current.strip():
        chunks.append(current.strip())
    translated = []
    for chunk in chunks:
        inputs = TOKENIZER(">>vie<< " + chunk, return_tensors="pt", truncation=True, max_length=480)
        with torch.inference_mode():
            ids = MODEL.generate(**inputs, num_beams=2, max_new_tokens=480)
        translated.append(TOKENIZER.decode(ids[0], skip_special_tokens=True).strip())
    result = " ".join(translated)
    if not result or result == text:
        raise RuntimeError(f"{slug} figure {number}: untranslated caption")
    return result

def matches(page, number):
    return [c for c in captions(page) if c["num"] == number]

def select_source(slug, url, cache):
    primary = cache / f"{slug}.pdf"
    try:
        download_pdf(url, primary)
        return primary, url
    except RuntimeError:
        if slug not in ALTERNATE_PDFS:
            raise
        alternate = ALTERNATE_PDFS[slug]
        dest = cache / f"{slug}-arxiv.pdf"
        download_pdf(alternate, dest)
        return dest, alternate

def extraction(slug, pdf_url, original):
    cache = Path("/tmp/robotics-papers-pdf-cache")
    cache.mkdir(exist_ok=True)
    file, actual_url = select_source(slug, pdf_url, cache)
    existing = {f["number"]: f for f in original}
    figures = []
    with fitz.open(file) as doc:
        found = {}
        for idx in range(len(doc)):
            page = doc[idx]
            for candidate in captions(page):
                number = candidate["num"]
                if number not in found:
                    found[number] = (idx, candidate)
        for num, (idx, item) in sorted(found.items()):
            dest = ASSETS / slug / f"figure-{num}.webp"
            peers = [c for c in found.values() if c[0] == idx]
            crop_data = crop(doc, dest, idx, item, [c for _, c in peers])
            if not crop_data:
                print(f"SKIP {slug} figure {num}: no trustworthy figure rectangle", flush=True)
                continue
            caption = " ".join(item["caption"].split())
            if len(caption) < 35:
                continue
            previous = existing.get(num)
            translation = translate(caption, slug, num, previous)
            crop_data.update({
                "number": num,
                "image": f"/paper-figures/{slug}/figure-{num}.webp",
                "caption": caption,
                "caption_vi": translation,
                "pdf": actual_url
            })
            figures.append(crop_data)
            print(f"{slug} fig {num} ({idx+1}/{len(doc)}), original={len(caption)}, vi={len(translation)}", flush=True)
    if len(figures) < len(original):
        raise RuntimeError(f"{slug}: {len(figures)} figures below original {len(original)}")
    return figures

def classify(caption, order):
    lower = caption.lower()
    scores = {
        section: sum(lower.count(word) for word in terms)
        for section, terms in HEADING_HINTS.items()
    }
    winner = max(scores, key=lambda key: scores[key])
    if scores[winner] == 0:
        return "why" if order == 0 else "method"
    return winner

def embed(slug, figures):
    path = PAPERS / f"{slug}.md"
    original = path.read_text()
    original = re.sub(re.escape(BEGIN) + r"[\s\S]*?" + re.escape(END) + r"\n*", "", original)
    # Previous two images remain in their well-written figure walkthroughs.
    existing_images = set(re.findall(r"!\[[^\]]*\]\((/paper-figures/[^)]+)\)", original))
    supplemental = [f for f in figures if f["image"] not in existing_images]
    groups = {"why": [], "method": [], "results": [], "limitations": []}
    for i, fig in enumerate(supplemental):
        section = classify(fig["caption"], i + 2)
        groups[section].append(fig)
    mapping = {
        "Vì sao": "why",
        "Phương pháp": "method",
        "Kết quả": "results",
        "Hạn chế": "limitations",
    }
    parts = re.split(r"(?=^## )", original, flags=re.MULTILINE)
    output = [parts[0]]
    included = set()
    for part in parts[1:]:
        output.append(part.rstrip() + "\n\n")
        heading = part.split("\n", 1)[0][3:]
        for prefix, section in mapping.items():
            if not heading.startswith(prefix):
                continue
            if groups[section]:
                content = [
                    BEGIN,
                    "\n### Hình minh hoạ bổ sung từ bài báo\n\n",
                    "Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; "
                    "bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.\n\n"
                ]
                for fig in groups[section]:
                    content.append(
                        f"![Hình {fig['number']} từ PDF gốc, trang {fig['page']}]({fig['image']})\n\n"
                    )
                    included.add(fig["image"])
                content.append(END + "\n\n")
                output.append("\n".join(content))
            break
    # Not every paper has a 'Hạn chế' section; never silently discard figures.
    unplaced = [f for f in supplemental if f["image"] not in included]
    if unplaced:
        output.append(
            "\n" + BEGIN + "\n\n### Các hình còn lại của bài báo\n\n"
            + "".join(f"![Hình {fig['number']} từ PDF gốc, trang {fig['page']}]({fig['image']})\n\n" for fig in unplaced)
            + END + "\n"
        )
    content = "".join(output)
    for fig in figures:
        if content.count(f"]({fig['image']})") != 1:
            raise RuntimeError(f"{slug}: expected one occurrence of {fig['image']}")
    path.write_text(content)

def main():
    original = json.loads(MANIFEST.read_text())
    next_manifest = {}
    for slug, url in sources().items():
        figs = extraction(slug, url, original.get(slug, []))
        next_manifest[slug] = figs
        # Persist after each completed paper to simplify resuming failed runs.
        MANIFEST.write_text(json.dumps({**original, **next_manifest}, ensure_ascii=False, indent=2) + "\n")
        embed(slug, figs)
    for slug, fig in next_manifest.items():
        print(f"TOTAL {slug}: {len(fig)} figures", flush=True)
    print("OVERALL", sum(len(v) for v in next_manifest.values()), flush=True)

if __name__ == "__main__":
    main()
