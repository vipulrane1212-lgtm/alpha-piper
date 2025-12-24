import { Users, Bell, TrendingUp, Target } from "lucide-react";
import { AnimatedSection, AnimatedCard } from "@/components/ui/animated-section";
import { useStats } from "@/hooks/useData";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsPreview() {
  const { data: stats, isLoading } = useStats();

  const statCards = [
    {
      icon: Users,
      label: "Active Subscribers",
      value: stats?.total_subscribers?.toLocaleString() || "0",
      colorClass: "text-primary",
    },
    {
      icon: Bell,
      label: "Total Alerts Sent",
      value: stats?.total_alerts?.toLocaleString() || "0",
      colorClass: "text-tier-2",
    },
    {
      icon: TrendingUp,
      label: "TIER 1 Alerts",
      value: stats?.tier1_alerts?.toLocaleString() || "0",
      colorClass: "text-tier-1",
    },
    {
      icon: Target,
      label: "Success Rate",
      value: `${stats?.win_rate || 0}%`,
      colorClass: "text-success",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real-Time Statistics
          </h2>
          <p className="text-xl text-muted-foreground">Live data from our alert system</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedCard
                key={stat.label}
                delay={index * 100}
                className="bg-card rounded-lg p-6 border border-border hover:border-primary/50"
              >
                <Icon className={`w-8 h-8 ${stat.colorClass} mb-4 transition-transform duration-300 hover:scale-110`} />
                {isLoading ? (
                  <Skeleton className="h-9 w-24 mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                )}
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Tier Breakdown */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard delay={0} className="bg-card rounded-lg p-6 border border-border hover:border-tier-1/50">
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-tier-1 text-2xl font-bold mb-2">
                {stats?.tier1_alerts?.toLocaleString() || "0"}
              </div>
            )}
            <div className="text-muted-foreground">TIER 1 ULTRA</div>
          </AnimatedCard>
          <AnimatedCard delay={100} className="bg-card rounded-lg p-6 border border-border hover:border-tier-2/50">
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-tier-2 text-2xl font-bold mb-2">
                {stats?.tier2_alerts?.toLocaleString() || "0"}
              </div>
            )}
            <div className="text-muted-foreground">TIER 2 HIGH</div>
          </AnimatedCard>
          <AnimatedCard delay={200} className="bg-card rounded-lg p-6 border border-border hover:border-primary/50">
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-primary text-2xl font-bold mb-2">
                {stats?.tier3_alerts?.toLocaleString() || "0"}
              </div>
            )}
            <div className="text-muted-foreground">TIER 3 MEDIUM</div>
          </AnimatedCard>
        </div>
      </div>
    </section>
  );
}
