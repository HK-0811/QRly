# Handoff: qrify — Built and Tested. One Unverified Claim.

## Session Metadata
- Created: 2026-08-29 12:07:32
- Project: X:\Projects\qrify
- Branch: master (working tree clean)
- Session duration: ~10 hours, single implementation session

### Recent Commits (for context)
  - 16094a3 Phases 7-8: custom domains and certificate issuance
  - 3afb4ad Phase 10: production hardening
  - 1163e52 Phase 9: security, privacy, abuse
  - b8d0667 Phase 6: analytics dashboard
  - 7998158 Phase 5: analytics collection
  - 4c294c4 Phase 4: QR generation
  - e7043d3 Phase 3: redirect engine
  - 308e5c5 Phase 2: auth, link CRUD, and the dashboard
  - 247dc58 Phase 1: schema, RLS, triggers, scheduled jobs
  - 6951511 Phase 0: scaffold backend Worker and Next.js dashboard

## Handoff Chain

- **Continues from**: [2026-08-29-014655-qrify-planning-and-architecture.md](./2026-08-29-014655-qrify-planning-and-architecture.md)
  - Previous title: qrify — Planning & Architecture Complete, Implementation Not Started
- **Supersedes**: None. The previous handoff is still the record of *why* the scope is
  what it is; this one records what was built. Read that one only if you need the
  rationale behind a product decision.

## Current State Summary

**Every phase in `plan.md` is built. One claim in it is still unverified.** The previous
session produced only planning documents; this session implemented all eleven phases,
testing each before moving on. Phases 0–6, 9 and 10 are complete and verified. Phases 7
and 8 — custom domains and certificate issuance — are written, and everything about them
that can be exercised without a registered domain has been; what remains unproven is a
real CNAME at a real registrar serving over HTTPS with a Cloudflare-issued certificate.
`backend/src/lib/cloudflare.ts` has never round-tripped against the real API. The working
tree is clean, all ten commits are on `master`, and no secrets are tracked. Nothing is
half-finished: the next session starts from a green state, not from a repair job.

## Codebase Understanding

### Architecture Overview

`architecture.md` is accurate and was brought back in step with reality at the end of this
session. The load-bearing points, restated because they look arbitrary otherwise:

- **Reads go browser → Supabase directly; link writes go through the Worker.** Not a
  security split — RLS already enforces ownership. Writes are routed through the Worker
  because it owns KV cache invalidation.
- **`ctx.waitUntil()` after the 302.** Telemetry never blocks a scan. Proven by measuring
  the redirect against a live Supabase round trip in the same test run: p50 3 ms versus
  ~150 ms.
- **A redirect must survive the failure of everything except Cloudflare.** This is the
  design's best property and is now verified rather than asserted, in
  `backend/test/failure-modes.test.ts`.

**Two figures in the original design were wrong and are now corrected in code and docs.**
The KV link TTL was 60 s; a cache fill is a KV *write* and the free tier allows 1,000 a
day, so one continuously-scanned link exhausted the entire platform's write budget. It is
now 60 minutes. The 60-second figure had conflated cache freshness (which comes from the
write-through on edit) with KV's global propagation delay (which no TTL affects). The
negative TTL was specified at 30 s, which KV refuses outright — its floor is 60.

### Critical Files

| File | Purpose | Relevance |
|------|---------|-----------|
| `plan.md` | What each phase proved, and the defects each test caught | **Read first.** Rewritten this session; it is now a record, not a plan. |
| `architecture.md` | Design, schema, RLS, caching, failure modes | Accurate as of this session. Read §6 and §12 before touching the cache. |
| `context.md` | Scope and product decisions, and *why* things were cut | Unchanged in substance; status table updated. |
| `README.md` | Setup, self-host, deploy, and the traps | Written this session. Has the two Supabase connection gotchas. |
| `backend/src/lib/kv.ts` | Cache, TTLs, negative-cache admission | The TTL comments are load-bearing. Do not "tidy" them. |
| `backend/src/lib/rate-limit.ts` | Per-isolate limiter | The comment at the top states exactly what it does and does not buy. |
| `backend/src/routes/redirect.ts` | The hot path | Registered last; a catch-all `/:slug`. Anything after it is unreachable. |
| `backend/src/lib/cloudflare.ts` | Cloudflare for SaaS client | **Never executed against the real API.** Says so at the top. |
| `frontend/src/lib/qr.ts` | QR renderer | `DOT_RADIUS` and the structural-module logic are measured, not chosen. |
| `frontend/src/data/competitor-pricing.json` | Competitor prices with sources and a fetch date | Refresh procedure is in `README.md`. |
| `tools/check-ceilings.mjs` | Free-tier headroom, measured against the live DB | Found the KV write-budget defect. Run it after any cache change. |

