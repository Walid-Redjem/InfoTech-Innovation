import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/verifyFirebaseIdToken";
import { emailLayout, emailButton, escapeHtml, safeLocale } from "@/lib/emailTemplate";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innovation-club-two.vercel.app";

interface Recipient {
  email: string;
  name?: string;
  locale?: string;
}

function surveyEmailTemplate(name: string, surveyTitle: string, surveyDesc: string, rawLocale: string) {
  const locale = safeLocale(rawLocale);
  const ar = locale === "ar";
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(surveyTitle);
  const safeDesc = escapeHtml(surveyDesc);
  return emailLayout({
    locale,
    headerHtml: `
      <p style="color:rgba(255,255,255,0.8);margin:0 0 8px;font-size:13px">${ar ? "استبيان جديد" : "New Survey"}</p>
      <h1 style="color:#fff;margin:0;font-size:22px">${safeTitle}</h1>`,
    bodyHtml: `
      <div style="text-align:center">
        <p style="font-size:15px;color:#333;margin-bottom:8px">${ar ? `مرحباً ${safeName}،` : `Hello ${safeName},`}</p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:8px">
          ${ar ? "تم نشر استبيان جديد على منصة InfoTech Innovation." : "A new survey has been published on the InfoTech Innovation platform."}
        </p>
        ${safeDesc ? `<p style="color:#777;font-size:13px;font-style:italic;margin-bottom:20px">"${safeDesc}"</p>` : ""}
        ${emailButton(`${SITE_URL}/en/surveys`, ar ? "شارك الآن" : "Participate Now")}
      </div>`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ sent: 0, error: "Unauthorized" }, { status: 401 });
    }
    const { surveyTitle, surveyDesc, recipients } = await req.json();
    if (!surveyTitle || typeof surveyTitle !== "string" || !Array.isArray(recipients)) {
      return NextResponse.json({ sent: 0, error: "Missing fields" }, { status: 400 });
    }

    // Sent by the caller (already loaded via the authenticated admin Firestore session)
    // rather than read here, so this route needs no Firestore access of its own.
    const results = await Promise.all(
      (recipients as Recipient[]).slice(0, 50).filter(u => u.email).map((user) => {
        const name = user.name || "";
        const locale = user.locale || "en";
        return fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "InfoTech Innovation <onboarding@resend.dev>",
            to: [user.email],
            subject: locale === "ar"
              ? `استبيان جديد: ${surveyTitle}`
              : `New survey: ${surveyTitle}`,
            html: surveyEmailTemplate(name, surveyTitle, surveyDesc || "", locale),
          }),
        }).then(res => res.ok);
      })
    );
    const sent = results.filter(Boolean).length;

    return NextResponse.json({ sent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ sent: 0, error: "Server error" }, { status: 500 });
  }
}
