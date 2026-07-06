"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-lilac/30 to-white">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h1>
        <p className="text-gray-500 mb-8">An unexpected error occurred. Please try again.</p>
        <button onClick={reset}
          className="text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg"
          style={{ background: "linear-gradient(to right, #6D28D9, #4FC3E8)" }}>
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
