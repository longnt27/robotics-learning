# HTML Research Briefing Slides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Each task is test gated.

**Goal:** Deliver roughly 15 substantive Vietnamese HTML slides for each of 22 robotics papers on Robotics Atlas.

**Architecture:** Static reviewed JSON decks are paired with canonical paper slugs; the existing Next.js paper detail page loads them server-side and hands them to an accessible client-side presenter. Existing Markdown chapters are the evidentiary basis of slide copy and extended speaker notes.

**Tech Stack:** Next.js 15, React 19, TypeScript, Montserrat, Framer Motion, KaTeX, SVG/CSS, Node's test runner and Playwright/Chromium.

**Spec:** `docs/superpowers/specs/2026-10-12-html-research-slides-design.md`

## Global Constraints

- Exactly 22 paper slugs and 15 slides per paper for this version.
- Vietnamese-first prose; preserve proper specialist English vocabulary, use **Intuition**.
- Each slide conveys a distinct technical point; equations have understandable descriptions, no fabricated benchmarks.
- Existing PDF, DAG, Montserrat, high-contrast, mobile and 13-inch laptop use must not regress.
- Deploy only the tested source SHA to the linked Vercel production project.

## Review Focus

- Opening `?tab=slides&slide=10` must show slide 10 with the correct equation without a hydration mismatch.
- Keyboard navigation must not interfere with page search or user typing, especially when the slides tab is not active.
- Switching paper/tab must not preserve another paper's slide index or hijack the URL.
- 1280 x 800 and 390 x 844 must not crop the slide title or body; fullscreen must work or fail gracefully.
- Every quantitative statement and formula must be supported by the corresponding article chapter or clearly framed as conceptual notation.

### Task 1: Validate and prepare 22 source-based decks

**Files:** `content/slides/*.json`, `lib/slide-types.ts`, `lib/slides.ts`, `tests/slides.test.mjs`
**Interfaces:** paper slug -> validated ResearchSlide[]; 15 ordered slides.

- [ ] RED: add test for 22 valid decks and no duplicate, empty, fabricated or generic slides; run it expecting failure.
- [ ] GREEN: finalize 22 decks, annotations and typed data loader; run content/slides tests.
- [ ] Commit deck data and schema.

### Task 2: HTML presenter and reader integration

**Files:** `components/slide-deck.tsx`, `components/paper-reader.tsx`, `app/paper/[slug]/page.tsx`, `app/globals.css`, `tests/browser.test.mjs`
**Interfaces:** SlideDeck({paper, slides, chapter, onRead}); reader tab `slides` deep-link `?tab=slides&slide=N`.

- [ ] RED: browser test fails while reader shows its placeholder.
- [ ] GREEN: wire server data and presenter, keyboard, overview, notes, fullscreen, readable responsive layouts and PDF/Markdown returns.
- [ ] Run static validations, build, browser tests; commit implementation.

### Task 3: QA and release

**Files:** `.github/workflows/build.yml`, `README.md`, plan documentation.

- [ ] Run all static/content/source validity checks and browser tests at 1280x800 and 390x844.
- [ ] Create a GitHub pull request; wait for green CI and source commit review.
- [ ] Squash-merge, wait for Vercel READY on the exact commit and verify production alias.
