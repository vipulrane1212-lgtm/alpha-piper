import { Badge } from "@/components/ui/badge";
import { AnimatedSection, AnimatedCard } from "@/components/ui/animated-section";

// Mock alerts data
const recentAlerts = [
  {
    id: "1",
    token: "DOGE420",
    tier: 1,
    timestamp: "2 min ago",
    marketCap: "$75K",
    contract: "7xKX...3mP9",
  },
  {
    id: "2",
    token: "MOONCAT",
    tier: 2,
    timestamp: "15 min ago",
    marketCap: "$120K",
    contract: "9aRT...5nQ2",
  },
  {
    id: "3",
    token: "SOLAPE",
    tier: 1,
    timestamp: "32 min ago",
    marketCap: "$45K",
    contract: "4dFG...8kL1",
  },
  {
    id: "4",
    token: "PEPEKING",
    tier: 3,
    timestamp: "1 hour ago",
    marketCap: "$200K",
    contract: "2bNM...6pR4",
  },
];

const tierColors: Record<number, string> = {
  1: "bg-tier-1/20 text-tier-1 border-tier-1/30",
  2: "bg-tier-2/20 text-tier-2 border-tier-2/30",
  3: "bg-primary/20 text-primary border-primary/30",
};

export function RecentAlerts() {
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
          {recentAlerts.map((alert, index) => (
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
                  <span className="text-muted-foreground">Market Cap:</span>
                  <span className="text-foreground ml-2">{alert.marketCap}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <span className="text-foreground ml-2">{alert.timestamp}</span>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                Contract: <span className="font-mono">{alert.contract}</span>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
