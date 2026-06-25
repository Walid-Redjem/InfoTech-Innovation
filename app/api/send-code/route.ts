import { NextRequest, NextResponse } from "next/server";
import { generateCode, signToken } from "@/lib/otp";

// In-memory rate limiter — max 3 OTP requests per email per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

function emailTemplate(code: string, locale: string) {
  const isAr = locale === "ar";
  return `
<!DOCTYPE html>
<html dir="${isAr ? "rtl" : "ltr"}" lang="${locale}">
<head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f0f9;margin:0;padding:32px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(155,107,155,0.1)">
    <div style="background:linear-gradient(135deg,#9B6B9B,#2EC4B6);padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">InfoTech Innovation</h1>
    </div>
    <div style="padding:32px;text-align:center">
      <p style="color:#555;font-size:16px;margin-bottom:8px">
        ${isAr ? "رمز التحقق الخاص بك هو:" : "Your verification code is:"}
      </p>
      <div style="display:inline-block;background:#f4f0f9;border:2px solid #9B6B9B;border-radius:16px;padding:20px 40px;margin:16px 0">
        <span style="font-size:42px;font-weight:bold;color:#9B6B9B;letter-spacing:12px">${code}</span>
      </div>
      <p style="color:#999;font-size:13px;margin-top:16px">
        ${isAr ? "هذا الرمز صالح لمدة 10 دقائق فقط." : "This code expires in 10 minutes."}
      </p>
    </div>
    <div style="background:#f9f6fc;padding:16px;text-align:center;border-top:1px solid #ede0f5">
      <p style="color:#bbb;font-size:12px;margin:0">
        ${isAr ? "إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد." : "If you didn't request this, please ignore this email."}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, locale } = body;
    if (!email || typeof email !== "string") return NextResponse.json({ error: "Email required" }, { status: 400 });
    if (email.length > 254) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (!email.toLowerCase().endsWith("@gmail.com")) return NextResponse.json({ error: "Gmail required" }, { status: 400 });

    // Rate limit: max 3 OTP requests per email per 10 minutes
    if (!checkRateLimit(email.toLowerCase())) {
      return NextResponse.json(
        { error: locale === "ar" ? "طلبات كثيرة جداً. انتظر 10 دقائق." : "Too many requests. Please wait 10 minutes." },
        { status: 429 }
      );
    }

    const code = generateCode();
    const token = signToken({ email, code, exp: Date.now() + 10 * 60 * 1000 });

    // Send email via Resend
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
          ? "رمز التحقق - InfoTech Innovation"
          : "Your verification code - InfoTech Innovation",
        html: emailTemplate(code, locale || "en"),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
