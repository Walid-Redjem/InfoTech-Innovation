import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import Marquee from "@/components/home/Marquee";
import AboutSection from "@/components/home/AboutSection";
import ServicesSection from "@/components/home/ServicesSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Marquee />
      <AboutSection />
      <ServicesSection />
    </>
  );
}
