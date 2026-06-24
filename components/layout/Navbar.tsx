"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const links = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/join", label: t("join") },
    { href: "/issues", label: t("issues") },
    { href: "/surveys", label: t("surveys") },
    { href: "/activities", label: t("activities") },
  ];

  function isActive(href: string) {
    const full = `/${locale}${href === "/" ? "" : href}`;
    return href === "/" ? pathname === full : pathname.startsWith(full);
  }

  function switchLocale() {
    const next = locale === "ar" ? "en" : "ar";
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || "/");
  }

  return (
    <>
      <nav className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-lilac-dark/50"
          : "bg-white border-b border-transparent"
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <Image src="/logo.png" alt="InfoTech Innovation" width={110} height={110} className="object-contain" priority />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={`/${locale}${link.href === "/" ? "" : link.href}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-lilac text-mauve"
                      : "text-gray-500 hover:text-mauve hover:bg-lilac/50"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={switchLocale}
              className="text-sm font-semibold px-4 py-1.5 rounded-full border-2 border-mauve text-mauve hover:bg-mauve hover:text-white transition-colors"
            >
              {locale === "ar" ? "EN" : "عربي"}
            </button>

            {/* Hamburger */}
            <button
              className="md:hidden p-1.5 rounded-lg text-mauve hover:bg-lilac transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-lilac-dark/50 bg-white px-6 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href === "/" ? "" : link.href}`}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-lilac text-mauve"
                    : "text-gray-500 hover:bg-lilac/50 hover:text-mauve"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
