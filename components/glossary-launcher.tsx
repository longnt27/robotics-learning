"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { BookOpenText, Search, X, ArrowUpRight, Hash } from "lucide-react";
import rawGlossary from "@/content/glossary.json";
import { paperBySlug } from "@/lib/papers";
import { searchGlossary } from "@/lib/glossary-search";

type TermCategory = "paper" | "foundation" | "learning" | "architecture" | "control" | "data";
type GlossaryTerm = {
  id: string;
  term: string;
  category: TermCategory;
  definition: string;
  papers: string[];
  aliases: string[];
};
const terms = rawGlossary as GlossaryTerm[];
const categories: {id: TermCategory | "all"; label: string}[] = [
  {id:"all",label:"Tất cả"},
  {id:"paper",label:"Công trình"},
  {id:"foundation",label:"Nền tảng"},
  {id:"learning",label:"Huấn luyện"},
  {id:"architecture",label:"Kiến trúc"},
  {id:"control",label:"Điều khiển"},
  {id:"data",label:"Dữ liệu & đánh giá"},
];
const categoryLabel = Object.fromEntries(categories.map(({id,label})=>[id,label]));

export function GlossaryLauncher() {
  const [mounted,setMounted] = useState(false);
  const [open,setOpen] = useState(false);
  const [query,setQuery] = useState("");
  const [category,setCategory] = useState<TermCategory | "all">("all");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = useMemo(()=>searchGlossary(terms,query,category),[query,category]);

  useEffect(()=>setMounted(true),[]);
  useEffect(()=>{
    if(!mounted || !open) return;
    const dialog=dialogRef.current;
    if(!dialog) return;
    const overflow=document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow="hidden";
    inputRef.current?.focus();
    return ()=>{
      if(dialog.open) dialog.close();
      document.body.style.overflow=overflow;
      buttonRef.current?.focus();
    };
  },[mounted,open]);

  const close=()=>setOpen(false);

  const overlay = mounted && createPortal(
    <dialog
      ref={dialogRef}
      className="corpus-glossary-dialog"
      aria-labelledby="corpus-glossary-title"
      onCancel={close}
      onClick={(event)=>{if(event.target===event.currentTarget) close();}}
    >
      <div className="corpus-glossary-inner">
        <header className="corpus-glossary-header">
          <div>
            <span className="corpus-glossary-kicker"><Hash size={13}/> THƯ VIỆN / TRA CỨU</span>
            <h2 id="corpus-glossary-title">Từ điển <em>robotics</em></h2>
            <p>{terms.length} thuật ngữ · 22 bài nghiên cứu</p>
          </div>
          <button type="button" className="corpus-glossary-close" onClick={close} aria-label="Đóng từ điển"><X size={21}/></button>
        </header>
        <div className="corpus-glossary-controls">
          <label className="corpus-glossary-search" htmlFor="corpus-glossary-query">
            <Search size={19}/>
            <input
              ref={inputRef}
              id="corpus-glossary-query"
              type="search"
              autoComplete="off"
              placeholder="ACT, RTC, flow matching, MoE..."
              aria-label="Tìm thuật ngữ"
              value={query}
              onChange={(event)=>setQuery(event.target.value)}
            />
            {query && <button type="button" aria-label="Xóa từ khóa tìm kiếm" onClick={()=>{setQuery("");inputRef.current?.focus();}}><X size={16}/></button>}
          </label>
          <div className="corpus-glossary-filters" aria-label="Lọc loại thuật ngữ">
            {categories.map(({id,label})=><button type="button" key={id} aria-pressed={category===id}
              className={category===id?"is-active":""} onClick={()=>setCategory(id)}>{label}</button>)}
          </div>
          {!query && <div className="corpus-glossary-examples">
            <span>Tra nhanh</span>
            {["ACT","RTC","Flow matching","Diffusion model","MoE"].map(term=><button key={term} type="button" onClick={()=>{setCategory("all");setQuery(term);inputRef.current?.focus();}}>{term}</button>)}
          </div>}
        </div>
        <div className="corpus-glossary-results-heading" aria-live="polite">
          <span>{matches.length} THUẬT NGỮ</span>
          <span>{categoryLabel[category]}</span>
        </div>
        <section className="corpus-glossary-results" aria-label="Danh sách thuật ngữ và định nghĩa">
          {matches.length ? matches.map(entry=>(
            <article className="corpus-glossary-entry" key={entry.id}>
              <div className="corpus-glossary-entry-heading">
                <h3>{entry.term}</h3>
                <span>{categoryLabel[entry.category]}</span>
              </div>
              <p>{entry.definition}</p>
              {entry.aliases.length>0 && <p className="corpus-glossary-aliases">Còn gọi: {entry.aliases.join(" · ")}</p>}
              <div className="corpus-glossary-references">
                <span>ĐỌC TRONG</span>
                {entry.papers.map(slug=>{
                  const paper=paperBySlug.get(slug);
                  return paper?<Link key={slug} href={"/paper/" + slug} onClick={close} title={"Mở bài " + paper.shortTitle}>
                    {paper.shortTitle}<ArrowUpRight size={12}/>
                  </Link>:null;
                })}
              </div>
            </article>
          )):<div className="corpus-glossary-empty">
            <Search size={24}/>
            <strong>Không tìm thấy thuật ngữ</strong>
            <p>Thử tên viết tắt, tên tiếng Anh hoặc tiếng Việt không dấu.</p>
            <button type="button" onClick={()=>{setQuery("");setCategory("all");inputRef.current?.focus();}}>Hiện toàn bộ từ điển</button>
          </div>}
        </section>
        <footer className="corpus-glossary-footer">
          Định nghĩa tổng hợp từ corpus. Mở paper để đọc cơ chế và thí nghiệm chi tiết.
        </footer>
      </div>
    </dialog>,
    document.body
  );

  return <>
    <button ref={buttonRef} type="button" className="corpus-glossary-fab" onClick={()=>setOpen(true)}
      aria-label="Mở từ điển thuật ngữ" aria-haspopup="dialog" aria-expanded={open}>
      <BookOpenText size={19}/><span>TỪ ĐIỂN</span><span className="corpus-glossary-fab-count">{terms.length}</span>
    </button>
    {overlay}
  </>;
}
