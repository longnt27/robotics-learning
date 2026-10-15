import "server-only";
import type { ResearchSlide } from "./slide-types";

// Explicit per-paper imports keep decks traceable in Vercel serverless builds.
// A request loads only its own deck; no slide JSON enters the reading page JS.
const loadDecks:Record<string,()=>Promise<{default:unknown}>>={
  "act":()=>import("@/content/slides/act.json"),
  "bridgedata-v2":()=>import("@/content/slides/bridgedata-v2.json"),
  "diffusion-policy":()=>import("@/content/slides/diffusion-policy.json"),
  "droid":()=>import("@/content/slides/droid.json"),
  "fast":()=>import("@/content/slides/fast.json"),
  "groot-n1":()=>import("@/content/slides/groot-n1.json"),
  "libero":()=>import("@/content/slides/libero.json"),
  "lingbot-vla-2":()=>import("@/content/slides/lingbot-vla-2.json"),
  "mimicplay":()=>import("@/content/slides/mimicplay.json"),
  "octo":()=>import("@/content/slides/octo.json"),
  "open-x-embodiment":()=>import("@/content/slides/open-x-embodiment.json"),
  "openvla":()=>import("@/content/slides/openvla.json"),
  "palm-e":()=>import("@/content/slides/palm-e.json"),
  "pi-0-5":()=>import("@/content/slides/pi-0-5.json"),
  "qwen-vla":()=>import("@/content/slides/qwen-vla.json"),
  "rdt-1b":()=>import("@/content/slides/rdt-1b.json"),
  "robocasa":()=>import("@/content/slides/robocasa.json"),
  "rt-1":()=>import("@/content/slides/rt-1.json"),
  "rt-2":()=>import("@/content/slides/rt-2.json"),
  "rtc-inference":()=>import("@/content/slides/rtc-inference.json"),
  "rtc-training":()=>import("@/content/slides/rtc-training.json"),
  "vima":()=>import("@/content/slides/vima.json"),
};

export async function getResearchSlides(slug: string): Promise<ResearchSlide[]> {
  const load = loadDecks[slug];
  if (!load) return [];
  const {default:raw} = await load();
  const expected = slug === "rtc-training" ? 10 : 15;
  if (!Array.isArray(raw) || raw.length !== expected) {
    throw new Error(`Invalid slide deck for ${slug}: expected ${expected} slides`);
  }
  return raw as ResearchSlide[];
}
