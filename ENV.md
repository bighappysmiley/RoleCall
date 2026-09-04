# ENV

**Same thing in all three boxes.** Production, Deploy Previews, and Branch deploys all get the identical paste.

**Netlify → rolecallats → Environment variables**  
Neon: **console.neon.tech → RoleCall**  
Then **Deploys → Trigger deploy**.

| Call it this | Secret? | Paste this |
| --- | --- | --- |
| DATABASE_URL | Yes | Neon → Connect → **Connection pooling** ON → copy that string |
| DATABASE_URL_UNPOOLED | Yes | Neon → Connect → **Connection pooling** OFF → copy that string |
| NEON_AUTH_BASE_URL | No | Neon → Auth → URL |
| NEON_AUTH_COOKIE_SECRET | Yes | Neon → Auth → cookie secret |
| NEXT_PUBLIC_SITE_URL | No | `https://rolecallats.netlify.app` |
| CRON_SECRET | Yes | One long random password |
| STRIPE_SECRET_KEY | Yes | Stripe test secret. Or skip this row. |
| STRIPE_WEBHOOK_SECRET | Yes | Stripe webhook signing secret. Or skip this row. |

Do **not** add `NEXT_PUBLIC_ROLECALL_PREVIEW` on rolecallats.

---

**Preview site** (Netlify → **rolecall-preview**): still the same paste in all three boxes. Same list as above, except:

| Call it this | Secret? | Paste this |
| --- | --- | --- |
| NEXT_PUBLIC_SITE_URL | No | `https://rolecall-preview.netlify.app` |
| NEXT_PUBLIC_ROLECALL_PREVIEW | No | `true` |
