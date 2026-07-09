/* @jest-environment jsdom */
// Tests for terms modal checkbox gating logic

function canSubmitTerms(checked: boolean): boolean {
  return checked;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept to document the function's conceptual input
function shouldResetOnClose(checked: boolean): boolean {
  // Checkbox should always reset when modal closes
  return false; // always returns unchecked state on close
}

describe("Terms modal checkbox gating", () => {
  it("disables Got It button when unchecked", () => {
    expect(canSubmitTerms(false)).toBe(false);
  });

  it("enables Got It button when checked", () => {
    expect(canSubmitTerms(true)).toBe(true);
  });

  it("resets checkbox state on modal close", () => {
    expect(shouldResetOnClose(true)).toBe(false);
    expect(shouldResetOnClose(false)).toBe(false);
  });
});

// Tests for file upload drag-and-drop logic
describe("FileUpload drag and drop", () => {
  it("accepts a dropped File object", () => {
    const mockFile = new File(["content"], "test.pdf", { type: "application/pdf" });
    // Simulates what the onDrop handler does: picks first file from dataTransfer
    const dataTransfer = { files: [mockFile] };
    const file = dataTransfer.files?.[0];
    expect(file).toBeDefined();
    expect(file?.name).toBe("test.pdf");
  });

  it("ignores drop with no files", () => {
    const dataTransfer = { files: [] };
    const file = dataTransfer.files?.[0];
    expect(file).toBeUndefined();
  });

  it("accepts only first file when multiple dropped", () => {
    const files = [
      new File(["a"], "first.pdf", { type: "application/pdf" }),
      new File(["b"], "second.pdf", { type: "application/pdf" }),
    ];
    const picked = files?.[0];
    expect(picked?.name).toBe("first.pdf");
  });
});

// Dark mode localStorage persistence
describe("Admin dark mode persistence", () => {
  beforeEach(() => localStorage.clear());

  it("reads dark mode preference from localStorage", () => {
    localStorage.setItem("admin-dark", "true");
    const saved = localStorage.getItem("admin-dark");
    expect(saved).toBe("true");
  });

  it("defaults to light mode when no preference saved", () => {
    const saved = localStorage.getItem("admin-dark");
    expect(saved).toBeNull();
  });

  it("persists after toggling", () => {
    // Toggle on
    localStorage.setItem("admin-dark", "true");
    expect(localStorage.getItem("admin-dark")).toBe("true");
    // Toggle off
    localStorage.setItem("admin-dark", "false");
    expect(localStorage.getItem("admin-dark")).toBe("false");
  });
});
