import { Users, Bell, TrendingUp, Target } from "lucide-react";

// Mock stats data
const stats = {
  totalSubscribers: 1250,
  totalAlerts: 3420,
  tier1Alerts: 890,
  tier2Alerts: 1520,
  tier3Alerts: 1010,
  winRate: 68.5,
};

const statCards = [
  {
    icon: Users,
    label: "Active Subscribers",
    value: stats.totalSubscribers.toLocaleString(),
    colorClass: "text-primary",
  },
  {
    icon: Bell,
    label: "Total Alerts Sent",
    value: stats.totalAlerts.toLocaleString(),
    colorClass: "text-tier-2",
  },
  {
    icon: TrendingUp,
    label: "TIER 1 Alerts",
    value: stats.tier1Alerts.toLocaleString(),
    colorClass: "text-tier-1",
  },
  {
    icon: Target,
    label: "Success Rate",
    value: `${stats.winRate}%`,
    colorClass: "text-success",
  },
];

export function StatsPreview() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real-Time Statistics
          </h2>
          <p className="text-xl text-muted-foreground">Live data from our alert system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className={`w-8 h-8 ${stat.colorClass} mb-4`} />
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tier Breakdown */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="text-tier-1 text-2xl font-bold mb-2">
              {stats.tier1Alerts.toLocaleString()}
            </div>
            <div className="text-muted-foreground">TIER 1 ULTRA</div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="text-tier-2 text-2xl font-bold mb-2">
              {stats.tier2Alerts.toLocaleString()}
            </div>
            <div className="text-muted-foreground">TIER 2 HIGH</div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="text-primary text-2xl font-bold mb-2">
              {stats.tier3Alerts.toLocaleString()}
            </div>
            <div className="text-muted-foreground">TIER 3 MEDIUM</div>
          </div>
        </div>
      </div>
    </section>
  );
}
