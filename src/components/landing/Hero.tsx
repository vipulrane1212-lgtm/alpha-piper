import { ArrowRight, Zap, TrendingUp, Shield } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-tabs";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedHeading } from "@/components/ui/animated-text";
import { MetaballsBackground } from "@/components/animations/MetaballsBackground";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Metaballs 3D Background */}
      <MetaballsBackground />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20 backdrop-blur-sm">
              🚀 Solana Memecoin Alpha
            </span>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <AnimatedHeading level={1} className="text-5xl md:text-7xl mb-6">
              SolBoy Alerts
            </AnimatedHeading>
          </div>

          <p className="text-xl md:text-2xl text-foreground mb-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Multi-Source Confirmed Trading Signals
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Get real-time alerts when XTRACK, Glydo, whale wallets, and momentum all align.
            Quality over quantity — only the best opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <a
              href="https://t.me/solboy_calls"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GlassButton variant="primary" size="lg" className="group">
                Start Trading Now
                <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
              </GlassButton>
            </a>
            <a href="/about">
              <GlassButton variant="secondary" size="lg">
                Learn More
              </GlassButton>
            </a>
          </div>

          {/* Quick stats with magic card effect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <MagicCard 
              className="animate-fade-in" 
              style={{ animationDelay: "0.6s" }}
              gradientColors={["hsl(51, 100%, 50%)", "hsl(38, 100%, 60%)", "hsl(20, 100%, 60%)"]}
            >
              <div className="p-6 text-center">
                <Zap className="w-8 h-8 text-tier-1 mb-2 mx-auto" />
                <div className="text-3xl font-bold text-foreground mb-1">3 Tiers</div>
                <div className="text-muted-foreground text-sm">Confidence Levels</div>
              </div>
            </MagicCard>
            <MagicCard 
              className="animate-fade-in" 
              style={{ animationDelay: "0.7s" }}
              gradientColors={["hsl(187, 100%, 50%)", "hsl(220, 80%, 60%)", "hsl(260, 80%, 50%)"]}
            >
              <div className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-primary mb-2 mx-auto" />
                <div className="text-3xl font-bold text-foreground mb-1">12+ Sources</div>
                <div className="text-muted-foreground text-sm">Monitored 24/7</div>
              </div>
            </MagicCard>
            <MagicCard 
              className="animate-fade-in" 
              style={{ animationDelay: "0.8s" }}
              gradientColors={["hsl(20, 100%, 60%)", "hsl(51, 100%, 50%)", "hsl(187, 100%, 50%)"]}
            >
              <div className="p-6 text-center">
                <Shield className="w-8 h-8 text-tier-2 mb-2 mx-auto" />
                <div className="text-3xl font-bold text-foreground mb-1">32%</div>
                <div className="text-muted-foreground text-sm">Quality Filter</div>
              </div>
            </MagicCard>
          </div>
        </div>
      </div>
    </section>
  );
}
