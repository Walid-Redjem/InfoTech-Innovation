"use client";
import { useLocale } from "next-intl";
import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import { activities } from "@/lib/activities-data";
import {
  ImageIcon, Play, BookOpen,
  Clock, Camera, ZoomIn, Bell, ChevronRight, Sparkles,
  Users, Calendar, X, Layers,
} from "lucide-react";

interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbUrl: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  order: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hero
// ─────────────────────────────────────────────────────────────────────────────
function ActivityHero({
  activity,
  ar,
  locale,
}: {
  activity: NonNullable<ReturnType<typeof activities.find>>;
  ar: boolean;
  locale: string;
}) {
  const Icon = activity.icon;
  return (
    <section
      className="relative overflow-hidden py-20 md:py-28 px-6 bg-cover bg-center"
      style={activity.coverImage ? { backgroundImage: `url(${activity.coverImage})` } : { background: activity.gradient }}
    >
      {activity.coverImage && (
        <div className="absolute inset-0" style={{ background: activity.gradient, opacity: 0.75 }} />
      )}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
      <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />
      <div className="absolute top-10 left-1/3 w-3 h-3 rounded-full bg-white/30" />
      <div className="absolute top-24 right-1/4 w-2 h-2 rounded-full bg-white/25" />
      <div className="absolute bottom-16 right-1/3 w-3 h-3 rounded-full bg-white/20" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      <div className="relative max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex items-center gap-2 text-white/60 text-sm mb-8">
          <Link href={`/${locale}/activities`} className="hover:text-white transition-colors">
            {ar ? "الأنشطة" : "Activities"}
          </Link>
          <ChevronRight className={`w-3.5 h-3.5 ${ar ? "rotate-180" : ""}`} />
          <span className="text-white/90">{ar ? activity.titleAr : activity.titleEn}</span>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-5">
              <Icon className="w-3.5 h-3.5" />
              {ar ? activity.typeAr : activity.typeEn}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {ar ? activity.titleAr : activity.titleEn}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
              className="text-white/80 text-lg leading-relaxed max-w-lg mb-8">
              {ar ? activity.descAr : activity.descEn}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-3">
              {[
                { Icon: Calendar, label: ar ? "قريباً" : "Coming soon" },
                { Icon: Users, label: ar ? "مجتمع إنفوتك" : "InfoTech Community" },
                { Icon: Sparkles, label: ar ? "قيد الإعداد" : "In preparation" },
              ].map(({ Icon: I, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-medium">
                  <I className="w-3 h-3" />{label}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
            className="hidden md:flex flex-shrink-0 w-40 h-40 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/30 items-center justify-center shadow-2xl overflow-hidden">
            {activity.badgeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activity.badgeImage} alt="" className="w-full h-full object-cover"
                style={{ objectPosition: activity.badgePosition || "center" }} />
            ) : (
              <Icon className="w-16 h-16 text-white" />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────────────────────────────────────
function Lightbox({ items, index, onClose, onPrev, onNext, ar }: {
  items: MediaItem[]; index: number; onClose: () => void;
  onPrev: () => void; onNext: () => void; ar: boolean;
}) {
  const item = items[index];
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") ar ? onNext() : onPrev();
      if (e.key === "ArrowRight") ar ? onPrev() : onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, ar]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
      onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
        <X className="w-6 h-6" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors">
        <ChevronRight className="w-7 h-7 rotate-180" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors">
        <ChevronRight className="w-7 h-7" />
      </button>

      <div className="max-w-4xl w-full mx-auto px-16" onClick={(e) => e.stopPropagation()}>
        {item.type === "video" ? (
          <video src={item.url} controls autoPlay className="w-full max-h-[80vh] rounded-2xl" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.nameEn} className="w-full max-h-[80vh] object-contain rounded-2xl" />
        )}
        {(item.nameEn || item.nameAr) && (
          <p className="text-white/70 text-sm text-center mt-3">
            {ar ? item.nameAr : item.nameEn}
          </p>
        )}
        <p className="text-white/30 text-xs text-center mt-1">{index + 1} / {items.length}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Photo Gallery
// ─────────────────────────────────────────────────────────────────────────────
function PhotoGallery({ mediaItems, gradient, iconBg, ar }: {
  mediaItems: MediaItem[]; gradient: string; iconBg: string; ar: boolean;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const hasMedia = mediaItems.length > 0;

  return (
    <div className="space-y-10">
      {/* Stats bar */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
        {[
          { Icon: Camera, value: hasMedia ? String(mediaItems.length) : "—", label: ar ? "صورة" : "Photos" },
          { Icon: Users, value: "—", label: ar ? "مشارك" : "Attendees" },
          { Icon: Calendar, value: ar ? "قريباً" : "Soon", label: ar ? "التاريخ" : "Date" },
        ].map(({ Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg + "22" }}>
              <Icon className="w-4 h-4" style={{ color: iconBg }} />
            </div>
            <div>
              <div className="font-bold text-gray-800 text-sm leading-none">{value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {hasMedia ? (
        <>
          {/* Real photo grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {mediaItems.map((item, i) => {
              const featured = i === 0;
              return (
                <motion.div key={item.id}
                  whileHover="hover"
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer shadow-md bg-gray-100 ${featured ? "col-span-2 row-span-2 aspect-[16/9]" : "aspect-video"}`}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.04 }}
                  onClick={() => setLightboxIndex(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.thumbUrl || item.url} alt={item.nameEn || ""} className="w-full h-full object-cover" />

                  {/* Video badge */}
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <motion.div variants={{ hover: { opacity: 1 }, default: { opacity: 0 } }} initial={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>

                  {/* Number badge */}
                  <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{i + 1}</span>
                  </div>

                  {/* Caption */}
                  {item.nameEn && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="text-white text-xs">{ar ? item.nameAr : item.nameEn}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Lightbox */}
          {lightboxIndex !== null && (
            <Lightbox items={mediaItems} index={lightboxIndex} onClose={() => setLightboxIndex(null)}
              onPrev={() => setLightboxIndex(i => i !== null ? (i - 1 + mediaItems.length) % mediaItems.length : 0)}
              onNext={() => setLightboxIndex(i => i !== null ? (i + 1) % mediaItems.length : 0)}
              ar={ar} />
          )}
        </>
      ) : (
        <>
          {/* Placeholder grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div key={i} className={`group relative rounded-2xl overflow-hidden shadow-md ${i === 0 ? "col-span-2 row-span-2 aspect-[16/9]" : "aspect-video"}`}
                style={{ background: gradient }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className={`text-white/30 ${i === 0 ? "w-16 h-16" : "w-8 h-8"}`} />
                </div>
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">{i + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-3xl p-8 text-center text-white relative overflow-hidden" style={{ background: gradient }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            <Camera className="w-12 h-12 text-white/60 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{ar ? "الصور قادمة قريباً" : "Photos coming soon"}</h3>
            <p className="text-white/70 text-sm max-w-sm mx-auto mb-6">
              {ar ? "يعمل فريقنا على إضافة صور من هذه الفعالية. تابعنا للاطلاع على آخر التحديثات." : "Our team is working on uploading photos from this event. Follow us for updates."}
            </p>
            <button className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors">
              <Bell className="w-4 h-4" />
              {ar ? "أعلمني عند النشر" : "Notify me when published"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Section
// ─────────────────────────────────────────────────────────────────────────────
function VideoSection({ mediaItems, gradient, iconBg, ar }: {
  mediaItems: MediaItem[]; gradient: string; iconBg: string; ar: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMedia = mediaItems.length > 0;
  const active = hasMedia ? mediaItems[activeIndex] : null;

  return (
    <div className="space-y-10">
      {/* Stats bar */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
        {[
          { Icon: Play, value: hasMedia ? String(mediaItems.length) : "—", label: ar ? "مقطع" : "Videos" },
          { Icon: Clock, value: ar ? "—" : "—", label: ar ? "المدة الإجمالية" : "Total runtime" },
          { Icon: Calendar, value: ar ? "قريباً" : "Soon", label: ar ? "التاريخ" : "Date" },
        ].map(({ Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg + "22" }}>
              <Icon className="w-4 h-4" style={{ color: iconBg }} />
            </div>
            <div>
              <div className="font-bold text-gray-800 text-sm leading-none">{value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {hasMedia && active ? (
        <>
          {/* Real video player */}
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-black">
            <video key={active.url} src={active.url} controls autoPlay={false}
              className="w-full aspect-video" poster={active.thumbUrl} />
            {(active.nameEn || active.nameAr) && (
              <div className="px-5 py-3 bg-gray-900">
                <p className="text-white/70 text-sm">{ar ? active.nameAr : active.nameEn}</p>
              </div>
            )}
          </div>

          {/* Episode list */}
          {mediaItems.length > 1 && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                {ar ? "جميع المقاطع" : "All videos"}
              </h3>
              {mediaItems.map((item, i) => (
                <motion.div key={item.id}
                  whileHover={{ x: ar ? -4 : 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => setActiveIndex(i)}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                    i === activeIndex
                      ? "bg-lilac/30 border-mauve/20 shadow-sm"
                      : "bg-white border-gray-50 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="w-24 h-14 rounded-xl overflow-hidden flex-shrink-0 relative bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumbUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="w-4 h-4 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {(ar ? item.nameAr : item.nameEn) || `Video ${i + 1}`}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: iconBg + "22" }}>
                    <ChevronRight className={`w-4 h-4 ${ar ? "rotate-180" : ""}`} style={{ color: iconBg }} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Placeholder player */}
          <div className="rounded-3xl overflow-hidden shadow-2xl relative" style={{ background: gradient }}>
            <div className="aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10 flex items-center justify-center">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute w-28 h-28 rounded-full bg-white/30" />
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
                  className="absolute w-20 h-20 rounded-full bg-white/40" />
                <div className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl">
                  <Play className="w-7 h-7 ml-0.5" style={{ color: iconBg }} fill={iconBg} />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> {ar ? "قريباً" : "Coming soon"}
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-8 text-center bg-gray-50 border border-gray-100">
            <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: iconBg }} />
            <h3 className="font-bold text-gray-800 text-lg mb-2">{ar ? "كن أول من يشاهد" : "Be the first to watch"}</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-5">
              {ar ? "سيتم إشعارك فور رفع المقاطع." : "We'll notify you as soon as videos are uploaded."}
            </p>
            <button className="inline-flex items-center gap-2 text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: gradient }}>
              <Bell className="w-4 h-4" />{ar ? "أعلمني" : "Notify me"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Projects Gallery
// ─────────────────────────────────────────────────────────────────────────────
function ProjectsGallery({ mediaItems, gradient, iconBg, ar }: {
  mediaItems: MediaItem[]; gradient: string; iconBg: string; ar: boolean;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const hasProjects = mediaItems.length > 0;

  return (
    <div className="space-y-10">
      {/* Stats bar */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
        {[
          { Icon: Layers,   value: hasProjects ? String(mediaItems.length) : "—", label: ar ? "مشروع" : "Projects" },
          { Icon: Users,    value: "—", label: ar ? "مشارك" : "Participants" },
          { Icon: Calendar, value: ar ? "جارية" : "Ongoing", label: ar ? "الحالة" : "Status" },
        ].map(({ Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconBg + "22" }}>
              <Icon className="w-4 h-4" style={{ color: iconBg }} />
            </div>
            <div>
              <div className="font-bold text-gray-800 text-sm leading-none">{value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {hasProjects ? (
        <>
          {/* Projects grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaItems.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-50 group"
              >
                {/* Project image */}
                <div className="relative h-52 overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => setLightboxIndex(i)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={ar ? item.nameAr : item.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {/* Zoom overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/20 backdrop-blur-sm border border-white/0 group-hover:border-white/40 flex items-center justify-center transition-all duration-300">
                      <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  {/* Number badge */}
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                </div>

                {/* Project info */}
                <div className="p-5">
                  {(item.nameEn || item.nameAr) && (
                    <h3 className="font-bold text-gray-800 text-base mb-2">
                      {ar ? (item.nameAr || item.nameEn) : (item.nameEn || item.nameAr)}
                    </h3>
                  )}
                  {(item.descriptionEn || item.descriptionAr) ? (
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {ar ? (item.descriptionAr || item.descriptionEn) : (item.descriptionEn || item.descriptionAr)}
                    </p>
                  ) : (
                    <p className="text-gray-300 text-sm italic">
                      {ar ? "لا يوجد وصف." : "No description provided."}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Lightbox */}
          {lightboxIndex !== null && (
            <Lightbox items={mediaItems} index={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onPrev={() => setLightboxIndex(i => i !== null ? (i - 1 + mediaItems.length) % mediaItems.length : 0)}
              onNext={() => setLightboxIndex(i => i !== null ? (i + 1) % mediaItems.length : 0)}
              ar={ar} />
          )}
        </>
      ) : (
        /* Coming-soon placeholder */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-50 shadow-sm">
                <div className="h-48 relative" style={{ background: gradient }}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Layers className="w-10 h-10 text-white/30" />
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-gray-100 rounded-full w-2/3" />
                  <div className="h-3 bg-gray-50 rounded-full w-full" />
                  <div className="h-3 bg-gray-50 rounded-full w-4/5" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-3xl p-8 text-center text-white relative overflow-hidden" style={{ background: gradient }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            <Layers className="w-12 h-12 text-white/60 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{ar ? "مشاريعنا قادمة قريباً" : "Our projects are coming soon"}</h3>
            <p className="text-white/70 text-sm max-w-sm mx-auto mb-6">
              {ar ? "يعمل فريقنا على إضافة مشاريعنا. تابعنا للاطلاع على آخر التحديثات."
                   : "Our team is working on showcasing our projects. Follow us for updates."}
            </p>
            <button className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-colors">
              <Bell className="w-4 h-4" />
              {ar ? "أعلمني عند النشر" : "Notify me when published"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Report / Blog
// ─────────────────────────────────────────────────────────────────────────────
function TextContent({ gradient, iconBg, ar, titleEn, titleAr }: {
  type: "blog"; gradient: string; iconBg: string; ar: boolean;
  titleEn: string; titleAr: string;
}) {
  const Icon = BookOpen;
  const sections = [{ en: "Introduction", ar: "مقدمة" }, { en: "The Challenge", ar: "التحدي" }, { en: "Our Approach", ar: "منهجنا" }, { en: "Results", ar: "النتائج" }];
  const stats = [{ Icon: BookOpen, value: "5 min", label: ar ? "وقت القراءة" : "Read time" }, { Icon: Users, value: ar ? "شباب" : "Youth", label: ar ? "الجمهور" : "Audience" }, { Icon: Calendar, value: ar ? "قريباً" : "Soon", label: ar ? "النشر" : "Publish" }];

  return (
    <div className="grid md:grid-cols-[1fr_280px] gap-8 items-start">
      <div className="space-y-8">
        <div className="w-full h-64 rounded-3xl overflow-hidden flex items-center justify-center shadow-xl relative" style={{ background: gradient }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="text-center relative z-10"><Icon className="w-16 h-16 text-white/60 mx-auto mb-3" /><p className="text-white/50 text-sm">{ar ? titleAr : titleEn}</p></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ Icon: I, value, label }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm text-center border border-gray-50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: iconBg + "18" }}><I className="w-5 h-5" style={{ color: iconBg }} /></div>
              <div className="font-bold text-gray-800 text-lg leading-none">{value}</div>
              <div className="text-gray-400 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-3xl shadow-sm p-8 space-y-8 border border-gray-50">
          {sections.map((sec, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-4"><div className="w-1 h-6 rounded-full" style={{ background: iconBg }} /><h4 className="font-bold text-gray-700 text-base">{ar ? sec.ar : sec.en}</h4></div>
              <div className="space-y-2 pl-4">
                <div className="h-3 bg-gray-100 rounded-full w-full" /><div className="h-3 bg-gray-100 rounded-full w-5/6" /><div className="h-3 bg-gray-50 rounded-full w-full" /><div className="h-3 bg-gray-50 rounded-full w-4/5" />
                {i % 2 === 0 && <div className="h-3 bg-gray-50 rounded-full w-3/4" />}
              </div>
            </div>
          ))}
          <div className="mt-2 pt-6 border-t border-gray-100 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2" style={{ color: iconBg }} />
            <p className="text-gray-500 text-sm">{ar ? "المحتوى الكامل قيد الإعداد وسيُنشر قريباً." : "Full content is being prepared and will be published soon."}</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 md:sticky md:top-24">
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-50">
          <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-4">{ar ? "المحتويات" : "Contents"}</h4>
          <ul className="space-y-3">
            {sections.map((sec, i) => (
              <li key={i} className="flex items-center gap-3 cursor-pointer group">
                <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>{i + 1}</span>
                <span className="text-gray-500 text-sm group-hover:text-gray-800 transition-colors">{ar ? sec.ar : sec.en}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl p-5 text-center text-white relative overflow-hidden" style={{ background: gradient }}>
          <Icon className="w-8 h-8 mx-auto mb-3 text-white/80" />
          <p className="text-white/80 text-sm mb-4">{ar ? "قراءة المقال كاملاً" : "Read full article"}</p>
          <button className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-full py-2 text-sm font-semibold transition-colors">{ar ? "قريباً" : "Coming soon"}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Related activities
// ─────────────────────────────────────────────────────────────────────────────
function RelatedActivities({ currentSlug, ar, locale }: { currentSlug: string; ar: boolean; locale: string }) {
  const related = activities.filter((a) => a.slug !== currentSlug).slice(0, 3);
  return (
    <section className="py-16 px-6 bg-gradient-to-b from-white to-lilac/20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">{ar ? "أنشطة أخرى" : "Other activities"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((item, i) => (
            <AnimatedSection key={item.slug} delay={i * 0.08}>
              <Link href={`/${locale}/activities/${item.slug}`} className="block group">
                <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="h-28 relative" style={{ background: item.gradient }}>
                    <item.icon className="absolute bottom-3 right-3 w-6 h-6 text-white/50" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: item.iconBg }}>{ar ? item.typeAr : item.typeEn}</span>
                    <h3 className="font-bold text-gray-800 mt-1 text-sm group-hover:text-gray-900 transition-colors">{ar ? item.titleAr : item.titleEn}</h3>
                  </div>
                </motion.div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function ActivityDetailPage() {
  const locale = useLocale();
  const { slug } = useParams<{ slug: string }>();
  const ar = locale === "ar";

  const activity = activities.find((a) => a.slug === slug);
  if (!activity) notFound();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, `activityMedia/${activity.slug}/items`),
      orderBy("order", "asc")
    );
    getDocs(q)
      .then((snap) => {
        setMediaItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MediaItem)));
      })
      .catch(() => {
        // Firestore rules not yet deployed — show placeholder content
      })
      .finally(() => setMediaLoaded(true));
  }, [activity.slug]);

  return (
    <div>
      <ActivityHero activity={activity} ar={ar} locale={locale} />

      {/* Media content */}
      <section className="py-14 px-6">
        <div className="max-w-5xl mx-auto">
          {!mediaLoaded ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`rounded-2xl bg-gray-100 animate-pulse ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-video"}`} />
              ))}
            </div>
          ) : (
            <>
              {activity.type === "photos" && (
                <PhotoGallery mediaItems={mediaItems} gradient={activity.gradient} iconBg={activity.iconBg} ar={ar} />
              )}
              {activity.type === "video" && (
                <VideoSection mediaItems={mediaItems} gradient={activity.gradient} iconBg={activity.iconBg} ar={ar} />
              )}
              {activity.type === "projects" && (
                <ProjectsGallery mediaItems={mediaItems} gradient={activity.gradient} iconBg={activity.iconBg} ar={ar} />
              )}
              {activity.type === "blog" && (
                <TextContent type="blog" gradient={activity.gradient} iconBg={activity.iconBg}
                  ar={ar} titleEn={activity.titleEn} titleAr={activity.titleAr} />
              )}
            </>
          )}
        </div>
      </section>

      <RelatedActivities currentSlug={activity.slug} ar={ar} locale={locale} />

      <AnimatedSection>
        <section className="py-16 px-6 bg-white text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {ar ? "هل تريد المشاركة في أنشطتنا القادمة؟" : "Want to join our upcoming activities?"}
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            {ar ? "سجّل الآن وكن أول من يعلم." : "Register now and be the first to know."}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link href={`/${locale}/join`}
              className="inline-block text-white px-10 py-3.5 rounded-full font-bold hover:opacity-90 transition-opacity shadow-xl shadow-turquoise/30"
              style={{ background: "linear-gradient(to right, #6D28D9, #4FC3E8)" }}>
              {ar ? "انخرط معنا" : "Join Us"}
            </Link>
          </motion.div>
        </section>
      </AnimatedSection>
    </div>
  );
}
