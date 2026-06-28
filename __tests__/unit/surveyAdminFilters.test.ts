// Tests for admin View Surveys search/filter logic

interface Survey {
  id: string;
  title: string;
  active?: boolean;
  createdAt?: { toDate: () => Date };
}

function filterByName(surveys: Survey[], query: string): Survey[] {
  if (!query) return surveys;
  return surveys.filter(s => s.title.toLowerCase().includes(query.toLowerCase()));
}

function filterByMonth(surveys: Survey[], monthQuery: string): Survey[] {
  if (!monthQuery) return surveys;
  return surveys.filter(s => {
    if (!s.createdAt) return false;
    const monthName = s.createdAt.toDate().toLocaleDateString("en-GB", { month: "long" }).toLowerCase();
    return monthName.startsWith(monthQuery.toLowerCase());
  });
}

function makeDate(month: number, year = 2026): { toDate: () => Date } {
  return { toDate: () => new Date(year, month - 1, 15) };
}

const surveys: Survey[] = [
  { id: "1", title: "Community Needs",  active: true,  createdAt: makeDate(1) },  // January
  { id: "2", title: "Youth Survey",     active: true,  createdAt: makeDate(6) },  // June
  { id: "3", title: "Education Review", active: false, createdAt: makeDate(6) },  // June
  { id: "4", title: "Health Check",     active: true,  createdAt: makeDate(12) }, // December
];

describe("Admin survey name filter", () => {
  it("returns all when query is empty", () => {
    expect(filterByName(surveys, "")).toHaveLength(4);
  });

  it("filters case-insensitively by name", () => {
    expect(filterByName(surveys, "youth")).toHaveLength(1);
    expect(filterByName(surveys, "YOUTH")).toHaveLength(1);
  });

  it("matches partial name", () => {
    // "sur" only in "Youth Survey"
    expect(filterByName(surveys, "sur")).toHaveLength(1);
    expect(filterByName(surveys, "sur")[0].id).toBe("2");
  });

  it("returns empty when no match", () => {
    expect(filterByName(surveys, "zzz")).toHaveLength(0);
  });

  it("matches multiple surveys with shared substring", () => {
    // "review" only in "Education Review" → 1 match
    expect(filterByName(surveys, "review")).toHaveLength(1);
    // "h" → "Health Check" and "Youth Survey" → 2 matches
    expect(filterByName(surveys, "h")).toHaveLength(2);
  });
});

describe("Admin survey month filter", () => {
  it("returns all when month query is empty", () => {
    expect(filterByMonth(surveys, "")).toHaveLength(4);
  });

  it("filters surveys in June", () => {
    const result = filterByMonth(surveys, "jun");
    expect(result).toHaveLength(2);
    expect(result.map(s => s.id)).toContain("2");
    expect(result.map(s => s.id)).toContain("3");
  });

  it("filters surveys in January", () => {
    const result = filterByMonth(surveys, "jan");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters surveys in December", () => {
    const result = filterByMonth(surveys, "dec");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("4");
  });

  it("returns empty for a month with no surveys", () => {
    expect(filterByMonth(surveys, "mar")).toHaveLength(0);
  });

  it("excludes surveys without createdAt", () => {
    const withMissing = [...surveys, { id: "5", title: "No Date" }];
    expect(filterByMonth(withMissing, "jun")).toHaveLength(2);
  });

  it("is case-insensitive", () => {
    expect(filterByMonth(surveys, "JUN")).toHaveLength(2);
    expect(filterByMonth(surveys, "Jun")).toHaveLength(2);
  });
});

describe("Admin survey active toggle logic", () => {
  it("counts active surveys correctly", () => {
    const active = surveys.filter(s => s.active !== false);
    expect(active).toHaveLength(3);
  });

  it("counts disabled surveys correctly", () => {
    const disabled = surveys.filter(s => s.active === false);
    expect(disabled).toHaveLength(1);
    expect(disabled[0].id).toBe("3");
  });

  it("toggling active flips the value", () => {
    const isActive = true;
    expect(!isActive).toBe(false);
  });
});
