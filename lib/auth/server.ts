import { createNeonAuth, type NeonAuth } from "@neondatabase/auth/next/server";

let cached: NeonAuth | null = null;

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET,
  );
}

export function getAuth(): NeonAuth {
  if (cached) {
    return cached;
  }

  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!baseUrl || !secret) {
    throw new Error(
      "Neon Auth is not configured. Add NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET to .env.local.",
    );
  }

  cached = createNeonAuth({
    baseUrl,
    cookies: { secret },
  });
  return cached;
}

export const auth: NeonAuth = new Proxy({} as NeonAuth, {
  get(_target, property, receiver) {
    const value = Reflect.get(getAuth(), property, receiver);
    return typeof value === "function" ? value.bind(getAuth()) : value;
  },
});

export async function getOptionalSession() {
  if (!isAuthConfigured()) {
    return null;
  }

  try {
    const { data } = await getAuth().getSession();
    return data ?? null;
  } catch {
    return null;
  }
}
