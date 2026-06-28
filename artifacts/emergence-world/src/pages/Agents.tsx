import { useGetAgents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Battery, MapPin, Coins } from "lucide-react";

export default function Agents() {
  const { data: agents, isLoading } = useGetAgents();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Initializing agent data stream...</div>;
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-mono text-primary tracking-tight">AGENT ROSTER</h1>
        <p className="text-muted-foreground mt-1">Live profiles of the 10 autonomous entities.</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8">
          {agents?.map((agent) => (
            <Card key={agent.id} className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors group overflow-hidden relative">
              {agent.isCurrentTurn && (
                <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
              )}
              <CardHeader className="p-4 pb-2 flex flex-row items-start gap-4">
                <div className="w-16 h-16 rounded-md bg-muted shrink-0 border border-border overflow-hidden">
                  <img 
                    src={`https://storage.googleapis.com/agent-world/portraits/${agent.name}.png`} 
                    alt={agent.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <CardTitle className="font-mono text-lg flex items-center justify-between" style={{ color: agent.color }}>
                    {agent.name}
                    {agent.isCurrentTurn && <Badge variant="default" className="text-[10px] px-1 py-0 h-4">ACTIVE</Badge>}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider truncate">{agent.role}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-black/20 p-1.5 rounded">
                      <Battery size={12} className={agent.energy > 50 ? "text-green-500" : "text-destructive"} />
                      {Math.round(agent.energy)}%
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-black/20 p-1.5 rounded">
                      <Coins size={12} className="text-yellow-500" />
                      {agent.credits.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-black/20 p-1.5 rounded col-span-2">
                      <MapPin size={12} className="text-primary shrink-0" />
                      <span className="truncate">{agent.location}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <div className="text-[10px] uppercase text-muted-foreground mb-1 flex items-center gap-1">
                      <Brain size={10} />
                      Current State
                    </div>
                    <div className="text-xs font-mono text-foreground/80 truncate">
                      Mood: <span className="text-accent">{agent.mood}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {agent.lastAction || "Idle"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
