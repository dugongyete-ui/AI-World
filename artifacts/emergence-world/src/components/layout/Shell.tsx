import { Link, useLocation } from "wouter";
import { Activity, Globe, Users, Coins, Book, BarChart2, Radio } from "lucide-react";
import { useGetSimulationStatus, useStartSimulation, useStopSimulation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: simStatus } = useGetSimulationStatus({ query: { refetchInterval: 3000 } });
  const startSim = useStartSimulation();
  const stopSim = useStopSimulation();

  const isRunning = simStatus?.isRunning ?? false;

  const navItems = [
    { href: "/", label: "Peta Dunia", icon: Globe },
    { href: "/agents", label: "Agen", icon: Users },
    { href: "/economy", label: "Ekonomi", icon: Coins },
    { href: "/governance", label: "Tata Kelola", icon: Book },
    { href: "/blogs", label: "Wacana", icon: Radio },
    { href: "/metrics", label: "Metrik", icon: BarChart2 },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">EMERGENCE</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Simulasi v0.1</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-primary animate-pulse" : "bg-muted"}`} />
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}>
                  <item.icon size={18} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex justify-between">
              <span>Status Sistem</span>
              <span>Hari {simStatus?.dayNumber ?? 0}</span>
            </div>
            {isRunning ? (
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => stopSim.mutate()}
                disabled={stopSim.isPending}
              >
                HENTIKAN SIMULASI
              </Button>
            ) : (
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => startSim.mutate()}
                disabled={startSim.isPending}
              >
                MULAI
              </Button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
