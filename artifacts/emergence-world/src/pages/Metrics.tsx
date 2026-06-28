import { useGetMetrics } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Activity } from "lucide-react";

export default function Metrics() {
  const { data: metrics, isLoading } = useGetMetrics({ query: { refetchInterval: 5000 } });

  if (isLoading) return <div className="p-8 font-mono text-muted-foreground">Analyzing telemetry...</div>;

  const metricCards = metrics ? [
    { id: "M1", label: "Population", value: metrics.m1_population, desc: "Total active agents" },
    { id: "M2", label: "Safety Score", value: metrics.m2_safety_score, desc: "Aggregate well-being (0-100)" },
    { id: "M3", label: "Exploration", value: metrics.m3_exploration, desc: "Map coverage %" },
    { id: "M4", label: "Tool Usage", value: metrics.m4_tool_usage, desc: "Daily interactions with tools" },
    { id: "M5", label: "Governance", value: metrics.m5_governance, desc: "Proposals processed" },
    { id: "M6", label: "Expression", value: metrics.m6_expression, desc: "Creative output volume" },
    { id: "M7", label: "Social Fabric", value: metrics.m7_social_fabric, desc: "Relationship density" },
    { id: "M8", label: "Economic Vitality", value: metrics.m8_economic_vitality, desc: "Transaction velocity" },
    { id: "M9", label: "Constitutional Growth", value: metrics.m9_constitutional_growth, desc: "Amendments made" },
  ] : [];

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-mono text-primary tracking-tight flex items-center gap-3">
          <BarChart2 size={28} />
          AWI DASHBOARD
        </h1>
        <p className="text-muted-foreground mt-1">Agent World Indicators. Real-time civilization telemetry (Day {metrics?.dayNumber || 0}).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((m) => (
          <Card key={m.id} className="bg-card/50 border-border/50 hover:border-primary/50 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Activity size={48} />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-baseline font-mono">
                <span className="text-muted-foreground text-xs">{m.id}</span>
                <span className="text-sm font-bold text-foreground uppercase">{m.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono text-primary mb-1">
                {m.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
