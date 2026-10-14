import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { PaperFigure } from "./paper-figure";
import type { SourceFigure } from "./paper-figure";
import { titleSlug, titleDisplay } from "@/lib/reading-headings";

// Server Component: phones receive rendered text; markdown parsers and KaTeX
// transforms never enter the reader's JavaScript bundle.
export function PaperArticle({chapter,paperSlug,figures}:{
  chapter: string | null;
  paperSlug: string;
  figures: SourceFigure[];
}) {
  if (!chapter) return <div className="missing-chapter">
    <h2>Chưa tải được nội dung.</h2>
    <p>Nguồn Markdown của bài này đang thiếu. Hãy xem bản PDF gốc.</p>
  </div>;

  const figuresByImage=new Map(figures.map(figure=>[figure.image,figure]));
  return <div className="markdown-body">
    <ReactMarkdown remarkPlugins={[remarkGfm,remarkMath]} rehypePlugins={[rehypeKatex]}
      components={{
        h2:({children,...props})=><h2 id={titleSlug(String(children))} {...props}>{titleDisplay(String(children))}</h2>,
        a:({href,children,...props})=><a {...props} href={href}
          target={href?.startsWith("http")?"_blank":undefined}
          rel={href?.startsWith("http")?"noopener noreferrer":undefined}>{children}</a>,
        img:({src,alt})=>{
          const image=typeof src==="string"?src:undefined;
          return <PaperFigure paperSlug={paperSlug} src={image} alt={alt} figure={image?figuresByImage.get(image):undefined}/>;
        },
      }}>{chapter}</ReactMarkdown>
  </div>;
}
