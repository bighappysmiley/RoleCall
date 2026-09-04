export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "item";
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = slugify(base);
  if (!taken.has(root)) {
    return root;
  }
  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${root}-${i}`;
    if (!taken.has(candidate)) {
      return candidate;
    }
  }
  return `${root}-${crypto.randomUUID().slice(0, 8)}`;
}

export function createInviteToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}
