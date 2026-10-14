# Mobile reading performance

## What is actually sent to the browser

- **Article route:** The Markdown and mathematics are rendered in a Server Component. The client receives ready-to-read HTML instead of the Markdown, `react-markdown`, Remark/Rehype and KaTeX parsing code. Only the current paper's figure captions are serialized; the source catalog for all 167 figures stays on the server.
- **Slides tab:** The initial article response has no slide data and does not load the presenter UI. On first user access, `/api/papers/:slug/slides` returns exactly one of the 22 decks **plus its source chapter for presenter notes**. A small in-memory cache deduplicates requests across tab toggles and client-side navigation. The response has browser and CDN cache-control headers so reloads can reuse the response.
- **Glossary:** The root layout sends the term **count only**. The search engine, definitions and related-paper links are split into a lazy-loaded client chunk after the first click. It stays loaded while the shared layout remains mounted.
- **Paper navigation:** Link prefetch is disabled for the many paper cards and related-paper links. Clicking a link still uses Next.js client-side navigation.
- **Figures / PDF:** Paper figures keep native `loading="lazy"`. The original PDF iframe mounts only on the PDF tab; native byte-range requests are preserved.

## Rough source-size baseline (before network compression)

At the time of this change:
- Global glossary JSON: approximately **50 KB of source text**.
- Global figure-caption manifest: approximately **213 KB of source text**.
- Individual slide decks: around **12–17 KB of source text**.
- Figure images: **167 WebP assets, ~17.1 MiB combined**, roughly 105 KiB per asset on average. They are fetched as the reader scrolls, not as one download.

These are *repository sizes*, **not** measured cellular transfer savings. Network transfer is affected by compression, cache, viewport, prior navigation, and the image assets actually brought into view.

## Validation

```bash
npm run test:performance
npm run test:glossary
npm run test:slides
npm run test:deep-reading
npm run typecheck
npm run build
npm run test:e2e
```

The browser test must prove that opening a normal Markdown article makes **zero requests** to the slide API, while opening the Slides tab makes one and reopening it makes no additional request. Test a direct `?tab=slides&slide=10` link, opening the glossary for the first time, image-caption expansion and the PDF tab.

For production performance claims, capture Lighthouse mobile and Chrome DevTools Network results on an actual deployment with throttling and cold caches. Target Core Web Vitals at the **75th percentile** (LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1); passing source-level tests alone does **not** establish that the site meets these targets. Monitor actual traffic after merging and prioritize the largest remaining transferred assets.

## Cache and freshness

Browser cache for the slide API is 3,600 seconds; CDN may serve a recently cached response while revalidating. Memory cache is per loaded tab and lasts until a full reload. The glossary module is cached by the browser as a build-versioned JavaScript chunk and stays mounted through normal client navigation.

This PR intentionally avoids a service worker or permanent local storage so old paper versions are not silently pinned across deployments.
