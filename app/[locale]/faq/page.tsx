"use client";
import { useState } from "react";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

const faqs = [
  {
    en: "Who can register on InfoTech Innovation?",
    ar: "من يمكنه التسجيل في InfoTech Innovation؟",
    answerEn: "Anyone aged 8 and above can register. We have three profiles: Youth (8–35), Teachers, and Institutions. Each profile has specific required documents.",
    answerAr: "يمكن لأي شخص من عمر 8 سنوات فما فوق التسجيل. لدينا ثلاث فئات: الشباب (8–35 سنة)، المعلمون، والمؤسسات. كل فئة تتطلب وثائق محددة.",
  },
  {
    en: "How long does the approval process take?",
    ar: "كم يستغرق الموافقة على التسجيل؟",
    answerEn: "Our team reviews all applications within 2–5 business days. You will receive an email notification once your registration is reviewed.",
    answerAr: "يراجع فريقنا جميع الطلبات خلال 2–5 أيام عمل. ستتلقى إشعاراً بالبريد الإلكتروني فور مراجعة تسجيلك.",
  },
  {
    en: "What is the 500 DZD registration fee for?",
    ar: "ما الغرض من رسوم التسجيل 500 دج؟",
    answerEn: "The 500 DZD fee applies to youth registrations (under 17). It covers administrative processing and program materials. Payment details will be communicated after approval.",
    answerAr: "تنطبق رسوم 500 دج على تسجيلات الشباب (أقل من 17 سنة). تُغطي معالجة الملفات الإدارية ومواد البرنامج. ستُبلَّغ بتفاصيل الدفع بعد الموافقة.",
  },
  {
    en: "Why must I use a Gmail address?",
    ar: "لماذا يجب استخدام بريد Gmail؟",
    answerEn: "We require @gmail.com addresses to ensure reliable email delivery for OTP verification and notifications. If you don't have one, you can create a free Gmail account at gmail.com.",
    answerAr: "نطلب عناوين @gmail.com لضمان تسليم موثوق للبريد الإلكتروني للتحقق عبر رمز OTP والإشعارات. إذا لم يكن لديك حساب، يمكنك إنشاء حساب Gmail مجاني على gmail.com.",
  },
  {
    en: "What documents do I need to register as a youth?",
    ar: "ما الوثائق المطلوبة للتسجيل كشاب؟",
    answerEn: "Youth registrations require: a birth certificate, and either a parental consent form (if under 17) or an adult registration form (if 17 or older). All forms are available to download during registration.",
    answerAr: "يتطلب تسجيل الشباب: شهادة ميلاد، ونموذج موافقة الوالدين (لأقل من 17 سنة) أو نموذج تسجيل البالغين (17 سنة فأكثر). جميع النماذج متاحة للتنزيل أثناء التسجيل.",
  },
  {
    en: "What documents do teachers need?",
    ar: "ما الوثائق المطلوبة للمعلمين؟",
    answerEn: "Teachers must upload: a birth certificate, a resume/CV, a recent selfie/photo, and their diploma or degree certificate.",
    answerAr: "يجب على المعلمين رفع: شهادة الميلاد، السيرة الذاتية، صورة شخصية حديثة، وشهادة الدبلوم أو الدرجة العلمية.",
  },
  {
    en: "Can my institution become a partner?",
    ar: "هل يمكن لمؤسستي أن تصبح شريكاً؟",
    answerEn: "Yes! Institutions can register by providing the institution name, contact person, email, phone, and selecting the type of partnership they're interested in (financial, technical, training, or network).",
    answerAr: "نعم! يمكن للمؤسسات التسجيل بتقديم اسم المؤسسة، الشخص المسؤول، البريد الإلكتروني، الهاتف، واختيار نوع الشراكة المرغوب فيها (مالية، تقنية، تدريبية، أو شبكية).",
  },
  {
    en: "How can I submit a community issue or idea?",
    ar: "كيف أُقدّم إشكالية مجتمعية أو فكرة؟",
    answerEn: "Visit the Issues & Ideas page, select a category that best fits your topic, fill in the title, description, and affected group, and optionally suggest a solution. No login required.",
    answerAr: "قم بزيارة صفحة الإشكاليات والأفكار، اختر الفئة الأنسب لموضوعك، أدخل العنوان والوصف والفئة المعنية، وبإمكانك اقتراح حل. لا يلزم تسجيل الدخول.",
  },
  {
    en: "What happens if my application is rejected?",
    ar: "ماذا يحدث إذا رُفض طلبي؟",
    answerEn: "If your application is rejected, you will receive an email explaining the reason. You are welcome to re-register with corrected documents. Common reasons include missing documents or incorrect information.",
    answerAr: "إذا رُفض طلبك، ستتلقى بريداً إلكترونياً يشرح السبب. يُرحّب بإعادة التسجيل مع الوثائق الصحيحة. الأسباب الشائعة تشمل وثائق ناقصة أو معلومات غير صحيحة.",
  },
  {
    en: "How do I participate in surveys?",
    ar: "كيف أشارك في الاستبيانات؟",
    answerEn: "Registered and approved members receive email notifications when a new survey is published. You can also visit the Surveys page at any time to see active surveys.",
    answerAr: "يتلقى الأعضاء المسجلون والمقبولون إشعارات بالبريد الإلكتروني عند نشر استبيان جديد. يمكنك أيضاً زيارة صفحة الاستبيانات في أي وقت لرؤية الاستبيانات النشطة.",
  },
  {
    en: "Is my personal data secure?",
    ar: "هل بياناتي الشخصية آمنة؟",
    answerEn: "Yes. All data is stored securely with strict access controls. Only authorized administrators can view registration details. We never share your information with third parties.",
    answerAr: "نعم. تُخزّن جميع البيانات بأمان مع ضوابط وصول صارمة. فقط المسؤولون المصرّح لهم يمكنهم الاطلاع على تفاصيل التسجيل. نحن لا نشارك معلوماتك مع أطراف ثالثة.",
  },
];

