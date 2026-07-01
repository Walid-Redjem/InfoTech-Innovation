"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";
import { Cpu, Zap, Mic2, Users, BookOpen, Star, Sparkles } from "lucide-react";

const activities = [
  {
    icon: Cpu,
    gradient: "linear-gradient(135deg, #6B35A0 0%, #9B6B9B 60%, #C084FC 100%)",
    iconBg: "#6B35A0",
    titleEn: "Tech Workshops",
    titleAr: "ورشات تقنية",
    descEn: "Hands-on sessions covering robotics, programming, and digital tools for youth and educators.",
    descAr: "جلسات عملية تغطي الروبوتات والبرمجة والأدوات الرقمية للشباب والمعلمين.",
    dots: ["top-4 left-6", "top-8 right-10", "bottom-6 left-12", "bottom-4 right-6"],
  },
  {
    icon: Zap,
    gradient: "linear-gradient(135deg, #2EC4B6 0%, #0D9488 55%, #99F6E4 100%)",
    iconBg: "#0D9488",
    titleEn: "Hackathons",
    titleAr: "هاكاثونات",
    descEn: "Intensive team competitions that turn community problems into innovative digital solutions.",
    descAr: "مسابقات فرق مكثفة تحوّل مشاكل المجتمع إلى حلول رقمية مبتكرة.",
    dots: ["top-6 right-8", "top-12 left-4", "bottom-8 right-12", "bottom-3 left-8"],
  },
  {
    icon: Mic2,
    gradient: "linear-gradient(135deg, #DC2626 0%, #EF4444 55%, #FCA5A5 100%)",
    iconBg: "#DC2626",
    titleEn: "Expert Talks",
    titleAr: "محاضرات الخبراء",
    descEn: "Inspiring talks from tech leaders, entrepreneurs, and innovators shaping Algeria's digital future.",
    descAr: "محادثات ملهمة من قادة التقنية ورواد الأعمال والمبتكرين الذين يصنعون المستقبل الرقمي.",
    dots: ["top-3 left-10", "top-10 right-4", "bottom-5 left-5", "bottom-10 right-9"],
  },
  {
    icon: Users,
    gradient: "linear-gradient(135deg, #F97316 0%, #FB923C 55%, #FED7AA 100%)",
    iconBg: "#EA6A0A",
    titleEn: "Community Projects",
    titleAr: "مشاريع مجتمعية",
    descEn: "Collaborative initiatives where teams build real solutions that address local challenges.",
    descAr: "مبادرات تعاونية تبني فرق فيها حلولاً حقيقية لمعالجة التحديات المحلية.",
    dots: ["top-5 right-6", "top-9 left-7", "bottom-7 right-4", "bottom-4 left-10"],
  },
  {
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #059669 0%, #10B981 55%, #6EE7B7 100%)",
    iconBg: "#059669",
    titleEn: "Digital Training",
    titleAr: "تدريب رقمي",
    descEn: "Structured learning tracks on coding, AI, and digital literacy for all skill levels.",
    descAr: "مسارات تعليمية منظمة في البرمجة والذكاء الاصطناعي والثقافة الرقمية لجميع المستويات.",
    dots: ["top-4 left-8", "top-11 right-5", "bottom-6 left-3", "bottom-3 right-10"],
  },
  {
    icon: Star,
    gradient: "linear-gradient(135deg, #2563EB 0%, #3B82F6 55%, #BFDBFE 100%)",
    iconBg: "#2563EB",
    titleEn: "Mentorship",
    titleAr: "إرشاد ومتابعة",
    descEn: "One-on-one guidance from experienced mentors helping youth navigate their tech journey.",
    descAr: "توجيه فردي من مرشدين متمرسين يساعدون الشباب في مسيرتهم التقنية.",
    dots: ["top-6 left-5", "top-3 right-11", "bottom-4 left-11", "bottom-8 right-5"],
  },
];

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
              <AnimatedSection key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300"
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
                      {/* Large faint circle decoration */}
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
                  <div className="pt-10 pb-7 px-6 text-center">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      {ar ? item.titleAr : item.titleEn}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {ar ? item.descAr : item.descEn}
                    </p>
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
