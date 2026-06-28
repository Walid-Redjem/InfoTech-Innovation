// Tests for the survey one-question-at-a-time navigation logic

interface Question {
  id: string;
  text: string;
  type: "text" | "choice" | "rating";
  options?: string[];
  required: boolean;
}

// Extracted logic mirrors what surveys/page.tsx does
function canGoNext(questions: Question[], current: number, answers: Record<string, string | number>): boolean {
  const q = questions[current];
  if (!q) return false;
  if (!q.required) return true;
  const ans = answers[q.id];
  return ans !== undefined && ans !== "";
}

function isLastQuestion(questions: Question[], current: number): boolean {
  return current === questions.length - 1;
}

function nextIndex(current: number, total: number): number {
  return Math.min(current + 1, total - 1);
}

function prevIndex(current: number): number {
  return Math.max(current - 1, 0);
}

// Client-side sort by createdAt (seconds) descending
function sortSurveysByDate<T extends { createdAt?: { seconds: number } }>(surveys: T[]): T[] {
  return [...surveys].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

const questions: Question[] = [
  { id: "q1", text: "Name?",   type: "text",   required: true },
  { id: "q2", text: "Rating?", type: "rating", required: true },
  { id: "q3", text: "Notes?",  type: "text",   required: false },
];

describe("Survey navigation", () => {
  it("blocks Next when required question has no answer", () => {
    expect(canGoNext(questions, 0, {})).toBe(false);
  });

  it("allows Next when required question is answered", () => {
    expect(canGoNext(questions, 0, { q1: "Walid" })).toBe(true);
  });

  it("allows Next for optional question with no answer", () => {
    expect(canGoNext(questions, 2, {})).toBe(true);
  });

  it("correctly identifies last question", () => {
    expect(isLastQuestion(questions, 2)).toBe(true);
    expect(isLastQuestion(questions, 1)).toBe(false);
    expect(isLastQuestion(questions, 0)).toBe(false);
  });

  it("nextIndex does not exceed last index", () => {
    expect(nextIndex(2, 3)).toBe(2);
    expect(nextIndex(1, 3)).toBe(2);
  });

  it("prevIndex does not go below 0", () => {
    expect(prevIndex(0)).toBe(0);
    expect(prevIndex(1)).toBe(0);
    expect(prevIndex(2)).toBe(1);
  });

  it("allows Next when rating answer is 0 (app treats 0 as answered since 0 !== undefined && 0 !== '')", () => {
    // The app uses `ans !== undefined && ans !== ""` — 0 passes both checks
    // Rating UI starts at 1 so 0 is never actually selectable, but the logic still allows it
    const ans = { q2: 0 };
    expect(canGoNext(questions, 1, ans)).toBe(true);
  });

  it("allows Next when rating answer is 5", () => {
    expect(canGoNext(questions, 1, { q2: 5 })).toBe(true);
  });
});

describe("Survey client-side sort by date", () => {
  const surveys = [
    { id: "a", title: "Old",    createdAt: { seconds: 1000 } },
    { id: "b", title: "Newest", createdAt: { seconds: 9000 } },
    { id: "c", title: "Mid",    createdAt: { seconds: 5000 } },
  ];

  it("sorts newest first", () => {
    const sorted = sortSurveysByDate(surveys);
    expect(sorted[0].title).toBe("Newest");
    expect(sorted[1].title).toBe("Mid");
    expect(sorted[2].title).toBe("Old");
  });

  it("handles missing createdAt (treated as 0)", () => {
    const withMissing = [
      { id: "x", title: "NoDate" },
      { id: "y", title: "HasDate", createdAt: { seconds: 100 } },
    ];
    const sorted = sortSurveysByDate(withMissing);
    expect(sorted[0].title).toBe("HasDate");
  });

  it("does not mutate the original array", () => {
    const original = [...surveys];
    sortSurveysByDate(surveys);
    expect(surveys[0].title).toBe(original[0].title);
  });
});
