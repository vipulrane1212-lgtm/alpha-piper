import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { StatsPreview } from "@/components/landing/StatsPreview";
import { RecentAlerts } from "@/components/landing/RecentAlerts";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <StatsPreview />
      <Features />
      <RecentAlerts />
      <Testimonials />
      <CTASection />
    </Layout>
  );
};

export default Index;
