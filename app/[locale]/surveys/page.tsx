"use client";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClipboardList, CheckCircle2, Star, ArrowLeft, ArrowRight, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const contextColors: Record<string, string> = {
  education: "bg-purple-100 text-purple-700",
  youth:     "bg-turquoise/10 text-turquoise-dark",
  activity:  "bg-orange-100 text-orange-700",
  general:   "bg-gray-100 text-gray-600",
};

export default function SurveysPage() {
  const t = useTranslations("surveys");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    getDocs(query(collection(db, "surveys"), where("active", "==", true)))
      .then(snap => setSurveys(snap.docs.map(d => ({ id: d.id, ...d.data() } as Survey))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openSurvey(survey: Survey) {
    setActiveSurvey(survey);
    setAnswers({});
    setCurrent(0);
    setDirection(1);
    setView("form");
  }

  function handleAnswer(questionId: string, value: string | number) {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }

  function goNext() {
    if (!activeSurvey) return;
    setDirection(1);
    if (current < activeSurvey.questions.length - 1) {
      setCurrent(c => c + 1);
      setHoveredStar(0);
    }
  }

  function goBack() {
    setDirection(-1);
    setCurrent(c => c - 1);
    setHoveredStar(0);
  }

  const currentQ = activeSurvey?.questions[current];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const isAnswered = currentAnswer !== undefined && currentAnswer !== "";
  const isLast = activeSurvey ? current === activeSurvey.questions.length - 1 : false;

  async function handleSubmit() {
    if (!activeSurvey) return;
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
  const NextArrow = isRTL ? ArrowLeft : ArrowRight;

  // ── SUCCESS ──────────────────────────────────────────────
  if (view === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 bg-gradient-to-b from-white to-lilac/20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }}>
            <CheckCircle2 className="w-20 h-20 text-turquoise mx-auto mb-6" />
          </motion.div>
          <h2 className="text-2xl font-bold text-mauve mb-2">{t("success_title")}</h2>
          <p className="text-gray-500 mb-8">{t("success_message")}</p>
          <button onClick={() => setView("list")}
            className="inline-flex items-center gap-2 bg-mauve text-white px-8 py-3 rounded-full font-semibold hover:bg-mauve-dark transition-colors shadow-lg shadow-mauve/20">
            {t("back_to_surveys")}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────
  if (view === "form" && activeSurvey && currentQ) {
    const total = activeSurvey.questions.length;
    const progress = ((current) / total) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-lilac/20 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-4">
            <button onClick={() => setView("list")}
              className="flex items-center gap-1.5 text-mauve text-sm font-medium hover:opacity-70 transition-opacity">
              <BackArrow className="w-4 h-4" />
              {t("back")}
            </button>
            <div className="flex-1">
              <div className="h-1.5 bg-lilac rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-mauve to-turquoise rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-400 shrink-0">
              {current + 1} / {total}
            </span>
          </div>
        </div>

        {/* Survey header */}
        <div className="max-w-2xl mx-auto px-6 pt-10 pb-4 w-full">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${contextColors[activeSurvey.context] || contextColors.general}`}>
            {t(`context.${activeSurvey.context}`) || activeSurvey.context}
          </span>
          <h1 className="text-xl font-bold text-gray-800 mt-3">{activeSurvey.title}</h1>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto px-6 w-full pb-32">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Question text */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-mauve/50 mb-2">
                  {isRTL ? `السؤال ${current + 1}` : `Question ${current + 1}`}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
                  {currentQ.text}
                  {currentQ.required && <span className="text-mauve ms-1">*</span>}
                </h2>
              </div>

              {/* Text answer */}
              {currentQ.type === "text" && (
                <textarea
                  rows={4}
                  autoFocus
                  value={(answers[currentQ.id] as string) || ""}
                  onChange={e => handleAnswer(currentQ.id, e.target.value)}
                  placeholder={isRTL ? "اكتب إجابتك هنا..." : "Type your answer here..."}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-mauve text-base outline-none resize-none transition-colors bg-white shadow-sm"
                />
              )}

              {/* Choice cards */}
              {currentQ.type === "choice" && currentQ.options && (
                <div className="space-y-3">
                  {currentQ.options.map((opt, i) => (
                    <motion.button
                      key={opt}
                      type="button"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => {
                        handleAnswer(currentQ.id, opt);
                        setTimeout(goNext, 300);
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-start font-medium transition-all ${
                        answers[currentQ.id] === opt
                          ? "border-mauve bg-mauve text-white shadow-lg shadow-mauve/20"
                          : "border-gray-200 bg-white hover:border-mauve/50 text-gray-700 hover:bg-lilac/30"
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        answers[currentQ.id] === opt ? "bg-white/20 text-white" : "bg-lilac text-mauve"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Star rating */}
              {currentQ.type === "rating" && (
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => handleAnswer(currentQ.id, star)}
                      className="transition-transform"
                    >
                      <Star
                        className={`w-12 h-12 transition-colors ${
                          (hoveredStar || (answers[currentQ.id] as number)) >= star
                            ? "fill-turquoise text-turquoise"
                            : "text-gray-200 fill-gray-200"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav — fixed */}
        <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-gray-100">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <button
              onClick={goBack}
              disabled={current === 0}
              className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-mauve transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <BackArrow className="w-4 h-4" />
              {isRTL ? "السابق" : "Back"}
            </button>

            {error && <p className="text-red-500 text-xs">{t("error")}</p>}

            {isLast ? (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={submitting || (currentQ.required && !isAnswered)}
                className="flex items-center gap-2 bg-gradient-to-r from-mauve to-turquoise text-white px-8 py-2.5 rounded-full font-semibold shadow-lg shadow-mauve/20 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? (isRTL ? "جارٍ الإرسال..." : "Submitting...") : t("submit")}
                <CheckCircle2 className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={goNext}
                disabled={currentQ.required && !isAnswered}
                className="flex items-center gap-2 bg-mauve text-white px-8 py-2.5 rounded-full font-semibold hover:bg-mauve-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRTL ? "التالي" : "Next"}
                <NextArrow className="w-4 h-4" />
              </motion.button>
            )}
          </div>
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
            <div className="space-y-4">
              {surveys.map((survey, i) => (
                <motion.div
                  key={survey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => openSurvey(survey)}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-mauve/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${contextColors[survey.context] || contextColors.general}`}>
                        {t(`context.${survey.context}`) || survey.context}
                      </span>
                      <h3 className="font-bold text-gray-800 mt-3 mb-1.5 text-lg group-hover:text-mauve transition-colors">{survey.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{survey.description}</p>
                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <ClipboardList className="w-3.5 h-3.5" />
                          {survey.questions?.length || 0} {t("questions_count")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          ~{Math.ceil((survey.questions?.length || 1) * 0.5)} {ar ? "دقائق" : "min"}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-lilac group-hover:bg-mauve transition-colors flex items-center justify-center flex-shrink-0 mt-1">
                      <ChevronRight className="w-5 h-5 text-mauve group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
