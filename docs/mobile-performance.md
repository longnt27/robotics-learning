# Mobile-first performance contract

The reader prioritizes short time-to-read and low mobile data consumption. Markdown parsing and KaTeX math rendering happen on the server: the client receives rendered article content, not the entire Markdown parser and speaker-note strings in its first-load JavaScript. This note records **what ships** and **what has not been measured yet**. It is not a claim of a particular Lighthouse score.

## On-demand boundaries

| Resource | Initial article visit | First user action | Repeated navigation |
| --- | --- | --- | --- |
| 116-entry glossary | Small launcher/count only | Lazy-load the glossary + search chunk on **Từ điển** | Dialog remains mounted in the shared layout; browser reuses JS |
| 15-slide deck | Neither slide JSON nor slide presenter notes required to read Markdown | Fetch slide JSON **and Markdown speaker notes** from `/api/papers/[slug]/slides` on **Slide**, load presenter JS in parallel | One in-memory request promise per slug; browser/CDN cache headers; failed promise evicted |
| Original PDF | No PDF request | Fetch same-origin PDF proxy on **PDF gốc** | Native browser PDF and HTTP caching behavior |
| Captions for 167 figures | **Only captions belonging to active paper**; no global JSON in browser | Responsive optimized thumbnails via Next Image, with real source width/height and `loading="lazy"`; full-res image only on enlargement | Optimized size variants and browser cache |
| Code/model links | **Only active paper** | Open links directly | No unrelated global resources JSON in reader JS |
| DAG, starfield, slides, KaTeX CSS | Do not load specialized UI until required | On corresponding view/route; starfield disabled for mobile, Save-Data and hidden tabs | Hashed chunks cached by browser |
| Other article pages | No automatic route prefetch in paper lists and dictionary | Navigation on explicit click | Router retains appropriate route cache and browser HTTP cache |

**Data-source sizes before optimization (characters, not bytes transferred):**
- `content/glossary.json`: **50,840**
- `content/paper-figures.json`: **212,641**
- `lib/paper-resources.json`: **6,534**
- `app/briefing.css`: **32,858**
- One slide deck: **roughly 12k–17k** characters for the examples checked.

These sizes describe *source content* and cannot be added directly to infer saved mobile MB: Next bundles, compression, caching and render mode affect the actual transferred bytes. The CI browser suite now prints transferred KiB for a fresh mobile reader visit.

## Measured reader transfer (CI Chromium, 390 × 844)

A fresh first visit to `/paper/vima` in the production build, measured by Chromium's Performance Resource Timing API, gave the following **three successive checkpoints within this PR**:

| Checkpoint | Requests | Transferred | JavaScript | Route's First Load JS |
| --- | ---: | ---: | ---: | ---: |
| Lazy resource boundaries, before server Markdown rendering | 21 | **601 KiB** | **292 KiB** | **287 kB** |
| Server-rendered Markdown without client-side parsers | 19 | **480 KiB** | **168 KiB** | **160 kB** |
| Responsive, viewport-sized figures | 20 | **350 KiB** | **173 KiB** | **165 kB** |

The final checkpoint transfers **~42% fewer bytes** and **~41% less JavaScript** than the first checkpoint within this PR. The extra 5 KiB JavaScript at the last step comes with responsive image loading that cut ~130 KiB from the measured page transfer.

**Interpretation:** These figures are CI Chromium observations on unthrottled network, not production user traces, not an A/B test against original `main`, and not a Lighthouse or real-user p75 score. Fonts, images, cache warmness and network conditions can change the measurements.

The browser suite now **fails** if a fresh mobile VIMA article exceeds **550 KiB total transfer** or **230 KiB JavaScript**, which leaves safety margin above this run's 350/173 KiB while preventing gross regressions. These are initial CI regression budgets, not proof of optimal experience on 3G/4G.

## Regression gates

`npm run test:ui`, `npm run test:slides`, `npm run test:glossary`, and `npm run test:resources` assert boundaries in source. `npm run test:e2e` verifies at 390px mobile width that:

- **0** slide and **0** PDF requests occur before choosing their tabs;
- first Slide click makes **1** request to the selected paper deck;
- tab switching and client-side navigation reuse that deck without refetching;
- a failed first deck request provides a working retry;
- direct `?tab=slides&slide=10` deep links, native fullscreen figures, glossary search, and PDF deep links still work.

A paper with an unknown slug receives HTTP **404** from the slide endpoint. Requests use known metadata, not caller-provided remote URLs.

## Cache and freshness

The slides endpoint sends `Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`. The client remembers each opened deck during a single JS session; a new deployment may take up to the configured cache freshness period to replace data in an already-open browser session. Closing or reloading the tab does **not** give an offline guarantee: this site is not a PWA.

The glossary is compiled into a content-hashed JavaScript chunk. It is downloaded on first open, not re-fetched on every client-side route change. Updating that dictionary publishes a new hashed chunk.

## Production quality targets (not yet proven)

For public traffic on mobile, track **Core Web Vitals p75** with valid field measurements:
- Largest Contentful Paint (LCP) at or below **2.5 seconds**.
- Interaction to Next Paint (INP) at or below **200 ms**.
- Cumulative Layout Shift (CLS) at or below **0.1**.

Also track first-visit and returning-visit transfer size, long JS tasks, JS coverage, image bytes and requests from slow mobile networks. Re-run Chrome Lighthouse on a throttled mobile profile and deploy a privacy-conscious real-user measurement system before making claims about those field targets. A green CI test is evidence of feature correctness and network-demand gating, **not** proof of those percentile targets.

## Known future opportunities

- Real-user Core Web Vitals collection (with clear consent and retention policy).
- Audit compressed image quality, optimizer cache-hit rate, and image transformation quota on production traffic.
- A versioned offline reading mode if offline access becomes a user requirement.
- Continue splitting the remaining 165 kB first-load route JavaScript if field traces show the reader shell or animation system dominates interaction cost.
