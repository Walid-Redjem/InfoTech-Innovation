export function formatDate(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";
  // Handles Firestore Timestamp (duck typing — avoids Firebase import in tests)
  if (typeof val === "object" && val !== null && "toDate" in val && typeof (val as { toDate: unknown }).toDate === "function") {
    return (val as { toDate: () => Date }).toDate().toLocaleDateString("en-GB");
  }
  return String(val);
}
