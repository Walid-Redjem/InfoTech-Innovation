"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";
import { Sparkles, ArrowRight } from "lucide-react";
import { activities } from "@/lib/activities-data";

export default function ActivitiesPage() {
  const locale = useLocale();
  const ar = locale === "ar";

  return (
    <div>
      <PageHeader
        badge={ar ? "الأنشطة" : "Activities"}
        title={ar ? "رحلتنا في الابتكار" : "Our Innovation Journey"}
        subtitle={ar ? "استكشف أنشطتنا وفعالياتنا وورشات العمل المجتمعية." : "Explore our workshops, events, and community-driven activities."}
      />

      {/* Coming soon banner */}
      <AnimatedSection>
        <div className="bg-gradient-to-r from-mauve/10 to-turquoise/10 border-y border-lilac-dark/30 py-4 px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-mauve font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-turquoise" />
            {ar ? "المحتوى قيد الإعداد، سيتم النشر قريباً" : "Content is being prepared. Publishing soon"}
            <Sparkles className="w-4 h-4 text-turquoise" />
          </div>
        </div>
      </AnimatedSection>

      {/* Activity cards */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-lilac/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((item, i) => (
              <AnimatedSection key={item.slug} delay={i * 0.08}>
                <Link href={`/${locale}/activities/${item.slug}`} className="block group">
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 h-full"
                  >
                    {/* Image area */}
                    <div className="relative">
                      <div
                        className="h-48 rounded-t-3xl overflow-hidden relative"
                        style={{ background: item.gradient }}
                      >
                        {/* Decorative dots */}
                        {item.dots.map((pos, j) => (
                          <div
                            key={j}
                            className={`absolute w-2.5 h-2.5 rounded-full bg-white/25 ${pos}`}
                          />
                        ))}
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                        <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
                      </div>

                      {/* Overlapping circular icon badge */}
                      <div
                        className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-[3px] border-white"
                        style={{ background: item.iconBg }}
                      >
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative pt-10 pb-7 px-6 text-center flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wide mb-1 block" style={{ color: item.iconBg }}>
                        {ar ? item.typeAr : item.typeEn}
                      </span>
                      <h3 className="font-bold text-gray-800 text-lg mb-2">
                        {ar ? item.titleAr : item.titleEn}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
                        {ar ? item.descAr : item.descEn}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-xs font-semibold transition-all duration-200 group-hover:gap-2" style={{ color: item.iconBg }}>
                        {ar ? "استعرض المحتوى" : "View content"}
                        <ArrowRight className={`w-3.5 h-3.5 ${ar ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <AnimatedSection>
        <section className="py-16 px-6 bg-mauve text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {ar ? "هل تريد المشاركة في أنشطتنا القادمة؟" : "Want to participate in our upcoming activities?"}
          </h2>
          <p className="text-white/70 mb-6 text-sm">
            {ar ? "سجّل الآن وكن أول من يعلم عن فعالياتنا." : "Register now and be the first to know about our events."}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={`/${locale}/join`}
              className="inline-block bg-gradient-to-r from-mauve to-turquoise text-white px-10 py-3.5 rounded-full font-bold hover:opacity-90 transition-opacity shadow-xl shadow-turquoise/30"
            >
              {ar ? "انخرط معنا" : "Join Us"}
            </Link>
          </motion.div>
        </section>
      </AnimatedSection>
    </div>
  );
}
