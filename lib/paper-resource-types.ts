export type PaperResource = {
  platform: "github" | "huggingface";
  origin: "official" | "community";
  kind: "code" | "model" | "dataset" | "project";
  url: string;
  note: string;
};
