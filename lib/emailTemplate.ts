export function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function safeLocale(locale: unknown): "ar" | "en" {
  return locale === "ar" ? "ar" : "en";
}

const BRAND_GRADIENT = "linear-gradient(135deg,#6B35A0,#29B6F6)";

export function emailLayout(opts: {
  locale?: "ar" | "en";
  headerHtml: string;
  bodyHtml: string;
  footerText?: string;
}): string {
  const locale = opts.locale ?? "en";
  const ar = locale === "ar";
  const footer = opts.footerText ?? "InfoTech Innovation";
  return `
<!DOCTYPE html>
<html dir="${ar ? "rtl" : "ltr"}" lang="${locale}">
<head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f4f0f9;margin:0;padding:32px">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(107,53,160,0.12)">
    <div style="background:${BRAND_GRADIENT};padding:32px;text-align:center">
      ${opts.headerHtml}
    </div>
    <div style="padding:32px">
      ${opts.bodyHtml}
    </div>
    <div style="background:#f9f6fc;padding:16px;text-align:center;border-top:1px solid #ede0f5">
      <p style="color:#bbb;font-size:12px;margin:0">${escapeHtml(footer)}</p>
    </div>
  </div>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND_GRADIENT};color:#fff;text-decoration:none;font-weight:bold;padding:14px 32px;border-radius:30px;font-size:14px">${escapeHtml(label)}</a>`;
}
