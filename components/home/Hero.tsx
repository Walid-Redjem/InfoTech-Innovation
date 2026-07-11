"use client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const wordsEn = ["Community", "Future", "Education", "Society", "Tomorrow"];
const wordsAr = ["المجتمع", "المستقبل", "التعليم", "الجيل القادم", "غدٍ أفضل"];

export default function Hero() {
  const t = useTranslations("home.hero");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const words = isRTL ? wordsAr : wordsEn;

  const [wordIndex, setWordIndex] = useState(0);
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 600], [0, -80]);
  const bgY = useTransform(scrollY, [0, 600], [0, -20]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center py-16 md:py-20 px-5 md:px-6">

      {/* Background image */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <Image
          src="/Home1.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/5" />

      <motion.div className="relative max-w-4xl mx-auto text-center w-full" style={{ y: contentY }}>
        <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl px-6 py-10 md:px-12 md:py-12 shadow-2xl shadow-black/10">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-4 py-1.5 text-sm font-medium shadow-sm mb-8"
          style={{ color: "#4338CA" }}
        >
          <Sparkles className="w-4 h-4 text-turquoise" />
          {locale === "ar" ? "منصة ابتكار مجتمعي" : "Community Innovation Platform"}
        </motion.div>

        {/* Title */}
        <h1
          className="text-5xl md:text-7xl font-bold mb-4 leading-tight tracking-tight"
          style={{ background: "linear-gradient(90deg, #4338CA 0%, #3B82F6 55%, #38BDF8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
        >
          {t("title")}
        </h1>

        {/* Typewriter line */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-base md:text-2xl font-semibold mb-4 h-8 md:h-10 flex items-center justify-center gap-2 flex-wrap" style={{ color: "#1E1B3C" }}
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
                className="font-bold inline-block" style={{ color: "#5B21B6" }}
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
          className="text-base md:text-lg mb-12 max-w-xl mx-auto leading-relaxed" style={{ color: "#374151" }}
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
            { label: t("cta_join"), href: "/join", style: "bg-gradient-to-r from-[#4338CA] to-[#38BDF8] text-white shadow-xl shadow-indigo-900/20 hover:opacity-90 hover:shadow-indigo-900/30", arrow: true, primary: true },
            { label: t("cta_voice"), href: "/issues", style: "bg-white border border-indigo-100 hover:bg-gradient-to-r hover:from-[#4338CA] hover:to-[#38BDF8] hover:text-white hover:border-transparent shadow-lg shadow-black/5", textColor: "#4338CA" },
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
                  style={{ color: btn.textColor }}
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
          <span className="text-xs text-gray-400 tracking-widest uppercase">
            {locale === "ar" ? "اكتشف" : "Scroll"}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-[2px] h-8 rounded-full"
            style={{ background: "linear-gradient(to bottom, #5B21B6, transparent)" }}
          />
        </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
