"use client";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClipboardList, CheckCircle2, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import PageHeader from "@/components/PageHeader";

type QuestionType = "text" | "choice" | "rating";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  context: string;
  questions: Question[];
}

type View = "list" | "form" | "success";

export default function SurveysPage() {
  const t = useTranslations("surveys");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchSurveys() {
      try {
        const snap = await getDocs(
          query(collection(db, "surveys"), where("active", "==", true))
        );
        setSurveys(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Survey)));
      } catch {
        // silently fail — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchSurveys();
  }, []);

  function openSurvey(survey: Survey) {
    setActiveSurvey(survey);
    setAnswers({});
    setErrors({});
    setView("form");
  }

  function handleAnswer(questionId: string, value: string | number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => ({ ...prev, [questionId]: false }));
  }

  function validate() {
    if (!activeSurvey) return false;
    const newErrors: Record<string, boolean> = {};
    activeSurvey.questions.forEach((q) => {
      if (q.required && !answers[q.id] && answers[q.id] !== 0) {
        newErrors[q.id] = true;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !activeSurvey) return;
    setSubmitting(true);
    setError(false);
    try {
      await addDoc(collection(db, "surveyResponses"), {
        surveyId: activeSurvey.id,
        surveyTitle: activeSurvey.title,
        answers,
        locale,
        createdAt: serverTimestamp(),
      });
      confetti({ particleCount: 130, spread: 75, colors: ["#9B6B9B","#2EC4B6","#EDE0F5","#6366f1"], origin: { y: 0.55 } });
      setTimeout(() => confetti({ particleCount: 60, spread: 100, colors: ["#9B6B9B","#2EC4B6"], origin: { y: 0.5, x: 0.3 } }), 350);
      setView("success");
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ── SUCCESS ──────────────────────────────────────────────
  if (view === "success") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-turquoise mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-mauve mb-2">{t("success_title")}</h2>
          <p className="text-gray-500 mb-6">{t("success_message")}</p>
          <button onClick={() => setView("list")} className="text-turquoise font-semibold hover:underline">
            {t("back_to_surveys")}
          </button>
        </div>
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────
  if (view === "form" && activeSurvey) {
    return (
      <div className="min-h-screen bg-lilac py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 text-mauve font-semibold mb-8 hover:opacity-70 transition-opacity"
          >
            <BackArrow className="w-4 h-4" />
            {t("back")}
          </button>

          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wide text-turquoise bg-turquoise/10 px-3 py-1 rounded-full">
              {t(`context.${activeSurvey.context}`) || activeSurvey.context}
            </span>
            <h1 className="text-2xl font-bold text-mauve mt-3 mb-2">{activeSurvey.title}</h1>
            <p className="text-gray-500 text-sm">{activeSurvey.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeSurvey.questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="font-medium text-mauve mb-4">
                  {i + 1}. {q.text}
                  {q.required && <span className="text-red-400 ms-1">*</span>}
                </p>

                {q.type === "text" && (
                  <textarea
                    rows={3}
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none transition-colors ${
                      errors[q.id] ? "border-red-400" : "border-gray-200 focus:border-mauve"
                    }`}
                  />
                )}

                {q.type === "choice" && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswer(q.id, opt)}
                          className="accent-turquoise w-4 h-4"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-mauve transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "rating" && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleAnswer(q.id, star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            (answers[q.id] as number) >= star
                              ? "fill-turquoise text-turquoise"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {errors[q.id] && (
                  <p className="text-red-400 text-xs mt-2">{t("required")}</p>
                )}
              </div>
            ))}

            {error && <p className="text-red-500 text-sm text-center">{t("error")}</p>}

            <motion.button type="submit" disabled={submitting}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-mauve to-turquoise text-white py-3.5 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg shadow-mauve/20">
              {submitting ? t("submitting") : t("submit")}
            </motion.button>
          </form>
        </div>
      </div>
    );
  }

  // ── LIST ─────────────────────────────────────────────────
  const ar = locale === "ar";
  return (
    <div>
      <PageHeader
        badge={ar ? "استبيانات" : "Surveys"}
        title={ar ? "رأيك يصنع الفرق" : "Your Opinion Shapes Our Work"}
        subtitle={ar ? "رأيك يهمنا. ساعدنا على فهم احتياجات مجتمعنا." : "Your opinion matters. Help us understand our community better."}
      />
    <div className="bg-gradient-to-b from-white to-lilac/20 py-16 px-6">
      <div className="max-w-3xl mx-auto">

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-lilac-dark border-t-turquoise rounded-full animate-spin" />
          </div>
        )}

        {!loading && surveys.length === 0 && (
          <div className="text-center py-20">
            <ClipboardList className="w-14 h-14 text-mauve/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-mauve mb-2">{t("empty_title")}</h2>
            <p className="text-gray-400 text-sm">{t("empty_message")}</p>
          </div>
        )}

        {!loading && surveys.length > 0 && (
          <div className="grid gap-4">
            {surveys.map((survey) => (
              <div key={survey.id} className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-turquoise bg-turquoise/10 px-2 py-0.5 rounded-full">
                    {t(`context.${survey.context}`) || survey.context}
                  </span>
                  <h3 className="font-semibold text-mauve mt-2 mb-1">{survey.title}</h3>
                  <p className="text-gray-400 text-sm">{survey.description}</p>
                  <p className="text-xs text-gray-300 mt-2">
                    {survey.questions?.length || 0} {t("questions_count")}
                  </p>
                </div>
                <button
                  onClick={() => openSurvey(survey)}
                  className="shrink-0 bg-turquoise text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-turquoise-dark transition-colors"
                >
                  {t("start")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
