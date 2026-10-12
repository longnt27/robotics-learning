"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookMarked, BookOpen, Bookmark, Check, ChevronDown, Clock3, Code2, ExternalLink, FileText, Github, GitFork, GraduationCap, Menu, Orbit, PanelLeftClose, PanelLeftOpen, Rocket, Share2, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Paper } from "@/lib/papers";
import type { ResearchSlide } from "@/lib/slide-types";
import resourcesJson from "@/lib/paper-resources.json";
import { categoryLabels } from "@/lib/papers";
import type { PaperRelation } from "@/lib/relations";
import {relationTypeLabel} from "@/lib/relations";

type PaperResource = {
  platform: "github" | "huggingface";
  origin: "official" | "community";
  kind: "code" | "model" | "dataset" | "project";
  url: string;
  note: string;
};
const paperResources = resourcesJson as Record<string, PaperResource[]>;
const resourceKindLabels: Record<PaperResource["kind"], string> = {
  code: "Mã nguồn",
  model: "Checkpoint / model",
  dataset: "Dataset",
  project: "Trang dự án",
};
const SlideDeck = dynamic(()=>import("./slide-deck").then(m=>m.SlideDeck),{ssr:false,loading:()=> <div className="brief-deck-loading">ĐANG MỞ BẢN TRÌNH BÀY…</div>});

