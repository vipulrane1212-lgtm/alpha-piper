import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Trade Smarter?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join SolBoy Alerts and get multi-source confirmed trading signals delivered straight to your Telegram.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group text-lg px-8 shadow-lg shadow-primary/30" asChild>
              <a
                href="https://t.me/solboy_calls"
                target="_blank"
                rel="noopener noreferrer"
              >
                Start Trading Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <a
                href="https://telegra.ph/Solboy-Alert-Pipeline--Complete-Trading-Guide-12-23"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Trading Guide
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
