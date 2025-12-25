import { Badge } from "@/components/ui/badge";
import { AnimatedSection, AnimatedCard } from "@/components/ui/animated-section";
import { useAlerts } from "@/hooks/useData";
import { formatTimeAgo, truncateContract } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
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

export function RecentAlerts() {
  const { data: alerts, isLoading } = useAlerts(4);

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <AnimatedHeading level={2} className="text-4xl md:text-5xl mb-4">
            Recent Alerts
          </AnimatedHeading>
          <p className="text-xl text-foreground/80">Latest signals from our system</p>
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
                  <div className="flex items-center gap-2">
                    <span className="text-2xl animate-pulse">{tierEmojis[alert.tier]}</span>
                    <span className="text-xl font-bold text-foreground">{alert.token}</span>
                  </div>
                  <Badge variant="outline" className={`${tierColors[alert.tier]} transition-all duration-300 hover:scale-105`}>
                    TIER {alert.tier}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">💰 MCap:</span>
                    <span className="text-foreground ml-2">{alert.market_cap || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">⏰ Time:</span>
                    <span className="text-foreground ml-2">{formatTimeAgo(alert.timestamp)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">📢 Callers:</span>
                    <span className="text-foreground ml-2">{alert.callers || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">👥 Subs:</span>
                    <span className="text-foreground ml-2">{alert.subs || 0}</span>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <span className="text-muted-foreground">Contract: </span>
                  <a 
                    href={`https://dexscreener.com/solana/${alert.contract}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary hover:underline break-all"
                  >
                    {alert.contract}
                  </a>
                </div>
              </AnimatedCard>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
