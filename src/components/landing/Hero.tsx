import { ArrowRight, Zap, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import solboyBanner from "@/assets/solboy-banner.jpg";

// Solana token logos with low density
const solanaTokens = [
  { logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png", delay: 0, duration: 25, left: "8%", size: 32 },
  { logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png", delay: 4, duration: 28, left: "25%", size: 28 },
  { logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png", delay: 2, duration: 22, left: "50%", size: 30 },
  { logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png", delay: 6, duration: 26, left: "72%", size: 26 },
  { logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr/logo.png", delay: 3, duration: 30, left: "90%", size: 28 },
];

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Banner background with reduced opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: `url(${solboyBanner})` }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      {/* Animated glow elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-tier-1/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>


      {/* Floating Solana tokens */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {solanaTokens.map((token, index) => (
          <div
            key={index}
            className="absolute animate-float opacity-40"
            style={{
              left: token.left,
              width: token.size,
              height: token.size,
              animationDuration: `${token.duration}s`,
              animationDelay: `${token.delay}s`,
            }}
          >
            <img 
              src={token.logo} 
              alt="Solana token" 
              className="w-full h-full rounded-full"
            />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20 backdrop-blur-sm">
              🚀 Solana Memecoin Alpha
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <span className="text-primary">SolBoy</span>{" "}
            <span className="text-foreground">Alerts</span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground mb-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Multi-Source Confirmed Trading Signals
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Get real-time alerts when XTRACK, Glydo, whale wallets, and momentum all align.
            Quality over quantity — only the best opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <Button size="lg" className="group text-lg px-8 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105" asChild>
              <a
                href="https://t.me/solboy_calls"
                target="_blank"
                rel="noopener noreferrer"
              >
                Start Trading Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 backdrop-blur-sm transition-all duration-300 hover:scale-105" asChild>
              <a href="/about">Learn More</a>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: "0.6s" }}>
              <Zap className="w-8 h-8 text-tier-1 mb-2 mx-auto" />
              <div className="text-3xl font-bold text-foreground mb-1">3 Tiers</div>
              <div className="text-muted-foreground text-sm">Confidence Levels</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: "0.7s" }}>
              <TrendingUp className="w-8 h-8 text-primary mb-2 mx-auto" />
              <div className="text-3xl font-bold text-foreground mb-1">12+ Sources</div>
              <div className="text-muted-foreground text-sm">Monitored 24/7</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border animate-fade-in hover:scale-105 transition-transform duration-300" style={{ animationDelay: "0.8s" }}>
              <Shield className="w-8 h-8 text-tier-2 mb-2 mx-auto" />
              <div className="text-3xl font-bold text-foreground mb-1">32%</div>
              <div className="text-muted-foreground text-sm">Quality Filter</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
