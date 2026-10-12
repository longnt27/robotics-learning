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
    assert.deepEqual(errors, [], `No browser JS runtime errors at ${viewport.width}px`);
    console.log(`PASS: ${viewport.width}x${viewport.height} · 22 nodes · wheel zoom ${before.toFixed(2)} -> ${after.toFixed(2)} · Montserrat VI`);
    await page.close();
  }
  // Verify resource links in both reading and PDF views, including unavailable official code.
  const resourcesPage = await browser.newPage({viewport: {width: 1280, height: 800}});
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

    assert.equal(await chapterPage.locator('.paper-source-figure').count(),2,'Two original figures');
    const originalCaption=await figure.locator('.paper-figure-caption-text[lang="en"]').innerText();
    assert.match(originalCaption,/^Figure 1: Top: LIBERO has four procedurally-generated task suites/i);
    assert.ok(originalCaption.length>280,'Show the complete original research caption, not the alt text');
    assert.ok(await figure.getByText('CAPTION GỐC · ENGLISH').isVisible());
    assert.ok((await figure.locator('.paper-caption-vietnamese').innerText()).length>50);
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
    assert.match(await dialog.locator('.paper-figure-lightbox-caption p[lang="en"]').innerText(),
      /^Figure 1: Top: LIBERO has four procedurally-generated task suites/i);
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
    assert.ok(await page.getByText(/Mathematical Intuition/i).first().isVisible(),'LaTeX/Intuition slide must exist');
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
    assert.ok(await stage.getByText('ĐẦU RA / DẠNG BIỂU DIỄN').isVisible(),'Fact cards use meaningful headings');
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

} finally {
  await browser.close();
}
