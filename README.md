# QRly

A dynamic QR code and short-link platform that runs entirely on free tiers.

A QR code is printed once and encodes a permanent short URL; the destination behind
that URL stays editable forever. Every scan is recorded with the country, city, ISP,
carrier, device, and the local hour where the person was standing — from a plain 302,
with no JavaScript on the scanner's device and no consent prompt.

**The point is the demonstration.** Servers, database, auth, CDN, SSL, custom domains
and analytics, at $0/month, against incumbents charging hundreds a month for the same
thing. The `/cost` page makes that argument with each vendor's published prices and the
date they were read.

Built for 1,000–2,000 users and deliberately not designed beyond that.

---

## What is here

One repository. Two deployable Workers, the database migrations, and the tooling
that tests all of it.

| Path | What |
|---|---|
| `backend/` | Cloudflare Worker — redirect engine, privileged API, scheduled jobs (Hono) |
| `frontend/` | Next.js dashboard (App Router, deployed via the OpenNext Cloudflare adapter) |
| `supabase/migrations/` | SQL migrations, applied in order, checksummed |
| `tools/` | Migrations, seeding, and the end-to-end test suites |
| `context.md` | Scope, product decisions, analytics inventory, free-tier budget |
| `architecture.md` | Component design, flows, schema, RLS, caching, failure modes |
| `plan.md` | Phased build plan with acceptance criteria and what each phase actually proved |

Read `architecture.md` before changing anything in `backend/`. Two decisions in
particular are load-bearing and look arbitrary otherwise:

- **Reads go browser → Supabase directly.** RLS already enforces ownership, so a proxy
  layer would be code with no security value.
- **Link writes must go through the Worker.** Not for security — because the Worker
  owns KV cache invalidation. A dashboard writing links straight to Postgres would leave
  the cache serving stale destinations.

---

## Running it locally

### 1. Prerequisites

- Node 22 or later
- A Supabase project (free tier)
- A Cloudflare account — only needed to deploy; everything runs locally without one

### 2. Secrets

Four files hold secrets and all four are gitignored:

| File | Holds |
|---|---|
| `.env` | Supabase keys, project URL, and the Postgres connection string used by `tools/` |
| `supabase.md` | Postgres connection details |
| `backend/.dev.vars` | Worker secrets for local development |
| `frontend/.env.local` | The two public values the browser needs |

Start from the examples:

```bash
cp backend/.dev.vars.example    backend/.dev.vars
cp frontend/.env.local.example  frontend/.env.local
```

`.env` needs at least:

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_KEY=<service_role key>
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

Two things that will cost you an hour if you skip them:

- **Use the session pooler string, not `db.<ref>.supabase.co`.** The direct host is
  IPv6-only on current Supabase projects and simply will not resolve from most machines.
  Copy it from Supabase → Project Settings → Database → Connection string → Session pooler.
- **Percent-encode the password.** A literal `@` has to be `%40` inside the URI or you
  get a misleading DNS error rather than an auth error.

`SUPABASE_SERVICE_KEY` bypasses row-level security completely. It belongs in Worker
secrets and nowhere else — never in a `NEXT_PUBLIC_*` variable, never in the browser.
`tools/test-security.mjs` greps the built bundle to prove it is not there.

### 3. Database

```bash
npm install
npm run migrate
```

Migrations are forward-only and checksummed: editing one that has already been applied
is refused, because that is the failure that silently desynchronises environments. Write
a new migration instead.

Verify the tenant boundary before trusting it:

```bash
npm run test:rls        # 34 adversarial checks with two real accounts
```

### 4. Run both apps

```bash
cd backend  && npm install && npm run dev     # http://localhost:8787
cd frontend && npm install && npm run dev     # http://localhost:3000
```

The seeded platform hostname is `localhost:8787`, so a link created locally resolves at
`http://localhost:8787/<slug>`.

To fire a scheduled job by hand:

```bash
cd backend && npx wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=0+0+*+*+*"
```

### 5. Sample data

```bash
node tools/seed-scans.mjs you@example.com 5000
```

Synthetic, and labelled as such in the file. Never point it at anything but a
development project.

---

## Testing

