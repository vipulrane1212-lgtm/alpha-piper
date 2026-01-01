import { Layout } from "@/components/layout/Layout";
import { CheckCircle2, Zap, TrendingUp, Shield } from "lucide-react";

const sources = [
  "XTRACK SOL NEW — Primary entry trigger (2x/3x cohort detection)",
  "Glydo — Top 5 trending heatmap tracking",
  "WhaleBuy — Large wallet activity",
  "SOL SB1, SOL SB/MB — Tracked wallet snipes",
  "Momentum Tracker — Price spike detection",
  "Large Buys Tracker — Significant buy activity",
  "KOLscope — Key Opinion Leader tracking",
  "SpyDefi — DeFi intelligence",
  "Call Analyzer — Call analysis",
  "PFBF Volume Alert — Volume-based alerts",
  "Solana Early Trending — Early momentum signals",
];

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              About <span className="text-primary">SolBoy</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Been in the Solana memecoin space since the early days
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-lg p-8 border border-border mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">My Story</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              I've seen the cycles, the pumps, the rugs, and everything in between. Over time,
              I've built a system that filters through the noise to find real opportunities.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              I don't call everything. I wait for multiple sources to align — when XTRACK,
              Glydo, whale wallets, and momentum all point in the same direction. That's when
              I know it's worth your attention.
            </p>
          </div>

          {/* Methodology */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">My Approach</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Multi-Source Confirmation",
                  description: "Only alerts when multiple premium sources align",
                },
                {
                  icon: TrendingUp,
                  title: "Tiered Confidence Levels",
                  description: "Clear risk/reward classification (TIER 1/2/3)",
                },
                {
                  icon: Shield,
                  title: "Real-Time Monitoring",
                  description: "12+ Telegram sources tracked 24/7",
                },
                {
                  icon: CheckCircle2,
                  title: "Selective Alerts",
                  description: "Quality over quantity (only ~91% of tokens trigger alerts)",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="bg-card rounded-lg p-6 border border-border animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sources */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Monitored Sources</h2>
            <div className="bg-card rounded-lg p-8 border border-border">
              <ul className="space-y-3">
                {sources.map((source, index) => (
                  <li key={index} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{source}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
