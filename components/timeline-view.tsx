"use client";
import Link from "next/link";
import { ArrowUpRight, Bookmark, Clock3 } from "lucide-react";
import { motion } from "framer-motion";
import type { Paper } from "@/lib/papers";
import { categoryLabels } from "@/lib/papers";

export function TimelineView({papers}: {papers: Paper[]}) {
  if(!papers.length) return <div className="empty-state"><span>NO SIGNAL</span><h3>Không tìm thấy paper phù hợp.</h3><p>Thử xoá từ khoá hoặc chọn một nhóm chủ đề khác.</p></div>;
  const years = [...new Set(papers.map(p => p.date.slice(0,4)))];
  return <div className="timeline">
    {years.map((year) => <section className="timeline-year" key={year} aria-label={`Các paper năm ${year}`}>
      <div className="timeline-year-heading"><span className="timeline-year-label">{year}</span><span className="timeline-year-line"/><span className="timeline-year-count">{papers.filter(p=>p.date.startsWith(year)).length.toString().padStart(2,"0")} ENTRIES</span></div>
      <div className="timeline-track">
      {papers.filter(p=>p.date.startsWith(year)).map((paper,idx) => <motion.div className="timeline-entry" key={paper.slug} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.1}} transition={{duration:.5,delay:Math.min(idx*.035,.15)}}>
        <span className={`timeline-node ${paper.userPick ? "timeline-node-pick": ""}`} aria-hidden="true"/>
        <Link href={`/paper/${paper.slug}`} className={`timeline-card ${paper.userPick ? "timeline-card-pick" : ""}`}>
          <div className="timeline-card-top">
            <div className="timeline-card-index">{paper.date.slice(5,7)} / {paper.date.slice(0,4)}</div>
            <div className="timeline-labels">
              <span className={`category-dot category-${paper.category.toLowerCase()}`}/>
              <span className="category-name">{categoryLabels[paper.category]}</span>
              {paper.userPick && <span className="pick-label"><Bookmark size={11} fill="currentColor"/> YOUR COLLECTION</span>}
            </div>
            <ArrowUpRight size={18} className="timeline-card-arrow" aria-hidden="true"/>
          </div>
          <div className="timeline-card-bottom">
            <div className="timeline-card-ordinal" aria-hidden="true">{(idx+1).toString().padStart(2,"0")}</div>
            <div className="timeline-copy"><h3>{paper.shortTitle}</h3><p className="timeline-full-title">{paper.title}</p><p className="timeline-summary">{paper.abstract}</p><div className="timeline-tags"><span>{paper.venue}</span><span><Clock3 size={12}/>{paper.readingMinutes} MIN READ</span></div></div>
          </div>
        </Link>
      </motion.div>)}
      </div>
    </section>)}
  </div>;
}
