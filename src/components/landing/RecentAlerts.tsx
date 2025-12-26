import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useAlerts } from "@/hooks/useData";
import { formatTimeAgo } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedHeading } from "@/components/ui/animated-text";
import { ElectricBorderCard } from "@/components/ui/electric-border";
import { Check, X, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

const tierColors: Record<number, string> = {
  1: "bg-tier-1/20 text-tier-1 border-tier-1/30",
  2: "bg-tier-2/20 text-tier-2 border-tier-2/30",
  3: "bg-primary/20 text-primary border-primary/30",
};

const tierEmojis: Record<number, string> = {
  1: "🚀",
  2: "🔥",
  3: "⚡",
};

const signalColors = [
  "bg-primary/20 text-primary border-primary/40",
  "bg-tier-1/20 text-tier-1 border-tier-1/40",
  "bg-tier-2/20 text-tier-2 border-tier-2/40",
  "bg-success/20 text-success border-success/40",
];

export function RecentAlerts() {
  const { data: alerts, isLoading } = useAlerts(4);

  const copyContract = (contract: string) => {
    navigator.clipboard.writeText(contract);
    toast.success("Contract copied!");
  };

  // Calculate P/L percentage
  const calculatePL = (entryMcap: string | undefined, currentMcap: number | undefined) => {
    if (!entryMcap || !currentMcap) return null;
    
    // Parse entry mcap (e.g., "$143.5K" -> 143500)
    const parseValue = (str: string): number | null => {
      const match = str.match(/\$?([\d.]+)([KMB]?)/i);
      if (!match) return null;
      let value = parseFloat(match[1]);
      const suffix = match[2].toUpperCase();
      if (suffix === 'K') value *= 1000;
      else if (suffix === 'M') value *= 1000000;
      else if (suffix === 'B') value *= 1000000000;
      return value;
    };

    const entry = parseValue(entryMcap);
    if (!entry) return null;
    
    const plPercent = ((currentMcap - entry) / entry) * 100;
    return plPercent;
  };

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <AnimatedHeading level={2} className="text-4xl md:text-5xl mb-4">
            Recent Alerts
          </AnimatedHeading>
          <p className="text-xl text-foreground/80">Latest signals from our system</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {isLoading ? (
            [...Array(4)].map((_, index) => (
              <div key={index} className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
          ) : (
            alerts?.map((alert, index) => {
              const cardVariant = alert.tier === 1 ? "tier1" : alert.tier === 2 ? "tier2" : "tier3";
              const plPercent = calculatePL(alert.entry_mcap, alert.currentMcap);
              
              return (
                <ElectricBorderCard
                  key={alert.id}
                  variant={cardVariant}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl animate-pulse">{tierEmojis[alert.tier]}</span>
                        <span className="text-xl font-bold text-foreground">{alert.token}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Hotlist Indicator */}
                        <div 
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            alert.hotlist === "Yes" 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-destructive/20 text-destructive"
                          }`}
                          title={alert.hotlist === "Yes" ? "On Hot List" : "Not on Hot List"}
                        >
                          {alert.hotlist === "Yes" ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>HL</span>
                        </div>
                        <Badge variant="outline" className={tierColors[alert.tier]}>
                          TIER {alert.tier}
                        </Badge>
                      </div>
                    </div>

                    {/* Matched Signals */}
                    {alert.matchedSignals && alert.matchedSignals.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {alert.matchedSignals.slice(0, 3).map((signal, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] px-2 py-0.5 rounded-full border backdrop-blur-sm ${signalColors[idx % signalColors.length]}`}
                          >
                            {signal}
                          </span>
                        ))}
                        {alert.matchedSignals.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/30 text-muted-foreground">
                            +{alert.matchedSignals.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="bg-muted/30 rounded-md p-2">
                        <span className="text-muted-foreground text-xs">📍 Entry</span>
                        <p className="text-foreground font-semibold text-sm">{alert.entry_mcap || "N/A"}</p>
                      </div>
                      <div className="bg-muted/30 rounded-md p-2">
                        <span className="text-muted-foreground text-xs">💰 Current</span>
                        <div className="flex items-center gap-1">
                          <p className="text-primary font-semibold text-sm">{alert.market_cap || "N/A"}</p>
                          {plPercent !== null && (
                            <span className={`text-[10px] font-bold ${plPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {plPercent >= 0 ? "+" : ""}{plPercent.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Secondary Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="bg-muted/30 rounded-md p-2">
                        <span className="text-muted-foreground text-xs">📢 Callers</span>
                        <p className="text-foreground font-semibold">{alert.callers || 0}</p>
                      </div>
                      <div className="bg-muted/30 rounded-md p-2">
                        <span className="text-muted-foreground text-xs">👥 Subs</span>
                        <p className="text-foreground font-semibold">{(alert.subs || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-xs text-muted-foreground mb-3">
                      ⏰ {formatTimeAgo(alert.timestamp)}
                    </div>

                    {/* Contract - Eye-catching */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground font-medium">Contract</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyContract(alert.contract)}
                            className="p-1 hover:bg-primary/20 rounded transition-colors"
                            title="Copy contract"
                          >
                            <Copy className="w-3 h-3 text-primary" />
                          </button>
                          <a 
                            href={`https://dexscreener.com/solana/${alert.contract}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-primary/20 rounded transition-colors"
                            title="View on DexScreener"
                          >
                            <ExternalLink className="w-3 h-3 text-primary" />
                          </a>
                        </div>
                      </div>
                      <a 
                        href={`https://dexscreener.com/solana/${alert.contract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[9px] text-primary hover:text-primary/80 transition-colors break-all leading-relaxed"
                      >
                        {alert.contract}
                      </a>
                    </div>
                  </div>
                </ElectricBorderCard>
              );
            })
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <a 
            href="/alerts" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View All Alerts
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
