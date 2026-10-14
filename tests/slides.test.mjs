import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const catalog=fs.readFileSync(path.join(root,'lib/papers.ts'),'utf8');
const slugs=[...catalog.matchAll(/\bslug:\s*"([^"]+)"/g)].map(m=>m[1]);
const contentDir=path.join(root,'content/slides');
const allSlides=slugs.map(slug=>({slug,slides:JSON.parse(fs.readFileSync(path.join(contentDir,`${slug}.json`),'utf8'))}));

const expectedTypes=['cover','problem','contrast','intuition','concepts','pipeline','representation','training','inference','equation','results','ablation','limits','relations','closing'];

test('22 slide decks each contain 15 carefully structured editorial slides',()=>{
 assert.equal(slugs.length,22);
 assert.equal(allSlides.length,22);
 assert.deepEqual(fs.readdirSync(contentDir).filter(x=>x.endsWith('.json')).sort(),slugs.map(s=>s+'.json').sort());
 for(const {slug,slides} of allSlides){
  assert.equal(slides.length,15,`${slug}: expected 15 slides`);
  assert.deepEqual(slides.map(s=>s.type),expectedTypes,`${slug}: storytelling structure changed`);
  for(const [i,slide] of slides.entries()){
   assert.ok(slide.title && slide.title.length>8,`${slug} / ${i+1}: title missing`);
   assert.ok(slide.lead && slide.lead.length>35,`${slug} / ${i+1}: claim must be substantial`);
   assert.ok(slide.intuition && slide.intuition.length>25,`${slug} / ${i+1}: needs intuitive explanation`);
   assert.ok(Array.isArray(slide.items)&&slide.items.length,`${slug} / ${i+1}: no substantial visual elements`);
   assert.ok(slide.detail?.label?.length>=8,`${slug} / ${i+1}: missing explanation heading`);
   assert.ok(slide.detail?.text?.length>=80,`${slug} / ${i+1}: explanation is too thin`);
   assert.ok(slide.detail.text.length<=490,`${slug} / ${i+1}: explanation is too long for a readable slide`);
   const plain=JSON.stringify(slide);
   assert.doesNotMatch(plain,/trực giác/iu,`${slug} / ${i+1}: use Intuition instead`);
   assert.doesNotMatch(plain,/\bTODO\b|\bTBD\b|lorem ipsum/i,`${slug} / ${i+1}: placeholder`);
  }
  assert.ok(new Set(slides.map(s=>s.detail.text)).size>=13,`${slug}: explanatory content repeats too much`);
  assert.match(slides[9].equation,/\\/,`${slug}: mathematical intuition must have valid LaTeX`);
  assert.equal(slides[10].items.length,2,`${slug}: evidence slide must have at least two contextualized points`);
 }
});

test('presenter is reachable from each reader and supports navigation, notes, fullscreen, grid, and deep links',()=>{
 const ui=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
 const reader=fs.readFileSync(path.join(root,'components/paper-reader.tsx'),'utf8');
 const server=fs.readFileSync(path.join(root,'app/paper/[slug]/page.tsx'),'utf8');
 for(const phrase of ['requestFullscreen','ArrowRight','ArrowLeft','Home','End','keydown','aria-label="Xem tất cả slide"','GHI CHÚ KHI TRÌNH BÀY','updateDeepLink'])assert.ok(ui.includes(phrase),`Missing presentation feature ${phrase}`);
 assert.match(reader,/tab==="slides"&&<motion\.div[\s\S]*<SlideDeck /);
 assert.match(reader,/new URLSearchParams\(window.location.search\)/);
 const route=fs.readFileSync(path.join(root,'app/api/papers/[slug]/slides/route.ts'),'utf8');
 assert.doesNotMatch(server,/getResearchSlides\(slug\)/,'Slide JSON must not be serialized into the initial page');
 assert.match(route,/getResearchSlides\(slug\)/);
 assert.match(reader,/loadDeck\(paper\.slug\)/);
 assert.match(reader,/deckCache\.set\(slug, deck\)/);
});


