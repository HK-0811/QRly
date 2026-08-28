# Handoff: qrify — Planning & Architecture Complete, Implementation Not Started

## Session Metadata
- Created: 2026-08-29 01:46:55
- Project: X:\Projects\qrify
- Branch: not a git repo yet — `git init` has NOT been run
- Session duration: ~1 hour (single planning session)

### Recent Commits (for context)
  - None. Not a git repository.

## Handoff Chain

- **Continues from**: None (fresh start)
- **Supersedes**: None

> This is the first handoff for this task.

## Current State Summary

This session was **planning only — the user explicitly and repeatedly instructed that no
implementation begin**. The work produced three planning documents (`context.md`,
`architecture.md`, `plan.md`) and two empty folders (`backend/`, `frontend/`). Zero code
exists. The project is a dynamic QR code / short-link platform (a Bitly/Uniqode
alternative) built entirely on free tiers, whose purpose is to **demonstrate that
incumbents overcharge** — it is a showcase, not a business. The user's original brief was
substantially descoped across three rounds of clarification: microsites dropped,
client-side/screen-dimension capture dropped, teams dropped, and all scaling
infrastructure dropped in favour of a deliberate 1,000–2,000 user ceiling. The next
session should begin at **Phase 0 in `plan.md`**, starting with `.gitignore`.

## Codebase Understanding

### Architecture Overview

Full detail is in `architecture.md`. The load-bearing points:

- **Three-tier split:** Next.js dashboard (Cloudflare Pages/Workers) · Hono API +
  redirect engine (Cloudflare Workers) · Supabase Postgres + Auth.
- **Reads bypass the Worker entirely.** The dashboard queries Supabase directly with the
  user's JWT because RLS already enforces ownership. A proxy layer would be code with no
  security value.
- **Link writes MUST go through the Worker.** This is not a security decision — it's
  because the Worker owns KV cache invalidation. If the dashboard wrote links straight to
  Supabase, the cache would serve stale destinations forever.
- **Redirect hot path:** hostname+slug → KV read-through cache → validate → `302` →
  `ctx.waitUntil()` analytics insert *after* the response. Telemetry never blocks a scan.
- **Cache invalidation is write-through, not delete** — pushing the new value avoids a
  cache-miss stampede against Postgres during propagation.
- **Best property of the design:** if Supabase dies with a warm cache, redirects keep
  working. No printed QR breaks. Supabase free tier is the least reliable component, so
  this matters more than usual.

### Critical Files

| File | Purpose | Relevance |
|------|---------|-----------|
| `context.md` | Scope, product decisions, analytics inventory, free-tier budget | **Read first.** Records *why* things were cut. |
| `architecture.md` | Component design, flows, full SQL schema, RLS, caching, failure modes | Read before writing any code. |
| `plan.md` | 11 phases with tasks, sizes, acceptance criteria, gates | The execution document. Start at Phase 0. |
| `.env` | `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` | **Contains live secrets. Not gitignored.** |
| `supabase.md` | Postgres host/user/password | **Contains live secrets. Not gitignored.** |
| `backend/` | Cloudflare Worker | Empty |
| `frontend/` | Next.js dashboard | Empty |

### Key Patterns Discovered

No codebase exists yet, so no code conventions have been established. Documentation
conventions that were set and should be maintained:

- The three docs cross-reference rather than duplicate. `context.md` owns *why*,
  `architecture.md` owns *how*, `plan.md` owns *when*. Keep that separation on updates.
- Honest limitations are written into the docs as first-class content, not footnotes
  (geo approximation, iOS device-model absence, KV propagation delay). The user
  values this — the project's whole premise is being straight about what things cost
  and what they can do.
- Planned repo layout is specified in `architecture.md` §13. Follow it.

## Work Completed

### Tasks Finished

- [x] Read and analysed the user's full product brief
- [x] Inspected `supabase.md`; identified two connection gotchas (see Gotchas)
- [x] Verified both Supabase keys by decoding JWT payloads — roles `anon` and
      `service_role`, both matching project ref `qragyngjqlizazdkaowa`
- [x] Researched and **confirmed** Cloudflare for SaaS free tier: 100 custom hostnames
      free, $0.10/mo beyond, no wildcards, no custom CA on free
- [x] Researched and **confirmed** Supabase free tier: 500 MB, 50k MAU, 2 projects,
      **7-day inactivity auto-pause**
- [x] Ran three rounds of scope clarification with the user
- [x] Created `backend/` and `frontend/`
- [x] Wrote `context.md` (14 sections)
- [x] Wrote `architecture.md` (15 sections)
- [x] Wrote `plan.md` (11 phases)

### Files Modified

| File | Changes | Rationale |
|------|---------|-----------|
| `context.md` | Created | Scope and decision record |
| `architecture.md` | Created | Technical design |
| `plan.md` | Created | Phased execution plan |
| `backend/` | Created (empty) | User requested |
| `frontend/` | Created (empty) | User requested |

