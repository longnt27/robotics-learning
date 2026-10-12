# ROBOTICS / ATLAS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a deployed, visually distinctive 3D-assisted research library with 22 traceable papers and long-form Vietnamese explanations.

**Architecture:** Static-first Next.js App Router; shared typed paper metadata and graph relations; component-isolated timeline/DAG/detail; Markdown chapters compiled server-side; Three.js enhancement that cannot block reading.

**Tech Stack:** Next.js 15, React 19, TypeScript, React Three Fiber, Drei, XYFlow, Framer Motion, Lucide, react-markdown, CSS.

**Spec:** `docs/superpowers/specs/2026-10-12-robotics-atlas-design.md`

## Global Constraints
- 22 unique papers; six user-submitted are highlighted.
- Main views read from one metadata source; edges have semantic labels.
- High contrast and 1280×800/1366×768 accessibility; reduced motion and no WebGL gracefully handled.
- Reader must provide full, sourced content; PDF fallback; Slides honest placeholder.
- No extra backend or authentication.

## Review Focus
1. Duplicated LIBERO should appear once, with userPick highlight: metadata validation test.
2. Unknown slug must 404 cleanly: route test.
3. WebGL failure or reduced motion must not hide controls: basic HTML/CSS fallback and browser check.
4. PDF iframe may be blocked: original PDF link always available: component check.
5. Laptop viewport: no horizontal overflow on timeline/reader, graph itself pannable: Playwright screenshot/manual.

---

### Task 1: Data model and research corpus
**Files:** `lib/papers.ts`, `lib/relations.ts`, `content/papers/*.md`, `tests/content.test.mjs`
**Interfaces:** `papers: Paper[]`, `getPaper(slug): Paper | undefined`, `relations: PaperRelation[]`.
- [ ] Add failing validation for count, unique slugs, six user picks, nonempty source links and relationship endpoints.
- [ ] Write metadata and Markdown lessons, migrating only source-supported claims.
- [ ] Run validation, fix errors, commit `feat(content): add linked VLA research corpus`.

### Task 2: App shell and responsive theme
**Files:** `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `components/atlas-shell.tsx`.
- [ ] Add theme/layout and meaningful accessible navigation.
- [ ] Ensure 1280×800 readability and under-900 stacking.
- [ ] Verify static rendering and commit `feat(ui): scaffold responsive research atlas`.

### Task 3: Interactive timelines, DAG, 3D scene
**Files:** `components/timeline-view.tsx`, `components/graph-view.tsx`, `components/starfield.tsx`, `components/atlas-shell.tsx`, `lib/relations.ts`.
- [ ] Implement filters and alternate view with consistent paper IDs.
- [ ] Implement React Flow DAG with typed edges, navigation and neighbor highlighting.
- [ ] Lazy Three.js backdrop, reduced-motion/fallback and bounded DPR.
- [ ] Test interactions and commit `feat(explore): add 3d timeline and research dependency graph`.

### Task 4: Paper detail and full source reader
**Files:** `app/paper/[slug]/page.tsx`, `components/paper-reader.tsx`, `lib/content.ts`, `content/papers/*.md`.
- [ ] Implement accessible three-tab experience; load full Markdown from disk.
- [ ] Embed PDFs with always-present source link; Slides is not implemented.
- [ ] Check every paper route and commit `feat(reader): add Vietnamese deep dive and PDF viewer`.

### Task 5: Quality gate and Vercel release
**Files:** `README.md`, `package.json`, tests and fixes.
- [ ] Run build/type checks and corpus validation.
- [ ] Inspect browser at 1280×800 and 1366×768, reduce-motion, keyboard, mobile and graph.
- [ ] Push clean `main` branch; create Vercel Next.js project linked to `longnt27/robotics-learning`.
- [ ] Deploy production from verified commit and check READY URL.
