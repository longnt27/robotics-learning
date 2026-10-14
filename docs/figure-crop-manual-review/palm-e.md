# Visually reviewed figure crops: palm-e

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://proceedings.mlr.press/v202/driess23a/driess23a.pdf

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 1 | Inspected; source crop retained | 22, 208.1, 590, 375.2 | 22, 208.1, 590, 375.2 | Existing rectangle contains the whole figure in source preview. |
| 2 | 6 | Inspected; source crop retained | 21, 93.6, 301, 208.6 | 21, 93.6, 301, 208.6 | Existing rectangle contains the whole figure in source preview. |
| 3 | 7 | Manually recut | 21, 25, 301, 194.4 | 33, 77, 301, 195 | Exclude running header and preserve ablation bar chart |
| 4 | 8 | Manually recut | 22, 222.2, 590, 406 | 44, 251, 570, 406 | Remove unrelated table, keep entire kitchen and tabletop demonstration rows |
| 5 | 9 | Manually recut | 21, 25, 301, 218.6 | 32, 67, 300, 218 | Exclude running header while retaining chart and all legends |

Total visually audited: 5. Rectangles manually corrected: 3.
Original figure paths and original/translated captions were preserved.