No existing files were modified. `.env` and `supabase.md` were read only.

### Decisions Made

| Decision | Options Considered | Rationale |
|----------|-------------------|-----------|
| Drop microsites/landing pages entirely | Build them / JS pixel on client pages / drop | User: "It's just a QR app, nothing else." `event_type` column retained so it could return free. |
| Drop screen dimensions + no interstitial | Interstitial page that measures then forwards / pure 302 | A 302 never runs JS. An interstitial adds 200–400ms to every scan and breaks some scanner apps. User: "not that crucial." |
| KV read-through cache | Direct Supabase per scan / KV / Cache API | Supabase is single-region; a cross-region hop adds 200ms+ to a redirect. Cost: ~60s eventual consistency. |
| Write-through invalidation, not delete | KV delete / KV put new value | Delete causes a cache-miss stampede; write-through serves the old value harmlessly during propagation. |
| Reads direct to Supabase, writes via Worker | All through Worker / all direct / split | RLS makes a read proxy pointless; writes need the Worker for cache sync. |
| `ctx.waitUntil()` instead of Cloudflare Queues | Queues / Analytics Engine / waitUntil | Queues need Workers Paid. At 2k users, waitUntil is sufficient and free. |
| No partitioning, no rollup tables | Build now / defer | Unnecessary below ~1M events. Deliberate, recorded in `context.md` §3. |
| Solo accounts, no teams/orgs | Teams / solo | User's framing is individuals signing up. Recorded as an assumption — see Assumptions. |
| Separate hostnames for dashboard vs redirects | Same host / `app.<domain>` split | Same-host makes every dashboard route a permanently reserved slug. |
| Never store raw IP | Store / truncate / hash | Truncated `sha256(daily_salt + ip + ua + link_id)`, salt rotates daily. Means "unique per day", which is the honest definition. |
| Cloudflare for SaaS for custom domains | CNAME only / Vercel domains / CF for SaaS | **A CNAME alone yields a TLS cert error.** Something must issue a cert. CF for SaaS is free to 100 hostnames. |

## Pending Work

### Immediate Next Steps

1. **Write `.gitignore` covering `.env`, `supabase.md`, `node_modules`, `.wrangler`,
   `.next` — before `git init` and before any commit.** `.env` holds a `service_role`
   key that bypasses RLS entirely. This has been flagged to the user three times and is
   still outstanding.
2. **Get two answers from the user** (both gate Phase 0):
   - Do they have a Cloudflare account?
   - Next.js deploy target: OpenNext Cloudflare adapter (recommended — `next-on-pages`
     is effectively in maintenance) or `next-on-pages`?
3. **Execute Phase 0** from `plan.md`: scaffold `backend/` (TypeScript + Hono +
   Wrangler) and `frontend/` (Next.js App Router + TypeScript + Tailwind), then deploy
   the Worker to `*.workers.dev`.

### Blockers/Open Questions

- [ ] **Domain not purchased.** Hard-blocks Phases 7 and 8 only. Everything else runs on
      `*.workers.dev`. Not on the critical path yet.
- [ ] **Cloudflare account not confirmed.** Gates Phase 0 deployment.
- [ ] **Supabase JWT signing method unknown** — ES256/JWKS (newer projects) or HS256
      shared secret (older)? Determines the Worker's auth middleware. Resolve in Phase 1.
- [ ] **Postgres connection method unverified** — direct `db.<ref>` is IPv4-deprecated on
      newer projects; the pooler string may be needed for migrations. Resolve in Phase 1.
- [ ] **Map library undecided.** Must be key-free and offline-capable or the $0 claim
      breaks. Needed by Phase 6.
- [ ] **Google Safe Browsing API key** not obtained. Needed by Phase 9. Free, but
      requires a Google Cloud project.

### Deferred Items

- Custom domain work (Phases 7–8) — deferred until a domain is purchased.
- Scaling infrastructure (Queues, Durable Objects, partitioning, rollup tables) —
  deferred indefinitely by decision, not oversight. See `context.md` §8.
- Teams/organisations — out of scope.
- Public cost-comparison page — Phase 10. Competitor pricing must be **fetched at build
  time, not quoted from memory**.

## Context for Resuming Agent

### Important Context

**The user said "do not start implementing" in three consecutive messages.** They are
deliberately front-loading design. Do not begin coding unless they explicitly say so in a
new message. They said "then I will give you steps" — they want to direct the sequencing
themselves.

**This is a showcase project, not a product.** The goal is to prove that a full dynamic
QR platform runs at $0/month and that incumbents charge thousands for it. This reframes
every trade-off: simplicity and provable-free beat scalability and robustness. Do not
propose scaling work — it has been explicitly rejected. The user said: "I understand that
scaling is an issue but I just want to do it for showcase purposes."

