import { Layout } from "@/components/layout/Layout";
import { Users, Bell, TrendingUp, Target } from "lucide-react";
import { useStats } from "@/hooks/useData";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedHeading } from "@/components/ui/animated-text";

const Stats = () => {
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
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <AnimatedHeading level={1} className="text-5xl md:text-6xl mb-4">
              Real-Time Statistics
            </AnimatedHeading>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Real-time data from SolBoy Alerts system
            </p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-card rounded-lg p-6 border border-border animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`w-10 h-10 ${stat.colorClass} mb-4`} />
                  {isLoading ? (
                    <Skeleton className="h-10 w-28 mb-2" />
                  ) : (
                    <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                  )}
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Tier Distribution */}
          <div className="bg-card rounded-lg p-8 border border-border mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Alert Distribution by Tier</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-12 w-24 mx-auto mb-2" />
                ) : (
                  <div className="text-5xl font-bold text-tier-1 mb-2">
                    {stats?.tier1Alerts?.toLocaleString() || "0"}
                  </div>
                )}
                <div className="text-muted-foreground mb-2">TIER 1 ULTRA</div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-tier-1 h-3 rounded-full transition-all duration-500"
                    style={{ width: stats ? `${((stats.tier1Alerts || 0) / (stats.totalAlerts || 1)) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-12 w-24 mx-auto mb-2" />
                ) : (
                  <div className="text-5xl font-bold text-tier-2 mb-2">
                    {stats?.tier2Alerts?.toLocaleString() || "0"}
                  </div>
                )}
                <div className="text-muted-foreground mb-2">TIER 2 HIGH</div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-tier-2 h-3 rounded-full transition-all duration-500"
                    style={{ width: stats ? `${((stats.tier2Alerts || 0) / (stats.totalAlerts || 1)) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <div className="text-center">
                {isLoading ? (
                  <Skeleton className="h-12 w-24 mx-auto mb-2" />
                ) : (
                  <div className="text-5xl font-bold text-primary mb-2">
                    {stats?.tier3Alerts?.toLocaleString() || "0"}
                  </div>
                )}
                <div className="text-muted-foreground mb-2">TIER 3 MEDIUM</div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: stats ? `${((stats.tier3Alerts || 0) / (stats.totalAlerts || 1)) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Average Daily Alerts</h3>
              <div className="text-4xl font-bold text-primary">15</div>
              <p className="text-muted-foreground mt-2">Quality signals per day</p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Active Since</h3>
              <div className="text-4xl font-bold text-tier-1">Oct 2023</div>
              <p className="text-muted-foreground mt-2">Delivering consistent results</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Stats;
