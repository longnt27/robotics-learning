# Visually reviewed figure crops: rt-1

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://www.roboticsproceedings.org/rss19/p025.pdf

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 1 | Manually recut | 21, 312.2, 301, 708.7 | 72, 446, 552, 699 | Recover full two-column architecture and evaluation overview; exclude abstract |
| 2 | 3 | Manually recut | 311, 359, 591, 474 | 311, 54, 590, 473 | Recover entire top of architecture: language encoder, FiLM, token learner and action decoder |
| 3 | 6 | Inspected; source crop retained | 22, 41, 590, 326.2 | 22, 41, 590, 326.2 | Existing rectangle contains the whole figure in source preview. |
| 4 | 6 | Manually recut | 311, 405.2, 591, 568.7 | 311, 369, 591, 567 | Recover first row of task distractor scenarios |
| 5 | 7 | Inspected; source crop retained | 311, 42.4, 591, 346.6 | 311, 42.4, 591, 346.6 | Existing rectangle contains the whole figure in source preview. |
| 6 | 9 | Manually recut | 311, 114.9, 591, 255.3 | 313, 143, 590, 256 | Remove unrelated preceding text |

Total visually audited: 6. Rectangles manually corrected: 4.
Original figure paths and original/translated captions were preserved.
