"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Info, UserPlus, AlertCircle, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/",          icon: Home,        key: "home" },
  { href: "/about",     icon: Info,        key: "about" },
  { href: "/join",      icon: UserPlus,    key: "join" },
  { href: "/issues",    icon: AlertCircle, key: "issues" },
  { href: "/surveys",   icon: BarChart3,   key: "surveys" },
];

export default function MobileBottomNav() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-lilac-dark/30 pb-safe">
      <div className="flex justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, key }) => {
          const full = `/${locale}${href === "/" ? "" : href}`;
          const active = href === "/" ? pathname === full : pathname.startsWith(full);
          return (
            <Link key={href} href={full} className="flex flex-col items-center gap-0.5 min-w-[52px]">
              <div className={`relative p-1.5 rounded-xl transition-all ${active ? "bg-mauve text-white shadow-md shadow-mauve/30" : "text-gray-400"}`}>
                <Icon className="w-5 h-5" />
                {active && (
                  <motion.div layoutId="nav-dot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-mauve" />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${active ? "text-mauve" : "text-gray-400"}`}>
                {t(key as "home")}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
