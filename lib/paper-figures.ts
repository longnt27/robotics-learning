import "server-only";
import allFigures from "@/content/paper-figures.json";
import type {SourceFigure} from "@/lib/figure-types";

/** Keep the 167-figure source manifest out of all client-side JavaScript. */
const manifest = allFigures as Record<string, Array<SourceFigure & Record<string, unknown>>>;

export function getPaperFigures(slug: string): SourceFigure[] {
  // Send only visible captions for the requested paper; never send bbox,
  // hashes, extraction metadata, or captions for the other 21 papers.
  return (manifest[slug] ?? []).map(({image,number,page,pdf,caption,caption_vi,translation_reviewed}) =>
    ({image,number,page,pdf,caption,caption_vi,translation_reviewed}));
}
