import { ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle background glow effects - matching other sections */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tier-1/5 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="max-w-4xl mx-auto">
          {/* Action Card - Inspired by CodePen design */}
          <div className="p-1 rounded-md bg-gradient-to-r from-[#14F195] via-[#9945FF] to-[#00D9FF] shadow-2xl shadow-[#9945FF]/30">
            <div className="bg-background rounded-md border border-white/20">
              <div className="rounded-md p-8 md:p-10 bg-gradient-to-r from-[#14F195]/30 via-[#9945FF]/30 to-[#00D9FF]/30">
                <div className="md:flex items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                      Ready to Trade Smarter?
                    </h3>
                    <p className="text-foreground/90 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                      Join SolBoy Alerts and get multi-source confirmed trading signals delivered straight to your Telegram.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-0">
                    <a
                      href="https://t.me/solboy_calls"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center leading-none text-[#14F195] bg-[#14F195]/30 rounded px-6 py-3 text-sm font-medium ease-in-out transition-all duration-300 hover:bg-[#14F195]/60 hover:text-[#19FB9B]"
                    >
                      <span>Start Trading Now</span>
                      <ArrowRight className="h-4 w-4 ml-2 ease-in-out transition-all duration-300 group-hover:translate-x-1" />
                    </a>
                    <a
                      href="/pipeline"
                      className="group flex items-center justify-center leading-none text-[#9945FF] bg-[#9945FF]/30 rounded px-6 py-3 text-sm font-medium ease-in-out transition-all duration-300 hover:bg-[#9945FF]/60 hover:text-[#B366FF]"
                    >
                      <span>Read Trading Guide</span>
                      <ArrowRight className="h-4 w-4 ml-2 ease-in-out transition-all duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
