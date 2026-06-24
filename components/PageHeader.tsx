"use client";
import { motion } from "framer-motion";

interface Props {
  badge: string;
  title: string;
  subtitle: string;
}

export default function PageHeader({ badge, title, subtitle }: Props) {
  return (
    <section className="relative overflow-hidden py-14 md:py-20 px-5 md:px-6"
      style={{ background: "linear-gradient(135deg, #EDE0F5 0%, #f8f4fc 60%, #ffffff 100%)" }}>
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "radial-gradient(circle, #D9C5E8 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl bg-turquoise/15"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl bg-mauve/15"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-lilac-dark rounded-full px-4 py-1.5 text-sm font-semibold text-mauve shadow-sm mb-6">
          {badge}
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
          style={{ background: "linear-gradient(135deg, #9B6B9B, #2EC4B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          {title}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
