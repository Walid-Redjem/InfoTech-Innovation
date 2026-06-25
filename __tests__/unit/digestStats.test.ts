/**
 * Tests for the weekly digest statistics calculation logic.
 * Mirrors the data aggregation in app/api/digest/route.ts
 */

interface Reg { status?: string; createdAt?: { toDate: () => Date } | string }
interface Issue { createdAt?: { toDate: () => Date } | string }

function toDate(ts: unknown): Date | null {
  if (!ts) return null;
  if (typeof (ts as { toDate?: unknown }).toDate === "function")
    return (ts as { toDate: () => Date }).toDate();
  if (typeof ts === "string") return new Date(ts);
  return null;
}

function calcDigestStats(regs: Reg[], issues: Issue[], oneWeekAgo: Date) {
  function isThisWeek(ts: unknown) {
    const d = toDate(ts);
    return d !== null && d >= oneWeekAgo;
  }
  return {
    totalRegs: regs.length,
    pending: regs.filter(r => (r.status || "pending") === "pending").length,
    approved: regs.filter(r => r.status === "approved").length,
    newThisWeek: regs.filter(r => isThisWeek(r.createdAt)).length,
    totalIssues: issues.length,
    newIssues: issues.filter(r => isThisWeek(r.createdAt)).length,
  };
}

const ONE_WEEK_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const RECENT = { toDate: () => new Date() };
const OLD = { toDate: () => new Date("2020-01-01") };

describe("Digest statistics calculation", () => {
  it("counts total registrations correctly", () => {
    const regs: Reg[] = [{ status: "approved" }, { status: "pending" }, { status: "pending" }];
    const stats = calcDigestStats(regs, [], ONE_WEEK_AGO);
    expect(stats.totalRegs).toBe(3);
  });

  it("counts pending registrations", () => {
    const regs: Reg[] = [{ status: "approved" }, { status: "pending" }, { status: "pending" }];
    const stats = calcDigestStats(regs, [], ONE_WEEK_AGO);
    expect(stats.pending).toBe(2);
  });

  it("counts approved registrations", () => {
    const regs: Reg[] = [{ status: "approved" }, { status: "approved" }, { status: "pending" }];
    const stats = calcDigestStats(regs, [], ONE_WEEK_AGO);
    expect(stats.approved).toBe(2);
  });

  it("treats missing status as pending", () => {
    const regs: Reg[] = [{ }, { status: "approved" }];
    const stats = calcDigestStats(regs, [], ONE_WEEK_AGO);
    expect(stats.pending).toBe(1);
  });

  it("counts new registrations this week", () => {
    const regs: Reg[] = [
      { status: "pending", createdAt: RECENT },
      { status: "pending", createdAt: RECENT },
      { status: "approved", createdAt: OLD },
    ];
    const stats = calcDigestStats(regs, [], ONE_WEEK_AGO);
    expect(stats.newThisWeek).toBe(2);
  });

  it("counts total issues", () => {
    const issues: Issue[] = [{}, {}, {}];
    const stats = calcDigestStats([], issues, ONE_WEEK_AGO);
    expect(stats.totalIssues).toBe(3);
  });

  it("counts new issues this week", () => {
    const issues: Issue[] = [
      { createdAt: RECENT },
      { createdAt: OLD },
      { createdAt: RECENT },
    ];
    const stats = calcDigestStats([], issues, ONE_WEEK_AGO);
    expect(stats.newIssues).toBe(2);
  });

  it("returns zeros for empty data", () => {
    const stats = calcDigestStats([], [], ONE_WEEK_AGO);
    expect(stats.totalRegs).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.approved).toBe(0);
    expect(stats.newThisWeek).toBe(0);
    expect(stats.totalIssues).toBe(0);
    expect(stats.newIssues).toBe(0);
  });

  it("handles string date in createdAt", () => {
    const regs: Reg[] = [{ status: "pending", createdAt: new Date().toISOString() }];
    const stats = calcDigestStats(regs, [], ONE_WEEK_AGO);
    expect(stats.newThisWeek).toBe(1);
  });

  it("does not count old registrations as new this week", () => {
    const regs: Reg[] = [
      { status: "pending", createdAt: OLD },
      { status: "approved", createdAt: OLD },
    ];
    const stats = calcDigestStats(regs, [], ONE_WEEK_AGO);
    expect(stats.newThisWeek).toBe(0);
  });

  it("pending + approved = totalRegs when no other status", () => {
    const regs: Reg[] = [
      { status: "approved" }, { status: "approved" },
      { status: "pending" }, { status: "pending" }, { status: "pending" },
    ];
    const stats = calcDigestStats(regs, [], ONE_WEEK_AGO);
    expect(stats.pending + stats.approved).toBe(stats.totalRegs);
  });
});
