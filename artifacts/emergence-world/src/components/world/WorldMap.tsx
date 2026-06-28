import { useRef, useState, useCallback, useEffect } from "react";
import { useGetWorldState, useGetLandmarks, Agent, Landmark } from "@workspace/api-client-react";
import { useSimulationWebSocket } from "@/hooks/use-websocket";

const WORLD_SIZE = 240;
const HALF = WORLD_SIZE / 2;

const CATEGORY_LABELS: Record<string, string> = {
  commercial:   "komersial",
  municipal:    "pemerintahan",
  recreational: "rekreasi",
  residential:  "hunian",
  industrial:   "industri",
};

const CATEGORY_COLORS: Record<string, { fill: string; stroke: string }> = {
  commercial:   { fill: "#0d2233", stroke: "#1a4a6a" },
  municipal:    { fill: "#1a0d2e", stroke: "#4a1a7a" },
  recreational: { fill: "#0d2218", stroke: "#1a5a30" },
  residential:  { fill: "#1a1a1a", stroke: "#333333" },
  industrial:   { fill: "#2a1a0d", stroke: "#6a3a1a" },
};

const LANDMARK_HEIGHTS: Record<string, number> = {
  commercial:   6,
  municipal:    10,
  recreational: 4,
  residential:  5,
  industrial:   7,
};

function agentToSvg(pos: { x: number; z: number }, viewSize: number): { x: number; y: number } {
  const scale = viewSize / WORLD_SIZE;
  return {
    x: (pos.x + HALF) * scale,
    y: (pos.z + HALF) * scale,
  };
}

function landmarkToSvg(pos: { x: number; z: number }, size: number, viewSize: number) {
  const scale = viewSize / WORLD_SIZE;
  const w = size * scale;
  return {
    x: (pos.x + HALF) * scale - w / 2,
    y: (pos.z + HALF) * scale - w / 2,
    w,
  };
}

