export type ResearchSlideType =
  | "cover" | "problem" | "contrast" | "intuition" | "concepts"
  | "pipeline" | "representation" | "training" | "inference"
  | "equation" | "results" | "ablation" | "limits" | "relations" | "closing";

export type ResearchSlideItem = string | {label: string; value: string};

export interface ResearchSlide {
  type: ResearchSlideType;
  title: string;
  lead: string;
  items: ResearchSlideItem[];
  intuition: string;
  /** Specific, paper-grounded explanation displayed on the slide itself. */
  detail?: { label: string; text: string };
  /** Slide canvas is visual-first; explanation and Intuition live in presenter notes only. */
  stageMode?: "visual-first";
  /** Ready-to-speak paragraphs shown only in private Presenter View and Notes, never on projected canvas. */
  speakerScript?: string[];
  /** Source-grounded possible viva questions. Private speaker notes only. */
  defenseQA?: {question:string;answer:string;source:string}[];
  /** Special one-off research diagrams, avoiding repeated paper figures. */
  visual?: "mask-tradeoff" | "horizon-timeline" | "trained-runtime";
  equation?: string;
  /** Original source-paper illustration; loaded only when this slide is visible. */
  figure?: {src: string; alt: string; caption: string};
}
