import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { BookOpen, Loader2, Network, FileText, Search, Maximize2, Tag, Link as LinkIcon, FolderTree } from 'lucide-react';
import { lemmaService } from '@/services/LemmaService';
import { cn } from '@/lib/utils';

interface KnowledgeNode {
  id: string;
  label: string;
  kind?: string;
}
interface KnowledgeEdge {
  id: string;
  source_id: string;
  target_id: string;
  relation?: string;
}

const KIND_COLOR: Record<string, string> = {
  mission: '#8b5cf6', // violet
  task: '#6366f1',    // indigo
  memory: '#f59e0b',  // amber
  concept: '#ec4899', // pink
  person: '#3b82f6',  // blue
};

// --- CUSTOM PHYSICS HOOK ---
interface Position { x: number; y: number; vx: number; vy: number }

function useForceSimulation(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
  width: number,
  height: number
) {
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const positionsRef = useRef<Record<string, Position>>({});
  const dragRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const requestRef = useRef<number | null>(null);

  // Initialize random positions
  useEffect(() => {
    if (nodes.length === 0) return;
    const initial: Record<string, Position> = {};
    nodes.forEach(n => {
      if (!positionsRef.current[n.id]) {
        initial[n.id] = {
          x: width / 2 + (Math.random() - 0.5) * 200,
          y: height / 2 + (Math.random() - 0.5) * 200,
          vx: 0,
          vy: 0
        };
      } else {
        initial[n.id] = positionsRef.current[n.id];
      }
    });
    positionsRef.current = initial;
    setPositions({ ...initial });
  }, [nodes, width, height]);

  // Physics Loop
  useEffect(() => {
    if (nodes.length === 0) return;
    
    let isRunning = true;
    const tick = () => {
      if (!isRunning) return;
      const alpha = 0.1; // cooling factor
      const nextPos = { ...positionsRef.current };
      
      const kRepel = 2500; // Repulsion strength
      const kSpring = 0.05; // Edge pull strength
      const lSpring = 120; // Ideal edge length
      const kGravity = 0.005; // Center pull

      // 1. Repulsion (Coulomb)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i].id;
          const n2 = nodes[j].id;
          const p1 = nextPos[n1];
          const p2 = nextPos[n2];
          if (!p1 || !p2) continue;
          
          let dx = p1.x - p2.x;
          let dy = p1.y - p2.y;
          let distSq = dx*dx + dy*dy;
          if (distSq === 0) { dx = Math.random(); dy = Math.random(); distSq = dx*dx + dy*dy; }
          const dist = Math.sqrt(distSq);
          
          const force = kRepel / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          
          p1.vx += fx; p1.vy += fy;
          p2.vx -= fx; p2.vy -= fy;
        }
      }

      // 2. Springs (Edges)
      edges.forEach(e => {
        const p1 = nextPos[e.source_id];
        const p2 = nextPos[e.target_id];
        if (!p1 || !p2) return;
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        const force = (dist - lSpring) * kSpring;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        
        p1.vx += fx; p1.vy += fy;
        p2.vx -= fx; p2.vy -= fy;
      });

      // 3. Gravity (Center pull) & Update
      const cx = width / 2;
      const cy = height / 2;
      let moved = false;

      nodes.forEach(n => {
        const p = nextPos[n.id];
        if (!p) return;
        
        if (dragRef.current?.id === n.id) {
          p.x = dragRef.current.x;
          p.y = dragRef.current.y;
          p.vx = 0; p.vy = 0;
          moved = true;
          return;
        }

        // Gravity
        p.vx += (cx - p.x) * kGravity;
        p.vy += (cy - p.y) * kGravity;

        // Friction
        p.vx *= 0.85;
        p.vy *= 0.85;

        p.x += p.vx * alpha;
        p.y += p.vy * alpha;

        // Keep in bounds
        p.x = Math.max(20, Math.min(width - 20, p.x));
        p.y = Math.max(20, Math.min(height - 20, p.y));

        if (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1) moved = true;
      });

      if (moved) {
        positionsRef.current = nextPos;
        setPositions({ ...nextPos });
        requestRef.current = requestAnimationFrame(tick);
      } else {
        requestRef.current = requestAnimationFrame(tick); // sleep/idle wait for drag
      }
    };
    
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      isRunning = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [nodes, edges, width, height]);

  const onDragStart = useCallback((id: string, e: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    // Get SVG CTM for exact coords
    const svg = (e.target as SVGElement).ownerSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    dragRef.current = { id, x: svgP.x, y: svgP.y };
  }, []);

  const onDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragRef.current) return;
    let clientX, clientY;
    if ('touches' in e) {
      clientX = (e as TouchEvent).touches[0].clientX;
      clientY = (e as TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const svg = document.getElementById('kairo-graph-svg') as any as SVGSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    dragRef.current = { ...dragRef.current, x: svgP.x, y: svgP.y };
  }, []);

  const onDragEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('touchend', onDragEnd);
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', onDragEnd);
    };
  }, [onDrag, onDragEnd]);

  return { positions, onDragStart };
}


