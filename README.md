# RoleCall

Hiring platform by **BigHappySmiley**. Phase 1 foundation: public job board, auth, employer/candidate shells, Neon Free backend.

## What you need (all free for Phase 1)

1. **Neon** project (already created: RoleCall in Ohio) — database, Managed Better Auth, object storage buckets
2. **Netlify** Free account — you deploy the site in the browser (Cloud agents cannot use Netlify MCP)
3. This GitHub repo

## Environment variables

Copy `.env.example` to `.env.local` (already filled on the agent machine). For **Netlify → Site configuration → Environment variables**, set:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled Postgres URL |
| `NEON_AUTH_BASE_URL` | Managed Better Auth URL |
| `NEON_AUTH_COOKIE_SECRET` | Long random secret (32+ chars) |
| `AWS_ENDPOINT_URL_S3` | Neon object storage endpoint |
| `AWS_REGION` | `us-east-2` |
| `AWS_ACCESS_KEY_ID` | Neon storage credential |
| `AWS_SECRET_ACCESS_KEY` | Neon storage credential |

Never commit `.env.local`.

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
3. Choose `bighappysmiley/rolecall` and the branch from the Phase 1 PR
4. Build command: `npm run build` (Next.js plugin should auto-detect)
5. Paste the environment variables above
6. Deploy, then copy your `https://….netlify.app` URL
7. In Neon → RoleCall → Auth → add that URL as a trusted domain / redirect host

## What’s in Phase 1

- Landing, `/jobs` (search + ranking), job detail, `/companies`, `/pricing`
- Sign up (candidate / employer), log in, reset password request, sign out
- Candidate `/profile`, employer `/dashboard`
- Seeded companies and published jobs (including BigHappySmiley with enterprise overrides)

## What’s next (say “continue”)

Phase 2: company/job CRUD, apply flow, kanban pipeline, team invites.
