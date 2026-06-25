/**
 * Tests for the phone number auto-formatter added to the Join Us form.
 * Mirrors formatPhone() in app/[locale]/join/page.tsx
 */

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 8) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

describe("Phone number formatter", () => {
  // Basic formatting
  it("returns raw digits when 3 or fewer digits", () => {
    expect(formatPhone("067")).toBe("067");
  });

  it("formats 6 digits as XXX XXX", () => {
    expect(formatPhone("067123")).toBe("067 123");
  });

  it("formats 8 digits as XXX XXX XX", () => {
    expect(formatPhone("06712345")).toBe("067 123 45");
  });

  it("formats 10 digits as XXX XXX XX XX", () => {
    expect(formatPhone("0671234567")).toBe("067 123 45 67");
  });

  // Strips non-digit characters
  it("strips dashes from input", () => {
    expect(formatPhone("067-123-45-67")).toBe("067 123 45 67");
  });

  it("strips spaces from input before formatting", () => {
    expect(formatPhone("067 123 45 67")).toBe("067 123 45 67");
  });

  it("strips dots from input", () => {
    expect(formatPhone("067.123.45.67")).toBe("067 123 45 67");
  });

  it("strips parentheses", () => {
    expect(formatPhone("(067)1234567")).toBe("067 123 45 67");
  });

  // Max length enforcement
  it("truncates to 10 digits maximum", () => {
    expect(formatPhone("06712345678901")).toBe("067 123 45 67");
  });

  it("handles 11 digits by truncating", () => {
    expect(formatPhone("06712345678")).toBe("067 123 45 67");
  });

  // Edge cases
  it("returns empty string for empty input", () => {
    expect(formatPhone("")).toBe("");
  });

  it("returns empty string for non-numeric input", () => {
    expect(formatPhone("abcdef")).toBe("");
  });

  it("handles single digit", () => {
    expect(formatPhone("0")).toBe("0");
  });

  it("formats exactly 4 digits as XXX X", () => {
    expect(formatPhone("0671")).toBe("067 1");
  });

  it("formats exactly 7 digits as XXX XXX X", () => {
    expect(formatPhone("0671234")).toBe("067 123 4");
  });

  it("formats exactly 9 digits as XXX XXX XX X", () => {
    expect(formatPhone("067123456")).toBe("067 123 45 6");
  });
});