| Command | Covers |
|---|---|
| `cd backend && npm test` | 141 unit and integration tests, including every failure mode in `architecture.md` §12 |
| `npm run test:rls` | RLS, adversarially, with two real signed-in accounts |
| `node tools/test-api.mjs` | The privileged API end to end |
| `node tools/test-redirect.mjs` | Redirect engine, cache behaviour, measured latency |
| `node tools/test-analytics.mjs` | Real scans in, stored rows out |
| `node tools/test-analytics-rpc.mjs` | Dashboard aggregates, tenant isolation, injection resistance |
| `node tools/test-security.mjs` | Rate limits, retention purge, secrets audit |
| `node tools/test-domains.mjs` | Custom domain registration and verification, against live DNS |
| `node tools/check-ceilings.mjs` | Free-tier headroom, measured against the real database |
| `node --experimental-strip-types tools/render-qr-fixtures.mjs && node tools/test-qr.mjs .qr-fixtures` | 49 QR style/size combinations through a real decoder |

The `tools/` suites need the Worker running (`cd backend && npm run dev`) and talk to the
real Supabase project. They create their own accounts and delete them afterwards.

---

## Deploying

Two Workers, both out of this one repository:

| Worker | Directory | Config | Serves |
|---|---|---|---|
| `qrly` | `backend/` | `wrangler.toml` | the redirect engine, the API, the cron jobs |
| `qrly-dashboard` | `frontend/` | `wrangler.jsonc` | the Next.js dashboard |

The dashboard is **not** on Cloudflare Pages. It is a Worker, built by the OpenNext
Cloudflare adapter, because `next-on-pages` is effectively in maintenance — the reasoning
is in `context.md`. Nothing here uses Pages.

### 1. Before the first deploy

Four things have to exist, and three of them are one-time.

```bash
cd backend
npx wrangler kv namespace create LINKS_KV   # paste the id into [[env.production.kv_namespaces]]
```

Then fill in the two `REPLACE_ME` values in `[env.production.vars]` in
`backend/wrangler.toml`: `PLATFORM_HOSTNAME` (the hostname this Worker serves —
`qrly.<account>.workers.dev` at first) and `DASHBOARD_ORIGIN` (where the dashboard is
served from, which is also the CORS allow-list for the API).

Then set the Worker's secrets. These live on the Worker, not in the repository and not in
the build — Workers Builds never sees them, and setting them once is enough:

```bash
npx wrangler secret put SUPABASE_URL           --env production
npx wrangler secret put SUPABASE_SERVICE_KEY   --env production
npx wrangler secret put SUPABASE_ANON_KEY      --env production
npx wrangler secret put SUPABASE_JWKS_URL      --env production
npx wrangler secret put VISITOR_HASH_PEPPER    --env production   # 32+ random characters
npx wrangler secret put SAFE_BROWSING_API_KEY  --env production   # optional; unset means "unchecked"
```

And finally: **add a row to `domains` matching `PLATFORM_HOSTNAME`.** The redirect path
resolves the request hostname against that table before it will serve anything, so a
deploy without this row 404s every scan. It is a **new migration** — migrations are
checksummed and forward-only, so `0004_seed.sql` cannot be edited to add it.

### 2. Continuous deployment (Workers Builds)

Cloudflare deploys a monorepo by pointing two Worker projects at the same repository with
a different **root directory** on each. Connect `HK-0811/QRly` twice, from
**Workers & Pages → Create → Import a repository**, and set:

**`qrly` — the backend**

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | *(leave empty — Wrangler bundles the Worker itself)* |
| Deploy command | `npx wrangler deploy --env production` |
| Non-production branch deploy command | `npx wrangler versions upload --env production` |
| Build watch paths — include | `backend/*` |

**`qrly-dashboard` — the frontend**

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Non-production branch deploy command | `npx opennextjs-cloudflare upload` |
| Build watch paths — include | `frontend/*` |

The build watch paths are what stop a change to the dashboard from redeploying the
redirect engine, and the reverse. Without them every push rebuilds both.

