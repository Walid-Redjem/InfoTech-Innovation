import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import Marquee from "@/components/home/Marquee";
import AboutSection from "@/components/home/AboutSection";
import ServicesSection from "@/components/home/ServicesSection";
import WaveDivider from "@/components/WaveDivider";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WaveDivider fill="#ffffff" />
      <StatsBar />
      <WaveDivider fill="#f9f6fc" flip />
      <Marquee />
      <WaveDivider fill="#ffffff" />
      <AboutSection />
      <WaveDivider fill="#f8f4fc" flip />
      <ServicesSection />
    </>
  );
}
