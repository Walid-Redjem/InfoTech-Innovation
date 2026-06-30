"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent";

export default function CookieBanner() {
  const locale = useLocale();
  const ar = locale === "ar";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[250] max-w-xl mx-auto"
        >
          <div className="bg-white border border-lilac-dark/20 rounded-2xl shadow-2xl shadow-mauve/10 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mauve/10 to-turquoise/10 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-4.5 h-4.5 text-mauve" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm mb-1">
                  {ar ? "نستخدم ملفات تعريف الارتباط" : "We use cookies"}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {ar
                    ? <>نستخدم ملفات تعريف الارتباط لتحسين تجربتك وضمان أمان النموذج. بالمتابعة، توافق على <Link href={`/${locale}/terms`} className="text-mauve underline underline-offset-2">سياسة الخصوصية</Link> الخاصة بنا.</>
                    : <>We use cookies to improve your experience and keep the platform secure. By continuing, you agree to our <Link href={`/${locale}/terms`} className="text-mauve underline underline-offset-2">Privacy Policy</Link>.</>
                  }
                </p>
              </div>
              <button onClick={decline} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0" aria-label="Dismiss">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={accept}
                className="flex-1 bg-gradient-to-r from-mauve to-turquoise text-white text-xs font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                {ar ? "قبول الكل" : "Accept All"}
              </button>
              <button
                onClick={decline}
                className="flex-1 bg-gray-100 text-gray-600 text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                {ar ? "رفض" : "Decline"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
