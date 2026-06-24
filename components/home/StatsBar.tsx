"use client";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, useInView } from "framer-motion";
import { UserCheck, Rocket, Globe } from "lucide-react";

function useScramble(target: number, inView: boolean) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!inView) return;
    if (target === 0) { setDisplay("0"); return; }
    const digits = String(target).length;
    let frame = 0;
    const totalFrames = 22;
    const timer = setInterval(() => {
      frame++;
      if (frame >= totalFrames) {
        setDisplay(String(target));
        clearInterval(timer);
      } else {
        const rand = Math.floor(Math.random() * Math.pow(10, digits));
        setDisplay(String(rand).padStart(digits, "0").slice(0, digits));
      }
    }, 55);
    return () => clearInterval(timer);
  }, [target, inView]);
  return display;
}

const icons = [UserCheck, Rocket, Globe];

export default function StatsBar() {
  const t = useTranslations("home.stats");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [stats, setStats] = useState({ participants: 0, projects: 0, partners: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [a, b, c] = await Promise.all([
          getCountFromServer(collection(db, "registrations")),
          getCountFromServer(collection(db, "activities")),
          getCountFromServer(query(collection(db, "registrations"), where("category", "==", "institution"))),
        ]);
        setStats({ participants: a.data().count, projects: b.data().count, partners: c.data().count });
      } catch { }
    }
    fetchStats();
  }, []);

  const values = [stats.participants, stats.projects, stats.partners];
  const labels = [t("participants"), t("projects"), t("partners")];

  const p = useScramble(values[0], inView);
  const pr = useScramble(values[1], inView);
  const pa = useScramble(values[2], inView);
  const counts = [p, pr, pa];

  return (
    <section ref={ref} className="py-10 md:py-16 px-4 md:px-6 bg-white">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3 md:gap-6">
        {counts.map((count, i) => {
          const Icon = icons[i];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(155,107,155,0.15)" }}
              className="bg-gradient-to-br from-lilac to-white rounded-2xl md:rounded-3xl p-4 md:p-8 text-center shadow-sm border border-lilac-dark/30 transition-shadow"
            >
              <div className="w-8 h-8 md:w-12 md:h-12 bg-mauve/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Icon className="w-4 h-4 md:w-6 md:h-6 text-mauve" />
              </div>
              <p className="text-3xl md:text-5xl font-bold font-mono"
                style={{ background: "linear-gradient(135deg, #9B6B9B, #2EC4B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {count !== "0" ? `${count}+` : "0"}
              </p>
              <p className="text-gray-500 mt-1 text-xs md:text-sm font-medium uppercase tracking-wide">{labels[i]}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
