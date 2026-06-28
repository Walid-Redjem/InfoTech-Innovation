"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";
import { Target, Eye, Lightbulb, Users, Globe, Zap, CheckCircle2 } from "lucide-react";

const values = [
  { icon: Lightbulb, color: "#f59e0b", bg: "bg-yellow-50", en: "Innovation", ar: "الابتكار", descEn: "We challenge the status quo and embrace creative solutions.", descAr: "نتحدى الوضع الراهن ونتبنى الحلول الإبداعية." },
  { icon: Users, color: "#9B6B9B", bg: "bg-purple-50", en: "Collaboration", ar: "التعاون", descEn: "We achieve more together than any of us can alone.", descAr: "نحقق معاً ما لا يستطيع أحد تحقيقه بمفرده." },
  { icon: Globe, color: "#2EC4B6", bg: "bg-teal-50", en: "Impact", ar: "الأثر", descEn: "Every action we take is measured by its community impact.", descAr: "كل إجراء نتخذه يُقاس بأثره على المجتمع." },
  { icon: Zap, color: "#6366f1", bg: "bg-indigo-50", en: "Empowerment", ar: "التمكين", descEn: "We equip people with tools and knowledge to drive change.", descAr: "نزود الناس بالأدوات والمعرفة لإحداث التغيير." },
];

const steps = [
  { n: "01", en: "Listen", ar: "الاستماع", descEn: "We gather community challenges and listen to every voice.", descAr: "نجمع التحديات المجتمعية ونستمع لكل صوت." },
  { n: "02", en: "Analyze", ar: "التحليل", descEn: "We study the data and identify the most impactful opportunities.", descAr: "ندرس البيانات ونحدد الفرص الأكثر تأثيراً." },
  { n: "03", en: "Innovate", ar: "الابتكار", descEn: "We develop creative, technology-driven solutions collaboratively.", descAr: "نطور حلولاً إبداعية تقنية بشكل تشاركي." },
  { n: "04", en: "Execute", ar: "التنفيذ", descEn: "We implement projects with full community support and involvement.", descAr: "ننفذ المشاريع بدعم المجتمع ومشاركته الكاملة." },
  { n: "05", en: "Measure", ar: "القياس", descEn: "We track impact, learn from results, and continuously improve.", descAr: "نتتبع الأثر ونتعلم من النتائج ونحسّن باستمرار." },
];

