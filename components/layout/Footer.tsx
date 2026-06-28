"use client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");
  const locale = useLocale();

  const quickLinks = [
    { href: "/about", label: t("about") },
    { href: "/join", label: t("join") },
    { href: "/issues", label: t("issues") },
    { href: "/surveys", label: t("surveys") },
    { href: "/activities", label: t("activities") },
    { href: "/faq", label: locale === "ar" ? "الأسئلة الشائعة" : "FAQ" },
    { href: "/terms", label: tf("terms") },
  ];

  return (
    <footer className="bg-mauve text-white">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <div className="mb-4 bg-white rounded-2xl p-2 inline-block">
            <Image src="/logo.png" alt="InfoTech Innovation" width={110} height={110} className="object-contain" />
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            {locale === "ar"
              ? "منصة رقمية لتمكين المجتمع من خلال الابتكار والتعاون."
              : "A digital platform empowering the community through innovation and collaboration."}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white/80 mb-4 text-sm uppercase tracking-wide">
            {locale === "ar" ? "روابط سريعة" : "Quick Links"}
          </h4>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={`/${locale}${link.href}`}
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white/80 mb-4 text-sm uppercase tracking-wide">
            {locale === "ar" ? "تواصل معنا" : "Contact"}
          </h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>contact@infotech.dz</li>
            <li>{locale === "ar" ? "الجزائر" : "Algeria"}</li>
          </ul>
          <Link
            href={`/${locale}/join`}
            className="inline-block mt-5 bg-turquoise text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-turquoise-dark transition-colors"
          >
            {locale === "ar" ? "انخرط معنا" : "Join Us"}
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} InfoTech Innovation.{" "}
          {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}
