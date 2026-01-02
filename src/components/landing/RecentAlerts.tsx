import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useAlerts } from "@/hooks/useData";
import { formatTimeAgo } from "@/lib/formatters";
import { normalizeSignals } from "@/lib/signalUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedHeading } from "@/components/ui/animated-text";
import { MagicCard } from "@/components/ui/magic-card";
import { Check, X, ExternalLink, Copy, Bot } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/ui/glass-tabs";

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

  // Generate referral links with contract address
  const getGMGNLink = (contract: string) => {
    return `https://t.me/gmgnaibot?start=i_drplague_sol_${contract}`;
  };

  const getMaestroLink = (contract: string) => {
    return `https://t.me/maestro?start=${contract}-degendartadmin`;
  };


  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle background glow effects - matching other sections */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tier-1/5 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-12 relative z-20">
          <AnimatedHeading level={2} className="text-4xl md:text-5xl mb-4 relative z-10">
            Recent Alerts
          </AnimatedHeading>
          <p className="text-xl text-foreground/80 relative z-10">Latest signals from our system</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto relative z-10">
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
              
              return (
                <MagicCard
                  key={alert.id}
                  variant={cardVariant}
                  className="animate-fade-in h-full flex flex-col"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-5 flex flex-col h-full">
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

                    {/* Matched Signals - Always reserve space to keep cards aligned */}
                    <div className="min-h-[40px] mb-3 flex items-start">
                      {(() => {
                        // Handle different possible field names - check all variations
                        const signals = alert.matchedSignals || (alert as any).matched_signals || [];
                        
                        // If we have signals, normalize them
                        let normalizedSignals: string[] = [];
                        if (signals && signals.length > 0) {
                          normalizedSignals = normalizeSignals(signals);
                          
                          // If normalization failed but we have raw signals, use raw as fallback
                          if (normalizedSignals.length === 0) {
                            normalizedSignals = signals.map(s => String(s));
                          }
                        }
                        
                        // Show signals (normalized or raw fallback)
                        if (normalizedSignals.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-1.5 justify-start items-center w-full">
                              {normalizedSignals.map((signal, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] px-2 py-0.5 rounded-full border backdrop-blur-sm ${signalColors[idx % signalColors.length]}`}
                                >
                                  {signal}
                                </span>
                              ))}
                            </div>
                          );
                        }
                        
                        // No signals - show empty space to keep card height consistent
                        return <div className="w-full" />;
                      })()}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div className="bg-muted/30 rounded-md p-2 text-center">
                        <span className="text-muted-foreground text-xs block">📍 Entry</span>
                        <p className="text-foreground font-semibold text-sm">
                          {alert.entryMc != null ? `$${(alert.entryMc / 1000).toFixed(1)}K` : (alert.entry_mcap || "N/A")}
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded-md p-2 text-center">
                        <span className="text-muted-foreground text-xs block">📢 Callers</span>
                        <p className="text-foreground font-semibold">{alert.callers || 0}</p>
                      </div>
                      <div className="bg-muted/30 rounded-md p-2 text-center">
                        <span className="text-muted-foreground text-xs block">👥 Subs</span>
                        <p className="text-foreground font-semibold">{(alert.subs || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-xs text-muted-foreground text-center mb-3">
                      ⏰ {formatTimeAgo(alert.timestamp)}
                    </div>

                    {/* Contract - Eye-catching */}
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-lg p-2.5 mb-3">
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
                        className="font-mono text-[9px] text-primary hover:text-primary/80 transition-colors break-all leading-relaxed text-center block"
                      >
                        {alert.contract}
                      </a>
                    </div>

                    {/* Swap Buttons with Referral Links - Perfect 50-50 Layout */}
                    <div className="flex flex-row gap-2 mt-auto">
                      <a
                        href={getGMGNLink(alert.contract)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-0"
                      >
                        <GlassButton variant="primary" size="sm" className="w-full text-xs font-semibold flex items-center justify-center">
                          <Bot className="w-3 h-3 mr-1.5 flex-shrink-0" />
                          <span className="truncate">Swap via GMGN</span>
                        </GlassButton>
                      </a>
                      <a
                        href={getMaestroLink(alert.contract)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-0"
                      >
                        <GlassButton variant="tier2" size="sm" className="w-full text-xs font-semibold flex items-center justify-center">
                          <Bot className="w-3 h-3 mr-1.5 flex-shrink-0" />
                          <span className="truncate">Swap via Maestro</span>
                        </GlassButton>
                      </a>
                    </div>
                  </div>
                </MagicCard>
              );
            })
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8 relative z-10">
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
