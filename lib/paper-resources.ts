import "server-only";
import resourcesData from "@/lib/paper-resources.json";
import type {PaperResource} from "@/lib/paper-resource-types";

const resources = resourcesData as Record<string, PaperResource[]>;

/** Send only links relevant to the active paper, never the full corpus. */
export function getPaperResources(slug:string): PaperResource[] {
  return resources[slug] ?? [];
}
