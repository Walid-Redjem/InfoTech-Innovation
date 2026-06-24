import { NextRequest } from "next/server";

// Mock the OTP module before importing the route
jest.mock("@/lib/otp", () => ({
  isCodeValid: jest.fn(),
  verifyToken: jest.fn(),
}));

import { POST } from "@/app/api/verify-code/route";
import { isCodeValid, verifyToken } from "@/lib/otp";

const mockIsCodeValid = isCodeValid as jest.Mock;
const mockVerifyToken  = verifyToken  as jest.Mock;

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => jest.clearAllMocks());

describe("POST /api/verify-code", () => {
  it("returns { valid: false, error: 'Missing fields' } when token is absent", async () => {
    const req = makeRequest({ code: "123456" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.valid).toBe(false);
    expect(data.error).toBe("Missing fields");
  });

  it("returns { valid: false, error: 'Missing fields' } when code is absent", async () => {
    const req = makeRequest({ token: "some-token" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.valid).toBe(false);
    expect(data.error).toBe("Missing fields");
  });

  it("returns { valid: false, error: 'expired' } when token is expired", async () => {
    mockIsCodeValid.mockReturnValue("expired");
    const req = makeRequest({ token: "expired-token", code: "123456" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.valid).toBe(false);
    expect(data.error).toBe("expired");
  });

  it("returns { valid: false, error: 'invalid' } when code is wrong", async () => {
    mockIsCodeValid.mockReturnValue("invalid");
    const req = makeRequest({ token: "valid-token", code: "000000" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.valid).toBe(false);
    expect(data.error).toBe("invalid");
  });

  it("returns { valid: true, email } when code is correct", async () => {
    mockIsCodeValid.mockReturnValue("valid");
    mockVerifyToken.mockReturnValue({ email: "user@test.com", code: "654321", exp: Date.now() + 60000 });
    const req = makeRequest({ token: "good-token", code: "654321" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.valid).toBe(true);
    expect(data.email).toBe("user@test.com");
  });

  it("returns HTTP 200 with valid:false for missing fields (API uses 200 with error body)", async () => {
    const req = makeRequest({ code: "123456" }); // no token
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.valid).toBe(false);
    expect(data.error).toBe("Missing fields");
  });
});
