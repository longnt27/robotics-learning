"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
import type {SourceFigure} from "@/lib/figure-types";

export function PaperFigure({paperSlug,src,alt,figures}:{
  paperSlug: string;
  src?: string;
  alt?: string;
  figures: SourceFigure[];
}) {
  const [open,setOpen] = useState(false);
  const [actualSize,setActualSize] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const meta = figures.find(figure => figure.image === src);
  const title = meta ? "Hình " + meta.number : alt || "Hình minh họa";
  const caption = meta?.caption || alt || "Chưa có caption gốc cho hình này.";
  const captionVi = meta?.caption_vi?.trim() || "Chưa có bản dịch tiếng Việt.";
  const isTranslated = Boolean(meta?.caption_vi?.trim());
  const captionLabel = meta?.translation_reviewed
    ? "BẢN DỊCH ĐÃ BIÊN TẬP"
    : isTranslated ? "BẢN DỊCH TỰ ĐỘNG (CHƯA BIÊN TẬP)" : "CHƯA CÓ BẢN DỊCH";
  const source = meta ? meta.pdf + "#page=" + meta.page : undefined;

  useEffect(()=>{
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return ()=>{
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  },[open]);

  if (!src) return null;

  const fullImage = open && createPortal(
    <dialog
      ref={dialogRef}
      className="paper-figure-lightbox"
      aria-label={"Xem " + title + " toàn màn hình"}
      onCancel={()=>setOpen(false)}
      onClick={event=>{if (event.target === event.currentTarget) setOpen(false);}}
    >
      <div className="paper-figure-lightbox-inner">
        <div className="paper-figure-lightbox-toolbar">
          <strong>{title.toUpperCase()} <span>• {paperSlug.toUpperCase()}</span></strong>
          <div className="paper-figure-lightbox-actions">
            <button type="button" onClick={()=>setActualSize(value=>!value)}
              aria-label={actualSize ? "Vừa màn hình" : "Xem ảnh ở kích thước gốc"}
              aria-pressed={actualSize}>
              {actualSize ? <ZoomOut size={19}/> : <ZoomIn size={19}/>}
              <span>{actualSize ? "Vừa màn hình" : "Kích thước gốc"}</span>
            </button>
            <button ref={closeRef} type="button" onClick={()=>setOpen(false)}
              aria-label="Đóng ảnh phóng to"><X size={23}/></button>
          </div>
        </div>
        <div className={"paper-figure-lightbox-canvas" + (actualSize ? " paper-figure-lightbox-canvas-actual" : "")}>
          <img src={src} alt={alt || title} decoding="async"/>
        </div>
        <div className="paper-figure-lightbox-caption">
          <span className="paper-figure-caption-heading">{captionLabel}</span>
          <p className="paper-figure-modal-vi">{captionVi}</p>
          <span className="paper-figure-caption-heading">CHÚ THÍCH GỐC (TIẾNG ANH)</span>
          <p className="paper-figure-modal-en">{caption}</p>
          {source && <a href={source} target="_blank" rel="noopener noreferrer">
            PDF GỐC · TRANG {meta?.page}<ExternalLink size={15}/>
          </a>}
        </div>
      </div>
    </dialog>,
    document.body
  );

  return <>
    <span className="paper-source-figure" role="figure" aria-label={title}>
      <button ref={triggerRef} type="button" className="paper-figure-open"
        onClick={()=>{setActualSize(false);setOpen(true);}}
        aria-label={"Phóng to " + title + " toàn màn hình"}>
        <img src={src} alt={alt || title} loading="lazy" decoding="async"/>
        <span className="paper-figure-zoom-label"><Maximize2 size={16}/> PHÓNG TO</span>
      </button>
      <span className="paper-source-figcaption">
        <span className="paper-figure-caption-heading">{captionLabel}</span>
        <span className="paper-figure-caption-vi">{captionVi}</span>
        <span className="paper-figure-caption-heading">CHÚ THÍCH GỐC (TIẾNG ANH)</span>
        <span className="paper-figure-caption-text">{caption}</span>
        {source && <a className="paper-figure-source-link" href={source}
          target="_blank" rel="noopener noreferrer">
          {title} · PDF trang {meta?.page} <ExternalLink size={14}/>
        </a>}
      </span>
    </span>
    {fullImage}
  </>;
}
