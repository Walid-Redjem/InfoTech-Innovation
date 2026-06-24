import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, updateDoc, deleteDoc } from "firebase/firestore";

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

function approvalEmail(name: string, locale: string) {
  const ar = locale === "ar";
  return `
<!DOCTYPE html>
<html dir="${ar ? "rtl" : "ltr"}" lang="${locale}">
<head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f0f9;margin:0;padding:32px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(155,107,155,0.12)">
    <div style="background:linear-gradient(135deg,#9B6B9B,#2EC4B6);padding:32px;text-align:center">
      <div style="font-size:48px;margin-bottom:8px">✅</div>
      <h1 style="color:#fff;margin:0;font-size:22px">${ar ? "تهانينا!" : "Congratulations!"}</h1>
    </div>
    <div style="padding:32px;text-align:center">
      <p style="font-size:16px;color:#333;margin-bottom:8px">${ar ? `مرحباً ${name}،` : `Hello ${name},`}</p>
      <p style="color:#555;font-size:15px;line-height:1.6;margin-bottom:24px">
        ${ar
          ? "لقد تمت مراجعة وثائقك بنجاح. تسجيلك في InfoTech Innovation مقبول رسمياً. سيتواصل معك فريقنا قريباً."
          : "Your documents have been reviewed successfully. Your registration at InfoTech Innovation has been officially accepted. Our team will contact you soon."}
      </p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://innovation-club-two.vercel.app"}"
         style="display:inline-block;background:linear-gradient(135deg,#9B6B9B,#2EC4B6);color:#fff;text-decoration:none;font-weight:bold;padding:14px 32px;border-radius:30px;font-size:14px">
        ${ar ? "زيارة المنصة" : "Visit the Platform"}
      </a>
    </div>
    <div style="background:#f9f6fc;padding:16px;text-align:center;border-top:1px solid #ede0f5">
      <p style="color:#bbb;font-size:12px;margin:0">InfoTech Innovation</p>
    </div>
  </div>
</body>
</html>`;
}

function rejectionEmail(name: string, reason: string, locale: string) {
  const ar = locale === "ar";
  return `
<!DOCTYPE html>
<html dir="${ar ? "rtl" : "ltr"}" lang="${locale}">
<head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f0f9;margin:0;padding:32px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(155,107,155,0.12)">
    <div style="background:linear-gradient(135deg,#9B6B9B,#2EC4B6);padding:32px;text-align:center">
      <div style="font-size:48px;margin-bottom:8px">⚠️</div>
      <h1 style="color:#fff;margin:0;font-size:20px">${ar ? "مطلوب إجراء" : "Action Required"}</h1>
    </div>
    <div style="padding:32px">
      <p style="font-size:15px;color:#333;margin-bottom:8px">${ar ? `مرحباً ${name}،` : `Hello ${name},`}</p>
      <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:16px">
        ${ar
          ? "بعد مراجعة وثائقك، تبيّن أن هناك مشكلة تحتاج إلى تصحيح."
          : "After reviewing your documents, we found an issue that needs to be corrected."}
      </p>
      ${reason ? `
      <div style="background:#fff3f3;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:20px">
        <p style="margin:0;font-size:13px;color:#dc2626;font-weight:600">${ar ? "السبب:" : "Reason:"}</p>
        <p style="margin:8px 0 0;font-size:14px;color:#333">${reason}</p>
      </div>` : ""}
      <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px">
        ${ar
          ? "يرجى التسجيل مرة أخرى مع التأكد من صحة جميع الوثائق."
          : "Please register again making sure all required documents are correct."}
      </p>
      <div style="text-align:center">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://innovation-club-two.vercel.app"}/en/join"
           style="display:inline-block;background:linear-gradient(135deg,#9B6B9B,#2EC4B6);color:#fff;text-decoration:none;font-weight:bold;padding:14px 32px;border-radius:30px;font-size:14px">
          ${ar ? "التسجيل من جديد" : "Register Again"}
        </a>
      </div>
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
    const { registrationId, action, email, name, locale, reason } = await req.json();
    if (!registrationId || !action || !email) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const db = getDb();
    const ref = doc(db, "registrations", registrationId);

    if (action === "approve") {
      await updateDoc(ref, { status: "approved" });
    } else {
      await deleteDoc(ref);
    }

    const subject = action === "approve"
      ? (locale === "ar" ? "تم قبول تسجيلك ✓" : "Your registration has been approved ✓ — InfoTech Innovation")
      : (locale === "ar" ? "مطلوب إجراء — يرجى إعادة التسجيل" : "Action required — Please re-register");

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "InfoTech Innovation <onboarding@resend.dev>",
        to: [email],
        subject,
        html: action === "approve"
          ? approvalEmail(name, locale)
          : rejectionEmail(name, reason || "", locale),
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