// --- MAIN COMPONENT ---
export const KnowledgeView = () => {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeEdge[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'note'>('graph');
  const [search, setSearch] = useState('');

  // Svg dimensions
  const SVG_W = 1000;
  const SVG_H = 800;
  
  const { positions, onDragStart } = useForceSimulation(nodes, edges, SVG_W, SVG_H);

  useEffect(() => {
    const load = async () => {
      try {
        const rawNodes = await lemmaService.getKnowledgeNodes();
        const rawEdges = await lemmaService.getKnowledgeEdges();
        setNodes(rawNodes);
        setEdges(rawEdges);
      } catch (err) {
        console.error('[KnowledgeView] Failed to load graph:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const nodeById = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);
  const edgesByNode = useMemo(() => {
    const map: Record<string, KnowledgeEdge[]> = {};
    edges.forEach(e => {
      if (!map[e.source_id]) map[e.source_id] = [];
      if (!map[e.target_id]) map[e.target_id] = [];
      map[e.source_id].push(e);
      map[e.target_id].push(e);
    });
    return map;
  }, [edges]);

  // Derived state
  const selectedNode = selectedNodeId ? nodeById[selectedNodeId] : null;
  const backlinks = selectedNode ? (edgesByNode[selectedNode.id] || []) : [];

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
    setViewMode('note');
  };

  // Group nodes for sidebar
  const filteredNodes = nodes.filter(n => n.label.toLowerCase().includes(search.toLowerCase()));
  const groupedNodes = useMemo(() => {
    const groups: Record<string, KnowledgeNode[]> = {};
    filteredNodes.forEach(n => {
      const k = n.kind || 'concept';
      if (!groups[k]) groups[k] = [];
      groups[k].push(n);
    });
    return groups;
  }, [filteredNodes]);

  return (
    <div className="h-full flex bg-[#f9f9fd] font-body overflow-hidden">
      
      {/* ── LEFT SIDEBAR (Obsidian Vault) ── */}
      <aside className="w-72 bg-white border-r border-gray-150 flex flex-col shadow-sm shrink-0">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-heading font-black text-lg text-text-primary flex items-center gap-2 mb-4">
            <FolderTree className="w-5 h-5 text-primary" />
            Knowledge Base
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-primary/20 outline-none font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {Object.entries(groupedNodes).map(([kind, groupNodes]) => (
            <div key={kind}>
              <h3 className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: KIND_COLOR[kind] || '#cbd5e1' }} />
                {kind}
              </h3>
              <ul className="space-y-0.5">
                {groupNodes.map(n => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleNodeClick(n.id)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold truncate transition-colors flex items-center gap-2",
                        selectedNodeId === n.id 
                          ? "bg-primary/10 text-primary" 
                          : "text-text-primary hover:bg-gray-50"
                      )}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 opacity-60" />
                      {n.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {filteredNodes.length === 0 && (
            <p className="text-xs text-text-secondary text-center py-8">No results found.</p>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header / View Toggle */}
        <header className="h-16 border-b border-gray-150 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {selectedNode && (
              <h1 className="font-bold text-text-primary text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                {selectedNode.label.length > 40 ? selectedNode.label.slice(0, 40) + '...' : selectedNode.label}
              </h1>
            )}
            {!selectedNode && (
              <span className="text-text-secondary text-sm font-medium">Select a note from the vault or graph.</span>
            )}
          </div>
          
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('note')}
              disabled={!selectedNode}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                viewMode === 'note' ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text-primary",
                !selectedNode && "opacity-50 cursor-not-allowed"
              )}
            >
              <FileText className="w-3.5 h-3.5" /> Note
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                viewMode === 'graph' ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Network className="w-3.5 h-3.5" /> Graph
            </button>
          </div>
        </header>

        {/* View Canvas */}
        <div className="flex-1 relative overflow-hidden bg-white">
          
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* GRAPH VIEW */}
              <div className={cn("absolute inset-0 transition-opacity duration-300", viewMode === 'graph' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none')}>
                <svg id="kairo-graph-svg" className="w-full h-full cursor-grab active:cursor-grabbing" viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <radialGradient id="bg-grad" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#F8FAFC" />
                    </radialGradient>
                  </defs>
                  <rect width={SVG_W} height={SVG_H} fill="url(#bg-grad)" />

                  {/* Edges */}
                  {edges.map(e => {
                    const src = positions[e.source_id];
                    const tgt = positions[e.target_id];
                    if (!src || !tgt) return null;
                    const isHovered = selectedNodeId === e.source_id || selectedNodeId === e.target_id;
                    return (
                      <g key={e.id}>
                        <line
                          x1={src.x} y1={src.y}
                          x2={tgt.x} y2={tgt.y}
                          stroke={isHovered ? "#94a3b8" : "#e2e8f0"} 
                          strokeWidth={isHovered ? 2 : 1.5}
                          strokeDasharray={isHovered ? "none" : "4 4"}
                          className="transition-colors duration-300"
                        />
                        {e.relation && (
                          <text
                            x={(src.x + tgt.x) / 2}
                            y={(src.y + tgt.y) / 2 - 5}
                            textAnchor="middle"
                            fontSize="9"
                            fill="#94A3B8"
                            className="select-none pointer-events-none"
                          >
                            {e.relation}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map(n => {
                    const pos = positions[n.id];
                    if (!pos) return null;
                    const color = KIND_COLOR[n.kind || 'concept'] || '#64748b';
                    const isSelected = selectedNodeId === n.id;
                    return (
                      <g
                        key={n.id}
                        className="cursor-pointer"
                        onMouseDown={(e) => {
                          setSelectedNodeId(n.id);
                          onDragStart(n.id, e);
                        }}
                        onTouchStart={(e) => {
                          setSelectedNodeId(n.id);
                          onDragStart(n.id, e);
                        }}
                      >
                        {/* Glow effect for selected */}
                        {isSelected && (
                          <circle cx={pos.x} cy={pos.y} r={28} fill={color} fillOpacity="0.15" className="animate-pulse" />
                        )}
                        <circle
                          cx={pos.x} cy={pos.y} r={isSelected ? 16 : 10}
                          fill={color}
                          stroke={isSelected ? '#1e293b' : 'white'}
                          strokeWidth={2}
                          className="transition-all duration-300 shadow-sm"
                        />
                        <text
                          x={pos.x} y={pos.y + (isSelected ? 26 : 20)}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight={isSelected ? '700' : '500'}
                          fill={isSelected ? '#0f172a' : '#475569'}
                          className="select-none pointer-events-none drop-shadow-sm"
                        >
                          {n.label.length > 20 ? n.label.slice(0, 18) + '…' : n.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                
                {/* Graph overlay controls/legend */}
                <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-gray-150 shadow-lg shadow-gray-200/50">
                  <h4 className="text-[10px] font-extrabold uppercase text-text-secondary tracking-widest mb-3">Graph Legend</h4>
                  <div className="space-y-2">
                    {Object.entries(KIND_COLOR).map(([kind, color]) => (
                      <div key={kind} className="flex items-center gap-2.5 text-xs font-semibold text-text-primary">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: color }} />
                        <span className="capitalize">{kind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* NOTE VIEW (Zettelkasten Style) */}
              {selectedNode && (
                <div className={cn("absolute inset-0 bg-white transition-opacity duration-300 overflow-y-auto", viewMode === 'note' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none')}>
                  <div className="max-w-3xl mx-auto py-12 px-8">
                    
                    {/* Breadcrumbs / Meta */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest"
                        style={{ backgroundColor: `${KIND_COLOR[selectedNode.kind || 'concept']}15`, color: KIND_COLOR[selectedNode.kind || 'concept'] }}>
                        <Tag className="w-3 h-3" />
                        {selectedNode.kind || 'Concept'}
                      </span>
                      <span className="text-xs text-text-secondary font-medium font-mono">ID: {selectedNode.id.split('-').pop()}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-heading font-black text-text-primary mb-8 leading-tight">
                      {selectedNode.label}
                    </h1>

                    {/* Simulated Document Content (Since Lemma nodes only have labels right now) */}
                    <div className="prose prose-sm md:prose-base prose-slate max-w-none mb-16">
                      <p className="text-text-secondary text-lg leading-relaxed">
                        This is a knowledge node extracted by KAIRO's intelligence pipeline. It represents a core entity, concept, or memory tracked in your workspace.
                      </p>
                      <hr className="my-8 border-gray-100" />
                      <h3 className="text-text-primary font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" /> AI Synthesis Context
                      </h3>
                      <p>
                        The data for <strong>{selectedNode.label}</strong> is actively maintained in the Lemma Pod datastore. Any workflows, missions, or tasks that mention this entity will automatically generate linked relations.
                      </p>
                    </div>

                    {/* BACKLINKS SECTION (Zettelkasten core feature) */}
                    <div className="bg-gray-50/50 rounded-3xl p-6 md:p-8 border border-gray-150 shadow-sm">
                      <h3 className="font-heading font-black text-lg text-text-primary mb-6 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-primary" />
                        Linked Mentions ({backlinks.length})
                      </h3>

                      {backlinks.length === 0 ? (
                        <p className="text-sm text-text-secondary italic">No direct connections found for this node yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {backlinks.map(e => {
                            const isTarget = e.target_id === selectedNode.id;
                            const otherNodeId = isTarget ? e.source_id : e.target_id;
                            const otherNode = nodeById[otherNodeId];
                            if (!otherNode) return null;
                            
                            return (
                              <div key={e.id} className="bg-white p-4 rounded-2xl border border-gray-150 hover:border-primary/30 transition-colors shadow-sm group">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[10px] font-extrabold uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                    {isTarget ? 'Referenced by' : 'Refers to'}
                                  </span>
                                  <span className="text-xs font-semibold text-primary/60 truncate">
                                    {e.relation || 'Related concept'}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => handleNodeClick(otherNode.id)}
                                  className="text-left font-bold text-text-primary hover:text-primary transition-colors text-sm flex items-center gap-2 group-hover:underline"
                                >
                                  <FileText className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                  {otherNode.label}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
