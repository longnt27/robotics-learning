import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const root=path.resolve(import.meta.dirname,"..");
const corpusSlugs=[
  "act",
  "bridgedata-v2",
  "diffusion-policy",
  "droid",
  "fast",
  "groot-n1",
  "libero",
  "lingbot-vla-2",
  "mimicplay",
  "octo",
  "open-x-embodiment",
  "openvla",
  "palm-e",
  "pi-0-5",
  "qwen-vla",
  "rdt-1b",
  "robocasa",
  "rt-1",
  "rt-2",
  "rtc-inference",
  "rtc-training",
  "vima",
];
const figures=JSON.parse(fs.readFileSync(path.join(root,"content/paper-figures.json"),"utf8"));
const guides=JSON.parse(fs.readFileSync(path.join(root,"content/figure-guides.json"),"utf8"));
const countWords=(markdown)=>markdown
  .replace(/!\[[^\]]*\]\([^)]+\)/g,"")
  .replace(/https?:\/\/\S+/g,"")
  .split(/\s+/).filter(Boolean).length;

test("all 22 chapters teach concepts with paper-specific examples, not template padding",()=>{
  assert.equal(corpusSlugs.length,22);
  assert.deepEqual(Object.keys(figures).sort(),[...corpusSlugs].sort());
  assert.deepEqual(Object.keys(guides).sort(),[...corpusSlugs].sort());
  const counts=Object.values(figures).map(items=>items.length);
  assert.ok(counts.reduce((total,n)=>total+n,0)>44,"Do not cap source figures at two per paper");
  assert.ok(new Set(counts).size>=3,"Figure count must depend on the paper");
  const usedTitles=new Map();
  for(const slug of corpusSlugs){
    const content=fs.readFileSync(path.join(root,"content/papers",slug+".md"),"utf8");
    assert.ok(countWords(content)>=1450,slug+": chapter needs substantive teaching");
    const blocks=[...content.matchAll(/<!-- BEGIN EXTENDED WALKTHROUGH -->([\s\S]*?)<!-- END EXTENDED WALKTHROUGH -->/g)].map(match=>match[1]);
    assert.ok(blocks.length>=8,slug+": expected section-by-section explanations");
    const topics=["Vì sao cần nghiên cứu này?","Phương pháp thực hiện","Kết quả thực nghiệm","Hạn chế và câu hỏi còn mở","Liên hệ với nghiên cứu khác"];
    for(const topic of topics)assert.ok(content.includes("## "+topic),slug+": missing "+topic);
    assert.match(content,/#### Đọc hình gốc:/,slug+": missing visual reading guide");
    assert.match(content,/#### Ví dụ từng bước để hiểu cơ chế/,slug+": missing worked example");
    assert.doesNotMatch(content,/### Đào sâu:|\*\*(?:Luận điểm|Hai quy trình khác nhau ra sao\?|Vấn đề khoa học nằm ở đâu\?)\.\*\*/,
      slug+": old boilerplate still present");
    const explanations=blocks.flatMap(block=>[...block.matchAll(/^### ([^\n]+)/gm)].map(match=>match[1]));
    assert.ok(explanations.length>=7,slug+": needs clear educational subheadings");
    for(const title of explanations){
      const reuse=usedTitles.get(title)||new Set();
      reuse.add(slug);usedTitles.set(title,reuse);
    }
    for(const section of blocks){
      const own=section.replace(/!\[[^\]]*\]\([^)]+\)/g,"").trim();
      assert.ok(own.length>=100,slug+": empty walkthrough section");
    }
    for(const fig of figures[slug]){
      assert.match(fig.caption,/^fig(?:ure)?\.?\s*\d+/i,slug+": original figure caption missing");
      assert.ok(fig.pdf.startsWith("https://"),slug+": missing original PDF");
      assert.ok(Number.isInteger(fig.page)&&fig.page>0,slug+": bad PDF page");
      assert.equal(fig.bbox.length,4,slug+": missing source crop");
      assert.ok(fig.image.startsWith("/paper-figures/"+slug+"/"));
      assert.ok(fs.existsSync(path.join(root,"public",fig.image)),slug+": missing image bytes: "+fig.image);
      assert.ok(content.includes("]("+fig.image+")"),slug+": figure not shown");
      assert.ok(fig.caption_vi?.trim().length>=30,slug+": short translated caption "+fig.number);
      assert.ok(/[àáạảãăâđèéẹẻẽêếìíịỉĩòóọỏõôốơớùúụủũưứỳýỵỷỹ]/i.test(fig.caption_vi),
        slug+": Vietnamese diacritics missing in figure "+fig.number);
      assert.equal(fig.translation_method,"manual-editorial-from-original-english",slug+": unedited machine translation "+fig.number);
      assert.equal(fig.translation_reviewed,true,slug+": review marker missing "+fig.number);
      assert.equal(fig.caption_sha256,createHash("sha256").update(fig.caption).digest("hex"),
        slug+": original source caption changed without re-review "+fig.number);
      assert.doesNotMatch(fig.caption_vi,/\b(?:sự mài mòn|không bắn|biến áp vani|gợi ý mulitimodal|tổn thất huấn luyện)\b/i,
        slug+": mistranslated scientific term in caption "+fig.number);
    }
    for(const key of ["overview","method","worked"]){
      assert.ok(guides[slug][key].split(/\s+/).length>=60,slug+": "+key+" guide missing");
    }
    assert.ok(!content.includes("Xem caption đầy đủ trong PDF"),slug+": fake caption placeholder");
  }
  for(const [title,papers] of usedTitles){
    assert.ok(papers.size<=4,"Template heading reused across too many papers: "+title);
  }
});

test("all figure translations are editorial, distinct from their original English",()=>{
  const entries=Object.values(figures).flat();
  assert.equal(entries.length,167);
  for(const entry of entries){
    assert.notEqual(entry.caption_vi.trim(),entry.caption.trim());
    assert.ok(entry.caption_vi.trim().length>=30);
  }
  const component=fs.readFileSync(path.join(root,"components/paper-figure.tsx"),"utf8");
  assert.match(component,/BẢN DỊCH ĐÃ BIÊN TẬP/);
  assert.doesNotMatch(component,/BẢN DỊCH TIẾNG VIỆT \{isTranslated \? "\(\s*TỰ ĐỘNG/);
  const script=fs.readFileSync(path.join(root,"scripts/translate_paper_captions.py"),"utf8");
  assert.match(script,/figure\.get\("translation_reviewed"\)/,
    "Machine translator must not overwrite editorial translations");
});

test("Markdown hides generator markers without discarding real explanatory sections",()=>{
  const source=fs.readFileSync(path.join(root,"lib/content.ts"),"utf8");
  assert.match(source,/BEGIN\|END/);
  assert.match(source,/EXTENDED WALKTHROUGH/);
  assert.match(source,/ADDITIONAL PDF FIGURES/);
});

test("Paper figures have original source captions, PDF deep links and native fullscreen dialog",()=>{
  const code=fs.readFileSync(path.join(root,"components/paper-figure.tsx"),"utf8");
  const reader=fs.readFileSync(path.join(root,"components/paper-reader.tsx"),"utf8");
  const css=fs.readFileSync(path.join(root,"app/globals.css"),"utf8");
  assert.ok(reader.includes("<PaperFigure paperSlug={paper.slug}"));
  assert.ok(code.includes('className="paper-source-figure"'));
  assert.ok(code.includes("meta?.caption"));
  assert.ok(code.includes("meta.pdf"));
  assert.ok(code.includes("createPortal"));
  assert.ok(code.includes("showModal"));
  assert.ok(code.includes("onCancel"));
  assert.match(code,/aria-label="Đóng ảnh phóng to"/);
  assert.match(code,/paper-source-figcaption/);
  assert.match(code,/paper-figure-caption-vi/);
  assert.match(code,/captionVi/);
  assert.match(code,/role="figure"/);
  assert.match(css,/\.paper-figure-lightbox/);
});
