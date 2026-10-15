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

test('21 traditional decks retain 15 slides, while RTC Training uses a focused 10-slide talk',()=>{
 assert.equal(slugs.length,22);
 assert.equal(allSlides.length,22);
 assert.deepEqual(fs.readdirSync(contentDir).filter(x=>x.endsWith('.json')).sort(),slugs.map(s=>s+'.json').sort());
 for(const {slug,slides} of allSlides){
  assert.equal(slides.length,slug==='rtc-training'?10:15,`${slug}: wrong slide count`);
  if(slug!=='rtc-training')assert.deepEqual(slides.map(s=>s.type),expectedTypes,`${slug}: storytelling structure changed`);
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
  assert.match(slides[slug==='rtc-training'?6:9].equation,/\\/,`${slug}: mathematical explanation needs LaTeX`);
  assert.equal(slides[slug==='rtc-training'?8:10].items.length,2,`${slug}: evidence slide must have two contextualized points`);
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
  assert.ok(slug==='rtc-training'||slides.some(s=>s.type==='limits'&&s.items.length>=2),`${slug}: limitations are one-sided`);
 }
});

test('RTC Training-Time projects concise visuals and reserves all narration for presenter notes',()=>{
 const slides=allSlides.find(p=>p.slug==='rtc-training')?.slides;
 assert.equal(slides?.length,10,'RTC training has exactly ten purposeful slides');
 assert.ok(slides.every(s=>s.stageMode==='visual-first'),'Every RTC slide must hide presenter details on canvas');
 assert.ok(slides.every(s=>s.detail?.text?.length>=80),'Extended explanation must remain available in notes');
 assert.ok(slides.every(s=>s.lead.length<=220),'Projected leads should explain the scientific claim without becoming a script');
 assert.equal(slides.filter(s=>s.figure).length,4,'Only four unique original-paper figures, no repeats');
 assert.equal(new Set(slides.flatMap(s=>s.figure?[s.figure.src]:[])).size,4,'Never repeat the same paper figure');
 const component=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
 assert.match(component,/const visualFirst=slide\?\.stageMode==="visual-first"/);
 assert.match(component,/slide\.detail&&!audienceOnly&&<aside/);
 assert.match(component,/!audienceOnly&&slide\.type!=="cover"/);
 assert.match(component,/notes&&!presenterWindow&&<div className="brief-speaker-notes"/);
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
 assert.match(ui,/presenterWindow\.addEventListener\("pagehide",handleClose\)/,'Private window closing is handled');
 assert.match(panel,/createPortal\(/,'Notes render in a separate DOM document');
 assert.match(panel,/popup\.document\.body/,'Notes go only to the private popup');
 assert.match(panel,/data-private-presenter/);
 assert.match(panel,/GHI CHÚ RIÊNG TƯ/);
 assert.match(panel,/Không chia sẻ toàn màn hình/);
 assert.match(css,/\.brief-deck-presenting\{position:fixed/);
 assert.match(css,/\.brief-deck-presenting \.brief-deck-toolbar/);
 assert.ok(fs.existsSync(path.join(root,'public/presenter-view.css')),'Popup stylesheet bundled');
});

test('RTC has exactly ten nonredundant research questions in the correct narrative order',()=>{
 const slides=allSlides.find(p=>p.slug==='rtc-training')?.slides;
 assert.ok(slides);
 assert.deepEqual(slides.map(s=>s.title),[
  'TRAINING-TIME RTC',
  'Nhắc lại RTC gốc trong 30 giây',
  'Vì sao RTC inference-time chậm hơn?',
  'Training-Time: hard prefix và cái giá của nó',
  'H, s, d: giữ bao nhiêu hành động?',
  'Huấn luyện: 3 thay đổi trong DiT',
  'Loss: chỉ học phần hành động chưa biết',
  'Lúc chạy: cùng giao diện, không còn VJP',
  'Kinetix: cải thiện rõ khi delay lớn',
  'Robot thật: giảm latency, giữ hiệu quả gần nhau'
 ]);
 assert.deepEqual(slides.map(s=>s.type),['cover','problem','contrast','representation','concepts','pipeline','equation','inference','results','ablation']);
 assert.deepEqual(slides.map(s=>s.visual??null),[null,null,null,'mask-tradeoff','horizon-timeline',null,null,'trained-runtime',null,null]);
 assert.deepEqual(slides.map(s=>s.figure?.src??null).filter(Boolean),[
 '/paper-figures/rtc-training/figure-1.webp','/paper-figures/rtc-training/figure-2.webp',
 '/paper-figures/rtc-training/figure-3.webp','/paper-figures/rtc-training/figure-5.webp']);
 assert.match(slides[1].speakerScript.join(' '),/RTC.*cũ/);
 assert.match(slides[2].intuition,/VJP/);
 assert.match(slides[3].speakerScript.join(' '),/tại sao không huấn luyện luôn phần vàng/i);
 assert.match(slides[3].detail.text,/không chứng minh rằng không thể/);
 assert.match(slides[4].detail.text,/H=16,s=7,d=5/);
 assert.match(slides[4].items[0].value,/d ≤ H−s/);
 assert.match(slides[5].lead,/τᵢ=1/);
 assert.match(slides[6].equation,/\\mathbb E/);
 assert.match(slides[6].detail.text,/Eq\. \(2\)/);
 assert.match(slides[7].intuition,/Drop-in replacement/);
 assert.match(slides[8].detail.text,/24 epoch.*8 epoch/);
 assert.match(slides[9].detail.text,/Wilson 68%/);
 assert.ok(!slides.some(s=>s.title.includes('espresso trong thao tác')),'Do not waste a slide retelling a prior RTC example');
});
test('RTC viva notes cover every slide with labeled paper evidence and honest limitations',()=>{
 const slides=allSlides.find(p=>p.slug==='rtc-training')?.slides;
 assert.ok(slides);
 for(const [i,slide] of slides.entries()){
  assert.ok(slide.defenseQA && slide.defenseQA.length>=3,`Slide ${i+1} needs rigorous viva QAs`);
  for(const qa of slide.defenseQA){
   assert.ok(qa.question.length>18 && qa.answer.length>50, `Slide ${i+1}: answer must explain why`);
   assert.match(qa.source,/arxiv|RTC/i,`Slide ${i+1}: cite source or label analysis`);
  }
  assert.ok(slide.speakerScript?.length>=3,`Slide ${i+1}: spoken script missing`);
 }
 assert.ok(slides.reduce((n,s)=>n+(s.defenseQA?.length??0),0)>=35,'Coverage requires 35+ real review QAs');
 const component=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
 const popup=fs.readFileSync(path.join(root,'components/presenter-panel.tsx'),'utf8');
 assert.match(component,/brief-defense-notes/);
 assert.match(popup,/presenter-defense/);
 assert.match(component,/slide\.defenseQA\.map/);
 assert.match(popup,/slide\.defenseQA\.map/);
});
test('RTC guidance explains diagonal mask through complete equations',()=>{
 const component=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
 const slides=allSlides.find(p=>p.slug==='rtc-training')?.slides;
 const guidance=component.slice(component.indexOf('function RtcInferenceCostBridge'),component.indexOf('function SlideVisual'));
 assert.ok(guidance.includes('const weightedError=String.raw'),'Compute named weighted error first');
 assert.ok(guidance.includes('const perActionError=String.raw'),'Expand the matrix operation to per-action weights');
 assert.ok(guidance.includes('const vjp=String.raw'),'Define the intermediate VJP explicitly');
 assert.ok(guidance.includes('const guidedVelocity=String.raw'),'Finish the derivation with an explicit guided velocity');
 assert.ok(guidance.includes(String.raw`\mathbf e=`),'Weighted error has an equals sign');
 assert.ok(guidance.includes(String.raw`\mathbf e_i=W_i(`),'Scalar per-position equality explains diag(W)');
 assert.ok(guidance.includes(String.raw`\mathbf g=`),'VJP has an equals sign');
 assert.ok(guidance.includes(String.raw`\mathbf v_{\Pi\mathrm{GDM}}=`),'Guided velocity has an equals sign');
 assert.ok(guidance.includes(String.raw`\operatorname{diag}(\mathbf W)`),'Weights use a diagonal matrix');
 assert.ok(guidance.includes('ma trận đường chéo'),'Diagonal matrix must be explained in projected prose');
 assert.ok(guidance.includes('Wᵢ = 1')&&guidance.includes('Wᵢ = 0'),'Define hard and zero mask values');
 assert.ok(guidance.includes('0 &lt; Wᵢ &lt; 1'),'Define soft overlap weights');
 assert.ok(guidance.includes(String.raw`\mathbf v_\pi`),'Use vπ from the original inference-time paper');
 assert.ok(!guidance.includes(String.raw`\mathbf v_\theta`),'Do not silently rename the original velocity field');
 assert.ok(!guidance.includes(String.raw`\begin{aligned}`),'Avoid unmarked line-wrap inside one matrix product');
 assert.match(guidance,/T_\{\\mathrm\{VJP\}\}/,'Keep runtime overhead linked to VJP');
 assert.match(slides[2].speakerScript.join(' '),/diag W.*đường chéo/);
 assert.match(slides[2].speakerScript.join(' '),/v pi/);
 assert.doesNotMatch(slides[2].speakerScript.join(' '),/v theta/);
 assert.match(slides[6].speakerScript.join(' '),/v theta/,'Explain vθ in training flow-matching loss');
 assert.match(slides[6].speakerScript.join(' '),/v theta/);
});

test('Slide projection has container-aware responsive figure and fullscreen rules',()=>{
 const css=fs.readFileSync(path.join(root,'app/briefing.css'),'utf8');
 assert.match(css,/container-type:inline-size/);
 assert.match(css,/@container \(max-width:850px\)/);
 assert.match(css,/\.brief-slide-stage:fullscreen \.brief-source-image/);
 assert.match(css,/@media\(max-height:690px\)/);
 assert.match(css,/\.brief-rtc-cost-pair/);
});

test('RTC Training has ten distinct talk tracks and evidence-grounded defense QAs',()=>{
 const slides=allSlides.find(p=>p.slug==='rtc-training')?.slides;
 assert.ok(slides && slides.length===10);
 for(const [index,slide] of slides.entries()){
   assert.ok(slide.speakerScript?.length>=3,`RTC slide ${index+1} needs a spoken beginning, explanation and transition`);
   const paragraphs=slide.speakerScript;
   assert.ok(paragraphs.every(p=>p.length>=100),`RTC slide ${index+1}: fragmentary script paragraph`);
   assert.ok(paragraphs.join(' ').split(' ').length>=(index===1?70:120),`RTC slide ${index+1}: talk track too short to explain the paper`);
   if(index===1)assert.ok(paragraphs.join(' ').split(' ').length<=135,'Inference-time recap must be brief');
   assert.notEqual(paragraphs[0],slide.lead,`RTC slide ${index+1}: script cannot simply repeat the projected lead`);
 }
 assert.equal(new Set(slides.map(s=>s.speakerScript.join(' '))).size,10,'Scripts cannot be identical');
 const panel=fs.readFileSync(path.join(root,'components/presenter-panel.tsx'),'utf8');
 const deck=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
 assert.match(panel,/presenter-script/);
 assert.match(panel,/scrollRef\.current\.scrollTop=0/,'Reset presenter notes scroll between slides');
 assert.match(deck,/brief-speaker-script/);
 assert.match(panel,/slide\.speakerScript\.map/);
 assert.match(deck,/slide\.speakerScript\.map/);
 assert.ok(!deck.includes('slide.speakerScript.map') || deck.indexOf('slide.speakerScript.map')>deck.indexOf('brief-speaker-notes'), 'Scripts render in Notes only');
});
