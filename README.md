# RoleCall

RoleCall is a hiring website by **BigHappySmiley**. Companies post jobs. People apply. Paid listings are labeled so the board stays honest.

This version is the public board plus the hiring workspace: company profile, jobs, applicant pipeline, and team invites. Sign-in, saving a profile, posting, applying, and invites need a free Neon database, which is already created for this project. Browse still works without one (demo jobs).

## What you can click today

- Home, Jobs (search and filters), Companies, Pricing — work even offline (demo jobs)
- Sign up / Sign in / Google / forgot password — need Neon Auth keys
- Onboarding (hiring vs looking), Dashboard, Profile — need Neon keys
- Employers: create a company, post/edit jobs, publish, pipeline (kanban), invite teammates with a copyable link
- Candidates: apply, save jobs, track application status
- Free plan limits: 2 published jobs and 2 team seats (active + pending invites). The site names the next plan if you hit a limit.

Billing, custom careers domains, platform admin screens, and email delivery come later. Invite someone by copying the link — there is no email send yet.

## One-time setup (Mac)

1. Install Node.js if you do not have it: https://nodejs.org (LTS).
2. Open Terminal and go to this folder:

```bash
cd ~/Projects/rolecall
npm install
cp .env.example .env.local
```

3. Put these four values in `.env.local` (do not post them in chat or GitHub):

```
DATABASE_URL=
DATABASE_URL_UNPOOLED=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Generate a cookie secret:

```bash
openssl rand -base64 32
```

Paste the result as `NEON_AUTH_COOKIE_SECRET`. The database and Auth URL come from the Neon project named **RoleCall**.

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

## Useful commands

```bash
npm run dev         # local site
npm run seed        # 3 companies, 12 jobs
npm run db:migrate  # apply database changes
npm run build       # production check
```

## Free-tier notes

- **Neon Free** sleeps after a few idle minutes. The first click after a nap can take a second. It does not delete the project.
- **Vercel Hobby** is free for hosting later. A real paid SaaS may eventually need Vercel Pro.
- **Stripe** is not wired yet. No charges.

## Google sign-in

Google is enabled on this Neon project with Neon’s shared provider. If a Google click fails, it usually means the site address is not on the Auth trusted-domain list. `http://localhost:3000` is allowed by default.

## Platform admin

Sign up with **hf@bighappysmiley.com** to receive the platform-admin flag on your profile. Access checks use that flag, not the email address.

## Stack

Next.js, Tailwind, shadcn/ui, Neon Postgres, Drizzle, Neon Managed Better Auth. Hosting target is Vercel (not Netlify).
