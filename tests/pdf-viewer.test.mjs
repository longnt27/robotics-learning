import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {proxyOriginalPdf} from "../lib/pdf-proxy.js";

const root = path.resolve(import.meta.dirname,"..");
const read = (p)=>fs.readFileSync(path.join(root,p),"utf8");
const paperSource=read("lib/papers.ts");
const pdfs=[...paperSource.matchAll(/\bpdf:\s*"([^"]+)"/g)].map(x=>x[1]);

test("PDF proxy allowlist covers all 22 original corpus URLs",async()=>{
  assert.equal(pdfs.length,22);
  for(const pdf of pdfs){
    let requested=false;
    const result=await proxyOriginalPdf(pdf,{
      filename:"paper",
      fetcher:async()=>{
        requested=true;
        return new Response("%PDF-1.7\n", {
          status:200,
          headers:{"Content-Type":"application/pdf","Accept-Ranges":"bytes"},
        });
      },
    });
    assert.equal(result.status,200,pdf);
    assert.ok(requested,"Expected source to be allowed: "+pdf);
    assert.equal(result.headers.get("Content-Type"),"application/pdf");
    assert.match(await result.text(),/^%PDF-/);
  }
});

test("same-origin viewer proxies PDF bytes, returns inline content and supports Range",async()=>{
  let called;
  const response=await proxyOriginalPdf("https://arxiv.org/pdf/2210.03094",{
    range:"bytes=0-3",filename:"vima",
    fetcher:async(url,options)=>{
      called={url,options};
      return new Response("%PDF",{status:206,headers:{
        "Content-Type":"application/pdf",
        "Content-Range":"bytes 0-3/1024",
        "Accept-Ranges":"bytes",
        "Content-Length":"4",
        "ETag":'"original-document"',
        "X-Frame-Options":"DENY",
      }});
    },
  });
  assert.equal(called.url,"https://arxiv.org/pdf/2210.03094");
  assert.equal(called.options.headers.get("Range"),"bytes=0-3");
  assert.equal(response.status,206);
  assert.equal(response.headers.get("Content-Range"),"bytes 0-3/1024");
  assert.equal(response.headers.get("Accept-Ranges"),"bytes");
  assert.equal(response.headers.get("Content-Length"),"4");
  assert.equal(response.headers.get("Content-Disposition"),'inline; filename="vima.pdf"');
  assert.equal(response.headers.get("Content-Type"),"application/pdf");
  assert.equal(response.headers.get("X-Frame-Options"),null,
    "Publisher frame denial must not prevent same-origin embedding");
  assert.equal(await response.text(),"%PDF");
});

test("PDF proxy rejects arbitrary destinations and HTML/error pages",async()=>{
  for(const url of ["http://arxiv.org/pdf/2210.03094","https://evil.example/pdf","https://user:password@arxiv.org/pdf/2210.03094","not-a-url"]){
    let calls=0;
    const result=await proxyOriginalPdf(url,{filename:"paper",fetcher:async()=>{calls++;throw Error("should never fetch")}});
    assert.equal(result.status,400,url);
    assert.equal(calls,0);
  }
  for(const upstream of [
    new Response("Not Found",{status:404,headers:{"Content-Type":"text/html"}}),
    new Response("<html>blocked</html>",{status:200,headers:{"Content-Type":"text/html"}}),
  ]){
    const response=await proxyOriginalPdf("https://arxiv.org/pdf/2210.03094",{
      filename:"vima",fetcher:async()=>upstream
    });
    assert.equal(response.status,502);
    assert.ok(!response.headers.get("Content-Type")?.includes("application/pdf"));
  }
  const network=await proxyOriginalPdf("https://arxiv.org/pdf/2210.03094",{
    filename:"vima",fetcher:async()=>{throw Error("upstream offline")}
  });
  assert.equal(network.status,502);
});

test("paper hero removes the four redundant labels and retains useful paper identity",()=>{
  const ui=read("components/paper-reader.tsx");
  const hero=ui.slice(ui.indexOf('<section className="paper-hero">'),ui.indexOf('<div ref={readerRef}'));
  assert.ok(hero.length>1000);
  assert.doesNotMatch(hero,/BÀI NGHIÊN CỨU\s*\/|reader-paper-counter|paper-hero-art-label/);
  assert.doesNotMatch(hero,/DIỄN GIẢI TIẾNG VIỆT/);
  const kicker=hero.split('className="paper-kicker"')[1]?.split('</div>')[0];
  assert.ok(kicker);
  assert.doesNotMatch(kicker,/categoryLabels\[paper\.category\]/);
  assert.match(hero,/paper\.shortTitle/);
  assert.match(hero,/paper\.venue/);
  assert.match(hero,/XEM PDF TẠI ĐÂY/);
});

test("PDF tab and hero action display a first-party PDF without leaving the paper page",()=>{
  const ui=read("components/paper-reader.tsx");
  const api=read("app/api/papers/[slug]/pdf/route.ts");
  assert.match(ui,/onClick=\{\(\)=>selectTab\("pdf"\)\}/);
  assert.match(ui,/\/api\/papers\/\$\{paper\.slug\}\/pdf#toolbar=1/);
  assert.match(ui,/iframe title=/);
  assert.match(ui,/href=\{paper\.pdf\} target="_blank"/);
  assert.match(api,/getPaper\(slug\)/);
  assert.match(api,/proxyOriginalPdf\(paper\.pdf/);
  assert.match(api,/request\.headers\.get\("range"\)/);
  assert.match(api,/status:\s*404/);
});
