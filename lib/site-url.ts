/** Public origin for invite links, password reset, and Stripe return URLs. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    process.env.DEPLOY_PRIME_URL ??
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