**Analytics is the differentiator and the user's stated priority is geolocation.** Their
words: "It's just the IP and the geo location that matter. Anything apart from that, if
you can, is a plus." The richest available fields beyond geo are the *network* ones —
`asOrganization` gives the literal ISP/carrier name, and ASN classification separates
mobile/broadband/corporate/datacenter. Paid tiers rarely expose this. It's the strongest
"why are you paying for Bitly" argument available and worth building well.

**Honesty about limitations is part of the deliverable, not polish.** The docs commit to
surfacing geo approximation, iOS device-model absence, and the ~60s KV propagation window
*in the UI*. Specifically: if someone edits a destination, immediately scans, and gets the
old page with no explanation, the demo reads as broken rather than as a documented
trade-off. That UI copy is a Phase 3 requirement.

**A printed QR binds to its domain permanently.** `qr_codes.locked_domain_id` exists for
this. Once a code is printed, its encoded hostname can never change or every printed copy
breaks. Old hostnames must stay alive forever. The UI must state this at generation time.

### Assumptions Made

- **Solo accounts, no teams/orgs.** Inferred from the user's framing ("people come, they
  will just sign up"), stated back to them, and not contradicted — but never explicitly
  confirmed. Retrofitting teams would change every RLS policy and foreign key. Worth
  reconfirming before Phase 1 writes the schema.
- Cloudflare account exists or will be created — not confirmed.
- The domain, once purchased, will be added to Cloudflare as a zone. Custom hostnames
  require this.
- Free tiers will remain at researched limits. Verified 2026-08-29; re-check if
  significant time has passed.
- `event_type` on `scan_events` was retained purely for future optionality. It has one
  value (`'redirect'`) today. Do not build logic around it.

### Potential Gotchas

- **The Postgres password contains a literal `@`.** It MUST be percent-encoded (`@` →
  `%40`) inside any connection URI or it fails with a misleading DNS error. This will
  waste an hour if forgotten.
- **Direct `db.<ref>.supabase.co:5432` is IPv4-deprecated** on newer Supabase projects.
  The pooler connection string may be required. Unverified.
- **Supabase free projects pause after 7 days of inactivity.** A showcase nobody touches
  for a week goes down exactly when someone finally looks at it. A daily Cloudflare Cron
  ping is a Phase 1 task — do not skip it.
- **Workers KV is eventually consistent up to ~60 seconds.** Edits are not instant.
- **A CNAME alone does not make custom domains work.** It produces a TLS certificate
  error. Cloudflare for SaaS must register the hostname so a cert is issued. The user
  originally believed no backend work was needed here; this was corrected and is
  documented in `context.md` §10. Do not let this regress.
- **Slug collisions must be handled by the unique constraint, not a pre-check.** A
  read-then-write races. Retry on conflict.
- **RLS that looks correct but isn't is the most dangerous silent failure here.** Test it
  adversarially with two real accounts, not by inspection.
- **A heredoc via the Bash tool failed on a long markdown document** in this session
  (unmatched-quote parse error). Use the Write tool for long documents on this machine.
- The user is on **Windows with PowerShell as primary shell**; a Bash tool is also
  available. Path style matters.

## Environment State

### Tools/Services Used

- **Supabase** — project ref `qragyngjqlizazdkaowa`, URL
  `https://qragyngjqlizazdkaowa.supabase.co`. Free tier. Both API keys verified valid.
- **Cloudflare** — Workers, KV, Pages, Cron Triggers, Cloudflare for SaaS. Account not
  yet confirmed to exist.
- **Google Safe Browsing** — planned for Phase 9, key not obtained.
- No package manager state; no dependencies installed anywhere.

### Active Processes

- None. No servers, no dev processes, no background tasks running.

### Environment Variables

Names only. Values live in `.env` and `supabase.md` and must never be reproduced in any
document.

Present in `.env`:
- `SUPABASE_ANON_KEY` — safe for the browser, RLS-backed
- `SUPABASE_SERVICE_KEY` — **bypasses RLS. Worker secret only. Never `NEXT_PUBLIC_*`.**

Present in `supabase.md`: Postgres host, port, database, user, password.

Planned but not yet obtained (all Worker secrets, never client-exposed):
- `SUPABASE_URL`, `SUPABASE_JWT_SECRET` (or JWKS URL)
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`
- `SAFE_BROWSING_API_KEY`
- `VISITOR_HASH_PEPPER`

## Related Resources

- `context.md` — scope, decisions, analytics inventory, free-tier budget
- `architecture.md` — component design, SQL schema, RLS, caching, failure modes
- `plan.md` — 11-phase execution plan with acceptance criteria
- [Cloudflare for SaaS plans](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/) — 100 free custom hostnames confirmed
- [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing) — 7-day auto-pause confirmed
- [Supabase pricing](https://supabase.com/pricing) — free tier limits

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.
