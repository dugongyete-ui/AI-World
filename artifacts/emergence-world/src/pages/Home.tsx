import { WorldMap } from "@/components/world/WorldMap";
import { useSimulationWebSocket } from "@/hooks/use-websocket";
import { useGetWorldState, useGetRecentActivity } from "@workspace/api-client-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function Home() {
  const { data: initialWorldState } = useGetWorldState();
  const { data: initialActivity } = useGetRecentActivity({ limit: 20 });
  const { worldState: wsWorldState, activities: wsActivities, isConnected } = useSimulationWebSocket();
  const [logOpen, setLogOpen] = useState(false);

  const worldState = wsWorldState || initialWorldState;
  const activities = wsActivities.length > 0 ? wsActivities : (initialActivity || []);

  const activeAgent = worldState?.agents.find(a => a.isCurrentTurn);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Desktop: side-by-side | Mobile: stacked */}
      <div className="flex flex-1 flex-col lg:flex-row min-h-0">

        {/* Left: Map + Log */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Map */}
          <div className="relative flex-1 min-h-[220px]">
            {/* Status badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
              <span className="text-[10px] font-mono font-medium text-white/80 hidden sm:inline">
                {isConnected ? 'SIARAN LANGSUNG AKTIF' : 'KONEKSI TERPUTUS'}
              </span>
              <span className="text-[10px] font-mono font-medium text-white/80 sm:hidden">
                {isConnected ? 'LANGSUNG' : 'TERPUTUS'}
              </span>
            </div>

            {/* Weather HUD */}
            <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 font-mono text-[10px] text-white/80 flex flex-col gap-0.5">
              <div className="flex justify-between gap-3">
                <span className="text-white/40">CUACA</span>
                <span>{worldState?.weather.condition.toUpperCase() || '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-white/40">SUHU</span>
                <span>{worldState?.weather.temperature != null ? Math.round(worldState.weather.temperature) : '—'}°C</span>
              </div>
            </div>

            <WorldMap />
          </div>

          {/* System log — collapsible on mobile */}
          <div className="border-t border-border bg-card/90 shrink-0">
            <button
              className="w-full px-4 py-2 flex items-center gap-2 lg:cursor-default"
              onClick={() => setLogOpen(o => !o)}
            >
              <Terminal size={13} className="text-primary" />
              <span className="text-xs font-mono font-semibold text-primary flex-1 text-left">LOG SISTEM</span>
              <span className="lg:hidden text-muted-foreground">
                {logOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </span>
            </button>

            <div className={`${logOpen ? 'h-36' : 'h-0 lg:h-36'} overflow-hidden transition-all duration-200`}>
              <ScrollArea className="h-full px-4 pb-3">
                <div className="flex flex-col gap-1.5">
                  {activities.length === 0 && (
                    <span className="text-[11px] font-mono text-muted-foreground">Belum ada aktivitas...</span>
                  )}
                  {activities.map((act) => (
                    <div key={act.id} className="flex gap-2 text-[11px] font-mono">
                      <span className="text-muted-foreground shrink-0">
                        {format(new Date(act.timestamp), 'HH:mm:ss')}
                      </span>
                      <span className="text-accent shrink-0 font-bold truncate max-w-[80px]">
                        [{act.agentName}]
                      </span>
                      <span className="text-foreground/80 flex-1 truncate">
                        {act.description}
                      </span>
                      <span className="text-muted-foreground hidden sm:flex items-center gap-1 shrink-0">
                        <MapPin size={9} />
                        <span className="truncate max-w-[90px]">{act.location}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Right: Active Agent */}
        <div className="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card shrink-0 lg:flex lg:flex-col lg:overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <h2 className="text-xs font-bold flex items-center gap-2 text-primary font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              FOKUS SAAT INI
            </h2>
          </div>

          {activeAgent ? (
            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              {/* Agent header */}
              <div className="flex items-center gap-3">
                <img
                  src={`https://storage.googleapis.com/agent-world/portraits/${activeAgent.name}.png`}
                  alt={activeAgent.name}
                  className="w-14 h-14 rounded-md object-cover border border-primary bg-muted shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="min-w-0">
                  <h3 className="text-lg font-bold font-mono truncate" style={{ color: activeAgent.color }}>
                    {activeAgent.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{activeAgent.role}</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/30 p-2 rounded col-span-2">
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1 flex items-center gap-1">
                    <MapPin size={9} /> Lokasi
                  </label>
                  <div className="text-xs font-mono truncate">{activeAgent.location}</div>
                </div>
                <div className="bg-muted/30 p-2 rounded">
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Energi</label>
                  <div className="w-full bg-black rounded-full h-1 mb-1 overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: `${activeAgent.energy}%` }} />
                  </div>
                  <div className="text-xs font-mono text-right">{Math.round(activeAgent.energy)}%</div>
                </div>
                <div className="bg-muted/30 p-2 rounded">
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Kredit</label>
                  <div className="text-sm font-mono font-bold text-yellow-500">
                    {activeAgent.credits.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Last action */}
              <div>
                <label className="text-[10px] text-muted-foreground font-mono mb-1 block uppercase">Aksi Terakhir</label>
                <div className="text-xs bg-muted/50 p-2.5 rounded border border-border/50 font-mono text-foreground/90 leading-relaxed">
                  {activeAgent.lastAction || "Diam"}
                </div>
              </div>

              {/* Speech */}
              {activeAgent.lastSpeech && (
                <div>
                  <label className="text-[10px] text-muted-foreground font-mono mb-1 block uppercase">Ucapan</label>
                  <div className="text-xs bg-primary/10 p-2.5 rounded border border-primary/20 text-primary italic leading-relaxed">
                    "{activeAgent.lastSpeech}"
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-xs flex flex-col items-center justify-center flex-1 opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <p className="font-mono">Menunggu aktivasi agen...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
