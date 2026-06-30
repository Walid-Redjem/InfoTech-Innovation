"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";
import { ImageIcon, Video, FileText, BookOpen, Sparkles } from "lucide-react";

const placeholders = [
  { icon: ImageIcon, color: "#9B6B9B", bg: "bg-purple-50", typeEn: "Photos", typeAr: "صور", titleEn: "Workshop Highlights", titleAr: "أبرز ورشات العمل", dateEn: "Coming soon", dateAr: "قريباً" },
  { icon: Video, color: "#2EC4B6", bg: "bg-teal-50", typeEn: "Video", typeAr: "فيديو", titleEn: "Community Sessions", titleAr: "الجلسات المجتمعية", dateEn: "Coming soon", dateAr: "قريباً" },
  { icon: FileText, color: "#6366f1", bg: "bg-indigo-50", typeEn: "Report", typeAr: "تقرير", titleEn: "Impact Report 2025", titleAr: "تقرير الأثر 2025", dateEn: "Coming soon", dateAr: "قريباً" },
  { icon: BookOpen, color: "#f59e0b", bg: "bg-yellow-50", typeEn: "Blog", typeAr: "مقال", titleEn: "Innovation Stories", titleAr: "قصص الابتكار", dateEn: "Coming soon", dateAr: "قريباً" },
  { icon: ImageIcon, color: "#ec4899", bg: "bg-pink-50", typeEn: "Photos", typeAr: "صور", titleEn: "Youth Hackathon", titleAr: "هاكاثون الشباب", dateEn: "Coming soon", dateAr: "قريباً" },
  { icon: Video, color: "#f97316", bg: "bg-orange-50", typeEn: "Video", typeAr: "فيديو", titleEn: "Expert Talks", titleAr: "محاضرات الخبراء", dateEn: "Coming soon", dateAr: "قريباً" },
];

export default function ActivitiesPage() {
  const locale = useLocale();
  const ar = locale === "ar";

  return (
    <div>
      <PageHeader
        badge={ar ? "الأنشطة" : "Activities"}
        title={ar ? "رحلتنا في الابتكار" : "Our Innovation Journey"}
        subtitle={ar ? "استكشف صورنا وفيديوهاتنا وتقاريرنا من الفعاليات وورشات العمل السابقة." : "Explore photos, videos, and reports from our events and workshops."}
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

      {/* Placeholder gallery grid */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-lilac/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placeholders.map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`${item.bg} rounded-3xl overflow-hidden border border-white hover:shadow-xl transition-shadow group`}
                >
                  {/* Preview area */}
                  <div className="h-32 md:h-44 flex items-center justify-center relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 opacity-20"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                      style={{ background: `radial-gradient(circle, ${item.color}40, transparent 70%)` }}
                    />
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.2 }}
                      className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center"
                    >
                      <item.icon className="w-8 h-8" style={{ color: item.color }} />
                    </motion.div>
                    {/* Coming soon overlay */}
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/90 text-mauve text-xs font-bold px-3 py-1 rounded-full shadow">
                        {ar ? "قريباً" : "Coming Soon"}
                      </span>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: item.color }}>
                      {ar ? item.typeAr : item.typeEn}
                    </span>
                    <h3 className="font-bold text-gray-800 mt-1 mb-1">{ar ? item.titleAr : item.titleEn}</h3>
                    <p className="text-xs text-gray-400">{ar ? item.dateAr : item.dateEn}</p>
                  </div>
                </motion.div>
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
            <Link href={`/${locale}/join`}
              className="inline-block bg-gradient-to-r from-mauve to-turquoise text-white px-10 py-3.5 rounded-full font-bold hover:opacity-90 transition-opacity shadow-xl shadow-turquoise/30">
              {ar ? "انخرط معنا" : "Join Us"}
            </Link>
          </motion.div>
        </section>
      </AnimatedSection>
    </div>
  );
}
