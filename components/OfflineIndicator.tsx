"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineIndicator() {
  const [offline, setOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => {
      setOffline(false);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 2500);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => { window.removeEventListener("offline", goOffline); window.removeEventListener("online", goOnline); };
  }, []);

  return (
    <AnimatePresence>
      {(offline || justReconnected) && (
        <motion.div
          initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed top-16 inset-x-0 z-[600] flex justify-center pointer-events-none"
        >
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg text-sm font-semibold text-white ${offline ? "bg-red-500" : "bg-turquoise"}`}>
            {offline ? <><WifiOff className="w-4 h-4" /> No internet connection</> : <><Wifi className="w-4 h-4" /> Back online!</>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
