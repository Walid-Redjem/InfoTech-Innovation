import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/verifyFirebaseIdToken";
import { emailLayout, escapeHtml } from "@/lib/emailTemplate";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, body, emails } = await req.json();
    if (!subject || !body || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const html = emailLayout({
      headerHtml: `<h1 style="color:#fff;margin:0;font-size:22px">InfoTech Innovation</h1>`,
      bodyHtml: `<div style="font-size:15px;color:#333;line-height:1.7;white-space:pre-wrap">${escapeHtml(body)}</div>`,
      footerText: "InfoTech Innovation — إشعار للأعضاء",
    });

    // Send in batches of 50 to respect Resend limits
    const batchSize = 50;
    let sent = 0;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await Promise.all(batch.map((email: string) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "InfoTech Innovation <onboarding@resend.dev>",
            to: [email],
            subject,
            html,
          }),
        })
      ));
      sent += batch.length;
    }

    return NextResponse.json({ sent });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
