"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { GraduationCap, X, Award, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

export default function FounderSection() {
  const t = useTranslations("home.founder");
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white px-4 py-2 rounded-full"
              style={{ background: "linear-gradient(135deg, #4A1880, #7B45A8)" }}>
              <Sparkles className="w-3.5 h-3.5" />
              {t("label")}
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </motion.div>

          <AnimatedSection>
            <motion.button
              onClick={() => setOpen(true)}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full cursor-pointer group relative"
              style={{ borderRadius: "28px" }}
            >
              {/* Outer glow that intensifies on hover */}
              <motion.div
                className="absolute inset-0 rounded-[28px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, #6B35A0, #2EC4B6)",
                  filter: "blur(24px)",
                  transform: "scale(1.08) translateY(8px)",
                }}
              />

              {/* Card */}
              <div className="relative rounded-[28px] overflow-hidden bg-white">

                {/* Header banner */}
                <div className="relative h-28 overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #4A1880 0%, #7B45A8 55%, #2EC4B6 100%)" }}>
                  {/* Animated shimmer */}
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", width: "50%" }}
                  />
                  {/* Decorative circles */}
                  <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-25 blur-xl"
                    style={{ background: "#2EC4B6" }} />
                  <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-20 blur-xl"
                    style={{ background: "#fff" }} />
                  {/* Stars */}
                  {[{ x: "20%", y: "30%", s: 2 }, { x: "75%", y: "20%", s: 1.5 }, { x: "85%", y: "65%", s: 2.5 }, { x: "40%", y: "70%", s: 1.5 }].map((star, i) => (
                    <motion.div key={i}
                      className="absolute rounded-full bg-white"
                      style={{ left: star.x, top: star.y, width: star.s, height: star.s }}
                      animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] }}
                      transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                    />
                  ))}
                </div>

                {/* Photo — overlapping the banner */}
                <div className="flex justify-center -mt-14 mb-4 relative z-10">
                  <motion.div
                    animate={{ boxShadow: ["0 0 0 0 rgba(46,196,182,0)", "0 0 0 8px rgba(46,196,182,0.2)", "0 0 0 0 rgba(46,196,182,0)"] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="rounded-full"
                  >
                    <div className="p-[3px] rounded-full"
                      style={{ background: "linear-gradient(135deg, #6B35A0, #2EC4B6)" }}>
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white">
                        <Image
                          src="/Hayet.jpeg"
                          alt={t("name")}
                          width={112}
                          height={112}
                          className="w-full h-full object-cover scale-110"
                          style={{ objectPosition: "center 8%" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 text-center">
                  <h3 className="text-xl md:text-2xl font-bold mb-1"
                    style={{ background: "linear-gradient(135deg, #4A1880, #9B6B9B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {t("name")}
                  </h3>

                  <p className="font-semibold mb-5 text-sm" style={{ color: "#2EC4B6" }}>{t("role")}</p>

                  <p className="text-gray-500 italic text-sm md:text-base leading-relaxed mb-6">{t("tagline")}</p>

                  <div className="flex items-center justify-center gap-2 text-gray-400 text-xs md:text-sm mb-6">
                    <GraduationCap className="w-4 h-4 shrink-0 text-mauve" />
                    <span>{t("credentials")}</span>
                  </div>

                  {/* CTA button */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-turquoise/30"
                      style={{ background: "linear-gradient(135deg, #6B35A0, #2EC4B6)" }}>
                      <Award className="w-4 h-4" />
                      {t("viewAchievements")}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          </AnimatedSection>
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-lg w-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="overflow-y-auto max-h-[90vh]">
                <Image
                  src="/History.png"
                  alt={t("name") + " achievements"}
                  width={1492}
                  height={2110}
                  className="w-full h-auto block"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
