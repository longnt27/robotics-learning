# Visually reviewed figure crops: openvla

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://arxiv.org/pdf/2406.09246

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 1 | Manually recut | 72, 194, 552, 420 | 72, 194, 552, 420 | Exclude arXiv vertical identifier |
| 2 | 4 | Manually recut | 61, 74, 557, 224 | 61, 74, 557, 224 | Recover upper OpenVLA architecture title and tokenized action flow |
| 3 | 7 | Inspected; source crop retained | 22, 60.5, 590, 237.1 | 22, 60.5, 590, 237.1 | Existing rectangle contains the whole figure in source preview. |
| 4 | 8 | Inspected; source crop retained | 311, 258, 591, 414 | 311, 258, 591, 414 | Existing rectangle contains the whole figure in source preview. |
| 5 | 9 | Inspected; source crop retained | 22, 58.7, 590, 173.7 | 22, 58.7, 590, 173.7 | Existing rectangle contains the whole figure in source preview. |
| 6 | 10 | Manually recut | 104, 453, 338, 560 | 103, 431, 346, 560 | Exclude unrelated preceding prose and right-side Table 2; retain complete GPU inference bars. Second visual inspection: adjusted further to retain full figure and exclude adjacent material. |

Total visually audited: 6. Rectangles manually corrected: 3.
Original figure paths and original/translated captions were preserved.
