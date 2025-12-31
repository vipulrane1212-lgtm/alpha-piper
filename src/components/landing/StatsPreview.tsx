import { Users, Bell, TrendingUp, Target } from "lucide-react";
import { AnimatedSection, AnimatedCard } from "@/components/ui/animated-section";
import { GlassCard } from "@/components/ui/glass-tabs";
import { useStats } from "@/hooks/useData";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsPreview() {
  const { data: stats, isLoading } = useStats();

  const statCards = [
    {
      icon: Users,
      label: "Active Subscribers",
      value: stats?.totalSubscribers?.toLocaleString() || "0",
      colorClass: "text-primary",
    },
    {
      icon: Bell,
      label: "Total Alerts Sent",
      value: stats?.totalAlerts?.toLocaleString() || "0",
      colorClass: "text-tier-2",
    },
    {
      icon: TrendingUp,
      label: "TIER 1 Alerts",
      value: stats?.tier1Alerts?.toLocaleString() || "0",
      colorClass: "text-tier-1",
    },
    {
      icon: Target,
      label: "Success Rate",
      value: `${stats?.winRate || 0}%`,
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
            // Determine variant based on color class
            const variant = stat.colorClass.includes("tier-1") ? "tier1" 
              : stat.colorClass.includes("tier-2") ? "tier2"
              : stat.colorClass.includes("success") ? "primary"
              : "primary";
            
            return (
              <AnimatedCard
                key={stat.label}
                delay={index * 100}
              >
                <GlassCard variant={variant} className="p-6">
                  <Icon className={`w-8 h-8 ${stat.colorClass} mb-4 transition-transform duration-300 hover:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`} />
                  {isLoading ? (
                    <Skeleton className="h-9 w-24 mb-2" />
                  ) : (
                    <div className="text-3xl font-bold text-foreground mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">{stat.value}</div>
                  )}
                  <div className="text-muted-foreground text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">{stat.label}</div>
                </GlassCard>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Tier Breakdown */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard delay={0}>
            <GlassCard variant="tier1" className="p-6">
              {isLoading ? (
                <Skeleton className="h-8 w-20 mb-2" />
              ) : (
                <div className="text-tier-1 text-2xl font-bold mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                  {stats?.tier1Alerts?.toLocaleString() || "0"}
                </div>
              )}
              <div className="text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">TIER 1 ULTRA</div>
            </GlassCard>
          </AnimatedCard>
          <AnimatedCard delay={100}>
            <GlassCard variant="tier2" className="p-6">
              {isLoading ? (
                <Skeleton className="h-8 w-20 mb-2" />
              ) : (
                <div className="text-tier-2 text-2xl font-bold mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                  {stats?.tier2Alerts?.toLocaleString() || "0"}
                </div>
              )}
              <div className="text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">TIER 2 HIGH</div>
            </GlassCard>
          </AnimatedCard>
          <AnimatedCard delay={200}>
            <GlassCard variant="primary" className="p-6">
              {isLoading ? (
                <Skeleton className="h-8 w-20 mb-2" />
              ) : (
                <div className="text-primary text-2xl font-bold mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                  {stats?.tier3Alerts?.toLocaleString() || "0"}
                </div>
              )}
              <div className="text-muted-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">TIER 3 MEDIUM</div>
            </GlassCard>
          </AnimatedCard>
        </div>
      </div>
    </section>
  );
}
