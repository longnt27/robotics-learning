import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Next.js did not become ready at ${baseUrl}`);
}

await waitForServer();
const browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
try {
  for (const viewport of [{width: 1280, height: 800}, {width: 390, height: 844}]) {
    const page = await browser.newPage({viewport});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(baseUrl, {waitUntil: 'networkidle'});
    await page.getByRole('tab', {name: /SƠ ĐỒ DAG/i}).click();
    await page.locator('.react-flow__node').first().waitFor();
    const nodeCount = await page.locator('.react-flow__node').count();
    assert.equal(nodeCount, 22, `Expected all 22 DAG nodes at ${viewport.width}px`);

    const getZoom = () => page.locator('.react-flow__viewport').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
    await page.locator('.graph-canvas').scrollIntoViewIfNeeded();
    const before = await getZoom();
    const box = await page.locator('.graph-canvas').boundingBox();
    assert.ok(box, 'Graph canvas is displayed');
    const target = await page.evaluate(({x,y}) => ({tag: document.elementFromPoint(x,y)?.tagName, className: String(document.elementFromPoint(x,y)?.className || ''), viewportHeight: window.innerHeight, scrollY: window.scrollY}), {x:box.x + box.width/2, y:box.y + box.height/2});
    console.log('DAG wheel target', {viewport, canvas:box, target});
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -450);
    await page.waitForTimeout(350);
    const after = await getZoom();
    assert.ok(after > before * 1.02, `Wheel should zoom DAG (${before} -> ${after}) at ${viewport.width}px`);
    assert.equal(await page.locator('.react-flow__node').count(), 22, 'Zoom should not unmount nodes');

    await page.getByRole('button', {name: 'Hiện toàn bộ sơ đồ'}).click();
    await page.waitForTimeout(470);
    assert.equal(await page.locator('.react-flow__node').count(), 22, 'Fit should restore full DAG visibility');

    const font = await page.locator('body').evaluate(el => getComputedStyle(el).fontFamily);
    assert.match(font, /montserrat/i, `Body font should be Montserrat at ${viewport.width}px`);
    const vietnameseFontLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].some(font => font.family.toLowerCase().includes('montserrat') && font.status === 'loaded');
    });
    assert.ok(vietnameseFontLoaded, 'Montserrat Vietnamese glyph range must be loaded');
    // The dictionary is available site-wide; the back-to-top belongs only to paper pages.
    assert.equal(await page.getByRole("button",{name:"Về đầu trang"}).count(),0,"Do not show scroll-top on homepage");
    const trigger=page.getByRole("button",{name:"Mở từ điển thuật ngữ"});
    const launcherBox=await trigger.boundingBox();
    assert.ok(launcherBox && launcherBox.x<viewport.width/3,"Glossary trigger stays on the left");
    await trigger.click();
    const glossary=page.getByRole("dialog",{name:"Từ điển robotics"});
    await glossary.waitFor({state:"visible"});
    const field=glossary.getByRole("searchbox",{name:"Tìm thuật ngữ"});
    await field.fill("flow matching");
    assert.ok(await glossary.getByRole("heading",{name:"Flow matching"}).isVisible());
    await field.fill("RTC");
    assert.equal(await glossary.locator(".corpus-glossary-entry h3").first().innerText(),"RTC",
      "Acronym match must outrank incidental definition matches");
    assert.equal(await glossary.locator('.corpus-glossary-entry').first().locator('a[href="/paper/rtc-inference"]').count(),1);
    await field.fill("hoc lien tuc");
    assert.ok(await glossary.getByRole("heading",{name:"Continual learning"}).isVisible(),
      "Vietnamese searches without diacritics work");
    await field.fill("khongcotuthuatngunay");
    assert.ok(await glossary.getByText("Không tìm thấy thuật ngữ").isVisible());
    await page.keyboard.press("Escape");
    await glossary.waitFor({state:"hidden"});
    assert.equal(await page.evaluate(()=>document.body.style.overflow),"","Glossary unlocks document scrolling");
    assert.equal(await trigger.getAttribute("aria-expanded"),"false");
    assert.ok(await trigger.evaluate(el=>document.activeElement===el),"Focus returns to glossary trigger");
    const xOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert.ok(xOverflow<=2,"Floating glossary must not overflow "+viewport.width+"px viewport");
    assert.deepEqual(errors, [], `No browser JS runtime errors at ${viewport.width}px`);
    console.log(`PASS: ${viewport.width}x${viewport.height} · 22 nodes · wheel zoom ${before.toFixed(2)} -> ${after.toFixed(2)} · Montserrat VI`);
    await page.close();
  }
  // Hero cleanup and native, first-party PDF preview (desktop + mobile).
  for (const viewport of [{width:1280,height:800},{width:390,height:844}]) {
    const pdfPage=await browser.newPage({viewport});
    const pdfErrors=[];
    pdfPage.on("pageerror",error=>pdfErrors.push(error.message));
    // Keep browser tests independent of arXiv uptime. Unit tests separately
    // verify that the PDF proxy streams the original bytes and byte ranges.
    await pdfPage.route("**/api/papers/*/pdf**",route=>route.fulfill({
      status:200,contentType:"application/pdf",body:"%PDF-1.7\n"
    }));
    await pdfPage.goto(baseUrl+"/paper/vima",{waitUntil:"domcontentloaded"});
    const hero=pdfPage.locator(".paper-hero");
    await hero.waitFor({state:"visible"});
    const visibleText=await hero.innerText();
    assert.ok(visibleText.includes("VIMA") && visibleText.includes("ICML 2023"),
      "Keep real title and publication");
    assert.ok(!visibleText.includes("BÀI NGHIÊN CỨU /"),
      "Remove redundant manuscript/year counter");
    assert.ok(!visibleText.includes("DIỄN GIẢI TIẾNG VIỆT"),
      "Remove redundant Vietnamese explanation metadata");
    assert.ok(!visibleText.includes("Nền tảng và suy luận"),
      "Remove purple category label from the hero");
    assert.ok(!visibleText.includes("BÀI\nNGHIÊN CỨU"),
      "Remove decorative paper label beneath the orb");

    await hero.getByRole("button",{name:/XEM PDF TẠI ĐÂY/i}).click();
    const pdfTab=pdfPage.getByRole("tab",{name:/PDF GỐC/i});
    assert.equal(await pdfTab.getAttribute("aria-selected"),"true");
    assert.equal(new URL(pdfPage.url()).searchParams.get("tab"),"pdf");
    const pdfIframe=pdfPage.locator(".pdf-frame iframe");
    await pdfIframe.waitFor({state:"attached"});
    const pdfSrc=await pdfIframe.getAttribute("src");
    assert.equal(pdfSrc,"/api/papers/vima/pdf#toolbar=1&navpanes=0");
    assert.equal(new URL(pdfSrc,baseUrl).origin,new URL(baseUrl).origin,
      "Embedded original PDF should be same-origin");
    assert.equal(await pdfIframe.getAttribute("title"),"VIMA – PDF bài báo gốc");
    assert.equal(await pdfPage.getByRole("link",{name:/MỞ TOÀN BỘ PDF/i}).getAttribute("href"),
      "https://arxiv.org/pdf/2210.03094",
      "Preserve access to the verified publisher original");

    // Direct links can open the same PDF tab without visiting the hero CTA.
    await pdfPage.goto(baseUrl+"/paper/vima?tab=pdf",{waitUntil:"domcontentloaded"});
    await pdfPage.waitForFunction(()=>{
      const tab=document.getElementById("reader-tab-pdf");
      return tab?.getAttribute("aria-selected")==="true";
    });
    const overflow=await pdfPage.evaluate(
      ()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert.ok(overflow<=2,"PDF embed must not overflow on "+viewport.width+"px");
    assert.deepEqual(pdfErrors,[],"No JS/hydration errors in PDF reader");
    await pdfPage.close();
  }
  console.log("PASS: inline original PDF route, cleaned hero and deep-linked PDF tab");

  // Verify resource links in both reading and PDF views, including unavailable official code.
  const resourcesPage = await browser.newPage({viewport: {width: 1280, height: 800}});
  await resourcesPage.route("**/api/papers/*/pdf**",route=>route.fulfill({status:200,contentType:"application/pdf",body:"%PDF-1.7\\n"}));
  for (const example of [
    {slug: 'fast', platform: 'Hugging Face', url: 'https://huggingface.co/physical-intelligence/fast'},
    {slug: 'palm-e', platform: 'GitHub', url: 'https://github.com/kyegomez/PALM-E'},
    {slug: 'qwen-vla', platform: 'GitHub', url: 'https://github.com/QwenLM/Qwen-VLA'},
    {slug: 'lingbot-vla-2', platform: 'Hugging Face', url: 'https://huggingface.co/robbyant/lingbot-vla-v2-6b'},
  ]) {
    await resourcesPage.goto(baseUrl + '/paper/' + example.slug, {waitUntil: 'domcontentloaded'});
    const link=resourcesPage.locator('.paper-resource-link[href="' + example.url + '"]');
    assert.equal(await link.count(),1,example.slug + ': expected visible source link');
    assert.ok(await link.isVisible(),example.slug + ': source link must be visible');
    assert.equal(await link.getAttribute('target'),'_blank');
    if (example.slug==='palm-e') assert.match(await link.innerText(),/không chính thức/i);
    if (example.slug==='qwen-vla') assert.match(await link.innerText(),/Trang dự án/i);
    await resourcesPage.getByRole('tab', {name: /PDF GỐC/i}).click();
    assert.ok(await link.isVisible(),example.slug + ': resource link must remain visible on PDF tab');
  }
  await resourcesPage.close();
  console.log('PASS: repository links visible on all reader tabs; official / community provenance labeled');
  // End-to-end regression for the user-visible source caption, generator markers
  // and the native fullscreen figure viewer on desktop and mobile.
  for (const viewport of [{width:1280,height:800},{width:390,height:844}]) {
    const chapterPage=await browser.newPage({viewport});
    const runtimeErrors=[];
    chapterPage.on('pageerror',error=>runtimeErrors.push(error.message));
    await chapterPage.goto(baseUrl+'/paper/libero',{waitUntil:'networkidle'});
    const figure=chapterPage.locator('.paper-source-figure').first();
    await figure.waitFor({state:'visible'});
    await chapterPage.evaluate(()=>document.querySelector('.paper-source-figure')?.scrollIntoView({block:'center'}));
    await chapterPage.waitForFunction(()=>{
      const img=document.querySelector('.paper-source-figure img');
      return Boolean(img && img.complete && img.naturalWidth>0);
    });

    assert.ok(await chapterPage.locator('.paper-source-figure').count()>2,
      'LIBERO should show more figures than the old two-figure hard-coded limit');
    const originalCaption=await figure.locator('.paper-figure-caption-text').innerText();
    assert.match(originalCaption,/^Figure 1: Top: LIBERO has four procedurally-generated task suites/i);
    assert.ok(originalCaption.length>280,'Show the complete original research caption, not the alt text');
    assert.ok(await figure.getByText('CHÚ THÍCH GỐC (TIẾNG ANH)').isVisible());
    assert.ok(await figure.getByText('BẢN DỊCH ĐÃ BIÊN TẬP').isVisible());
    const translated=await figure.locator('.paper-figure-caption-vi').innerText();
    assert.ok(translated.length>=75,'Vietnamese figure explanation must be substantive');
    assert.match(translated,/[àáạảãăâđèéẹẻẽêếìíịỉĩòóọỏõôốơớùúụủũưứỳýỵỷỹ]/i);
    assert.equal(await figure.locator('.paper-figure-source-link').getAttribute('href'),
      'https://arxiv.org/pdf/2306.03310#page=2');
    const prose=await chapterPage.locator('.markdown-body').innerText();
    assert.ok(!prose.includes('<!-- BEGIN EXTENDED WALKTHROUGH -->'),'No implementation comments in prose');
    assert.ok(!prose.includes('<!-- END EXTENDED WALKTHROUGH -->'),'No closing generator comments in prose');
    assert.ok(!prose.includes('Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo'),
      'No placeholder caption duplicated below figures');

    const trigger=figure.getByRole('button',{name:'Phóng to Hình 1 toàn màn hình'});
    await trigger.click();
    const dialog=chapterPage.getByRole('dialog',{name:'Xem Hình 1 toàn màn hình'});
    await dialog.waitFor({state:'visible'});
    const dimensions=await dialog.boundingBox();
    assert.ok(dimensions && dimensions.width>=viewport.width-4 && dimensions.height>=viewport.height-4,
      'Full-screen lightbox must fill the current viewport');
    const expanded=dialog.locator('.paper-figure-lightbox-canvas img');
    await chapterPage.waitForFunction(()=>{
      const img=document.querySelector('.paper-figure-lightbox-canvas img');
      return Boolean(img && img.complete && img.naturalWidth>0);
    });
    assert.match(await dialog.locator('.paper-figure-modal-en').innerText(),
      /^Figure 1: Top: LIBERO has four procedurally-generated task suites/i);
    assert.equal(await dialog.locator('.paper-figure-modal-vi').innerText(),translated);
    await dialog.getByRole('button',{name:'Xem ảnh ở kích thước gốc'}).click();
    assert.equal(await dialog.getByRole('button',{name:'Vừa màn hình'}).getAttribute('aria-pressed'),'true');
    await chapterPage.keyboard.press('Escape');
    await dialog.waitFor({state:'hidden'});
    assert.equal(await chapterPage.evaluate(()=>document.body.style.overflow),'',
      'Closing full-screen image restores scrolling');
    assert.equal(await trigger.count(),1,'Original image stays mounted after closing');
    const overflow=await chapterPage.evaluate(
      ()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert.ok(overflow<=2,'Figure and caption must not force horizontal page scrolling');
    assert.deepEqual(runtimeErrors,[],'No hydration or runtime errors in figure viewer');
    console.log('PASS: original PDF caption, hidden generator markers and fullscreen viewer at '+viewport.width+'px');
    await chapterPage.emulateMedia({reducedMotion:"reduce"});
    await chapterPage.evaluate(()=>window.scrollTo({top:1250,behavior:"instant"}));
    const up=chapterPage.getByRole("button",{name:"Về đầu trang"});
    await up.waitFor({state:"visible"});
    const rightBox=await up.boundingBox();
    assert.ok(rightBox && rightBox.x>viewport.width/2,"Back-to-top button stays on the right");
    assert.equal(await chapterPage.getByRole("button",{name:"Mở từ điển thuật ngữ"}).count(),1);
    await up.click();
    await chapterPage.waitForFunction(()=>window.scrollY<30);
    await up.waitFor({state:"hidden"});
    assert.deepEqual(runtimeErrors,[],"Reader toolbar adds no browser exceptions");
    await chapterPage.close();
  }

  // HTML slide-deck acceptance tests: deep links, keyboard navigation, notes and small screens.
  for (const viewport of [{width:1280,height:800},{width:390,height:844}]) {
    const page=await browser.newPage({viewport});
    const slideErrors=[];
    page.on('pageerror',error=>slideErrors.push(error.message));
    await page.goto(baseUrl+'/paper/diffusion-policy?tab=slides&slide=10',{waitUntil:'domcontentloaded'});
    const stage=page.locator('.brief-slide-stage');
    await stage.waitFor({state:'visible'});
    // Wait until the deep-linked slide has rendered its math before checking the formula.
    await stage.locator('.brief-formula').waitFor({state:'visible',timeout:12000});
    await stage.locator('.katex').first().waitFor({state:'visible',timeout:12000});
    assert.ok(await stage.getByText('Công thức khử nhiễu nên hiểu thế nào?',{exact:true}).isVisible(),'Vietnamese formula explanation slide must exist');
    assert.equal(new URL(page.url()).searchParams.get('slide'),'10');
    assert.ok(await stage.locator('.katex').count()>0,'Formula rendered as KaTeX');
    await stage.locator('.brief-slide-detail').waitFor({state:'visible'});
    assert.ok((await stage.locator('.brief-slide-detail p').innerText()).length>=80,'Equation slide exposes useful source-grounded explanation');
    const detailFont=await stage.locator('.brief-slide-detail p').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
    assert.ok(detailFont>=15,`Detailed explanation should be readable (${detailFont}px)`);

    await page.getByRole('button',{name:'Slide tiếp theo'}).click();
    assert.equal(new URL(page.url()).searchParams.get('slide'),'11','next button moves to evidence');
    await page.keyboard.press('ArrowRight');
    assert.equal(new URL(page.url()).searchParams.get('slide'),'12','right arrow advances');
    await page.keyboard.press('Home');
    assert.equal(new URL(page.url()).searchParams.get('slide'),'1','Home jumps to cover');
    await stage.locator('.brief-cover-key').waitFor({state:'visible'});
    assert.ok(await stage.locator('.brief-cover-key strong').isVisible(),'Cover explains the paper mechanism instead of presenting only a title');
    await page.getByRole('button',{name:'Xem tất cả slide'}).click();
    const thumbnails=page.locator('.brief-slide-grid-menu button');
    assert.equal(await thumbnails.count(),15,'Grid should contain fifteen thumbnails');
    await thumbnails.nth(6).click();
    assert.equal(new URL(page.url()).searchParams.get('slide'),'7','Grid selection updates deep link');
    const representationSlide=stage.locator('.brief-layout-representation');
    await representationSlide.locator('.brief-slide-detail').waitFor({state:'visible'});
    const visualHierarchy=await representationSlide.evaluate(el=>{
      const size=(selector)=>parseFloat(getComputedStyle(el.querySelector(selector)).fontSize);
      return {title:size('.brief-slide-heading h2'),lead:size('.brief-slide-description'),card:size('.brief-card p'),detail:size('.brief-slide-detail p')};
    });
    assert.ok(visualHierarchy.title>visualHierarchy.lead+7,`Title must stand out: ${JSON.stringify(visualHierarchy)}`);
    assert.ok(visualHierarchy.card>=15&&visualHierarchy.detail>=15,`Card and explanation should remain legible: ${JSON.stringify(visualHierarchy)}`);
    assert.ok(await stage.getByText('Đầu ra',{exact:true}).isVisible(),'Fact cards explain the action output');
    assert.ok(await stage.getByText('Mục tiêu',{exact:true}).isVisible(),'Fact cards explain the modeling goal');
    await page.getByRole('button',{name:'Bật tắt ghi chú thuyết trình'}).click();
    assert.ok(await page.getByText('GHI CHÚ KHI TRÌNH BÀY').isVisible());
    await page.getByRole('button',{name:'Bật tắt ghi chú thuyết trình'}).click();
    const stageBox=await stage.boundingBox();
    assert.ok(stageBox && stageBox.width<=viewport.width,'Slide canvas must fit the viewport');
    const documentOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert.ok(documentOverflow<=2,'Slide layout must not force horizontal page scrolling');
    assert.deepEqual(slideErrors,[],`No runtime exceptions in slides at ${viewport.width}px`);
    console.log(`PASS: HTML slides at ${viewport.width}x${viewport.height}: KaTeX, 15 slides, keys, grid, notes, deep links`);
    await page.close();
  }



  // A research slide must not project the presenter's speech as an extra paragraph.
  // Keep that explanation in the N / GHI CHÚ panel, including on small screens.
  for (const viewport of [{width:1280,height:800},{width:390,height:844}]) {
    const rtc=await browser.newPage({viewport});
    const errors=[];
    rtc.on('pageerror',error=>errors.push(error.message));
    await rtc.goto(baseUrl+'/paper/rtc-training?tab=slides&slide=3',{waitUntil:'domcontentloaded'});
    const canvas=rtc.locator('.brief-slide-stage');
    await canvas.locator('.brief-layout-contrast').waitFor({state:'visible',timeout:15000});
    assert.equal(await canvas.locator('.brief-slide-detail').count(),0,
      'Presenter speech must not be rendered inside the RTC projected slide');
    assert.equal(await canvas.locator('.brief-slide-intuition').count(),0,
      'Long Intuition prose should stay in presenter notes');
    assert.ok(!(await canvas.innerText()).includes('LỜI THUYẾT TRÌNH'),
      'No speech label belongs on the projected canvas');
    await rtc.getByRole('button',{name:'Bật tắt ghi chú thuyết trình'}).click();
    const speakerNotes=rtc.locator('.brief-speaker-notes');
    await speakerNotes.waitFor({state:'visible'});
    assert.match(await speakerNotes.innerText(),/GHI CHÚ KHI TRÌNH BÀY/,
      'Presenter explanation is still available in the Notes panel');
    assert.equal(await canvas.locator('.brief-slide-detail').count(),0,
      'Opening Notes does not insert them back into the slide canvas');

    await rtc.goto(baseUrl+'/paper/rtc-training?tab=slides&slide=2',{waitUntil:'domcontentloaded'});
    await rtc.locator('.brief-source-figure img').waitFor({state:'visible',timeout:15000});
    await rtc.waitForFunction(()=>{
      const img=document.querySelector('.brief-source-figure img');
      return img instanceof HTMLImageElement && img.complete && img.naturalWidth>0;
    },null,{timeout:15000});
    assert.equal(await rtc.locator('.brief-slide-detail').count(),0,
      'Paper figures must have visual prominence without presenter paragraphs');
    assert.ok((await rtc.locator('.brief-source-figure').boundingBox())?.width>160,
      'An original-paper figure remains readable');
    assert.deepEqual(errors,[],`No RTC presentation exceptions at ${viewport.width}px`);
    await rtc.close();
  }
  console.log('PASS: RTC Training-Time projects visuals; explanation remains in presenter notes');


  // Regression: restore a slide *presentation*, not four microscopic cards beside an image.
  // Test actual computed CSS, not only the authored slide JSON.
  const academicLayout=await browser.newPage({viewport:{width:1280,height:800}});
  await academicLayout.goto(baseUrl+'/paper/rtc-training?tab=slides&slide=6',{waitUntil:'domcontentloaded'});
  const flow=academicLayout.locator('.brief-slide-art-with-figure .brief-flow');
  await flow.waitFor({state:'visible',timeout:15000});
  const trainingColumns=await flow.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
  assert.equal(trainingColumns,2,'Four training steps next to an original-paper diagram must be a readable 2×2 flow, never four cramped columns');
  const trainingCardWidth=(await flow.locator('.brief-flow-stage').first().boundingBox())?.width ?? 0;
  assert.ok(trainingCardWidth>=170,`Training step width too small: ${trainingCardWidth}`);

  await academicLayout.goto(baseUrl+'/paper/rtc-training?tab=slides&slide=5',{waitUntil:'domcontentloaded'});
  const concepts=academicLayout.locator('.brief-slide-art-with-figure .brief-concept-grid');
  await concepts.waitFor({state:'visible',timeout:15000});
  const conceptColumns=await concepts.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
  assert.equal(conceptColumns,1,'Three H/s/d explanations should stack as readable rows alongside the paper figure');

  await academicLayout.goto(baseUrl+'/paper/rtc-training?tab=slides&slide=3',{waitUntil:'domcontentloaded'});
  const comparison=academicLayout.locator('.brief-layout-contrast');
  await comparison.waitFor({state:'visible',timeout:15000});
  const oldCost=comparison.locator('.brief-rtc-cost-old');
  const newCost=comparison.locator('.brief-rtc-cost-new');
  await oldCost.waitFor({state:'visible',timeout:15000});
  await newCost.waitFor({state:'visible',timeout:15000});
  assert.match(await oldCost.innerText(),/VJP/,'Inference-time RTC must explain the per-step Jacobian cost');
  assert.match(await newCost.innerText(),/chỉ dự đoán trường vận tốc/,'Training-time RTC avoids per-step VJP');
  assert.ok(await comparison.locator('.brief-rtc-guidance .katex').count()>0,
    'The original RTC pseudoinverse guidance equation is projected as readable math');

  await academicLayout.goto(baseUrl+'/paper/rtc-training?tab=slides&slide=10',{waitUntil:'domcontentloaded'});
  await academicLayout.locator('.brief-layout-equation .katex').waitFor({state:'visible',timeout:15000});
  assert.match(await academicLayout.locator('.brief-layout-equation h2').innerText(),/Hàm mất mát trên hậu tố hành động/);
  assert.equal(await academicLayout.locator('.brief-slide-stage .brief-slide-detail').count(),0,
    'The complete flow-matching equation is projected, but presenter narration is not');
  await academicLayout.close();
  console.log('PASS: restored RTC science uses readable figure/flow grids and visible KaTeX');

  // Presenter View uses a separate native document. Simulate Chromium's Document
  // Picture-in-Picture by opening an isolated same-origin popup. This verifies
  // React portals and audience/private DOM boundaries, not Teams OS capture.
  const presenterPage=await browser.newPage({viewport:{width:1280,height:800}});
  const presenterErrors=[];
  presenterPage.on('pageerror',error=>presenterErrors.push(error.message));
  await presenterPage.addInitScript(()=>{
    Object.defineProperty(window,'documentPictureInPicture',{
      configurable:true,
      value:{requestWindow:async()=>window.open('about:blank','_blank','width=540,height=760')}
    });
  });
  await presenterPage.goto(baseUrl+'/paper/rtc-training?tab=slides&slide=3',{waitUntil:'domcontentloaded'});
  await presenterPage.locator('.brief-layout-contrast').waitFor({state:'visible'});
  const popupPromise=presenterPage.waitForEvent('popup');
  await presenterPage.getByRole('button',{name:'Bắt đầu Presenter View với ghi chú riêng'}).click();
  const presenterPopup=await popupPromise;
  presenterPopup.on('pageerror',error=>presenterErrors.push(error.message));
  await presenterPopup.locator('[data-private-presenter="true"]').waitFor({state:'visible',timeout:15000});
  assert.ok(await presenterPopup.getByText('GHI CHÚ RIÊNG TƯ').isVisible(),'Presenter has readable private notes');
  assert.match(await presenterPopup.locator('.presenter-note-body').innerText(),/GIẢI THÍCH BỔ SUNG.*vector–Jacobian/s,'RTC gradient explanation is available privately');
  assert.equal(await presenterPage.locator('.brief-deck-presenting').count(),1,'Audience slide fills shared browser');
  assert.equal(await presenterPage.locator('[data-private-presenter]').count(),0,'Private DOM must not be attached to shared browser');
  assert.equal(await presenterPage.locator('.brief-speaker-notes,.brief-slide-detail,.brief-slide-intuition').count(),0,'No private narration in audience view');
  assert.ok(!(await presenterPage.locator('.brief-deck-presenting').innerText()).includes('LỜI THUYẾT TRÌNH'),'Presenter scripts cannot leak into shared slide DOM');
  const audienceRect=await presenterPage.locator('.brief-slide-stage').boundingBox();
  assert.ok(audienceRect&&audienceRect.width>=1270&&audienceRect.height>=790,'Audience slide must fill the 1280x800 viewport');

  await presenterPopup.getByRole('button',{name:'Slide tiếp theo trong Presenter View'}).click();
  await presenterPage.waitForFunction(()=>new URL(location.href).searchParams.get('slide')==='4');
  await presenterPage.locator('.brief-layout-intuition').waitFor({state:'visible',timeout:7000});
  await presenterPopup.keyboard.press('ArrowRight');
  await presenterPage.waitForFunction(()=>new URL(location.href).searchParams.get('slide')==='5');
  await presenterPopup.getByText('Ba tham số của cơ chế nối đoạn').waitFor({state:'visible',timeout:7000});

  await presenterPopup.close(); // user closing the OS popup must restore the normal reader
  await presenterPage.locator('.brief-deck-presenting').waitFor({state:'detached',timeout:7000});
  assert.ok(await presenterPage.getByRole('button',{name:'Bắt đầu Presenter View với ghi chú riêng'}).isVisible(),'Browser recovers after private window closes');
  assert.deepEqual(presenterErrors,[],'Presenter View has no JS runtime exceptions');
  await presenterPage.close();

  // An unsupported browser must fail closed, NEVER put notes into the shared tab.
  const unsupportedPresenter=await browser.newPage({viewport:{width:1280,height:800}});
  await unsupportedPresenter.addInitScript(()=>{
    Object.defineProperty(window,'documentPictureInPicture',{configurable:true,value:undefined});
  });
  await unsupportedPresenter.goto(baseUrl+'/paper/rtc-training?tab=slides&slide=3',{waitUntil:'domcontentloaded'});
  await unsupportedPresenter.getByRole('button',{name:'Bắt đầu Presenter View với ghi chú riêng'}).click();
  assert.match(await unsupportedPresenter.locator('.brief-presenter-error').innerText(),/Chrome hoặc Edge/,'Explicit support guidance');
  assert.equal(await unsupportedPresenter.locator('.brief-deck-presenting').count(),0,'No unsafe inline fallback');
  await unsupportedPresenter.close();
  console.log('PASS: private Presenter View popup, bidirectional navigation, closure recovery, unsupported-browser privacy');

  // A normal article must never fetch its 15-slide deck until the user asks for it.
  const mobileReader=await browser.newPage({viewport:{width:390,height:844}});
  let deckRequests=0;
  mobileReader.on('request',request=>{
    if (new URL(request.url()).pathname==='/api/papers/vima/slides') deckRequests++;
  });
  const perfErrors=[];
  mobileReader.on('pageerror',error=>perfErrors.push(error.message));
  await mobileReader.goto(baseUrl+'/paper/vima',{waitUntil:'domcontentloaded'});
  await mobileReader.getByRole('tab',{name:/DIỄN GIẢI CHI TIẾT/}).waitFor({state:'visible'});
  assert.equal(deckRequests,0,'Opening article on mobile must not fetch a slide deck');
  await mobileReader.getByRole('tab',{name:/SLIDE/}).click();
  await mobileReader.locator('.brief-slide-stage').waitFor({state:'visible'});
  assert.equal(deckRequests,1,'First Slides tab open fetches one deck');
  await mobileReader.getByRole('tab',{name:/DIỄN GIẢI CHI TIẾT/}).click();
  await mobileReader.getByRole('tab',{name:/SLIDE/}).click();
  await mobileReader.locator('.brief-slide-stage').waitFor({state:'visible'});
  assert.equal(deckRequests,1,'Reopening Slides tab reuses memory cache');
  assert.deepEqual(perfErrors,[],'Lazy slide-loading introduces no runtime exception');
  await mobileReader.close();
  console.log('PASS: mobile article excludes slide requests until clicked and reuses cached deck');

} finally {
  await browser.close();
}
