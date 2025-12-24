import { CheckCircle2, Zap, TrendingUp, Shield, Clock, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "TIER 1 ULTRA",
    description: "Highest conviction plays with multiple premium source confirmations",
    colorClass: "text-tier-1",
    bgClass: "bg-tier-1/10",
  },
  {
    icon: TrendingUp,
    title: "TIER 2 HIGH",
    description: "Strong setups with solid confirmations and optimal market cap ranges",
    colorClass: "text-tier-2",
    bgClass: "bg-tier-2/10",
  },
  {
    icon: Clock,
    title: "TIER 3 MEDIUM",
    description: "Good opportunities worth watching with multiple confirmations",
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "Multi-Source Confirmation",
    description: "Only alerts when XTRACK, Glydo, whale wallets, and momentum align",
    colorClass: "text-tier-2",
    bgClass: "bg-tier-2/10",
  },
  {
    icon: BarChart3,
    title: "Real-Time Monitoring",
    description: "12+ premium Telegram sources tracked 24/7 for maximum coverage",
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  {
    icon: CheckCircle2,
    title: "Quality Over Quantity",
    description: "Selective alerts — only ~32% of tokens trigger our system",
    colorClass: "text-success",
    bgClass: "bg-success/10",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose SolBoy Alerts?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built by someone who's been in the Solana memecoin space since day one
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${feature.bgClass} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${feature.colorClass}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
