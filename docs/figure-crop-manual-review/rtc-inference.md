# Visually reviewed figure crops: rtc-inference

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://arxiv.org/pdf/2506.07339

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 1 | Manually recut | 22, 441.1, 590, 631.8 | 64, 438, 552, 634 | Exclude arXiv watermark and keep full trajectory charts |
| 2 | 3 | Manually recut | 311, 133.8, 591, 353.8 | 316, 244, 589, 354 | Exclude preceding flow-matching prose; preserve bifurcation diagram |
| 3 | 4 | Inspected; source crop retained | 22, 25, 590, 212.1 | 22, 25, 590, 212.1 | Existing rectangle contains the whole figure in source preview. |
| 4 | 5 | Manually recut | 311, 25, 591, 244.6 | 377, 143, 509, 238 | Remove unrelated left- and right-column text around cross-chunk comparison plot |
| 5 | 7 | Inspected; source crop retained | 22, 61.3, 590, 271.1 | 22, 61.3, 590, 271.1 | Existing rectangle contains the whole figure in source preview. |
| 6 | 8 | Manually recut | 22, 325.1, 590, 590.1 | 50, 418, 573, 588 | Remove preceding prose and keep all controller latency plots |

Total visually audited: 6. Rectangles manually corrected: 4.
Original figure paths and original/translated captions were preserved.
