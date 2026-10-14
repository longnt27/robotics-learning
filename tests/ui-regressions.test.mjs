import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const graph = fs.readFileSync(path.join(root, 'components/graph-view.tsx'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');

test('DAG wheel gesture zooms rather than panning the viewport away', () => {
  assert.match(graph, /zoomOnScroll(?:=\{true\})?/);
  assert.doesNotMatch(graph, /\bpanOnScroll(?:\s|\s*=\s*\{true\})/);
});

test('DAG keeps all 22 nodes mounted even when exploring a zoomed viewport', () => {
  assert.doesNotMatch(graph, /\bonlyRenderVisibleElements\b/);
});

test('DAG offers an explicit fit-to-screen recovery control', () => {
  assert.match(graph, /aria-label="Hiện toàn bộ sơ đồ"/);
  assert.match(graph, /\.fitView\(/);
});

test('all Vietnamese UI text uses self-hosted Montserrat latin and vietnamese subsets', () => {
  assert.match(layout, /import\s*\{\s*Montserrat\s*\}\s*from\s*["']next\/font\/google["']/);
  assert.match(layout, /subsets:\s*\[\s*["']latin["']\s*,\s*["']vietnamese["']\s*\]/);
  assert.match(styles, /font-family:\s*var\(--font-montserrat\)/);
  assert.doesNotMatch(styles, /DM Sans|Space Grotesk|fonts\.googleapis\.com/);
});


test('visual design uses restrained flat surfaces instead of gradients on every panel', () => {
  const briefing = fs.readFileSync(path.join(root, 'app/briefing.css'), 'utf8');
  const count = (s) => [...s.matchAll(/(?:linear|radial|conic)-gradient\(/g)].length;
  assert.ok(count(styles) <= 6, `Main site uses ${count(styles)} gradients; expected <= 6`);
  assert.ok(count(briefing) <= 5, `Slides use ${count(briefing)} gradients; expected <= 5`);
  for (const selector of ['.site-shell', '.timeline-card', '.graph-node', '.paper-hero']) {
    assert.ok(styles.includes(selector), `Missing core surface ${selector}`);
  }
  assert.match(briefing, /\.brief-slide-stage\{[^}]*background:#[0-9a-f]+/i);
});

test('equations use direct KaTeX rendering with safe defaults', () => {
  const slideUI=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
  assert.match(slideUI, /katex\.renderToString\(/);
  assert.match(slideUI, /trust:false/);
  assert.match(slideUI, /throwOnError:false/);
  assert.doesNotMatch(slideUI, /<(?:radial|linear)Gradient\b/);
});

test('paper reader does not serialize slide decks until slides are requested', () => {
  const page=fs.readFileSync(path.join(root,'app/paper/[slug]/page.tsx'),'utf8');
  const reader=fs.readFileSync(path.join(root,'components/paper-reader.tsx'),'utf8');
  const endpoint=fs.readFileSync(path.join(root,'app/api/papers/[slug]/slides/route.ts'),'utf8');
  assert.doesNotMatch(page,/getResearchSlides\(slug\)/,'Initial RSC payload must not read and send slides');
  assert.match(reader,/export function PaperReader\(\{paper,chapter,relations,figures\}/,'Reader receives only per-paper figures');
  assert.doesNotMatch(page,/<PaperReader[^>]*\sslides=/,'The server must not serialize a deck into props');
  assert.match(reader,/loadPaperSlides\(paper\.slug\)/,'Slides should be fetched only after opening tab');
  assert.match(endpoint,/getPaper\(slug\)/,'Only known papers should be served');
  assert.match(endpoint,/getResearchSlides\(slug\)/,'The route serves the original deck');
  assert.match(endpoint,/Cache-Control/i,'Slides need browser-level caching');
});

test('glossary content is a separate on-demand chunk, not part of shared layout', () => {
  const launcher=fs.readFileSync(path.join(root,'components/glossary-launcher.tsx'),'utf8');
  const dialog=fs.readFileSync(path.join(root,'components/glossary-dialog.tsx'),'utf8');
  const layout=fs.readFileSync(path.join(root,'app/layout.tsx'),'utf8');
  assert.match(layout,/<GlossaryLauncher\s*\/>/);
  assert.doesNotMatch(launcher,/glossary\.json|glossary-search|from\s*["']@\/lib\/papers/);
  assert.match(launcher,/dynamic\(\(\)=>import\(["']\.\/glossary-dialog["']\)/);
  assert.match(launcher,/wasOpened\s*&&\s*<GlossaryDialog/);
  assert.match(dialog,/glossary\.json/);
  assert.match(dialog,/searchGlossary\(terms,query,category\)/);
});

test('paper figure metadata is selected on server, not imported for all 22 papers in browser', () => {
  const page=fs.readFileSync(path.join(root,'app/paper/[slug]/page.tsx'),'utf8');
  const reader=fs.readFileSync(path.join(root,'components/paper-reader.tsx'),'utf8');
  const figure=fs.readFileSync(path.join(root,'components/paper-figure.tsx'),'utf8');
  const helper=fs.readFileSync(path.join(root,'lib/paper-figures.ts'),'utf8');
  assert.match(helper,/server-only/);
  assert.match(page,/getPaperFigures\(slug\)/);
  assert.doesNotMatch(figure,/paper-figures\.json/,'Figure UI must not bundle the full manifest');
  assert.match(figure,/loading="lazy"/);
  assert.match(reader,/figures=\{figures\}/);
});

test('paper navigation avoids unsolicited Next.js prefetch on metered mobile connections', () => {
  const timeline=fs.readFileSync(path.join(root,'components/timeline-view.tsx'),'utf8');
  const reader=fs.readFileSync(path.join(root,'components/paper-reader.tsx'),'utf8');
  const glossary=fs.readFileSync(path.join(root,'components/glossary-dialog.tsx'),'utf8');
  assert.match(timeline,/prefetch=\{false\}/);
  assert.match(reader,/prefetch=\{false\}/);
  assert.match(glossary,/prefetch=\{false\}/);
});

test('specialized styles stay out of root CSS and load with the feature',()=>{
  const layout=fs.readFileSync(path.join(root,'app/layout.tsx'),'utf8');
  const paper=fs.readFileSync(path.join(root,'app/paper/[slug]/page.tsx'),'utf8');
  const slides=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
  const graph=fs.readFileSync(path.join(root,'components/graph-view.tsx'),'utf8');
  assert.doesNotMatch(layout,/briefing\.css|katex\.min\.css|@xyflow\/react\/dist\/style\.css/);
  assert.match(paper,/katex\/dist\/katex\.min\.css/);
  assert.match(slides,/briefing\.css/);
  assert.match(graph,/@xyflow\/react\/dist\/style\.css/);
});

test('metered devices do not initialize WebGL just to read the library',()=>{
  const ambient=fs.readFileSync(path.join(root,'components/ambient-scene.tsx'),'utf8');
  assert.match(ambient,/saveData/,'Respect the Save-Data network preference');
  assert.match(ambient,/document\.hidden/,'Pause expensive rendering when page is hidden');
  assert.match(ambient,/limit\.matches/,'Small mobile screens must keep 3D disabled');
});

test('unrelated repository and model links never enter a paper client bundle',()=>{
  const page=fs.readFileSync(path.join(root,'app/paper/[slug]/page.tsx'),'utf8');
  const reader=fs.readFileSync(path.join(root,'components/paper-reader.tsx'),'utf8');
  const server=fs.readFileSync(path.join(root,'lib/paper-resources.ts'),'utf8');
  assert.match(server,/server-only/);
  assert.match(page,/getPaperResources\(slug\)/);
  assert.doesNotMatch(reader,/paper-resources\.json/);
  assert.match(reader,/resources:PaperResource\[\]/);
});
