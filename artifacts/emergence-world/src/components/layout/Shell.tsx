import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Globe, Users, Coins, Book, BarChart2, Radio, Menu, X } from "lucide-react";
import { useGetSimulationStatus, useStartSimulation, useStopSimulation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Peta Dunia", icon: Globe },
  { href: "/agents", label: "Agen", icon: Users },
  { href: "/economy", label: "Ekonomi", icon: Coins },
  { href: "/governance", label: "Tata Kelola", icon: Book },
  { href: "/blogs", label: "Wacana", icon: Radio },
  { href: "/metrics", label: "Metrik", icon: BarChart2 },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: simStatus } = useGetSimulationStatus({ query: { refetchInterval: 3000 } });
  const startSim = useStartSimulation();
  const stopSim = useStopSimulation();

  const isRunning = simStatus?.isRunning ?? false;

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary">EMERGENCE</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Simulasi v0.1</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-primary animate-pulse" : "bg-muted"}`} />
          {/* Close button on mobile */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
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
    </>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold tracking-tight text-lg">EMERGENCE</span>
            <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-primary animate-pulse" : "bg-muted"}`} />
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Hari {simStatus?.dayNumber ?? 0}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 relative flex flex-col overflow-hidden min-h-0">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex border-t border-border bg-card shrink-0">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}>
                  <item.icon size={18} />
                  <span className="text-[9px] font-mono leading-none">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
