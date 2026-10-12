import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function getPaperChapter(slug: string): Promise<string | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return await readFile(join(process.cwd(), "content", "papers", `${slug}.md`), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
