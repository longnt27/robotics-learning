import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ResearchSlide } from "./slide-types";

/** Each deck is reviewed, maintained and shipped as a static JSON resource. */
export async function getResearchSlides(slug: string): Promise<ResearchSlide[]> {
  if (!/^[a-z0-9-]+$/.test(slug)) return [];
  const raw = await readFile(join(process.cwd(), "content", "slides", `${slug}.json`), "utf8");
  const slides: unknown = JSON.parse(raw);
  if (!Array.isArray(slides) || slides.length !== 15) {
    throw new Error(`Invalid slide deck for ${slug}: expected 15 slides`);
  }
  return slides as ResearchSlide[];
}
