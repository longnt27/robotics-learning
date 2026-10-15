"use client";

import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {createPortal} from "react-dom";
import {PresenterPanel} from "./presenter-panel";
import {AnimatePresence,motion} from "framer-motion";
import {ArrowLeft,ArrowRight,ArrowUpRight,BookOpen,Check,ChevronLeft,ChevronRight,ExternalLink,Grid2X2,HelpCircle,Maximize2,Minimize2,NotebookText,Orbit,PlayCircle,Presentation,X} from "lucide-react";
import katex from "katex";
import type {Paper} from "@/lib/papers";
import type {ResearchSlide,ResearchSlideItem} from "@/lib/slide-types";

const SECTIONS: Record<ResearchSlide["type"],string> = {
  cover:"TỔNG QUAN",problem:"BÀI TOÁN",contrast:"ĐIỂM NGHẼN",intuition:"Ý TƯỞNG CỐT LÕI",
  concepts:"KIẾN THỨC NỀN",pipeline:"KIẾN TRÚC",representation:"BIỂU DIỄN",
  training:"HUẤN LUYỆN",inference:"SUY LUẬN",equation:"MATHEMATICAL INTUITION",
  results:"BẰNG CHỨNG",ablation:"ĐÁNH GIÁ THÀNH PHẦN",limits:"GIỚI HẠN",
  relations:"LIÊN HỆ",closing:"KẾT LUẬN",
};

const SECTION_HEADINGS: Record<ResearchSlide["type"],string> = {
  cover:"Vì sao cần nghiên cứu này?",problem:"Vì sao cần nghiên cứu này?",contrast:"Vì sao cần nghiên cứu này?",
  intuition:"Phương pháp thực hiện",concepts:"Kiến thức nền cần nắm",pipeline:"Phương pháp thực hiện",
  representation:"Phương pháp thực hiện",training:"Phương pháp thực hiện",inference:"Ví dụ từng bước",
  equation:"Phương pháp thực hiện",results:"Kết quả thực nghiệm",ablation:"Kết quả thực nghiệm",
  limits:"Hạn chế và câu hỏi còn mở",relations:"Liên hệ với nghiên cứu khác",closing:"Hạn chế và câu hỏi còn mở",
};

const PALETTE: Record<Paper["category"],{primary:string;glow:string;word:string}> = {
  FOUNDATIONS:{primary:"#a6caff",glow:"rgba(102,155,255,.20)",word:"TRI THỨC"},
  POLICIES:{primary:"#c5a7ff",glow:"rgba(168,115,255,.21)",word:"CHÍNH SÁCH"},
  DATA:{primary:"#83e8c4",glow:"rgba(85,208,165,.19)",word:"DỮ LIỆU"},
  CONTROL:{primary:"#ffe29a",glow:"rgba(241,173,89,.16)",word:"ĐIỀU KHIỂN"},
  SYSTEMS:{primary:"#ffb7d4",glow:"rgba(244,101,167,.17)",word:"HỆ THỐNG"},
};

type DocumentPictureInPictureAPI={requestWindow:(options:{width:number;height:number})=>Promise<Window>};

