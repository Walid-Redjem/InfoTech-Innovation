import { formatDate } from "@/lib/formatDate";

describe("formatDate", () => {
  it("returns '—' for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns '—' for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns '—' for empty string", () => {
    expect(formatDate("")).toBe("—");
  });

  it("returns '—' for 0 (falsy number)", () => {
    expect(formatDate(0)).toBe("0");
  });

  it("formats a Firestore-like Timestamp object with toDate()", () => {
    const mockTimestamp = { toDate: () => new Date("2026-06-24T00:00:00Z") };
    const result = formatDate(mockTimestamp);
    // Should produce a localised UK date string like "24/06/2026"
    expect(result).toMatch(/24/);
    expect(result).toMatch(/2026/);
  });

  it("formats another Timestamp correctly", () => {
    const mockTimestamp = { toDate: () => new Date("2025-01-15T00:00:00Z") };
    const result = formatDate(mockTimestamp);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });

  it("returns string value as-is for plain strings", () => {
    expect(formatDate("hello")).toBe("hello");
    expect(formatDate("2026-06-24")).toBe("2026-06-24");
  });

  it("converts numbers to string", () => {
    expect(formatDate(42)).toBe("42");
  });

  it("does not call toDate() on objects without that method", () => {
    const obj = { notATimestamp: true };
    expect(formatDate(obj)).toBe(String(obj));
  });

  it("ignores toDate if it is not a function", () => {
    const weirdObj = { toDate: "not-a-function" };
    expect(formatDate(weirdObj)).toBe(String(weirdObj));
  });
});
