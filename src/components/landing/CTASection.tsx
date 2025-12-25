import { ArrowRight } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-tabs";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedHeading } from "@/components/ui/animated-text";

export function CTASection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <AnimatedHeading level={2} className="text-4xl md:text-5xl mb-6">
            Ready to Trade Smarter?
          </AnimatedHeading>
          <p className="text-xl text-foreground/80 mb-8">
            Join SolBoy Alerts and get multi-source confirmed trading signals delivered straight to your Telegram.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
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
            <a
              href="https://telegra.ph/Solboy-Alert-Pipeline--Complete-Trading-Guide-12-23"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GlassButton variant="secondary" size="lg">
                Read Trading Guide
              </GlassButton>
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
