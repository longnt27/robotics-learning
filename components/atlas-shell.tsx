"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, ArrowUpRight, AudioLines, BookOpen, Braces, ChevronDown, CircleDot, Command, Github, GitFork, Grid2X2, Menu, Orbit, Search, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TimelineView } from "./timeline-view";
import type { Paper,PaperCategory } from "@/lib/papers";
import {categoryLabels} from "@/lib/papers";
import type { PaperRelation } from "@/lib/relations";
import { AmbientScene } from "./ambient-scene";
const GraphView = dynamic(()=>import("./graph-view").then(m=>m.GraphView),{ssr:false,loading:()=> <div className="graph-loading">LOADING RELATIONSHIP ENGINE <span className="loader-ring"/></div>});

type ViewType = "timeline" | "graph";
const categories: (PaperCategory | "ALL")[] = ["ALL","POLICIES","CONTROL","FOUNDATIONS","DATA","SYSTEMS"];
const categoryLabel: Record<string,string> = {ALL:"Tất cả",...categoryLabels};

export function AtlasShell({papers,relations}: {papers:Paper[];relations:PaperRelation[]}) {
  const [view,setView]=useState<ViewType>("timeline");
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState<PaperCategory|"ALL">("ALL");
  const [userOnly,setUserOnly]=useState(false);
  const [mobileNav,setMobileNav]=useState(false);
  const searchRef=useRef<HTMLInputElement>(null);
  const exploreRef=useRef<HTMLDivElement>(null);
  const filtered = useMemo(()=>papers.filter(p=>{
    const matchText=!query.trim()||[p.title,p.shortTitle,p.abstract,p.venue,p.category,...p.concepts].join(" ").toLowerCase().includes(query.toLowerCase().trim());
    return matchText && (category==="ALL" || p.category===category) && (!userOnly||p.userPick);
  }),[papers,query,category,userOnly]);
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{
      const tag=(event.target as HTMLElement)?.tagName?.toLowerCase();
      if(event.key==="/" && tag!=="input"&&tag!=="textarea") {event.preventDefault();searchRef.current?.focus();}
      if(event.key==="Escape") {searchRef.current?.blur();setMobileNav(false);}
    };
    document.addEventListener("keydown",key);
    return ()=>document.removeEventListener("keydown",key);
  },[]);
  const navigateToExplore=()=> exploreRef.current?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"instant":"smooth",block:"start"});
  return <main className="site-shell">
    <AmbientScene/>
    <div className="site-noise" aria-hidden="true"/>
    <div className="site-boundary">
      <header className="header-shell">
        <Link href="/" className="site-brand" aria-label="Robotics Atlas home"><span className="brand-symbol"><Orbit size={22}/><span/></span><span className="brand-name">ROBOTICS<span className="brand-slash"> / </span>ATLAS</span><span className="brand-version">01</span></Link>
        <nav className={`header-navigation ${mobileNav ? "header-navigation-open":""}`} aria-label="Main navigation">
          <button onClick={()=>{setView("timeline");setMobileNav(false);navigateToExplore();}}><CircleDot size={15}/> TIMELINE</button>
          <button onClick={()=>{setView("graph");setMobileNav(false);navigateToExplore();}}><GitFork size={15}/> KNOWLEDGE GRAPH</button>
          <a href="https://github.com/longnt27/robotics-learning" target="_blank" rel="noopener noreferrer"><Github size={15}/> SOURCE <ArrowUpRight size={13}/></a>
        </nav>
        <div className="header-meta"><span className="status-light"/> RESEARCH SYSTEM ONLINE</div>
        <button aria-label="Toggle navigation" className="header-menu" onClick={()=>setMobileNav(x=>!x)}>{mobileNav?<X size={20}/>:<Menu size={20}/>}</button>
      </header>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-overline"><span className="hero-overline-dot"/> AN INTERACTIVE MAP OF EMBODIED INTELLIGENCE <span className="hero-overline-line"/></div>
        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.75}} className="hero-copy">
          <p className="hero-index mono-label">/ 001 — THE RESEARCH UNIVERSE</p>
          <h1 id="hero-title">FROM <span className="hero-outline">PIXELS</span><br/>TO <span className="hero-motion">MOTION<span className="hero-period">.</span></span></h1>
          <div className="hero-bottom"><p>Robot học cách nhìn, suy luận và hành động như thế nào? Khám phá các paper định hình VLA qua lịch sử và mối liên hệ giữa những ý tưởng.</p><button onClick={navigateToExplore} className="hero-explore">EXPLORE THE ATLAS <span><ArrowRight size={17}/></span></button></div>
        </motion.div>
        <div className="hero-orbit-marker" aria-hidden="true"><span>R/22</span><div className="hero-orbit-marker-line"/></div>
        <div className="hero-stats" aria-label="Collection statistics"><div><strong>{papers.length.toString().padStart(2,"0")}</strong><span>RESEARCH PAPERS</span></div><div><strong>{papers.filter(p=>p.userPick).length.toString().padStart(2,"0")}</strong><span>YOUR COLLECTION</span></div><div><strong>{relations.length.toString().padStart(2,"0")}</strong><span>RESEARCH LINKS</span></div><div className="hero-scroll-hint">SCROLL TO DECODE <ChevronDown size={16}/></div></div>
      </section>
      <section ref={exploreRef} id="explore" className="explore-section" aria-label="Browse research papers">
        <div className="section-heading"><div><div className="mono-label"><span className="section-square"/> INDEX / KNOWLEDGE NAVIGATION</div><h2>Research <em>explorer</em><span className="heading-star">✳</span></h2></div><p>Hai góc nhìn. Một bản đồ. <span>{filtered.length} / {papers.length}</span> tín hiệu đang hiển thị.</p></div>
        <div className="explore-toolbar">
          <div className="view-switcher" role="tablist" aria-label="Cách xem paper"><button role="tab" id="tab-timeline" aria-controls="panel-atlas" aria-selected={view==="timeline"} className={view==="timeline"?"active":""} onClick={()=>setView("timeline")}><Grid2X2 size={16}/> TIMELINE {view==="timeline"&&<span className="active-indicator"/>}</button><button role="tab" id="tab-graph" aria-controls="panel-atlas" aria-selected={view==="graph"} className={view==="graph"?"active":""} onClick={()=>setView("graph")}><GitFork size={16}/> KNOWLEDGE DAG {view==="graph"&&<span className="active-indicator"/>}</button></div>
          <div className="search-wrap"><Search size={17}/><input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm paper, tác giả, khái niệm..." aria-label="Tìm paper"/><kbd>/</kbd>{query&&<button onClick={()=>setQuery("")} aria-label="Xóa tìm kiếm"><X size={15}/></button>}</div>
        </div>
        <div className="filter-toolbar"><div className="filter-items" aria-label="Filter by research theme">{categories.map(c=><button key={c} className={`filter-chip ${category===c?"filter-chip-active":""}`} aria-pressed={category===c} onClick={()=>setCategory(c)}>{categoryLabel[c]}</button>)}</div><button className={`my-picks-filter ${userOnly?"my-picks-filter-on":""}`} onClick={()=>setUserOnly(v=>!v)} aria-pressed={userOnly}><Sparkles size={15}/> MY COLLECTION <span>06</span></button></div>
        <div id="panel-atlas" role="tabpanel" aria-labelledby={view==="timeline"?"tab-timeline":"tab-graph"} className="explore-results"><AnimatePresence mode="wait" initial={false}><motion.div key={view} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.22}}>{view==="timeline"?<TimelineView papers={filtered}/>:<GraphView papers={filtered} allPapers={papers} relations={relations}/>}</motion.div></AnimatePresence></div>
      </section>
      <section className="atlas-manifesto"><div className="manifesto-glyph"><Braces size={30}/></div><div><span className="mono-label">THE INTENT / 001</span><h2>Read less blindly.<br/><em>Understand more deeply.</em></h2><p>Mỗi paper đi kèm bản gốc, diễn giải tiếng Việt dài, ví dụ, kết quả, giới hạn và những nghiên cứu liên quan. Đây là bản đồ để học, không phải danh sách link để quên.</p></div><div className="manifesto-deco" aria-hidden="true"><AudioLines size={62}/></div></section>
      <footer className="footer-shell"><div className="footer-brand"><Orbit size={20}/> ROBOTICS / ATLAS</div><p>Curated for learning. Original research remains credited to its authors.</p><a href="https://github.com/longnt27/robotics-learning" target="_blank" rel="noopener noreferrer">GITHUB / SOURCE <ArrowUpRight size={15}/></a></footer>
    </div>
  </main>;
}
