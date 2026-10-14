import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {PaperFigure} from "@/components/paper-figure";
import {titleSlug,titleDisplay} from "@/lib/chapter-headings";
import type {SourceFigure} from "@/lib/figure-types";

/** Server-render Markdown; none of the parsing libraries belong in the browser. */
export function PaperChapter({paperSlug,chapter,figures}:{
  paperSlug:string;
  chapter:string;
  figures:SourceFigure[];
}){
  const figureByPath=new Map(figures.map(figure=>[figure.image,figure]));
  return <ReactMarkdown remarkPlugins={[remarkGfm,remarkMath]} rehypePlugins={[rehypeKatex]} components={{
    h2:({children,...props})=><h2 id={titleSlug(String(children))} {...props}>{titleDisplay(String(children))}</h2>,
    a:({href,children,...props})=><a {...props} href={href}
      target={href?.startsWith("http")?"_blank":undefined}
      rel={href?.startsWith("http")?"noopener noreferrer":undefined}>{children}</a>,
    img:({src,alt})=><PaperFigure paperSlug={paperSlug}
      meta={typeof src==="string"?figureByPath.get(src):undefined}
      src={typeof src==="string"?src:undefined} alt={alt}/>
  }}>{chapter}</ReactMarkdown>;
}
