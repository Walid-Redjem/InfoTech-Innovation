import { NextRequest, NextResponse } from "next/server";
import { isCodeValid, verifyToken } from "@/lib/otp";

// In-memory rate limiter — max 5 guesses per token per 10 minutes, to stop
// brute-forcing the 6-digit code against a captured/observed token.
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

export async function POST(req: NextRequest) {
  try {
    const { token, code } = await req.json();
    if (!token || !code) return NextResponse.json({ valid: false, error: "Missing fields" });

    if (!checkRateLimit(token)) {
      return NextResponse.json({ valid: false, error: "Too many attempts. Request a new code." });
    }

    const result = isCodeValid(token, code);
    if (result === "expired") return NextResponse.json({ valid: false, error: "expired" });
    if (result === "invalid") return NextResponse.json({ valid: false, error: "invalid" });

    const payload = verifyToken(token);
    return NextResponse.json({ valid: true, email: payload!.email });
  } catch {
    return NextResponse.json({ valid: false, error: "Server error" });
  }
}
