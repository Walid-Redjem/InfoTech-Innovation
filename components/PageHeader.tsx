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

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-lilac-dark rounded-full px-4 py-1.5 text-sm font-semibold text-mauve shadow-sm mb-6">
          {badge}
        </motion.div>

        {/* Title — word by word */}
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight flex flex-wrap justify-center gap-x-3 gap-y-1">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
              style={{ background: "linear-gradient(135deg, #9B6B9B, #2EC4B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle — word by word, slower */}
        <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto flex flex-wrap justify-center gap-x-1.5">
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
