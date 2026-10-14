# Visually reviewed figure crops: lingbot-vla-2

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://arxiv.org/pdf/2607.06403

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 2 | Inspected; source crop retained | 22, 58, 590, 268.1 | 22, 58, 590, 268.1 | Existing rectangle contains the whole figure in source preview. |
| 2 | 3 | Inspected; source crop retained | 22, 70.2, 590, 454.4 | 22, 70.2, 590, 454.4 | Existing rectangle contains the whole figure in source preview. |
| 3 | 4 | Manually recut | 141, 68, 468, 327 | 141, 68, 468, 327 | Recover entire robotic/egocentric dataset filtering diagram; original cropped left and top |
| 4 | 6 | Inspected; source crop retained | 22, 62.9, 590, 177.9 | 22, 62.9, 590, 177.9 | Existing rectangle contains the whole figure in source preview. |
| 5 | 8 | Manually recut | 82, 67, 548, 351 | 82, 67, 548, 351 | Include complete chart legend and upper label for per-action statistics |
| 6 | 8 | Manually recut | 113, 394, 520, 501 | 113, 394, 520, 501 | Tight crop to word cloud, no model text |
| 7 | 9 | Manually recut | 78, 492, 534, 626 | 78, 492, 534, 626 | Remove unrelated MoE derivation paragraphs; retain training and validation curves |
| 8 | 13 | Manually recut | 65, 65, 549, 407 | 65, 65, 549, 407 | Recover top row of spatiotemporal feature analysis bars |
| 9 | 14 | Manually recut | 318, 409, 591, 543 | 340, 384, 563, 542 | Crop only the two robot embodiment examples. Second visual inspection: adjusted further to retain full figure and exclude adjacent material. |
| 10 | 15 | Inspected; source crop retained | 311, 109.7, 591, 329.7 | 311, 109.7, 591, 329.7 | Existing rectangle contains the whole figure in source preview. |
| 11 | 15 | Manually recut | 72, 403, 572, 545 | 76, 353, 552, 542 | Exclude previous figure while retaining all token-distribution plots. Second visual inspection: adjusted further to retain full figure and exclude adjacent material. |
| 12 | 16 | Manually recut | 70, 191, 543, 336 | 70, 147, 548, 335 | Exclude unrelated prose, retain latency and performance comparisons. Second visual inspection: adjusted further to retain full figure and exclude adjacent material. |
| 13 | 17 | Inspected; source crop retained | 22, 58.4, 590, 275.5 | 22, 58.4, 590, 275.5 | Existing rectangle contains the whole figure in source preview. |

Total visually audited: 13. Rectangles manually corrected: 8.
Original figure paths and original/translated captions were preserved.
