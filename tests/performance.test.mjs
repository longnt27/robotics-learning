import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname,"..");
const read = (p) => fs.readFileSync(path.join(root,p),"utf8");

test("initial article response excludes entire slide deck and global figure catalog",()=>{
  const page=read("app/paper/[slug]/page.tsx");
  const reader=read("components/paper-reader.tsx");
  const figure=read("components/paper-figure.tsx");
  const route=read("app/api/papers/[slug]/slides/route.ts");
  assert.doesNotMatch(page,/getResearchSlides|slides=\{/,"do not serialize slide deck through React Server Components");
  assert.match(page,/article=\{<PaperArticle/);
  assert.doesNotMatch(reader,/react-markdown|remark-gfm|remark-math|rehype-katex/,
    "Client reader must not ship Markdown/KaTeX parsing libraries");
  assert.match(read("components/paper-article.tsx"),/ReactMarkdown/);
  assert.match(read("components/paper-article.tsx"),/figure=\{image\?figuresByImage\.get\(image\):undefined\}/);
  assert.match(page,/figureManifest\[slug as keyof typeof figureManifest\]/,
    "pass the current paper's figure captions only");
  assert.doesNotMatch(figure,/content\/paper-figures\.json/,
    "figure UI must not import the complete source-caption catalog");
  assert.match(reader,/loadDeck\(paper\.slug\)/);
  assert.match(reader,/tab !== "slides"/);
  assert.match(route,/getResearchSlides\(slug\)/);
  assert.match(route,/Cache-Control/);
});

test("global dictionary is in a separate first-open chunk, not the initial JS",()=>{
  const layout=read("app/layout.tsx");
  const launcher=read("components/glossary-launcher.tsx");
  const dialog=read("components/glossary-dialog.tsx");
  assert.match(layout,/<GlossaryLauncher count=\{glossaryManifest\.length\}/);
  assert.doesNotMatch(launcher,/content\/glossary\.json|searchGlossary\(|paperBySlug/);
  assert.match(launcher,/import\("\.\/glossary-dialog"\)/);
  assert.match(dialog,/import rawGlossary from/);
  assert.match(dialog,/searchGlossary\(terms,query,category\)/);
});

test("do not prefetch every reader route while browsing on mobile",()=>{
  const timeline=read("components/timeline-view.tsx");
  const reader=read("components/paper-reader.tsx");
  const dialog=read("components/glossary-dialog.tsx");
  assert.match(timeline,/<Link prefetch=\{false\} href=\{`\/paper\/\$\{paper\.slug\}\}/);
  assert.match(reader,/<Link prefetch=\{false\} key=\{i\} href=\{`\/paper\//);
  assert.match(dialog,/<Link prefetch=\{false\} key=\{slug\} href=\{"\/paper\/"/);
});

test("static asset sizes are large enough that eager bundling is a regression",()=>{
  const files=["content/glossary.json","content/paper-figures.json"];
  assert.ok(fs.statSync(path.join(root,files[0])).size>30000);
  assert.ok(fs.statSync(path.join(root,files[1])).size>100000);
  const count=JSON.parse(read(files[0])).length;
  assert.ok(count>=100);
});
