import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.NEXT_PUBLIC_ADMIN_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, body, emails } = await req.json();
    if (!subject || !body || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

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
            html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f0f9;margin:0;padding:32px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(155,107,155,0.1)">
    <div style="background:linear-gradient(135deg,#9B6B9B,#2EC4B6);padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">InfoTech Innovation</h1>
    </div>
    <div style="padding:32px">
      <div style="font-size:15px;color:#333;line-height:1.7;white-space:pre-wrap">${body}</div>
    </div>
    <div style="background:#f9f6fc;padding:16px;text-align:center;border-top:1px solid #ede0f5">
      <p style="color:#bbb;font-size:12px;margin:0">InfoTech Innovation — إشعار للأعضاء</p>
    </div>
  </div>
</body></html>`,
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
