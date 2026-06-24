import { generateCode, signToken, verifyToken, isCodeValid } from "@/lib/otp";

const SECRET = "test-secret-key";

describe("generateCode", () => {
  it("generates a 6-digit string", () => {
    const code = generateCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("generates different codes each time", () => {
    const codes = new Set(Array.from({ length: 20 }, generateCode));
    expect(codes.size).toBeGreaterThan(1);
  });

  it("always produces a number between 100000 and 999999", () => {
    for (let i = 0; i < 50; i++) {
      const n = parseInt(generateCode(), 10);
      expect(n).toBeGreaterThanOrEqual(100000);
      expect(n).toBeLessThanOrEqual(999999);
    }
  });
});

describe("signToken / verifyToken", () => {
  const payload = {
    email: "test@example.com",
    code: "123456",
    exp: Date.now() + 10 * 60 * 1000,
  };

  it("signs and verifies a valid token", () => {
    const token = signToken(payload, SECRET);
    const result = verifyToken(token, SECRET);
    expect(result).not.toBeNull();
    expect(result!.email).toBe(payload.email);
    expect(result!.code).toBe(payload.code);
  });

  it("returns null for a tampered token", () => {
    const token = signToken(payload, SECRET);
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(verifyToken(tampered, SECRET)).toBeNull();
  });

  it("returns null for a token signed with a different secret", () => {
    const token = signToken(payload, "wrong-secret");
    expect(verifyToken(token, SECRET)).toBeNull();
  });

  it("returns null for an expired token", () => {
    const expired = signToken(
      { ...payload, exp: Date.now() - 1000 },
      SECRET
    );
    expect(verifyToken(expired, SECRET)).toBeNull();
  });

  it("returns null for garbage input", () => {
    expect(verifyToken("not.a.token", SECRET)).toBeNull();
    expect(verifyToken("", SECRET)).toBeNull();
    expect(verifyToken("abc", SECRET)).toBeNull();
  });
});

describe("isCodeValid", () => {
  const email = "user@example.com";
  const code = "654321";
  const validToken = () =>
    signToken({ email, code, exp: Date.now() + 5 * 60 * 1000 }, SECRET);

  it("returns 'valid' for correct code", () => {
    expect(isCodeValid(validToken(), code, SECRET)).toBe("valid");
  });

  it("returns 'invalid' for wrong code", () => {
    expect(isCodeValid(validToken(), "000000", SECRET)).toBe("invalid");
  });

  it("trims whitespace from entered code", () => {
    expect(isCodeValid(validToken(), `  ${code}  `, SECRET)).toBe("valid");
  });

  it("returns 'expired' for expired token", () => {
    const expiredToken = signToken(
      { email, code, exp: Date.now() - 1000 },
      SECRET
    );
    expect(isCodeValid(expiredToken, code, SECRET)).toBe("expired");
  });

  it("returns 'expired' for invalid token", () => {
    expect(isCodeValid("garbage", code, SECRET)).toBe("expired");
  });
});
