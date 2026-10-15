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

test('RTC Training-Time preserves the technical teaching sequence from the reviewed afternoon deck',()=>{
 const slides=allSlides.find(p=>p.slug==='rtc-training')?.slides;
 assert.equal(slides?.length,15);
 const titles=[
   "TRAINING-TIME RTC",
   "Độ trễ suy luận so với chu kỳ điều khiển",
   "RTC tại thời điểm suy luận: hiệu chỉnh lúc sinh hành động",
   "Ví dụ nối đoạn trong thao tác pha espresso",
   "Ba tham số của cơ chế nối đoạn",
   "Huấn luyện với tiền tố hành động cố định",
   "Vì sao chỉ cố định d hành động đầu?",
   "Mô hình nhận biết phần cố định như thế nào?",
   "Quy trình nối đoạn khi suy luận",
   "Hàm mất mát trên hậu tố hành động",
   "Kết quả mô phỏng theo độ trễ suy luận",
   "Robot thật: độ trễ thấp hơn trong thiết lập thử nghiệm",
   "Giới hạn của phương pháp",
   "So sánh hai phiên bản RTC",
   "Kết luận và phạm vi kết quả"
 ];
 assert.deepEqual(slides.map(s=>s.title),titles,'Preserve the researched RTC narrative and approved neutral titles');
 assert.match(slides[1].lead,/50 Hz.*20 ms.*100 ms/);
 assert.match(slides[2].intuition,/pseudoinverse guidance.*backprop/);
 assert.match(slides[4].lead,/H là số hành động.*s là khoảng cách.*d là độ trễ/);
 assert.deepEqual(slides[5].items,[
  'Lấy đoạn hành động mẫu và chọn ngẫu nhiên d',
  'Giữ d hành động đầu không thêm nhiễu (τᵢ = 1)',
  'Thêm nhiễu vào hậu tố, dự đoán trường vận tốc',
  'Chỉ tính hàm mất mát trên hậu tố'
 ]);
 assert.match(slides[6].lead,/H−s.*d bước/);
 assert.match(slides[7].lead,/τᵢ = 1.*flow matching/);
 assert.match(slides[8].lead,/t\+d/);
 assert.match(slides[9].equation,/\\mathbb E.*\\sum_\{i=d\+1\}/);
 assert.match(slides[10].lead,/2\.048.*Wilson 95%/);
 assert.match(slides[11].lead,/8\.000 bước.*batch 512/);
 assert.match(slides[12].lead,/soft masking/);
 assert.match(JSON.stringify(slides[13].items),/pseudoinverse guidance/);
 assert.match(slides[14].lead,/gradient/);
 assert.ok(slides.every(s=>s.detail.label==='GIẢI THÍCH BỔ SUNG'||s.detail.label==='DIỄN GIẢI CÔNG THỨC'));
 assert.doesNotMatch(JSON.stringify(slides),/Kết luận trước giáo viên hướng dẫn|Một cú nén espresso giải thích được toàn bộ bài toán|Đừng nhầm|bốc thăm/);
 assert.ok(slides.every(s=>s.stageMode==='visual-first'),'Presenter narration stays off the projected slide');
 assert.equal(slides.filter(s=>s.figure).length,9,'Keep nine paper figure appearances');
 assert.ok(slides.every(s=>s.detail?.text?.length>=80),'Speaker notes remain available for every slide');
});


test('RTC Training deck explains inference-time Jacobian overhead and its measured scope',()=>{
 const deck=JSON.parse(fs.readFileSync(path.join(contentDir,'rtc-training.json'),'utf8'));
 assert.match(deck[2].title,/VJP/);
 assert.match(deck[2].lead,/Jacobian product|vector–Jacobian/);
 assert.match(deck[2].intuition,/Training-Time RTC/);
 assert.match(deck[13].lead,/không loại các lượt forward/);
 const component=fs.readFileSync(path.join(root,'components/slide-deck.tsx'),'utf8');
 assert.match(component,/RtcInferenceCostBridge/);
 assert.match(component,/frac\\\\partial|partial\\\\widehat/);
 assert.match(component,/T_\\\\mathrm\{VJP\}/);
});
test('Slide projection has container-aware responsive figure and fullscreen rules',()=>{
 const css=fs.readFileSync(path.join(root,'app/briefing.css'),'utf8');
 assert.match(css,/container-type:inline-size/);
 assert.match(css,/@container \(max-width:850px\)/);
 assert.match(css,/\.brief-slide-stage:fullscreen \.brief-source-image/);
 assert.match(css,/@media\(max-height:690px\)/);
 assert.match(css,/\.brief-rtc-cost-pair/);
});
