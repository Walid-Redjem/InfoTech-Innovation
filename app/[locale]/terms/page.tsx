"use client";
import { useLocale } from "next-intl";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";

const sectionsEn = [
  {
    title: "1. Data We Collect",
    content: `When you register or use our platform, we may collect the following information:
• Full name, email address, phone number, and age
• Documents you upload: birth certificate, resume, diploma, profile photo, or signed parental consent forms
• Community issues and ideas you submit
• Survey responses
• Chatbot interaction data (anonymized)
All data is stored securely on Firebase (Google Cloud) and is accessible only to the InfoTech Innovation administration team.`,
  },
  {
    title: "2. How We Use Your Data",
    content: `Your data is used exclusively to:
• Process your registration and validate your membership
• Contact you regarding your application status
• Organize activities and track participation
• Analyze community needs and improve our services
• Publish anonymized impact statistics on the platform
We do not sell or share your personal data with third parties.`,
  },
  {
    title: "3. Parental Consent (Minors Under 17)",
    content: `For participants under the age of 17, a signed parental consent form is mandatory before registration is validated.
By submitting the signed form, the parent or legal guardian:
• Consents to their child's participation in all club activities
• Agrees to the use of photos/videos taken during sessions for educational and promotional purposes on the club's official pages
• Can withdraw consent at any time by submitting a written request`,
  },
  {
    title: "4. File Uploads & Storage",
    content: `Files you upload (birth certificates, resumes, photos, forms) are stored securely on Firebase Storage. These files are:
• Accessible only to authorized administrators
• Used solely for registration verification
• Never shared publicly or with external parties
• Retained for the duration of your membership and deleted upon written request`,
  },
  {
    title: "5. Photos & Media",
    content: `By registering, you acknowledge that photos or videos taken during sessions may be used for educational or promotional purposes on the club's official social media pages and website.
If you do not consent to this, you must notify us in writing before the start of your first session. Your request will be honored and no media featuring you will be published.`,
  },
  {
    title: "6. Your Rights",
    content: `You have the right to:
• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your data at any time
• Withdraw from the platform by submitting a written request
To exercise any of these rights, contact us at: contact@infotech.dz`,
  },
  {
    title: "7. Platform Rules",
    content: `By using this platform, you agree to:
• Provide accurate and truthful information
• Not upload inappropriate, harmful, or misleading content
• Respect other community members and their submissions
• Not use this platform for commercial purposes without prior written consent
Violations may result in immediate removal from the platform.`,
  },
  {
    title: "8. Contact",
    content: `For any questions regarding these terms or your personal data:
📧 contact@infotech.dz
📞 0552 24 52 19 / 0775 65 41 04
InfoTech Innovation`,
  },
];

