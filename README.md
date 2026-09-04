# RoleCall

RoleCall is a hiring website by **BigHappySmiley**. Companies post jobs. People apply. Paid listings are labeled so the board stays honest.

This version is the public board, the hiring workspace, and Stripe **test-mode** billing (plans, ad credits, promotions). Sign-in, posting, applying, invites, and checkout need the Neon project already created for this repo. Browse still works without one (demo jobs).

## What you can click today

- Home, Jobs (search and filters), Companies, Pricing — work even offline (demo jobs)
- Sign up / Sign in / Google / forgot password — need Neon Auth keys
- Onboarding (hiring vs looking), Dashboard, Profile — need Neon keys
- Employers: create a company, post/edit jobs, publish, pipeline (kanban), invite teammates with a copyable link
- Candidates: apply, save jobs, track application status
- Billing: Pro ($49/mo), Pro Plus ($149/mo), and $10 / $25 / $100 ad-credit packs via Stripe Checkout
- Promote a published job for 7 / 21 / 70 days by spending credits. Promoted listings sit under Featured, with a labeled rail
- Free plan limits: 2 published jobs and 2 team seats (active + pending invites). The site names the next plan if you hit a limit

Custom careers domains and platform admin screens come later. Invite someone by copying the link — there is no email send yet.

## One-time setup (Mac)

1. Install Node.js if you do not have it: https://nodejs.org (LTS).
2. Open Terminal and go to this folder:

```bash
cd ~/Projects/rolecall
npm install
cp .env.example .env.local
```

3. Put these values in `.env.local` (do not post them in chat or GitHub):

```
DATABASE_URL=
DATABASE_URL_UNPOOLED=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CRON_SECRET=
```

Generate secrets:

```bash
openssl rand -base64 32
```

Paste one result as `NEON_AUTH_COOKIE_SECRET`. Use another as `CRON_SECRET` for Vercel. The database and Auth URL come from the Neon project named **RoleCall**.

4. Create the tables and sample jobs:

```bash
npm run db:migrate
npm run seed
```

5. Start the site:

```bash
npm run dev
```

Open http://localhost:3000

## Stripe test mode (free)

Stripe test keys do not charge real cards. Create a free Stripe account, switch to **Test mode**, and copy the secret key (`sk_test_...`) into `STRIPE_SECRET_KEY`.

- Checkout builds prices in code (no Stripe Dashboard products required).
- After a successful payment, `/dashboard/billing?session_id=...` applies the plan or credits even if the webhook has not fired yet.
- For live webhook updates (cancels, renewals), add an endpoint `https://YOUR_DOMAIN/api/stripe/webhook` and put the signing secret in `STRIPE_WEBHOOK_SECRET`.
- To let customers cancel from the site, turn on the Customer Portal in Stripe test settings.
- Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

Partner / override companies (BigHappySmiley) skip self-serve checkout. Their plan is not overwritten by Stripe.

## Useful commands

```bash
npm run dev         # local site
npm run seed        # 3 companies, 12 jobs
npm run db:migrate  # apply database changes
npm run build       # production check
```

## Free-tier notes

- **Neon Free** sleeps after a few idle minutes. The first click after a nap can take a second. It does not delete the project.
- **Vercel Hobby** is free for hosting. A daily cron expires old promotions. A real paid SaaS may eventually need Vercel Pro.
- **Stripe test mode** is free. Live keys charge real money — do not add them unless you mean to.

## Google sign-in

Google is enabled on this Neon project with Neon’s shared provider. If a Google click fails, it usually means the site address is not on the Auth trusted-domain list. `http://localhost:3000` is allowed by default.

## Platform admin

Sign up with **hf@bighappysmiley.com** to receive the platform-admin flag on your profile. Access checks use that flag, not the email address.

## Stack

Next.js, Tailwind, shadcn/ui, Neon Postgres, Drizzle, Neon Managed Better Auth, Stripe Checkout (test mode). Hosting target is Vercel (not Netlify).
