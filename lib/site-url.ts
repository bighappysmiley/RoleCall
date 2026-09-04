/** Public origin for invite links, password reset, and Stripe return URLs. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    process.env.DEPLOY_PRIME_URL ??
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

/** True on the RoleCall Preview Netlify site and on Deploy Previews. */
export function isPreviewSite(): boolean {
  if (process.env.NEXT_PUBLIC_ROLECALL_PREVIEW === "true") {
    return true;
  }
  if (
    process.env.CONTEXT === "deploy-preview" ||
    process.env.CONTEXT === "branch-deploy"
  ) {
    return true;
  }
  const branch = process.env.BRANCH ?? process.env.HEAD ?? "";
  if (branch === "preview") {
    return true;
  }
  try {
    return new URL(getSiteUrl()).hostname.includes("preview");
  } catch {
    return false;
  }
}
