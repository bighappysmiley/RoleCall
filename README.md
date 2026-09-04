# RoleCall

RoleCall is a hiring website by **BigHappySmiley**. Companies post jobs. People apply. Paid listings are labeled so the board stays honest.

Host this on **Vercel** (Hobby is free). Do not use Netlify for this app.

There is **no demo board**. If the database is not connected, the jobs list is empty. Fake companies such as Northwind Labs only appear if they were loaded into Neon with `npm run seed`.

## Publish on Vercel (click by click)

You need a free GitHub account (you already have the repo) and a free Vercel Hobby account.

1. Open https://vercel.com/signup
2. Choose **Continue with GitHub**. Allow Vercel to see the `bighappysmiley/RoleCall` repo.
3. After you land in the Vercel dashboard, click **Add New… → Project**.
4. Find **RoleCall** and click **Import**.
5. Leave Framework Preset as **Next.js**. Do not change the root directory.
6. **Before** you click Deploy, open **Environment Variables** on that same screen and paste the keys from your Mac’s `.env.local` (Vercel → Settings → Environment Variables if you already deployed once):

   | Name | What to paste |
   | --- | --- |
   | `DATABASE_URL` | Neon pooled URL (the one with `-pooler` in the host) |
   | `DATABASE_URL_UNPOOLED` | Neon direct URL |
   | `NEON_AUTH_BASE_URL` | Neon Auth URL (ends with `/neondb/auth`) |
   | `NEON_AUTH_COOKIE_SECRET` | Same cookie secret you already use locally |
   | `NEXT_PUBLIC_SITE_URL` | Your Vercel URL, like `https://rolecall.vercel.app` (you can fix this after the first deploy) |
   | `CRON_SECRET` | A long random string (see below) |
   | `STRIPE_SECRET_KEY` | Optional. Stripe **test** key only, if you want checkout |
   | `STRIPE_WEBHOOK_SECRET` | Optional. Add after you create a Stripe webhook |

   For every variable, tick **Production**, **Preview**, and **Development**.

   Make a `CRON_SECRET` on your Mac:

   ```bash
   openssl rand -base64 32
   ```

7. Click **Deploy**. Wait until it says Ready. Click the Visit link.
8. Copy the site address from the browser (it looks like `https://something.vercel.app`).
9. Back in Vercel: **Settings → Environment Variables →** edit `NEXT_PUBLIC_SITE_URL` to that exact address (no trailing slash) → **Save**.
10. **Deployments →** the latest production deploy → **Redeploy** (so the new URL is baked in).
11. If the public board asks you to log into Vercel, open **Settings → Deployment Protection** and turn protection **off** for Production so anyone can view jobs.

Sign-in on `*.vercel.app` is already allowed in Neon Auth. If you later attach a custom domain, that domain must be added to Neon Auth trusted URLs or Google / email links will fail.

### After it is live

- Open `/jobs`. You should see **your Neon jobs**, or “No published roles yet.” You should **not** see a banner that says “Demo board.”
- Create an employer account, a company, and a job from `/dashboard`. That is how the real board fills.
- Stripe checkout stays off until you add `STRIPE_SECRET_KEY`.
- You can ignore or delete the old Netlify site. This app is not built for Netlify.

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

Webhook URL after Vercel is live: `https://YOUR_VERCEL_DOMAIN/api/stripe/webhook`

## Platform admin

Sign up with **hf@bighappysmiley.com** to receive the platform-admin flag. Access checks use that flag, not the email address.

## Stack

Next.js, Tailwind, shadcn/ui, Neon Postgres, Drizzle, Neon Managed Better Auth, Stripe Checkout (test mode). Host: **Vercel Hobby**.
