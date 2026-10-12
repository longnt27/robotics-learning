# Robotics Atlas HTML Research Slides - Design Specification

**Date:** 2026-10-12
**Status:** Awaiting author review
**Scope:** HTML presentation mode for 22 existing paper pages, with no PPTX export.

## Audience and goal

A technical research briefing, in Vietnamese, for an engineering leader who knows the field but does not want to decode derivations. Each slide explains what changes, why it works, the supporting evidence, and what remains unproven. Preserve necessary research terms in English. Prefer **Intuition** over “trực giác”.

## Existing integration

The Next.js app has a PaperReader with three tabs; Slides currently renders a placeholder. Paper metadata lives in lib/papers.ts, long Vietnamese chapters in content/papers/{slug}.md, and equation rendering already uses KaTeX. Preserve Montserrat, high contrast and 13-inch laptop usability.

## Architecture and content

- New lib/slides.ts defines slide/deck types and source association. Maintain 22 reviewed paper-specific decks at content/slides/{slug}.ts or JSON. Do not generate content on the client from Markdown headings.
- Each deck has 13–17 slides (target 15), with a paper-specific narrative: problem, previous bottlenecks, core Intuition, mechanism, architecture, representation, training/inference, relevant equation, experiments/baselines, ablations if available, limitations, conclusion and related work.
- Each slide has a Vietnamese assertion title, one concise explanatory message, a diagram/chart/flow/comparison where useful, and optional speaker notes. Visible body text approximately 30–70 Vietnamese words unless evidence requires more.
- Cite the corresponding source chapter or original paper for quantitative claims. Never invent metrics, baselines, ablation or equations. Distinguish author conclusions from analytical critique. No placeholder padding to hit 15.
- Equations rendered in KaTeX must have an immediately visible **Mathematical Intuition** sentence in Vietnamese. Explain variables and implications, not algebra for its own sake.
- Vietnamese-first writing throughout; retain English specialist terms, official paper/model titles and proper nouns.

## HTML presentation

- Replace Slides placeholder with a shared SlideDeck component, backed by typed paper-specific deck data.
- High-contrast 16:9 stage fitting a laptop 1280x800 without clipped content; Montserrat for prose, mathematical font for equations. Readable mobile layout at 390x844.
- Keyboard: ArrowRight/Space next; ArrowLeft previous; Home/End boundaries; Escape closes overview/fullscreen. Ignore shortcuts while typing in inputs. Buttons have accessible names.
- Progress, previous/next, full-screen with fallback, thumbnail overview, slide deep-link via index, URL sync, presenter notes toggle. Properly reset between papers; no out-of-range navigation.
- SVG/CSS visuals should explain the specific paper rather than add decoration. Labels, axes and causal/process arrows must be legible.
- Reduced-motion support, visible focus, accessible controls and no regressions to explanation/PDF tabs.

## Testing and acceptance

- Exactly one deck per paper slug: 22 total, 13–17 slides each, unique IDs, valid type schema, meaningful Vietnamese-first titles. Every slide with equation has explanatory Intuition.
- Quantitative result/source inventory reviewed: no invented figures, explicit uncertainty where original paper not checked.
- Chromium tests at 1280x800 and 390x844: tab, keyboard, overview, index-linking, fullscreen fallback, overflow, no runtime exceptions.
- Existing content checks, TypeScript, Next.js production build and browser CI must pass before Vercel production deployment.

## Delivery phases

1. Source audit and typed slide/evidence format.
2. Reusable HTML presentation navigation, layouts, controls.
3. Paper-specific writing/visuals for all 22 decks, no generic duplicated slide text.
4. Source review, visual QA, CI, PR merge and production deployment.

## Non-goals

No PPTX/PDF export, server-side deck generator, database, auto-filling 15 pages with extracted bullet points or mathematical ornament without interpretation.
