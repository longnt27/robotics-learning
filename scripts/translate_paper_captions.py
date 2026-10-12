#!/usr/bin/env python3
"""Offline, reproducible English -> Vietnamese translation of author PDF captions.

Preserves the author's original verbatim in caption, and stores a separately
labeled machine translation in caption_vi. Translation happens when building
the dataset, never on a visitor's browser or in the Next.js app.
"""
from __future__ import annotations

import argparse
from hashlib import sha256
import json
import re
from pathlib import Path

import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "content" / "paper-figures.json"
MODEL_ID = "VietAI/envit5-translation"
TRANSLATOR_ID = "VietAI/envit5-translation (machine translation; requires review for jargon)"
VIETNAMESE = re.compile(r"[àáạảãăắằặẳẵâấầậẩẫđèéẹẻẽêếềệểễ"
                        r"ìíịỉĩòóọỏõôốồộổỗơớờợởỡ"
                        r"ùúụủũưứừựửữỳýỵỷỹ"
                        r"ÀÁẠẢÃĂẮẰẶẲẴÂẤẦẬẨẪĐÈÉẸẺẼÊẾỀỆỂỄ"
                        r"ÌÍỊỈĨÒÓỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ"
                        r"ÙÚỤỦŨƯỨỪỰỬỮỲÝỴỶỸ]")


def source_digest(s: str) -> str:
    return sha256(s.encode("utf-8")).hexdigest()


def chunks(text: str) -> list[str]:
    """Use small, coherent fragments so the model cannot silently omit a sentence."""
    text = re.sub(r"(?<=[A-Za-z])-\s+(?=[a-z])", "", text.strip())
    sentences = re.split(r"(?<=[.!?;])\s+(?=[A-Z0-9(])", text)
    result: list[str] = []
    current = ""
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) > 235:
            words = sentence.split()
            lines: list[str] = []
            pending = ""
            for word in words:
                if len(pending) + len(word) + 1 > 195 and pending:
                    lines.append(pending)
                    pending = word
                else:
                    pending = (pending + " " + word).strip()
            if pending:
                lines.append(pending)
        else:
            lines = [sentence]
        for part in lines:
            if current and len(current) + len(part) + 1 > 220:
                result.append(current)
                current = part
            else:
                current = (current + " " + part).strip()
    if current:
        result.append(current)
    return result


@torch.inference_mode()
def translate_batch(model, tokenizer, texts: list[str]) -> list[str]:
    translated = []
    for at in range(0, len(texts), 8):
        batch = texts[at: at + 8]
        data = tokenizer(
            ["en: " + sentence for sentence in batch],
            return_tensors="pt", padding=True, truncation=True, max_length=500
        )
        tokens = model.generate(**data, num_beams=3, max_new_tokens=256)
        translated.extend(re.sub(r"^\s*vi:\s*", "", item, flags=re.I).strip()
                          for item in tokenizer.batch_decode(tokens, skip_special_tokens=True))
    return translated


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default="", help="Optional comma-separated paper slugs")
    args = parser.parse_args()
    data = json.loads(MANIFEST.read_text())
    slugs = [x.strip() for x in args.only.split(",") if x.strip()] or sorted(data)
    pending: list[tuple[str, dict]] = []
    sentences: list[str] = []
    lengths: list[int] = []
    for slug in slugs:
        for figure in data[slug]:
            original = figure["caption"].strip()
            if not original or len(original) < 30:
                raise ValueError(f"{slug}/Figure {figure['number']}: missing source caption")
            if (figure.get("caption_vi") and figure.get("caption_sha256") ==
                    source_digest(original)):
                continue
            sections = chunks(original)
            if not sections:
                raise ValueError(f"{slug}/Figure {figure['number']}: no translation chunks")
            pending.append((slug, figure))
            lengths.append(len(sections))
            sentences.extend(sections)
    if not pending:
        print("All figures already have translations for their current original caption")
        return

    print(f"Translating {len(pending)} figures as {len(sentences)} segments "
          f"({MODEL_ID}); no paid or runtime inference service", flush=True)
    torch.set_num_threads(3)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID)
    model.eval()
    translations = translate_batch(model, tokenizer, sentences)
    if len(translations) != len(sentences):
        raise ValueError("Translation model returned wrong number of segments")

    cursor = 0
    for (slug, fig), n in zip(pending, lengths, strict=True):
        vi = " ".join(t.strip() for t in translations[cursor:cursor+n]).strip()
        cursor += n
        en = fig["caption"]
        if (not vi or not VIETNAMESE.search(vi) or
                len(vi) < max(12, len(en) * .22) or
                len(vi) > len(en) * 3.3):
            raise ValueError(
                f"{slug}/Figure {fig['number']}: suspicious Vietnamese translation "
                f"({len(en)} -> {len(vi)} chars): {vi[:120]!r}"
            )
        fig["caption_vi"] = vi
        fig["translation_method"] = TRANSLATOR_ID
        fig["caption_sha256"] = source_digest(en)
        print(f"TRANSLATED {slug}/Figure {fig['number']}: {len(en)} -> "
              f"{len(vi)} characters | {vi[:90]}", flush=True)

    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"DONE: {sum(len(figs) for figs in data.values())} bilingual figures "
          f"across {len(data)} papers", flush=True)


if __name__ == "__main__":
    main()
