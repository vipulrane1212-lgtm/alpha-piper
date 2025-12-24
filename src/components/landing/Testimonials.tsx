import { Star } from "lucide-react";
import { AnimatedSection, AnimatedCard } from "@/components/ui/animated-section";

const testimonials = [
  {
    name: "CryptoWhale",
    role: "Day Trader",
    content: "SolBoy Alerts changed my trading game. The tier system makes it easy to know which calls to prioritize.",
    rating: 5,
  },
  {
    name: "DeFiDegen",
    role: "Memecoin Investor",
    content: "Finally, an alert service that doesn't spam you. Quality over quantity is real here.",
    rating: 5,
  },
  {
    name: "SolanaMax",
    role: "Swing Trader",
    content: "The multi-source confirmation approach is genius. Way fewer false signals than other services.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Traders Say
          </h2>
          <p className="text-xl text-muted-foreground">Join thousands of satisfied traders</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <AnimatedCard
              key={testimonial.name}
              delay={index * 150}
              className="bg-card rounded-lg p-6 border border-border hover:border-tier-1/50"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-tier-1 text-tier-1 transition-transform duration-300 hover:scale-125" />
                ))}
              </div>
              <p className="text-foreground mb-4">"{testimonial.content}"</p>
              <div>
                <div className="font-semibold text-foreground">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
