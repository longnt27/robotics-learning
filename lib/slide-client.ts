import type {ResearchSlide} from "@/lib/slide-types";

export type SlidePayload = {slides:ResearchSlide[]; chapter:string|null};

/** Deduplicates requests and retains each opened deck across client navigation. */
const deckRequests = new Map<string, Promise<SlidePayload>>();

export function loadPaperSlides(slug: string): Promise<SlidePayload> {
  const existing = deckRequests.get(slug);
  if (existing) return existing;
  const request = fetch(`/api/papers/${encodeURIComponent(slug)}/slides`, {cache: "default"})
    .then(async response => {
      if (!response.ok) throw new Error(`Không tải được slide (HTTP ${response.status})`);
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object") throw new Error("Bộ slide không hợp lệ.");
      const {slides,chapter} = payload as {slides?:unknown;chapter?:unknown};
      if (!Array.isArray(slides) || slides.length !== 15 ||
          !(typeof chapter === "string" || chapter === null)) {
        throw new Error("Bộ slide không hợp lệ.");
      }
      return {slides:slides as ResearchSlide[],chapter};
    })
    .catch(error => {
      // Never cache a failed attempt. The Retry button can fetch again.
      deckRequests.delete(slug);
      throw error;
    });
  deckRequests.set(slug, request);
  return request;
}
