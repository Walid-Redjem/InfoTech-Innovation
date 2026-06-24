"use client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { UserPlus, FileSearch, Sparkles, BarChart3, CalendarCheck, BrainCircuit } from "lucide-react";
import { useRef } from "react";

const services = [
  { key: "join",       icon: UserPlus,      href: "/join",       gradient: "from-purple-50 to-lilac",        accent: "#9B6B9B" },
  { key: "issues",     icon: FileSearch,    href: "/issues",     gradient: "from-orange-50 to-red-50",       accent: "#f97316" },
  { key: "ideas",      icon: Sparkles,      href: "/issues",     gradient: "from-yellow-50 to-amber-50",     accent: "#f59e0b" },
  { key: "surveys",    icon: BarChart3,     href: "/surveys",    gradient: "from-teal-50 to-cyan-50",        accent: "#2EC4B6" },
  { key: "activities", icon: CalendarCheck, href: "/activities", gradient: "from-blue-50 to-indigo-50",      accent: "#6366f1" },
  { key: "chatbot",    icon: BrainCircuit,  href: "/",           gradient: "from-pink-50 to-purple-50",      accent: "#ec4899" },
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-80, 80], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-80, 80], [-8, 8]), { stiffness: 300, damping: 30 });

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ServicesSection() {
  const t = useTranslations("home.services");
  const locale = useLocale();

  return (
    <section className="py-14 md:py-24 px-4 md:px-6 bg-gradient-to-b from-white to-lilac/20">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-turquoise mb-3 block">
            {locale === "ar" ? "خدماتنا" : "Our Services"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-mauve mb-3">{t("title")}</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-mauve to-turquoise rounded-full mx-auto" />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(({ key, icon: Icon, href, gradient, accent }, i) => (
            <AnimatedSection key={key} delay={i * 0.07}>
              <TiltCard>
                <Link
                  href={`/${locale}${href}`}
                  className={`block bg-gradient-to-br ${gradient} rounded-3xl p-6 border border-white/80 hover:shadow-2xl transition-all duration-300 group h-full relative overflow-hidden`}
                >
                  {/* Glow on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${accent}18 0%, transparent 70%)` }}
                  />

                  {/* Top accent line */}
                  <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center mb-5 group-hover:shadow-lg transition-shadow"
                    style={{ boxShadow: `0 4px 15px ${accent}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: accent }} />
                  </motion.div>

                  <h3 className="font-bold text-gray-800 mb-2 text-lg">{t(`${key}.title`)}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{t(`${key}.description`)}</p>

                  <motion.div
                    className="mt-4 flex items-center gap-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: accent }}
                  >
                    {locale === "ar" ? "اكتشف المزيد" : "Explore"}
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>→</motion.span>
                  </motion.div>
                </Link>
              </TiltCard>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
