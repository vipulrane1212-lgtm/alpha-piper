import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Shield, 
  Bot, 
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign
} from "lucide-react";

const Pipeline = () => {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Complete Trading Guide
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              🚀 Alert Pipeline
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A tiered strategy system for Solana memecoin trading
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Button asChild>
              <a href="https://t.me/solboy_calls" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                @solboy_calls
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://t.me/Plaguealertbot" target="_blank" rel="noopener noreferrer">
                <Bot className="w-4 h-4 mr-2" />
                @Plaguealertbot
              </a>
            </Button>
          </div>

          {/* What Makes This Different */}
          <div className="bg-card rounded-lg p-8 border border-border mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">🎯 What Makes This Different?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: CheckCircle, text: "Multi-Source Confirmation — Only alerts when multiple premium sources align" },
                { icon: Target, text: "Tiered Confidence Levels — Clear risk/reward classification (TIER 1/2/3)" },
                { icon: Clock, text: "Real-Time Monitoring — 12+ Telegram sources tracked 24/7" },
                { icon: Shield, text: "Selective Alerts — Quality over quantity, only high-probability setups" },
                { icon: Zap, text: "Themed Intro Paragraphs — 40 unique templates dynamically selected" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Process */}
          <div className="bg-card rounded-lg p-8 border border-border mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">⚙️ The Pipeline Process</h2>
            <div className="space-y-4">
              {[
                "XTRACK Signal Detected",
                "Token reaches 2x/3x on XTRACK (COHORT START)",
                "System checks for confirmations within ±30 minutes",
                "Entry MC validation (30K-150K range)",
                "Tier assignment based on criteria",
                "Alert formatted with themed intro",
                "Alert sent to subscribers",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tiered Strategy */}
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">🎯 Understanding Tiered Strategy</h2>
          
          {/* TIER 1 */}
          <div className="bg-card rounded-lg p-8 border border-tier-1/50 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-tier-1/20 text-tier-1 border-tier-1/30 text-lg px-4 py-1">
                🚀 TIER 1 ULTRA
              </Badge>
              <span className="text-muted-foreground">Highest Conviction</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Criteria:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✅ XTRACK ≥2x cohort detected</li>
                  <li>✅ Glydo Top 5 appearance (±20 min from cohort)</li>
                  <li>✅ ≥1 strong confirmation</li>
                  <li>✅ Entry MC: $40K - $100K</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">Trading Approach:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>⚡ Entry: As soon as alert received</li>
                  <li>💰 Position Size: 3-5% of capital</li>
                  <li>🎯 Target: 5x-10x+</li>
                </ul>
              </div>
            </div>
          </div>

          {/* TIER 2 */}
          <div className="bg-card rounded-lg p-8 border border-tier-2/50 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-tier-2/20 text-tier-2 border-tier-2/30 text-lg px-4 py-1">
                🔥 TIER 2 HIGH
              </Badge>
              <span className="text-muted-foreground">Strong Setup</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Criteria:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✅ XTRACK ≥2x cohort detected</li>
                  <li>✅ Glydo Top 5 appearance (±20 min from cohort)</li>
                  <li>✅ ≥1 confirmation (any type)</li>
                  <li>✅ Entry MC: $30K - $120K</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">Trading Approach:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>⚡ Entry: Within 2-3 minutes of alert</li>
                  <li>💰 Position Size: 2-3% of capital</li>
                  <li>🎯 Target: 4x-7x</li>
                </ul>
              </div>
            </div>
          </div>

          {/* TIER 3 */}
          <div className="bg-card rounded-lg p-8 border border-primary/50 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-lg px-4 py-1">
                ⚡ TIER 3 MEDIUM
              </Badge>
              <span className="text-muted-foreground">Good Opportunity</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Criteria:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✅ XTRACK ≥2x cohort detected</li>
                  <li>✅ ≥2 non-Glydo confirmations, OR</li>
                  <li>✅ Delayed Glydo appearance (&gt;30 min after cohort)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">Trading Approach:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>⚡ Entry: Within 3-5 minutes of alert</li>
                  <li>💰 Position Size: 1-2% of capital</li>
                  <li>🎯 Target: 3x-5x</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trading Workflow */}
          <div className="bg-card rounded-lg p-8 border border-border mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">📈 Trading Workflow</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-tier-1/20 text-tier-1 flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-foreground">Alert Received ⚡</h4>
                  <p className="text-muted-foreground">Check tier immediately. TIER 1 = highest priority, act fast.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-tier-1/20 text-tier-1 flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-foreground">Quick Checks (30 seconds) 🔍</h4>
                  <p className="text-muted-foreground">Copy contract, check current MC vs entry MC, verify not already 3x+.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-tier-2/20 text-tier-2 flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-foreground">Rugcheck (1 minute) 🛡️</h4>
                  <p className="text-muted-foreground">Verify: No honeypot, LP locked/burned, no mint function, owner renounced.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-tier-2/20 text-tier-2 flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <h4 className="font-semibold text-foreground">Chart Analysis (1-2 minutes) 📊</h4>
                  <p className="text-muted-foreground">Steady uptrend, healthy pullbacks, volume increasing, no major dumps.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">5</div>
                <div>
                  <h4 className="font-semibold text-foreground">Entry Decision 💰</h4>
                  <p className="text-muted-foreground">TIER 1: Enter immediately. TIER 2: Within 2-3 min. TIER 3: Within 3-5 min.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Commands */}
          <div className="bg-card rounded-lg p-8 border border-border mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">🤖 Bot Commands</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { cmd: "/start", desc: "Welcome message with quick actions" },
                { cmd: "/subscribe", desc: "Subscribe to receive alerts" },
                { cmd: "/unsubscribe", desc: "Stop receiving alerts" },
                { cmd: "/status", desc: "Check subscription status" },
                { cmd: "/set t1", desc: "Receive only TIER 1 alerts" },
                { cmd: "/set t1,t2", desc: "Receive TIER 1 and TIER 2" },
                { cmd: "/set all", desc: "Receive all tier alerts" },
                { cmd: "/help", desc: "Show help message" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <code className="bg-primary/20 text-primary px-2 py-1 rounded text-sm font-mono">{item.cmd}</code>
                  <span className="text-muted-foreground text-sm">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-card rounded-lg p-8 border border-border mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">⚠️ Risk Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-foreground mb-4">Position Sizing</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><span className="text-tier-1">TIER 1:</span> 3-5% of capital</li>
                  <li><span className="text-tier-2">TIER 2:</span> 2-3% of capital</li>
                  <li><span className="text-primary">TIER 3:</span> 1-2% of capital</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Profit Taking</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><span className="text-tier-2">2x:</span> Take 25-30% profit</li>
                  <li><span className="text-tier-1">3x:</span> Take another 25-30%</li>
                  <li><span className="text-primary">5x+:</span> Let the rest run</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Common Mistakes to Avoid
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>❌ FOMO Entry — Don't chase if already 3x+ from entry</li>
                <li>❌ No Rugcheck — Always verify before buying</li>
                <li>❌ Oversizing — Stick to position sizing rules</li>
                <li>❌ No Exit Plan — Always have an exit strategy</li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Start Trading?</h2>
            <p className="text-muted-foreground mb-6">Join the community and start receiving high-quality alerts.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <a href="https://t.me/solboy_calls" target="_blank" rel="noopener noreferrer">
                  Join @solboy_calls
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="https://t.me/Plaguealertbot" target="_blank" rel="noopener noreferrer">
                  Start @Plaguealertbot
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-8">
              ⚠️ Trading memecoins is high risk. Only trade with money you can afford to lose. This is not financial advice.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Pipeline;
