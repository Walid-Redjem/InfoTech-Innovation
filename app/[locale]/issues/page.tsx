"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2, BookOpen, Leaf, Users, Cpu, Heart, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";

const typeKeys = ["education", "environment", "youth", "technology", "health", "other"] as const;
type IssueType = typeof typeKeys[number];

const typeIcons: Record<IssueType, React.ElementType> = {
  education: BookOpen,
  environment: Leaf,
  youth: Users,
  technology: Cpu,
  health: Heart,
  other: MoreHorizontal,
};

export default function IssuesPage() {
  const t = useTranslations("issues");
  const locale = useLocale();

  const [type, setType] = useState<IssueType>("education");
  const [form, setForm] = useState({ title: "", description: "", affected_group: "", solution: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  }

  function validate() {
    const newErrors: Record<string, boolean> = {};
    if (!form.title.trim()) newErrors.title = true;
    if (!form.description.trim()) newErrors.description = true;
    if (!form.affected_group.trim()) newErrors.affected_group = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(false);
    try {
      await addDoc(collection(db, "issues"), {
        type,
        title: form.title,
        description: form.description,
        affected_group: form.affected_group,
        solution: form.solution || null,
        locale,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const ar = locale === "ar";

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
            <CheckCircle2 className="w-20 h-20 text-turquoise mx-auto mb-6" />
          </motion.div>
          <h2 className="text-2xl font-bold text-mauve mb-2">{t("success_title")}</h2>
          <p className="text-gray-500 mb-6">{t("success_message")}</p>
          <button onClick={() => { setSuccess(false); setForm({ title: "", description: "", affected_group: "", solution: "" }); }}
            className="text-turquoise font-semibold hover:underline">
            {t("submit_another")}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        badge={ar ? "إشكاليات وأفكار" : "Issues & Ideas"}
        title={ar ? "صوتك يُحدث الفرق" : "Your Voice Makes a Difference"}
        subtitle={ar ? "شارك مشكلة مجتمعية أو اقترح فكرة. كل صوت له قيمة." : "Share a community problem or propose an idea. Every voice matters."}
      />
    <div className="bg-gradient-to-b from-white to-lilac/20 py-16 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Type selector */}
        <div className="mb-6">
          <p className="text-sm font-medium text-mauve mb-3">{t("type_label")}</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {typeKeys.map((key) => {
              const Icon = typeIcons[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                    type === key
                      ? "border-turquoise bg-turquoise text-white shadow-md"
                      : "border-lilac-dark bg-white text-gray-500 hover:border-turquoise"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t(`types.${key}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-5">

          {/* Title */}
          <Field label={t("fields.title")} error={errors.title}>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={t("fields.title_placeholder")}
              className={inputClass(errors.title)}
            />
          </Field>

          {/* Description */}
          <Field label={t("fields.description")} error={errors.description}>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={t("fields.description_placeholder")}
              rows={5}
              className={inputClass(errors.description) + " resize-none"}
            />
          </Field>

          {/* Affected group */}
          <Field label={t("fields.affected_group")} error={errors.affected_group}>
            <input
              name="affected_group"
              value={form.affected_group}
              onChange={handleChange}
              placeholder={t("fields.affected_group_placeholder")}
              className={inputClass(errors.affected_group)}
            />
          </Field>

          {/* Solution (optional) */}
          <Field label={t("fields.solution")}>
            <textarea
              name="solution"
              value={form.solution}
              onChange={handleChange}
              placeholder={t("fields.solution_placeholder")}
              rows={3}
              className={inputClass(false) + " resize-none"}
            />
          </Field>

          {error && <p className="text-red-500 text-sm">{t("error")}</p>}

          <motion.button type="submit" disabled={submitting}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-mauve to-turquoise text-white py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-mauve/20">
            {submitting ? t("submitting") : t("submit")}
          </motion.button>
        </form>
      </div>
    </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-mauve mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">Required</p>}
    </div>
  );
}

function inputClass(error: boolean) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
    error ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-mauve"
  }`;
}
