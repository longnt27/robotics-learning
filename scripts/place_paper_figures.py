#!/usr/bin/env python3
"""Place every extracted figure near its topic, without hard-coding a count.

The original two figures and human-written walkthroughs stay in place. Additional
figures are inserted near the start of matching sections with idempotent markers.
Renderers strip generator markers before passing Markdown to ReactMarkdown.
"""
from __future__ import annotations

import json
import math
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAPERS = ROOT / "content" / "papers"
MANIFEST = ROOT / "content" / "paper-figures.json"
START = "<!-- BEGIN ADDITIONAL PDF FIGURES -->"
END = "<!-- END ADDITIONAL PDF FIGURES -->"

SIGNALS = {
    "Vì sao": ("overview", "dataset", "collection", "task suites", "data collection",
               "setup", "system", "hardware", "environment", "diversity", "benchmark"),
    "Kiến thức nền": ("representation", "embodiment", "tokens", "action space",
                     "language instructions", "proprioceptive"),
    "Phương pháp": ("architecture", "framework", "training", "network", "model",
                   "policy", "inference", "pipeline", "transformer", "flow",
                   "module", "loss", "decoder", "encoder", "learning", "sampling"),
    "Ví dụ": ("qualitative", "example", "demonstration", "behavior", "rollout",
              "real-world", "scenarios", "robot performs", "case study"),
    "Kết quả": ("evaluation", "result", "success rate", "comparison", "ablations",
                "ablation", "performance", "accuracy", "experiments", "plots", "chart"),
    "Hạn chế": ("failure", "limitations", "error analysis"),
}

SECTION_ORDER = ("Vì sao", "Kiến thức nền", "Phương pháp",
                 "Ví dụ", "Kết quả", "Hạn chế")


def select_section(caption: str, number: int, frequency: Counter[str]) -> str:
    text = caption.lower()
    scores = {
        section: sum(2 if " " in term else 1 for term in keywords if term in text)
        for section, keywords in SIGNALS.items()
    }
    # Treat later figures as more likely to report results if caption is neutral.
    if number >= 4 and max(scores.values()) == 0:
        scores["Kết quả"] += 1
    if max(scores.values()) == 0:
        scores["Phương pháp"] = 1
    # Avoid collapsing an entire paper's figure gallery into a single section.
    best = sorted(scores, key=lambda s: (-scores[s], frequency[s], SECTION_ORDER.index(s)))[0]
    frequency[best] += 1
    return best


def strip_old_auto_sections(text: str) -> str:
    pat = re.compile(re.escape(START) + r"\n.*?\n" + re.escape(END) + r"\n?", re.S)
    return pat.sub("", text)


def figure_markdown(figure: dict) -> str:
    return f"![Hình {figure['number']} từ PDF gốc, trang {figure['page']}]({figure['image']})\n\n"


def put_after_intro(section_text: str, new: str) -> str:
    # Markdown section starts with a ## header, then the author's first
    # introductory paragraph. Insert before the detailed generated walkthrough.
    heading_end = section_text.find("\n")
    if heading_end < 0:
        raise ValueError("Section without a heading line")
    first_break = section_text.find("\n\n", heading_end + 1)
    if first_break < 0:
        first_break = len(section_text)
    return section_text[:first_break] + "\n\n" + new + section_text[first_break:].lstrip("\n")


def update_one(slug: str, figures: list[dict]) -> int:
    file = PAPERS / f"{slug}.md"
    content = strip_old_auto_sections(file.read_text())
    # Existing source images keep their editorial guides and placement.
    current_images = set(re.findall(r"/paper-figures/" + re.escape(slug) +
                                    r"/figure-\d+\.webp", content))
    extras = [fig for fig in sorted(figures, key=lambda x: x["number"])
              if fig["image"] not in current_images]
    sections = re.split(r"(?=^## )", content, flags=re.M)
    assignments: dict[str, list[dict]] = {prefix: [] for prefix in SECTION_ORDER}
    counts: Counter[str] = Counter()
    for fig in extras:
        assignments[select_section(fig["caption"], fig["number"], counts)].append(fig)

    rebuilt = []
    inserted = set()
    for chunk in sections:
        if not chunk.startswith("## "):
            rebuilt.append(chunk)
            continue
        match = next((p for p in SECTION_ORDER if chunk.startswith(f"## {p}")), None)
        if match is None or not assignments[match]:
            rebuilt.append(chunk)
            continue
        images = "\n".join(figure_markdown(f).strip() for f in assignments[match])
        auto = f"{START}\n\n{images}\n\n{END}\n"
        rebuilt.append(put_after_intro(chunk, auto))
        inserted.update(f["image"] for f in assignments[match])

    if inserted != {fig["image"] for fig in extras}:
        raise ValueError(f"{slug}: not all figures placed ({inserted})")
    result = "".join(rebuilt)
    images = re.findall(r"!\[[^]]+\]\((/paper-figures/[^)]+)\)", result)
    expected = {fig["image"] for fig in figures}
    if set(images) != expected or len(images) != len(expected):
        raise ValueError(f"{slug}: manifest/text mismatch or repeated figure: {images}")
    file.write_text(result)
    print(f"{slug}: {len(figures)} total ({len(current_images)} existing, "
          f"{len(extras)} new); sections: " +
          ", ".join(f"{key}={len(vals)}" for key, vals in assignments.items() if vals),
          flush=True)
    return len(extras)


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    total = sum(update_one(slug, figures) for slug, figures in manifest.items())
    print(f"Placed {total} additional figures across {len(manifest)} original research chapters",
          flush=True)


if __name__ == "__main__":
    main()
