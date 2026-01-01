import { CheckCircle2, Zap, TrendingUp, Shield, Clock, BarChart3 } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { GlassCard } from "@/components/ui/glass-tabs";
import { GhostAnimation } from "@/components/animations/GhostAnimation";
import { AnimatedHeading } from "@/components/ui/animated-text";

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
    description: "Selective alerts — only ~91% of tokens trigger our system",
    colorClass: "text-success",
    bgClass: "bg-success/10",
  },
];

export function Features() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle background glow effects - matching other sections */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tier-1/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-16 relative z-20">
          <AnimatedHeading level={2} className="text-4xl md:text-5xl mb-4 relative z-30">
            Why Choose SolBoy Alerts?
          </AnimatedHeading>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto relative z-30">
            Built by someone who's been in the Solana memecoin space since day one
          </p>
        </AnimatedSection>

        {/* Two column layout: Animation on left, Content on right */}
        <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
          {/* Left side - Animation - Ghost Animation - Visible on all devices */}
          <div className="w-full lg:w-2/5 relative z-10 h-[500px] lg:h-[600px] bg-transparent">
            <GhostAnimation />
          </div>

          {/* Right side - Feature cards */}
          <div className="w-full lg:w-3/5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const cardVariant = feature.colorClass.includes("tier-1") ? "tier1" 
                  : feature.colorClass.includes("tier-2") ? "tier2" 
                  : feature.colorClass.includes("success") ? "primary"
                  : "primary";
                return (
                  <GlassCard
                    key={feature.title}
                    variant={cardVariant}
                    className="p-5 animate-fade-in group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${feature.bgClass} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className={`w-6 h-6 ${feature.colorClass}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">{feature.title}</h3>
                        <p className="text-sm text-foreground/70 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">{feature.description}</p>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
