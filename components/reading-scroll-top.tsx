"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ReadingScrollTop() {
  const [visible,setVisible] = useState(false);
  useEffect(()=>{
    const update=()=>setVisible(window.scrollY>480);
    update();
    window.addEventListener("scroll",update,{passive:true});
    return ()=>window.removeEventListener("scroll",update);
  },[]);
  if(!visible) return null;
  const scroll=()=>{
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({top:0,behavior:reduce?"auto":"smooth"});
  };
  return <button type="button" className="paper-back-to-top" onClick={scroll} aria-label="Về đầu trang">
    <ArrowUp size={18}/><span>ĐẦU TRANG</span>
  </button>;
}
