"use client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const wordsEn = ["Community", "Future", "Education", "Society", "Tomorrow"];
const wordsAr = ["المجتمع", "المستقبل", "التعليم", "الجيل القادم", "غدٍ أفضل"];

const particles = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 13 + 7) % 100,
  y: (i * 19 + 11) % 100,
  size: i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
  color: i % 3 === 0 ? "#2EC4B6" : i % 2 === 0 ? "#9B6B9B" : "#ffffff",
  duration: 4 + (i % 8),
  delay: (i * 0.3) % 5,
  glow: i % 5 === 0,
}));

const blobs = [
  { size: 500, x: "65%", y: "-20%", color: "#2EC4B6", opacity: 0.12, duration: 10 },
  { size: 400, x: "-10%", y: "45%", color: "#7B45A8", opacity: 0.15, duration: 13 },
  { size: 300, x: "75%", y: "55%", color: "#9B6B9B", opacity: 0.1, duration: 9 },
];

export default function Hero() {
  const t = useTranslations("home.hero");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const words = isRTL ? wordsAr : wordsEn;

  const [wordIndex, setWordIndex] = useState(0);
  const { scrollY } = useScroll();
  const blobY    = useTransform(scrollY, [0, 600], [0, -160]);
  const contentY = useTransform(scrollY, [0, 600], [0, -70]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#0d0d1a";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  return (
    <section
      className="relative overflow-hidden min-h-screen flex items-center py-16 md:py-20 px-5 md:px-6 -mt-20 pt-20"
      style={{ background: "#0d0d1a" }}
    >
      {/* Ambient blobs */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: blobY }}>
        {blobs.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: b.size, height: b.size,
              left: b.x, top: b.y,
              background: b.color,
              opacity: b.opacity,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [b.opacity, b.opacity * 1.6, b.opacity] }}
            transition={{ duration: b.duration, repeat: Infinity, ease: "easeInOut", delay: i * 2 }}
          />
        ))}
      </motion.div>

      {/* Scanning beam */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, #2EC4B6, #7B45A8, transparent)", opacity: 0.4 }}
        animate={{ top: ["10%", "90%", "10%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: p.color,
              boxShadow: p.glow ? `0 0 6px 2px ${p.color}` : undefined,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div className="relative max-w-4xl mx-auto text-center w-full" style={{ y: contentY }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-white/70 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-turquoise animate-pulse shrink-0" />
          {locale === "ar" ? "منصة ابتكار مجتمعي · الجزائر" : "Community Innovation Platform · Algeria"}
        </motion.div>

        {/* Title */}
        <h1
          className="text-5xl md:text-7xl font-bold mb-5 leading-tight tracking-tight"
          style={{ background: "linear-gradient(135deg, #c084fc 0%, #818cf8 40%, #2EC4B6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
        >
          {t("title")}
        </h1>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-base md:text-2xl font-semibold text-white mb-4 h-8 md:h-10 flex items-center justify-center gap-2 flex-wrap"
        >
          <span>{locale === "ar" ? "من أجل" : "Building a better"}</span>
          <span className="overflow-hidden inline-flex items-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="text-turquoise font-bold inline-block"
              >
                {words[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-base md:text-lg mb-12 max-w-xl mx-auto leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {t("subtitle")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {[
            { label: t("cta_join"), href: "/join", style: "bg-gradient-to-r from-mauve to-turquoise text-white shadow-xl shadow-mauve/30 hover:opacity-90", arrow: true },
            { label: t("cta_issue"), href: "/issues", style: "border border-white/20 text-white/80 hover:bg-white/10 backdrop-blur-sm" },
            { label: t("cta_idea"), href: "/issues", style: "border border-white/20 text-white/80 hover:bg-white/10 backdrop-blur-sm" },
          ].map((btn, idx) => (
            <motion.div key={btn.label} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
              <Link href={`/${locale}${btn.href}`}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all ${btn.style}`}>
                {btn.label}
                {idx === 0 && <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 flex flex-col items-center gap-1"
        >
          <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
            {locale === "ar" ? "اكتشف" : "Scroll"}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-[2px] h-8 rounded-full"
            style={{ background: "linear-gradient(to bottom, #2EC4B6, transparent)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
