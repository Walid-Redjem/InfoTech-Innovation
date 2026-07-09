import { execSync } from "child_process";
import { readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { sign } from "crypto";

process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";

const KEY_PATH = join(tmpdir(), "jest-firebase-test.key");
const CERT_PATH = join(tmpdir(), "jest-firebase-test.crt");

execSync(`openssl req -new -x509 -newkey rsa:2048 -nodes -keyout ${KEY_PATH} -out ${CERT_PATH} -days 1 -subj "/CN=test"`);
const privateKeyPem = readFileSync(KEY_PATH, "utf8");
const certPem = readFileSync(CERT_PATH, "utf8");
unlinkSync(KEY_PATH);
unlinkSync(CERT_PATH);

const KID = "test-kid";

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function makeToken(overrides: Record<string, unknown> = {}, opts: { badSig?: boolean; kid?: string } = {}): string {
  const header = { alg: "RS256", kid: opts.kid ?? KID };
  const payload = {
    aud: "test-project",
    iss: "https://securetoken.google.com/test-project",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    sub: "user-123",
    email: "admin@example.com",
    ...overrides,
  };
  const headerB64 = b64url(JSON.stringify(header));
  const payloadB64 = b64url(JSON.stringify(payload));
  const signingInput = Buffer.from(`${headerB64}.${payloadB64}`);
  const signature = opts.badSig
    ? Buffer.from("not-a-real-signature")
    : sign("RSA-SHA256", signingInput, privateKeyPem);
  return `${headerB64}.${payloadB64}.${b64url(signature)}`;
}

// Mock the Google certs endpoint to return our self-signed test cert
global.fetch = jest.fn(async () =>
  ({ ok: true, json: async () => ({ [KID]: certPem }) } as Response)
) as unknown as typeof fetch;

import { verifyFirebaseIdToken } from "@/lib/verifyFirebaseIdToken";

describe("verifyFirebaseIdToken", () => {
  it("accepts a validly signed token with correct claims", async () => {
    const result = await verifyFirebaseIdToken(makeToken());
    expect(result).toEqual({ uid: "user-123", email: "admin@example.com" });
  });

  it("rejects a token with a tampered signature", async () => {
    const result = await verifyFirebaseIdToken(makeToken({}, { badSig: true }));
    expect(result).toBeNull();
  });

  it("rejects a token with the wrong audience", async () => {
    const result = await verifyFirebaseIdToken(makeToken({ aud: "someone-elses-project" }));
    expect(result).toBeNull();
  });

  it("rejects a token with the wrong issuer", async () => {
    const result = await verifyFirebaseIdToken(makeToken({ iss: "https://securetoken.google.com/other-project" }));
    expect(result).toBeNull();
  });

  it("rejects an expired token", async () => {
    const result = await verifyFirebaseIdToken(makeToken({ exp: Math.floor(Date.now() / 1000) - 10 }));
    expect(result).toBeNull();
  });

  it("rejects a token signed with an unknown key id", async () => {
    const result = await verifyFirebaseIdToken(makeToken({}, { kid: "unknown-kid" }));
    expect(result).toBeNull();
  });

  it("rejects malformed tokens", async () => {
    expect(await verifyFirebaseIdToken("not-a-jwt")).toBeNull();
    expect(await verifyFirebaseIdToken("")).toBeNull();
    expect(await verifyFirebaseIdToken("a.b")).toBeNull();
  });

  it("rejects a token missing a subject claim", async () => {
    const result = await verifyFirebaseIdToken(makeToken({ sub: "" }));
    expect(result).toBeNull();
  });
});
