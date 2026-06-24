"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const ar = locale === "ar";

  function switchLocale() {
    const next = locale === "ar" ? "en" : "ar";
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"));
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(`/${locale}/admin`);
    } catch {
      setError(ar ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const Arrow = ar ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex" dir={ar ? "rtl" : "ltr"}>

      {/* Branding panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #9B6B9B 0%, #2EC4B6 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <motion.div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} />
        <motion.div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 8, repeat: Infinity }} />

        <div className="relative">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 inline-block">
            <Image src="/logo.png" alt="InfoTech Innovation" width={90} height={90} className="object-contain" />
          </div>
        </div>

        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              {ar ? "بوابة الإدارة" : "Admin Portal"}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              {ar
                ? "أدر التسجيلات وردود الاستبيانات والإشكاليات ومحتوى المنصة — كل شيء في مكان واحد."
                : "Manage registrations, survey responses, issues, and platform content — all in one place."}
            </p>
          </motion.div>
        </div>

        <div className="relative flex gap-8">
          {(ar
            ? [["التسجيلات", "المستخدمون"], ["الإشكاليات", "المقدمة"], ["الاستبيانات", "النشطة"]]
            : [["Registrations", "Users"], ["Issues", "Submitted"], ["Surveys", "Active"]]
          ).map(([label, sub]) => (
            <div key={label}>
              <p className="text-white font-bold text-lg">{label}</p>
              <p className="text-white/50 text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <motion.div initial={{ opacity: 0, x: ar ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Image src="/logo.png" alt="InfoTech Innovation" width={50} height={50} className="object-contain" />
            <span className="font-bold text-mauve text-lg">InfoTech Innovation</span>
          </div>

          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mauve to-turquoise flex items-center justify-center mb-5 shadow-lg shadow-mauve/30">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              {ar ? "أهلاً بعودتك" : "Welcome back"}
            </h2>
            <p className="text-gray-400 text-sm">
              {ar ? "سجّل دخولك للوصول إلى لوحة التحكم" : "Sign in to access the admin dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {ar ? "البريد الإلكتروني" : "Email address"}
              </label>
              <div className="relative">
                <Mail className={`absolute ${ar ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="admin@infotech.dz"
                  className={`w-full ${ar ? "pr-11 pl-4" : "pl-11 pr-4"} py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-mauve focus:ring-2 focus:ring-mauve/10 transition-all bg-gray-50 focus:bg-white`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {ar ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock className={`absolute ${ar ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className={`w-full ${ar ? "pr-11 pl-12" : "pl-11 pr-12"} py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-mauve focus:ring-2 focus:ring-mauve/10 transition-all bg-gray-50 focus:bg-white`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className={`absolute ${ar ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-gray-400 hover:text-mauve transition-colors`}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </motion.div>
            )}

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-mauve to-turquoise text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-mauve/25 hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>{ar ? "تسجيل الدخول" : "Sign In"} <Arrow className="w-4 h-4" /></>
              }
            </motion.button>
          </form>

          <div className="flex items-center justify-between mt-8">
            <p className="text-xs text-gray-400">
              InfoTech Innovation — {ar ? "وصول مقيّد" : "Restricted Access"}
            </p>
            <button onClick={switchLocale}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-mauve text-mauve hover:bg-mauve hover:text-white transition-colors">
              {ar ? "EN" : "عربي"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
