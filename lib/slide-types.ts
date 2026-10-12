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
  equation?: string;
}
