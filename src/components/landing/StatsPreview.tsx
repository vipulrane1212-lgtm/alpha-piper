import { Users, Bell, TrendingUp, Target } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { MagicCard } from "@/components/ui/magic-card";
import { useStats } from "@/hooks/useData";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsPreview() {
  const { data: stats, isLoading } = useStats();

  const statCards = [
    {
      icon: Users,
      label: "Active Subscribers",
      value: stats?.totalSubscribers?.toLocaleString() || "0",
      gradientColors: ["hsl(187, 100%, 50%)", "hsl(220, 80%, 60%)", "hsl(260, 80%, 50%)"],
    },
    {
      icon: Bell,
      label: "Total Alerts Sent",
      value: stats?.totalAlerts?.toLocaleString() || "0",
      gradientColors: ["hsl(20, 100%, 60%)", "hsl(51, 100%, 50%)", "hsl(38, 100%, 60%)"],
    },
    {
      icon: TrendingUp,
      label: "TIER 1 Alerts",
      value: stats?.tier1Alerts?.toLocaleString() || "0",
      gradientColors: ["hsl(51, 100%, 50%)", "hsl(38, 100%, 60%)", "hsl(20, 100%, 60%)"],
    },
    {
      icon: Target,
      label: "Success Rate",
      value: `${stats?.winRate || 0}%`,
      gradientColors: ["hsl(142, 76%, 36%)", "hsl(160, 80%, 40%)", "hsl(187, 100%, 50%)"],
    },
  ];

  const tierCards = [
    {
      value: stats?.tier1Alerts?.toLocaleString() || "0",
      label: "TIER 1 ULTRA",
      gradientColors: ["hsl(51, 100%, 50%)", "hsl(38, 100%, 60%)", "hsl(20, 100%, 60%)"],
      textColor: "text-tier-1",
    },
    {
      value: stats?.tier2Alerts?.toLocaleString() || "0",
      label: "TIER 2 HIGH",
      gradientColors: ["hsl(20, 100%, 60%)", "hsl(51, 100%, 50%)", "hsl(38, 100%, 60%)"],
      textColor: "text-tier-2",
    },
    {
      value: stats?.tier3Alerts?.toLocaleString() || "0",
      label: "TIER 3 MEDIUM",
      gradientColors: ["hsl(187, 100%, 50%)", "hsl(220, 80%, 60%)", "hsl(260, 80%, 50%)"],
      textColor: "text-primary",
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
              <MagicCard
                key={stat.label}
                gradientColors={stat.gradientColors}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 bg-card/80 backdrop-blur-md rounded-xl">
                  <Icon className="w-8 h-8 text-primary mb-4 transition-transform duration-300 hover:scale-110" />
                  {isLoading ? (
                    <Skeleton className="h-9 w-24 mb-2" />
                  ) : (
                    <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  )}
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </div>
              </MagicCard>
            );
          })}
        </div>

        {/* Tier Breakdown with glassmorphism */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tierCards.map((tier, index) => (
            <MagicCard
              key={tier.label}
              gradientColors={tier.gradientColors}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6 bg-card/80 backdrop-blur-md rounded-xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <div className={`${tier.textColor} text-2xl font-bold mb-2`}>
                    {tier.value}
                  </div>
                )}
                <div className="text-muted-foreground">{tier.label}</div>
              </div>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  );
}
