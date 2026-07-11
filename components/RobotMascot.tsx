"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { X } from "lucide-react";

const POS_KEY = "mascot-pos";
const HIDDEN_KEY = "mascot-hidden";

export default function RobotMascot() {
  const t = useTranslations("mascot");
  const messages = t.raw("messages") as string[];
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [constraints, setConstraints] = useState({ left: 8, top: 8, right: 200, bottom: 200 });

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // initial position: restore from localStorage, or default to a bottom corner
  useEffect(() => {
    if (localStorage.getItem(HIDDEN_KEY)) setHidden(true);

    const w = ref.current?.offsetWidth ?? 80;
    const h = ref.current?.offsetHeight ?? 96;

    const saved = localStorage.getItem(POS_KEY);
    if (saved) {
      try {
        const { x: sx, y: sy } = JSON.parse(saved);
        x.set(sx);
        y.set(sy);
      } catch {
        x.set(isRTL ? window.innerWidth - w - 24 : 24);
        y.set(window.innerHeight - h - 24);
      }
    } else {
      x.set(isRTL ? window.innerWidth - w - 24 : 24);
      y.set(window.innerHeight - h - 24);
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function updateConstraints() {
      const w = ref.current?.offsetWidth ?? 80;
      const h = ref.current?.offsetHeight ?? 96;
      setConstraints({
        left: 8,
        top: 8,
        right: window.innerWidth - w - 8,
        bottom: window.innerHeight - h - 8,
      });
    }
    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [messages.length]);

  function persistPos() {
    localStorage.setItem(POS_KEY, JSON.stringify({ x: x.get(), y: y.get() }));
  }

  function hide() {
    localStorage.setItem(HIDDEN_KEY, "1");
    setHidden(true);
  }

  function reopen() {
    localStorage.removeItem(HIDDEN_KEY);
    setHidden(false);
  }

  const showMascot = scrolled && ready && !hidden;
  const showToggle = ready && hidden;

  return (
    <>
      <AnimatePresence>
        {showMascot && (
          <motion.div
            ref={ref}
            style={{ x, y, touchAction: "none", userSelect: "none", WebkitUserSelect: "none" }}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={constraints}
            onDragStart={() => { document.body.style.userSelect = "none"; }}
            onDragEnd={() => { document.body.style.userSelect = ""; persistPos(); }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            className="fixed top-0 left-0 z-40 w-16 h-20 md:w-20 md:h-24 cursor-grab active:cursor-grabbing select-none"
          >
            {/* Speech bubble */}
            <div className="absolute bottom-full start-0 mb-3 pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={msgIndex}
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative max-w-[160px] sm:max-w-[190px] bg-white rounded-2xl rounded-es-sm shadow-lg border border-gray-100 px-3 py-2"
                >
                  <p className="text-xs font-medium text-gray-700 leading-snug">
                    {messages[msgIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Hide button */}
            <AnimatePresence>
              {hovered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={hide}
                  aria-label="Hide"
                  className="absolute -top-1.5 -end-1.5 z-10 w-5 h-5 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full drop-shadow-xl pointer-events-none"
            >
              <Image
                src="/RobotFollow.png"
                alt=""
                fill
                sizes="80px"
                className="object-contain"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reopen toggle, shown while the mascot is hidden */}
      <AnimatePresence>
        {showToggle && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={reopen}
            aria-label="Show mascot"
            className="fixed bottom-24 start-6 z-40 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
          >
            <Image
              src="/RobotFollow.png"
              alt=""
              width={44}
              height={44}
              className="object-contain scale-125 translate-y-1"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
