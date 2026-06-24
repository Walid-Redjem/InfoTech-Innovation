"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useParams, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const isLoginPage = pathname.includes("/admin/login");
      if (!user && !isLoginPage) {
        router.replace(`/${locale}/admin/login`);
      } else if (user && isLoginPage) {
        router.replace(`/${locale}/admin`);
      }
      setChecking(false);
    });
    return unsub;
  }, [pathname, locale, router]);

  if (checking) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-lilac-dark border-t-mauve rounded-full animate-spin" />
      </div>
    );
  }

  // Full-screen overlay — hides public Navbar & Footer
  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 overflow-auto">
      {children}
    </div>
  );
}