### Key Patterns Discovered

- **Every test suite is a script that prints named assertions**, not a framework
  invocation. `tools/*.mjs` create their own accounts against the real Supabase project
  and delete them in a `finally`. Follow that shape.
- **Assertion names read as claims about behaviour**, e.g. `"a flagged link does NOT 404 —
  the printed code must keep resolving"`. That is deliberate: the test name is the
  specification.
- **Comments explain the decision, not the mechanism.** Where a value was measured rather
  than chosen, the comment says so and names the test that measured it.
- **Honest limitations are rendered next to the data they qualify**, never in a settings
  page. The analytics cards, the QR studio and the privacy page all follow this.
- **`waitUntil` inserts land out of order.** Any test asserting on multiple analytics rows
  must match by content, not by position. This was learned the hard way.

## Work Completed

### Tasks Finished

- [x] Phase 0 — scaffold: Worker (Hono + Wrangler 4), Next.js 15 dashboard, OpenNext adapter, `.gitignore` before the first commit
- [x] Phase 1 — 7 migrations, RLS enabled **and forced** on every table, immutability triggers, cron audit trail
- [x] Phase 2 — ES256/JWKS auth middleware, link CRUD, URL safety, dashboard
- [x] Phase 3 — redirect engine, branded pages for every failure, hostname allow-list
- [x] Phase 4 — client-side QR studio, 49 style/size combinations verified through a real decoder
- [x] Phase 5 — analytics collection, privacy-safe visitor hash, GPC honoured
- [x] Phase 6 — analytics dashboard, seven aggregates, self-hosted choropleth
- [x] Phase 7 — custom domain verification against live DNS-over-HTTPS
- [x] Phase 8 — Cloudflare for SaaS client (written, unexercised)
- [x] Phase 9 — Safe Browsing, rate limiting, retention purge, privacy page, secrets audit
- [x] Phase 10 — structured logging, failure-mode verification, ceiling check, cost page, README
- [x] Resolved all four open design questions in `architecture.md` §15
- [x] Brought `context.md` and `architecture.md` back in step with what was built

### Files Modified

The working tree is clean; everything is committed. 131 files tracked. Rather than list
them all, the shape:

| Area | Contents |
|------|----------|
| `backend/src/` | 1 entry, 4 routes, 13 lib modules, 2 type files |
| `backend/test/` | 9 suites, 141 tests |
| `frontend/src/` | 11 routes, 5 chart components, QR studio, analytics screen, domains screen |
| `supabase/migrations/` | 7 migrations, all applied to the live project |
| `tools/` | 13 scripts: migrations, seeding, 7 end-to-end suites, ceiling check, QR fixtures |
| Docs | `README.md` written; `plan.md`, `architecture.md`, `context.md` updated |

### Decisions Made

| Decision | Options Considered | Rationale |
|----------|-------------------|-----------|
| KV link TTL 60 min, not 60 s | 60 s as specified / longer / Cache API layer | A cache fill is a KV write against a 1,000/day ceiling. At 60 s one hot link spends the whole budget. Freshness comes from the write-through, not the TTL. |
| Negative-cache only on the **second** sighting | Cache every miss / never / second sighting | A bot walking random slugs would otherwise cost one write per probe. Almost none are requested twice; a mistyped code still gets cached because people retry. |
| Hostname allow-list before any negative-cache write | Trust the Host header / check against `domains` | Not in the design. Without it a spoofed-`Host` flood writes one sentinel per host and exhausts the write quota in seconds. |
| `is_first_scan` in a BEFORE INSERT trigger | Read-then-insert in the Worker / trigger | A read-then-insert is two round trips and races: two edges both read "not seen" and both claim first. |
| Own QR renderer, not `qr-code-styling` | Library / hand-rolled from `qrcode-generator` | The decisions that matter are the ones affecting whether it scans. Those should be visible and testable, not buried in a dependency. |
| Structural QR modules always solid | Style everything / style data modules only | Measured: dot modules decoded at 256 px and failed at 512 px+ because alignment and timing patterns were drawn as loose dots. |
| Self-hosted Natural Earth topology, no map library | Mapbox / Google / tiles / TopoJSON + d3-geo | 105 KB, public domain, no key, nothing metered. A hosted map puts a third-party bill on the critical path of the one claim this project makes. |
| Series colours from the validated reference palette | Brand green / reference palette | Ran through the palette validator against this app's own surfaces before any chart was written. Six checks, both modes. |
| Per-isolate rate limiting | Durable Objects / KV counters / in-isolate | DO requires Workers Paid. KV counters cannot increment atomically and would burn the write quota. The limitation is documented, not hidden. |
| Safe Browsing reports `unchecked` with no key | Assume clean / assume flagged / unchecked | Reporting "clean" without having asked looks like a verdict and is not one. |
| Free tiers included in the cost comparison | Paid plans only / all plans | The first version excluded $0 tiers, which made two competitors look pricier than they are. On that page specifically, overstating discredits everything else. |

