# RoleCall

Hiring platform by **BigHappySmiley**. Phase 1 foundation: public job board, auth, employer/candidate shells, Neon Free backend.

## What you need (all free for Phase 1)

1. **Neon** project (already created: RoleCall in Ohio) — database, Managed Better Auth, object storage buckets
2. **Netlify** Free account — you deploy the site in the browser (Cloud agents cannot use Netlify MCP)
3. This GitHub repo

## Environment

Committed [`.env`](.env) holds the Neon Free keys so you do **not** paste them into the Netlify UI. The same values are also in [`netlify.toml`](netlify.toml) for build + runtime.

Keep [`.env.local`](.env.local) for personal overrides only (gitignored).

To redeploy after a pull: Netlify → **Deploys** → **Trigger deploy** → **Clear cache and deploy site**. No env form filling required.

## Local commands (Apple Silicon / Mac)

```bash
cd rolecall
npm install --legacy-peer-deps
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Netlify (you do this)

1. Log in at [netlify.com](https://www.netlify.com) (Free plan)
2. **Add new site → Import an existing project → GitHub**
3. Choose `bighappysmiley/RoleCall` and branch `cursor/rolecall-phase-1-8941`
4. Deploy — env vars come from `.env` / `netlify.toml` (no manual paste)
5. If a deploy was already failing: **Deploys → Trigger deploy → Clear cache and deploy site**
6. Copy your `https://….netlify.app` URL
7. In Neon → RoleCall → Auth → add that URL as a trusted domain / redirect host

If you ever see `Missing required config: cookies.secret`, clear cache and redeploy so the latest `netlify.toml` is used.

## What’s in Phase 1

- Landing, `/jobs` (search + ranking), job detail, `/companies`, `/pricing`
- Sign up (candidate / employer), log in, reset password request, sign out
- Candidate `/profile`, employer `/dashboard`
- Seeded companies and published jobs (including BigHappySmiley with enterprise overrides)

## What’s next (say “continue”)

Phase 2: company/job CRUD, apply flow, kanban pipeline, team invites.
