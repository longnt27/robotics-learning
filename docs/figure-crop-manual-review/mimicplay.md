# Visually reviewed figure crops: mimicplay

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://arxiv.org/pdf/2302.12422

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 1 | Manually recut | 22, 398.5, 590, 535.4 | 78, 408, 554, 535 | Exclude arXiv watermark; retain human-video and robot-demo comparison |
| 2 | 4 | Inspected; source crop retained | 22, 82.3, 590, 197.3 | 22, 82.3, 590, 197.3 | Existing rectangle contains the whole figure in source preview. |
| 3 | 5 | Inspected; source crop retained | 22, 60.3, 590, 250.7 | 22, 60.3, 590, 250.7 | Existing rectangle contains the whole figure in source preview. |
| 4 | 7 | Manually recut | 311, 458.7, 591, 678.7 | 344, 585, 572, 678 | Remove surrounding unrelated prose; retain evaluation chart and legend |
| 5 | 8 | Manually recut | 311, 140.7, 591, 303 | 320, 176, 590, 306 | Retain complete sequence of latent-plan examples without neighboring caption |

Total visually audited: 5. Rectangles manually corrected: 3.
Original figure paths and original/translated captions were preserved.
