import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/hooks/useData";
import { formatTimeAgo, truncateContract } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

const tierColors: Record<number, string> = {
  1: "bg-tier-1/20 text-tier-1 border-tier-1/30",
  2: "bg-tier-2/20 text-tier-2 border-tier-2/30",
  3: "bg-primary/20 text-primary border-primary/30",
};

const Alerts = () => {
  const [filter, setFilter] = useState<number | null>(null);
  const { data: allAlerts, isLoading } = useAlerts();

  const filteredAlerts = filter 
    ? allAlerts?.filter((a) => a.tier === filter) 
    : allAlerts;

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
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            ) : (
              filteredAlerts?.map((alert, index) => (
                <div
                  key={alert.id}
                  className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in hover:scale-[1.02] hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-foreground">{alert.token}</span>
                    <Badge variant="outline" className={tierColors[alert.tier]}>
                      TIER {alert.tier}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Liquidity:</span>
                      <span className="text-foreground">${alert.liquidity?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="text-foreground">{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <span className="text-muted-foreground text-xs">Contract: </span>
                      <span className="font-mono text-xs text-foreground">{truncateContract(alert.contract)}</span>
                    </div>
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
