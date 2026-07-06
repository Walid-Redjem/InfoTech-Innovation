"use client";
import { motion } from "framer-motion";

interface Props {
  badge: string;
  title: string;
  subtitle: string;
}

export default function PageHeader({ badge, title, subtitle }: Props) {
  const words = title.split(" ");
  const subWords = subtitle.split(" ");

  return (
    <section className="relative overflow-hidden py-14 md:py-20 px-5 md:px-6"
      style={{ background: "linear-gradient(to right, #6B35A0 0%, #7B45A8 65%, #29B6F6 100%)" }}>
      <div className="relative max-w-3xl mx-auto text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-sm mb-6">
          {badge}
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight flex flex-wrap justify-center gap-x-3 gap-y-1">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block text-white"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="text-lg leading-relaxed max-w-xl mx-auto flex flex-wrap justify-center gap-x-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
          {subWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.04, ease: "easeOut" }}
              className="inline-block"
            >
              {word}
            </motion.span>
          ))}
        </p>
      </div>
    </section>
  );
}
