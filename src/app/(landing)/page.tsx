import Hero from "@/components/landing/Hero";
import RoleSelector from "@/components/landing/RoleSelector";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <RoleSelector />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
    </>
  );
}
