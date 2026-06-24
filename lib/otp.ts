import { createHmac } from "crypto";

const SECRET = process.env.OTP_SECRET || "infotech-secret-key";

export interface OtpPayload {
  email: string;
  code: string;
  exp: number;
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function signToken(payload: OtpPayload, secret = SECRET): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string, secret = SECRET): OtpPayload | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = createHmac("sha256", secret).update(data).digest("base64url");
    if (sig !== expected) return null;
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
