# Visually reviewed figure crops: diffusion-policy

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://www.roboticsproceedings.org/rss19/p026.pdf

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 1 | Inspected; source crop retained | 22, 163, 590, 294.4 | 22, 163, 590, 294.4 | Existing rectangle contains the whole figure in source preview. |
| 2 | 2 | Manually recut | 311, 25, 591, 250.8 | 312, 61, 591, 252 | Start at montage rather than top margin |
| 3 | 3 | Inspected; source crop retained | 22, 48.3, 590, 195.1 | 22, 48.3, 590, 195.1 | Existing rectangle contains the whole figure in source preview. |
| 4 | 4 | Manually recut | 311, 322.5, 591, 441.9 | 312, 347, 591, 442 | Remove text paragraph above the four trajectory examples |
| 5 | 5 | Manually recut | 21, 25, 301, 223.2 | 28, 115, 301, 223 | Keep velocity comparison bar plot, exclude previous paragraph |
| 6 | 5 | Inspected; source crop retained | 311, 25, 591, 183.7 | 311, 25, 591, 183.7 | Existing rectangle contains the whole figure in source preview. |
| 7 | 6 | Manually recut | 21, 278.5, 301, 498.5 | 21, 405, 301, 499 | Remove previous table and retain robustness plots |
| 8 | 9 | Inspected; source crop retained | 22, 54.5, 590, 298.4 | 22, 54.5, 590, 298.4 | Existing rectangle contains the whole figure in source preview. |
| 9 | 9 | Inspected; source crop retained | 21, 377.5, 301, 500.8 | 21, 377.5, 301, 500.8 | Existing rectangle contains the whole figure in source preview. |
| 10 | 9 | Inspected; source crop retained | 311, 349.3, 591, 531.8 | 311, 349.3, 591, 531.8 | Existing rectangle contains the whole figure in source preview. |
| 11 | 10 | Inspected; source crop retained | 21, 26.2, 301, 256.6 | 21, 26.2, 301, 256.6 | Existing rectangle contains the whole figure in source preview. |

Total visually audited: 11. Rectangles manually corrected: 4.
Original figure paths and original/translated captions were preserved.
