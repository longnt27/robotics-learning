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
 assert.ok(slides.every(s=>s.lead.length<=220),'Projected leads should explain the scientific claim without becoming a script');
 assert.ok(slides.filter(s=>s.figure).length>=9,'Keep original-paper imagery');
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

test('RTC Training follows the requested scientific story with exact notation',()=>{
 const slides=allSlides.find(p=>p.slug==='rtc-training')?.slides;
 assert.equal(slides?.length,15);
 assert.deepEqual(slides.map(s=>s.title),[
   'TRAINING-TIME RTC',
   'Nhắc lại nhanh: RTC inference-time',
   'Vì sao RTC inference-time chậm hơn?',
   'Ý tưởng trung tâm: học tiếp nối từ tiền tố',
   'H, s và d quyết định tiền tố cần giữ',
   'Quy trình huấn luyện với tiền tố cố định',
   'Chỉ giữ cứng d bước, không khóa cả vùng chồng',
   'Làm sao mô hình biết token nào đã cố định?',
   'Suy luận bằng mô hình đã học tiền tố',
   'Hàm mất mát chỉ tính trên phần cần sinh',
   'Mô phỏng: hiệu quả khi độ trễ tăng',
   'Robot thật: giữ hiệu quả, giảm độ trễ tính toán',
   'Giới hạn cần nhớ của Training-Time RTC',
   'Triển khai: đổi cách học, giữ giao diện chạy',
   'Kết luận: học ràng buộc trước khi chạy'
 ]);
 assert.match(slides[1].lead,/thực thi đoạn cũ.*sinh đoạn mới/);
 assert.match(slides[2].lead,/vector–Jacobian|VJP/);
 assert.match(slides[3].title,/Ý tưởng trung tâm/);
 assert.equal(slides[3].figure?.src,'/paper-figures/rtc-training/figure-2.webp',
   'The training method cannot be introduced using an unrelated espresso experiment photo');
 assert.match(slides[4].lead,/H là độ dài.*s là số bước.*d là độ trễ/);
 assert.match(slides[4].intuition,/d ≤ H−s/);
 assert.deepEqual(slides[5].items,[
  'Lấy đoạn hành động mẫu và chọn ngẫu nhiên d',
  'Giữ d hành động đầu không thêm nhiễu (τᵢ = 1)',
  'Thêm nhiễu vào hậu tố, dự đoán trường vận tốc',
  'Chỉ tính hàm mất mát trên hậu tố'
 ]);
 assert.match(slides[6].lead,/H−s.*d hành động đầu/);
 assert.match(slides[7].lead,/τᵢ = 1/);
 assert.match(slides[8].lead,/đoạn B/);
 assert.match(slides[9].equation,/\\mathbb E.*\\sum_\{i=d\+1\}/);
 assert.match(slides[9].items[0],/không phải một phương trình trích nguyên văn/);
 assert.match(JSON.stringify(slides[10]),/2\.048|2.048/);
 assert.match(slides[11].detail.text,/8\.000 bước.*512.*H100/);
 assert.match(slides[12].detail.text,/soft masking/);
 assert.deepEqual(slides[13].items.map(i=>i.label),['KHI HUẤN LUYỆN','KHI TRIỂN KHAI']);
 assert.match(slides[14].lead,/VJP/);
 assert.ok(slides.every(s=>s.detail.label==='GIẢI THÍCH BỔ SUNG'||s.detail.label==='DIỄN GIẢI CÔNG THỨC'));
 assert.ok(slides.every(s=>s.stageMode==='visual-first'),'Narration never belongs on the projected slide');
 assert.equal(slides.filter(s=>s.figure).length,9);
});

test('RTC guidance original vπ and new training vθ never silently swap',()=>{
 const component=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
 const slides=allSlides.find(p=>p.slug==='rtc-training')?.slides;
 const guidance=component.slice(component.indexOf('function RtcInferenceCostBridge'),component.indexOf('function SlideVisual'));
 assert.match(guidance,/\\mathbf v_\\pi/,'Guidance formula uses vπ as the original RTC Algorithm 1');
 assert.match(guidance,/\\gamma_\\tau/,'Guidance coefficient must not be undefined');
 assert.match(guidance,/\\min\\left\(\\beta/,'Original guidance clipping must be explicitly defined');
 assert.match(guidance,/r_\\tau\^2=\\frac/,'Guidance variance term must be defined');
 assert.match(guidance,/\\mathrm\{VJP\}/,'Show the expensive VJP in latency accounting');
 assert.doesNotMatch(guidance,/const guidance=[\s\S]*?\\mathbf v_\\theta/,'Do not call original RTC vθ in the visual equation');
 assert.match(slides[2].speakerScript.join(' '),/v\)? pi/,'Spoken walkthrough must call the visible velocity vπ');
 assert.doesNotMatch(slides[2].speakerScript.join(' '),/v theta/,'Never say vθ while showing original vπ');
 assert.match(slides[3].speakerScript.join(' '),/v theta/,'Introduce vθ when starting the training paper');
 assert.match(slides[9].speakerScript.join(' '),/v theta/,'Masked loss walkthrough must call learned field vθ');
 assert.doesNotMatch(slides[3].speakerScript.join(' '),/espresso|nén cà phê/,'Training intro must not revert to inference-time example');
});

test('Slide projection has container-aware responsive figure and fullscreen rules',()=>{
 const css=fs.readFileSync(path.join(root,'app/briefing.css'),'utf8');
 assert.match(css,/container-type:inline-size/);
 assert.match(css,/@container \(max-width:850px\)/);
 assert.match(css,/\.brief-slide-stage:fullscreen \.brief-source-image/);
 assert.match(css,/@media\(max-height:690px\)/);
 assert.match(css,/\.brief-rtc-cost-pair/);
});

test('RTC Training has fifteen distinct, complete talk tracks ready to speak aloud',()=>{
 const slides=allSlides.find(p=>p.slug==='rtc-training')?.slides;
 assert.ok(slides && slides.length===15);
 for(const [index,slide] of slides.entries()){
   assert.ok(slide.speakerScript?.length>=3,`RTC slide ${index+1} needs a spoken beginning, explanation and transition`);
   const paragraphs=slide.speakerScript;
   assert.ok(paragraphs.every(p=>p.length>=100),`RTC slide ${index+1}: fragmentary script paragraph`);
   assert.ok(paragraphs.join(' ').split(' ').length>=(index===1?70:120),`RTC slide ${index+1}: talk track too short to explain the paper`);
   if(index===1)assert.ok(paragraphs.join(' ').split(' ').length<=135,'Inference-time recap must be brief');
   assert.notEqual(paragraphs[0],slide.lead,`RTC slide ${index+1}: script cannot simply repeat the projected lead`);
 }
 assert.equal(new Set(slides.map(s=>s.speakerScript.join(' '))).size,15,'Scripts cannot be identical');
 const panel=fs.readFileSync(path.join(root,'components/presenter-panel.tsx'),'utf8');
 const deck=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
 assert.match(panel,/presenter-script/);
 assert.match(panel,/scrollRef\.current\.scrollTop=0/,'Reset presenter notes scroll between slides');
 assert.match(deck,/brief-speaker-script/);
 assert.match(panel,/slide\.speakerScript\.map/);
 assert.match(deck,/slide\.speakerScript\.map/);
 assert.ok(!deck.includes('slide.speakerScript.map') || deck.indexOf('slide.speakerScript.map')>deck.indexOf('brief-speaker-notes'), 'Scripts render in Notes only');
});
