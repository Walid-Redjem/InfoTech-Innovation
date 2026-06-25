import { NextRequest, NextResponse } from "next/server";

function adminEmailTemplate(name: string, email: string, phone: string, category: string) {
  const categoryLabel = category === "youth" ? "Youth" : category === "teacher" ? "Teacher" : "Institution";
  const categoryColor = category === "youth" ? "#9B6B9B" : category === "teacher" ? "#2EC4B6" : "#6366f1";

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f0f9;margin:0;padding:32px">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(155,107,155,0.12)">
    <div style="background:linear-gradient(135deg,#9B6B9B,#2EC4B6);padding:28px 32px">
      <h1 style="color:#fff;margin:0;font-size:20px">InfoTech Innovation</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px">Admin Notification</p>
    </div>
    <div style="padding:32px">
      <div style="background:#f9f6fc;border-radius:12px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #9B6B9B">
        <p style="margin:0;font-size:15px;font-weight:bold;color:#333">📋 New Registration</p>
        <p style="margin:4px 0 0;color:#777;font-size:13px">A new user has just registered on the platform.</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:10px 0;color:#999;width:40%">Name</td>
          <td style="padding:10px 0;color:#333;font-weight:600">${name || "—"}</td>
        </tr>
        <tr style="border-top:1px solid #f0e8f8">
          <td style="padding:10px 0;color:#999">Email</td>
          <td style="padding:10px 0;color:#333">${email}</td>
        </tr>
        <tr style="border-top:1px solid #f0e8f8">
          <td style="padding:10px 0;color:#999">Phone</td>
          <td style="padding:10px 0;color:#333">${phone || "—"}</td>
        </tr>
        <tr style="border-top:1px solid #f0e8f8">
          <td style="padding:10px 0;color:#999">Category</td>
          <td style="padding:10px 0">
            <span style="background:${categoryColor}20;color:${categoryColor};font-weight:600;font-size:12px;padding:4px 12px;border-radius:20px">${categoryLabel}</span>
          </td>
        </tr>
      </table>
      <div style="margin-top:28px;text-align:center">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://innovation-club-two.vercel.app"}/en/admin"
           style="display:inline-block;background:linear-gradient(135deg,#9B6B9B,#2EC4B6);color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:30px">
          Review in Dashboard →
        </a>
      </div>
    </div>
    <div style="background:#f9f6fc;padding:16px 32px;border-top:1px solid #ede0f5;text-align:center">
      <p style="color:#bbb;font-size:12px;margin:0">InfoTech Innovation — Admin Portal</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-admin-secret");
    if (secret !== process.env.ADMIN_API_SECRET) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const { name, email, phone, category } = await req.json();
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
