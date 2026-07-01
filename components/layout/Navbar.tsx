"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === `/${locale}` || pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

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
          ? "bg-white/80 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-lilac-dark/50 dark:border-gray-700/50"
          : isHome
            ? "bg-black/30 backdrop-blur-sm border-b border-white/5"
            : "bg-transparent border-b border-transparent"
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <Image src="/logo.png" alt="InfoTech Innovation" width={110} height={110} className="object-contain" priority />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href} className="relative">
                <Link
                  href={`/${locale}${link.href === "/" ? "" : link.href}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors block ${
                    isActive(link.href)
                      ? (isHome && !scrolled ? "text-turquoise" : "text-mauve dark:text-lilac")
                      : (isHome && !scrolled ? "text-white/80 hover:text-white" : "text-gray-500 dark:text-gray-400 hover:text-mauve hover:bg-lilac/50 dark:hover:bg-mauve/10 dark:hover:text-lilac")
                  }`}
                >
                  {link.label}
                </Link>
                <AnimatePresence>
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                      style={{ background: "linear-gradient(90deg, #8B2FC9, #00BFFF)" }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${isHome && !scrolled ? "text-white/80 hover:text-white" : "text-mauve hover:bg-lilac dark:hover:bg-mauve/20"}`}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language toggle */}
            <motion.button
              onClick={switchLocale}
              whileTap={{ scale: 0.85, rotate: locale === "ar" ? -12 : 12 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full border-2 transition-colors ${isHome && !scrolled ? "border-white/40 text-white/80 hover:bg-white/10" : "border-mauve text-mauve hover:bg-mauve hover:text-white"}`}
            >
              {locale === "ar" ? "EN" : "عربي"}
            </motion.button>

            {/* Hamburger */}
            <button
              className={`md:hidden p-1.5 rounded-lg transition-colors ${isHome && !scrolled ? "text-white/80 hover:text-white" : "text-mauve hover:bg-lilac dark:hover:bg-mauve/20"}`}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-lilac-dark/50 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href === "/" ? "" : link.href}`}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-lilac text-mauve dark:bg-mauve/20 dark:text-lilac"
                    : "text-gray-500 dark:text-gray-400 hover:bg-lilac/50 hover:text-mauve dark:hover:bg-mauve/10 dark:hover:text-lilac"
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
