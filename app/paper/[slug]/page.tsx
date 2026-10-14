import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { papers, getPaper } from "@/lib/papers";
import { relations } from "@/lib/relations";
import { getPaperChapter } from "@/lib/content";
import {getPaperFigures} from "@/lib/paper-figures";
import { PaperReader } from "@/components/paper-reader";
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
  const figures = getPaperFigures(slug);
  return <><PaperReader paper={paper} chapter={chapter} relations={relations} figures={figures}/><ReadingScrollTop/></>;
}
