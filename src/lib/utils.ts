/** Joins class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "2026-09-16" → "16 Sep 2026", "2026-09" → "Sep 2026".
 * Parsed by hand so the output never shifts with the visitor's time zone.
 */
export function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y) return value;
  if (!m) return String(y);
  const month = MONTHS[m - 1] ?? "";
  return d ? `${d} ${month} ${y}` : `${month} ${y}`;
}

/** Sort key that puts undated items last. */
export function dateKey(value: string | undefined): string {
  return value ?? "0000";
}
