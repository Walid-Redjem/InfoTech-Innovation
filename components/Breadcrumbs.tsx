"use client";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ChevronRight, Home } from "lucide-react";

interface Crumb { label: string; href?: string }

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const locale = useLocale();
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-gray-400 flex-wrap mb-1">
      <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-mauve transition-colors">
        <Home className="w-3 h-3" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 opacity-50" />
          {crumb.href ? (
            <Link href={`/${locale}${crumb.href}`} className="hover:text-mauve transition-colors">{crumb.label}</Link>
          ) : (
            <span className="text-mauve font-semibold">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
