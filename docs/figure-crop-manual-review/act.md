# Visually reviewed figure crops: act

Decision source: direct visual inspection of the original PDF pages.
The script was used **only** to render manually selected coordinates.
It never automatically expands, trims, or determines figure boundaries.

Source: https://www.roboticsproceedings.org/rss19/p016.pdf

| Figure | Source page | Decision | Original coordinates | Approved coordinates | Visual reason |
| --- | ---: | --- | --- | --- | --- |
| 1 | 1 | Manually recut | 22, 63.8, 590, 328.8 | 45, 163, 568, 328.8 | Exclude title/authors, preserve all ALOHA teleoperation examples |
| 3 | 3 | Manually recut | 22, 25, 590, 188 | 52, 59, 562, 189 | Tighten crop to complete ALOHA hardware diagram |
| 4 | 4 | Manually recut | 22, 129.2, 590, 263.5 | 32, 143, 578, 264 | Exclude Table I caption; preserve all three tracking-error plots and time-axis labels |
| 5 | 5 | Manually recut | 22, 34.4, 590, 176.6 | 70, 54, 549, 178 | Preserve full ACT encoder/decoder diagram, exclude excess whitespace |
| 6 | 5 | Manually recut | 21, 266.6, 301, 356.8 | 92, 229, 301, 357 | Recover upper action-chunking rows, retain temporal-ensemble row; exclude right-column prose |
| 7 | 7 | Manually recut | 22, 386.8, 590, 727.7 | 62, 56, 551, 730 | Recover all six real-world task sequences, their prompts and subtasks; original crop omitted first three rows |
| 8 | 8 | Manually recut | 22, 25, 590, 135.4 | 47, 39, 565, 137 | Preserve both simulator panels and their figure-internal descriptions |
| 9 | 11 | Manually recut | 22, 47.9, 590, 178.3 | 50, 59, 557, 179 | Remove running whitespace while retaining all ablation plots and legends |

Total visually audited: 8. Rectangles manually corrected: 8.
Original figure paths and original/translated captions were preserved.
