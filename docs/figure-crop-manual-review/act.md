# Visually reviewed figure crops: act

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://www.roboticsproceedings.org/rss19/p016.pdf

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 1 | Manually recut | 45, 163, 568, 328.8 | 45, 163, 568, 328.8 | Exclude title/authors, preserve all ALOHA teleoperation examples |
| 3 | 3 | Manually recut | 52, 59, 562, 189 | 52, 25, 562, 189 | Tighten crop to complete ALOHA hardware diagram. Second visual inspection: adjusted further to retain full figure and exclude adjacent material. |
| 4 | 4 | Manually recut | 32, 143, 578, 264 | 32, 143, 578, 264 | Exclude Table I caption; preserve all three tracking-error plots and time-axis labels |
| 5 | 5 | Manually recut | 70, 54, 549, 178 | 70, 54, 549, 178 | Preserve full ACT encoder/decoder diagram, exclude excess whitespace |
| 6 | 5 | Manually recut | 92, 229, 301, 357 | 92, 229, 301, 361 | Recover upper action-chunking rows, retain temporal-ensemble row; exclude right-column prose. Second visual inspection: adjusted further to retain full figure and exclude adjacent material. |
| 7 | 7 | Manually recut | 62, 56, 551, 730 | 62, 56, 551, 730 | Recover all six real-world task sequences, their prompts and subtasks; original crop omitted first three rows |
| 8 | 8 | Manually recut | 47, 39, 565, 137 | 47, 39, 565, 137 | Preserve both simulator panels and their figure-internal descriptions |
| 9 | 11 | Manually recut | 50, 59, 557, 179 | 50, 59, 557, 179 | Remove running whitespace while retaining all ablation plots and legends |

Total visually audited: 8. Rectangles manually corrected: 8.
Original figure paths and original/translated captions were preserved.
