# Source figure extraction and bilingual captions

Research papers are variable-length documents. The site **does not** impose a
two-figure, page-11, or per-paper figure quota.

## Source of truth

- `lib/papers.ts`: original publisher/arXiv PDFs for each of the 22 papers.
- `content/paper-figures.json`: array per paper with numbered figure, original
  **English** caption, Vietnamese machine translation (`caption_vi`), original
  PDF URL and one-based page number, source rectangle and optimized image.
- `public/paper-figures/<slug>/figure-<number>.webp`: 3.6×-resolution crops
  derived from the cited PDF, not AI-generated figures.
- `content/papers/<slug>.md`: the Markdown illustration references placed in
  the relevant research section. All images are lazy-loaded.
- `components/paper-figure.tsx`: displays Vietnamese caption alongside exact
  English original, with accessible fullscreen view and the PDF page deep link.

## Regenerating locally

Use Python 3.12. You only need `pymupdf`, `Pillow`, `torch`,
`transformers` and `sentencepiece`. A CPU-only PyTorch install works.

```sh
pip install pymupdf==1.26.4 pillow==11.3.0
python scripts/extract_paper_figures.py
# English caption text is never translated in-place.
pip install torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu
pip install transformers==4.44.2 sentencepiece==0.2.0
python scripts/translate_paper_captions.py
python scripts/place_paper_figures.py
python scripts/repair_paper_crops.py
npm run test:deep-reading
```

Figure extraction scans the main body **until the bibliography**. A figure is
accepted only when a numbered caption is found and its cropped image is nonblank
and large enough. The number of figures varies naturally by paper, and cropped
source provenance remains in the manifest. Publisher sites that reject automated
downloads may be replaced with the matching author arXiv version; the stored
PDF link/page then follows the version actually used.

Translation uses the open `VietAI/envit5-translation` model to generate
Vietnamese captions offline. The original English caption is never overwritten.
`translation_method` and `caption_sha256` make model provenance and invalidated
translations explicit. **Machine translations are drafts**, especially around
technical terms such as action space, embodiment, joint/EEF, zero-shot, and
numerical comparisons. Review specialized terminology before claiming a
translation is authoritative. The interface labels the Vietnamese caption as
machine translated.

## Selection and positioning rules

`place_paper_figures.py` preserves existing editorial figure discussions,
then adds any newly extracted figures under a relevant Vietnamese section:
motivation/dataset, foundation/representation, method, examples, results, or
limitations. It does not blindly append dozens of images at the end or duplicate
one image within an article. The extra-figure boundaries are HTML comments in
the source, stripped by `lib/content.ts` before rendering; they allow reliable
idempotent regeneration.

`repair_paper_crops.py` inspects PDF pages with adjacent figure captions and
removes the previous caption when a PDF text block happens to overlap a later
figure. This is especially useful in two-column, chart-heavy papers. It preserves
already stored bilingual captions and exact PDF provenance.

## Sanity checks

- Each manifest entry must have a valid local image and match **exactly one**
  image in its paper's Markdown.
- No fixed count per paper; at least three different per-paper gallery sizes.
- Every entry must have a nonempty English original, Vietnamese translation,
  page link, crop coordinates and translation source digest.
- Screen tests should show English **and** Vietnamese below figures, both on the
  page and in the fullscreen dialog.
- If any cropped figure contains the next/previous figure's caption, adjust its
  crop source coordinates, not its textual caption. Do not invent figures or
  silently substitute a screenshot from an unrelated paper.


## Manual source-PDF visual inspection (2026-10-14)

The published galleries were re-audited against **the original PDF page images**, not
approved by an automatic bounding-box detector. Human visual comparisons
covered **all 167 displayed source figures across 22 papers**. For **84 figures**,
an exact source-PDF rectangle was selected by hand after inspecting source
page imagery and the cropped WebP. The other 83 figure rectangles were kept
after checking their original-page context.

- `content/manually-reviewed-figure-boxes.json` is the durable record of
  manually selected (x0, y0, x1, y1) PDF-space rectangles and their reasons.
  It is intentionally **not** computed by `extract_paper_figures.py`.
- `docs/figure-crop-manual-review/<slug>.md` documents each paper's inspected
  images, source page numbers, previous/approved coordinates, and reasons.
- `scripts/render_manually_reviewed_figures.py --paper <slug>` mechanically
  renders the **specified approved rectangles only**. It does not infer
  boundaries, look for whitespace, or "fix" detected edges.
- Each paper was committed separately after reconstruction. The most complex
  cases required more than one visual correction pass, including ACT,
  RT-1, BridgeData V2, VIMA, FAST, OpenVLA, RTC, LingBot-VLA and Octo.
- Original figure paths, bilingual captions, source URLs and page references
  are preserved. Each displayed asset remains a crop of the cited paper PDF.

**Important:** Rerunning the older heuristic
`scripts/extract_paper_figures.py` or `scripts/repair_paper_crops.py`
will overwrite visually reviewed figure images or bounding boxes. Treat
those scripts as legacy initial extractors, not as validation or final
production re-cropping workflows. If the source PDF changes, inspect its
pages again and update the human-selected coordinates before rendering.
