# Visually reviewed figure crops: lingbot-vla-2

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://arxiv.org/pdf/2607.06403

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 2 | Inspected; source crop retained | 22, 58, 590, 268.1 | 22, 58, 590, 268.1 | Existing rectangle contains the whole figure in source preview. |
| 2 | 3 | Inspected; source crop retained | 22, 70.2, 590, 454.4 | 22, 70.2, 590, 454.4 | Existing rectangle contains the whole figure in source preview. |
| 3 | 4 | Manually recut | 311, 107.5, 591, 327.5 | 141, 68, 468, 327 | Recover entire robotic/egocentric dataset filtering diagram; original cropped left and top |
| 4 | 6 | Inspected; source crop retained | 22, 62.9, 590, 177.9 | 22, 62.9, 590, 177.9 | Existing rectangle contains the whole figure in source preview. |
| 5 | 8 | Manually recut | 22, 86.8, 590, 351.8 | 82, 67, 548, 351 | Include complete chart legend and upper label for per-action statistics |
| 6 | 8 | Manually recut | 22, 391.9, 590, 500.8 | 113, 394, 520, 501 | Tight crop to word cloud, no model text |
| 7 | 9 | Manually recut | 22, 369.2, 590, 634.2 | 78, 492, 534, 626 | Remove unrelated MoE derivation paragraphs; retain training and validation curves |
| 8 | 13 | Manually recut | 22, 143.3, 590, 408.3 | 65, 65, 549, 407 | Recover top row of spatiotemporal feature analysis bars |
| 9 | 14 | Manually recut | 311, 379.8, 591, 542.6 | 318, 409, 591, 543 | Crop only the two robot embodiment examples |
| 10 | 15 | Inspected; source crop retained | 311, 109.7, 591, 329.7 | 311, 109.7, 591, 329.7 | Existing rectangle contains the whole figure in source preview. |
| 11 | 15 | Manually recut | 22, 350.7, 590, 543.9 | 72, 403, 572, 545 | Exclude previous figure while retaining all token-distribution plots |
| 12 | 16 | Manually recut | 22, 68, 590, 333 | 70, 191, 543, 336 | Exclude unrelated prose, retain latency and performance comparisons |
| 13 | 17 | Inspected; source crop retained | 22, 58.4, 590, 275.5 | 22, 58.4, 590, 275.5 | Existing rectangle contains the whole figure in source preview. |

Total visually audited: 13. Rectangles manually corrected: 8.
Original figure paths and original/translated captions were preserved.
