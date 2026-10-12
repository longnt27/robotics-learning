import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function getPaperChapter(slug: string): Promise<string | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const content = await readFile(join(process.cwd(), "content", "papers", `${slug}.md`), "utf8");
    // Hide internal generator markers from HTML; keep them in source for idempotent rebuilds.
    return content.replace(/^[ \t]*<!-- (?:BEGIN|END) (?:EXTENDED WALKTHROUGH|ADDITIONAL PDF FIGURES) -->[ \t]*$/gm, "");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
