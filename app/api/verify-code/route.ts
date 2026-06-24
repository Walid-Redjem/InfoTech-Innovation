import { NextRequest, NextResponse } from "next/server";
import { isCodeValid, verifyToken } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { token, code } = await req.json();
    if (!token || !code) return NextResponse.json({ valid: false, error: "Missing fields" });

    const result = isCodeValid(token, code);
    if (result === "expired") return NextResponse.json({ valid: false, error: "expired" });
    if (result === "invalid") return NextResponse.json({ valid: false, error: "invalid" });

    const payload = verifyToken(token);
    return NextResponse.json({ valid: true, email: payload!.email });
  } catch {
    return NextResponse.json({ valid: false, error: "Server error" });
  }
}
