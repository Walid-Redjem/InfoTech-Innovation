"use client";
import { motion } from "framer-motion";

interface Props {
  badge: string;
  title: string;
  subtitle: string;
}

export default function PageHeader({ badge, title, subtitle }: Props) {
  const words = title.split(" ");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-mauve via-[#6b3fa0] to-turquoise-dark py-20 md:py-24 px-5 md:px-6 text-center">
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-15"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Blobs */}
      <motion.div
        className="absolute top-[-60px] left-[-60px] w-72 h-72 rounded-full bg-mauve/40 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-turquoise/30 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Glowing badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block text-xs font-bold uppercase tracking-widest text-white/90 bg-white/10 border border-white/25 px-4 py-1.5 rounded-full mb-6"
          style={{ boxShadow: "0 0 20px rgba(255,255,255,0.15)" }}
        >
          {badge}
        </motion.div>

        {/* Title — word by word */}
        <h1 className="text-3xl md:text-5xl font-bold mb-5 leading-tight flex flex-wrap justify-center gap-x-3 gap-y-1">
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
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-white/60 text-base md:text-lg leading-relaxed max-w-xl mx-auto"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
