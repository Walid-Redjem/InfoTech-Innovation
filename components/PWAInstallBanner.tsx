"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pwa_dismissed")) return;
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e as BeforeInstallPromptEvent); setVisible(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setVisible(false);
  }

  function dismiss() {
    setVisible(false);
    localStorage.setItem("pwa_dismissed", "1");
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed bottom-20 md:bottom-6 start-4 end-4 md:start-auto md:end-6 md:w-80 z-[300] bg-white rounded-2xl shadow-2xl shadow-black/15 border border-lilac-dark/20 p-4"
        >
          <button onClick={dismiss} className="absolute top-3 end-3 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-lilac-dark/30 p-1.5 flex-shrink-0">
              <Image src="/logo.png" alt="InfoTech" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">InfoTech Innovation</p>
              <p className="text-xs text-gray-400 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Add to home screen</p>
            </div>
          </div>
          <button onClick={install}
            className="w-full text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-md shadow-mauve/20"
            style={{ background: "linear-gradient(to right, #6D28D9, #4FC3E8)" }}>
            Install App
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