function getItemText(item:ResearchSlideItem){return typeof item==="string"?item:`${item.label}: ${item.value}`;}
function stripMarkdown(value:string){
  return value.replace(/```[\s\S]*?```/g," ").replace(/\$\$[\s\S]*?\$\$/g," ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g,"").replace(/\[([^\]]+)\]\([^)]*\)/g,"$1")
    .replace(/[\*`#>]/g,"").replace(/\s+/g," ").trim();
}
function chapterContext(chapter:string|null,kind:ResearchSlide["type"]){
  if(!chapter)return "";
  const name=SECTION_HEADINGS[kind];
  const sections=chapter.split(/^## /m).slice(1);
  const selected=sections.find(part=>part.startsWith(name));
  if(!selected)return "";
  const body=selected.substring(selected.indexOf("\n")+1);
  const paragraphs=body.split(/\n\s*\n/).map(stripMarkdown).filter(p=>p.length>85);
  const result=paragraphs.slice(0,2).join(" ");
  const max=850;
  if(result.length<=max)return result;
  const part=result.slice(0,max);
  return part.slice(0,Math.max(part.lastIndexOf(". "),part.lastIndexOf("; "),680)+1)+"…";
}

function DisplayCard({item,index,variant="plain"}:{item:ResearchSlideItem,index:number;variant?:string}){
  const label=typeof item==="string"?`0${index+1}`:item.label;
  const text=typeof item==="string"?item:item.value;
  return <div className={`brief-card brief-card-${variant}`}>
    <div className="brief-card-kicker"><span className="brief-card-sequence">{label}</span><span className="brief-card-tick"/></div>
    <p>{text}</p>
  </div>;
}

function OrbitalArt({paper,displayIndex}:{paper:Paper;displayIndex:number}){
  return <div className="brief-orbital" aria-hidden="true">
    <svg viewBox="0 0 440 330" preserveAspectRatio="xMidYMid meet" role="img">
      
      <circle cx="220" cy="167" r="110" fill="var(--brief-accent)" opacity=".065"/>
      {[68,115,161].map((r,i)=><circle key={i} cx="220" cy="165" r={r} fill="none" stroke="var(--brief-accent)" strokeWidth={i===2?.8:1.4} strokeDasharray={i===1?"8 12":undefined} opacity={i===2?.35:.65}/>)}
      <ellipse cx="220" cy="165" rx="182" ry="58" fill="none" transform="rotate(-28 220 165)" stroke="var(--brief-accent)" strokeOpacity=".48" strokeWidth="1.75"/>
      <ellipse cx="220" cy="165" rx="150" ry="78" fill="none" transform="rotate(34 220 165)" stroke="var(--brief-accent)" strokeOpacity=".31" strokeWidth="1.1"/>
      <circle cx="220" cy="165" r="29" fill="#101526" stroke="var(--brief-accent)" strokeWidth="2"/>
      <path d="M205 165h30m-15-15v30" stroke="var(--brief-accent)" strokeWidth="1.5" opacity=".95"/>
      <circle cx="365" cy="99" r="5" fill="var(--brief-accent)"/>
      <circle cx="68" cy="233" r="4" fill="var(--brief-accent)" opacity=".7"/>
      <text x="220" y="19" fill="var(--brief-accent)" textAnchor="middle" fontSize="11" fontFamily="monospace" letterSpacing="4">RESEARCH VECTOR</text>
      <text x="220" y="317" fill="#aab6cb" textAnchor="middle" fontSize="11" fontFamily="monospace" letterSpacing="2">{paper.shortTitle.toUpperCase().slice(0,25)} / {String(displayIndex).padStart(2,"0")}</text>
    </svg>
    <span className="brief-orbital-glare"/>
  </div>;
}


/** Paper 2506.07339, Eqs. (2-3); runtime accounting below is an illustrative estimate. */
function RtcInferenceCostBridge(){
  // RTC inference-time paper (arXiv:2506.07339), Algorithm 1, Eqs. (2-4):
  // split the identical vector-Jacobian product into its named intermediate
  // steps; this avoids a hanging "diag(W)" on a new display-math line.
  const weightedError=String.raw`\mathbf e=(\mathbf Y-\widehat{\mathbf A}^{1})^\top\operatorname{diag}(\mathbf W)`;
  const perActionError=String.raw`\mathbf e_i=W_i(Y_i-\widehat{\mathbf A}^{1}_i)`;
  const vjp=String.raw`\mathbf g=\mathbf e\,\frac{\partial\widehat{\mathbf A}^{1}}{\partial\mathbf A^\tau}`;
  const guidedVelocity=String.raw`\mathbf v_{\Pi\mathrm{GDM}}=\mathbf v_\pi+\gamma_\tau\,\mathbf g`;
  const denoised=String.raw`\widehat{\mathbf A}^{1}=\mathbf A^\tau+(1-\tau)\mathbf v_\pi`;
  const slowCost=String.raw`T_{\mathrm{infer}}\approx n(T_f+T_{\mathrm{VJP}})+T_0`;
  const fastCost=String.raw`T_{\mathrm{train}}\approx nT_f+T_0`;
  const math=(latex:string)=>({__html:katex.renderToString(latex,{displayMode:true,throwOnError:false,strict:"ignore",trust:false})});
  return <div className="brief-rtc-bridge" aria-label="Ba bước của pseudoinverse guidance trong RTC inference-time">
    <div className="brief-rtc-guidance">
      <div className="brief-rtc-eyebrow"><strong>RTC GỐC · GIẢI THÍCH GUIDANCE THEO 3 BƯỚC</strong><span>Algorithm 1, Eqs. (2–4)</span></div>
      <div className="brief-rtc-derivation">
        <section className="brief-rtc-step brief-rtc-weighted">
          <div className="brief-rtc-step-label"><span>01</span> Cân sai lệch ở từng hành động</div>
          <div className="brief-rtc-step-math" dangerouslySetInnerHTML={math(weightedError)}/>
          <div className="brief-rtc-element-formula"><span>Từng vị trí:</span><div dangerouslySetInnerHTML={math(perActionError)}/></div>
          <p><strong>Y</strong>: hành động cần khớp; <strong>Â¹</strong>: dự đoán chuỗi sạch. <strong>diag(W)</strong> tạo ma trận đường chéo từ W để cân sai lệch ở từng vị trí.</p>
        </section>
        <section className="brief-rtc-step brief-rtc-vjp">
          <div className="brief-rtc-step-label"><span>02</span> Tính hiệu chỉnh bằng VJP</div>
          <div className="brief-rtc-step-math" dangerouslySetInnerHTML={math(vjp)}/>
          <p>Nhân sai lệch đã cân với <strong>Jacobian</strong> của chuỗi dự đoán. Đây là phép <strong>VJP cần backpropagation</strong> trong mỗi bước khử nhiễu.</p>
        </section>
      </div>
      <div className="brief-rtc-mask-levels" aria-label="Giá trị trọng số của W">
        <strong>Ý nghĩa W:</strong>
        <span><b>Wᵢ = 1</b> · hành động đã cam kết</span>
        <span><b>0 &lt; Wᵢ &lt; 1</b> · vùng chồng, giảm dần</span>
        <span><b>Wᵢ = 0</b> · ngoài vùng chồng</span>
      </div>
      <div className="brief-rtc-guided-result">
        <div className="brief-rtc-step-label"><span>03</span> Hiệu chỉnh trường vận tốc</div>
        <div className="brief-rtc-result-math" dangerouslySetInnerHTML={math(guidedVelocity)}/>
        <p><strong>vπ</strong> là trường vận tốc ban đầu, <strong>γτ</strong> là độ mạnh hiệu chỉnh (có giới hạn). <strong>Â¹</strong> được ước lượng từ trạng thái Aτ:</p>
        <div className="brief-rtc-small-math" dangerouslySetInnerHTML={math(denoised)}/>
      </div>
    </div>
    <div className="brief-rtc-cost-pair">
      <section className="brief-rtc-cost-card brief-rtc-cost-old">
        <div className="brief-rtc-cost-name"><span>RTC CŨ</span> Guidance lúc suy luận</div>
        <div className="brief-rtc-cost-math" dangerouslySetInnerHTML={math(slowCost)}/>
        <p>Mỗi bước sinh: <strong>forward + VJP</strong>.</p>
      </section>
      <section className="brief-rtc-cost-card brief-rtc-cost-new">
        <div className="brief-rtc-cost-name"><span>RTC MỚI</span> Học điều kiện tiền tố</div>
        <div className="brief-rtc-cost-math" dangerouslySetInnerHTML={math(fastCost)}/>
        <p>Mỗi bước sinh: <strong>forward</strong>, không cần VJP bổ sung.</p>
      </section>
    </div>
    <div className="brief-rtc-takeaway">
      <span>BIỂU THỨC THỜI GIAN LÀ MINH HỌA</span>
      <p>Từ slide 04: mô hình học cách tiếp nối tiền tố ngay trong quá trình huấn luyện.</p>
    </div>
  </div>;
}

function SlideVisual({paper,slide,index,presenting=false}:{paper:Paper;slide:ResearchSlide;index:number;presenting?:boolean}){
  const items=slide.items;
  if(slide.type==="cover")return <div className="brief-cover-main">
    <div className="brief-cover-copy"><div className="brief-overline"><span className="brief-signal"/> RESEARCH BRIEFING / {paper.date.slice(0,4)}</div>
      <span className="brief-cover-ordinal">{String(index+1).padStart(2,"0")} / 15</span>
      <h2>{paper.shortTitle}<span className="brief-title-dot">.</span></h2>
      <p className="brief-cover-message">{slide.lead}</p>
      <div className="brief-cover-key"><span>LUẬN ĐIỂM CHÍNH</span><strong>{getItemText(items[0])}</strong>{slide.stageMode!=="visual-first"&&!presenting&&<p>{slide.intuition}</p>}</div>
      <div className="brief-cover-pill"><span/> {paper.venue} · {paper.userPick?"BÀI BẠN CHỌN":"BÀI NGHIÊN CỨU NỀN TẢNG"}</div>
    </div><OrbitalArt paper={paper} displayIndex={index+1}/>
  </div>;
  if(slide.type==="pipeline")return <div className="brief-flow" role="img" aria-label={items.map(getItemText).join(" rồi đến ")}>
    {items.map((item,i)=><div className="brief-flow-stage" key={i}><div className="brief-flow-stage-head"><span>{String(i+1).padStart(2,"0")}</span><span className="brief-flow-mark"/></div><strong>{getItemText(item)}</strong><span className="brief-flow-stage-foot">{i===0?"INPUT":i===items.length-1?"OUTPUT":"PROCESS"}</span></div>)}
  </div>;
  if(slide.type==="equation")return <div className="brief-formula">
      <div className="brief-formula-overline"><span className="brief-signal"/> TOÁN HỌC ĐƯỢC GIẢI THÍCH BẰNG LỜI</div>
      <div className="brief-formula-math"><span className="brief-rendered-math" dangerouslySetInnerHTML={{__html:katex.renderToString(slide.equation||"", {displayMode:true,throwOnError:false,strict:"ignore",trust:false})}} /></div>
      <div className="brief-formula-caption"><span>INTUITION</span><p>{slide.lead}</p></div>
      {items[0]&&<p className="brief-formula-disclaimer">{getItemText(items[0])}</p>}
    </div>;
  if(slide.type==="intuition")return <div className="brief-thesis">
    <div className="brief-thesis-light"><span>i</span></div>
    <p className="brief-thesis-word">{slide.lead}</p>
    {items[0]&&<div className="brief-thesis-key"><span>Ý NGHĨA CỦA CƠ CHẾ</span><p>{getItemText(items[0])}</p></div>}
    <div className="brief-thesis-bottom"><span>Ý TƯỞNG CỐT LÕI</span><span className="brief-thesis-line"/><span>KHÁC BIỆT NẰM Ở CƠ CHẾ</span></div>
  </div>;
  if(slide.type==="contrast"&&paper.slug==="rtc-training")return <RtcInferenceCostBridge/>;
  if(slide.type==="contrast"){
    // The reviewed RTC comparison stores OLD and NEW claims in separate items.
    // Render each claim in its matching column instead of labeling the old method as an innovation.
    const rtcComparison=paper.slug==="rtc-training" &&
      typeof items[0]==="string" && /^CŨ:/.test(items[0]) &&
      typeof items[1]==="string" && /^MỚI:/.test(items[1]);
    return <div className="brief-contrast">
      <div className="brief-contrast-old"><span className="brief-card-tag">CÁCH TIẾP CẬN TRƯỚC</span><div className="brief-viz-circle">×</div><h3>{rtcComparison?"Inference-time RTC":slide.stageMode==="visual-first"?"Inference-time RTC":slide.title}</h3><p>{rtcComparison?(items[0] as string).replace(/^CŨ:\s*/,""):slide.lead}</p></div>
      <div className="brief-contrast-divider">→</div>
      <div className="brief-contrast-new"><span className="brief-card-tag">ĐIỂM MỚI</span><div className="brief-viz-circle">↗</div><h3>{rtcComparison?"Training-Time RTC":getItemText(items[0])}</h3><p>{rtcComparison?(items[1] as string).replace(/^MỚI:\s*/,""):getItemText(items[1])}</p></div>
    </div>;
  }
  if(slide.type==="limits")return <div className="brief-limit-grid">{items.map((item,i)=><DisplayCard key={i} item={item} index={i} variant={i===0?"author":"critique"}/>)}</div>;
  if(slide.type==="concepts")return <div className="brief-concept-grid">{items.map((item,i)=><DisplayCard key={i} item={item} index={i} variant="concept"/>)}</div>;
  if(slide.type==="problem")return <div className="brief-problem-visual"><span className="brief-problem-icon">!</span><p>{slide.lead}</p><div className="brief-problem-fact"><span>BẾ TẮC HIỆN TẠI</span>{items.map(getItemText).join(" ")}</div></div>;
  if(slide.type==="closing")return <div className="brief-takeaways">
    {[slide.lead,...items.map(getItemText)].map((text,i)=><div key={i} className="brief-takeaway"><span>0{i+1}</span><strong>{text}</strong></div>)}
  </div>;
  const numbered = slide.type==="inference"||slide.type==="training"||slide.type==="relations";
  return <div className={`brief-fact-grid brief-fact-${slide.type} brief-card-count-${items.length}`}>
    {items.map((item,i)=><DisplayCard key={i} item={item} index={i} variant={numbered?"sequence":"fact"}/>)}
    <div className="brief-fact-decoration" aria-hidden="true"><span/><span/><span/><span/></div>
  </div>;
}

function updateDeepLink(index:number){
  if(typeof window==="undefined")return;
  const url=new URL(window.location.href);
  url.searchParams.set("tab","slides");url.searchParams.set("slide",String(index+1));
  window.history.replaceState(window.history.state,"",url.pathname+url.search+url.hash);
}

export function SlideDeck({paper,slides,chapter,onRead}:{paper:Paper;slides:ResearchSlide[];chapter:string|null;onRead:()=>void}){
  const [index,setIndex]=useState(0);
  const [overview,setOverview]=useState(false);
  const [notes,setNotes]=useState(false);
  const [help,setHelp]=useState(false);
  const [full,setFull]=useState(false);
  const [copied,setCopied]=useState(false);
  const [presenterWindow,setPresenterWindow]=useState<Window|null>(null);
  const presenterWindowRef=useRef<Window|null>(null);
  const [presenterError,setPresenterError]=useState("");
  const [elapsedSeconds,setElapsedSeconds]=useState(0);
  const stageRef=useRef<HTMLDivElement>(null);
  const gridRef=useRef<HTMLDivElement>(null);
  const palette=PALETTE[paper.category];

  // Document Picture-in-Picture keeps the notes in a different native window.
  // Only the main browser window is intended to be shared via Teams native.
  const closePresenter=useCallback(()=>{
    const popup=presenterWindowRef.current;
    presenterWindowRef.current=null;
    setPresenterWindow(null);
    if(popup&&!popup.closed)popup.close();
  },[]);

  const openPresenter=useCallback(async()=>{
    const existing=presenterWindowRef.current;
    if(existing&&!existing.closed){existing.focus();return;}
    const api=(window as Window&{documentPictureInPicture?:DocumentPictureInPictureAPI}).documentPictureInPicture;
    if(!api){
      setPresenterError("Presenter View cần Chrome hoặc Edge trên máy tính có hỗ trợ Document Picture-in-Picture. Ghi chú chưa được mở; không chia sẻ toàn màn hình.");
      return;
    }
    setPresenterError("");
    try{
      // requestWindow must be called directly from the user's click (user activation).
      const popup=await api.requestWindow({width:540,height:760});
      popup.document.title="Ghi chú thuyết trình · "+paper.shortTitle;
      popup.document.documentElement.lang="vi";
      const style=popup.document.createElement("link");
      style.rel="stylesheet";
      style.href=new URL("/presenter-view.css",window.location.origin).href;
      popup.document.head.appendChild(style);
      presenterWindowRef.current=popup;
      setNotes(false);
      setOverview(false);
      setHelp(false);
      setElapsedSeconds(0);
      setPresenterWindow(popup);
    }catch{
      // Never render a private-notes fallback into the shared slide window.
      setPresenterError("Không mở được cửa sổ ghi chú riêng. Hãy kiểm tra quyền Picture-in-Picture của Chrome/Edge rồi thử lại.");
    }
  },[paper.shortTitle]);

  useEffect(()=>{
    if(!presenterWindow)return;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const handleClose=()=>{
      if(presenterWindowRef.current===presenterWindow){
        presenterWindowRef.current=null;
        setPresenterWindow(null);
      }
    };
    presenterWindow.addEventListener("pagehide",handleClose);
    const started=Date.now();
    // OS-level close sometimes skips pagehide; a 1s check also recovers presentation mode.
    const timer=window.setInterval(()=>{
      if(presenterWindow.closed){handleClose();return;}
      setElapsedSeconds(Math.floor((Date.now()-started)/1000));
    },1000);
    return()=>{
      document.body.style.overflow=previousOverflow;
      presenterWindow.removeEventListener("pagehide",handleClose);
      window.clearInterval(timer);
    };
  },[presenterWindow]);

  useEffect(()=>()=>{const popup=presenterWindowRef.current;if(popup&&!popup.closed)popup.close();presenterWindowRef.current=null;},[]);

  useEffect(()=>{
    const n=Number(new URLSearchParams(window.location.search).get("slide"));
    const initial=Number.isInteger(n)&&n>=1&&n<=slides.length?n-1:0;
    setIndex(initial);
    updateDeepLink(initial);
  },[paper.slug,slides.length]);

  const go=useCallback((next:number)=>{
    setIndex(previous=>{
      const target=Math.max(0,Math.min(slides.length-1,next));
      if(previous!==target)updateDeepLink(target);
      return target;
    });
    setOverview(false);
  },[slides.length]);

  const toggleFullscreen=useCallback(async()=>{
    const el=stageRef.current;
    if(!el)return;
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else await el.requestFullscreen();
    }catch{/* User or browser may deny fullscreen; keep normal reader usable. */}
  },[]);

  useEffect(()=>{
    const update=()=>setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange",update);
    return()=>document.removeEventListener("fullscreenchange",update);
  },[]);

  useEffect(()=>{
    const handler=(event:KeyboardEvent)=>{
      const el=event.target as HTMLElement;
      if(["INPUT","TEXTAREA","SELECT"].includes(el?.tagName)||el?.isContentEditable||event.altKey||event.ctrlKey||event.metaKey)return;
      // Do not steal Space/Enter from keyboard-focused interactive controls.
      if((event.key===" "||event.key==="Enter")&&["BUTTON","A"].includes(el?.tagName))return;
      if(event.key==="Escape"){
        if(presenterWindowRef.current){closePresenter();return;}
        setOverview(false);setHelp(false);
        return;
      }
      if(overview){if(event.key==="Enter")setOverview(false);return;}
      if(help){if(event.key==="?"||event.key==="h")setHelp(false);return;}
      if(["ArrowRight","ArrowDown"," ","PageDown"].includes(event.key)){
        event.preventDefault();setIndex(i=>{const next=Math.min(i+1,slides.length-1);updateDeepLink(next);return next;});
      } else if(["ArrowLeft","ArrowUp","PageUp"].includes(event.key)){
        event.preventDefault();setIndex(i=>{const next=Math.max(0,i-1);updateDeepLink(next);return next;});
      } else if(event.key==="Home"){
        event.preventDefault();setIndex(0);updateDeepLink(0);
      } else if(event.key==="End"){
        event.preventDefault();setIndex(slides.length-1);updateDeepLink(slides.length-1);
      } else if(event.key.toLowerCase()==="g"&&!presenterWindow)setOverview(v=>!v);
      else if(event.key.toLowerCase()==="n"&&!presenterWindow)setNotes(v=>!v);
      else if(event.key.toLowerCase()==="f"&&!presenterWindow)void toggleFullscreen();
      else if(event.key==="?"&&!presenterWindow)setHelp(v=>!v);
    };
    window.addEventListener("keydown",handler);
    presenterWindow?.addEventListener("keydown",handler);
    return()=>{window.removeEventListener("keydown",handler);presenterWindow?.removeEventListener("keydown",handler);};
  },[help,overview,slides.length,toggleFullscreen,presenterWindow,closePresenter]);

  useEffect(()=>{if(overview)gridRef.current?.querySelector<HTMLButtonElement>(`button[data-slide-index="${index}"]`)?.focus();},[overview,index]);

  const slide=slides[index];
  // Visual-first slides keep explanations in the presenter panel, never on the projected canvas.
  const visualFirst=slide?.stageMode==="visual-first";
  const audienceOnly=visualFirst||Boolean(presenterWindow);
  const speakerText=useMemo(()=>chapterContext(chapter,slide.type),[chapter,slide.type]);
  const copy=async()=>{
    try{await navigator.clipboard.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),1400);}catch{}
  };
  if(!slide)return null;
  const audience=<section className={"brief-deck-root"+(presenterWindow?" brief-deck-presenting":"")} aria-label={`Slide nghiên cứu ${paper.shortTitle}`} style={{"--brief-accent":palette.primary,"--brief-glow":palette.glow} as React.CSSProperties}>
    <div className="brief-deck-toolbar">
      <div className="brief-deck-id"><span className="brief-deck-id-light"/> BẢN TRÌNH BÀY NGHIÊN CỨU <span className="brief-deck-id-sep">/</span> {paper.shortTitle.toUpperCase()}</div>
      <div className="brief-deck-actions"><button type="button" onClick={()=>void openPresenter()} aria-label="Bắt đầu Presenter View với ghi chú riêng"><Presentation size={16}/><span>TRÌNH CHIẾU + GHI CHÚ</span></button><button onClick={()=>setOverview(v=>!v)} aria-label="Xem tất cả slide" aria-pressed={overview}><Grid2X2 size={16}/> <span>XEM LƯỚI</span></button><button onClick={()=>setNotes(v=>!v)} aria-label="Bật tắt ghi chú thuyết trình" aria-pressed={notes}><NotebookText size={16}/> <span>GHI CHÚ</span></button><button onClick={toggleFullscreen} aria-label={full?"Thoát toàn màn hình":"Trình chiếu toàn màn hình"}>{full?<Minimize2 size={16}/>:<Maximize2 size={16}/>} <span>{full?"THU NHỎ":"TOÀN MÀN HÌNH"}</span></button><button onClick={()=>setHelp(v=>!v)} aria-label="Phím tắt trình chiếu" aria-pressed={help}><HelpCircle size={17}/></button></div>
    </div>
    {presenterError&&<p role="alert" className="brief-presenter-error">{presenterError}</p>}
    <div className={`brief-slide-stage ${visualFirst?"brief-slide-stage-visual-first":""}`} ref={stageRef} tabIndex={-1}>
      <div className="brief-slide-halo" aria-hidden="true"/>
      <div className="brief-slide-grid" aria-hidden="true"/>
      <div className="brief-slide-rail" aria-hidden="true"/>
      <header className="brief-slide-masthead"><div><Orbit size={19}/><strong>ROBOTICS <span>/</span> ATLAS</strong><span className="brief-mast-divider"/> {palette.word}</div><span>{paper.venue} <b>·</b> {paper.date.slice(0,4)}</span></header>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${paper.slug}-${index}`} className={`brief-slide-content brief-layout-${slide.type}`} initial={{opacity:0,y:14,filter:"blur(4px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} exit={{opacity:0,y:-10,filter:"blur(3px)"}} transition={{duration:.23,ease:"easeOut"}}>
          {slide.type!=="cover"&&<div className="brief-slide-heading"><div className="brief-chapter-label"><span className="brief-signal"/> {SECTIONS[slide.type]} <span className="brief-heading-rule"/> {String(index+1).padStart(2,"0")}</div><h2>{slide.title}</h2>{!["intuition","equation","problem","contrast"].includes(slide.type)&&<p className="brief-slide-description">{slide.lead}</p>}</div>}
          <div className={`brief-slide-art ${slide.figure?"brief-slide-art-with-figure":""}`}><div className="brief-slide-art-primary"><SlideVisual slide={slide} paper={paper} index={index} presenting={Boolean(presenterWindow)}/></div>{slide.figure&&<figure className="brief-source-figure"><div className="brief-source-image"><Image src={slide.figure.src} alt={slide.figure.alt} fill sizes="(max-width: 700px) 92vw, 42vw" priority={false} /></div><figcaption><span>HÌNH GỐC · NGUỒN BÀI BÁO</span>{slide.figure.caption}</figcaption></figure>}</div>
          {slide.detail&&!audienceOnly&&<aside className={`brief-slide-detail brief-slide-detail-${slide.type}`}><span className="brief-slide-detail-label"><span className="brief-signal"/> {slide.detail.label}</span><p>{slide.detail.text}</p></aside>}
          {!audienceOnly&&slide.type!=="cover"&&slide.type!=="equation"&&slide.type!=="intuition"&&<div className="brief-slide-intuition"><span>CÁCH HIỂU <i>→</i></span><p>{slide.intuition}</p></div>}
        </motion.div>
      </AnimatePresence>
      <div className="brief-stage-index"><span>SCENE {String(index+1).padStart(2,"0")}</span><span>{String(index+1).padStart(2,"0")} / {String(slides.length).padStart(2,"0")}</span></div>
      {overview&&<div className="brief-stage-overlay" role="dialog" aria-modal="true" aria-label="Lưới các slide">
        <div className="brief-overlay-top"><div><span className="brief-chapter-label">TOÀN BỘ NỘI DUNG</span><h3>Chọn phần cần trình bày</h3></div><button aria-label="Đóng lưới slide" onClick={()=>setOverview(false)}><X size={22}/></button></div>
        <div className="brief-slide-grid-menu" ref={gridRef}>{slides.map((s,i)=><button key={i} data-slide-index={i} aria-current={i===index?"step":undefined} className={i===index?"brief-thumbnail-active":""} onClick={()=>go(i)}><span>{String(i+1).padStart(2,"0")} / {SECTIONS[s.type]}</span><strong>{s.title}</strong><small>{s.lead}</small></button>)}</div>
      </div>}
      {help&&<div className="brief-stage-overlay brief-shortcuts" role="dialog" aria-modal="true" aria-label="Hướng dẫn phím tắt">
        <div className="brief-overlay-top"><div><span className="brief-chapter-label">ĐIỀU KHIỂN</span><h3>Trình chiếu bằng bàn phím</h3></div><button aria-label="Đóng hướng dẫn" onClick={()=>setHelp(false)}><X size={22}/></button></div>
        <div className="brief-shortcuts-grid">{[["← / →","Slide trước / sau"],["Space","Slide tiếp theo"],["Home / End","Đầu / cuối"],["G","Xem lưới"],["N","Ghi chú"],["F","Toàn màn hình"],["Esc","Đóng lớp phủ"]].map(([key,value])=><div key={key}><kbd>{key}</kbd><span>{value}</span></div>)}</div>
      </div>}
    </div>
    <div className="brief-progress-rail" role="progressbar" aria-valuemin={1} aria-valuemax={slides.length} aria-valuenow={index+1} aria-label="Tiến độ slide"><span style={{width:`${(index+1)/slides.length*100}%`}}/></div>
    <div className="brief-player-footer">
      <div className="brief-player-control"><button className="brief-nav-button" onClick={()=>go(index-1)} disabled={index===0} aria-label="Slide trước"><ChevronLeft size={20}/><span>TRƯỚC</span></button><button className="brief-nav-button brief-nav-next" onClick={()=>go(index+1)} disabled={index===slides.length-1} aria-label="Slide tiếp theo"><span>TIẾP</span><ChevronRight size={20}/></button><span className="brief-player-count">{String(index+1).padStart(2,"0")} <span>/</span> {slides.length}</span></div>
      <div className="brief-player-utils"><button onClick={copy}>{copied?<Check size={16}/>:<ArrowUpRight size={16}/>}<span>{copied?"ĐÃ SAO CHÉP":"LINK SLIDE"}</span></button><a href={paper.pdf} target="_blank" rel="noopener noreferrer"><ExternalLink size={15}/><span>PDF GỐC</span></a><button onClick={onRead}><BookOpen size={16}/><span>DIỄN GIẢI</span></button></div>
    </div>
    {notes&&!presenterWindow&&<div className="brief-speaker-notes"><div className="brief-notes-title"><NotebookText size={17}/><strong>GHI CHÚ KHI TRÌNH BÀY</strong><span>{slide.speakerScript?.length?"KỊCH BẢN NÓI TRỰC TIẾP":"NỘI DUNG ĐỐI CHIẾU TỪ BÀI DIỄN GIẢI"}</span></div>
      {slide.speakerScript?.length
        ? <div className="brief-speaker-script" aria-label="Kịch bản thuyết trình cho slide hiện tại">{slide.speakerScript.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>
        : <><p className="brief-notes-intuition"><strong>Cách hiểu.</strong> {slide.intuition}</p>{slide.detail&&<p><strong>{slide.detail.label}.</strong> {slide.detail.text}</p>}{speakerText&&<p>{speakerText}</p>}</>}
      {slide.speakerScript?.length&&<details className="brief-notes-reference"><summary>Thông tin kỹ thuật để đối chiếu</summary><p><strong>Ý chính:</strong> {slide.intuition}</p>{slide.detail&&<p><strong>{slide.detail.label}:</strong> {slide.detail.text}</p>}{speakerText&&<p>{speakerText}</p>}</details>}
      <button onClick={onRead}>ĐỌC CHƯƠNG ĐẦY ĐỦ <ArrowRight size={14}/></button></div>}
    <div className="brief-slide-disclaimer"><span>Slide tóm lược để thuyết trình; metric/nhận định cần đối chiếu với PDF gốc.</span><span>Nhấn <kbd>?</kbd> để xem phím tắt.</span></div>
    {presenterWindow&&<PresenterPanel popup={presenterWindow} paperTitle={paper.shortTitle} slides={slides} index={index} elapsedSeconds={elapsedSeconds} chapterContext={speakerText} onGo={go} onClose={closePresenter}/>}
  </section>;
  // Portal the shared slide stage to the document body, avoiding transformed reader ancestors.
  return presenterWindow?createPortal(audience,document.body):audience;
}
