const PALETTE = [
  "#0f172a",
  "#1e3a5f",
  "#1d4ed8",
  "#0f766e",
  "#334155",
  "#1e40af",
  "#475569",
  "#0c4a6e",
];

export function colorFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
  period = "year"
): string | null {
  if (min == null && max == null) return null;
  const suffix = period === "hour" ? "/hr" : period === "month" ? "/mo" : "";
  const fmt = (n: number) => {
    if (period === "hour") return `$${n}`;
    if (n >= 1000) return `$${Math.round(n / 1000)}k`;
    return `$${n.toLocaleString()}`;
  };
  if (min != null && max != null) return `${fmt(min)}–${fmt(max)}${suffix}`;
  if (min != null) return `From ${fmt(min)}${suffix}`;
  return `Up to ${fmt(max!)}${suffix}`;
}

export function formatWorkplace(value: string): string {
  if (value === "remote") return "Remote";
  if (value === "hybrid") return "Hybrid";
  if (value === "onsite") return "On-site";
  return value;
}

export function formatEmployment(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
