/**
 * RoleCall env resolution.
 * Prefers process.env (local / Netlify UI). Falls back to committed Neon Free
 * values so Netlify builds and serverless runtime work without dashboard paste.
 */
const FALLBACKS = {
  DATABASE_URL:
    "postgresql://neondb_owner:npg_7viJImhXxGF1@ep-snowy-water-a5gtaxta-pooler.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  NEON_AUTH_BASE_URL:
    "https://ep-snowy-water-a5gtaxta.neonauth.us-east-2.aws.neon.tech/neondb/auth",
  NEON_AUTH_COOKIE_SECRET: "oyCnkL1ZpGGe6cojFw73IFXt7ckoDn6wYBJc3nXqhWo=",
  NEON_PROJECT_ID: "plain-recipe-00849018",
  NEON_BRANCH_ID: "br-summer-hat-a52zghm0",
  AWS_ENDPOINT_URL_S3:
    "https://br-summer-hat-a52zghm0.storage.c-1.us-east-2.aws.neon.tech",
  AWS_REGION: "us-east-2",
  AWS_ACCESS_KEY_ID: "nak_live_92c5ca49667d4ce4b9be0cf3ffbf376c",
  AWS_SECRET_ACCESS_KEY:
    "nsk_live_c39fa5f421b0e904aab0c3fca440a945dd5ac3fa26ebabc7ca51188694f7f0a6",
} as const;

function pick(key: keyof typeof FALLBACKS, ...aliases: string[]): string {
  for (const name of [key, ...aliases]) {
    const value = process.env[name];
    if (value && value.length > 0) return value;
  }
  return FALLBACKS[key];
}

export const env = {
  DATABASE_URL: pick("DATABASE_URL"),
  NEON_AUTH_BASE_URL: pick("NEON_AUTH_BASE_URL"),
  NEON_AUTH_COOKIE_SECRET: pick("NEON_AUTH_COOKIE_SECRET", "AUTH_SECRET"),
  NEON_PROJECT_ID: pick("NEON_PROJECT_ID"),
  NEON_BRANCH_ID: pick("NEON_BRANCH_ID"),
  AWS_ENDPOINT_URL_S3: pick("AWS_ENDPOINT_URL_S3"),
  AWS_REGION: pick("AWS_REGION"),
  AWS_ACCESS_KEY_ID: pick("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: pick("AWS_SECRET_ACCESS_KEY"),
};
