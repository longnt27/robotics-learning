# Visually reviewed figure crops: qwen-vla

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://arxiv.org/pdf/2605.30280

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 1 | Manually recut | 22, 491.9, 573.3, 735.5 | 75, 490, 538, 736 | Exclude arXiv label, keep full task-and-data overview |
| 2 | 6 | Inspected; source crop retained | 22, 65.5, 573.3, 235.2 | 22, 65.5, 573.3, 235.2 | Existing rectangle contains the whole figure in source preview. |
| 3 | 11 | Inspected; source crop retained | 22, 83.1, 573.3, 397.6 | 22, 83.1, 573.3, 397.6 | Existing rectangle contains the whole figure in source preview. |
| 4 | 17 | Inspected; source crop retained | 22, 59.4, 573.3, 339.3 | 22, 59.4, 573.3, 339.3 | Existing rectangle contains the whole figure in source preview. |
| 5 | 21 | Inspected; source crop retained | 22, 85.4, 573.3, 359.5 | 22, 85.4, 573.3, 359.5 | Existing rectangle contains the whole figure in source preview. |
| 6 | 22 | Manually recut | 22, 25, 573.3, 225.2 | 69, 79, 536, 225 | Remove running paper header above T2A synthetic data plots |
| 7 | 24 | Manually recut | 22, 25, 573.3, 266.1 | 71, 109, 535, 266 | Remove unrelated prior paragraph, retain vision-language co-training charts |

Total visually audited: 7. Rectangles manually corrected: 3.
Original figure paths and original/translated captions were preserved.
