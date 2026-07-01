import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { BookOpen, Loader2, Network, FileText, Search, Tag, Link as LinkIcon, FolderTree, ArrowRight, MousePointerClick, ChevronRight, Plus, Save, X } from 'lucide-react';
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

  useEffect(() => {
    if (nodes.length === 0) return;
    const initial: Record<string, Position> = {};
    nodes.forEach(n => {
      if (!positionsRef.current[n.id]) {
        initial[n.id] = {
          x: width / 2 + (Math.random() - 0.5) * 300,
          y: height / 2 + (Math.random() - 0.5) * 300,
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

  useEffect(() => {
    if (nodes.length === 0) return;
    
    let isRunning = true;
    const tick = () => {
      if (!isRunning) return;
      const alpha = 0.1; 
      const nextPos = { ...positionsRef.current };
      
      const kRepel = 3000; 
      const kSpring = 0.06; 
      const lSpring = 140; 
      const kGravity = 0.008; 

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

        p.vx += (cx - p.x) * kGravity;
        p.vy += (cy - p.y) * kGravity;

        p.vx *= 0.85;
        p.vy *= 0.85;

        p.x += p.vx * alpha;
        p.y += p.vy * alpha;

        p.x = Math.max(20, Math.min(width - 20, p.x));
        p.y = Math.max(20, Math.min(height - 20, p.y));

        if (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1) moved = true;
      });

      if (moved) {
        positionsRef.current = nextPos;
        setPositions({ ...nextPos });
        requestRef.current = requestAnimationFrame(tick);
      } else {
        requestRef.current = requestAnimationFrame(tick);
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
  const [viewMode, setViewMode] = useState<'graph' | 'note' | 'create'>('graph');
  const [search, setSearch] = useState('');
  
  // Notepad state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const SVG_W = 1200;
  const SVG_H = 900;
  
  const { positions, onDragStart } = useForceSimulation(nodes, edges, SVG_W, SVG_H);

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

  useEffect(() => {
    load();
  }, []);

  const handleSaveNote = async () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;
    setIsSaving(true);
    try {
      const fullContent = `${noteTitle.trim()}\n\n${noteContent.trim()}`;
      await lemmaService.saveMemory(fullContent, ['note', 'manual']);
      setNoteTitle('');
      setNoteContent('');
      setViewMode('graph');
      // Reload graph to see if backend extracted it quickly (it might take time via pipeline)
      load(); 
    } catch (e) {
      console.error('Failed to save note', e);
    } finally {
      setIsSaving(false);
    }
  };

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

  const selectedNode = selectedNodeId ? nodeById[selectedNodeId] : null;
  const backlinks = selectedNode ? (edgesByNode[selectedNode.id] || []) : [];

  const neighbors = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const set = new Set<string>();
    set.add(selectedNodeId);
    (edgesByNode[selectedNodeId] || []).forEach(e => {
      set.add(e.source_id);
      set.add(e.target_id);
    });
    return set;
  }, [selectedNodeId, edgesByNode]);

  const handleSidebarClick = (id: string) => {
    setSelectedNodeId(id);
    setViewMode('note');
  };

  const handleGraphNodeClick = (id: string) => {
    if (selectedNodeId === id) {
      setViewMode('note');
    } else {
      setSelectedNodeId(id);
    }
  };

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
    <div className="h-full flex bg-[#fbfbfe] font-body overflow-hidden">
      
      {/* ── LEFT SIDEBAR (Vault) ── */}
      <aside className="w-[280px] bg-white border-r border-gray-150 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0 z-20">
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-xl text-text-primary flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderTree className="w-4 h-4 text-primary" />
              </div>
              Vault
            </h2>
            <button 
              onClick={() => { setSelectedNodeId(null); setViewMode('create'); }}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-primary transition-colors"
              title="New Note"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => { setSelectedNodeId(null); setViewMode('create'); }}
            className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Create Quick Note
          </button>

          <div className="relative group">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search vault..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-2 focus:ring-primary/20 outline-none font-semibold transition-all hover:border-gray-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {Object.entries(groupedNodes).map(([kind, groupNodes]) => (
            <div key={kind}>
              <h3 className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: KIND_COLOR[kind] || '#cbd5e1' }} />
                {kind}
                <span className="ml-auto text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-md">{groupNodes.length}</span>
              </h3>
              <ul className="space-y-0.5">
                {groupNodes.map(n => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleSidebarClick(n.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-bold truncate transition-all flex items-center gap-2.5 group",
                        selectedNodeId === n.id 
                          ? "bg-primary text-white shadow-md shadow-primary/20" 
                          : "text-text-primary hover:bg-gray-50"
                      )}
                    >
                      <FileText className={cn("w-3.5 h-3.5 shrink-0", selectedNodeId === n.id ? "text-white/80" : "text-gray-400 group-hover:text-primary")} />
                      <span className="truncate">{n.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {filteredNodes.length === 0 && (
            <div className="text-center py-10 opacity-50">
              <Search className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs font-semibold">No notes found.</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Header / View Toggle */}
        <header className="h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 border-b border-gray-150 z-20">
          <div className="flex items-center gap-3">
            {viewMode === 'create' ? (
              <span className="text-primary text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4" /> Drafting New Note
              </span>
            ) : selectedNode ? (
              <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                <span className="w-2 h-2 rounded-full" style={{ background: KIND_COLOR[selectedNode.kind || 'concept'] }} />
                {selectedNode.label.length > 50 ? selectedNode.label.slice(0, 50) + '...' : selectedNode.label}
              </div>
            ) : (
              <span className="text-text-secondary text-sm font-semibold flex items-center gap-2">
                <MousePointerClick className="w-4 h-4" /> Select a node to explore
              </span>
            )}
          </div>
          
          <div className="flex items-center bg-gray-100/80 p-1.5 rounded-xl border border-gray-200/50">
            {viewMode === 'create' && (
              <button
                onClick={() => setViewMode('graph')}
                className="px-3 py-1.5 text-xs font-extrabold rounded-lg text-gray-500 hover:text-text-primary flex items-center gap-1.5 mr-2"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => { if (selectedNode) setViewMode('note'); }}
              disabled={!selectedNode && viewMode !== 'create'}
              className={cn(
                "px-5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-2",
                (viewMode === 'note' || viewMode === 'create') ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text-primary",
                !selectedNode && viewMode !== 'create' && "opacity-40 cursor-not-allowed"
              )}
            >
              <FileText className="w-3.5 h-3.5" /> Document View
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={cn(
                "px-5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-2",
                viewMode === 'graph' ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Network className="w-3.5 h-3.5" /> Graph View
            </button>
          </div>
        </header>

        {/* View Canvas */}
        <div className="flex-1 relative overflow-hidden bg-white">
          
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs font-bold text-text-secondary tracking-widest uppercase">Initializing Physics...</span>
              </div>
            </div>
          ) : (
            <>
              {/* GRAPH VIEW */}
              <div className={cn("absolute inset-0 transition-opacity duration-500", viewMode === 'graph' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none')}>
                <svg 
                  id="kairo-graph-svg" 
                  className="w-full h-full cursor-grab active:cursor-grabbing" 
                  viewBox={`0 0 ${SVG_W} ${SVG_H}`} 
                  preserveAspectRatio="xMidYMid meet"
                  onClick={(e) => {
                    if ((e.target as any).tagName === 'svg' || (e.target as any).tagName === 'rect') {
                      setSelectedNodeId(null);
                    }
                  }}
                >
                  <defs>
                    <radialGradient id="bg-grad" cx="50%" cy="50%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f1f5f9" />
                    </radialGradient>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#cbd5e1" fillOpacity="0.4" />
                    </pattern>
                  </defs>
                  <rect width={SVG_W} height={SVG_H} fill="url(#bg-grad)" />
                  <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

                  {edges.map(e => {
                    const src = positions[e.source_id];
                    const tgt = positions[e.target_id];
                    if (!src || !tgt) return null;
                    
                    const isFading = selectedNodeId && !(selectedNodeId === e.source_id || selectedNodeId === e.target_id);
                    const isHighlighted = selectedNodeId && (selectedNodeId === e.source_id || selectedNodeId === e.target_id);
                    
                    return (
                      <g key={e.id}>
                        <line
                          x1={src.x} y1={src.y}
                          x2={tgt.x} y2={tgt.y}
                          stroke={isHighlighted ? "#94a3b8" : "#e2e8f0"} 
                          strokeWidth={isHighlighted ? 2 : 1.5}
                          strokeDasharray={isHighlighted ? "none" : "4 4"}
                          className="transition-all duration-300"
                          opacity={isFading ? 0.1 : 1}
                        />
                        {e.relation && !isFading && (
                          <text
                            x={(src.x + tgt.x) / 2}
                            y={(src.y + tgt.y) / 2 - 5}
                            textAnchor="middle"
                            fontSize="9"
                            fill="#94A3B8"
                            className="select-none pointer-events-none font-medium"
                          >
                            {e.relation}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {nodes.map(n => {
                    const pos = positions[n.id];
                    if (!pos) return null;
                    const color = KIND_COLOR[n.kind || 'concept'] || '#64748b';
                    
                    const isSelected = selectedNodeId === n.id;
                    const isNeighbor = neighbors.has(n.id);
                    const isFading = selectedNodeId && !isNeighbor;
                    
                    return (
                      <g
                        key={n.id}
                        className="cursor-pointer"
                        onMouseDown={(e) => {
                          handleGraphNodeClick(n.id);
                          onDragStart(n.id, e);
                          e.stopPropagation();
                        }}
                        onTouchStart={(e) => {
                          handleGraphNodeClick(n.id);
                          onDragStart(n.id, e);
                          e.stopPropagation();
                        }}
                        opacity={isFading ? 0.2 : 1}
                        style={{ transition: 'opacity 0.3s' }}
                      >
                        {isSelected && (
                          <circle cx={pos.x} cy={pos.y} r={32} fill={color} fillOpacity="0.1" className="animate-pulse" />
                        )}
                        <circle
                          cx={pos.x} cy={pos.y} r={isSelected ? 16 : 10}
                          fill={color}
                          stroke={isSelected ? '#0f172a' : 'white'}
                          strokeWidth={isSelected ? 3 : 2}
                          className="transition-all duration-300"
                          style={{ filter: isSelected ? `drop-shadow(0 0 12px ${color}80)` : 'none' }}
                        />
                        <text
                          x={pos.x} y={pos.y + (isSelected ? 28 : 20)}
                          textAnchor="middle"
                          fontSize={isSelected ? "13" : "11"}
                          fontWeight={isSelected ? '800' : '600'}
                          fill={isSelected ? '#0f172a' : '#475569'}
                          className="select-none pointer-events-none drop-shadow-sm transition-all duration-300"
                        >
                          {n.label.length > 25 ? n.label.slice(0, 23) + '…' : n.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {selectedNode && (
                  <div className="absolute top-6 left-6 w-80 bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-6 shadow-2xl animate-fade-in pointer-events-auto">
                    <button onClick={() => setSelectedNodeId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: KIND_COLOR[selectedNode.kind || 'concept'] }} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{selectedNode.kind || 'Concept'}</span>
                    </div>
                    <h3 className="font-heading font-black text-xl text-text-primary leading-tight mb-2">
                      {selectedNode.label}
                    </h3>
                    <p className="text-xs font-medium text-text-secondary mb-5">
                      {backlinks.length} connected mentions found.
                    </p>
                    <button
                      onClick={() => setViewMode('note')}
                      className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      Open Document <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-gray-200/50 shadow-xl pointer-events-none">
                  <h4 className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-3">Graph Legend</h4>
                  <div className="space-y-2">
                    {Object.entries(KIND_COLOR).map(([kind, color]) => (
                      <div key={kind} className="flex items-center gap-2.5 text-xs font-bold text-text-primary">
                        <span className="w-3 h-3 rounded-full shadow-inner" style={{ background: color }} />
                        <span className="capitalize">{kind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* NOTE VIEW (Premium Zettelkasten Document) */}
              {selectedNode && viewMode === 'note' && (
                <div className="absolute inset-0 bg-[#fafafa] overflow-y-auto z-10 animate-fade-in">
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
                  
                  <div className="max-w-5xl mx-auto py-12 px-8 relative flex gap-12 items-start flex-col lg:flex-row">
                    
                    <div className="flex-1 bg-white rounded-[2rem] p-10 md:p-14 shadow-xl border border-gray-150">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                          style={{ backgroundColor: `${KIND_COLOR[selectedNode.kind || 'concept']}10`, color: KIND_COLOR[selectedNode.kind || 'concept'], borderColor: `${KIND_COLOR[selectedNode.kind || 'concept']}30` }}>
                          <Tag className="w-3 h-3" />
                          {selectedNode.kind || 'Concept'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold font-mono bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">ID: {selectedNode.id.split('-').pop()}</span>
                      </div>

                      <h1 className="text-4xl md:text-5xl font-heading font-black text-text-primary mb-8 leading-tight tracking-tight">
                        {selectedNode.label}
                      </h1>

                      <div className="prose prose-sm md:prose-base prose-slate max-w-none mb-12">
                        <p className="text-text-secondary text-lg leading-relaxed font-medium">
                          This is a core knowledge entity tracked in your workspace. KAIRO's intelligence pipeline automatically maps relationships whenever this concept appears in your tasks, memories, or chats.
                        </p>
                        
                        <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100">
                          <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-2 text-sm uppercase tracking-widest">
                            <BookOpen className="w-4 h-4" /> System Context
                          </h3>
                          <p className="text-indigo-800/80 text-sm">
                            The data for <strong>{selectedNode.label}</strong> is actively maintained. Navigate to the Graph View to see a visual representation of its surrounding cluster.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-80 shrink-0 space-y-6 sticky top-8">
                      <h3 className="font-heading font-black text-lg text-text-primary flex items-center gap-2 border-b border-gray-200 pb-3">
                        <LinkIcon className="w-5 h-5 text-primary" />
                        Linked Mentions
                        <span className="ml-auto bg-gray-100 text-text-secondary text-xs px-2 py-0.5 rounded-full">{backlinks.length}</span>
                      </h3>

                      {backlinks.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                          <Network className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-text-secondary font-medium">No connections mapped yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {backlinks.map(e => {
                            const isTarget = e.target_id === selectedNode.id;
                            const otherNodeId = isTarget ? e.source_id : e.target_id;
                            const otherNode = nodeById[otherNodeId];
                            if (!otherNode) return null;
                            
                            return (
                              <button 
                                key={e.id}
                                onClick={() => handleSidebarClick(otherNode.id)}
                                className="w-full text-left bg-white p-4 rounded-2xl border border-gray-150 hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden"
                              >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 group-hover:bg-primary transition-colors" />
                                
                                <div className="flex items-center gap-2 mb-2 pl-2">
                                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                                    {isTarget ? 'Referenced by' : 'Refers to'}
                                  </span>
                                  {e.relation && (
                                    <span className="text-[9px] font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-md truncate">
                                      {e.relation}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="pl-2 font-bold text-text-primary group-hover:text-primary transition-colors text-sm flex items-center justify-between">
                                  <span className="truncate pr-2">{otherNode.label}</span>
                                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-1" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
              )}

              {/* CREATE NOTE VIEW (Notepad) */}
              {viewMode === 'create' && (
                <div className="absolute inset-0 bg-[#fafafa] overflow-y-auto z-10 animate-fade-in">
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
                  
                  <div className="max-w-3xl mx-auto py-12 px-8 relative">
                    <div className="bg-white rounded-[2rem] p-10 md:p-12 shadow-2xl border border-gray-150 relative">
                      
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h2 className="font-heading font-black text-xl text-text-primary">Draft New Note</h2>
                            <p className="text-xs font-semibold text-text-secondary">It will be analyzed by KAIRO and mapped into the Knowledge Graph.</p>
                          </div>
                        </div>
                        <button
                          onClick={handleSaveNote}
                          disabled={isSaving || (!noteTitle && !noteContent)}
                          className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Note
                        </button>
                      </div>

                      <div className="space-y-6">
                        <input
                          type="text"
                          placeholder="Note Title"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          className="w-full bg-transparent border-b border-gray-200 pb-3 text-3xl font-heading font-black text-text-primary placeholder:text-gray-300 focus:border-primary outline-none transition-colors"
                        />
                        <textarea
                          placeholder="Start typing your ideas, research, or thoughts..."
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          className="w-full h-[400px] bg-transparent border-none text-base text-text-primary placeholder:text-gray-400 outline-none resize-none leading-relaxed"
                        />
                      </div>
                      
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
