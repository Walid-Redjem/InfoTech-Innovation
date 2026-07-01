import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import Marquee from "@/components/home/Marquee";
import AboutSection from "@/components/home/AboutSection";
import ServicesSection from "@/components/home/ServicesSection";
import FounderSection from "@/components/home/FounderSection";
import LocationSection from "@/components/home/LocationSection";
import WaveDivider from "@/components/WaveDivider";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WaveDivider fill="#ffffff" className="bg-[#0d0d1a]" />
      <StatsBar />
      <WaveDivider fill="#f9f6fc" flip />
      <Marquee />
      <WaveDivider fill="#ffffff" />
      <AboutSection />
      <WaveDivider fill="#f8f4fc" flip />
      <ServicesSection />
      <WaveDivider fill="#f8f4fc" flip />
      <FounderSection />
      <WaveDivider fill="#ffffff" />
      <LocationSection />
    </>
  );
}
