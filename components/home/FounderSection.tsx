"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { GraduationCap, X, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

export default function FounderSection() {
  const t = useTranslations("home.founder");
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="py-14 md:py-24 px-6 bg-gradient-to-br from-white to-lilac/30">
        <div className="max-w-md mx-auto">
          <span className="block text-center text-xs font-bold uppercase tracking-widest text-turquoise mb-6">
            {t("label")}
          </span>
          <AnimatedSection>
            <button
              onClick={() => setOpen(true)}
              className="w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-lilac-dark/20 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-lilac-dark/40 shrink-0 group-hover:border-turquoise/60 transition-colors duration-300">
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
              <h3 className="text-xl md:text-2xl font-bold text-mauve mb-1">{t("name")}</h3>
              <p className="text-turquoise font-semibold mb-4">{t("role")}</p>
              <p className="text-gray-500 italic text-sm md:text-base leading-relaxed mb-6">{t("tagline")}</p>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs md:text-sm mb-4">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>{t("credentials")}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-turquoise text-xs font-semibold opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                <Award className="w-3.5 h-3.5" />
                <span>{t("viewAchievements")}</span>
              </div>
            </button>
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
