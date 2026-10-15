"use client";

import {createPortal} from "react-dom";
import {useEffect,useRef} from "react";
import {ArrowLeft,ArrowRight,Clock3,Monitor,NotebookPen,X} from "lucide-react";
import type {ResearchSlide} from "@/lib/slide-types";

type PresenterPanelProps={
  popup:Window;
  paperTitle:string;
  slides:ResearchSlide[];
  index:number;
  elapsedSeconds:number;
  chapterContext:string;
  onGo:(next:number)=>void;
  onClose:()=>void;
};

function elapsedLabel(seconds:number){
  const mins=String(Math.floor(seconds/60)).padStart(2,"0");
  const secs=String(seconds%60).padStart(2,"0");
  return mins+":"+secs;
}

/** The note DOM exists only in the separate Picture-in-Picture document.
 * Never render this component into the audience/shared document.
 */
export function PresenterPanel({popup,paperTitle,slides,index,elapsedSeconds,chapterContext,onGo,onClose}:PresenterPanelProps){
  const slide=slides[index];
  const next=slides[index+1];
  const scrollRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=0;},[index]);
  if(!slide)return null;
  return createPortal(
    <main className="presenter-shell" data-private-presenter="true">
      <header className="presenter-topbar">
        <div className="presenter-brand"><span className="presenter-live-dot"/> ROBOTICS / ATLAS</div>
        <button type="button" className="presenter-close" onClick={onClose} aria-label="Kết thúc chế độ thuyết trình"><X size={17}/> KẾT THÚC</button>
      </header>
      <div className="presenter-scroll" ref={scrollRef}>
        <div className="presenter-heading">
          <div>
            <span className="presenter-eyebrow">BẢNG ĐIỀU KHIỂN RIÊNG TƯ</span>
            <h1>{paperTitle}</h1>
          </div>
          <span className="presenter-clock"><Clock3 size={15}/> {elapsedLabel(elapsedSeconds)}</span>
        </div>
        <section className="presenter-current" aria-label="Slide hiện tại">
          <div className="presenter-section-top"><span>ĐANG CHIẾU</span><strong>{String(index+1).padStart(2,"0")} / {String(slides.length).padStart(2,"0")}</strong></div>
          <div className="presenter-progress" aria-hidden="true"><span style={{width:((index+1)/slides.length*100)+"%"}}/></div>
          <h2>{slide.title}</h2>
          <p>{slide.lead}</p>
        </section>
        <section className="presenter-notes" aria-label="Ghi chú riêng cho người thuyết trình">
          <h2><NotebookPen size={17}/> GHI CHÚ RIÊNG TƯ</h2>
          {slide.speakerScript?.length
            ? <div className="presenter-script" aria-label="Kịch bản thuyết trình để đọc trực tiếp">
                <div className="presenter-script-kicker">KỊCH BẢN NÓI · SLIDE {String(index+1).padStart(2,"0")}</div>
                {slide.speakerScript.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
              </div>
            : <>
                <div className="presenter-note-key"><span>Ý CẦN NHẤN MẠNH</span><p>{slide.intuition}</p></div>
                {slide.detail&&<div className="presenter-note-body"><span>{slide.detail.label}</span><p>{slide.detail.text}</p></div>}
              </>}
          {slide.defenseQA?.length?<details className="presenter-defense" aria-label="Câu hỏi phản biện và câu trả lời">
            <summary>CÂU HỎI PHẢN BIỆN · {slide.defenseQA.length} CÂU</summary>
            {slide.defenseQA.map((qa,i)=><article key={i} className="presenter-defense-answer">
              <strong>{i+1}. {qa.question}</strong><p>{qa.answer}</p><small>Nguồn / mức độ chứng cứ: {qa.source}</small>
            </article>)}
          </details>:null}
          {chapterContext&&<details className="presenter-more"><summary>Thông tin kỹ thuật tham khảo (không phải lời thoại)</summary>
            {slide.speakerScript?.length&&<p><strong>Ý cần nhấn mạnh:</strong> {slide.intuition}</p>}
            {slide.speakerScript?.length&&slide.detail&&<p><strong>{slide.detail.label}:</strong> {slide.detail.text}</p>}
            <p>{chapterContext}</p></details>}
        </section>
        <section className="presenter-next" aria-label="Slide tiếp theo">
          <span>TIẾP THEO · {next?String(index+2).padStart(2,"0"):"KẾT THÚC"}</span>
          <strong>{next?.title??"Đã hết phần trình bày"}</strong>
          {next&&<p>{next.lead}</p>}
        </section>
        <p className="presenter-sharing-tip"><Monitor size={17}/> Trong Teams, chỉ chia sẻ <strong>Window của Chrome/Edge chứa slide</strong>. Không chia sẻ toàn màn hình hoặc cửa sổ ghi chú này.</p>
      </div>
      <footer className="presenter-footer">
        <button type="button" onClick={()=>onGo(index-1)} disabled={index===0} aria-label="Slide trước trong Presenter View"><ArrowLeft size={18}/> TRƯỚC</button>
        <div className="presenter-shortcut">Dùng phím ← → để chuyển slide</div>
        <button type="button" onClick={()=>onGo(index+1)} disabled={index===slides.length-1} aria-label="Slide tiếp theo trong Presenter View">TIẾP <ArrowRight size={18}/></button>
      </footer>
    </main>,
    popup.document.body
  );
}