const sectionsAr = [
  {
    title: "١. البيانات التي نجمعها",
    content: `عند التسجيل أو استخدام المنصة، قد نجمع المعلومات التالية:
• الاسم الكامل، البريد الإلكتروني، رقم الهاتف، والعمر
• الوثائق التي تقوم برفعها: شهادة الميلاد، السيرة الذاتية، الشهادة، الصورة الشخصية، أو استمارة الموافقة الأبوية الموقعة
• الإشكاليات والأفكار المجتمعية التي تقدمها
• ردود الاستبيانات
• بيانات التفاعل مع الشات بوت (مجهولة الهوية)
تُخزَّن جميع البيانات بشكل آمن على Firebase (Google Cloud) ولا يمكن الوصول إليها إلا من قِبل فريق إدارة InfoTech Innovation.`,
  },
  {
    title: "٢. كيف نستخدم بياناتك",
    content: `تُستخدم بياناتك حصراً من أجل:
• معالجة تسجيلك والتحقق من عضويتك
• التواصل معك بشأن حالة طلبك
• تنظيم الأنشطة وتتبع المشاركة
• تحليل احتياجات المجتمع وتحسين خدماتنا
• نشر إحصاءات الأثر المجهولة على المنصة
نحن لا نبيع بياناتك الشخصية ولا نشاركها مع أطراف ثالثة.`,
  },
  {
    title: "٣. الموافقة الأبوية (القاصرون دون 17 سنة)",
    content: `للمشاركين الذين تقل أعمارهم عن 17 سنة، تُعدّ استمارة الموافقة الأبوية الموقعة إلزامية قبل التحقق من التسجيل.
بتقديم الاستمارة الموقعة، يوافق الوالد أو الوصي القانوني على:
• مشاركة طفله في جميع أنشطة النادي
• استخدام الصور/الفيديوهات الملتقطة خلال الجلسات لأغراض تعليمية أو دعائية على الصفحات الرسمية للنادي
• يمكن سحب الموافقة في أي وقت بتقديم طلب كتابي`,
  },
  {
    title: "٤. رفع الملفات والتخزين",
    content: `الملفات التي ترفعها (شهادات الميلاد، السير الذاتية، الصور، الاستمارات) تُخزَّن بشكل آمن على Firebase Storage. هذه الملفات:
• لا يمكن الوصول إليها إلا من قِبل المسؤولين المعتمدين
• تُستخدم فقط للتحقق من التسجيل
• لا تُشارك علناً أو مع أطراف خارجية
• تُحتفظ بها طوال مدة عضويتك وتُحذف عند الطلب الكتابي`,
  },
  {
    title: "٥. الصور والوسائط",
    content: `بالتسجيل، تقر بأن الصور أو الفيديوهات الملتقطة خلال الجلسات قد تُستخدم لأغراض تعليمية أو دعائية على صفحات النادي الرسمية وموقعه الإلكتروني.
إذا لم توافق على ذلك، يجب إخطارنا كتابياً قبل بداية حصتك الأولى. سيتم احترام طلبك ولن يُنشر أي محتوى وسائط يظهرك فيه.`,
  },
  {
    title: "٦. حقوقك",
    content: `لك الحق في:
• الاطلاع على البيانات الشخصية التي نحتفظ بها عنك
• طلب تصحيح البيانات غير الدقيقة
• طلب حذف بياناتك في أي وقت
• الانسحاب من المنصة بتقديم طلب كتابي
لممارسة أي من هذه الحقوق، تواصل معنا على: contact@infotech.dz`,
  },
  {
    title: "٧. قواعد المنصة",
    content: `باستخدام هذه المنصة، توافق على:
• تقديم معلومات دقيقة وصحيحة
• عدم رفع محتوى غير لائق أو ضار أو مضلل
• احترام أعضاء المجتمع الآخرين ومساهماتهم
• عدم استخدام المنصة لأغراض تجارية دون موافقة كتابية مسبقة
قد تؤدي المخالفات إلى الإزالة الفورية من المنصة.`,
  },
  {
    title: "٨. التواصل",
    content: `لأي استفسارات تتعلق بهذه الشروط أو بياناتك الشخصية:
📧 contact@infotech.dz
📞 0552 24 52 19 / 0775 65 41 04
InfoTech Innovation`,
  },
];

export default function TermsPage() {
  const locale = useLocale();
  const ar = locale === "ar";
  const sections = ar ? sectionsAr : sectionsEn;

  return (
    <div>
      <PageHeader
        badge={ar ? "الشروط والخصوصية" : "Terms & Privacy"}
        title={ar ? "الشروط وسياسة الخصوصية" : "Terms & Privacy Policy"}
        subtitle={ar ? "يرجى قراءة هذه الشروط بعناية قبل استخدام المنصة أو التسجيل فيها." : "Please read these terms carefully before using or registering on the platform."}
      />

      <div className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          {sections.map((section, i) => (
            <AnimatedSection key={i} delay={i * 0.05}>
              <div className="bg-gradient-to-br from-lilac/30 to-white rounded-2xl p-6 border border-lilac-dark/20 hover:shadow-md transition-shadow">
                <h2 className="font-bold text-mauve text-lg mb-3">{section.title}</h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            </AnimatedSection>
          ))}

          <AnimatedSection delay={0.5}>
            <p className="text-center text-xs text-gray-400 pt-4">
              {ar
                ? "آخر تحديث: يونيو 2026 — InfoTech Innovation"
                : "Last updated: June 2026 — InfoTech Innovation"}
            </p>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
