# qrify

A dynamic QR code and short-link platform that runs entirely on free tiers.

The point is a demonstration: servers, database, auth, CDN, SSL, custom domains and
deep scan analytics, at **$0/month**, against incumbents charging thousands a year for
the same thing.

- `context.md` — scope, product decisions, analytics inventory, free-tier budget
- `architecture.md` — component design, flows, SQL schema, RLS, caching, failure modes
- `plan.md` — phased execution plan with acceptance criteria

## Layout

| Path | What |
|---|---|
| `backend/` | Cloudflare Worker — redirect engine + privileged API (Hono) |
| `frontend/` | Next.js dashboard (App Router, deployed via OpenNext Cloudflare adapter) |
| `supabase/migrations/` | SQL migrations |
| `tools/` | Local operational scripts (migrations, RLS verification) |

## Local development

```
cp backend/.dev.vars.example backend/.dev.vars        # fill in
cp frontend/.env.local.example frontend/.env.local    # fill in

cd backend  && npm install && npm run dev             # http://localhost:8787
cd frontend && npm install && npm run dev             # http://localhost:3000
```

Secrets live in `.env`, `supabase.md`, `backend/.dev.vars` and `frontend/.env.local`.
All four are gitignored. `SUPABASE_SERVICE_KEY` bypasses RLS and must never appear in a
`NEXT_PUBLIC_*` variable or reach the browser.
