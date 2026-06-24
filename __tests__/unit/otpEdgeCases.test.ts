import { generateCode, signToken, verifyToken, isCodeValid } from "@/lib/otp";

const SECRET = "edge-case-secret";

describe("OTP edge cases", () => {

  // ── generateCode ───────────────────────────────────────────────────────────

  describe("generateCode distribution", () => {
    it("never produces a number below 100000", () => {
      for (let i = 0; i < 200; i++) {
        expect(parseInt(generateCode(), 10)).toBeGreaterThanOrEqual(100000);
      }
    });

    it("never produces a number above 999999", () => {
      for (let i = 0; i < 200; i++) {
        expect(parseInt(generateCode(), 10)).toBeLessThanOrEqual(999999);
      }
    });

    it("generates at least 90% unique codes across 100 calls (no clustering)", () => {
      const codes = Array.from({ length: 100 }, generateCode);
      const unique = new Set(codes).size;
      expect(unique).toBeGreaterThanOrEqual(90);
    });
  });

  // ── email edge cases ────────────────────────────────────────────────────────

  describe("emails with special characters", () => {
    it("handles email with dots in local part", () => {
      const email = "first.last@example.com";
      const token = signToken({ email, code: "111111", exp: Date.now() + 60000 }, SECRET);
      const result = verifyToken(token, SECRET);
      expect(result?.email).toBe(email);
    });

    it("handles email with plus sign (tagged address)", () => {
      const email = "user+tag@example.com";
      const token = signToken({ email, code: "222222", exp: Date.now() + 60000 }, SECRET);
      const result = verifyToken(token, SECRET);
      expect(result?.email).toBe(email);
    });

    it("handles Arabic domain email", () => {
      const email = "user@infotech.dz";
      const token = signToken({ email, code: "333333", exp: Date.now() + 60000 }, SECRET);
      expect(verifyToken(token, SECRET)?.email).toBe(email);
    });
  });

  // ── code edge cases ────────────────────────────────────────────────────────

  describe("code matching edge cases", () => {
    it("matches code with leading zero (e.g. '012345')", () => {
      const code = "012345";
      const token = signToken({ email: "x@x.com", code, exp: Date.now() + 60000 }, SECRET);
      expect(isCodeValid(token, code, SECRET)).toBe("valid");
    });

    it("does not match '12345' when stored code is '012345'", () => {
      const token = signToken({ email: "x@x.com", code: "012345", exp: Date.now() + 60000 }, SECRET);
      expect(isCodeValid(token, "12345", SECRET)).toBe("invalid");
    });

    it("trims spaces from both sides of entered code", () => {
      const code = "567890";
      const token = signToken({ email: "x@x.com", code, exp: Date.now() + 60000 }, SECRET);
      expect(isCodeValid(token, "  567890  ", SECRET)).toBe("valid");
    });

    it("does not match code with extra characters", () => {
      const token = signToken({ email: "x@x.com", code: "123456", exp: Date.now() + 60000 }, SECRET);
      expect(isCodeValid(token, "1234567", SECRET)).toBe("invalid");
    });

    it("is case sensitive — letters in code must match exactly", () => {
      const token = signToken({ email: "x@x.com", code: "ABCDEF", exp: Date.now() + 60000 }, SECRET);
      expect(isCodeValid(token, "abcdef", SECRET)).toBe("invalid");
    });
  });

  // ── token format edge cases ────────────────────────────────────────────────

  describe("malformed token inputs", () => {
    it("returns null for token with no dot separator", () => {
      expect(verifyToken("nodothere", SECRET)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(verifyToken("", SECRET)).toBeNull();
    });

    it("returns null for just a dot", () => {
      expect(verifyToken(".", SECRET)).toBeNull();
    });

    it("returns null for valid base64 but invalid JSON payload", () => {
      const badData = Buffer.from("not-json").toString("base64url");
      expect(verifyToken(`${badData}.fakesig`, SECRET)).toBeNull();
    });

    it("returns null for token with correct structure but wrong secret", () => {
      const token = signToken({ email: "x@x.com", code: "123456", exp: Date.now() + 60000 }, "correct-secret");
      expect(verifyToken(token, "wrong-secret")).toBeNull();
    });
  });

  // ── expiry precision ───────────────────────────────────────────────────────

  describe("expiry timing", () => {
    it("accepts a token that expires 1 second from now", () => {
      const token = signToken({ email: "x@x.com", code: "999999", exp: Date.now() + 1000 }, SECRET);
      expect(verifyToken(token, SECRET)).not.toBeNull();
    });

    it("rejects a token that expired 1ms ago", () => {
      const token = signToken({ email: "x@x.com", code: "999999", exp: Date.now() - 1 }, SECRET);
      expect(verifyToken(token, SECRET)).toBeNull();
    });

    it("isCodeValid returns 'expired' — not 'invalid' — for expired tokens", () => {
      const expired = signToken({ email: "x@x.com", code: "123456", exp: Date.now() - 1000 }, SECRET);
      expect(isCodeValid(expired, "123456", SECRET)).toBe("expired");
    });
  });
});
