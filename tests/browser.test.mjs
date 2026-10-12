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
  throw new Error('Next.js did not become ready at ' + baseUrl);
}

await waitForServer();
const browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
try {
  for (const viewport of [{width: 1280, height: 800}, {width: 390, height: 844}]) {
    const page = await browser.newPage({viewport});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(baseUrl, {waitUntil: 'networkidle'});
    await page.getByRole('tab', {name: /KNOWLEDGE DAG/i}).click();
    await page.locator('.react-flow__node').first().waitFor();
    const nodeCount = await page.locator('.react-flow__node').count();
    assert.equal(nodeCount, 22, 'Expected all 22 DAG nodes at ' + viewport.width + 'px');

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
    assert.ok(after > before * 1.02, 'Wheel should zoom DAG at ' + viewport.width + 'px: ' + before + ' -> ' + after);
    assert.equal(await page.locator('.react-flow__node').count(), 22, 'Zoom should not unmount nodes');

    await page.getByRole('button', {name: 'Hiện toàn bộ sơ đồ'}).click();
    await page.waitForTimeout(470);
    assert.equal(await page.locator('.react-flow__node').count(), 22, 'Fit should restore full DAG visibility');

    const font = await page.locator('body').evaluate(el => getComputedStyle(el).fontFamily);
    assert.match(font, /montserrat/i, 'Body font should be Montserrat');
    const vietnameseFontLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].some(font => font.family.toLowerCase().includes('montserrat') && font.status === 'loaded');
    });
    assert.ok(vietnameseFontLoaded, 'Montserrat Vietnamese glyph range must be loaded');
    assert.deepEqual(errors, [], 'No browser JS runtime errors at ' + viewport.width + 'px');
    console.log('PASS: ' + viewport.width + 'x' + viewport.height + ' | 22 nodes | wheel zoom ' + before.toFixed(2) + ' -> ' + after.toFixed(2) + ' | Montserrat VI');
    await page.close();
  }
} finally {
  await browser.close();
}
