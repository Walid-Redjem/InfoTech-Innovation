/**
 * @jest-environment jsdom
 */
import { exportCSV } from "@/lib/exportCSV";

// jsdom mock for URL and anchor
const createObjectURLMock = jest.fn(() => "blob:mock-url");
const revokeObjectURLMock = jest.fn();
const clickMock = jest.fn();

beforeAll(() => {
  global.URL.createObjectURL = createObjectURLMock;
  global.URL.revokeObjectURL = revokeObjectURLMock;
  jest.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag === "a") {
      return { href: "", download: "", click: clickMock } as unknown as HTMLAnchorElement;
    }
    return document.createElement(tag);
  });
});

afterEach(() => jest.clearAllMocks());

describe("exportCSV", () => {
  it("does nothing when data array is empty", () => {
    exportCSV([], "test");
    expect(createObjectURLMock).not.toHaveBeenCalled();
  });

  it("creates a Blob and triggers download", () => {
    exportCSV([{ name: "Alice", email: "alice@test.com" }], "registrations");
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);
  });

  it("uses correct filename", () => {
    const createElement = jest.spyOn(document, "createElement");
    exportCSV([{ a: "1" }], "my-export");
    const anchor = createElement.mock.results.find(r => r.value?.download !== undefined)?.value;
    expect(anchor?.download).toBe("my-export.csv");
  });

  it("includes all keys as CSV headers", () => {
    let csvContent = "";
    global.Blob = jest.fn().mockImplementation((parts: string[]) => {
      csvContent = parts[0];
      return { size: parts[0].length };
    }) as unknown as typeof Blob;

    exportCSV([{ name: "Bob", age: "25", city: "Algiers" }], "test");
    expect(csvContent).toContain("name,age,city");
  });

  it("handles null and undefined values gracefully", () => {
    let csvContent = "";
    global.Blob = jest.fn().mockImplementation((parts: string[]) => {
      csvContent = parts[0];
      return {};
    }) as unknown as typeof Blob;

    exportCSV([{ name: "Alice", phone: null, email: undefined } as Record<string, unknown>], "test");
    expect(csvContent).toContain("Alice");
  });

  it("neutralizes formula-injection payloads (leading =, +, -, @)", () => {
    let csvContent = "";
    global.Blob = jest.fn().mockImplementation((parts: string[]) => {
      csvContent = parts[0];
      return {};
    }) as unknown as typeof Blob;

    exportCSV([
      { name: "=HYPERLINK(\"http://evil.com\")", note: "+cmd", other: "-1+1", at: "@SUM(1)", safe: "hello=world" },
    ], "test");

    expect(csvContent).toContain("'=HYPERLINK");
    expect(csvContent).toContain("'+cmd");
    expect(csvContent).toContain("'-1+1");
    expect(csvContent).toContain("'@SUM(1)");
    expect(csvContent).toContain("hello=world");
    expect(csvContent).not.toContain('"hello=world\'');
  });

  it("exports multiple rows correctly", () => {
    let csvContent = "";
    global.Blob = jest.fn().mockImplementation((parts: string[]) => {
      csvContent = parts[0];
      return {};
    }) as unknown as typeof Blob;

    exportCSV([
      { name: "Alice", category: "youth" },
      { name: "Bob", category: "teacher" },
    ], "regs");

    const lines = csvContent.trim().split("\n");
    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[0]).toBe("name,category");
  });
});
