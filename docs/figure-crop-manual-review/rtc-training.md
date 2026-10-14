# Visually reviewed figure crops: rtc-training

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://arxiv.org/pdf/2512.05964

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 2 | Inspected; source crop retained | 21, 25, 301, 116.8 | 21, 25, 301, 116.8 | Existing rectangle contains the whole figure in source preview. |
| 2 | 2 | Manually recut | 311, 195.9, 591, 283.4 | 321, 50, 563, 279 | Restore top of conditioning architecture diagram, missing no-loss/flow-loss row |
| 3 | 3 | Manually recut | 21, 227.7, 301, 309.8 | 96, 141, 296, 310 | Restore top two-thirds of inference-delay vs success-rate graph |
| 4 | 3 | Manually recut | 311, 66.7, 591, 181.7 | 311, 86, 570, 181 | Remove text above real-world robot tasks |
| 5 | 3 | Manually recut | 311, 395.2, 591, 615.2 | 326, 417, 572, 615 | Remove text above plots, retain two task's success and duration bar charts |

Total visually audited: 5. Rectangles manually corrected: 4.
Original figure paths and original/translated captions were preserved.
