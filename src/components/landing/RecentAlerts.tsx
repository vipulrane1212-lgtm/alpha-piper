import { Badge } from "@/components/ui/badge";
import { AnimatedSection, AnimatedCard } from "@/components/ui/animated-section";
import { useAlerts } from "@/hooks/useData";
import { formatTimeAgo, truncateContract } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

const tierColors: Record<number, string> = {
  1: "bg-tier-1/20 text-tier-1 border-tier-1/30",
  2: "bg-tier-2/20 text-tier-2 border-tier-2/30",
  3: "bg-primary/20 text-primary border-primary/30",
};

export function RecentAlerts() {
  const { data: alerts, isLoading } = useAlerts(4);

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Recent Alerts
          </h2>
          <p className="text-xl text-muted-foreground">Latest signals from our system</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
            alerts?.map((alert, index) => (
              <AnimatedCard
                key={alert.id}
                delay={index * 100}
                className="bg-card rounded-lg p-6 border border-border hover:border-primary/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-foreground">{alert.token}</span>
                  <Badge variant="outline" className={`${tierColors[alert.tier]} transition-all duration-300 hover:scale-105`}>
                    TIER {alert.tier}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Liquidity:</span>
                    <span className="text-foreground ml-2">${alert.liquidity?.toLocaleString() || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <span className="text-foreground ml-2">{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Contract: <span className="font-mono">{truncateContract(alert.contract)}</span>
                </div>
              </AnimatedCard>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
