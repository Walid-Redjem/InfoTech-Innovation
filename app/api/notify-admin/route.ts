import { NextRequest, NextResponse } from "next/server";
import { emailLayout, emailButton, escapeHtml } from "@/lib/emailTemplate";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innovation-club-two.vercel.app";

// Triggered by any visitor completing the public registration form — not an admin
// action, so it only requires the lightweight rate limit below, not admin auth.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

function adminEmailTemplate(name: string, email: string, phone: string, category: string) {
  const categoryLabel = category === "youth" ? "Youth" : category === "teacher" ? "Teacher" : "Institution";
  const categoryColor = category === "youth" ? "#6B35A0" : category === "teacher" ? "#29B6F6" : "#6366f1";
  const safeName = escapeHtml(name) || "—";
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone) || "—";

  return emailLayout({
    headerHtml: `
      <h1 style="color:#fff;margin:0;font-size:20px">InfoTech Innovation</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px">Admin Notification</p>`,
    bodyHtml: `
      <div style="background:#f9f6fc;border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #6B35A0">
        <p style="margin:0;font-size:15px;font-weight:bold;color:#333">📋 New Registration</p>
        <p style="margin:4px 0 0;color:#777;font-size:13px">A new user has just registered on the platform.</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:10px 0;color:#999;width:40%">Name</td>
          <td style="padding:10px 0;color:#333;font-weight:600">${safeName}</td>
        </tr>
        <tr style="border-top:1px solid #f0e8f8">
          <td style="padding:10px 0;color:#999">Email</td>
          <td style="padding:10px 0;color:#333">${safeEmail}</td>
        </tr>
        <tr style="border-top:1px solid #f0e8f8">
          <td style="padding:10px 0;color:#999">Phone</td>
          <td style="padding:10px 0;color:#333">${safePhone}</td>
        </tr>
        <tr style="border-top:1px solid #f0e8f8">
          <td style="padding:10px 0;color:#999">Category</td>
          <td style="padding:10px 0">
            <span style="background:${categoryColor}20;color:${categoryColor};font-weight:600;font-size:12px;padding:4px 12px;border-radius:20px">${categoryLabel}</span>
          </td>
        </tr>
      </table>
      <div style="margin-top:28px;text-align:center">
        ${emailButton(`${SITE_URL}/en/admin`, "Review in Dashboard →")}
      </div>`,
    footerText: "InfoTech Innovation — Admin Portal",
  });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, category } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (!checkRateLimit(email.toLowerCase())) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return NextResponse.json({ ok: false });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "InfoTech Innovation <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `New registration — ${name || email}`,
        html: adminEmailTemplate(name, email, phone, category),
      }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
