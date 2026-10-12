#!/usr/bin/env python3
"""Normalize well-known robotics terminology in automatically translated captions.

Do not paraphrase scientific claims or change the original English except a
verified PDF text-extraction artifact. All edits are source-conditional and
idempotent; translations still display their machine provenance.
"""
from hashlib import sha256
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / "content" / "paper-figures.json"


def update(en: str, vi: str) -> str:
    if re.search(r"\bzero[- ]shot\b", en, re.I):
        vi = re.sub(r"không có điểm dừng|không có điểm bắn|không có phát bắn",
                    "zero-shot (không huấn luyện bổ sung)", vi, flags=re.I)
    if re.search(r"\bcheckpoint\b", en, re.I):
        vi = re.sub(r"điểm kiểm tra chính sách", "checkpoint của policy", vi, flags=re.I)
    if re.search(r"\btask suites?\b", en, re.I):
        vi = re.sub(r"bộ (công việc|nhiệm vụ)", "bộ tác vụ", vi, flags=re.I)
    if re.search(r"joint and EEF action spaces", en, re.I):
        vi = vi.replace("không gian hành động chung", "không gian hành động theo khớp")
    if "GR00T" in en:
        vi = re.sub(r"\bG0{2}T\b", "GR00T", vi, flags=re.I)
    if re.match(r"(?i)^fig(?:ure)?\.?\s*(\d+)", en):
        number = int(re.match(r"(?i)^fig(?:ure)?\.?\s*(\d+)", en).group(1))
        if not re.match(r"(?i)^(Hình|Fig(?:ure)?\.?)\s*\d+", vi):
            vi = f"Hình {number}. " + vi
    return vi.strip()


def main():
    data = json.loads(FILE.read_text())
    changed = 0
    for slug, figures in data.items():
        for fig in figures:
            vi = fig.get("caption_vi", "")
            if not vi:
                raise ValueError(f"Missing machine translation: {slug}/{fig['number']}")
            en = fig["caption"]
            if slug == "lingbot-vla-2" and fig["number"] == 5 and en.endswith(
                "omitted here. cup bottle box bowl"
            ):
                # The word-cloud immediately below Figure 5 was accidentally
                # merged into its caption by PyMuPDF's text-block extractor.
                en = en[:en.index("omitted here.")+len("omitted here.")]
                fig["caption"] = en
                vi = (
                    "Hình 5. Thống kê theo từng hành động trong các nhãn tác vụ con: "
                    "tỷ trọng thời lượng, tần suất (tỷ lệ trong tổng số tác vụ con), "
                    "tổng thời gian (tỷ lệ trong tổng thời gian được gán nhãn) và "
                    "thời lượng trung bình. Các hành động được nhóm như ở Bảng 2; "
                    "trạng thái idle đã bị loại khỏi dữ liệu huấn luyện nên không "
                    "được hiển thị tại đây."
                )
                fig["translation_method"] += "; editor correction of PDF text overlap"
            polished = update(en,vi)
            if polished != fig["caption_vi"]:
                fig["caption_vi"] = polished
                changed += 1
            fig["caption_sha256"] = sha256(en.encode()).hexdigest()
    FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
    print(f"Terminology normalized in {changed} translated figure captions",flush=True)


if __name__ == "__main__":
    main()
