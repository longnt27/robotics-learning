"use client";
import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ReactFlow, BackgroundVariant, Background, Controls, MiniMap, Handle, Position, MarkerType, type Node, type Edge, type NodeProps } from "@xyflow/react";
import { Bookmark, ArrowUpRight, Network, MousePointer2 } from "lucide-react";
import type { Paper } from "@/lib/papers";
import type { PaperRelation } from "@/lib/relations";
import { relationTypeLabel } from "@/lib/relations";

const CATEGORIES: Record<string,string> = {FOUNDATIONS:"#82b8fb", POLICIES:"#b998ff", DATA:"#8fe6b7", CONTROL:"#f2c78f", SYSTEMS:"#f18bb5"};
const EDGE_COLORS: Record<string,string> = {foundation:"#91b9ff",method:"#d0a6fc",benchmark:"#7ce1b2",parallel:"#77859f"};

type GraphDatum = {label:string; tagline:string; category:string; year:string; userPick:boolean; active:boolean; muted:boolean; slug:string; } & Record<string, unknown>;
type AtlasNode = Node<GraphDatum,"paper">;

function PaperNode({ data }: NodeProps<AtlasNode>) {
  return <div className={`graph-node ${data.userPick?"graph-node-pick":""} ${data.muted ?"graph-node-muted":""} ${data.active?"graph-node-active":""}`} style={{"--node-accent": CATEGORIES[data.category] || "#c7a1ff"} as React.CSSProperties}>
    <Handle id="target" type="target" position={Position.Left} isConnectable={false}/>
    <div className="graph-node-top"><span>{data.year} / {data.category}</span>{data.userPick ? <Bookmark size={12} fill="currentColor"/> : <ArrowUpRight size={13}/>}</div>
    <strong>{data.label}</strong>
    <span className="graph-node-caption">{data.tagline}</span>
    <Handle id="source" type="source" position={Position.Right} isConnectable={false}/>
  </div>;
}
const nodeTypes = { paper: PaperNode };

