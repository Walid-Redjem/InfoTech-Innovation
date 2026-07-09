import { createHmac, randomInt, timingSafeEqual } from "crypto";

const SECRET = process.env.OTP_SECRET;
if (!SECRET && process.env.NODE_ENV === "production") {
  throw new Error("OTP_SECRET environment variable is required");
}

export interface OtpPayload {
  email: string;
  code: string;
  exp: number;
}

export function generateCode(): string {
  return randomInt(100000, 1000000).toString();
}

export function signToken(payload: OtpPayload, secret = SECRET || "dev-only-insecure-secret"): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string, secret = SECRET || "dev-only-insecure-secret"): OtpPayload | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = createHmac("sha256", secret).update(data).digest("base64url");
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null;
    const payload: OtpPayload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isCodeValid(token: string, enteredCode: string, secret = SECRET): "valid" | "expired" | "invalid" {
  const payload = verifyToken(token, secret);
  if (!payload) return "expired";
  if (payload.code !== enteredCode.trim()) return "invalid";
  return "valid";
}
