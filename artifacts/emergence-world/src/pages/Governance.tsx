import { useGetConstitution, useGetProposals } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Gavel, Check, X } from "lucide-react";

export default function Governance() {
  const { data: constitution, isLoading: loadingConst } = useGetConstitution();
  const { data: proposals, isLoading: loadingProps } = useGetProposals();

  if (loadingConst || loadingProps) return <div className="p-8 font-mono text-muted-foreground">Memuat kerangka hukum...</div>;

  const statusLabel: Record<string, string> = {
    active: "aktif",
    passed: "disetujui",
    rejected: "ditolak",
  };

  return (
    <div className="p-6 h-full flex flex-col max-h-screen overflow-hidden">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold font-mono text-primary tracking-tight flex items-center gap-3">
          <Book size={28} />
          KONSTITUSI & TATA KELOLA
        </h1>
        <p className="text-muted-foreground mt-1">Hukum dasar dan usulan legislatif yang sedang berjalan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <Card className="bg-card/50 border-border/50 flex flex-col h-full">
          <CardHeader className="border-b border-border/50 shrink-0 bg-muted/10">
            <CardTitle className="font-mono text-sm tracking-widest text-primary flex justify-between">
              KONSTITUSI
              <span className="text-muted-foreground">v{constitution?.version}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-6 space-y-8">
                {constitution?.articles.map(article => (
                  <div key={article.number} className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-primary/20 rounded" />
                    <h3 className="font-mono text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-primary text-sm">PASAL {article.number}</span>
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {article.content}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 flex flex-col h-full">
          <CardHeader className="border-b border-border/50 shrink-0 bg-muted/10">
            <CardTitle className="font-mono text-sm tracking-widest text-accent flex items-center gap-2">
              <Gavel size={16} />
              LEGISLASI AKTIF
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-4">
                {proposals?.map(prop => (
                  <Card key={prop.id} className="bg-black/40 border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-foreground">{prop.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                          prop.status === 'active' ? 'bg-accent/20 text-accent border border-accent/30' :
                          prop.status === 'passed' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                          'bg-destructive/20 text-destructive border border-destructive/30'
                        }`}>
                          {statusLabel[prop.status] ?? prop.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{prop.description}</p>
                      
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="text-muted-foreground">
                          Diusulkan oleh: <span className="text-foreground">{prop.proposedBy}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-green-500">
                            <Check size={12} /> {prop.votesFor}
                          </div>
                          <div className="flex items-center gap-1 text-destructive">
                            <X size={12} /> {prop.votesAgainst}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                        <div className="bg-green-500 h-full" style={{ width: `${(prop.votesFor / prop.totalVoters) * 100}%` }} />
                        <div className="bg-destructive h-full" style={{ width: `${(prop.votesAgainst / prop.totalVoters) * 100}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {proposals?.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground font-mono text-sm">
                    Belum ada usulan aktif.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
