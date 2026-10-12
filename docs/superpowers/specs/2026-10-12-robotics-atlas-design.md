# ROBOTICS / ATLAS: Cinematic VLA Research Library

## Goal
Create a high-contrast, accessible, visually ambitious personal VLA learning website on Vercel, using GitHub as the canonical content store. The user needs one navigable place to understand how a curated set of papers build on and differ from one another.

## Scope
- One source dataset of **22 unique papers**: 17 foundational papers plus five new titles among the six PDFs the user supplied. LIBERO appears in both collections and is **deduplicated**, while retaining the `userPick` indicator.
- Landing screen with switchable **vertical timeline** and **DAG** of the same 22 papers, searchable/filterable, with distinct visual treatment for all six user-supplied papers.
- Paper detail with **PDF**, **Vietnamese deep explanation**, **Slides (coming later)** tabs; no slide implementation now.
- Deep explanations organized Why / prerequisite knowledge / How / Results / Limitations / Connections / code experiments. Distinguish author claims and independent critique. Cite official papers and implementation links when known. No fabricated benchmark measurements.
- Edges are typed `builds-on`, `extends`, `compares`, `parallel`; `builds-on` requires meaningful identifiable technique lineage; directional is not a claim of formal citation unless explicitly verified.

## Interaction model
- A cinematic React Three Fiber galaxy/particle backdrop runs behind DOM interfaces and never captures pointer events; optional faux orbit lines and cursor parallax.
- Timeline scrolls naturally; year markers visible; user picks glow amber; selected filters apply identically to timeline and graph.
- DAG via React Flow: directed edges, pan/zoom, hover neighbor emphasis, click node to navigate, filters and type legend. Responsive graph starts at `fitView`, manual zoom controls are visible.
- Paper viewer uses accessible segmented tabs, sticky local contents navigation, visible source fallback if embedded PDFs disallow frame access.
- Slides tab contains an honest disabled / future placeholder, not fabricated slides.

## Accessibility and compact viewports
- Critical reading surfaces have minimum contrast 4.5:1; focus ring, keyboard-operable tab/list links, reduced-motion support, no pointer-only essential navigation.
- At 1280x800 and 1366x768: compact header, two-pane reader with contents sidebar optional, article column max 800 px, body text ≥15 px and preferably 16-17 px, line-height ≥1.6.
- On <900 px: collapse sidebar, timeline single column, DAG stays horizontally pannable rather than shrinking type; on phones use list-first.
- WebGL lazy-load; DPR max 1.5, lower particle counts on small screens; static CSS fallback when WebGL cannot initialize. Animations decorative only.

## Stack/data
- Next.js App Router + TypeScript + Tailwind/CSS, `@react-three/fiber` + `@react-three/drei`, `@xyflow/react`, `lucide-react`, `react-markdown`+GFM.
- Server filesystem reads under `content/papers/`; metadata lives in `lib/papers.ts` and relations in `lib/relations.ts`.
- External canonical PDF links; embedded iframe when permitted. No authentication/backend/database.
- `getStaticPaths` equivalent `generateStaticParams` for paper pages; static SSR metadata for indexing.

## Failure modes and quality bars
- Unknown slug → not found; missing Markdown → explicit explanatory message, no silent placeholder.
- Filter zero results → meaningful empty state.
- External PDF denied → open external source button remains actionable.
- WebGL disabled/reduced motion → all paper navigation and content still render.
- Graph relation labels never imply evidence stronger than supplied provenance.
- Search, view switching, graph node links, paper tabs, and desktop narrow layout verified with tests and screenshots.

## Out of scope
- Slides generator, note-taking account, bookmarks sync, LLM-backed conversational retrieval, paywalled PDF mirroring.
