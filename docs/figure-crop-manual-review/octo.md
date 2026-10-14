# Visually reviewed figure crops: octo

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://arxiv.org/pdf/2405.12213

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 1 | Manually recut | 22, 167.4, 590, 505.1 | 72, 164, 555, 506 | Exclude left arXiv margin; retain Octo overview and task icons |
| 2 | 3 | Manually recut | 22, 148.1, 590, 304.5 | 26, 54, 586, 307 | Restore upper diagram with task and observation tokenization stages |
| 3 | 4 | Inspected; source crop retained | 311, 58, 591, 276.8 | 311, 58, 591, 276.8 | Existing rectangle contains the whole figure in source preview. |
| 4 | 6 | Inspected; source crop retained | 22, 35.9, 590, 194.5 | 22, 35.9, 590, 194.5 | Existing rectangle contains the whole figure in source preview. |
| 5 | 6 | Manually recut | 311, 320.7, 591, 540.7 | 316, 420, 591, 541 | Remove preceding section text, keep zero-shot outcome bars |
| 6 | 8 | Inspected; source crop retained | 21, 32.9, 301, 252.9 | 21, 32.9, 301, 252.9 | Existing rectangle contains the whole figure in source preview. |

Total visually audited: 6. Rectangles manually corrected: 3.
Original figure paths and original/translated captions were preserved.
