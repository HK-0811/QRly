<div align="center">

<img src="frontend/src/app/icon.svg" width="56" height="56" alt="">

# QRly

**Dynamic QR codes and short links, with real scan analytics, running on $0/month.**

Print a code once. Change where it goes forever. See where it was scanned — country, city, carrier, device, local hour — from a plain redirect, with no JavaScript on the scanner's phone and no cookie banner.

[**qrly.lol**](https://qrly.lol) · [What it costs](https://qrly.lol/cost) · [Privacy](https://qrly.lol/privacy) · [Architecture](architecture.md)

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3FCF8E?logo=supabase&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![Cost](https://img.shields.io/badge/running%20cost-%240%2Fmonth-DD2B09)

</div>

---

## Why this exists

A dynamic QR code is a database lookup and a `302`. The analytics behind it are fields the edge network already computed and hands over for free with every request.

The companies selling this charge between $30 and several hundred dollars a month for it. What that price is really buying is the belief that it's hard.

QRly is the counter-argument, built rather than written: a complete platform — servers, database, auth, CDN, TLS, custom domains, analytics — running entirely on free tiers, with the source open so the claim can be checked. The [`/cost`](https://qrly.lol/cost) page puts it next to each incumbent's published pricing, with the date each price was read.

It is sized for a thousand or two users and deliberately not designed beyond that. Every ceiling is a free-tier ceiling, and [`tools/check-ceilings.mjs`](tools/check-ceilings.mjs) measures the headroom against the real database.

## What it does

**Codes that don't break.** A printed QR code encodes a permanent short URL. The hostname and slug are immutable at the database level — by trigger, not by convention — because they're already on someone's poster. Only the destination changes, and edits reach every edge in under a minute.

**Analytics without surveillance.** Every scan records what Cloudflare already knows about the request: country, region, city, timezone, ASN and carrier, network type, device, OS, browser, and the local hour where the person was standing. Nothing runs on their phone. Visitors are counted by a salted hash that rotates daily, so *unique* is honest and *tracked* is impossible. There is no cookie, no pixel, no consent prompt, and no third-party script on any page.

**No signup gate.** Type a URL on the landing page and get a working code and link. Sign up afterwards to keep it — or don't. Anonymous links carry a claim token that turns into ownership on registration.

**A real QR studio.** Module and finder shapes, colour, error-correction level, quiet zone, an embedded logo with its size capped to what the chosen error-correction level can actually survive, and a scannability read-out that tells you when you've gone too far. Exports to SVG or PNG at 512, 1024 or 2048px.

**Your own domain.** Add `qr.yourbrand.com`, point one CNAME at us, and Cloudflare for SaaS issues the certificate. Verification checks DNS across two resolvers and says exactly what it found, because "verification failed" with nothing behind it is why people give up on custom domains.

**Safe by default.** Destinations are screened against Google Safe Browsing and re-checked weekly. Private and local addresses are refused, including the decimal-IP and IPv6 spellings people use to slip past a naive check.

## How it works

One hostname, two Workers, one database.

```
scan  qrly.lol/aB3xK9p ─┐
                         │   ┌─────────────────────────────┐
                         ├──▶│  qrly-backend  (Worker)      │──▶ KV cache ──▶ 302
                         │   │  redirect engine · /api · cron│──▶ Supabase (scan row)
dashboard  qrly.lol/links┘   └──────────────┬──────────────┘
                                            │ service binding — no network hop
                                            ▼
                             ┌─────────────────────────────┐
                             │  qrly-dashboard  (Worker)    │
                             │  Next.js via OpenNext        │──▶ Supabase (reads, under RLS)
                             └─────────────────────────────┘
```

The backend Worker owns the hostname. Every request enters there: short codes take the hot path through KV, and an enumerated set of paths — the dashboard's pages, its build output, the favicon — are forwarded in-process to the dashboard Worker over a service binding. Slugs are arbitrary and unbounded, so the catch-all has to belong to the redirect engine and everything else must be listed. [`tools/check-dashboard-paths.mjs`](tools/check-dashboard-paths.mjs) reads the real route files and fails the moment that list, the frontend, and the reserved-slug list drift apart.

Two decisions look arbitrary until you know why, and both are load-bearing:

- **Reads go browser → Supabase directly.** Row-level security already enforces ownership. A read proxy would be code with no security value.
- **Link writes go through the Worker, always.** Not for security — because the Worker owns KV cache invalidation. A dashboard writing straight to Postgres would leave the cache serving stale destinations.

[`architecture.md`](architecture.md) has the rest: schema, RLS policies, caching and quota maths, the failure modes and what each one does. Read it before changing anything in `backend/`.

## Quick start

You need Node 22+ and a free Supabase project. A Cloudflare account is only needed to deploy.

```bash
git clone https://github.com/HK-0811/QRly.git && cd QRly
npm install

cp backend/.dev.vars.example   backend/.dev.vars
cp frontend/.env.local.example frontend/.env.local
# then create .env — see "Secrets" below

npm run migrate            # forward-only, checksummed
npm run test:rls           # prove the tenant boundary before trusting it

cd backend  && npm install && npm run dev    # http://localhost:8787
cd frontend && npm install && npm run dev    # http://localhost:3000
```

The seeded platform hostname is `localhost:8787`, so a link you create locally resolves at `http://localhost:8787/<slug>`.

<details>
<summary><strong>Secrets</strong> — four gitignored files, and two things that will cost you an hour</summary>

| File | Holds |
|---|---|
| `.env` | Supabase keys, project URL, and the Postgres connection string used by `tools/` |
| `backend/.dev.vars` | Worker secrets for local development |
| `frontend/.env.local` | The public values the browser needs |
| `supabase.md` | Postgres connection details, for you |

`.env` needs at least:

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_KEY=<service_role key>
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

- **Use the session pooler string, not `db.<ref>.supabase.co`.** The direct host is IPv6-only on current projects and won't resolve from most machines. Supabase → Project Settings → Database → Connection string → *Session pooler*.
- **Percent-encode the password.** A literal `@` must be `%40`, or you get a DNS error instead of an auth error.

`SUPABASE_SERVICE_KEY` bypasses row-level security entirely. It belongs in Worker secrets and nowhere else — never in a `NEXT_PUBLIC_*` variable. [`tools/test-security.mjs`](tools/test-security.mjs) greps the built bundle to prove it isn't there.

Migrations are forward-only and checksummed: editing one that has already been applied is refused, because that is the failure that silently desynchronises environments. Write a new one.

</details>

<details>
<summary><strong>Scheduled jobs and sample data</strong></summary>

Two crons: daily (Supabase keep-alive and retention purge) and weekly (Safe Browsing re-check). Fire one by hand:

```bash
cd backend && npx wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=0+0+*+*+*"
```

Synthetic scans for a development account — never point this at anything else:

```bash
node tools/seed-scans.mjs you@example.com 5000
```

</details>

## Repository layout

| Path | What |
|---|---|
| [`backend/`](backend/) | Cloudflare Worker — redirect engine, privileged API, scheduled jobs. Hono. |
| [`frontend/`](frontend/) | Next.js 15 dashboard, App Router, deployed as a Worker via the OpenNext adapter |
| [`supabase/migrations/`](supabase/migrations/) | Eleven SQL migrations, applied in order |
| [`tools/`](tools/) | Migrations, seeding, the end-to-end suites, and the consistency checks |
| [`architecture.md`](architecture.md) | Component design, flows, schema, RLS, caching, failure modes |
| [`context.md`](context.md) | Scope, product decisions, analytics inventory, free-tier budget |
| [`plan.md`](plan.md) | The phased build plan and what each phase actually proved |

## Testing

```bash
cd backend && npm test      # 176 tests in the Workers runtime, including every failure mode in architecture.md §12
npm run test:rls            # row-level security, adversarially, with two real signed-in accounts
npm run check:paths         # the dashboard, the forwarding list and the reserved slugs agree
```

The end-to-end suites in `tools/` run against the real Worker and the real Supabase project. They create their own accounts and delete them afterwards.

| Suite | Covers |
|---|---|
| `test-api.mjs` | The privileged API end to end |
| `test-redirect.mjs` | Redirect engine, cache behaviour, measured latency |
| `test-analytics.mjs` · `test-analytics-rpc.mjs` | Real scans in, stored rows out; aggregates, tenant isolation, injection resistance |
| `test-security.mjs` | Rate limits, retention purge, secrets audit of the built bundle |
| `test-domains.mjs` | Custom domain registration and verification, against live DNS |
| `check-ceilings.mjs` | Free-tier headroom, measured against the real database |
| `render-qr-fixtures.mjs` + `test-qr.mjs` | 49 QR style and size combinations through a real decoder |

## Deploying

Two Workers, both from this repository, both via Cloudflare Workers Builds. The dashboard is **not** on Cloudflare Pages — it's a Worker built by the OpenNext adapter, because `next-on-pages` is effectively in maintenance. The reasoning is in `context.md`.

<details>
<summary><strong>The full procedure</strong></summary>

### Once, before the first deploy

```bash
cd backend
npx wrangler kv namespace create LINKS_KV      # paste the id into [[env.production.kv_namespaces]]
```

Set `PLATFORM_HOSTNAME` and `DASHBOARD_ORIGIN` in `[env.production.vars]`, then the secrets. These live on the Worker — Workers Builds never sees them, and once is enough:

```bash
npx wrangler secret put SUPABASE_URL           --env production
npx wrangler secret put SUPABASE_SERVICE_KEY   --env production
npx wrangler secret put SUPABASE_ANON_KEY      --env production
npx wrangler secret put SUPABASE_JWKS_URL      --env production
npx wrangler secret put VISITOR_HASH_PEPPER    --env production   # 32+ random characters
npx wrangler secret put SAFE_BROWSING_API_KEY  --env production   # optional: unset means "unchecked", never "clean"
npx wrangler secret put CLOUDFLARE_API_TOKEN   --env production   # custom domains: a token scoped to Zone → SSL and Certificates → Edit
npx wrangler secret put CLOUDFLARE_ZONE_ID     --env production
```

Then **add a row to `domains` matching `PLATFORM_HOSTNAME`** — as a new migration, since existing ones are checksummed. The redirect path resolves the request hostname against that table before it serves anything; without the row, every scan 404s.

Custom domains additionally need Cloudflare for SaaS enabled on the zone with a fallback origin pointing at the Worker.

### Workers Builds

Connect the repository twice, with a different root directory each time:

| | `qrly-backend` | `qrly-dashboard` |
|---|---|---|
| Root directory | `backend` | `frontend` |
| Build command | *(empty — Wrangler bundles it)* | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy --env production` | `npx opennextjs-cloudflare deploy` |
| Build watch paths | `backend/*` | `frontend/*` |

The watch paths are what stop a dashboard change from redeploying the redirect engine, and the reverse.

**The build token must be a *user* API token.** Workers Builds rejects account-owned tokens — the error reads "deleted or rolled" regardless — and every token created from the account's API Tokens page is account-owned. Create it from *My Profile → API Tokens* instead, or use *Create new token* inside the Worker's build settings. This cost a day.

**The dashboard's `NEXT_PUBLIC_*` values are compiled in at build time**, so they go in the project's *build* variables, not runtime. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required. `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_REDIRECT_ORIGIN` default to production when unset — [`frontend/src/lib/origins.ts`](frontend/src/lib/origins.ts) explains why they no longer default to localhost. `NEXT_PUBLIC_CLOUDFLARE_CONFIGURED=true` unlocks the custom-domain UI and needs a rebuild to take effect.

The anon key belongs in the browser bundle; RLS is what makes it safe. `tools/test-security.mjs` asserts it is present and that the `service_role` key and the visitor-hash pepper are not.

### By hand

```bash
cd backend  && npx wrangler deploy --env production
cd frontend && npm run cf:deploy
```

`--env production` is not optional. `backend/wrangler.toml` keeps development values at the top level so `wrangler dev` and the test pool work with no flags. A bare `wrangler deploy` publishes `PLATFORM_HOSTNAME = "localhost:8787"` and every redirect 404s. Wrangler warns; don't deploy past the warning.

### Afterwards

The daily cron is what keeps a free Supabase project from pausing after seven idle days — which would take the demo down exactly when someone finally looks at it. Confirm it's landing:

```sql
select job, ok, ran_at from cron_runs order by ran_at desc limit 10;
```

</details>

## Before you change something

- **A printed QR code binds to its hostname and slug forever.** Both are immutable by database trigger. Old hostnames must stay alive permanently.
- **Edits propagate in up to 60 seconds.** That is KV's global propagation delay, not the cache TTL — freshness comes from the write-through on edit. The dashboard says so next to the edit form; don't remove that.
- **The cache TTL is an hour, and that's a quota decision.** A cache fill is a KV write and the free tier allows 1,000 a day. At 60 seconds, one busy link exhausts the budget. See `LINK_TTL_SECONDS`.
- **Slug collisions are handled by retrying on the unique constraint.** A read-then-write pre-check races.
- **`is_first_scan` is decided by a database trigger, not the Worker.** Two edges can both believe they were first.
- **Rate limiting is per-isolate.** The comment at the top of `backend/src/lib/rate-limit.ts` says exactly what that does and doesn't buy. It's a free-tier constraint, not an oversight.
- **Never log an IP, a user agent, a token or a salt.** `backend/src/lib/log.ts` redacts those field names, but the real rule is not to pass them.
- **Nothing in `globals.css` goes outside a cascade layer.** Tailwind v4 layers its utilities; an unlayered element rule outranks every one of them, and the damage shows up as unrelated components in the wrong colour. The comment above `@layer base` has the two real examples.

## Refreshing the cost page

[`frontend/src/data/competitor-pricing.json`](frontend/src/data/competitor-pricing.json) records what each vendor published and the date it was read. Open each `source` URL, read the current figures, update the entries — recording anything a page doesn't state as `null` rather than estimating — and bump `fetched_at`. The page prints that date and links every source, so the claim stays checkable. A cost page quoting prices from memory would be the one part of this project that overclaims.

## Status

Every phase in [`plan.md`](plan.md) is built and running at [qrly.lol](https://qrly.lol).

Custom-domain registration runs against the live Cloudflare for SaaS API and reports registration and certificate state separately, so "never registered" cannot masquerade as "still issuing." Whether a customer CNAME has come up over HTTPS with an issued certificate is not something this file will claim — confirm one before you do.

Safe Browsing verdicts need a free Google Cloud key; until it's set, links are reported `unchecked` and never falsely `clean`.

## Contributing

Issues and pull requests are welcome. Before opening one: run the three commands under **Testing**, and if you've added a dashboard page, run `npm run check:paths` — it exists because forgetting the forwarding list turns your new page into a 404 and forgetting the reserved list lets someone print a QR code that resolves to it.

The design language is settled and documented in [`frontend/src/app/globals.css`](frontend/src/app/globals.css): hairline rules instead of cards, zero radius, one accent, light only. Changes that fit it are easy to merge.

## Credits

Developed by [Himanshu Kotkar](https://github.com/HK-0811).

Runs on [Cloudflare Workers](https://workers.cloudflare.com/), [Supabase](https://supabase.com/) and [Next.js](https://nextjs.org/), and on their free tiers specifically — which is the point.
