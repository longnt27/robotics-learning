import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { normalizeGlossaryText, searchGlossary } from "../lib/glossary-search.js";

const root = path.resolve(import.meta.dirname,"..");
const read = (p)=>fs.readFileSync(path.join(root,p),"utf8");
const terms = JSON.parse(read("content/glossary.json"));
const paperSource=read("lib/papers.ts");
const slugs=[...paperSource.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m=>m[1]);
const categories=new Set(["paper","foundation","learning","architecture","control","data"]);

test("glossary covers all 22 papers, each research concept and their key connections",()=>{
  assert.equal(slugs.length,22,"Paper metadata changed; update corpus validation");
  assert.ok(terms.length>=100,"Global dictionary should be substantial");
  const ids=new Set();
  const paperTerms=new Set();
  const known=new Set(slugs);
  const aliases=new Set();
  for(const entry of terms){
    assert.equal(typeof entry.id,"string");
    assert.ok(/^[a-z0-9-]+$/.test(entry.id),entry.id);
    assert.ok(!ids.has(entry.id),"Duplicate glossary ID: "+entry.id);
    ids.add(entry.id);
    assert.ok(categories.has(entry.category),entry.id+": invalid category");
    assert.ok(entry.term.length>=2,entry.id+": unnamed term");
    assert.ok(entry.definition.length>=85,entry.id+": not a useful definition");
    assert.ok(!/\b(TODO|TBD|lorem ipsum)\b/i.test(entry.definition),entry.id+": placeholder");
    assert.ok(Array.isArray(entry.aliases),entry.id+": aliases missing");
    assert.ok(entry.papers.length>=1,entry.id+": ungrounded in research");
    for(const slug of entry.papers){
      assert.ok(known.has(slug),entry.id+": invalid linked paper "+slug);
      if(entry.category==="paper")paperTerms.add(slug);
    }
    for(const token of [entry.term,...entry.aliases])aliases.add(normalizeGlossaryText(token));
  }
  for(const slug of slugs)assert.ok(paperTerms.has(slug),slug+": missing glossary entry for paper");
  const conceptTags=[...paperSource.matchAll(/concepts:\s*\[([^\]]+)\]/g)];
  assert.equal(conceptTags.length,22,"Expected concept tags for every paper");
  for(const [,text] of conceptTags){
    for(const concept of JSON.parse("["+text+"]")){
      assert.ok(aliases.has(normalizeGlossaryText(concept)),"Missing corpus concept definition: "+concept);
    }
  }
});

test("search supports Vietnamese without tone marks, acronyms, aliases, and exact name ranking",()=>{
  assert.equal(searchGlossary(terms,"ACT")[0]?.term,"ACT");
  assert.equal(searchGlossary(terms,"rtc")[0]?.term,"RTC");
  assert.equal(searchGlossary(terms,"flow matching")[0]?.term,"Flow matching");
  assert.equal(searchGlossary(terms,"lora")[0]?.term,"LoRA");
  assert.equal(searchGlossary(terms,"π0.5")[0]?.term,"π0.5");
  assert.equal(searchGlossary(terms,"pi0.5")[0]?.term,"π0.5");
  assert.ok(searchGlossary(terms,"khai quat").some(x=>x.id==="generalization"));
  assert.ok(searchGlossary(terms,"hoc lien tuc").some(x=>x.id==="continual-learning"));
  assert.ok(searchGlossary(terms,"dau cong tac").some(x=>x.id==="end-effector"));
  assert.ok(searchGlossary(terms,"Mixture of Experts").some(x=>x.id==="moe"));
  assert.equal(searchGlossary(terms,"thisworddoesnotexist").length,0);
  assert.ok(searchGlossary(terms,"MoE","architecture").every(x=>x.category==="architecture"));
  assert.ok(searchGlossary(terms,"","paper").length===22);
});

test("global glossary trigger lives in shared layout; back-to-top only in paper route",()=>{
  const layout=read("app/layout.tsx");
  const paper=read("app/paper/[slug]/page.tsx");
  const css=read("app/globals.css");
  const launcher=read("components/glossary-launcher.tsx");
  const button=read("components/reading-scroll-top.tsx");
  assert.match(layout,/<GlossaryLauncher\s*\/>/);
  assert.doesNotMatch(layout,/ReadingScrollTop/);
  assert.match(paper,/<ReadingScrollTop\s*\/>/);
  assert.doesNotMatch(launcher,/window\.scrollTo/);
  assert.match(button,/window\.scrollTo\(\{top:0/);
  assert.match(button,/window\.scrollY>480/);
  const dialog=read("components/glossary-dialog.tsx");
  assert.match(dialog,/showModal\\(\\)/);
  assert.match(dialog,/onCancel=\\{close\\}/);
  assert.match(dialog,/searchGlossary\\(terms,query,category\\)/);
  assert.equal(JSON.parse(read("content/glossary-summary.json")).count,terms.length);
  assert.doesNotMatch(launcher,/glossary\\.json/);
  assert.match(css,/\.corpus-glossary-fab\{left:/);
  assert.match(css,/\.paper-back-to-top\{right:/);
});
