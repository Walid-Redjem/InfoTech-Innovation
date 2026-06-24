"use client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const wordsEn = ["Community", "Future", "Education", "Society", "Tomorrow"];
const wordsAr = ["المجتمع", "المستقبل", "التعليم", "الجيل القادم", "غدٍ أفضل"];

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 17 + 13) % 100,
  y: (i * 23 + 7) % 100,
  size: 2 + (i % 5),
  duration: 5 + (i % 7),
  delay: (i * 0.35) % 4,
}));

const floatingShapes = [
  { size: 350, x: "70%", y: "-15%", color: "bg-turquoise/15", duration: 9 },
  { size: 250, x: "-8%", y: "55%", color: "bg-mauve/15", duration: 11 },
  { size: 180, x: "80%", y: "60%", color: "bg-lilac-dark/30", duration: 8 },
];

export default function Hero() {
  const t = useTranslations("home.hero");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const words = isRTL ? wordsAr : wordsEn;

  const [wordIndex, setWordIndex] = useState(0);
  const [glitching, setGlitching] = useState(false);

  const { scrollY } = useScroll();
  const blobY    = useTransform(scrollY, [0, 600], [0, -180]);
  const contentY = useTransform(scrollY, [0, 600], [0, -80]);
  const bgY      = useTransform(scrollY, [0, 600], [0, -30]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    let offTimeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    function runGlitch() {
      setGlitching(true);
      offTimeout = setTimeout(() => setGlitching(false), 450);
    }

    const initial = setTimeout(() => {
      runGlitch();
      interval = setInterval(runGlitch, 3000);
    }, 1300);

    return () => {
      clearTimeout(initial);
      clearTimeout(offTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center py-16 md:py-20 px-5 md:px-6">

      {/* Video background — drop your video file at /public/hero.mp4 */}
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Fallback dark gradient (shows when no video) */}
      <div className="absolute inset-0 z-[1]"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #0d1a2e 50%, #0a2a2a 100%)" }} />

      {/* Dark overlay on top of video for text readability */}
      <div className="absolute inset-0 z-[2] bg-black/55" />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30 z-[3]"
        animate={{ background: [
          "radial-gradient(ellipse at 20% 50%, #8B2FC944 0%, transparent 60%)",
          "radial-gradient(ellipse at 80% 20%, #00BFFF33 0%, transparent 60%)",
          "radial-gradient(ellipse at 50% 80%, #8B2FC944 0%, transparent 60%)",
          "radial-gradient(ellipse at 20% 50%, #8B2FC944 0%, transparent 60%)",
        ]}}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Scanning beam */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] pointer-events-none z-[10]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(46,196,182,0.95) 50%, rgba(255,255,255,0.4) 80%, transparent 100%)",
          boxShadow: "0 0 14px rgba(46,196,182,0.9), 0 0 40px rgba(46,196,182,0.4)",
        }}
        animate={{ y: ["-10px", "95vh"] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 6, ease: "linear" }}
      />

      {/* Dot grid — slow parallax */}
      <motion.div className="absolute inset-0 opacity-10 z-[4]" style={{ y: bgY,
        backgroundImage: "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px" }} />

      {/* Floating blobs — fast parallax */}
      <motion.div className="absolute inset-0 pointer-events-none z-[4]" style={{ y: blobY }}>
        {floatingShapes.map((shape, i) => (
          <motion.div key={i}
            className={`absolute rounded-full blur-3xl ${shape.color}`}
            style={{ width: shape.size, height: shape.size, left: shape.x, top: shape.y }}
            animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
            transition={{ duration: shape.duration, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
          />
        ))}
      </motion.div>

      {/* Particles — mid parallax */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: blobY }}>
        {particles.map((p) => (
          <motion.div key={p.id}
            className="absolute rounded-full bg-mauve/30"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -40, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      <motion.div className="relative max-w-5xl mx-auto text-center w-full z-[10]" style={{ y: contentY }}>
        <div className="px-6 py-10 md:px-14 md:py-14">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium text-white shadow-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-turquoise" />
          {locale === "ar" ? "منصة ابتكار مجتمعي" : "Community Innovation Platform"}
        </motion.div>

        {/* Title with glitch */}
        <div className={glitching ? "glitch-title" : ""}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-bold mb-4 leading-tight tracking-tight"
            style={{ background: "linear-gradient(135deg, #8B2FC9 0%, #00BFFF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
          >
            {t("title")}
          </motion.h1>
        </div>

        {/* Typewriter line */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-base md:text-2xl font-semibold text-white/80 mb-4 h-8 md:h-10 flex items-center justify-center gap-2 flex-wrap"
        >
          <span>{locale === "ar" ? "من أجل" : "Building a better"}</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="text-turquoise font-bold"
            >
              {words[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-base md:text-lg text-white/60 mb-12 max-w-xl mx-auto leading-relaxed"
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
            { label: t("cta_join"), href: "/join", style: "bg-mauve text-white shadow-xl shadow-mauve/30 hover:bg-mauve-dark hover:shadow-mauve/50", arrow: true, primary: true },
            { label: t("cta_issue"), href: "/issues", style: "bg-white border-2 border-mauve text-mauve hover:bg-mauve hover:text-white shadow-lg shadow-mauve/10" },
            { label: t("cta_idea"), href: "/issues", style: "bg-turquoise/10 border-2 border-turquoise text-turquoise hover:bg-turquoise hover:text-white shadow-lg shadow-turquoise/10" },
          ].map((btn) => (
            <motion.div key={btn.label} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
              {btn.primary ? (
                <div className="gradient-border-outer">
                  <Link href={`/${locale}${btn.href}`}
                    className={`gradient-border-inner inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all ${btn.style}`}>
                    {btn.label}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                  </Link>
                </div>
              ) : (
                <Link href={`/${locale}${btn.href}`}
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all ${btn.style}`}>
                  {btn.label}
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 flex flex-col items-center gap-1"
        >
          <span className="text-xs text-white/40 tracking-widest uppercase">
            {locale === "ar" ? "اكتشف" : "Scroll"}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-[2px] h-8 bg-gradient-to-b from-mauve to-transparent rounded-full"
          />
        </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
