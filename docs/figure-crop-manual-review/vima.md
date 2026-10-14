# Visually reviewed figure crops: vima

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://arxiv.org/pdf/2210.03094

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 2 | Manually recut | 22, 72.4, 590, 317.6 | 64, 60, 554, 317 | Preserve the full multimodal prompt headings and panels; exclude running header |
| 2 | 3 | Manually recut | 22, 68.3, 590, 183.3 | 71, 63, 550, 184 | Keep generalization arrow and all five examples |
| 3 | 4 | Manually recut | 22, 205.6, 590, 345.8 | 98, 60, 544, 345 | Recover transformer and cross-attention stages above existing crop |
| 4 | 5 | Manually recut | 22, 45, 590, 310 | 76, 65, 542, 309 | Exclude PDF running title but retain axes and legend |
| 5 | 6 | Manually recut | 311, 25, 591, 209.3 | 317, 62, 576, 209 | Remove unrelated running title, retain chart axes |
| 6 | 7 | Manually recut | 22, 187.7, 590, 330.5 | 98, 64, 548, 331 | Recover upper visual-tokenizer bar chart missing from original crop |
| 7 | 8 | Manually recut | 22, 25, 590, 177.7 | 67, 61, 558, 178 | Remove page title; keep both lines, all four panels and legend |

Total visually audited: 7. Rectangles manually corrected: 7.
Original figure paths and original/translated captions were preserved.
