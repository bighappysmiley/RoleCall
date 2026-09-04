# ENV

Paste these in **Netlify → rolecallats → Environment variables**.  
Copy the Neon ones from **https://console.neon.tech → RoleCall**.  
Then **Deploys → Trigger deploy**.

| Call it this | Copy it from here |
| --- | --- |
| DATABASE_URL | Neon → Connect → turn **Connection pooling** ON → copy the connection string |
| DATABASE_URL_UNPOOLED | Neon → Connect → turn **Connection pooling** OFF → copy the connection string |
| NEON_AUTH_BASE_URL | Neon → Auth → URL (ends with `/neondb/auth`) |
| NEON_AUTH_COOKIE_SECRET | Neon → Auth → cookie secret |
| NEXT_PUBLIC_SITE_URL | Type this: `https://rolecallats.netlify.app` |
| CRON_SECRET | Make up a long random password and paste it |

Skip these on the live site unless you want Stripe checkout:

| Call it this | Copy it from here |
| --- | --- |
| STRIPE_SECRET_KEY | Stripe → Developers → API keys → test secret |
| STRIPE_WEBHOOK_SECRET | Stripe → Developers → Webhooks → signing secret |

---

**Preview site only** (Netlify → **rolecall-preview** → Environment variables)

Same rows as above, except:

| Call it this | Copy it from here |
| --- | --- |
| NEXT_PUBLIC_SITE_URL | Type this: `https://rolecall-preview.netlify.app` |
| NEXT_PUBLIC_ROLECALL_PREVIEW | Type this: `true` |
