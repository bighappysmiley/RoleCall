# ENV

**Netlify → rolecallats → Environment variables**  
Neon copies: **https://console.neon.tech → RoleCall**  
Then **Deploys → Trigger deploy**.

If Netlify asks “Contains secret values”, use the Secret column.

| Call it this | Copy it from here | Secret? |
| --- | --- | --- |
| DATABASE_URL | Connect → **Connection pooling** ON → copy | Yes |
| DATABASE_URL_UNPOOLED | Connect → **Connection pooling** OFF → copy | Yes |
| NEON_AUTH_BASE_URL | Auth → URL | No |
| NEON_AUTH_COOKIE_SECRET | Auth → cookie secret | Yes |
| NEXT_PUBLIC_SITE_URL | Type `https://rolecallats.netlify.app` | No |
| CRON_SECRET | Make up a long random password | Yes |
| STRIPE_SECRET_KEY | Stripe → Developers → API keys → **test** secret. Skip if no checkout. | Yes |
| STRIPE_WEBHOOK_SECRET | Stripe → Developers → Webhooks → signing secret. Skip if no checkout. | Yes |

**Preview site** (Netlify → **rolecall-preview**): same list, except these two.

| Call it this | Copy it from here | Secret? |
| --- | --- | --- |
| NEXT_PUBLIC_SITE_URL | Type `https://rolecall-preview.netlify.app` | No |
| NEXT_PUBLIC_ROLECALL_PREVIEW | Type `true` | No |
