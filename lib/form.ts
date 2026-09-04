export function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function formChecked(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function splitList(value: string): string[] {
  return value
    .split(/[,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function dollarsToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed.replace(/[$,]/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Enter a valid dollar amount.");
  }
  return Math.round(parsed * 100);
}

export function centsToDollarInput(cents: number | null): string {
  if (cents == null) {
    return "";
  }
  if (cents % 100 === 0) {
    return String(cents / 100);
  }
  return (cents / 100).toFixed(2);
}

export function isPast(date: Date | null | undefined): boolean {
  if (!date) {
    return false;
  }
  return date.getTime() < Date.now();
}

export function safeNextPath(value: string | undefined | null): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }
  return value;
}

export function parseOptionalYear(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const year = Number(trimmed);
  if (!Number.isInteger(year) || year < 1800 || year > new Date().getFullYear() + 1) {
    throw new Error("Enter a valid founding year.");
  }
  return year;
}
