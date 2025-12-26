import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassTab, GlassTabsContainer } from "@/components/ui/glass-tabs";
import { ElectricBorderCard } from "@/components/ui/electric-border";
import { useAlerts } from "@/hooks/useData";
import { formatTimeAgo, truncateContract } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, ExternalLink, Copy, RefreshCw, Shield, AlertTriangle, Users } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

const riskColors: Record<string, string> = {
  low: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-destructive/20 text-destructive border-destructive/30",
  unknown: "bg-muted/30 text-muted-foreground border-border",
};

const Alerts = () => {
  const [filter, setFilter] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: allAlerts, isLoading } = useAlerts();
  const queryClient = useQueryClient();

  const filteredAlerts = filter 
    ? allAlerts?.filter((a) => a.tier === filter) 
    : allAlerts;

  const copyContract = (contract: string) => {
    navigator.clipboard.writeText(contract);
    toast.success("Contract copied to clipboard!");
  };

  const refreshATHData = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/solboy-api?endpoint=backfill&limit=10`,
        { headers: { "Content-Type": "application/json" } }
      );
      
      if (!response.ok) {
        throw new Error("Failed to refresh ATH data");
      }
      
      const result = await response.json();
      
      if (result.updated > 0) {
        toast.success(`Updated ATH data for ${result.updated} alerts`);
        queryClient.invalidateQueries({ queryKey: ["alerts"] });
      } else if (result.processed === 0) {
        toast.info("All alerts already have ATH data cached");
      } else {
        toast.info(`Processed ${result.processed} alerts - ATH data not yet available`);
      }
    } catch (error) {
      toast.error("Failed to refresh ATH data");
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">Recent Alerts</h1>
            <p className="text-xl text-muted-foreground mb-6">Latest trading signals from SolBoy</p>
            <Button
              onClick={refreshATHData}
              disabled={isRefreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Updating ATH Data..." : "Refresh ATH Data"}
            </Button>
          </div>

          {/* Filter Tabs - Glassmorphism */}
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
                <ElectricBorderCard
                  key={alert.id}
                  variant={cardVariant}
                  className="animate-fade-in hover:scale-[1.02] hover:-translate-y-1 transition-transform duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-6">
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

                  {/* Risk Score & Holder Concentration Row */}
                  <div className="flex items-center gap-2 mb-3">
                    {/* Risk Score Badge */}
                    <div 
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${riskColors[alert.risk_level || 'unknown']}`}
                      title={`Risk Score: ${alert.risk_score || 0}/10`}
                    >
                      {alert.risk_level === 'high' ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      <span className="capitalize">{alert.risk_level || 'N/A'} Risk</span>
                    </div>
                    
                    {/* Top 10 Holder Concentration */}
                    <div 
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                        alert.top10_holders > 50 
                          ? "bg-destructive/20 text-destructive border-destructive/30" 
                          : alert.top10_holders > 30
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : alert.top10_holders > 0
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-muted/30 text-muted-foreground border-border"
                      }`}
                      title="Top 10 holders concentration"
                    >
                      <Users className="w-3 h-3" />
                      <span>Top10: {alert.top10_holders > 0 ? `${alert.top10_holders}%` : "—"}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {alert.description && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2 italic">
                      "{alert.description}"
                    </p>
                  )}

                  {/* Stats Grid with ATH X */}
                  <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    <div className="bg-muted/30 rounded-md p-2">
                      <span className="text-muted-foreground text-xs">📍 Entry</span>
                      <p className="text-foreground font-semibold text-sm">{alert.entry_mcap || "N/A"}</p>
                    </div>
                    <div className="bg-muted/30 rounded-md p-2">
                      <span className="text-muted-foreground text-xs">💰 Current</span>
                      <p className="text-primary font-semibold text-sm">{alert.market_cap || "N/A"}</p>
                    </div>
                    <div className="bg-gradient-to-r from-tier-1/20 to-tier-2/20 rounded-md p-2 border border-tier-1/30">
                      <span className="text-muted-foreground text-xs">🏔️ ATH X</span>
                      <p className={`font-bold text-sm ${
                        alert.ath_x && alert.ath_x !== '—' && parseFloat(alert.ath_x) >= 2 
                          ? "text-tier-1" 
                          : alert.ath_x && alert.ath_x !== '—' && parseFloat(alert.ath_x) >= 1.5 
                            ? "text-tier-2" 
                            : "text-foreground"
                      }`}>
                        {alert.ath_x || "—"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Secondary Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
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
                  <div className="flex justify-between text-xs text-muted-foreground mb-3">
                    <span>⏰ {formatTimeAgo(alert.timestamp)}</span>
                    <span>Score: {alert.score}</span>
                  </div>

                  {/* Contract - Eye-catching */}
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-lg p-3">
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
                      className="font-mono text-[10px] text-primary hover:text-primary/80 transition-colors break-all leading-relaxed"
                    >
                      {alert.contract}
                    </a>
                  </div>
                  </div>
                </ElectricBorderCard>
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