test('Intuition lines are tied to each paper rather than boilerplate shared across all decks',()=>{
 const frequency=new Map();
 for(const {slides} of allSlides) for(const slide of slides) {
  const key=slide.intuition.toLowerCase().trim();
  frequency.set(key,(frequency.get(key)||0)+1);
 }
 const repeated=[...frequency].filter(([_,n])=>n>=5);
 assert.deepEqual(repeated,[],`Repeated generic Intuition across decks: ${repeated.map(([s,n])=>n+' x '+s).join(' | ')}`);
});

test('each slide preserves its own claim and matches its research type',()=>{
 for(const {slug,slides} of allSlides){
  assert.equal(new Set(slides.map(s=>s.type)).size,slides.length,`${slug}: slide ids not stable`);
  assert.ok(slides.some(s=>s.type==='equation'&&s.lead.length>=45),`${slug}: formula lacks immediate plain-language meaning`);
  assert.ok(slides.some(s=>s.type==='limits'&&s.items.length>=2),`${slug}: limitations are one-sided`);
 }
});

test('RTC Training-Time projects concise visuals and reserves all narration for presenter notes',()=>{
 const slides=allSlides.find(p=>p.slug==='rtc-training')?.slides;
 assert.equal(slides?.length,15,'RTC training deck should remain 15 slides');
 assert.ok(slides.every(s=>s.stageMode==='visual-first'),'Every RTC slide must hide presenter details on canvas');
 assert.ok(slides.every(s=>s.detail?.text?.length>=80),'Extended explanation must remain available in notes');
 assert.ok(slides.every(s=>s.lead.length<=100),'Projected leads must be short');
 assert.ok(slides.filter(s=>s.figure).length>=9,'Keep original-paper imagery');
 const component=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
 assert.match(component,/const visualFirst=slide\?\.stageMode==="visual-first"/);
 assert.match(component,/slide\.detail&&!audienceOnly&&<aside/);
 assert.match(component,/!audienceOnly&&slide\.type!=="cover"/);
 assert.match(component,/notes&&<div className="brief-speaker-notes"/);
 assert.match(component,/slide\.detail&&<p><strong>\{slide\.detail\.label\}/);
});

test('Presenter View isolates all private speaker text in a separate document',()=>{
 const ui=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
 const panel=fs.readFileSync(path.join(root,'components/presenter-panel.tsx'),'utf8');
 const css=fs.readFileSync(path.join(root,'app/briefing.css'),'utf8');
 assert.match(ui,/documentPictureInPicture/,'Use Chromium Document Picture-in-Picture for private notes');
 assert.match(ui,/api\.requestWindow\(/,'A user click requests the popup');
 assert.match(ui,/presenterWindow\?createPortal\(audience,document\.body\):audience/,'Shared slide is presented at viewport root');
 assert.match(ui,/const audienceOnly=visualFirst\|\|Boolean\(presenterWindow\)/,'Hide detailed prose for every deck while presenting');
 assert.match(ui,/notes&&!presenterWindow&&<div className="brief-speaker-notes"/,'Never put notes in the shared window while presenting');
 assert.match(ui,/slide\.detail&&!audienceOnly&&<aside/,'Hide private explanatory panel in audience projection');
 assert.match(ui,/presenterWindow\?\.addEventListener\("keydown",handler\)/,'Keys work from the private popup');
 assert.match(ui,/popup\.addEventListener\("pagehide",handleClose\)/,'Private window closing is handled');
 assert.match(panel,/createPortal\(/,'Notes render in a separate DOM document');
 assert.match(panel,/popup\.document\.body/,'Notes go only to the private popup');
 assert.match(panel,/data-private-presenter/);
 assert.match(panel,/GHI CHÚ CHỈ MÀY NHÌN THẤY/);
 assert.match(panel,/Không chia sẻ toàn màn hình/);
 assert.match(css,/\.brief-deck-presenting\{position:fixed/);
 assert.match(css,/\.brief-deck-presenting \.brief-deck-toolbar/);
 assert.ok(fs.existsSync(path.join(root,'public/presenter-view.css')),'Popup stylesheet bundled');
});
