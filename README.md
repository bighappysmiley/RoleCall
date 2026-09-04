# RoleCall

Hiring marketplace for teams and talent. Browse open roles, explore companies, and post jobs.

## Stack

- Next.js 15 (App Router) + Tailwind CSS
- Neon Postgres + Neon Auth + Object Storage
- Netlify hosting

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

## Deploy

Push to `main`. Netlify builds with `@netlify/plugin-nextjs`. Live site: [rolecallats.netlify.app](https://rolecallats.netlify.app).

## What’s live

- Public job board and company directory
- Sign up / log in (candidate or employer)
- Candidate profile and employer dashboard shells
- Hiring plans page (Free, Post a job, Hiring Suite)
