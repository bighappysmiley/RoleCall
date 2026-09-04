import { createNeonAuth } from "@neondatabase/auth/next/server";

/**
 * Neon Auth requires cookies.secret at module init (including Next.js
 * "Collecting page data" on Netlify). Prefer NEON_AUTH_COOKIE_SECRET;
 * AUTH_SECRET is accepted as an alias.
 *
 * During `next build` only, fall back to a placeholder so deploys don't fail
 * before env vars are wired. Runtime requests still need the real secret set
 * in Netlify (Builds + Functions / runtime scopes).
 */
function resolveCookieSecret(): string {
  const fromEnv =
    process.env.NEON_AUTH_COOKIE_SECRET || process.env.AUTH_SECRET || "";

  if (fromEnv.length >= 32) {
    return fromEnv;
  }

  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  if (isBuildPhase) {
    return "rolecall-build-placeholder-secret-min-32-chars";
  }

  throw new Error(
    "Missing NEON_AUTH_COOKIE_SECRET (or AUTH_SECRET). In Netlify: Site configuration → Environment variables → add NEON_AUTH_COOKIE_SECRET for Builds and Functions, then redeploy."
  );
}

function resolveAuthBaseUrl(): string {
  const fromEnv = process.env.NEON_AUTH_BASE_URL || "";
  if (fromEnv) return fromEnv;

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "https://placeholder.neonauth.invalid/neondb/auth";
  }

  throw new Error(
    "Missing NEON_AUTH_BASE_URL. Add it in Netlify environment variables (Builds and Functions), then redeploy."
  );
}

export const auth = createNeonAuth({
  baseUrl: resolveAuthBaseUrl(),
  cookies: {
    secret: resolveCookieSecret(),
  },
});
