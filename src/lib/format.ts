const PALETTE = [
  "#0d0c22",
  "#3d3a5c",
  "#ea4c89",
  "#2d6a6a",
  "#8b5a2b",
  "#4a5568",
  "#1f4e79",
  "#5c4033",
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
