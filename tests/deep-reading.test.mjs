import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const baselines={
  "act": 808,
  "bridgedata-v2": 810,
  "diffusion-policy": 912,
  "droid": 738,
  "fast": 696,
  "groot-n1": 1868,
  "libero": 893,
  "lingbot-vla-2": 2132,
  "mimicplay": 810,
  "octo": 739,
  "open-x-embodiment": 766,
  "openvla": 734,
  "palm-e": 881,
  "pi-0-5": 777,
  "qwen-vla": 1871,
  "rdt-1b": 708,
  "robocasa": 745,
  "rt-1": 1254,
  "rt-2": 851,
  "rtc-inference": 1882,
  "rtc-training": 1594,
  "vima": 791
};
const figures=JSON.parse(fs.readFileSync(path.join(root,"content/paper-figures.json"),"utf8"));
const guides=JSON.parse(fs.readFileSync(path.join(root,"content/figure-guides.json"),"utf8"));
const countWords=(markdown)=>markdown
  .replace(/!\[[^\]]*\]\([^)]+\)/g,"")
  .replace(/https?:\/\/\S+/g,"")
  .split(/\s+/).filter(Boolean).length;

test("all twenty-two scientific chapters contain at least five times the prior explanation",()=>{
  assert.equal(Object.keys(baselines).length,22);
  assert.deepEqual(Object.keys(figures).sort(),Object.keys(baselines).sort());
  assert.deepEqual(Object.keys(guides).sort(),Object.keys(baselines).sort());
  assert.ok(Object.values(figures).some(list=>list.length>2), "Figure extraction is still artificially capped at two");
  for(const [slug,previousWords] of Object.entries(baselines)){
    const content=fs.readFileSync(path.join(root,"content/papers",slug+".md"),"utf8");
    const current=countWords(content);
    assert.ok(current>=previousWords*5,`${slug}: expected ≥${previousWords*5} words, got ${current}`);
    assert.ok(content.includes("#### Đọc hình gốc:"),`${slug}: no illustrated source explanation`);
    assert.ok(content.includes("#### Ví dụ từng bước để hiểu cơ chế"),`${slug}: missing worked example`);
    assert.ok(content.includes("### Đào sâu:"),`${slug}: missing technical walkthrough`);
    assert.ok(figures[slug].length>=2,`${slug}: missing PDF figures`);
    for(const fig of figures[slug]){
      assert.match(fig.caption,/^fig(?:ure)?\.?\s*\d+/i,`${slug}: unverified PDF caption`);
      assert.ok(fig.pdf.startsWith("https://"),`${slug}: missing PDF provenance`);
      assert.ok(Number.isInteger(fig.page)&&fig.page>0,`${slug}: invalid PDF page`);
      assert.ok(fig.bbox.length===4,`${slug}: missing source crop coordinates`);
      assert.ok(fig.image.startsWith("/paper-figures/"+slug+"/"),`${slug}: bad image location`);
      assert.ok(fs.existsSync(path.join(root,"public",fig.image)),`${slug}: missing image bytes ${fig.image}`);
      assert.ok(content.includes("]("+fig.image+")"),`${slug}: figure not embedded`);
      assert.ok(fig.caption.trim().length>=35,`${slug}: source author caption is missing`);
      assert.ok(fig.caption_vi?.trim().length>=30,`${slug}: missing Vietnamese translation`);
      assert.ok(!content.includes("Xem caption đầy đủ trong PDF"),`${slug}: redundant fake caption remains`);
    }
    for(const key of ["overview","method","worked"]){
      assert.ok(guides[slug][key].split(/\s+/).length>=60,`${slug}: ${key} lacks meaningful paper-specific detail`);
    }
  }
});

test("Markdown hides generator markers without discarding real explanatory sections",()=>{
  const source=fs.readFileSync(path.join(root,"lib/content.ts"),"utf8");
  assert.match(source,/BEGIN\|END/);
  assert.match(source,/EXTENDED WALKTHROUGH/);
});

test("Paper figures have original source captions, PDF deep links and native fullscreen dialog",()=>{
  const code=fs.readFileSync(path.join(root,"components/paper-figure.tsx"),"utf8");
  const reader=fs.readFileSync(path.join(root,"components/paper-reader.tsx"),"utf8");
  const css=fs.readFileSync(path.join(root,"app/globals.css"),"utf8");
  assert.ok(reader.includes("<PaperFigure paperSlug={paper.slug}"));
  assert.ok(code.includes('className="paper-source-figure"'));
  assert.ok(code.includes("meta?.caption"));
  assert.ok(code.includes("meta?.caption_vi"));
  assert.ok(code.includes("meta.pdf"));
  assert.ok(code.includes("createPortal"));
  assert.ok(code.includes("showModal"));
  assert.ok(code.includes("onCancel"));
  assert.match(code,/aria-label="Đóng ảnh phóng to"/);
  assert.match(code,/paper-source-figcaption/);
  assert.match(code,/role="figure"/);
  assert.match(css,/\.paper-figure-lightbox/);
});
