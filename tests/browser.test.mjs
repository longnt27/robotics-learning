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

  // HTML slide-deck acceptance tests: deep links, keyboard navigation, notes and small screens.
  for (const viewport of [{width:1280,height:800},{width:390,height:844}]) {
    const page=await browser.newPage({viewport});
    const slideErrors=[];
    page.on('pageerror',error=>slideErrors.push(error.message));
    await page.goto(baseUrl+'/paper/diffusion-policy?tab=slides&slide=10',{waitUntil:'domcontentloaded'});
    const stage=page.locator('.brief-slide-stage');
    await stage.waitFor({state:'visible'});
    assert.ok(await page.getByText(/Mathematical Intuition/i).first().isVisible(),'LaTeX/Intuition slide must exist');
    assert.equal(new URL(page.url()).searchParams.get('slide'),'10');
    assert.ok(await stage.locator('.katex').count()>0,'Formula rendered as KaTeX');

    await page.getByRole('button',{name:'Slide tiếp theo'}).click();
    assert.equal(new URL(page.url()).searchParams.get('slide'),'11','next button moves to evidence');
    await page.keyboard.press('ArrowRight');
    assert.equal(new URL(page.url()).searchParams.get('slide'),'12','right arrow advances');
    await page.keyboard.press('Home');
    assert.equal(new URL(page.url()).searchParams.get('slide'),'1','Home jumps to cover');
    await page.getByRole('button',{name:'Xem tất cả slide'}).click();
    const thumbnails=page.locator('.brief-slide-grid-menu button');
    assert.equal(await thumbnails.count(),15,'Grid should contain fifteen thumbnails');
    await thumbnails.nth(6).click();
    assert.equal(new URL(page.url()).searchParams.get('slide'),'7','Grid selection updates deep link');
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
