"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, GraduationCap, Building2, CheckCircle2, Download, Mail, RefreshCw, X } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import PageHeader from "@/components/PageHeader";
import FileUpload from "@/components/forms/FileUpload";
import FloatingInput from "@/components/forms/FloatingInput";
import { useToast } from "@/components/Toast";
import Breadcrumbs from "@/components/Breadcrumbs";

type Profile = "youth" | "teacher" | "institution";

const profiles: { key: Profile; icon: React.ElementType }[] = [
  { key: "youth", icon: Users },
  { key: "teacher", icon: GraduationCap },
  { key: "institution", icon: Building2 },
];

const interestKeys = ["education", "environment", "technology", "youth", "health", "other"];
const contributionKeys = ["volunteer", "mentor", "ideas", "sponsor", "other"];
const partnershipKeys = ["financial", "technical", "training", "network", "other"];

export default function JoinPage() {
  const t = useTranslations("join");
  const locale = useLocale();
  const ar = locale === "ar";
  const { showToast } = useToast();

  const [selected, setSelected] = useState<Profile>("youth");
  const [form, setForm] = useState<Record<string, string>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // OTP state
  const [otpToken, setOtpToken] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [showOtp, setShowOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [pendingData, setPendingData] = useState<Record<string, unknown>>({});

  const age = parseInt(form.age || "0");
  const isUnderage = selected === "youth" && age > 0 && age < 17;
  const isAdult = selected === "youth" && age >= 17;

  // Autosave draft
  useEffect(() => {
    const saved = localStorage.getItem(`join_draft_${selected}`);
    if (saved) { try { const d = JSON.parse(saved); setForm(d.form || {}); setInterests(d.interests || []); } catch {} }
  }, [selected]);
  useEffect(() => {
    if (Object.keys(form).length) localStorage.setItem(`join_draft_${selected}`, JSON.stringify({ form, interests }));
  }, [form, interests, selected]);

  // Social proof count
  useEffect(() => {
    import("firebase/firestore").then(async ({ getCountFromServer, collection }) => {
      try {
        const { db } = await import("@/lib/firebase");
        const snap = await getCountFromServer(collection(db, "registrations"));
        setMemberCount(snap.data().count);
      } catch {}
    });
  }, []);

  function formatPhone(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0,3)} ${d.slice(3)}`;
    if (d.length <= 8) return `${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6)}`;
    return `${d.slice(0,3)} ${d.slice(3,6)} ${d.slice(6,8)} ${d.slice(8,10)}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    const formatted = name === "phone" ? formatPhone(value) : value;
    setForm(prev => ({ ...prev, [name]: formatted }));
    setErrors(prev => ({ ...prev, [name]: false }));
  }

  function toggleInterest(key: string) {
    setInterests(prev => prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]);
  }

  function setFile(key: string, url: string) {
    setFileUrls(prev => ({ ...prev, [key]: url }));
    setErrors(prev => ({ ...prev, [key]: false }));
  }

  function isValidEmail(email: string) {
    return email.toLowerCase().trim().endsWith("@gmail.com");
  }

  const emailErrorMsg = ar
    ? "يجب أن يكون البريد الإلكتروني @gmail.com"
    : "Email must be a @gmail.com address";

  function validate() {
    const newErrors: Record<string, boolean> = {};

    if (selected === "youth") {
      if (!form.name?.trim()) newErrors.name = true;
      if (!form.email?.trim() || !isValidEmail(form.email)) newErrors.email = true;
      if (!form.phone?.trim()) newErrors.phone = true;
      if (!form.age?.trim()) newErrors.age = true;
      if (!form.contribution) newErrors.contribution = true;
      if (!fileUrls.birth_certificate) newErrors.birth_certificate = true;
      if (isUnderage && !fileUrls.underage_form) newErrors.underage_form = true;
      if (isAdult && !fileUrls.adult_form) newErrors.adult_form = true;
    }

    if (selected === "teacher") {
      if (!form.name?.trim()) newErrors.name = true;
      if (!form.email?.trim() || !isValidEmail(form.email)) newErrors.email = true;
      if (!form.phone?.trim()) newErrors.phone = true;
      if (!form.institution_name?.trim()) newErrors.institution_name = true;
      if (!form.specialty?.trim()) newErrors.specialty = true;
      if (!form.contribution) newErrors.contribution = true;
      if (!fileUrls.birth_certificate) newErrors.birth_certificate = true;
      if (!fileUrls.resume) newErrors.resume = true;
      if (!fileUrls.selfie) newErrors.selfie = true;
      if (!fileUrls.degree) newErrors.degree = true;
    }

    if (selected === "institution") {
      if (!form.institution_name?.trim()) newErrors.institution_name = true;
      if (!form.contact_person?.trim()) newErrors.contact_person = true;
      if (!form.email?.trim() || !isValidEmail(form.email)) newErrors.email = true;
      if (!form.phone?.trim()) newErrors.phone = true;
      if (!form.partnership) newErrors.partnership = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    setSubmitting(true);
    setError(false);
    try {
      // Check for duplicate email
      const existing = await getDocs(query(collection(db, "registrations"), where("email", "==", form.email.toLowerCase().trim())));
      if (!existing.empty) {
        setErrors(prev => ({ ...prev, email: true }));
        setError(true);
        setSubmitting(false);
        return;
      }
      // Save data to send after verification
      setPendingData({ ...form, email: form.email.toLowerCase().trim(), category: selected, interests, files: fileUrls, underage: isUnderage, locale, status: "pending" });
      // Send OTP
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpToken(data.token);
      setOtpDigits(["", "", "", "", "", ""]);
      setShowOtp(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setOtpError("");
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpToken(data.token);
      setOtpDigits(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch {
      setOtpError(ar ? "فشل إعادة الإرسال. حاول مرة أخرى." : "Failed to resend. Try again.");
    } finally {
      setResending(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setOtpError("");
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every(d => d !== "") && next.join("").length === 6) {
      verifyOtp(next.join(""));
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split("");
      setOtpDigits(digits);
      otpRefs.current[5]?.focus();
      verifyOtp(pasted);
    }
  }

  async function verifyOtp(code: string) {
    setVerifying(true);
    setOtpError("");
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpToken, code }),
      });
      const data = await res.json();
      if (!data.valid) {
        setOtpError(
          data.error === "expired"
            ? (ar ? "انتهت صلاحية الرمز. اطلب رمزاً جديداً." : "Code expired. Request a new one.")
            : (ar ? "رمز غير صحيح. حاول مرة أخرى." : "Incorrect code. Try again.")
        );
        setOtpDigits(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        return;
      }
      // Code valid — save registration
      await addDoc(collection(db, "registrations"), {
        ...pendingData,
        createdAt: serverTimestamp(),
      });
      // Notify admin (fire and forget — don't block success screen)
      fetch("/api/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: (pendingData as Record<string,unknown>).name || (pendingData as Record<string,unknown>).institution_name,
          email: (pendingData as Record<string,unknown>).email,
          phone: (pendingData as Record<string,unknown>).phone,
          category: (pendingData as Record<string,unknown>).category,
          locale,
        }),
      });
      confetti({ particleCount: 160, spread: 80, colors: ["#9B6B9B", "#2EC4B6", "#D9C5E8", "#f97316", "#6366f1"], origin: { y: 0.55 } });
      setTimeout(() => confetti({ particleCount: 80, spread: 120, colors: ["#9B6B9B", "#2EC4B6", "#D9C5E8"], origin: { y: 0.5, x: 0.3 } }), 300);
      setTimeout(() => confetti({ particleCount: 80, spread: 120, colors: ["#9B6B9B", "#2EC4B6", "#f97316"], origin: { y: 0.5, x: 0.7 } }), 500);
      showToast(ar ? "تم التسجيل بنجاح! 🎉" : "Registration successful! 🎉", "success");
      setSuccess(true);
    } catch {
      setOtpError(ar ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
            <CheckCircle2 className="w-20 h-20 text-turquoise mx-auto mb-6" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#6B35A0" }}>{t("success_title")}</h2>
          <p className="text-gray-500">{t("success_message")}</p>
        </motion.div>
      </div>
    );
  }

  // OTP verification screen
  if (showOtp) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 bg-gradient-to-b from-white to-lilac/20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-lilac rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail className="w-8 h-8 text-mauve" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#6B35A0" }}>
              {ar ? "تحقق من بريدك الإلكتروني" : "Check your email"}
            </h2>
            <p className="text-gray-500 text-sm mb-1">
              {ar ? "أرسلنا رمزاً من 6 أرقام إلى" : "We sent a 6-digit code to"}
            </p>
            <p className="text-mauve font-semibold mb-8">{form.email}</p>

            {/* 6-digit input */}
            <div className="flex gap-3 justify-center mb-6" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all ${
                    digit ? "border-mauve bg-lilac text-mauve" : "border-gray-200 focus:border-mauve"
                  } ${otpError ? "border-red-400 bg-red-50" : ""}`}
                  disabled={verifying}
                />
              ))}
            </div>

            {verifying && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-mauve text-sm mb-4">
                <div className="w-4 h-4 border-2 border-mauve/30 border-t-mauve rounded-full animate-spin" />
                {ar ? "جارٍ التحقق..." : "Verifying..."}
              </motion.div>
            )}

            {otpError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-500 text-sm mb-4">{otpError}</motion.p>
            )}

            <p className="text-gray-400 text-sm mb-4">
              {ar ? "لم تستلم الرمز؟" : "Didn't receive the code?"}
            </p>
            <button onClick={handleResend} disabled={resending}
              className="flex items-center gap-2 mx-auto text-mauve text-sm font-semibold hover:opacity-70 transition-opacity disabled:opacity-40">
              <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
              {ar ? "إعادة الإرسال" : "Resend code"}
            </button>

            <button onClick={() => setShowOtp(false)}
              className="mt-6 text-gray-400 text-xs hover:text-gray-600 transition-colors block mx-auto">
              {ar ? "← العودة إلى النموذج" : "← Back to form"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        badge={ar ? "انخرط معنا" : "Join Us"}
        title={ar ? "كن جزءاً من التغيير" : "Be Part of the Change"}
        subtitle={ar ? "اختر فئتك وأدخل بياناتك. سنتواصل معك قريباً." : "Choose your profile and fill in your details. We will get back to you shortly."}
      />

      <div className="bg-gradient-to-b from-white to-lilac/20 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumbs crumbs={[{ label: ar ? "انضم إلينا" : "Join Us" }]} />

          {/* Social proof */}
          {memberCount !== null && memberCount > 0 && (
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
              <div className="flex -space-x-1.5">
                {["#9B6B9B","#2EC4B6","#6366f1"].map(c => (
                  <div key={c} className="w-6 h-6 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <span>
                {ar ? `انضم ${memberCount}+ عضو بالفعل` : `${memberCount}+ members already joined`}
              </span>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-10 gap-0">
            {[
              { label: ar ? "التفاصيل" : "Details",  active: !showOtp && !success, done: showOtp || success },
              { label: ar ? "التحقق"   : "Verify",   active: showOtp,              done: success },
              { label: ar ? "تم!"      : "Done!",    active: success,              done: false },
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={{ scale: step.active ? 1.15 : 1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      step.done  ? "bg-turquoise border-turquoise text-white" :
                      step.active? "text-white shadow-lg shadow-mauve/30" :
                                   "bg-white border-gray-200 text-gray-400"
                    }`}
                    style={step.active ? { background: "#6B35A0", borderColor: "#6B35A0" } : undefined}
                  >
                    {step.done ? "✓" : i + 1}
                  </motion.div>
                  <span className={`text-xs font-medium ${step.done ? "text-turquoise" : step.active ? "" : "text-gray-400"}`}
                    style={step.active ? { color: "#6B35A0" } : undefined}>
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`w-16 md:w-24 h-[2px] mx-1 mb-4 rounded-full transition-colors ${
                    step.done ? "bg-turquoise" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Profile selector */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {profiles.map(({ key, icon: Icon }) => (
              <button key={key} type="button"
                onClick={() => { setSelected(key); setForm({}); setErrors({}); setInterests([]); setFileUrls({}); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-semibold text-sm ${
                  selected === key ? "text-white shadow-md" : "border-lilac-dark bg-white text-mauve hover:border-mauve"
                }`}
                style={selected === key ? { background: "#6B35A0", borderColor: "#6B35A0" } : undefined}>
                <Icon className="w-6 h-6" />
                {t(`profiles.${key}`)}
              </button>
            ))}
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-sm p-6 md:p-8 space-y-5 ${shaking ? "shake" : ""}`}>

            {/* ── YOUTH ── */}
            {selected === "youth" && <>
              <FloatingInput name="name" label={t("fields.name")} value={form.name || ""} onChange={handleChange} error={errors.name} required maxLength={100} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput name="email" label={t("fields.email")} type="email" value={form.email || ""} onChange={handleChange} error={errors.email} errorMessage={emailErrorMsg} required maxLength={254} />
                <FloatingInput name="phone" label={t("fields.phone")} type="tel" value={form.phone || ""} onChange={handleChange} error={errors.phone} required maxLength={20} />
              </div>
              <FloatingInput name="age" label={t("fields.age")} type="number" min="8" max="35" value={form.age || ""} onChange={handleChange} error={errors.age} required />
              <Field label={t("fields.interests")}>
                <div className="flex flex-wrap gap-2">
                  {interestKeys.map(key => (
                    <button type="button" key={key} onClick={() => toggleInterest(key)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        interests.includes(key) ? "bg-turquoise text-white border-turquoise" : "bg-white text-gray-500 border-gray-200 hover:border-turquoise"
                      }`}>
                      {t(`interests.${key}`)}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={t("fields.contribution")} error={errors.contribution}>
                <select name="contribution" value={form.contribution || ""} onChange={handleChange} className={inputClass(errors.contribution)}>
                  <option value=""></option>
                  {contributionKeys.map(key => <option key={key} value={key}>{t(`contribution.${key}`)}</option>)}
                </select>
              </Field>

              {/* Birth certificate */}
              <FileUpload
                label={t("fields.birth_certificate")} required
                hint={t("upload_hint")} folder="registrations/birth-certificates"
                onUpload={url => setFile("birth_certificate", url)}
                onClear={() => setFile("birth_certificate", "")}
                error={errors.birth_certificate}
              />

              {/* Underage section */}
              {isUnderage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 space-y-4">
                  <div>
                    <p className="font-semibold text-amber-800 mb-1">{t("underage.title")}</p>
                    <p className="text-sm text-amber-700">{t("underage.description")}</p>
                  </div>
                  <a href="/forms/inscription-underage.pdf" download
                    className="inline-flex items-center gap-2 bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-amber-700 transition-colors">
                    <Download className="w-4 h-4" />
                    {t("underage.download")}
                  </a>
                  <FileUpload
                    label={t("underage.upload_label")} required
                    hint={t("upload_hint")} folder="registrations/underage-forms"
                    onUpload={url => setFile("underage_form", url)}
                    onClear={() => setFile("underage_form", "")}
                    error={errors.underage_form}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </motion.div>
              )}

              {/* Adult form section */}
              {isAdult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 space-y-4">
                  <div>
                    <p className="font-semibold text-blue-800 mb-1">{t("adult_form.title")}</p>
                    <p className="text-sm text-blue-700">{t("adult_form.description")}</p>
                  </div>
                  <a href="/forms/inscription-adult.pdf" download
                    className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    {t("adult_form.download")}
                  </a>
                  <FileUpload
                    label={t("adult_form.upload_label")} required
                    hint={t("upload_hint")} folder="registrations/adult-forms"
                    onUpload={url => setFile("adult_form", url)}
                    onClear={() => setFile("adult_form", "")}
                    error={errors.adult_form}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </motion.div>
              )}
            </>}

            {/* ── TEACHER ── */}
            {selected === "teacher" && <>
              <FloatingInput name="name" label={t("fields.name")} value={form.name || ""} onChange={handleChange} error={errors.name} required maxLength={100} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput name="email" label={t("fields.email")} type="email" value={form.email || ""} onChange={handleChange} error={errors.email} errorMessage={emailErrorMsg} required maxLength={254} />
                <FloatingInput name="phone" label={t("fields.phone")} type="tel" value={form.phone || ""} onChange={handleChange} error={errors.phone} required maxLength={20} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput name="institution_name" label={t("fields.institution_name")} value={form.institution_name || ""} onChange={handleChange} error={errors.institution_name} required />
                <FloatingInput name="specialty" label={t("fields.specialty")} value={form.specialty || ""} onChange={handleChange} error={errors.specialty} required />
              </div>
              <Field label={t("fields.interests")}>
                <div className="flex flex-wrap gap-2">
                  {interestKeys.map(key => (
                    <button type="button" key={key} onClick={() => toggleInterest(key)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        interests.includes(key) ? "bg-turquoise text-white border-turquoise" : "bg-white text-gray-500 border-gray-200 hover:border-turquoise"
                      }`}>
                      {t(`interests.${key}`)}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={t("fields.contribution")} error={errors.contribution}>
                <select name="contribution" value={form.contribution || ""} onChange={handleChange} className={inputClass(errors.contribution)}>
                  <option value=""></option>
                  {contributionKeys.map(key => <option key={key} value={key}>{t(`contribution.${key}`)}</option>)}
                </select>
              </Field>

              <div className="border-t border-lilac-dark/30 pt-5">
                <p className="text-sm font-semibold text-mauve mb-4">
                  {ar ? "الوثائق المطلوبة" : "Required Documents"}
                </p>
                <div className="space-y-4">
                  <FileUpload label={t("fields.birth_certificate")} required hint={t("upload_hint")} folder="registrations/teachers/birth-cert" onUpload={url => setFile("birth_certificate", url)} onClear={() => setFile("birth_certificate", "")} error={errors.birth_certificate} />
                  <FileUpload label={t("fields.resume")} required hint={t("upload_hint")} folder="registrations/teachers/resume" onUpload={url => setFile("resume", url)} onClear={() => setFile("resume", "")} error={errors.resume} accept=".pdf,.doc,.docx" />
                  <FileUpload label={t("fields.selfie")} required hint={ar ? "JPG أو PNG" : "JPG or PNG"} folder="registrations/teachers/selfie" onUpload={url => setFile("selfie", url)} onClear={() => setFile("selfie", "")} error={errors.selfie} accept=".jpg,.jpeg,.png" />
                  <FileUpload label={t("fields.degree")} required hint={t("upload_hint")} folder="registrations/teachers/degree" onUpload={url => setFile("degree", url)} onClear={() => setFile("degree", "")} error={errors.degree} />
                </div>
              </div>
            </>}

            {/* ── INSTITUTION ── */}
            {selected === "institution" && <>
              <FloatingInput name="institution_name" label={t("fields.institution_name")} value={form.institution_name || ""} onChange={handleChange} error={errors.institution_name} required />
              <FloatingInput name="contact_person" label={t("fields.contact_person")} value={form.contact_person || ""} onChange={handleChange} error={errors.contact_person} required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput name="email" label={t("fields.email")} type="email" value={form.email || ""} onChange={handleChange} error={errors.email} errorMessage={emailErrorMsg} required maxLength={254} />
                <FloatingInput name="phone" label={t("fields.phone")} type="tel" value={form.phone || ""} onChange={handleChange} error={errors.phone} required maxLength={20} />
              </div>
              <Field label={t("fields.partnership")} error={errors.partnership}>
                <select name="partnership" value={form.partnership || ""} onChange={handleChange} className={inputClass(errors.partnership)}>
                  <option value=""></option>
                  {partnershipKeys.map(key => <option key={key} value={key}>{t(`partnership.${key}`)}</option>)}
                </select>
              </Field>
              <Field label={t("fields.description")}>
                <div className="relative">
                  <textarea name="description" value={form.description || ""} onChange={handleChange}
                    rows={4} placeholder={t("fields.description_placeholder")} maxLength={500}
                    className={`${inputClass(false)} resize-none pb-6`} />
                  <span className="absolute bottom-2 end-3 text-xs text-gray-400">{(form.description || "").length}/500</span>
                </div>
              </Field>
            </>}

            {/* Terms notice */}
            <p className="text-xs text-gray-400">
              {ar ? "بالتسجيل، أنت توافق على " : "By registering, you agree to our "}
              <button type="button" onClick={() => setShowTerms(true)} className="text-mauve underline hover:text-turquoise transition-colors">
                {ar ? "الشروط وسياسة الخصوصية" : "Terms & Privacy Policy"}
              </button>
            </p>

            {error && (
              <p className="text-red-500 text-sm">
                {errors.email ? t("duplicate_email") : t("error")}
              </p>
            )}

            <div className="gradient-border-outer block w-full">
              <motion.button type="submit" disabled={submitting}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="gradient-border-inner block w-full text-white py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-mauve/20"
                style={{ background: "linear-gradient(to right, #6D28D9, #4FC3E8)" }}>
                {submitting ? t("submitting") : t("submit")}
              </motion.button>
            </div>
          </form>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowTerms(false); setTermsChecked(false); }} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">{ar ? "الشروط وسياسة الخصوصية" : "Terms & Privacy Policy"}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{ar ? "آخر تحديث: يونيو 2026" : "Last updated: June 2026"}</p>
              </div>
              <button onClick={() => { setShowTerms(false); setTermsChecked(false); }} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4 flex-1">
              {(ar ? sectionsAr : sectionsEn).map((section, i) => (
                <div key={i} className="bg-gradient-to-br from-lilac/30 to-white rounded-2xl p-4 border border-lilac-dark/20">
                  <h3 className="font-bold text-mauve text-sm mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))}
            </div>
            {/* Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsChecked}
                  onChange={e => setTermsChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-mauve cursor-pointer flex-shrink-0"
                />
                <span className="text-xs text-gray-500">
                  {ar ? "لقد قرأت الشروط وسياسة الخصوصية وأوافق عليها" : "I have read and agree to the Terms & Privacy Policy"}
                </span>
              </label>
              <button
                onClick={() => { if (termsChecked) setShowTerms(false); }}
                disabled={!termsChecked}
                className="w-full text-white py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: "linear-gradient(to right, #6D28D9, #4FC3E8)" }}
              >
                {ar ? "فهمت" : "Got it"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const sectionsEn = [
  { title: "1. Data We Collect", content: `When you register or use our platform, we may collect the following information:\n• Full name, email address, phone number, and age\n• Documents you upload: birth certificate, resume, diploma, profile photo, or signed parental consent forms\n• Community issues and ideas you submit\n• Survey responses\n• Chatbot interaction data (anonymized)\nAll data is stored securely on Firebase (Google Cloud) and is accessible only to the InfoTech Innovation administration team.` },
  { title: "2. How We Use Your Data", content: `Your data is used exclusively to:\n• Process your registration and validate your membership\n• Contact you regarding your application status\n• Organize activities and track participation\n• Analyze community needs and improve our services\n• Publish anonymized impact statistics on the platform\nWe do not sell or share your personal data with third parties.` },
  { title: "3. Parental Consent (Minors Under 17)", content: `For participants under the age of 17, a signed parental consent form is mandatory before registration is validated.\nBy submitting the signed form, the parent or legal guardian:\n• Consents to their child's participation in all club activities\n• Agrees to the use of photos/videos taken during sessions for educational and promotional purposes on the club's official pages\n• Can withdraw consent at any time by submitting a written request` },
  { title: "4. File Uploads & Storage", content: `Files you upload (birth certificates, resumes, photos, forms) are stored securely on Firebase Storage. These files are:\n• Accessible only to authorized administrators\n• Used solely for registration verification\n• Never shared publicly or with external parties\n• Retained for the duration of your membership and deleted upon written request` },
  { title: "5. Photos & Media", content: `By registering, you acknowledge that photos or videos taken during sessions may be used for educational or promotional purposes on the club's official social media pages and website.\nIf you do not consent to this, you must notify us in writing before the start of your first session. Your request will be honored and no media featuring you will be published.` },
  { title: "6. Your Rights", content: `You have the right to:\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your data at any time\n• Withdraw from the platform by submitting a written request\nTo exercise any of these rights, contact us at: contact@infotech.dz` },
  { title: "7. Platform Rules", content: `By using this platform, you agree to:\n• Provide accurate and truthful information\n• Not upload inappropriate, harmful, or misleading content\n• Respect other community members and their submissions\n• Not use this platform for commercial purposes without prior written consent\nViolations may result in immediate removal from the platform.` },
  { title: "8. Contact", content: `For any questions regarding these terms or your personal data:\n📧 contact@infotech.dz\n📞 0552 24 52 19 / 0775 65 41 04\nInfoTech Innovation` },
];

const sectionsAr = [
  { title: "١. البيانات التي نجمعها", content: `عند التسجيل أو استخدام المنصة، قد نجمع المعلومات التالية:\n• الاسم الكامل، البريد الإلكتروني، رقم الهاتف، والعمر\n• الوثائق التي تقوم برفعها: شهادة الميلاد، السيرة الذاتية، الشهادة، الصورة الشخصية، أو استمارة الموافقة الأبوية الموقعة\n• الإشكاليات والأفكار المجتمعية التي تقدمها\n• ردود الاستبيانات\n• بيانات التفاعل مع الشات بوت (مجهولة الهوية)\nتُخزَّن جميع البيانات بشكل آمن على Firebase (Google Cloud) ولا يمكن الوصول إليها إلا من قِبل فريق إدارة InfoTech Innovation.` },
  { title: "٢. كيف نستخدم بياناتك", content: `تُستخدم بياناتك حصراً من أجل:\n• معالجة تسجيلك والتحقق من عضويتك\n• التواصل معك بشأن حالة طلبك\n• تنظيم الأنشطة وتتبع المشاركة\n• تحليل احتياجات المجتمع وتحسين خدماتنا\n• نشر إحصاءات الأثر المجهولة على المنصة\nنحن لا نبيع بياناتك الشخصية ولا نشاركها مع أطراف ثالثة.` },
  { title: "٣. الموافقة الأبوية (القاصرون دون 17 سنة)", content: `للمشاركين الذين تقل أعمارهم عن 17 سنة، تُعدّ استمارة الموافقة الأبوية الموقعة إلزامية قبل التحقق من التسجيل.\nبتقديم الاستمارة الموقعة، يوافق الوالد أو الوصي القانوني على:\n• مشاركة طفله في جميع أنشطة النادي\n• استخدام الصور/الفيديوهات الملتقطة خلال الجلسات لأغراض تعليمية أو دعائية على الصفحات الرسمية للنادي\n• يمكن سحب الموافقة في أي وقت بتقديم طلب كتابي` },
  { title: "٤. رفع الملفات والتخزين", content: `الملفات التي ترفعها (شهادات الميلاد، السير الذاتية، الصور، الاستمارات) تُخزَّن بشكل آمن على Firebase Storage. هذه الملفات:\n• لا يمكن الوصول إليها إلا من قِبل المسؤولين المعتمدين\n• تُستخدم فقط للتحقق من التسجيل\n• لا تُشارك علناً أو مع أطراف خارجية\n• تُحتفظ بها طوال مدة عضويتك وتُحذف عند الطلب الكتابي` },
  { title: "٥. الصور والوسائط", content: `بالتسجيل، تقر بأن الصور أو الفيديوهات الملتقطة خلال الجلسات قد تُستخدم لأغراض تعليمية أو دعائية على صفحات النادي الرسمية وموقعه الإلكتروني.\nإذا لم توافق على ذلك، يجب إخطارنا كتابياً قبل بداية حصتك الأولى. سيتم احترام طلبك ولن يُنشر أي محتوى وسائط يظهرك فيه.` },
  { title: "٦. حقوقك", content: `لك الحق في:\n• الاطلاع على البيانات الشخصية التي نحتفظ بها عنك\n• طلب تصحيح البيانات غير الدقيقة\n• طلب حذف بياناتك في أي وقت\n• الانسحاب من المنصة بتقديم طلب كتابي\nلممارسة أي من هذه الحقوق، تواصل معنا على: contact@infotech.dz` },
  { title: "٧. قواعد المنصة", content: `باستخدام هذه المنصة، توافق على:\n• تقديم معلومات دقيقة وصحيحة\n• عدم رفع محتوى غير لائق أو ضار أو مضلل\n• احترام أعضاء المجتمع الآخرين ومساهماتهم\n• عدم استخدام المنصة لأغراض تجارية دون موافقة كتابية مسبقة\nقد تؤدي المخالفات إلى الإزالة الفورية من المنصة.` },
  { title: "٨. التواصل", content: `لأي استفسارات تتعلق بهذه الشروط أو بياناتك الشخصية:\n📧 contact@infotech.dz\n📞 0552 24 52 19 / 0775 65 41 04\nInfoTech Innovation` },
];

function Field({ label, error, children }: { label: string; error?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#6B35A0" }}>{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">Required</p>}
    </div>
  );
}

function inputClass(error: boolean | undefined) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
    error ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-mauve"
  }`;
}
