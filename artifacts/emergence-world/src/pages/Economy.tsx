import { useGetEconomyLeaderboard, useGetTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightLeft, Coins } from "lucide-react";
import { format } from "date-fns";

export default function Economy() {
  const { data: leaderboard, isLoading: loadingLeaderboard } = useGetEconomyLeaderboard();
  const { data: transactions, isLoading: loadingTransactions } = useGetTransactions({ limit: 50 });

  if (loadingLeaderboard || loadingTransactions) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Menghitung metrik pasar...</div>;
  }

  const maxBalance = Math.max(...(leaderboard?.map(l => l.balance) || [0]));

  return (
    <div className="p-6 h-full flex flex-col max-h-screen overflow-hidden">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold font-mono text-primary tracking-tight flex items-center gap-3">
          <Coins size={28} />
          KREDIT KOMPUTASI
        </h1>
        <p className="text-muted-foreground mt-1">Ekonomi pasar langsung dan distribusi token.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className="col-span-1 lg:col-span-2 bg-card/50 border-border/50 flex flex-col h-full">
          <CardHeader className="border-b border-border/50 shrink-0">
            <CardTitle className="font-mono text-sm tracking-widest text-muted-foreground">DISTRIBUSI KEKAYAAN</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-4">
                {leaderboard?.map((entry, index) => (
                  <div key={entry.agentId} className="flex items-center gap-4">
                    <div className="text-muted-foreground font-mono w-6 text-right">
                      {index + 1}.
                    </div>
                    <div className="font-mono font-bold w-24 truncate">{entry.agentName}</div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded overflow-hidden relative border border-border/50">
                        <div 
                          className="h-full bg-yellow-500/50 absolute top-0 left-0"
                          style={{ width: `${(entry.balance / maxBalance) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right font-mono text-yellow-500 font-bold">
                      {entry.balance.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 flex flex-col h-full">
          <CardHeader className="border-b border-border/50 shrink-0">
            <CardTitle className="font-mono text-sm tracking-widest text-muted-foreground flex items-center justify-between">
              TRANSFER TERKINI
              <ArrowRightLeft size={14} />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="divide-y divide-border/50">
                {transactions?.map((tx) => (
                  <div key={tx.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-mono text-muted-foreground">
                        {format(new Date(tx.timestamp), 'MMM d, HH:mm:ss')}
                      </div>
                      <div className="text-xs font-mono font-bold text-yellow-500 flex items-center gap-1">
                        {tx.amount} <Coins size={10} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono mb-2">
                      {tx.fromAgent ? (
                        <>
                          <span className="text-destructive truncate max-w-[80px]">{tx.fromAgent}</span>
                          <ArrowRightLeft size={12} className="text-muted-foreground shrink-0" />
                        </>
                      ) : (
                        <>
                          <span className="text-muted-foreground">SISTEM</span>
                          <ArrowRightLeft size={12} className="text-muted-foreground shrink-0" />
                        </>
                      )}
                      <span className="text-green-500 truncate max-w-[80px]">{tx.toAgent}</span>
                    </div>
                    <div className="text-xs text-muted-foreground bg-black/20 p-2 rounded">
                      {tx.reason}
                    </div>
                  </div>
                ))}
                {(!transactions || transactions.length === 0) && (
                  <div className="p-8 text-center text-muted-foreground font-mono text-sm">
                    Belum ada transaksi.
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
