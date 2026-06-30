import { useEffect, useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { lemmaService } from '@/services/LemmaService';

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

// Very lightweight force-simulation-free layout: just arrange nodes in a circle
function circleLayout(nodes: KnowledgeNode[], cx = 400, cy = 300, r = 220) {
  return nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    return { ...n, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

const KIND_COLOR: Record<string, string> = {
  mission: '#64C9B0',
  task: '#818CF8',
  memory: '#F59E0B',
  concept: '#EC4899',
  person: '#3B82F6',
};

export const KnowledgeView = () => {
  const [nodes, setNodes] = useState<(KnowledgeNode & { x: number; y: number })[]>([]);
  const [edges, setEdges] = useState<KnowledgeEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<(KnowledgeNode & { x: number; y: number }) | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const rawNodes = await lemmaService.getKnowledgeNodes();
        const rawEdges = await lemmaService.getKnowledgeEdges();
        setNodes(circleLayout(rawNodes));
        setEdges(rawEdges);
      } catch (err) {
        console.error('[KnowledgeView] Failed to load graph:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <div className="p-8 h-full flex flex-col font-body">
      <header className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Knowledge Graph
        </h1>
        <p className="text-text-secondary mt-1">Visual map of everything KAIRO knows about your world.</p>
      </header>

      <div className="flex-1 bg-surface border border-gray-100 rounded-2xl shadow-sm overflow-hidden relative flex min-h-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary">
            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-semibold">Knowledge graph is empty.</p>
            <p className="text-sm mt-1">Process messages in Smart Inbox to build your knowledge graph.</p>
          </div>
        ) : (
          <>
            <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="bg-grad" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#F7FAFA" />
                  <stop offset="100%" stopColor="#EDF8F6" />
                </radialGradient>
              </defs>
              <rect width="800" height="600" fill="url(#bg-grad)" />

              {/* Edges */}
              {edges.map(e => {
                const src = nodeById[e.source_id];
                const tgt = nodeById[e.target_id];
                if (!src || !tgt) return null;
                return (
                  <g key={e.id}>
                    <line
                      x1={src.x} y1={src.y}
                      x2={tgt.x} y2={tgt.y}
                      stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 4"
                    />
                    {e.relation && (
                      <text
                        x={(src.x + tgt.x) / 2}
                        y={(src.y + tgt.y) / 2 - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#94A3B8"
                        className="select-none"
                      >
                        {e.relation}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(n => {
                const color = KIND_COLOR[n.kind || 'concept'] || '#64C9B0';
                const isSelected = selected?.id === n.id;
                return (
                  <g
                    key={n.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(isSelected ? null : n)}
                  >
                    <circle
                      cx={n.x} cy={n.y} r={isSelected ? 22 : 16}
                      fill={color}
                      fillOpacity={isSelected ? 1 : 0.85}
                      stroke={isSelected ? '#1E293B' : 'white'}
                      strokeWidth={isSelected ? 2.5 : 2}
                      style={{ transition: 'all 0.2s' }}
                    />
                    <text
                      x={n.x} y={n.y + 32}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight={isSelected ? '600' : '400'}
                      fill="#334155"
                      className="select-none"
                    >
                      {n.label.length > 16 ? n.label.slice(0, 14) + '…' : n.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-xl p-3 border border-gray-100 shadow-sm space-y-1.5">
              {Object.entries(KIND_COLOR).map(([kind, color]) => (
                <div key={kind} className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
                  <span className="capitalize">{kind}</span>
                </div>
              ))}
            </div>

            {/* Selected node info */}
            {selected && (
              <div className="absolute top-4 right-4 bg-white border border-gray-100 rounded-xl p-4 shadow-md w-52">
                <p className="text-xs font-semibold text-text-secondary uppercase mb-1">Selected Node</p>
                <p className="font-semibold text-text-primary text-sm">{selected.label}</p>
                {selected.kind && (
                  <span className="inline-block mt-2 text-xs bg-secondary text-primary px-2 py-0.5 rounded-full capitalize">{selected.kind}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
