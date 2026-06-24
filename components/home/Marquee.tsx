"use client";
import { useLocale } from "next-intl";

const itemsEn = ["Innovation", "Community", "Education", "Technology", "Youth", "Impact", "Collaboration", "Digital", "Empowerment", "Change"];
const itemsAr = ["ابتكار", "مجتمع", "تعليم", "تكنولوجيا", "شباب", "أثر", "تعاون", "رقمي", "تمكين", "تغيير"];

export default function Marquee() {
  const locale = useLocale();
  const items = locale === "ar" ? itemsAr : itemsEn;
  const repeated = [...items, ...items, ...items];

  return (
    <div className="py-5 bg-mauve overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-mauve to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-mauve to-transparent z-10" />

      <div className="flex animate-marquee gap-0 whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-6">
            <span className="text-white/90 font-semibold text-sm tracking-widest uppercase">{item}</span>
            <span className="text-turquoise text-lg">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
