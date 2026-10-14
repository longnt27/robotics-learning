import type {ResearchSlide} from "@/lib/slide-types";

/** Deduplicates requests and retains each opened deck across client navigation. */
const deckRequests = new Map<string, Promise<ResearchSlide[]>>();

export function loadPaperSlides(slug: string): Promise<ResearchSlide[]> {
  const existing = deckRequests.get(slug);
  if (existing) return existing;
  const request = fetch(`/api/papers/${encodeURIComponent(slug)}/slides`, {cache: "default"})
    .then(async response => {
      if (!response.ok) throw new Error(`Không tải được slide (HTTP ${response.status})`);
      const slides: unknown = await response.json();
      if (!Array.isArray(slides) || slides.length !== 15) {
        throw new Error("Bộ slide không hợp lệ.");
      }
      return slides as ResearchSlide[];
    })
    .catch(error => {
      // Never cache a failed attempt. The Retry button can fetch again.
      deckRequests.delete(slug);
      throw error;
    });
  deckRequests.set(slug, request);
  return request;
}