const TABS = ["explain","pdf","slides"] as const;
type ReaderTab=typeof TABS[number];
const titleSlug = (s:string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-");
const chapterLabels: Record<string,string> = {
  "Vì sao cần nghiên cứu này?": "01 / Vì sao cần nghiên cứu?",
  "Phương pháp thực hiện": "03 / Phương pháp",
  "Kết quả thực nghiệm": "05 / Kết quả",
  "Hạn chế và câu hỏi còn mở": "06 / Hạn chế",
  "Liên hệ với nghiên cứu khác": "07 / Liên hệ",
};
const titleDisplay = (title: string) => chapterLabels[title] ?? title;

export function PaperReader({paper,chapter,relations,slides}: {paper:Paper;chapter:string|null;relations:PaperRelation[];slides:ResearchSlide[]}) {
  const [tab,setTab]=useState<ReaderTab>("explain");
  const [tocVisible,setTocVisible]=useState(true);
  const [copySuccess,setCopySuccess]=useState(false);
  const [activeSection,setActiveSection]=useState("");
  const readerRef=useRef<HTMLDivElement>(null);
  const toc=useMemo(()=>[...(chapter||"").matchAll(/^## (.+)$/gm)].map(x=>({title:x[1],id:titleSlug(x[1])})),[chapter]);
  const links=useMemo(()=>relations.filter(r=>r.from===paper.slug||r.to===paper.slug),[relations,paper.slug]);
  const resources = paperResources[paper.slug] ?? [];
  const [progress,setProgress]=useState(0);
  useEffect(()=>{const update=()=>{const h=document.documentElement.scrollHeight-window.innerHeight;setProgress(h>0?Math.min(100,Math.round(window.scrollY/h*100)):0);};window.addEventListener("scroll",update,{passive:true});update();return()=>window.removeEventListener("scroll",update)},[]);
  useEffect(()=>{
    const restore=()=>{
      const params=new URLSearchParams(window.location.search);
      const choice=params.get("tab");
      if(choice==="slides"||choice==="pdf"||choice==="explain")setTab(choice);
    };
    restore();
    window.addEventListener("popstate",restore);
    return()=>window.removeEventListener("popstate",restore);
  },[]);
  const selectTab=(next:ReaderTab)=>{
    setTab(next);
    const url=new URL(window.location.href);
    if(next==="explain") {url.searchParams.delete("tab");url.searchParams.delete("slide");}
    else {url.searchParams.set("tab",next);if(next==="slides"&&!url.searchParams.has("slide"))url.searchParams.set("slide","1");}
    window.history.replaceState(window.history.state,"",url.pathname+url.search+url.hash);
    setTimeout(()=>readerRef.current?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"}),20);
  };
  const copy=async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopySuccess(true);setTimeout(()=>setCopySuccess(false),1800);}catch{/* clipboard permission denied; no false claim */}};
  const jump=(id:string)=>{document.getElementById(id)?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});setActiveSection(id);};
  return <main className="reader-root">
    <div className="reading-progress" style={{width:`${progress}%`}} aria-hidden="true"/>
    <div className="reader-ambient" aria-hidden="true"/>
    <header className="reader-header"><Link href="/" className="reader-brand"><Orbit size={20}/> ROBOTICS <span>/</span> ATLAS</Link><nav aria-label="Điều hướng bài nghiên cứu"><Link href="/" className="reader-back"><ArrowLeft size={15}/> TẤT CẢ BÀI BÁO</Link><span className="header-reader-dot"/><span className="reader-header-current">{paper.shortTitle}</span></nav><button className="reader-share" onClick={copy} aria-label="Sao chép liên kết bài báo">{copySuccess?<Check size={16}/>:<Share2 size={16}/>}<span>{copySuccess?"ĐÃ SAO CHÉP":"CHIA SẺ"}</span></button></header>
    <div className="reader-container">
      <div className="reader-breadcrumbs"><Link href="/">THƯ VIỆN</Link><span>/</span><span>{categoryLabels[paper.category]}</span><span>/</span><strong>{paper.shortTitle}</strong></div>
      <section className="paper-hero"><div className="paper-hero-content"><div className="paper-kicker"><span className="paper-kicker-dot"/>{paper.venue}<span className="kicker-divider">/</span>{new Date(`${paper.date}T12:00:00`).getFullYear()}<span className="kicker-divider">/</span>{categoryLabels[paper.category]}{paper.userPick&&<span className="reader-pick"><Bookmark size={13} fill="currentColor"/> BÀI BẠN CHỌN</span>}</div><div className="reader-paper-counter">BÀI NGHIÊN CỨU / {paper.date.slice(0,4)}</div><h1>{paper.shortTitle}<span className="reader-title-point">.</span></h1><h2>{paper.title}</h2><p className="paper-hero-subtitle">{paper.subtitle}</p><p className="paper-hero-description">{paper.abstract.replace(/ Một trong sáu PDF ban đầu của người đọc\./g,"").replace(/ Một trong sáu PDF gốc( của người đọc)?\./g,"")}</p><div className="paper-hero-meta"><div><Clock3 size={15}/>{paper.readingMinutes} PHÚT ĐỌC CHUYÊN SÂU</div><div><BookOpen size={15}/> DIỄN GIẢI TIẾNG VIỆT</div><div><GitFork size={15}/>{links.length} LIÊN KẾT</div></div>
        <div className="paper-resources" aria-label="Mã nguồn và model liên quan">
          <div className="paper-resources-heading"><span>MÃ NGUỒN & MODEL</span><span>{resources.length} TÀI NGUYÊN</span></div>
          <div className="paper-resources-grid">
            {resources.map((resource)=><a key={resource.url} className={`paper-resource-link ${resource.origin === "community" ? "paper-resource-community" : ""}`} href={resource.url} target="_blank" rel="noopener noreferrer" aria-label={`${resource.platform === "github" ? "GitHub" : "Hugging Face"}: ${resourceKindLabels[resource.kind]} (${resource.origin === "official" ? "chính thức" : "cộng đồng"})`}>
              <span className="paper-resource-top">
                {resource.platform === "github" ? <Github size={17} aria-hidden="true"/> : <span className="paper-hf-icon" aria-hidden="true">HF</span>}
                <strong>{resource.platform === "github" ? "GitHub" : "Hugging Face"} <span>/ {resourceKindLabels[resource.kind]}</span></strong>
                <ExternalLink size={14} aria-hidden="true"/>
              </span>
              <span className="paper-resource-origin">{resource.origin === "official" ? "Chính thức" : "Cộng đồng, không chính thức"}</span>
              <span className="paper-resource-description">{resource.note}</span>
            </a>)}
          </div>
        </div></div><div className="paper-hero-art" aria-hidden="true"><div className="paper-orb"><div className="paper-orb-middle"/><div className="paper-orb-inner"/></div><div className="paper-hero-art-label">BÀI<br/>NGHIÊN CỨU</div></div></section>
      <div ref={readerRef} className="reader-section-top"><div className="reader-tabs" role="tablist" aria-label="Tư liệu bài báo"><button id="reader-tab-explain" role="tab" aria-controls="reader-tab-content" aria-selected={tab==="explain"} className={tab==="explain"?"selected":""} onClick={()=>selectTab("explain")}><BookOpen size={16}/> DIỄN GIẢI CHI TIẾT</button><button id="reader-tab-pdf" role="tab" aria-controls="reader-tab-content" aria-selected={tab==="pdf"} className={tab==="pdf"?"selected":""} onClick={()=>selectTab("pdf")}><FileText size={16}/> PDF GỐC</button><button id="reader-tab-slides" role="tab" aria-controls="reader-tab-content" aria-selected={tab==="slides"} className={tab==="slides"?"selected":""} onClick={()=>selectTab("slides")}><Rocket size={16}/> SLIDE <span className="tab-ready">{slides.length} TRANG</span></button></div><a className="reader-original-link" href={paper.source} target="_blank" rel="noopener noreferrer">BẢN GỐC <ArrowUpRight size={15}/></a></div>
      <div id="reader-tab-content" role="tabpanel" aria-labelledby={`reader-tab-${tab}`} className="reader-content-shell"><AnimatePresence mode="wait" initial={false}>
      {tab==="explain"&&<motion.div key="explain" initial={{opacity:0,y:9}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-9}} className={`reader-grid ${tocVisible?"":"reader-grid-notoc"}`}>
        <aside className="reader-toc" aria-label="Nội dung bài"><div className="toc-title"><span>TRONG BÀI NÀY</span><button onClick={()=>setTocVisible(false)} aria-label="Ẩn mục lục"><PanelLeftClose size={16}/></button></div><div className="toc-content">{toc.map((item,idx)=><button key={item.id} className={activeSection===item.id?"toc-active":""} onClick={()=>jump(item.id)}><span>{(idx+1).toString().padStart(2,"0")}</span>{titleDisplay(item.title)}</button>)}</div><div className="toc-footer">MỤC LỤC BÀI ĐỌC<span className="toc-footer-dots">● ● ● ●</span></div></aside>
        <article className="paper-article">{!tocVisible &&<button className="restore-toc" onClick={()=>setTocVisible(true)}><PanelLeftOpen size={16}/> HIỆN MỤC LỤC</button>}<div className="article-intro"><span className="article-eyebrow">PHÂN TÍCH CHUYÊN SÂU / {paper.shortTitle.toUpperCase()}</span><h2>Hiểu sâu <em>bài nghiên cứu.</em></h2><p>Đi từ vấn đề, kiến thức nền, phương pháp, kết quả đến giới hạn và các nghiên cứu liên quan. Các nhận định độc lập được tách khỏi kết luận của tác giả.</p></div>
          {chapter?<div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm,remarkMath]} rehypePlugins={[rehypeKatex]} components={{h2:({children,...props})=><h2 id={titleSlug(String(children))} {...props}>{titleDisplay(String(children))}</h2>,a:({href,children,...props})=><a {...props} href={href} target={href?.startsWith("http")?"_blank":undefined} rel={href?.startsWith("http")?"noopener noreferrer":undefined}>{children}</a>,img:({src,alt})=><figure className="paper-source-figure"><img src={src} alt={alt||"Hình minh họa trích từ PDF bài báo"} loading="lazy" decoding="async"/><figcaption>{alt||"Hình minh họa trích từ PDF bài báo"}</figcaption></figure>}}>{chapter}</ReactMarkdown></div>:<div className="missing-chapter"><h2>Chưa tải được nội dung.</h2><p>Nguồn Markdown của bài này đang thiếu. Hãy xem bản PDF gốc.</p></div>}
          <div className="reader-next"><span className="mono-label">ĐỌC TIẾP MẠCH KIẾN THỨC</span><h3>Ý tưởng tiếp theo</h3><div className="next-links">{links.slice(0,5).map((r,i)=><Link key={i} href={`/paper/${r.from===paper.slug?r.to:r.from}`}><span>{relationTypeLabel[r.type]}</span><strong>{r.from===paper.slug?r.to:r.from}</strong><ArrowUpRight size={17}/></Link>)}</div></div>
        </article>
        <aside className="reader-context"><div className="context-card"><span className="mono-label">THÔNG TIN BÀI BÁO</span><div><small>NƠI CÔNG BỐ</small><strong>{paper.venue}</strong></div><div><small>CÔNG BỐ ĐẦU TIÊN*</small><strong>{paper.date.slice(0,7)}</strong></div><div><small>CHỦ ĐỀ</small><strong>{categoryLabels[paper.category]}</strong></div><div><small>KHÁI NIỆM CHÍNH</small><div className="context-tags">{paper.concepts.map(t=><span key={t}>{t}</span>)}</div></div><small className="date-note">*Ngày đầu / tháng gần đúng nếu bản gốc không cung cấp ngày chính xác.</small></div><div className="context-cta"><BookMarked size={21}/><h4>Đối chiếu với bài gốc.</h4><p>Đối chiếu phương trình và bảng gốc để kiểm chứng nhận định.</p><a href={paper.pdf} target="_blank" rel="noopener noreferrer">MỞ PDF GỐC <ArrowUpRight size={15}/></a></div></aside>
      </motion.div>}
      {tab==="pdf"&&<motion.div key="pdf" initial={{opacity:0,y:9}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-9}} className="pdf-view"><div className="pdf-view-header"><div><span className="mono-label">TÀI LIỆU GỐC / {paper.venue}</span><h2>Bài báo <em>gốc</em></h2><p>PDF được tải từ nơi xuất bản hoặc arXiv. Một số nhà xuất bản chặn nhúng PDF, khi đó hãy dùng nút mở bản gốc.</p></div><a className="button button-primary" href={paper.pdf} target="_blank" rel="noopener noreferrer">MỞ TOÀN BỘ PDF <ExternalLink size={16}/></a></div><div className="pdf-frame"><div className="pdf-frame-title"><FileText size={16}/>{paper.shortTitle}.pdf<span>TÀI LIỆU TRỰC TUYẾN</span></div><iframe title={`${paper.shortTitle} – PDF bài báo gốc`} src={`${paper.pdf}#toolbar=1&navpanes=0`} loading="lazy" referrerPolicy="no-referrer"/><div className="pdf-frame-fallback"><span>KHÔNG HIỂN THỊ ĐƯỢC PDF?</span><a href={paper.pdf} target="_blank" rel="noopener noreferrer">MỞ TRONG TAB MỚI <ArrowUpRight size={14}/></a></div></div></motion.div>}
      {tab==="slides"&&<motion.div key="slides" initial={{opacity:0,y:9}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-9}} className="brief-reader-mount"><SlideDeck paper={paper} slides={slides} chapter={chapter} onRead={()=>selectTab("explain")}/></motion.div>}
      </AnimatePresence></div>
      <footer className="reader-footer"><Link href="/"><Orbit size={20}/> ROBOTICS / ATLAS</Link><span>Quyền tác giả thuộc về nhóm nghiên cứu. Phần diễn giải là ghi chú học tập độc lập.</span><a href={paper.source} target="_blank" rel="noopener noreferrer">TRÍCH DẪN BÀI GỐC <ArrowUpRight size={15}/></a></footer>
    </div>
  </main>;
}
