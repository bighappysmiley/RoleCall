# RoleCall

RoleCall is a hiring website by **BigHappySmiley**. Companies post jobs. People apply. Paid listings are labeled so the board stays honest.

This app runs in the **cloud**: GitHub (code), Netlify (the websites), Neon (database and sign-in). There is **no project folder on your Mac** and no `.env.local` file to find. Keys live in **Neon** and are pasted into **Netlify → Environment variables**.

There are **two Netlify websites** for this repo:

| Site | Address | Git branch | Who sees it |
| --- | --- | --- | --- |
| **rolecallats** (live) | https://rolecallats.netlify.app | `main` | Everyone |
| **rolecall-preview** (preview) | https://rolecall-preview.netlify.app | `preview` | You, first |

Updates go to **RoleCall Preview** first. The live board changes only after you publish to `main`.

There is **no demo board**. If the database is not connected, the jobs list is empty. Fake companies such as Northwind Labs only appear if they were loaded into Neon with a seed script.

## Where the keys come from (not a Mac file)

1. Open [https://console.neon.tech](https://console.neon.tech) and click the **RoleCall** project.
2. **Dashboard → Connect** (or Connection details):
   - Copy the **pooled** connection string (the host contains `-pooler`). That is `DATABASE_URL`.
   - Copy the **direct** connection string (no `-pooler`). That is `DATABASE_URL_UNPOOLED`.
3. Open **Auth** in that same Neon project:
   - Copy the Auth URL (it ends with `/neondb/auth`). That is `NEON_AUTH_BASE_URL`.
   - Copy the cookie secret. That is `NEON_AUTH_COOKIE_SECRET`.
4. Open [https://app.netlify.com](https://app.netlify.com) → **rolecallats** → **Project configuration → Environment variables**.
5. Add each name below. For every variable, include **Production** (and **Preview** if Netlify shows that option).
6. **Deploys → Trigger deploy → Deploy site**.

Do not put these values in GitHub or in chat.

| Name | What to paste |
| --- | --- |
| `DATABASE_URL` | Neon pooled URL (host has `-pooler`) |
| `DATABASE_URL_UNPOOLED` | Neon direct URL |
| `NEON_AUTH_BASE_URL` | Neon Auth URL (ends with `/neondb/auth`) |
| `NEON_AUTH_COOKIE_SECRET` | Neon Auth cookie secret |
| `NEXT_PUBLIC_SITE_URL` | Live: `https://rolecallats.netlify.app`. Preview site: `https://rolecall-preview.netlify.app` |
| `NEXT_PUBLIC_ROLECALL_PREVIEW` | Preview site only: `true`. Leave this off on the live site. |
| `CRON_SECRET` | Any long random password you invent (20+ characters). You do not need to remember it. |
| `STRIPE_SECRET_KEY` | Optional. Stripe **test** key only, if you want checkout |
| `STRIPE_WEBHOOK_SECRET` | Optional. Add after you create a Stripe webhook |

## RoleCall Preview (click by click)

This is a second Netlify site. Same GitHub repo. It does not replace `rolecallats`.

1. Open [https://app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Choose **GitHub** → **bighappysmiley/RoleCall**.
3. **Site name:** `rolecall-preview` (the address will be `https://rolecall-preview.netlify.app`).
4. **Production branch:** `preview` — not `main`.
5. Build command `npm run build`, publish directory `.next`.
6. Copy the same environment variables from **rolecallats**, then change only:
   - `NEXT_PUBLIC_SITE_URL` = `https://rolecall-preview.netlify.app`
   - `NEXT_PUBLIC_ROLECALL_PREVIEW` = `true`
7. Deploy.

You should see a yellow **Preview site** bar at the top. That bar must never appear on the live `rolecallats` site.

Sign-in on `https://*.netlify.app` is already allowed in Neon Auth, so Google / email links work on the preview address too.

## Live site build settings (rolecallats)

1. Open [https://app.netlify.com](https://app.netlify.com) and click **rolecallats**.
2. **Project configuration → Build & deploy → Build settings → Configure**. Set:
   - **Base directory:** leave blank
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - Production branch: **main**
3. Add the environment variables from the table above.
4. **Deploys → Trigger deploy → Deploy site**.

After it is live:

- Open https://rolecallats.netlify.app/jobs. You should see **your Neon jobs**, or “No published roles yet.” You should **not** see a banner that says “Demo board.”
- Create an employer account, a company, and a job from `/dashboard`. That is how the real board fills.
- Stripe checkout stays off until you add `STRIPE_SECRET_KEY`.
- Promoted listings expire on a daily Netlify scheduled function (`expire-promotions` at 08:00 UTC). It only runs on the published production deploy.

If you later attach a custom domain, that domain must be added to Neon Auth trusted URLs or Google / email links will fail.

## Stripe test mode (free)

Stripe test keys do not charge real cards. Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

Webhook URL after Netlify is live: `https://rolecallats.netlify.app/api/stripe/webhook`

## Platform admin

Sign up with **hf@bighappysmiley.com** to receive the platform-admin flag. Access checks use that flag, not the email address.

## Stack

Next.js, Tailwind, shadcn/ui, Neon Postgres, Drizzle, Neon Managed Better Auth, Stripe Checkout (test mode). Host: **Netlify**.
