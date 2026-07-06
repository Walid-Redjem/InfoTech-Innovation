"use client";
import { useLocale } from "next-intl";

const itemsEn = ["Innovation", "Community", "Education", "Technology", "Youth", "Impact", "Collaboration", "Digital", "Empowerment", "Change"];
const itemsAr = ["ابتكار", "مجتمع", "تعليم", "تكنولوجيا", "شباب", "أثر", "تعاون", "رقمي", "تمكين", "تغيير"];

export default function Marquee() {
  const locale = useLocale();
  const items = locale === "ar" ? itemsAr : itemsEn;
  const repeated = [...items, ...items, ...items];

  return (
    <div className="py-5 overflow-hidden relative" style={{ background: "#6B35A0" }}>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 z-10" style={{ background: "linear-gradient(to right, #6B35A0, transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-20 z-10" style={{ background: "linear-gradient(to left, #6B35A0, transparent)" }} />

      <div className="flex animate-marquee gap-0 whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-6">
            <span className="text-white/90 font-semibold text-sm tracking-widest uppercase">{item}</span>
            <span className="text-white/60 text-lg">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
