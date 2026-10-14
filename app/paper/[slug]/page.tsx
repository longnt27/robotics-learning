import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { papers, getPaper } from "@/lib/papers";
import { relations } from "@/lib/relations";
import { getPaperChapter } from "@/lib/content";
import figureManifest from "@/content/paper-figures.json";
import { PaperReader } from "@/components/paper-reader";
import { PaperArticle } from "@/components/paper-article";
import { titleSlug } from "@/lib/reading-headings";
import { ReadingScrollTop } from "@/components/reading-scroll-top";

export function generateStaticParams() { return papers.map((paper) => ({slug: paper.slug})); }

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params;
  const paper = getPaper(slug);
  if (!paper) return { title: "Không tìm thấy paper" };
  return {title: paper.shortTitle, description: paper.abstract};
}

export default async function PaperPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const paper = getPaper(slug);
  if (!paper) notFound();
  const chapter = await getPaperChapter(slug);
  const figures = figureManifest[slug as keyof typeof figureManifest] ?? [];
  const toc = [...(chapter ?? "").matchAll(/^## (.+)$/gm)]
    .map(match=>({title:match[1],id:titleSlug(match[1])}));
  const related = relations.filter(relation=>relation.from===slug || relation.to===slug);
  return <>
    <PaperReader paper={paper} toc={toc} relations={related}
      article={<PaperArticle chapter={chapter} paperSlug={slug} figures={figures}/>}/>
    <ReadingScrollTop/>
  </>;
}
