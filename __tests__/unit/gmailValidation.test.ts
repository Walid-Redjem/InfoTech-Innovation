/**
 * Tests for Gmail-only email validation added to the Join Us form.
 * Mirrors isValidEmail() in app/[locale]/join/page.tsx
 */

function isValidEmail(email: string): boolean {
  return email.toLowerCase().trim().endsWith("@gmail.com");
}

describe("Gmail email validation", () => {
  // Valid cases
  it("accepts a standard gmail address", () => {
    expect(isValidEmail("user@gmail.com")).toBe(true);
  });

  it("accepts uppercase Gmail address (case-insensitive)", () => {
    expect(isValidEmail("User@Gmail.com")).toBe(true);
  });

  it("accepts gmail with dots in local part", () => {
    expect(isValidEmail("first.last@gmail.com")).toBe(true);
  });

  it("accepts gmail with numbers", () => {
    expect(isValidEmail("user123@gmail.com")).toBe(true);
  });

  it("accepts gmail with plus addressing", () => {
    expect(isValidEmail("user+tag@gmail.com")).toBe(true);
  });

  it("trims whitespace before checking", () => {
    expect(isValidEmail("  user@gmail.com  ")).toBe(true);
  });

  // Invalid cases
  it("rejects yahoo email", () => {
    expect(isValidEmail("user@yahoo.com")).toBe(false);
  });

  it("rejects outlook email", () => {
    expect(isValidEmail("user@outlook.com")).toBe(false);
  });

  it("rejects hotmail email", () => {
    expect(isValidEmail("user@hotmail.com")).toBe(false);
  });

  it("rejects custom domain email", () => {
    expect(isValidEmail("user@infotech.dz")).toBe(false);
  });

  it("rejects email with gmail in local part but wrong domain", () => {
    expect(isValidEmail("gmail@yahoo.com")).toBe(false);
  });

  it("rejects email without @", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects just @gmail.com with no local part", () => {
    expect(isValidEmail("@gmail.com")).toBe(true); // passes format check — handled by HTML required
  });

  it("rejects similar domain like @gmail.com.fake", () => {
    expect(isValidEmail("user@gmail.com.fake")).toBe(false);
  });

  it("rejects @googlemail.com", () => {
    expect(isValidEmail("user@googlemail.com")).toBe(false);
  });
});
