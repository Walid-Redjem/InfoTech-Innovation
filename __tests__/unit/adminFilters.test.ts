/**
 * Tests for admin dashboard filter and search logic.
 * These mirror the useMemo filters in app/[locale]/admin/page.tsx
 */

export {};

type Reg = Record<string, unknown>;

function filterRegistrations(
  registrations: Reg[],
  catFilter: string,
  searchQuery: string
): Reg[] {
  let result = catFilter === "all" ? registrations : registrations.filter(r => r.category === catFilter);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(r =>
      String(r.name || r.institution_name || "").toLowerCase().includes(q) ||
      String(r.email || "").toLowerCase().includes(q) ||
      String(r.category || "").toLowerCase().includes(q) ||
      String(r.phone || "").toLowerCase().includes(q)
    );
  }
  return result;
}

function filterIssues(
  issues: Reg[],
  typeFilter: string,
  statusFilter: string
): Reg[] {
  return issues
    .filter(r => typeFilter === "all" || r.type === typeFilter)
    .filter(r => statusFilter === "all" || (r.status || "pending") === statusFilter);
}

const regs: Reg[] = [
  { id: "1", name: "Alice",      email: "alice@test.com",  phone: "0770001111", category: "youth" },
  { id: "2", name: "Bob",        email: "bob@test.com",    phone: "0770002222", category: "teacher" },
  { id: "3", institution_name: "Org X", email: "org@test.com", phone: "0770003333", category: "institution" },
  { id: "4", name: "Ali",        email: "ali@work.com",    phone: "0770004444", category: "youth" },
];

const issues: Reg[] = [
  { id: "a", type: "education",   status: "pending" },
  { id: "b", type: "environment", status: "done"    },
  { id: "c", type: "education",   status: "done"    },
  { id: "d", type: "technology",  status: "pending" },
];

// ── REGISTRATION FILTERS ──────────────────────────────────────────────────────

describe("Registration category filter", () => {
  it("returns all when catFilter is 'all'", () => {
    expect(filterRegistrations(regs, "all", "")).toHaveLength(4);
  });

  it("filters to youth only", () => {
    const result = filterRegistrations(regs, "youth", "");
    expect(result).toHaveLength(2);
    result.forEach(r => expect(r.category).toBe("youth"));
  });

  it("filters to teacher only", () => {
    const result = filterRegistrations(regs, "teacher", "");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Bob");
  });

  it("filters to institution only", () => {
    const result = filterRegistrations(regs, "institution", "");
    expect(result).toHaveLength(1);
    expect(result[0].institution_name).toBe("Org X");
  });

  it("returns empty when category has no matches", () => {
    expect(filterRegistrations(regs, "unknown", "")).toHaveLength(0);
  });
});

describe("Registration search", () => {
  it("finds by name (case insensitive)", () => {
    const result = filterRegistrations(regs, "all", "alice");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alice");
  });

  it("finds by email", () => {
    const result = filterRegistrations(regs, "all", "bob@test");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Bob");
  });

  it("finds by institution name", () => {
    const result = filterRegistrations(regs, "all", "org x");
    expect(result).toHaveLength(1);
    expect(result[0].institution_name).toBe("Org X");
  });

  it("finds by phone", () => {
    const result = filterRegistrations(regs, "all", "0770004444");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ali");
  });

  it("finds multiple matches for partial query", () => {
    // both alice@test.com and ali@work.com contain "ali"
    const result = filterRegistrations(regs, "all", "ali");
    expect(result).toHaveLength(2);
  });

  it("empty search returns all", () => {
    expect(filterRegistrations(regs, "all", "")).toHaveLength(4);
    expect(filterRegistrations(regs, "all", "   ")).toHaveLength(4);
  });

  it("returns empty when no match", () => {
    expect(filterRegistrations(regs, "all", "zzznomatch")).toHaveLength(0);
  });

  it("combines category filter and search", () => {
    // "ali" matches both "Alice" (alice contains ali) and "Ali" — both are youth
    const result = filterRegistrations(regs, "youth", "ali");
    expect(result).toHaveLength(2);
    result.forEach(r => expect(r.category).toBe("youth"));
  });

  it("combines category filter and search with exact name", () => {
    // "ali@work" is unique — only matches Ali
    const result = filterRegistrations(regs, "youth", "ali@work");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ali");
  });
});

// ── ISSUE FILTERS ─────────────────────────────────────────────────────────────

describe("Issue type filter", () => {
  it("returns all when typeFilter is 'all'", () => {
    expect(filterIssues(issues, "all", "all")).toHaveLength(4);
  });

  it("filters to education type only", () => {
    const result = filterIssues(issues, "education", "all");
    expect(result).toHaveLength(2);
    result.forEach(r => expect(r.type).toBe("education"));
  });

  it("filters to technology type only", () => {
    const result = filterIssues(issues, "technology", "all");
    expect(result).toHaveLength(1);
  });

  it("returns empty when type has no matches", () => {
    expect(filterIssues(issues, "health", "all")).toHaveLength(0);
  });
});

describe("Issue status filter", () => {
  it("returns all when statusFilter is 'all'", () => {
    expect(filterIssues(issues, "all", "all")).toHaveLength(4);
  });

  it("filters to done issues only", () => {
    const result = filterIssues(issues, "all", "done");
    expect(result).toHaveLength(2);
    result.forEach(r => expect(r.status).toBe("done"));
  });

  it("filters to pending issues only", () => {
    const result = filterIssues(issues, "all", "pending");
    expect(result).toHaveLength(2);
    result.forEach(r => expect(r.status || "pending").toBe("pending"));
  });

  it("issues with no status field are treated as pending", () => {
    const withMissing: Reg[] = [{ id: "x", type: "youth", status: undefined }];
    const result = filterIssues(withMissing, "all", "pending");
    expect(result).toHaveLength(1);
  });

  it("combines type and status filters", () => {
    // Only education + done
    const result = filterIssues(issues, "education", "done");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c");
  });
});
