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
      <WaveDivider fill="#C9B0DF" />
      <StatsBar />
      <WaveDivider fill="#C9B0DF" flip />
      <Marquee />
      <WaveDivider fill="#C9B0DF" />
      <AboutSection />
      <WaveDivider fill="#C9B0DF" flip />
      <ServicesSection />
      <WaveDivider fill="#C9B0DF" flip />
      <FounderSection />
      <WaveDivider fill="#C9B0DF" />
      <LocationSection />
    </>
  );
}