**The dashboard needs build variables, not secrets.** `NEXT_PUBLIC_*` values are compiled
into the JavaScript at build time, so they must be set as **build variables** on the
`qrly-dashboard` project. A build without them produces a dashboard that talks to
`undefined`. Set all four, with the same meanings as `frontend/.env.local.example`:

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`,
`NEXT_PUBLIC_REDIRECT_ORIGIN` — the last two pointing at the deployed `qrly` Worker, not
at `localhost:8787`.

The anon key belongs in the browser bundle; that is what it is for, and RLS is what makes
it safe. `tools/test-security.mjs` asserts it is present in the build and that the
`service_role` key and the visitor-hash pepper are not.

### 3. Deploying by hand

The git integration is the normal path, but neither Worker depends on it:

```bash
cd backend  && npx wrangler deploy --env production
cd frontend && npm run cf:deploy
```

`--env production` is not optional. `backend/wrangler.toml` keeps development values at
the top level so `wrangler dev` and the test pool work with no arguments, and the real
values in `[env.production]`. A bare `wrangler deploy` would publish
`PLATFORM_HOSTNAME = "localhost:8787"`, which matches no row in `domains`, and every
redirect would 404. Wrangler warns when the flag is missing — do not deploy past that
warning.

### 4. After deploying

The daily cron is what keeps a free Supabase project from pausing after 7 days of
inactivity — which would take the demo down exactly when somebody finally looks at it.
Confirm it is landing:

```sql
select job, ok, ran_at from cron_runs order by ran_at desc limit 10;
```

An empty table means the keep-alive is not running.

---

## Things worth knowing before you change something

- **A printed QR code binds to its hostname and slug forever.** Both are immutable at the
  database level, by trigger, not by UI convention. Old hostnames must stay alive
  permanently.
- **Edits propagate in up to 60 seconds.** That is Workers KV's global propagation delay,
  not the cache TTL — freshness comes from the write-through on edit. The dashboard says
  so next to the edit form; do not remove that.
- **The cache TTL is an hour, and that is a quota decision.** A cache fill is a KV write
  and the free tier allows 1,000 a day. At 60 seconds, one continuously-scanned link
  exhausts the whole budget. See the comment on `LINK_TTL_SECONDS`.
- **Slug collisions are handled by retrying on the unique constraint.** A read-then-write
  pre-check races.
- **`is_first_scan` is resolved by a database trigger, not the Worker.** Deciding it in
  the Worker is two round trips and two edges can both believe they were first.
- **Rate limiting is per-isolate.** See the comment at the top of `backend/src/lib/rate-limit.ts`
  for exactly what that does and does not buy. It is a free-tier constraint, not an oversight.
- **Never log an IP, a user agent, a token or a salt.** `backend/src/lib/log.ts` redacts
  those field names, but the real rule is not to pass them.

---

## Refreshing the cost page

`frontend/src/data/competitor-pricing.json` records what each vendor published and the
date it was read. To refresh it, open each `source` URL in that file, read the current
figures off the page, and update the entries — recording anything the page does not
state as `null` rather than estimating it. Then update `fetched_at`.

The page prints that date and links every source, so the claim is checkable rather than
asserted. A cost-comparison page quoting prices from memory would be the one part of
this project that overclaims.

---

## Status

Every phase in `plan.md` is built. One claim in it is still unverified.

Phases 0–6, 9 and 10 are complete and tested. Phases 7 and 8 — custom domains and
certificate issuance — are written, and everything about them that can be exercised
without a registered domain has been: hostname validation, apex detection, live
DNS-over-HTTPS lookups against two resolvers, the status state machine, tenant isolation
and the deletion guard.

**What is not proven:** a real CNAME at a real registrar going live over HTTPS with a
Cloudflare-issued certificate. That needs a domain on a Cloudflare zone. The Cloudflare
API client in `backend/src/lib/cloudflare.ts` has never round-tripped against the real
API, and the file and the UI both say so.

Three things are gated on credentials rather than on work: deploying (a Cloudflare
account), Safe Browsing verdicts (a free Google Cloud key — until then links are reported
`unchecked`, never falsely `clean`), and Cloudflare's own rate-limiting rule (a zone).

See `plan.md` for what each phase actually proved, including the defects the tests found.
