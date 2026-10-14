"use client";

import {useRef,useState} from "react";
import dynamic from "next/dynamic";
import {BookOpenText} from "lucide-react";
import summary from "@/content/glossary-summary.json";

// The dictionary and its search engine are downloaded only on the first click.
// Keep the dialog mounted after first use to preserve search, filters and cache.
const GlossaryDialog = dynamic(()=>import("./glossary-dialog").then(m=>m.GlossaryDialog),{ssr:false});

export function GlossaryLauncher(){
  const [open,setOpen]=useState(false);
  const [wasOpened,setWasOpened]=useState(false);
  const buttonRef=useRef<HTMLButtonElement>(null);
  return <>
    <button ref={buttonRef} type="button" className="corpus-glossary-fab" onClick={()=>{setWasOpened(true);setOpen(true);}}
      aria-label="Mở từ điển thuật ngữ" aria-haspopup="dialog" aria-expanded={open}>
      <BookOpenText size={19}/><span>TỪ ĐIỂN</span><span className="corpus-glossary-fab-count">{summary.count}</span>
    </button>
    {wasOpened && <GlossaryDialog open={open} onClose={()=>setOpen(false)} buttonRef={buttonRef}/>}
  </>;
}