## Pending Work

### Immediate Next Steps

1. **Buy a domain and add it to Cloudflare as a zone.** This is the only thing standing
   between the current state and a fully verified build. Everything else is done.
2. **Create a Cloudflare account and deploy.** `README.md` § Deploying has the exact
   commands. Order matters: create the KV namespace and put its id in `wrangler.toml`,
   set the secrets, deploy, then set `PLATFORM_HOSTNAME` and **insert a matching row in
   `domains`** — the redirect path resolves the request hostname against that table
   before it will serve anything, so a deploy without that row 404s everything.
3. **Verify phase 7 and 8 acceptance for real**: add a subdomain in the dashboard, add the
   CNAME at the registrar, click Verify, and confirm
   `https://qr.<domain>/<slug>` resolves with a valid certificate. This is the one claim
   in `plan.md` still marked unverified.
4. Confirm the daily cron is landing: `select job, ok, ran_at from cron_runs order by
   ran_at desc limit 10;`. An empty table means the Supabase keep-alive is not running,
   and the project will pause after 7 days.

### Blockers/Open Questions

- [ ] **Domain not purchased.** Blocks phase 7/8 acceptance and nothing else.
- [ ] **No Cloudflare account.** Blocks deployment. Everything runs and is tested locally.
- [ ] **No Google Safe Browsing API key.** Free, needs a Google Cloud project. Until then
      links are reported `unchecked`, never falsely `clean`. The distinction is tested.
- [ ] **Cloudflare's own rate-limiting rule** (free plan includes one) needs a zone. Until
      then the in-isolate limiter is what exists.
- [ ] **Fallback origin** for Cloudflare for SaaS is a one-time zone setting. Nothing to
      write until a zone exists; noted as the one unticked box in phase 8.

### Deferred Items

- Teams, roles, SSO — out of scope by decision, not oversight (`context.md` §8).
- Queues, Durable Objects, partitioning, rollup tables — rejected for scale reasons.
- Microsites and client-side capture — dropped in the planning session.

## Context for Resuming Agent

### Important Context

**The project is finished to the extent it can be without a domain. Do not restart or
re-plan.** Read `plan.md` first — it now records what each phase actually proved,
including the defects each test caught. Treat it as a report, not a to-do list.

**This is a showcase, not a business.** The goal is to prove the platform runs at $0 and
that incumbents overcharge. That reframes every trade-off: simplicity and provable-free
beat scalability. Scaling work has been explicitly rejected. Do not propose it.

**Honesty is the deliverable, not polish.** The `/cost` page, the `/privacy` page and
every accuracy caveat beside a chart are load-bearing product, not decoration. During this
session the cost page was caught overstating — it excluded competitors' free tiers, which
made two of them look more expensive than they are — and was corrected before shipping. On
that page specifically, one overstatement discredits everything else. Apply the same
standard to anything added.

**Where a value is described as measured, it was measured.** `DOT_RADIUS = 0.5`,
`LINK_TTL_SECONDS = 3600`, the logo caps per ECC level. Each has a comment naming why and
a test that fails if it changes. They are not style preferences.

**Test counts, so drift is visible:** 141 backend unit/integration tests, plus 248
end-to-end checks across seven `tools/` suites, plus 49 QR decode checks. All passing at
the time of writing.

### Assumptions Made

- **Solo accounts, no teams.** Carried forward from the planning session; the schema and
  every RLS policy assume it. Retrofitting teams would change every policy and foreign key.
- **`localhost:8787` is the platform hostname in development**, seeded in migration 0004
  along with `127.0.0.1:8787`. A production hostname is a **new migration**, not an edit
  to that one — the runner refuses an edited migration by checksum.