export function GraphView({papers, allPapers, relations}: {papers:Paper[]; allPapers:Paper[]; relations:PaperRelation[]}) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string|null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const selectedIds = useMemo(() => {
    if (!hovered) return new Set<string>();
    const neighbors = relations.filter(r=>r.from===hovered || r.to===hovered).map(r=>r.from===hovered?r.to:r.from);
    return new Set([hovered,...neighbors]);
  },[hovered,relations]);
  const visibleRelations = useMemo(() => relations.filter(r => papers.some(p=>p.slug===r.from) && papers.some(p=>p.slug===r.to) && (typeFilter==="all" || r.type===typeFilter)),[papers,relations,typeFilter]);
  const {nodes, edges} = useMemo(() => {
    const yearBuckets = new Map<string,Paper[]>();
    const all = [...papers].sort((a,b)=>a.date.localeCompare(b.date));
    for (const p of all) {const y=p.date.slice(0,4);yearBuckets.set(y,[...(yearBuckets.get(y)||[]),p]);}
    const resultNodes: AtlasNode[] = [];
    const orderedYears = [...yearBuckets.keys()];
    orderedYears.forEach((year,yi) => {
      const bucket=yearBuckets.get(year)!;
      bucket.forEach((paper,bi)=>{
        resultNodes.push({id:paper.slug,type:"paper",position:{x:yi*300+36,y:bi*125+44},data:{label:paper.shortTitle,tagline:paper.concepts.slice(0,2).join(" · "),category:paper.category,year,userPick:paper.userPick,active:hovered===paper.slug,muted:!!hovered&&!selectedIds.has(paper.slug),slug:paper.slug}});
      });
    });
    const resultEdges: Edge[] = visibleRelations.map((r,i)=>({id:`e-${i}-${r.from}-${r.to}`,source:r.from,target:r.to,sourceHandle:"source",targetHandle:"target",type:"smoothstep",animated:(r.type==="method"||r.type==="foundation")&&!hovered,style:{stroke:EDGE_COLORS[r.type],strokeWidth:hovered && (r.from===hovered || r.to===hovered)?2.9:1.4,opacity:hovered && r.from!==hovered && r.to!==hovered?0.16:0.65,strokeDasharray:r.type==="parallel"?"4 6":undefined},markerEnd:{type:MarkerType.ArrowClosed,color:EDGE_COLORS[r.type],width:15,height:15},zIndex:r.from===hovered||r.to===hovered?3:0}));
    return {nodes:resultNodes,edges:resultEdges};
  },[papers,visibleRelations,hovered,selectedIds]);
  const chosen=allPapers.find(p=>p.slug===hovered);
  const incident=hovered?visibleRelations.filter(r=>r.from===hovered||r.to===hovered):[];
  const onNodeClick=useCallback((_:React.MouseEvent,node:AtlasNode)=>router.push(`/paper/${node.id}`),[router]);
  if (!papers.length) return <div className="empty-state"><span>NO SIGNAL</span><h3>Không có node nào phù hợp.</h3><p>Đổi bộ lọc để hiển thị bản đồ.</p></div>;
  return <div className="graph-workspace">
    <div className="graph-bar"><div className="graph-help"><MousePointer2 size={15}/><span>Kéo để di chuyển · Cuộn để zoom · Nhấn node để mở paper</span></div><select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} aria-label="Lọc quan hệ" className="graph-select"><option value="all">Tất cả quan hệ</option>{Object.entries(relationTypeLabel).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
    <div className="graph-canvas">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={onNodeClick} onNodeMouseEnter={(_,node)=>setHovered(node.id)} onNodeMouseLeave={()=>setHovered(null)} fitView fitViewOptions={{padding:.15,minZoom:.45,maxZoom:.85}} minZoom={0.2} maxZoom={2.1} panOnScroll zoomOnPinch proOptions={{hideAttribution:true}} onlyRenderVisibleElements nodesDraggable={false} nodesConnectable={false} elementsSelectable={true} colorMode="dark" attributionPosition="bottom-left">
        <Background variant={BackgroundVariant.Dots} color="#35405c" gap={25} size={1.1}/><Controls position="bottom-left" showInteractive={false}/><MiniMap position="bottom-right" nodeStrokeColor={n=>CATEGORIES[(n.data as GraphDatum).category]||"#9460ef"} nodeColor="#111828" nodeBorderRadius={6} pannable zoomable maskColor="rgba(2,4,13,.8)"/>
      </ReactFlow>
      <div className="graph-glow-corner" aria-hidden="true"/>
    </div>
    <aside className="graph-inspector" aria-live="polite">
      {chosen ? <><div className="inspector-caption">ACTIVE TRANSMISSION <span className="pulse-dot"/></div><h3>{chosen.shortTitle}</h3><p>{chosen.abstract}</p><div className="inspector-edges">{incident.slice(0,5).map((r,i)=><div key={i}><span className="edge-type-label" style={{color:EDGE_COLORS[r.type]}}>{relationTypeLabel[r.type]}</span><p>{r.reason}</p></div>)}</div><button onClick={()=>router.push(`/paper/${chosen.slug}`)} className="inspector-button">Mở bài nghiên cứu <ArrowUpRight size={16}/></button></>:
        <><div className="inspector-caption">CONNECTION INTELLIGENCE <Network size={14}/></div><h3>Ideas are never isolated.</h3><p>Di chuột vào một node để thấy những nghiên cứu cùng xây dựng, mở rộng hoặc đối chiếu ý tưởng của nó.</p><div className="graph-legend">{Object.entries(relationTypeLabel).map(([key,label])=><div key={key}><span style={{background:EDGE_COLORS[key]}}/>{label}</div>)}</div><div className="inspector-footnote">Đường nối cùng chủ đề không phải bằng chứng trích dẫn trực tiếp.</div></>}
    </aside>
  </div>;
}
