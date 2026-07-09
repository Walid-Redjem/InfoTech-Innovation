// Neutralize CSV/formula injection: a cell whose text starts with =, +, -, or @
// is interpreted as a formula by Excel/Sheets when the file is opened, even
// though the CSV field itself is quoted — quoting only escapes delimiters, it
// doesn't stop spreadsheet apps from treating the value as a formula.
function neutralizeFormula(value: unknown): unknown {
  if (typeof value === "string" && /^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

export function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => JSON.stringify(neutralizeFormula(row[h]) ?? "")).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
