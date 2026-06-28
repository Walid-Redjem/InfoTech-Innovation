"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";

const categoryColors: Record<string, string> = {
  workshop:    "#9B6B9B",
  event:       "#2EC4B6",
  competition: "#6366f1",
  training:    "#f59e0b",
  other:       "#f97316",
};

const categoryLabelsEn: Record<string, string> = {
  workshop: "Workshop", event: "Event", competition: "Competition", training: "Training", other: "Other",
};
const categoryLabelsAr: Record<string, string> = {
  workshop: "ورشة عمل", event: "فعالية", competition: "مسابقة", training: "تدريب", other: "أخرى",
};

interface Activity {
  id: string;
  title: string; titleAr: string;
  description: string; descriptionAr: string;
  date: string;
  category: string;
  location: string; locationAr: string;
  imageUrl?: string;
}

export default function ActivitiesPage() {
  const locale = useLocale();
  const ar = locale === "ar";
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, "activities"), where("active", "==", true), orderBy("date", "desc")))
      .then(snap => setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

      <section className="py-20 px-6 bg-gradient-to-b from-white to-lilac/20">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-lilac/40 rounded-3xl h-72 animate-pulse" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{ar ? "لا توجد أنشطة بعد." : "No activities yet."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity, i) => {
                const color = categoryColors[activity.category] || "#9B6B9B";
                const catLabel = ar ? (categoryLabelsAr[activity.category] || activity.category) : (categoryLabelsEn[activity.category] || activity.category);
                return (
                  <AnimatedSection key={activity.id} delay={i * 0.08}>
                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow group"
                    >
                      {/* Image or color block */}
                      <div className="h-44 relative overflow-hidden bg-lilac/30">
                        {activity.imageUrl ? (
                          <Image src={activity.imageUrl} alt={ar ? activity.titleAr : activity.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
                            <CalendarDays className="w-12 h-12 opacity-30" style={{ color }} />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-5">
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{catLabel}</span>
                        <h3 className="font-bold text-gray-800 mt-1 mb-2 leading-snug">{ar ? activity.titleAr : activity.title}</h3>
                        {activity.date && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                            <CalendarDays className="w-3 h-3" /> {activity.date}
                          </p>
                        )}
                        {(ar ? activity.locationAr : activity.location) && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {ar ? activity.locationAr : activity.location}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
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
              className="inline-block bg-turquoise text-white px-10 py-3.5 rounded-full font-bold hover:bg-turquoise-dark transition-colors shadow-xl shadow-turquoise/30">
              {ar ? "انخرط معنا" : "Join Us"}
            </Link>
          </motion.div>
        </section>
      </AnimatedSection>
    </div>
  );
}
