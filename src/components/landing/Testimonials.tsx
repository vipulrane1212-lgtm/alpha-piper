import { Star } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";
import { AnimatedHeading } from "@/components/ui/animated-text";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useRef } from "react";

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
  {
    name: "MoonHunter",
    role: "Professional Trader",
    content: "Best Solana alert service I've used. The tier 1 calls are absolute gold. Made back my subscription in the first week.",
    rating: 5,
  },
  {
    name: "SolanaPro",
    role: "Crypto Analyst",
    content: "The real-time monitoring across 12+ sources is incredible. Never miss a good play anymore.",
    rating: 5,
  },
  {
    name: "CryptoKing",
    role: "Portfolio Manager",
    content: "Quality over quantity is exactly what I needed. The selective filtering saves me hours of research.",
    rating: 5,
  },
  {
    name: "DeFiMaster",
    role: "Yield Farmer",
    content: "The entry mcap tracking is a game-changer. I know exactly when to get in and out.",
    rating: 5,
  },
  {
    name: "SolanaBull",
    role: "Day Trader",
    content: "Been using this for 3 months now. Win rate is solid and the alerts are always timely.",
    rating: 5,
  },
  {
    name: "CryptoNinja",
    role: "Swing Trader",
    content: "The multi-source confirmation means I can trust the signals. No more chasing false pumps.",
    rating: 5,
  },
  {
    name: "SolanaElite",
    role: "Professional Trader",
    content: "Worth every penny. The tier system helps me focus on the highest conviction plays.",
    rating: 5,
  },
  {
    name: "DeFiWarrior",
    role: "Memecoin Investor",
    content: "Finally found an alert service that understands Solana. The quality is unmatched.",
    rating: 5,
  },
  {
    name: "CryptoVeteran",
    role: "Crypto Analyst",
    content: "The 24/7 monitoring across premium sources is exactly what I needed. Highly recommend!",
    rating: 5,
  },
];

export function Testimonials() {
  const itemBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle hover effect for background animation (desktop only) - inspired by CodePen
    if (window.innerWidth <= 768) return;

    const items = document.querySelectorAll('.testimonial-card');
    const itemBg = itemBgRef.current;
    if (!itemBg) return;

    const handleMouseEnter = function(this: Element) {
      const rect = this.getBoundingClientRect();
      const containerRect = (this.closest('.container') || document.body).getBoundingClientRect();
      
      itemBg.style.left = `${rect.left - containerRect.left + window.scrollX}px`;
      itemBg.style.top = `${rect.top - containerRect.top + window.scrollY}px`;
      itemBg.style.width = `${rect.width}px`;
      itemBg.style.height = `${rect.height}px`;
      itemBg.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      if (itemBg) {
        itemBg.style.opacity = '0';
      }
    };

    items.forEach((item) => {
      item.addEventListener('mouseenter', handleMouseEnter);
      item.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      items.forEach((item) => {
        item.removeEventListener('mouseenter', handleMouseEnter);
        item.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle background glow effects - matching other sections */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tier-1/5 rounded-full blur-3xl" />
      </div>

      {/* Animated background for hover effect (desktop) - CodePen style */}
      <div 
        ref={itemBgRef}
        className="hidden md:block item-bg absolute z-[5] transition-all duration-500 ease-out pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--tier-1) / 0.15))',
          borderRadius: '1rem',
          opacity: 0,
          boxShadow: '0 0 40px hsl(var(--primary) / 0.2)',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-12 relative z-20">
          <AnimatedHeading level={2} className="text-4xl md:text-5xl mb-4 relative z-30">
            What Traders Say
          </AnimatedHeading>
          <p className="text-xl text-foreground/80 relative z-30">Join thousands of satisfied traders</p>
        </AnimatedSection>

        <div className="relative z-10">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: 1,
            }}
            className="w-full max-w-7xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <div className="testimonial-card h-full group">
                    <div 
                      className="h-full p-6 md:p-8 transition-all duration-300 cursor-pointer relative overflow-hidden rounded-xl backdrop-blur-xl border"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderColor: 'hsl(var(--primary) / 0.3)',
                        boxShadow: '0 8px 32px -8px hsl(var(--primary) / 0.1), inset 0 1px 0 0 hsl(var(--primary) / 0.1)',
                      }}
                    >
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10 transition-all duration-500 rounded-xl" />
                      
                      {/* Neon border glow on hover */}
                      <div 
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          boxShadow: 'inset 0 0 20px hsl(var(--primary) / 0.2), 0 0 30px hsl(var(--primary) / 0.15)',
                        }}
                      />
                      
                      <div className="relative z-10">
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star 
                              key={i} 
                              className="w-5 h-5 fill-tier-1 text-tier-1 transition-transform duration-300 group-hover:scale-110" 
                            />
                          ))}
                        </div>
                        <p className="text-foreground/90 mb-6 text-base md:text-lg leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                          "{testimonial.content}"
                        </p>
                        <div className="mt-auto">
                          <div className="font-semibold text-foreground text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-foreground/60 mt-1">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 lg:-left-16 bg-card/80 backdrop-blur-md border-primary/50 hover:bg-card hover:border-primary hover:scale-110 transition-transform" />
            <CarouselNext className="hidden md:flex -right-12 lg:-right-16 bg-card/80 backdrop-blur-md border-primary/50 hover:bg-card hover:border-primary hover:scale-110 transition-transform" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
