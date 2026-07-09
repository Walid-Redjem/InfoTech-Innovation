import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { emailLayout, emailButton } from "@/lib/emailTemplate";

function digestTemplate(data: {
  totalRegs: number; pending: number; approved: number;
  newThisWeek: number; totalIssues: number; newIssues: number;
  totalSurveys: number; totalResponses: number;
}) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innovation-club-two.vercel.app";
  return emailLayout({
    headerHtml: `
      <h1 style="color:#fff;margin:0;font-size:20px">📊 Weekly Digest</h1>
      <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:13px">InfoTech Innovation — ${new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>`,
    bodyHtml: `
      <h2 style="font-size:14px;font-weight:700;color:#6B35A0;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">Registrations</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
        <tr style="background:#f9f6fc">
          <td style="padding:10px 14px;border-radius:8px 0 0 8px;color:#555">Total</td>
          <td style="padding:10px 14px;border-radius:0 8px 8px 0;font-weight:700;color:#6B35A0;text-align:end">${data.totalRegs}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#555">New this week</td>
          <td style="padding:10px 14px;font-weight:700;color:#29B6F6;text-align:end">+${data.newThisWeek}</td>
        </tr>
        <tr style="background:#f9f6fc">
          <td style="padding:10px 14px;border-radius:8px 0 0 8px;color:#555">Pending review</td>
          <td style="padding:10px 14px;border-radius:0 8px 8px 0;font-weight:700;color:#f59e0b;text-align:end">${data.pending}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#555">Approved</td>
          <td style="padding:10px 14px;font-weight:700;color:#22c55e;text-align:end">${data.approved}</td>
        </tr>
      </table>

      <h2 style="font-size:14px;font-weight:700;color:#6B35A0;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">Community Activity</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:28px">
        <tr style="background:#f9f6fc">
          <td style="padding:10px 14px;border-radius:8px 0 0 8px;color:#555">Issues filed this week</td>
          <td style="padding:10px 14px;border-radius:0 8px 8px 0;font-weight:700;color:#f97316;text-align:end">+${data.newIssues}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#555">Total issues</td>
          <td style="padding:10px 14px;font-weight:700;color:#555;text-align:end">${data.totalIssues}</td>
        </tr>
        <tr style="background:#f9f6fc">
          <td style="padding:10px 14px;border-radius:8px 0 0 8px;color:#555">Active surveys</td>
          <td style="padding:10px 14px;border-radius:0 8px 8px 0;font-weight:700;color:#6366f1;text-align:end">${data.totalSurveys}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#555">Total survey responses</td>
          <td style="padding:10px 14px;font-weight:700;color:#6366f1;text-align:end">${data.totalResponses}</td>
        </tr>
      </table>

      <div style="text-align:center">
        ${emailButton(`${SITE_URL}/en/admin`, "Open Dashboard →")}
      </div>`,
    footerText: "InfoTech Innovation — Weekly Admin Digest",
  });
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const secret = req.headers.get("x-cron-secret") || req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [regSnap, issueSnap, surveySnap, responseSnap] = await Promise.all([
      db.collection("registrations").get(),
      db.collection("issues").get(),
      db.collection("surveys").get(),
      db.collection("surveyResponses").get(),
    ]);

    const regs = regSnap.docs.map(d => d.data());
    const issues = issueSnap.docs.map(d => d.data());

    function isThisWeek(ts: unknown) {
      if (!ts) return false;
      const date = typeof (ts as { toDate?: unknown }).toDate === "function"
        ? (ts as { toDate: () => Date }).toDate()
        : new Date(ts as string);
      return date >= oneWeekAgo;
    }

    const data = {
      totalRegs: regs.length,
      pending: regs.filter(r => (r.status || "pending") === "pending").length,
      approved: regs.filter(r => r.status === "approved").length,
      newThisWeek: regs.filter(r => isThisWeek(r.createdAt)).length,
      totalIssues: issues.length,
      newIssues: issues.filter(r => isThisWeek(r.createdAt)).length,
      totalSurveys: surveySnap.size,
      totalResponses: responseSnap.size,
    };

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return NextResponse.json({ error: "No admin email" }, { status: 500 });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "InfoTech Innovation <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `📊 Weekly Digest — ${new Date().toLocaleDateString("en-GB", { month: "long", day: "numeric" })}`,
        html: digestTemplate(data),
      }),
    });

    if (!res.ok) throw new Error("Email failed");
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
