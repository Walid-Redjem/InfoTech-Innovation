"use client";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { CheckCircle2 } from "lucide-react";

const pointsEn = [
  "Connecting youth with mentors and experts",
  "Turning community problems into actionable projects",
  "Leveraging technology for social impact",
  "Building measurable, lasting change",
];

const pointsAr = [
  "ربط الشباب بالمرشدين والخبراء",
  "تحويل مشاكل المجتمع إلى مشاريع قابلة للتنفيذ",
  "توظيف التكنولوجيا للتأثير الاجتماعي",
  "بناء تغيير حقيقي وقابل للقياس",
];

export default function AboutSection() {
  const t = useTranslations("home.about");
  const locale = useLocale();
  const pts = locale === "ar" ? pointsAr : pointsEn;

  return (
    <section className="py-14 md:py-24 px-6 bg-gradient-to-br from-white to-lilac/30">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

        {/* Text side */}
        <AnimatedSection>
          <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: "#6B35A0" }}>
            {locale === "ar" ? "من نحن" : "Who We Are"}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: "#6B35A0" }}>{t("title")}</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-mauve to-turquoise rounded-full mb-5" />
          <p className="text-gray-500 leading-relaxed mb-6 text-sm md:text-base">{t("description")}</p>
          <ul className="space-y-2.5">
            {pts.map((pt, i) => (
              <motion.li key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 text-sm text-gray-600"
              >
                <CheckCircle2 className="w-4 h-4 text-turquoise shrink-0" />
                {pt}
              </motion.li>
            ))}
          </ul>
        </AnimatedSection>

        {/* Visual grid */}
        <AnimatedSection delay={0.2}>
          <div className="relative mt-2 md:mt-0">
            <div className="absolute inset-0 bg-gradient-to-br from-mauve/20 to-turquoise/20 rounded-3xl blur-2xl" />
            <div className="relative bg-white rounded-3xl p-5 md:p-8 shadow-xl border border-lilac-dark/20">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[
                  { label: locale === "ar" ? "شباب" : "Youth", value: "🎓", bg: "bg-lilac" },
                  { label: locale === "ar" ? "معلمون" : "Teachers", value: "📚", bg: "bg-turquoise/10" },
                  { label: locale === "ar" ? "مؤسسات" : "Institutions", value: "🏛️", bg: "bg-mauve/10" },
                  { label: locale === "ar" ? "ابتكار" : "Innovation", value: "💡", bg: "bg-lilac-dark/30" },
                ].map((item, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05 }}
                    className={`${item.bg} rounded-2xl p-4 md:p-5 text-center cursor-default`}
                  >
                    <div className="text-2xl md:text-3xl mb-1.5">{item.value}</div>
                    <p className="text-xs md:text-sm font-semibold text-mauve">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
