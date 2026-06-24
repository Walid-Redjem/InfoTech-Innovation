import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

function getDb() {
  const app = getApps().length === 0
    ? initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      })
    : getApps()[0];
  return getFirestore(app);
}

function surveyEmailTemplate(name: string, surveyTitle: string, surveyDesc: string, locale: string) {
  const ar = locale === "ar";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://innovation-club-two.vercel.app";
  return `
<!DOCTYPE html>
<html dir="${ar ? "rtl" : "ltr"}" lang="${locale}">
<head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f0f9;margin:0;padding:32px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(155,107,155,0.12)">
    <div style="background:linear-gradient(135deg,#9B6B9B,#2EC4B6);padding:28px 32px;text-align:center">
      <p style="color:rgba(255,255,255,0.8);margin:0 0 8px;font-size:13px">${ar ? "استبيان جديد" : "New Survey"}</p>
      <h1 style="color:#fff;margin:0;font-size:22px">${surveyTitle}</h1>
    </div>
    <div style="padding:32px;text-align:center">
      <p style="font-size:15px;color:#333;margin-bottom:8px">${ar ? `مرحباً ${name}،` : `Hello ${name},`}</p>
      <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:8px">
        ${ar ? "تم نشر استبيان جديد على منصة InfoTech Innovation." : "A new survey has been published on the InfoTech Innovation platform."}
      </p>
      ${surveyDesc ? `<p style="color:#777;font-size:13px;font-style:italic;margin-bottom:20px">"${surveyDesc}"</p>` : ""}
      <a href="${siteUrl}/en/surveys"
         style="display:inline-block;background:linear-gradient(135deg,#9B6B9B,#2EC4B6);color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:30px">
        ${ar ? "شارك الآن" : "Participate Now"}
      </a>
    </div>
    <div style="background:#f9f6fc;padding:16px;text-align:center;border-top:1px solid #ede0f5">
      <p style="color:#bbb;font-size:12px;margin:0">InfoTech Innovation</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { surveyTitle, surveyDesc } = await req.json();

    // Get all registered users
    const db = getDb();
    const snap = await getDocs(collection(db, "registrations"));
    const users = snap.docs.map(d => ({ ...(d.data() as Record<string, unknown>) }))
      .filter(u => u.email && u.status === "approved");

    if (users.length === 0) return NextResponse.json({ sent: 0 });

    // Resend batch — send individually (Resend free plan limits batch)
    let sent = 0;
    for (const user of users.slice(0, 50)) { // cap at 50 per call
      const name = String(user.name || user.institution_name || "");
      const email = String(user.email);
      const locale = String(user.locale || "en");

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "InfoTech Innovation <onboarding@resend.dev>",
          to: [email],
          subject: locale === "ar"
            ? `استبيان جديد: ${surveyTitle}`
            : `New survey: ${surveyTitle}`,
          html: surveyEmailTemplate(name, surveyTitle, surveyDesc || "", locale),
        }),
      });
      if (res.ok) sent++;
    }

    return NextResponse.json({ sent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ sent: 0, error: "Server error" }, { status: 500 });
  }
}
