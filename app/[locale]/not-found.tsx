"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LocaleNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 bg-gradient-to-br from-lilac/30 to-white">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="text-center max-w-md">
        <p className="text-8xl font-black mb-4"
          style={{ background: "linear-gradient(135deg, #9B6B9B, #2EC4B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          404
        </p>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/"
            className="inline-block bg-gradient-to-r from-mauve to-turquoise text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg">
            Back to Home
          </Link>
          <Link href="/en/join"
            className="inline-block border-2 border-mauve text-mauve font-semibold px-8 py-3 rounded-full hover:bg-mauve hover:text-white transition-colors">
            Join Us
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
