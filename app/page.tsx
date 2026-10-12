import { AtlasShell } from "@/components/atlas-shell";
import { orderedPapers } from "@/lib/papers";
import { relations } from "@/lib/relations";

export default function Home() { return <AtlasShell papers={orderedPapers} relations={relations} />; }
