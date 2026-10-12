# ROBOTICS / ATLAS

A cinematic, bilingual-friendly VLA paper atlas. Explore 22 deduplicated research papers as a time-ordered history or directed knowledge graph, and learn from deep Vietnamese technical lessons anchored to the original PDFs.

## Stack

Next.js App Router · TypeScript · React Three Fiber / Three.js · React Flow · Markdown

## Development

```bash
npm install
npm run dev
npm run check:content
npm run build
```

The app uses remote canonical sources for paper PDFs; some publishers disallow embedding, so a direct source button is always available. Slides are intentionally deferred.

## Content

- `lib/papers.ts`: one metadata object per paper
- `lib/relations.ts`: explicit, typed conceptual/method relationships
- `content/papers/{slug}.md`: one Vietnamese long-form lesson per paper, kept editable in Git
- `docs/superpowers/`: implementation design and plan

No user tracking, login, paid API or database is required.