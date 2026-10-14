"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BookOpenText } from "lucide-react";

// No glossary JSON, search engine, or paper metadata in the initial client chunk.
const GlossaryDialog = dynamic(()=>import("./glossary-dialog").then(m=>m.GlossaryDialog),{ssr:false});

export function GlossaryLauncher({count}:{count:number}) {
  const [open,setOpen] = useState(false);
  const [activated,setActivated] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return <>
    <button ref={buttonRef} type="button" className="corpus-glossary-fab"
      onClick={()=>{setActivated(true);setOpen(true);}}
      aria-label="Mở từ điển thuật ngữ" aria-haspopup="dialog" aria-expanded={open}>
      <BookOpenText size={19}/><span>TỪ ĐIỂN</span>
      <span className="corpus-glossary-fab-count">{count}</span>
    </button>
    {activated && <GlossaryDialog open={open} close={()=>setOpen(false)} triggerRef={buttonRef}/>}
  </>;
}
