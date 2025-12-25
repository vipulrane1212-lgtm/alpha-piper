import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChevronDown } from "lucide-react";
import { GlassButton, GlassCard } from "@/components/ui/glass-tabs";

const faqs = [
  {
    question: "What is SolBoy Alerts?",
    answer:
      "SolBoy Alerts is a premium Solana memecoin trading alert service. We monitor 12+ premium Telegram sources and only send alerts when multiple sources align — when XTRACK, Glydo, whale wallets, and momentum all point in the same direction.",
  },
  {
    question: "How does the tier system work?",
    answer:
      "We use a 3-tier system: TIER 1 ULTRA (highest conviction with Glydo Top 5 + strong confirmations), TIER 2 HIGH (Glydo Top 5 + confirmations), and TIER 3 MEDIUM (multiple confirmations without Glydo or delayed Glydo). Each tier has different risk/reward profiles.",
  },
  {
    question: "What sources do you monitor?",
    answer:
      "We monitor 12+ premium sources including XTRACK SOL NEW, Glydo, WhaleBuy, SOL SB1, SOL SB/MB, Momentum Tracker, Large Buys Tracker, KOLscope, SpyDefi, Call Analyzer, PFBF Volume Alert, and Solana Early Trending.",
  },
  {
    question: "How do I subscribe?",
    answer:
      'Simply click the "Start Trading Now" button to open our Telegram bot (@solboy_calls), then use the /subscribe command. You can also add the bot to your group or channel using /addgroup or /addchannel.',
  },
  {
    question: "Can I filter alerts by tier?",
    answer:
      "Yes! Use the /set command to customize which tiers you receive. For example: /set t1 for only TIER 1 alerts, /set t1,t2 for TIER 1 and 2, or /set all for all tiers.",
  },
  {
    question: "What is the success rate?",
    answer:
      "Our system is designed for quality over quantity. We only alert on ~32% of tokens that pass through our monitoring system. TIER 1 alerts have the highest conviction, with multiple premium source confirmations.",
  },
  {
    question: "How quickly are alerts sent?",
    answer:
      "Alerts are sent in real-time as soon as our system detects multiple source confirmations. The confirmation window is ±30 minutes from the XTRACK cohort start, ensuring you get timely signals.",
  },
  {
    question: "Is there a trading guide?",
    answer:
      "Yes! We have a complete trading guide available. Check the bot's /help command or visit our guide link for detailed information on how to trade each tier, risk management, and best practices.",
  },
  {
    question: "Can I add the bot to my group?",
    answer:
      "Absolutely! Add @solboy_calls to your Telegram group or channel as an admin, then use /addgroup or /addchannel in that chat. The bot will start sending alerts there.",
  },
  {
    question: "What makes SolBoy different from other alert services?",
    answer:
      "We don't call everything. We wait for multiple premium sources to align before sending an alert. This multi-source confirmation approach means quality over quantity, giving you only the best opportunities.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about SolBoy Alerts
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <GlassCard
                key={index}
                variant="default"
                hover={false}
                className="overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="text-foreground font-semibold text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 text-muted-foreground border-t border-border/50">
                    {faq.answer}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <a href="https://t.me/solboy_calls" target="_blank" rel="noopener noreferrer">
              <GlassButton variant="primary" size="md">
                Contact Us on Telegram
              </GlassButton>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