function AgentDot({
  agent,
  viewSize,
  selected,
  onClick,
}: {
  agent: Agent;
  viewSize: number;
  selected: boolean;
  onClick: () => void;
}) {
  const pos = agentToSvg(agent.position, viewSize);
  const r = selected ? 7 : 5;
  const isCurrent = agent.isCurrentTurn;

  return (
    <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {isCurrent && (
        <circle cx={pos.x} cy={pos.y} r={r + 8} fill="none" stroke={agent.color ?? "#00ffcc"} strokeWidth="1" opacity="0.4">
          <animate attributeName="r" values={`${r + 4};${r + 12};${r + 4}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={pos.x} cy={pos.y} r={r + 3} fill={agent.color ?? "#00ffcc"} opacity="0.15" />
      <circle
        cx={pos.x} cy={pos.y} r={r}
        fill={agent.color ?? "#00ffcc"}
        stroke={selected ? "#ffffff" : "transparent"}
        strokeWidth={selected ? 1.5 : 0}
        style={{ filter: `drop-shadow(0 0 4px ${agent.color ?? "#00ffcc"})`, transition: "all 0.4s ease" }}
      />
      <text
        x={pos.x} y={pos.y - r - 4}
        textAnchor="middle" fontSize="7" fontFamily="monospace"
        fill={agent.color ?? "#00ffcc"} opacity="0.9"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {agent.name.toUpperCase()}
      </text>
    </g>
  );
}

function LandmarkBlock({ landmark, viewSize }: { landmark: Landmark; viewSize: number }) {
  const cat = landmark.category ?? "commercial";
  const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.commercial;
  const h = LANDMARK_HEIGHTS[cat] ?? 6;
  const size = cat === "municipal" ? 12 : cat === "commercial" ? 9 : 7;
  const { x, y, w } = landmarkToSvg(landmark.position, size, viewSize);

  return (
    <g>
      <rect x={x} y={y} width={w} height={w} fill={colors.fill} stroke={colors.stroke} strokeWidth="0.5" rx="1" opacity="0.9" />
      {h > 6 && (
        <rect x={x + w * 0.2} y={y + w * 0.2} width={w * 0.6} height={w * 0.6} fill={colors.stroke} opacity="0.2" rx="0.5" />
      )}
    </g>
  );
}

function GridLines({ viewSize }: { viewSize: number }) {
  const cells = 20;
  const step = viewSize / cells;
  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= cells; i++) {
    const pos = i * step;
    lines.push(
      <line key={`h${i}`} x1={0} y1={pos} x2={viewSize} y2={pos} stroke="#111" strokeWidth="0.5" />,
      <line key={`v${i}`} x1={pos} y1={0} x2={pos} y2={viewSize} stroke="#111" strokeWidth="0.5" />
    );
  }
  return <g>{lines}</g>;
}

export function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState(600);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const { data: pollWorldState } = useGetWorldState({ query: { refetchInterval: 3000 } });
  const { data: landmarks } = useGetLandmarks();
  const { worldState: wsWorldState } = useSimulationWebSocket();
  const worldState = wsWorldState || pollWorldState;

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setViewSize(Math.min(width, height));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setTransform((t) => {
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(Math.max(t.scale * factor, 0.4), 5);
      return { ...t, scale: newScale };
    });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.mx;
    const dy = e.clientY - panStart.current.my;
    setTransform((t) => ({ ...t, x: panStart.current.tx + dx, y: panStart.current.ty + dy }));
  }, [isPanning]);

  const onMouseUp = useCallback(() => setIsPanning(false), []);

  const selectedAgent = worldState?.agents.find((a) => a.id === selectedAgentId) ?? null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#020205] relative overflow-hidden select-none"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={() => setSelectedAgentId(null)}
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "center center",
          transition: isPanning ? "none" : "transform 0.05s linear",
        }}
      >
        <svg width={viewSize} height={viewSize} viewBox={`0 0 ${viewSize} ${viewSize}`} style={{ display: "block" }}>
          <rect width={viewSize} height={viewSize} fill="#030308" />
          <GridLines viewSize={viewSize} />
          <rect x={1} y={1} width={viewSize - 2} height={viewSize - 2} fill="none" stroke="#00ffcc" strokeWidth="0.5" opacity="0.2" />

          <text x={viewSize / 2} y={12} textAnchor="middle" fontSize="8" fill="#00ffcc" opacity="0.3" fontFamily="monospace">U</text>
          <text x={viewSize / 2} y={viewSize - 4} textAnchor="middle" fontSize="8" fill="#00ffcc" opacity="0.3" fontFamily="monospace">S</text>
          <text x={8} y={viewSize / 2 + 3} textAnchor="middle" fontSize="8" fill="#00ffcc" opacity="0.3" fontFamily="monospace">B</text>
          <text x={viewSize - 8} y={viewSize / 2 + 3} textAnchor="middle" fontSize="8" fill="#00ffcc" opacity="0.3" fontFamily="monospace">T</text>

          {landmarks?.map((l) => (
            <LandmarkBlock key={l.id} landmark={l} viewSize={viewSize} />
          ))}

          {worldState?.agents.map((agent) => (
            <AgentDot
              key={agent.id}
              agent={agent}
              viewSize={viewSize}
              selected={selectedAgentId === agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
            />
          ))}
        </svg>
      </div>

      {selectedAgent && (
        <div
          className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border rounded-lg p-3 text-xs font-mono text-white max-w-[220px]"
          style={{ borderColor: selectedAgent.color ?? "#00ffcc" }}
        >
          <div className="font-bold mb-1" style={{ color: selectedAgent.color ?? "#00ffcc" }}>
            {selectedAgent.name} — {selectedAgent.role}
          </div>
          <div className="text-white/60">
            <span className="text-white/40">LOK </span>{selectedAgent.location}
          </div>
          {selectedAgent.lastSpeech && (
            <div className="mt-2 text-white/70 italic border-t border-white/10 pt-2">
              "{selectedAgent.lastSpeech}"
            </div>
          )}
          <div className="mt-2 flex gap-3">
            <div><span className="text-white/40">ENR </span><span className="text-green-400">{Math.round(selectedAgent.energy)}%</span></div>
            <div><span className="text-white/40">KR </span><span className="text-yellow-400">{selectedAgent.credits}</span></div>
            <div><span className="text-white/40">MOOD </span><span>{selectedAgent.mood}</span></div>
          </div>
        </div>
      )}

      <div className="absolute top-2 right-2 flex flex-col gap-1 text-[9px] font-mono opacity-60">
        {Object.entries(CATEGORY_COLORS).map(([cat, c]) => (
          <div key={cat} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: c.stroke }} />
            <span className="text-white/50 uppercase">{CATEGORY_LABELS[cat] ?? cat}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/20">
        scroll untuk zoom · geser untuk navigasi · klik agen untuk inspeksi
      </div>
    </div>
  );
}
