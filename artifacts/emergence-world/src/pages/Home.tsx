import { WorldMap } from "@/components/world/WorldMap";
import { useSimulationWebSocket } from "@/hooks/use-websocket";
import { useGetWorldState, useGetRecentActivity } from "@workspace/api-client-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Terminal } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const { data: initialWorldState } = useGetWorldState();
  const { data: initialActivity } = useGetRecentActivity({ limit: 20 });
  const { worldState: wsWorldState, activities: wsActivities, isConnected } = useSimulationWebSocket();

  const worldState = wsWorldState || initialWorldState;
  const activities = wsActivities.length > 0 ? wsActivities : (initialActivity || []);

  const activeAgent = worldState?.agents.find(a => a.isCurrentTurn);

  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      <div className="flex-1 relative flex flex-col min-h-[50vh]">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
          <span className="text-xs font-mono font-medium text-white/80">
            {isConnected ? 'SIARAN LANGSUNG AKTIF' : 'KONEKSI TERPUTUS'}
          </span>
        </div>
        
        <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-white/10 font-mono text-xs text-white/80 flex flex-col gap-1">
          <div className="flex justify-between gap-4">
            <span className="text-white/50">WAKTU:</span>
            <span>{worldState?.worldTime || '00:00'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/50">CUACA:</span>
            <span>{worldState?.weather.condition.toUpperCase() || 'TIDAK DIKETAHUI'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/50">SUHU:</span>
            <span>{worldState?.weather.temperature != null ? Math.round(worldState.weather.temperature) : '—'}°C</span>
          </div>
        </div>

        <div className="flex-1">
          <WorldMap />
        </div>

        <div className="h-48 border-t border-border bg-card/80 backdrop-blur-md flex flex-col">
          <div className="px-4 py-2 border-b border-border flex items-center gap-2">
            <Terminal size={14} className="text-primary" />
            <span className="text-xs font-mono font-semibold text-primary">LOG SISTEM</span>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-2">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs font-mono">
                  <span className="text-muted-foreground w-16 shrink-0">
                    {format(new Date(act.timestamp), 'HH:mm:ss')}
                  </span>
                  <span className="text-accent w-24 shrink-0 font-bold truncate">
                    [{act.agentName}]
                  </span>
                  <span className="text-foreground/80 flex-1">
                    {act.description}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1 w-32 shrink-0 justify-end truncate">
                    <MapPin size={10} />
                    {act.location}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="w-full lg:w-80 border-l border-border bg-card flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-bold flex items-center gap-2 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            FOKUS SAAT INI
          </h2>
        </div>
        
        {activeAgent ? (
          <div className="p-4 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <img 
                src={`https://storage.googleapis.com/agent-world/portraits/${activeAgent.name}.png`} 
                alt={activeAgent.name}
                className="w-16 h-16 rounded-md object-cover border border-primary bg-muted"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <h3 className="text-xl font-bold font-mono" style={{ color: activeAgent.color }}>
                  {activeAgent.name}
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{activeAgent.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-mono mb-1 block">LOKASI</label>
                <div className="text-sm bg-muted/50 p-2 rounded border border-border/50 flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  {activeAgent.location}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-mono mb-1 block">AKSI TERAKHIR</label>
                <div className="text-sm bg-muted/50 p-3 rounded border border-border/50 font-mono text-primary-foreground/90">
                  {activeAgent.lastAction || "Diam"}
                </div>
              </div>

              {activeAgent.lastSpeech && (
                <div>
                  <label className="text-xs text-muted-foreground font-mono mb-1 block">UCAPAN</label>
                  <div className="text-sm bg-primary/10 p-3 rounded border border-primary/20 text-primary italic">
                    "{activeAgent.lastSpeech}"
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/30 p-2 rounded">
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Energi</label>
                  <div className="w-full bg-black rounded-full h-1.5 mb-1 overflow-hidden">
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
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center flex-1 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <p>Menunggu aktivasi agen...</p>
          </div>
        )}
      </div>
    </div>
  );
}
