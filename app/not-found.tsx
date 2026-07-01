"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #D9C5E8 0%, #D9C5E8 60%, #ffffff 100%)" }}>

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "radial-gradient(circle, #D9C5E8 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />

      {/* Floating blobs */}
      {[{ c: "bg-mauve/20", s: 300, x: "10%", y: "20%" }, { c: "bg-turquoise/15", s: 200, x: "75%", y: "65%" }].map((b, i) => (
        <motion.div key={i} className={`absolute rounded-full blur-3xl ${b.c} pointer-events-none`}
          style={{ width: b.s, height: b.s, left: b.x, top: b.y }}
          animate={{ y: [0, -20, 0] }} transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center max-w-lg">

        {/* Animated 404 */}
        <div className="relative mb-8 inline-block">
          <motion.p
            className="text-[10rem] md:text-[13rem] font-black leading-none select-none"
            style={{ background: "linear-gradient(135deg, #9B6B9B 30%, #2EC4B6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            404
          </motion.p>
          {/* Glitch lines */}
          {[30, 60, 75].map((top, i) => (
            <motion.div key={i} className="absolute left-0 right-0 h-[2px] bg-turquoise/30 pointer-events-none"
              style={{ top: `${top}%` }}
              animate={{ x: [0, -8, 6, 0], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 + i * 1.5, ease: "linear" }} />
          ))}
        </div>

        {/* Robot / astronaut SVG illustration */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="text-7xl mb-6 select-none"
        >
          🤖
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          Oops, page not found
        </h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-mauve to-turquoise text-white font-semibold px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity shadow-xl shadow-mauve/20">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <button onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 bg-white border-2 border-mauve text-mauve font-semibold px-7 py-3.5 rounded-full hover:bg-mauve hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
