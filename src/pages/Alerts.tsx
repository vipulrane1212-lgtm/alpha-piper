import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/hooks/useData";
import { formatTimeAgo, truncateContract } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
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

const Alerts = () => {
  const [filter, setFilter] = useState<number | null>(null);
  const { data: allAlerts, isLoading } = useAlerts();

  const filteredAlerts = filter 
    ? allAlerts?.filter((a) => a.tier === filter) 
    : allAlerts;

  const copyContract = (contract: string) => {
    navigator.clipboard.writeText(contract);
    toast.success("Contract copied to clipboard!");
  };

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">Recent Alerts</h1>
            <p className="text-xl text-muted-foreground">Latest trading signals from SolBoy</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button
              variant={filter === null ? "default" : "outline"}
              onClick={() => setFilter(null)}
            >
              All Tiers
            </Button>
            <Button
              variant={filter === 1 ? "default" : "outline"}
              onClick={() => setFilter(1)}
              className={filter === 1 ? "" : "border-tier-1/50 text-tier-1 hover:bg-tier-1/10"}
            >
              TIER 1
            </Button>
            <Button
              variant={filter === 2 ? "default" : "outline"}
              onClick={() => setFilter(2)}
              className={filter === 2 ? "" : "border-tier-2/50 text-tier-2 hover:bg-tier-2/10"}
            >
              TIER 2
            </Button>
            <Button
              variant={filter === 3 ? "default" : "outline"}
              onClick={() => setFilter(3)}
              className={filter === 3 ? "" : "border-primary/50 text-primary hover:bg-primary/10"}
            >
              TIER 3
            </Button>
          </div>

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
              filteredAlerts?.map((alert, index) => (
                <div
                  key={alert.id}
                  className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in hover:scale-[1.02] hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
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

                  {/* Description */}
                  {alert.description && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2 italic">
                      "{alert.description}"
                    </p>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="bg-muted/30 rounded-md p-2">
                      <span className="text-muted-foreground text-xs">📍 Called At</span>
                      <p className="text-foreground font-semibold">{alert.entry_mcap || "N/A"}</p>
                    </div>
                    <div className="bg-muted/30 rounded-md p-2">
                      <span className="text-muted-foreground text-xs">💰 Current</span>
                      <p className="text-primary font-semibold">{alert.market_cap || "N/A"}</p>
                    </div>
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
              ))
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