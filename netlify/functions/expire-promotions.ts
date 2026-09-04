/**
 * Netlify scheduled function. Calls the App Router cron route so expiry
 * logic stays in one place (lib/billing.ts via /api/cron/expire-promotions).
 */
export default async function expirePromotionsScheduled() {
  const site = siteUrl();
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Error(
      "CRON_SECRET is missing. Add it in Netlify → Environment variables.",
    );
  }

  const response = await fetch(`${site}/api/cron/expire-promotions`, {
    method: "GET",
    headers: { Authorization: `Bearer ${secret}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Promotion expiry failed (${response.status}): ${body.slice(0, 500)}`,
    );
  }

  return new Response(await response.text(), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function siteUrl(): string {
  const raw =
    process.env.URL ??
    process.env.DEPLOY_PRIME_URL ??
    process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) {
    throw new Error("No site URL. Set NEXT_PUBLIC_SITE_URL in Netlify.");
  }
  return raw.replace(/\/$/, "");
}
