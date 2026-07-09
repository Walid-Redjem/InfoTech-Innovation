import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/verifyFirebaseIdToken";
import { emailLayout, emailButton, escapeHtml, safeLocale } from "@/lib/emailTemplate";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innovation-club-two.vercel.app";

function approvalEmail(name: string, rawLocale: string) {
  const locale = safeLocale(rawLocale);
  const ar = locale === "ar";
  const safeName = escapeHtml(name);
  return emailLayout({
    locale,
    headerHtml: `
      <div style="font-size:48px;margin-bottom:8px">✅</div>
      <h1 style="color:#fff;margin:0;font-size:22px">${ar ? "تهانينا!" : "Congratulations!"}</h1>`,
    bodyHtml: `
      <div style="text-align:center">
        <p style="font-size:16px;color:#333;margin-bottom:8px">${ar ? `مرحباً ${safeName}،` : `Hello ${safeName},`}</p>
        <p style="color:#555;font-size:15px;line-height:1.6;margin-bottom:24px">
          ${ar
            ? "لقد تمت مراجعة وثائقك بنجاح. تسجيلك في InfoTech Innovation مقبول رسمياً. سيتواصل معك فريقنا قريباً."
            : "Your documents have been reviewed successfully. Your registration at InfoTech Innovation has been officially accepted. Our team will contact you soon."}
        </p>
        ${emailButton(SITE_URL, ar ? "زيارة المنصة" : "Visit the Platform")}
      </div>`,
  });
}

function rejectionEmail(name: string, reason: string, rawLocale: string) {
  const locale = safeLocale(rawLocale);
  const ar = locale === "ar";
  const safeName = escapeHtml(name);
  const safeReason = escapeHtml(reason);
  return emailLayout({
    locale,
    headerHtml: `
      <div style="font-size:48px;margin-bottom:8px">⚠️</div>
      <h1 style="color:#fff;margin:0;font-size:20px">${ar ? "مطلوب إجراء" : "Action Required"}</h1>`,
    bodyHtml: `
      <p style="font-size:15px;color:#333;margin-bottom:8px">${ar ? `مرحباً ${safeName}،` : `Hello ${safeName},`}</p>
      <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:16px">
        ${ar
          ? "بعد مراجعة وثائقك، تبيّن أن هناك مشكلة تحتاج إلى تصحيح."
          : "After reviewing your documents, we found an issue that needs to be corrected."}
      </p>
      ${safeReason ? `
      <div style="background:#fff3f3;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:20px">
        <p style="margin:0;font-size:13px;color:#dc2626;font-weight:600">${ar ? "السبب:" : "Reason:"}</p>
        <p style="margin:8px 0 0;font-size:14px;color:#333">${safeReason}</p>
      </div>` : ""}
      <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px">
        ${ar
          ? "يرجى التسجيل مرة أخرى مع التأكد من صحة جميع الوثائق."
          : "Please register again making sure all required documents are correct."}
      </p>
      <div style="text-align:center">
        ${emailButton(`${SITE_URL}/en/join`, ar ? "التسجيل من جديد" : "Register Again")}
      </div>`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { action, email, name, locale, reason } = await req.json();
    if (!action || !email) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
    if (reason && (typeof reason !== "string" || reason.length > 1000)) {
      return NextResponse.json({ success: false, error: "Reason too long" }, { status: 400 });
    }

    // The registration document itself is updated/deleted by the caller directly via the
    // authenticated Firestore client SDK (Firestore rules require an admin session, which
    // this server route doesn't have). This route only sends the notification email.

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
