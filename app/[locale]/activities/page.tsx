"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Tag, Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";

interface Activity {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  date: string;
  imageUrl: string;
  category: string;
  location: string;
  locationAr: string;
  active: boolean;
}

const categoryColors: Record<string, string> = {
  workshop: "#9B6B9B",
  event: "#2EC4B6",
  competition: "#f97316",
  training: "#6366f1",
  other: "#f59e0b",
};

export default function ActivitiesPage() {
  const locale = useLocale();
  const ar = locale === "ar";
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetch() {
      try {
        const snap = await getDocs(query(collection(db, "activities"), where("active", "==", true), orderBy("createdAt", "desc")));
        setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity)));
      } catch {}
      finally { setLoading(false); }
    }
    fetch();
  }, []);

  const categories = ["all", ...Array.from(new Set(activities.map(a => a.category)))];
  const filtered = filter === "all" ? activities : activities.filter(a => a.category === filter);

  return (
    <div>
      <PageHeader
        badge={ar ? "الأنشطة" : "Activities"}
        title={ar ? "رحلتنا في الابتكار" : "Our Innovation Journey"}
        subtitle={ar ? "استكشف فعالياتنا وورشاتنا ومبادراتنا المجتمعية." : "Explore our events, workshops, and community initiatives."}
      />

      <section className="py-16 px-6 bg-gradient-to-b from-white to-lilac/20">
        <div className="max-w-5xl mx-auto">

          {/* Category filter */}
          {categories.length > 2 && (
            <div className="flex gap-2 flex-wrap mb-10 justify-center">
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                    filter === cat ? "border-mauve bg-mauve text-white shadow-md" : "border-lilac-dark text-mauve bg-white hover:border-mauve"
                  }`}>
                  {cat === "all" ? (ar ? "الكل" : "All") : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">{ar ? "لا توجد أنشطة بعد" : "No activities yet"}</h3>
              <p className="text-gray-400 mb-6">{ar ? "سيتم نشر الأنشطة قريباً، ترقّبوا!" : "Activities will be published soon — stay tuned!"}</p>
              <Link href={`/${locale}/join`}
                className="inline-block bg-gradient-to-r from-mauve to-turquoise text-white px-7 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity">
                {ar ? "سجّل الآن" : "Register to stay updated"}
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 0.07}>
                <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-mauve/10 transition-shadow group">
                  <div className="relative h-48 bg-lilac/30 overflow-hidden">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={ar ? item.titleAr : item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-mauve/30" />
                      </div>
                    )}
                    <span className="absolute top-3 start-3 text-xs font-bold px-3 py-1 rounded-full text-white shadow"
                      style={{ backgroundColor: categoryColors[item.category] || "#9B6B9B" }}>
                      {item.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-mauve transition-colors">
                      {ar ? item.titleAr : item.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                      {ar ? item.descriptionAr : item.description}
                    </p>
                    <div className="flex flex-col gap-1.5 text-xs text-gray-400">
                      {item.date && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-mauve" />{item.date}</span>}
                      {item.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-turquoise" />{ar ? item.locationAr || item.location : item.location}</span>}
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <AnimatedSection>
        <section className="py-16 px-6 bg-mauve text-center">
          <h2 className="text-2xl font-bold text-white mb-3">{ar ? "هل تريد المشاركة في أنشطتنا؟" : "Want to participate in our activities?"}</h2>
          <p className="text-white/70 mb-6 text-sm">{ar ? "سجّل الآن وكن أول من يعلم عن فعالياتنا القادمة." : "Register now and be the first to know about upcoming events."}</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link href={`/${locale}/join`} className="inline-block bg-turquoise text-white px-10 py-3.5 rounded-full font-bold hover:bg-turquoise-dark transition-colors shadow-xl shadow-turquoise/30">
              {ar ? "انخرط معنا" : "Join Us"}
            </Link>
          </motion.div>
        </section>
      </AnimatedSection>
    </div>
  );
}