- Free-tier limits are as researched on 2026-08-29. `tools/check-ceilings.mjs` measures
  headroom against the live database; the ceilings themselves are constants in that file.
- Competitor pricing was read on 2026-08-29 with sources recorded. It will drift.

### Potential Gotchas

- **The Postgres password contains a literal `@`** and must be percent-encoded as `%40`
  in the connection URI, or it fails with a misleading DNS error.
- **`db.<ref>.supabase.co` is IPv6-only** and will not resolve from most machines. Use the
  session pooler string (`aws-0-ap-northeast-1.pooler.supabase.com:5432`, user
  `postgres.<ref>`). The pooler also rejects prepared statements — the client sets
  `prepare: false`.
- **Do not run `npm run build` in `frontend/` while `next dev` is running.** It clobbers
  `.next` and the dev server then serves pages with no stylesheet at all. Symptom: the
  page renders as giant unstyled shapes. Fix: kill dev, `rm -rf .next`, restart.
- **`pkill` from the Bash tool does not kill Windows processes.** Use PowerShell
  `Stop-Process`, matching on `CommandLine`. Stale `wrangler`/`workerd` processes hold
  file locks and make `npm install` fail with `EBUSY`.
- **Migrations are checksummed and forward-only.** Editing an applied migration is
  refused. Write a new one. `tools/reset-db.mjs --yes` drops everything if you need a
  from-scratch rebuild; it drops our objects only, not the `public` schema, because
  dropping the schema destroys Supabase's grants and default privileges.
- **The redirect catch-all is registered last** in `backend/src/index.ts`. Anything routed
  after it is unreachable.
- **`waitUntil` analytics inserts land out of order.** Match rows by content in tests.
- **A long heredoc via the Bash tool is unreliable on this machine.** Use the Write tool
  for long files, and a Python script in the scratchpad for surgical multi-file edits.
- **`toLocaleString()` picks up the host locale.** This machine renders 250,000 as
  "2,50,000". Every call site is pinned to `en-US`; keep it that way.
- **RLS that looks correct but isn't remains the most dangerous silent failure.** Run
  `npm run test:rls` after any schema or policy change. It uses two real accounts.

## Environment State

### Tools/Services Used

- **Supabase** — project ref `qragyngjqlizazdkaowa`, free tier, 7 migrations applied,
  region `ap-northeast-1`. JWTs are **ES256 via JWKS**, not HS256.
- **Cloudflare** — Workers, KV, Cron. **No account yet**; everything runs under
  `wrangler dev` with Miniflare KV.
- **Node 22.16**, npm 10.9. Wrangler 4, Vitest 4, Next 15.5, Tailwind v4.
- **Demo account** `demo@qrify.test` exists with 7 links and ~6,000 seeded synthetic scan
  events. Password is not recorded here; recreate with the Supabase admin API if needed,
  or re-seed with `node tools/seed-scans.mjs`.

### Active Processes

None. All `wrangler dev`, `next dev` and `workerd` processes were stopped at the end of
the session. Nothing is listening on :8787 or :3000.

### Environment Variables

Names only. Values live in the gitignored files listed below and must never be reproduced
in any document.

`.env` (used by `tools/`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`,
`SUPABASE_PROJECT_REF`, `DATABASE_URL`

`backend/.dev.vars`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`,
`SUPABASE_JWKS_URL`, `VISITOR_HASH_PEPPER`, `SAFE_BROWSING_API_KEY` (empty),
`CLOUDFLARE_API_TOKEN` (empty), `CLOUDFLARE_ZONE_ID` (empty)

`frontend/.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_REDIRECT_ORIGIN`

`supabase.md`: Postgres host, port, database, user, password.

All four are gitignored and `tools/test-security.mjs` asserts that the `service_role` key
and the visitor-hash pepper appear in no shipped build artefact — while asserting the anon
key *does*, which catches the opposite mistake.

## Related Resources

- `plan.md` — what each phase proved, and the defects the tests found
- `architecture.md` — design, schema, RLS, caching (§6 rewritten), failure modes (§12 verified)
- `context.md` — scope and the reasoning behind every cut
- `README.md` — setup, self-host, deploy, and the traps worth knowing
- `tools/check-ceilings.mjs` — run after any cache change
- [Cloudflare for SaaS plans](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/) — 100 free custom hostnames
- [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing) — the 7-day auto-pause the daily cron exists to prevent

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.
