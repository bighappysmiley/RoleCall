# RoleCall

RoleCall is a hiring website by **BigHappySmiley**. Companies post jobs. People apply. Paid listings are labeled so the board stays honest.

Host this on **Netlify**, the same way as your other sites. Paste environment variables in the Netlify UI (or in `.env.local` on your Mac). You do not need Vercel.

There are **two Netlify websites** for this repo:

| Site | Who sees it | Git branch |
| --- | --- | --- |
| **rolecallats** (live) | Everyone | `main` |
| **rolecall-preview** (preview) | You, first | `preview` |

Updates go to **RoleCall Preview** first. The live board changes only after you publish to `main`.

There is **no demo board**. If the database is not connected, the jobs list is empty. Fake companies such as Northwind Labs only appear if they were loaded into Neon with `npm run seed`.

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

## Publish the live site (rolecallats)

You already have GitHub and Netlify. Use the existing RoleCall site (`rolecallats.netlify.app`).

### If the site already exists

1. Open [https://app.netlify.com](https://app.netlify.com) and click the RoleCall site.
2. **Project configuration → Build & deploy → Build settings → Configure**. Set:
   - **Base directory:** leave blank
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
3. **Project configuration → Environment variables**. Add every name below. For each one, include **Production**, **Preview**, and **Local development**.
4. **Deploys → Trigger deploy → Deploy site** (from branch `main`).

### If you are starting a new Netlify site

1. Open [https://app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Choose **GitHub** → **bighappysmiley/RoleCall**.
3. Production branch: **main**. Leave the Next.js defaults (build `npm run build`, publish `.next`).
4. **Add environment variables** before the first deploy, using the table below.
5. Click **Deploy**.

### Environment variables

Paste from your Mac’s `.env.local`. Do not put these values in Git or in chat.

| Name | What to paste |
| --- | --- |
| `DATABASE_URL` | Neon pooled URL (the one with `-pooler` in the host) |
| `DATABASE_URL_UNPOOLED` | Neon direct URL |
| `NEON_AUTH_BASE_URL` | Neon Auth URL (ends with `/neondb/auth`) |
| `NEON_AUTH_COOKIE_SECRET` | Same cookie secret you already use locally |
| `NEXT_PUBLIC_SITE_URL` | Live: `https://rolecallats.netlify.app`. Preview site: `https://rolecall-preview.netlify.app` |
| `NEXT_PUBLIC_ROLECALL_PREVIEW` | Preview site only: `true`. Leave this off on the live site. |
| `CRON_SECRET` | A long random string (see below) |
| `STRIPE_SECRET_KEY` | Optional. Stripe **test** key only, if you want checkout |
| `STRIPE_WEBHOOK_SECRET` | Optional. Add after you create a Stripe webhook |

Make a `CRON_SECRET` on your Mac:

```bash
openssl rand -base64 32
```

After the first deploy:

1. Copy the site address from the browser (it looks like `https://something.netlify.app`).
2. In Netlify, edit `NEXT_PUBLIC_SITE_URL` to that exact address (no trailing slash) → **Save**.
3. **Deploys → Trigger deploy → Deploy site** so the new URL is baked in.

Sign-in on `https://rolecallats.netlify.app` and `https://*.netlify.app` is already allowed in Neon Auth. If you later attach a custom domain, that domain must be added to Neon Auth trusted URLs or Google / email links will fail.

### After it is live

- Open `/jobs`. You should see **your Neon jobs**, or “No published roles yet.” You should **not** see a banner that says “Demo board.”
- Create an employer account, a company, and a job from `/dashboard`. That is how the real board fills.
- Stripe checkout stays off until you add `STRIPE_SECRET_KEY`.
- Promoted listings expire on a daily Netlify scheduled function (`expire-promotions` at 08:00 UTC). It only runs on the published production deploy.

## Local on your Mac

```bash
cd ~/Projects/rolecall
npm install
cp .env.example .env.local
```

Put the Neon values in `.env.local`. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. Then:

```bash
npm run db:migrate
npm run dev
```

Open http://localhost:3000

`npm run seed` loads sample companies into Neon. Skip it if you want an empty live board.

## Stripe test mode (free)

Stripe test keys do not charge real cards. Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

Webhook URL after Netlify is live: `https://YOUR_NETLIFY_DOMAIN/api/stripe/webhook`

## Platform admin

Sign up with **hf@bighappysmiley.com** to receive the platform-admin flag. Access checks use that flag, not the email address.

## Stack

Next.js, Tailwind, shadcn/ui, Neon Postgres, Drizzle, Neon Managed Better Auth, Stripe Checkout (test mode). Host: **Netlify**.
