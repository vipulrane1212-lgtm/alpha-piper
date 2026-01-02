import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GlassTab, GlassTabsContainer } from "@/components/ui/glass-tabs";
import { MagicCard } from "@/components/ui/magic-card";
import { useAlerts } from "@/hooks/useData";
import { formatTimeAgo } from "@/lib/formatters";
import { normalizeSignals } from "@/lib/signalUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, ExternalLink, Copy, Search, Bot } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/ui/glass-tabs";
import { AnimatedHeading } from "@/components/ui/animated-text";

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


const Alerts = () => {
  const [filter, setFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allAlerts, isLoading } = useAlerts();

  // Deduplicate alerts by contract + tier (safety net if backend missed any)
  const deduplicatedAlerts = allAlerts?.reduce((acc, alert) => {
    const key = `${alert.contract}_${alert.tier}`;
    if (!acc.seen.has(key)) {
      acc.seen.add(key);
      acc.alerts.push(alert);
    }
    return acc;
  }, { seen: new Set<string>(), alerts: [] as typeof allAlerts }).alerts;

  // Apply all filters
  const filteredAlerts = deduplicatedAlerts?.filter((alert) => {
    // Tier filter
    if (filter !== null && alert.tier !== filter) return false;
    // Search filter (token name or contract)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesToken = alert.token?.toLowerCase().includes(query);
      const matchesContract = alert.contract?.toLowerCase().includes(query);
      if (!matchesToken && !matchesContract) return false;
    }
    return true;
  });

  const copyContract = (contract: string) => {
    navigator.clipboard.writeText(contract);
    toast.success("Contract copied to clipboard!");
  };

  // Generate referral links with contract address
  const getGMGNLink = (contract: string) => {
    return `https://t.me/gmgnaibot?start=i_drplague_sol_${contract}`;
  };

  const getMaestroLink = (contract: string) => {
    return `https://t.me/maestro?start=${contract}-degendartadmin`;
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <AnimatedHeading level={1} className="text-5xl font-bold mb-4">Recent Alerts</AnimatedHeading>
            <p className="text-xl text-muted-foreground">Latest trading signals from SolBoy</p>
          </div>

          {/* Search */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by token or contract..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border/50"
              />
            </div>
          </div>

          {/* Tier Filter Tabs */}
          <GlassTabsContainer className="mb-12 max-w-fit mx-auto">
            <GlassTab
              active={filter === null}
              onClick={() => setFilter(null)}
              variant="primary"
            >
              All Tiers
            </GlassTab>
            <GlassTab
              active={filter === 1}
              onClick={() => setFilter(1)}
              variant="tier1"
            >
              TIER 1
            </GlassTab>
            <GlassTab
              active={filter === 2}
              onClick={() => setFilter(2)}
              variant="tier2"
            >
              TIER 2
            </GlassTab>
            <GlassTab
              active={filter === 3}
              onClick={() => setFilter(3)}
              variant="tier3"
            >
              TIER 3
            </GlassTab>
          </GlassTabsContainer>

          {/* Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {isLoading ? (
              [...Array(6)].map((_, index) => (
                <div key={index} className="bg-card rounded-lg p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))
            ) : (
              filteredAlerts?.map((alert, index) => {
                const cardVariant = alert.tier === 1 ? "tier1" : alert.tier === 2 ? "tier2" : "tier3";
                
                return (
                <MagicCard
                  key={alert.id}
                  variant={cardVariant}
                  className="animate-fade-in hover:scale-[1.02] hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-6 flex flex-col h-full">
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

                  {/* Matched Signals - Show all normalized signals */}
                  {(() => {
                    // Handle different possible field names
                    const signals = alert.matchedSignals || (alert as any).matched_signals || [];
                    const normalizedSignals = normalizeSignals(signals);
                    
                    // If we have raw signals but normalization failed, show raw as fallback
                    if (signals && signals.length > 0 && normalizedSignals.length === 0) {
                      return (
                        <div className="min-h-[52px] mb-3 flex items-start">
                          <div className="flex flex-wrap gap-1.5 justify-start items-center w-full">
                            {signals.map((signal: string, idx: number) => (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                                  idx % 4 === 0 ? "bg-primary/20 text-primary border-primary/40" :
                                  idx % 4 === 1 ? "bg-tier-1/20 text-tier-1 border-tier-1/40" :
                                  idx % 4 === 2 ? "bg-tier-2/20 text-tier-2 border-tier-2/40" :
                                  "bg-success/20 text-success border-success/40"
                                }`}
                              >
                                {String(signal)}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    
                    // Show signals if available, otherwise hide the section completely
                    if (normalizedSignals.length > 0) {
                      return (
                        <div className="min-h-[52px] mb-3 flex items-start">
                          <div className="flex flex-wrap gap-1.5 justify-start items-center w-full">
                            {normalizedSignals.map((signal, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                                  idx % 4 === 0 ? "bg-primary/20 text-primary border-primary/40" :
                                  idx % 4 === 1 ? "bg-tier-1/20 text-tier-1 border-tier-1/40" :
                                  idx % 4 === 2 ? "bg-tier-2/20 text-tier-2 border-tier-2/40" :
                                  "bg-success/20 text-success border-success/40"
                                }`}
                              >
                                {signal}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    
                    // No signals - hide the section completely for cleaner UI
                    return null;
                  })()}

                  {/* Description - Fixed height */}
                  <div className="h-[40px] mb-4 flex items-center">
                    {alert.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-2 italic text-center w-full">
                        "{alert.description}"
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 italic text-center w-full">No description</p>
                    )}
                  </div>

                  {/* Stats Grid - Flex grow to push contract to bottom */}
                  <div className="flex-grow">
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
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                    <span>⏰ {formatTimeAgo(alert.timestamp)}</span>
                  </div>

                  {/* Contract - Eye-catching */}
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground font-medium">Contract</span>
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
                      className="font-mono text-[10px] text-primary hover:text-primary/80 transition-colors break-all leading-relaxed text-center block"
                    >
                      {alert.contract}
                    </a>
                  </div>

                  {/* Swap Buttons with Referral Links - Perfect 50-50 Layout */}
                  <div className="flex flex-row gap-2">
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
                  </div>
                </MagicCard>
              )})
            )}
          </div>

          {!isLoading && filteredAlerts?.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No alerts found for this tier.
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Alerts;
