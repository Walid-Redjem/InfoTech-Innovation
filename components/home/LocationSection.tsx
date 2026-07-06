"use client";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const MAPS_URL = "https://maps.app.goo.gl/JX5N9XeFwBd25Bk86";

export default function LocationSection() {
  const t = useTranslations("home.location");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const contactItems = [
    {
      icon: MapPin,
      label: t("address"),
      value: isRTL ? "GC38+JXC، شارع مراد، الجزائر" : "GC38+JXC, rue de, Merad, Algeria",
      href: MAPS_URL,
    },
    {
      icon: Phone,
      label: t("phone"),
      value: "+213 775 654 104",
      href: "tel:+213775654104",
      dir: "ltr" as const,
    },
    {
      icon: Mail,
      label: t("email"),
      value: "contact@infotech.dz",
      href: "mailto:contact@infotech.dz",
    },
  ];

  return (
    <section className="py-14 md:py-24 px-6 bg-gradient-to-br from-white to-lilac/20 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-turquoise/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-mauve/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: "#6B35A0" }}>
            {t("label")}
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: "#6B35A0" }}>{t("title")}</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-mauve to-turquoise rounded-full mx-auto mb-5" />
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">{t("subtitle")}</p>
        </AnimatedSection>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">

          {/* Left: contact info */}
          <AnimatedSection className="lg:col-span-2 flex flex-col gap-4">
            {contactItems.map(({ icon: Icon, label, value, href, dir }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-md border border-lilac-dark/15 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mauve/10 to-turquoise/10 flex items-center justify-center shrink-0 group-hover:from-mauve/20 group-hover:to-turquoise/20 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-mauve" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-700 break-all" dir={dir} style={dir ? { textAlign: isRTL ? "right" : "left" } : undefined}>{value}</p>
                </div>
              </a>
            ))}

            {/* Open in Maps CTA */}
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-white font-semibold text-sm rounded-2xl py-4 px-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 mt-auto"
              style={{ background: "linear-gradient(to right, #6D28D9, #4FC3E8)" }}
            >
              <ExternalLink className="w-4 h-4" />
              {t("openMaps")}
            </a>
          </AnimatedSection>

          {/* Right: map */}
          <AnimatedSection delay={0.2} className="lg:col-span-3">
            <div className="relative h-full min-h-[340px] rounded-3xl overflow-hidden shadow-2xl border border-lilac-dark/20 group">
              <div className="absolute inset-0 bg-gradient-to-br from-mauve/10 to-turquoise/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
              <iframe
                src="https://www.google.com/maps?cid=12137829376146631135&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 340 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t("title")}
                className="w-full h-full"
              />
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}