export default function FAQPage() {
  const locale = useLocale();
  const ar = locale === "ar";
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <PageHeader
        badge={ar ? "الأسئلة الشائعة" : "FAQ"}
        title={ar ? "أسئلة وأجوبة" : "Frequently Asked Questions"}
        subtitle={ar ? "كل ما تحتاج معرفته حول InfoTech Innovation" : "Everything you need to know about InfoTech Innovation"}
      />

      <section className="py-16 px-6 bg-gradient-to-b from-lilac/20 to-white">
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i} delay={i * 0.04}>
              <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${open === i ? "border-mauve/30 shadow-mauve/10" : "border-gray-100"}`}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start hover:bg-lilac/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${open === i ? "bg-mauve text-white" : "bg-lilac text-mauve"}`}>
                      {i + 1}
                    </span>
                    <span className="font-semibold text-gray-800 text-sm leading-snug">
                      {ar ? faq.ar : faq.en}
                    </span>
                  </div>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0">
                    <ChevronDown className={`w-4 h-4 transition-colors ${open === i ? "text-mauve" : "text-gray-400"}`} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-3 border-t border-mauve/10">
                        <div className={`border-s-2 border-turquoise ps-4`}>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {ar ? faq.answerAr : faq.answerEn}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="text-center mt-14">
          <p className="text-gray-400 text-sm mb-4">{ar ? "لم تجد إجابتك؟ تواصل معنا عبر واتساب" : "Didn't find your answer? Contact us on WhatsApp"}</p>
          <a href="https://wa.me/213775654104"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#20ba59] transition-colors shadow-lg shadow-green-500/20">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {ar ? "تواصل معنا" : "Chat with us"}
          </a>
          <div className="mt-8">
            <Link href={`/${locale}/join`} className="text-sm text-mauve hover:underline font-medium">
              {ar ? "← العودة للتسجيل" : "← Ready to register?"}
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