export default function AboutPage() {
  const locale = useLocale();
  const ar = locale === "ar";

  return (
    <div>
      <PageHeader
        badge={ar ? "قصتنا" : "Our Story"}
        title={ar ? "نمكّن المجتمعات من خلال الابتكار" : "Empowering Communities Through Innovation"}
        subtitle={ar ? "InfoTech Innovation منصة رقمية تربط الشباب والمعلمين والمؤسسات لبناء مستقبل أفضل." : "InfoTech Innovation is a digital platform connecting youth, teachers, and institutions to build a better future."}
      />

      {/* Mission & Vision */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Target, color: "#9B6B9B", labelEn: "Our Mission", labelAr: "مهمتنا", titleEn: "Drive community change through technology", titleAr: "قيادة التغيير المجتمعي عبر التكنولوجيا", descEn: "To create a vibrant digital ecosystem where every community member can identify problems, propose ideas, and collaborate on solutions that create measurable social impact.", descAr: "إنشاء منظومة رقمية نابضة يستطيع فيها كل فرد في المجتمع تحديد المشكلات واقتراح الأفكار والتعاون على الحلول." },
            { icon: Eye, color: "#2EC4B6", labelEn: "Our Vision", labelAr: "رؤيتنا", titleEn: "A connected, innovative society", titleAr: "مجتمع متصل ومبتكر", descEn: "A world where every youth, teacher, and institution has the digital tools, knowledge, and network to turn community challenges into lasting positive change.", descAr: "عالم يمتلك فيه كل شاب ومعلم ومؤسسة الأدوات الرقمية والمعرفة والشبكة اللازمة لتحويل التحديات إلى تغيير إيجابي دائم." },
          ].map((card, i) => (
            <AnimatedSection key={i} delay={i * 0.15}>
              <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-lilac/40 to-white rounded-3xl p-8 border border-lilac-dark/20 hover:shadow-xl hover:shadow-mauve/10 transition-shadow h-full">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: `${card.color}20` }}>
                  <card.icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: card.color }}>
                  {ar ? card.labelAr : card.labelEn}
                </span>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{ar ? card.titleAr : card.titleEn}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{ar ? card.descAr : card.descEn}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-br from-white to-lilac/20">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-turquoise mb-2 block">{ar ? "ما نؤمن به" : "What We Believe"}</span>
            <h2 className="text-3xl font-bold text-mauve">{ar ? "قيمنا" : "Our Values"}</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-mauve to-turquoise rounded-full mx-auto mt-3" />
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}
                  className={`${v.bg} rounded-3xl p-6 text-center border border-white hover:shadow-xl transition-shadow`}>
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-6 h-6" style={{ color: v.color }} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{ar ? v.ar : v.en}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{ar ? v.descAr : v.descEn}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-turquoise mb-2 block">{ar ? "كيف نعمل" : "How We Work"}</span>
            <h2 className="text-3xl font-bold text-mauve">{ar ? "منهجيتنا" : "Our Methodology"}</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-mauve to-turquoise rounded-full mx-auto mt-3" />
          </AnimatedSection>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <motion.div whileHover={{ x: ar ? -8 : 8 }} transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-start gap-6 bg-gradient-to-r from-lilac/30 to-white rounded-2xl p-6 border border-lilac-dark/20 hover:shadow-lg hover:shadow-mauve/10 transition-shadow group">
                  <span className="text-3xl font-black shrink-0" style={{ background: "linear-gradient(135deg, #9B6B9B, #2EC4B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 group-hover:text-mauve transition-colors">
                      {ar ? step.ar : step.en}
                    </h3>
                    <p className="text-gray-500 text-sm">{ar ? step.descAr : step.descEn}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-turquoise shrink-0 mt-0.5 ms-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-br from-lilac/20 to-white">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-turquoise mb-2 block">{ar ? "مسيرتنا" : "Our Journey"}</span>
            <h2 className="text-3xl font-bold text-mauve">{ar ? "التسلسل الزمني" : "Timeline"}</h2>
            <div className="w-12 h-1 bg-gradient-to-r from-mauve to-turquoise rounded-full mx-auto mt-3" />
          </AnimatedSection>
          <div className="relative">
            {/* Center line */}
            <div className="absolute start-6 md:start-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-mauve via-turquoise to-lilac-dark opacity-30 md:-translate-x-1/2" />
            <div className="space-y-8">
              {[
                { year: "2023", en: "A Dream Takes Root", ar: "بذرة الحلم", descEn: "Learning Informatique was born in Algeria from a bold idea — that technology could bridge the gap between youth, educators, and institutions to build something greater together.", descAr: "وُلدت Learning Informatique في الجزائر من فكرة جريئة — أن التكنولوجيا قادرة على ردم الهوة بين الشباب والمعلمين والمؤسسات لبناء شيء أعظم معاً.", color: "#9B6B9B" },
                { year: "2024", en: "A New Identity, A Bigger Vision", ar: "هوية جديدة، رؤية أوسع", descEn: "What started as 5 students eager to learn grew to 25 learners by year's end. We shed the old name and emerged as InfoTech Innovation — ready to move faster, think bigger, and impact deeper.", descAr: "ما بدأ بـ 5 طلاب شغوفين بالتعلّم نما إلى 25 طالباً بنهاية العام. تخلّينا عن الاسم القديم وانطلقنا بهوية InfoTech Innovation — أسرع، أطمح، وأعمق أثراً.", color: "#2EC4B6" },
                { year: "2025", en: "Opening Doors to the Real World", ar: "فتح أبواب العالم الحقيقي", descEn: "We took innovation beyond the classroom — organizing workshops and conventions with real enterprises. Over 70 students joined to learn, grow, and be part of something meaningful.", descAr: "نقلنا الابتكار خارج الفصول الدراسية — ورشات عمل وملتقيات مع مؤسسات حقيقية. انضم أكثر من 70 طالباً للتعلّم والنمو والمساهمة في شيء ذي معنى.", color: "#f97316" },
                { year: "2026", en: "Official. Unstoppable.", ar: "رسميون. لا شيء يوقفنا.", descEn: "InfoTech Innovation is now officially recognized — and we're just getting started. A full digital platform, real-time impact tracking, and a community that's rewriting what's possible in Algeria.", descAr: "InfoTech Innovation باتت رسمية — ونحن لم نبدأ بعد. منصة رقمية متكاملة، تتبع الأثر لحظة بلحظة، ومجتمع يعيد كتابة ما هو ممكن في الجزائر.", color: "#22c55e" },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className={`flex items-start gap-4 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    {/* Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="ms-12 md:ms-0 md:w-[calc(50%-2rem)] bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-mauve/10 transition-shadow"
                      style={{ borderLeftColor: item.color, borderLeftWidth: 3 }}
                    >
                      <span className="text-xs font-black uppercase tracking-widest mb-1 block" style={{ color: item.color }}>{item.year}</span>
                      <h3 className="font-bold text-gray-800 mb-1">{ar ? item.ar : item.en}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{ar ? item.descAr : item.descEn}</p>
                    </motion.div>
                    {/* Dot on center line */}
                    <div className="absolute start-[18px] md:start-1/2 md:-translate-x-1/2 mt-5 w-5 h-5 rounded-full border-4 border-white shadow-md flex-shrink-0" style={{ backgroundColor: item.color }} />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <AnimatedSection>
        <section className="py-20 px-6 bg-mauve text-center relative overflow-hidden">
          <motion.div className="absolute inset-0 opacity-20"
            animate={{ background: ["radial-gradient(ellipse at 20% 50%, #2EC4B633, transparent 60%)", "radial-gradient(ellipse at 80% 50%, #2EC4B633, transparent 60%)", "radial-gradient(ellipse at 20% 50%, #2EC4B633, transparent 60%)"] }}
            transition={{ duration: 6, repeat: Infinity }} />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              {ar ? "هل أنت مستعد لإحداث الفرق؟" : "Ready to make a difference?"}
            </h2>
            <p className="text-white/70 mb-8">
              {ar ? "انضم إلى آلاف الشباب والمعلمين والمؤسسات الذين يبنون مستقبلاً أفضل." : "Join thousands of youth, teachers, and institutions building a better future."}
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href={`/${locale}/join`}
                className="inline-block bg-turquoise text-white px-10 py-4 rounded-full font-bold hover:bg-turquoise-dark transition-colors shadow-xl shadow-turquoise/30">
                {ar ? "انخرط معنا" : "Join Us Today"}
              </Link>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
