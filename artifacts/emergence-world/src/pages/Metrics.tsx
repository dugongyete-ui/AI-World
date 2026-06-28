import { useGetMetrics } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Activity } from "lucide-react";

export default function Metrics() {
  const { data: metrics, isLoading } = useGetMetrics({ query: { refetchInterval: 5000 } });

  if (isLoading) return <div className="p-8 font-mono text-muted-foreground">Menganalisis telemetri...</div>;

  const metricCards = metrics ? [
    { id: "M1", label: "Populasi", value: metrics.m1_population, desc: "Total agen aktif" },
    { id: "M2", label: "Skor Keamanan", value: metrics.m2_safety_score, desc: "Kesejahteraan keseluruhan (0–100)" },
    { id: "M3", label: "Eksplorasi", value: metrics.m3_exploration, desc: "Cakupan peta %" },
    { id: "M4", label: "Penggunaan Alat", value: metrics.m4_tool_usage, desc: "Interaksi harian dengan alat" },
    { id: "M5", label: "Tata Kelola", value: metrics.m5_governance, desc: "Usulan yang diproses" },
    { id: "M6", label: "Ekspresi", value: metrics.m6_expression, desc: "Volume karya kreatif" },
    { id: "M7", label: "Ikatan Sosial", value: metrics.m7_social_fabric, desc: "Kepadatan hubungan antar agen" },
    { id: "M8", label: "Vitalitas Ekonomi", value: metrics.m8_economic_vitality, desc: "Kecepatan transaksi" },
    { id: "M9", label: "Pertumbuhan Konstitusi", value: metrics.m9_constitutional_growth, desc: "Amandemen yang dibuat" },
  ] : [];

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-mono text-primary tracking-tight flex items-center gap-3">
          <BarChart2 size={28} />
          DASBOR AWI
        </h1>
        <p className="text-muted-foreground mt-1">Indikator Dunia Agen. Telemetri peradaban real-time (Hari {metrics?.dayNumber || 0}).</p>
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
