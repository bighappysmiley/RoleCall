# ENV

**Netlify → rolecallats → Environment variables → Add a variable**  
Neon: **console.neon.tech → RoleCall**  
Tick **Contains secret values** only when Secret is Yes.  
Fill **all three** scopes. Then **Deploys → Trigger deploy**.

| Call it this | Secret? | Production | Deploy Previews | Branch deploys |
| --- | --- | --- | --- | --- |
| DATABASE_URL | Yes | Connect → **Connection pooling** ON → copy | Same as Production | Same as Production |
| DATABASE_URL_UNPOOLED | Yes | Connect → **Connection pooling** OFF → copy | Same as Production | Same as Production |
| NEON_AUTH_BASE_URL | No | Auth → URL | Same as Production | Same as Production |
| NEON_AUTH_COOKIE_SECRET | Yes | Auth → cookie secret | Same as Production | Same as Production |
| NEXT_PUBLIC_SITE_URL | No | `https://rolecallats.netlify.app` | `https://rolecallats.netlify.app` | `https://rolecallats.netlify.app` |
| CRON_SECRET | Yes | Make up a long random password | Same password | Same password |
| STRIPE_SECRET_KEY | Yes | Stripe **test** secret. Or skip this row. | Same as Production | Same as Production |
| STRIPE_WEBHOOK_SECRET | Yes | Stripe webhook signing secret. Or skip this row. | Same as Production | Same as Production |

Do **not** add `NEXT_PUBLIC_ROLECALL_PREVIEW` on rolecallats.

---

**Preview site** — Netlify → **rolecall-preview** → Environment variables  
Same rows as above, except these two. Still fill all three scopes.

| Call it this | Secret? | Production | Deploy Previews | Branch deploys |
| --- | --- | --- | --- | --- |
| NEXT_PUBLIC_SITE_URL | No | `https://rolecall-preview.netlify.app` | `https://rolecall-preview.netlify.app` | `https://rolecall-preview.netlify.app` |
| NEXT_PUBLIC_ROLECALL_PREVIEW | No | `true` | `true` | `true` |
