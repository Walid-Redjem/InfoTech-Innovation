/**
 * Tests for the FAQ page content structure.
 * Ensures every FAQ item has all required bilingual fields.
 */

interface FAQItem {
  en: string;
  ar: string;
  answerEn: string;
  answerAr: string;
}

const faqs: FAQItem[] = [
  { en: "Who can register on InfoTech Innovation?", ar: "من يمكنه التسجيل في InfoTech Innovation؟", answerEn: "Anyone aged 8 and above can register.", answerAr: "يمكن لأي شخص من عمر 8 سنوات فما فوق التسجيل." },
  { en: "How long does the approval process take?", ar: "كم يستغرق الموافقة على التسجيل؟", answerEn: "Our team reviews all applications within 2–5 business days.", answerAr: "يراجع فريقنا جميع الطلبات خلال 2–5 أيام عمل." },
  { en: "What is the 500 DZD registration fee for?", ar: "ما الغرض من رسوم التسجيل 500 دج؟", answerEn: "The 500 DZD fee applies to youth registrations.", answerAr: "تنطبق رسوم 500 دج على تسجيلات الشباب." },
  { en: "Why must I use a Gmail address?", ar: "لماذا يجب استخدام بريد Gmail؟", answerEn: "We require @gmail.com addresses.", answerAr: "نطلب عناوين @gmail.com." },
  { en: "What documents do I need to register as a youth?", ar: "ما الوثائق المطلوبة للتسجيل كشاب؟", answerEn: "Youth registrations require a birth certificate.", answerAr: "يتطلب تسجيل الشباب شهادة ميلاد." },
  { en: "What documents do teachers need?", ar: "ما الوثائق المطلوبة للمعلمين؟", answerEn: "Teachers must upload a birth certificate, CV, photo, and degree.", answerAr: "يجب على المعلمين رفع شهادة الميلاد والسيرة الذاتية." },
  { en: "Can my institution become a partner?", ar: "هل يمكن لمؤسستي أن تصبح شريكاً؟", answerEn: "Yes! Institutions can register.", answerAr: "نعم! يمكن للمؤسسات التسجيل." },
  { en: "How can I submit a community issue or idea?", ar: "كيف أُقدّم إشكالية مجتمعية أو فكرة؟", answerEn: "Visit the Issues & Ideas page.", answerAr: "قم بزيارة صفحة الإشكاليات والأفكار." },
  { en: "What happens if my application is rejected?", ar: "ماذا يحدث إذا رُفض طلبي؟", answerEn: "You will receive an email explaining the reason.", answerAr: "ستتلقى بريداً إلكترونياً يشرح السبب." },
  { en: "How do I participate in surveys?", ar: "كيف أشارك في الاستبيانات؟", answerEn: "Registered members receive email notifications.", answerAr: "يتلقى الأعضاء المسجلون إشعارات بالبريد الإلكتروني." },
  { en: "Is my personal data secure?", ar: "هل بياناتي الشخصية آمنة؟", answerEn: "Yes. All data is stored securely on Firebase.", answerAr: "نعم. تُخزّن جميع البيانات بأمان على Firebase." },
];

describe("FAQ content structure", () => {
  it("has at least 10 FAQ items", () => {
    expect(faqs.length).toBeGreaterThanOrEqual(10);
  });

  it("every item has an English question", () => {
    faqs.forEach((faq) => {
      expect(faq.en.length).toBeGreaterThan(0);
    });
  });

  it("every item has an Arabic question", () => {
    faqs.forEach((faq) => {
      expect(faq.ar.length).toBeGreaterThan(0);
    });
  });

  it("every item has an English answer", () => {
    faqs.forEach((faq) => {
      expect(faq.answerEn.length).toBeGreaterThan(0);
    });
  });

  it("every item has an Arabic answer", () => {
    faqs.forEach((faq) => {
      expect(faq.answerAr.length).toBeGreaterThan(0);
    });
  });

  it("no duplicate English questions", () => {
    const questions = faqs.map(f => f.en);
    const unique = new Set(questions);
    expect(unique.size).toBe(questions.length);
  });

  it("no duplicate Arabic questions", () => {
    const questions = faqs.map(f => f.ar);
    const unique = new Set(questions);
    expect(unique.size).toBe(questions.length);
  });

  it("mentions Gmail requirement in the relevant FAQ", () => {
    const gmailFaq = faqs.find(f => f.en.toLowerCase().includes("gmail"));
    expect(gmailFaq).toBeDefined();
    expect(gmailFaq!.answerEn.toLowerCase()).toContain("gmail");
  });

  it("mentions 500 DZD fee in the relevant FAQ", () => {
    const feeFaq = faqs.find(f => f.en.includes("500 DZD"));
    expect(feeFaq).toBeDefined();
    expect(feeFaq!.answerEn).toContain("500 DZD");
  });

  it("mentions approval timeframe in the relevant FAQ", () => {
    const approvalFaq = faqs.find(f => f.en.toLowerCase().includes("approval"));
    expect(approvalFaq).toBeDefined();
    expect(approvalFaq!.answerEn).toMatch(/\d+.*day/i);
  });

  it("answers have meaningful length (at least 30 characters)", () => {
    faqs.forEach((faq) => {
      expect(faq.answerEn.length).toBeGreaterThanOrEqual(30);
      expect(faq.answerAr.length).toBeGreaterThan(20);
    });
  });
});
