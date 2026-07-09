import { X509Certificate, verify as verifySignature } from "crypto";

// Verifies a Firebase Auth ID token server-side without the Admin SDK (no service
// account needed) by checking the RS256 signature against Google's public certs
// and validating the standard claims. See:
// https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library

const CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let certsCache: { certs: Record<string, string>; expiresAt: number } | null = null;

async function getGoogleCerts(): Promise<Record<string, string>> {
  if (certsCache && certsCache.expiresAt > Date.now()) return certsCache.certs;
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error("Failed to fetch Google public certs");
  const certs: Record<string, string> = await res.json();
  certsCache = { certs, expiresAt: Date.now() + 60 * 60 * 1000 };
  return certs;
}

function base64UrlDecode(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

export interface VerifiedIdToken {
  uid: string;
  email?: string;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedIdToken | null> {
  if (!PROJECT_ID || !idToken) return null;
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;

    const header = JSON.parse(base64UrlDecode(headerB64).toString());
    const payload = JSON.parse(base64UrlDecode(payloadB64).toString());

    if (header.alg !== "RS256" || typeof header.kid !== "string") return null;
    if (payload.aud !== PROJECT_ID) return null;
    if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) return null;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    if (typeof payload.iat !== "number" || payload.iat * 1000 > Date.now() + 60_000) return null;
    if (typeof payload.sub !== "string" || !payload.sub) return null;

    const certs = await getGoogleCerts();
    const certPem = certs[header.kid];
    if (!certPem) return null;

    const publicKey = new X509Certificate(certPem).publicKey;
    const signingInput = Buffer.from(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(sigB64);
    const valid = verifySignature("RSA-SHA256", signingInput, publicKey, signature);
    if (!valid) return null;

    return { uid: payload.sub, email: typeof payload.email === "string" ? payload.email : undefined };
  } catch {
    return null;
  }
}

export async function requireAdmin(req: Request): Promise<VerifiedIdToken | null> {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return null;
  return verifyFirebaseIdToken(idToken);
}
