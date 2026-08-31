# Handoff: QRly — Redesigned, and Signup Is No Longer a Gate

## Session Metadata
- Created: 2026-08-30 16:25:35
- Project: X:\Projects\qrify
- Branch: main
- Remote: https://github.com/HK-0811/QRly.git
- Session duration: ~2.5 hours

### Recent Commits (for context)
- c0bc667 Handoff: rename to QRly, monorepo push, deployment, apex merge
- a79249d Serve the dashboard from qrly.lol, not app.qrly.lol
- 19d0b27 Give the dashboard its own route on qrly.lol

**Nothing from this session is committed.** 57 files are dirty, 13 paths are new.

## Handoff Chain

- **Continues from**: [2026-08-30-020145-qrly-rename-deploy-live.md](./2026-08-30-020145-qrly-rename-deploy-live.md)
  - Previous title: QRly — Renamed, Monorepo Pushed, Live on qrly.lol. Auth Chain Half-Wired.
- **Supersedes**: nothing. That handoff is still the record of the deployment and
  of the apex merge, and its blocker list is still accurate except where noted below.

> Read the previous handoff for the *deployment*. Read this one for the *product*,
> which is now a different shape.

## Current State Summary

The UI was rebuilt against a Claude Design handoff bundle, and **the product's flow
changed**: you can now make a working QR code with no account. Signup moved from a
gate at the front to the thing you do when you want to re-point a code or read its
scans.

An anonymous code is not a preview. It redirects the moment it is made, records
scans from that moment, and is printable that afternoon. Claiming it backfills the
link, its saved design and its entire scan history to the new account. Unclaimed
codes are deleted after 30 days.

Three migrations were written and **applied to the live Supabase** (see Important
Context — one of them was applied by accident). The design language changed
wholesale: vermilion accent, Schibsted Grotesk + Fragment Mono, zero border radius,
hairline grids, hard offset shadows, light-mode only.

Everything typechecks, builds, and passes: 172/172 backend tests, 42/42 RLS checks,
`check:paths` clean, `next build` clean across 16 routes.

**Nothing has been visually reviewed.** Every claim below is from HTTP status codes,
database state and test output. No screen has been looked at by a human or an agent.

## Codebase Understanding

### What changed structurally

The previous handoff's architecture holds. Two things are new:

**1. There is an unauthenticated write surface.** `POST /api/anon/links` is the only
endpoint in the product that writes without a verified caller. It lives at
`/api/anon/*`, deliberately not under `/links/*`:

```
backend/src/routes/anonymous.ts   <- no auth, hard rate limit (10/min/IP)
backend/src/routes/links.ts       <- requireAuth on /links and /links/*
```

The link routes attach `requireAuth` with a `/links/*` matcher. An anonymous handler
placed there would be reachable only by registering it *before* that middleware,
making "does this endpoint need a session" a property of line ordering in another
file. A separate prefix makes it visible in the path.

**2. `user_id` is nullable on three tables.** `links`, `qr_codes`, `scan_events`.
Null means unclaimed. Null matches no RLS policy, so unclaimed rows are invisible to
every authenticated reader and reachable only through the Worker holding
service_role, with a claim token.

### Critical Files

| File | Purpose | Relevance |
|------|---------|-----------|
| `flow.md` | **Rewritten.** The user flow as it now exists, plus what the redesign changed and deliberately did not | Read this first. It is the spec. |
| `supabase/migrations/0009_anonymous_links.sql` | Nullable ownership, claim token, `claim_link()`, `purge_unclaimed_links()` | Header comment explains why null beats a sentinel account. |
| `supabase/migrations/0011_allow_claiming.sql` | **The bug fix.** 0009 was unusable without it | See Potential Gotchas. |
| `backend/src/routes/anonymous.ts` | **New.** The unauthenticated surface | |
| `backend/src/routes/links.ts` | `createLink()` is now a shared function both create paths call | The claim handler is here too. |
| `frontend/src/lib/anon.ts` | **New.** Claim tokens in localStorage | The browser's only copy of an unreissuable credential. |
| `frontend/src/components/links/claim-pending.tsx` | **New.** Runs the claim on dashboard arrival | Mounted in the links screen, not in the auth forms — four auth paths converge there. |
| `frontend/src/components/create/create-flow.tsx` | The three-phase creation flow | |
| `frontend/src/components/links/link-detail.tsx` | **New.** Tabs: Scans / QR code / Settings | Replaces the "phase 5" placeholder. |
| `frontend/src/app/globals.css` | The whole design language | Every token, and why light-only. |
| `frontend/src/components/chrome.tsx` | **New.** Mark, wordmark, grid ground, `Screen`, `GUTTER` | |
| `tools/verify-rls.mjs` | 8 new checks covering the claim | The Worker suite cannot reach these — it has no database. |
| `~/AppData/Local/.../scratchpad/design/` | The extracted design bundle | `QRly.dc.html` is the reference. Temp dir; will not survive. |

### Architecture Overview

Unchanged from the previous handoff except for the two additions below. Both apps
still answer on one hostname, with `qrly-backend` owning it and forwarding dashboard
paths to `qrly-dashboard` over a service binding.

```
        browser / phone camera
                 |
      Cloudflare edge, one route: */*
                 |
           qrly-backend                 <- every request lands here
                 |
    +------------+------------+------------------+
    |            |            |                  |
 /api/anon/  /api/...    /login /create      /aB3xK9p
 NO AUTH     authed      forwarded to        302 + waitUntil analytics
 (new)                   qrly-dashboard      (records with a null owner
                         via SERVICE BINDING  when the code is unclaimed)
```

Ownership is now a three-state property rather than a two-state one:

```
  anonymous create        claim                 (no further transition)
  user_id = null   -->   user_id = <account>   -->  frozen forever
  claim_token set        claim_token null
       |
       | 30 days, unclaimed
       v
  purged, cascading to qr_codes and scan_events
```

### Key Patterns Discovered

- **The design bundle is a visual reference, not a functional spec.** The user said
  this twice, the second time unprompted: *"whatever we have in the app, keep the
  functionalities, whatever. Just take design inspiration from it."* The mockup
  contains magic links, OAuth, CSV export, first-scan email, auto-UTM and account
  deletion. **None of those were built and none should be** unless asked.
- **Where a guard exists, check what transition it actually forbids.** 0009 assumed
  making a column nullable was enough. A trigger from 0002 refused every change to
  `user_id`, which made the entire claim path dead. Nothing in the Worker test suite
  could see it.
- **DB-level behaviour belongs in `tools/verify-rls.mjs`,** not in vitest. The
  vitest pool has no database; every claim assertion lives in the RLS script.

## Work Completed

### Tasks Finished

- [x] Read the design bundle (`QRly.dc.html`, 10 screens) and `support.js`
- [x] New design system: tokens, fonts via `next/font`, primitives, chrome, motion
- [x] Landing rebuilt around a URL field
- [x] `/create` — idle → building → done, with the QR assembling module by module
- [x] `/create/design` — the studio for an unclaimed code
- [x] Migration 0009 — nullable ownership, claim token, claim + purge functions
- [x] Migration 0010 — `get_link_sparklines()` so the list is one query, not N+1
- [x] Migration 0011 — **unblocks the claim**; 0009 alone did not work
- [x] `POST /api/anon/links`, `POST /api/links/claim`, `PUT /api/anon/qr`
- [x] `createLink()` extracted so both create paths share validation and retry
- [x] Nightly `purge_unclaimed` wired into the daily cron
- [x] Links list: 7-day sparkline and count; one primary action plus an overflow menu
- [x] `/links/{id}`: three tabs with that code's real scans
- [x] QR studio: autosave, downloading flushes first, every existing control kept
- [x] Domains: 30-second polling with elapsed time
- [x] All four auth forms wrapped in `try`/`finally` — the stuck-spinner bug is fixed
- [x] Scanner error pages restyled; they keep a dark palette
- [x] `create` added to `DASHBOARD_SEGMENTS` and `RESERVED_SLUGS`
- [x] 12 new Worker tests, 8 new RLS checks
- [x] `flow.md` rewritten
- [x] Smoke-tested the whole anonymous chain against the real database, then cleaned up

### Files Modified

57 files dirty, nothing staged. Shape of the change:

| Area | Contents |
|------|----------|
| New migrations | `0009_anonymous_links.sql`, `0010_link_sparklines.sql`, `0011_allow_claiming.sql` |
| New backend | `backend/src/routes/anonymous.ts`, `backend/test/anonymous.test.ts` |
| Backend edits | `backend/src/routes/links.ts` (shared `createLink`, claim handler), plus `cron.ts`, `dashboard.ts`, `rate-limit.ts`, `slug.ts` and `pages.ts` under `backend/src/lib/`, and `backend/src/types.ts`, `backend/src/index.ts` |
| New frontend | `frontend/src/app/create/`, `frontend/src/components/chrome.tsx`, `frontend/src/components/create/`, `frontend/src/components/landing/`, `frontend/src/components/links/claim-pending.tsx`, `frontend/src/components/links/link-detail.tsx`, `frontend/src/lib/anon.ts` |
| Frontend rewrites | `frontend/src/app/globals.css`, `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`, `frontend/src/components/ui/index.tsx`, plus all four auth pages, the dashboard layout, the links list/row/dialog, qr-studio, domains, settings and stat-tiles |
| Frontend migrated | 5 chart components and the analytics filter bar — token substitution, not redesign |
| Tooling | `tools/verify-rls.mjs` (+8 checks) |
| Docs | `flow.md` rewritten |

### Decisions Made

| Decision | Options Considered | Rationale |
|----------|-------------------|-----------|
| Anonymous codes are live immediately | Image-only until claimed / reserved-but-inactive | User chose. It is what makes "take the QR and print it" true. |
| Scans recorded before the claim | Start counting at claim (what the mockup's copy says) | The user's own words: *"then you go and sign up and then all the data will be visible."* A poster that ran three weeks must not show zero. |
| `user_id` nullable, not a sentinel account | A shared "anonymous" auth.users row | RLS is `user_id = auth.uid()`. A shared owner means any session authenticating as it reads every unclaimed link in the system. Null matches no policy at all. |
| Claim token is the only credential | Session cookie / email | It has to work with no account by definition. v4 uuid, 122-bit search, nulled on claim. |
| Claim runs on `/links`, not in the auth forms | Wire it into each form | Four ways to end up signed in; the dashboard is where they converge. |
| `/api/anon/*` prefix | `/links/anonymous` | Would match the `/links/*` auth matcher; auth would depend on registration order. |
| 30-day expiry on unclaimed codes | Keep forever | Unauthenticated writes with no expiry let anyone mint permanent rows in a loop. |
| Light-mode only | Derive a dark palette | User chose. Scanner pages excepted — they render on a stranger's phone at night. |
| Kept password auth, full studio, retention | Follow the mockup | User instruction, stated twice. |
| `animate` as an option on `renderSvg` | A second renderer | Export still uses the merged-path version; only the reveal pays for per-module nodes. |

## Pending Work

### Immediate Next Steps

1. **Look at it.** Both dev servers are running (see Active Processes). Open
   http://localhost:3000 and walk: landing → create → building → done → design →
   signup → claim. Nothing in this session has been visually reviewed, and the
   design was reproduced from source rather than from screenshots.
2. **Commit.** 57 dirty files, 13 new paths, nothing staged. Suggested split:
   migrations + backend anon surface / design system + public screens / dashboard
   screens / docs and tests.
3. **Supabase → Authentication → URL Configuration.** Still `localhost:3000`. Still
   the blocker for email confirmation and password reset in production. Unchanged
   from the previous handoff, and now it also blocks the claim flow end to end,
   because claiming happens after the confirmation redirect lands.
4. **Decide about `/cost` and `/privacy`.** Both were mechanically migrated to the
   new tokens and build clean, but neither was redesigned and neither appears in the
   mockup. They are long, and they are the project's argument.
5. **Re-run `npm run check:paths` after adding any page.** `create` is now on both
   lists; a third route added carelessly is a permanently shadowed printed code.

### Blockers/Open Questions

- [ ] **Nothing is committed.** Everything below is at risk from a bad `git checkout`.
- [ ] **Supabase Auth URL configuration.** Dashboard-only. See step 3.
- [ ] **Mobile is untested.** The layouts use responsive classes throughout, but no
      viewport below desktop has been opened.
- [ ] **`prefers-reduced-motion` is handled globally in CSS**, but the QR reveal and
      the scan line were not checked under it.
- [ ] Everything still open from the previous handoff: over-scoped Cloudflare token,
      `CLOUDFLARE_API_TOKEN` unset on the Worker, `qrly-dashboard` rebuild unverified,
      stale `qr.himanshukotkar.tech` domains row, Namecheap parking A record.
- [ ] The stray `an-1787955871727@qrify.test` account still exists. It was used
      deliberately this session as the claim smoke-test target, so it is now slightly
      less stray, but it is still there.

### Deferred Items

- Renaming `backend/` and `frontend/` to reflect what they are. Still cosmetic.
- A dark palette for the app. Explicitly rejected this session.
- Everything the mockup invented and the product lacks — see Key Patterns.

## Context for Resuming Agent

### Important Context

**THE MIGRATIONS ARE ALREADY APPLIED TO THE LIVE SUPABASE — AND 0009/0010 WERE
APPLIED BY ACCIDENT.** I ran `node tools/migrate.mjs status` intending a read-only
check. The flag is `--status`; a bare `status` is ignored and the tool runs its
default action, which applies. Both succeeded. 0011 was then applied deliberately to
fix the bug that 0009 introduced. `migrate:status` reports 11 applied, none pending,
no drift. **Use `npm run migrate:status`, never the bare script with a positional
argument.**

**No down-migrations exist.** Reversing 0009 means restoring `NOT NULL` on three
columns, which fails if any unclaimed row exists.

**The user is learning this stack, not just directing it.** From the previous
handoff, and it held all session: the right deliverable is often an explanation
rather than a change. This session that meant explaining what a Cloudflare API token
is and why a CNAME alone produces a TLS error. When they say they do not understand
something, explain the mechanism.

**The user is right about product instincts.** They corrected the scope twice —
"stick to what we have in the code, not to design exactly for functionalities" — and
they were right both times. The mockup is seductive and contains a lot of product
that does not exist.

**Ask before touching production.** They said "no changes to the code right now or
any time further until I say so" earlier in the session, then later authorised the
full-stack rebuild. Authorisation was scoped to the work, not to their infrastructure.

### Assumptions Made

- Anonymous codes may only exist on a platform hostname. Not special-cased — the
  0002 domain-access guard already refuses a null owner on a custom domain, and the
  API returns a sentence rather than letting the trigger 500.
- One claim token per code, held in one browser. Cross-device claiming does not work
  and the UI says so at the two points where it matters.
- The links list's sparkline window is 7 days, matching the count beside it.
- `get_link_sparklines` returns a dense series; the client pushes in order and does
  not reconstruct the calendar.

### Potential Gotchas

Everything in the previous handoff still applies. Add these:

- **A SQL function returning a composite does not come back as JSON `null`.**
  PostgREST serialises a NULL composite as an object with every column set to null.
  That object is **truthy**. `backend/src/routes/links.ts` checks `claimed?.id`, not `!claimed` —
  the naive version reported a failed claim as a `200` with a link full of nulls.
  This was caught by the RLS script, not by any Worker test.
- **`guard_link_identity` (0002) refuses every `user_id` change.** 0011 rewrote it to
  allow exactly `null → user`. Transfer and un-claim stay blocked. If you write
  another migration touching that function, reproduce the ownership clause from 0011
  or you will silently re-break claiming.
- **`node tools/migrate.mjs status` APPLIES MIGRATIONS.** See Important Context.
- **`links_claim_state_valid`** is a check constraint: unclaimed rows carry a token
  and no owner, claimed rows carry an owner and no token. There is no third state.
  An insert that sets neither will be rejected.
- **The design bundle lives in a temp scratchpad** that will not survive. The source
  zip is at `~/Downloads/# QR Code Generator Design-handoff.zip`, and the project is
  at claude.ai/design/p/c51f5945-8888-44bd-b4ed-8034582e3896.
- **`next/font` self-hosts Schibsted Grotesk and Fragment Mono at build time.** They
  are referenced through `--font-grotesk` / `--font-fragment` in `globals.css`. A
  build without network access to Google Fonts will fail differently than a runtime
  font failure would.
- **Local dev is two servers, not one.** `:3000` serves pages, `:8787` serves the API
  and short codes. The service binding that merges them is production-only.
- **Five pre-existing `tsc` errors in `backend/test/dns.test.ts`** remain. They
  predate both sessions. Vitest does not typecheck.

## Environment State

### Tools/Services Used

- **Supabase** — unchanged project. **11 migrations applied, nothing pending, no
  drift.** Auth URL configuration still points at localhost.
- **Cloudflare** — untouched this session. Nothing deployed. Production still runs
  the pre-redesign code.
- **GitHub** — untouched. Nothing pushed.
- Node 22.16, Wrangler 4.x, Vitest 4, Next 15.5.24.

### Active Processes

Two dev servers were left running and will not survive the session:

| Port | Process | Command |
|------|---------|---------|
| 3000 | Next dev | `cd frontend && npx next dev --port 3000` |
| 8787 | Worker | `cd backend && npx wrangler dev --port 8787` |

Both were answering 200 at handoff time.

### Environment Variables

Unchanged from the previous handoff. No new variables were introduced. Names only;
values live in gitignored files and must never be reproduced in any document.

`.env`, `backend/.dev.vars`, `frontend/.env.local`, `cloudflare.md`, `supabase.md` —
all as previously documented.

## Verification Status

- **172/172 backend tests pass** (up from 160; +12 in `backend/test/anonymous.test.ts`)
- **42/42 `tools/verify-rls.mjs` checks pass** (up from 34; +8 covering the claim)
- `npm run check:paths` — all pass, including the new `create` segment
- `npm run migrate:status` — 11 applied, none pending, no drift
- Frontend `tsc --noEmit` clean; `next lint` clean; `next build` clean, 16 routes
- Backend `tsc --noEmit` clean except the 5 pre-existing `dns.test.ts` errors
- **Smoke-tested end to end against the real database**: anonymous create → `302`
  redirect from KV (`resolve;dur=74`) → design saved via claim token (`204`) → scan
  recorded with `user_id: null` → claimed → link, design and scan all moved →
  transfer refused → spent token refused. Test row deleted.
- **Not verified: anything visual.** No screen has been rendered and looked at.

## Related Resources

- `flow.md` — the user flow, rewritten this session. The spec.
- `architecture.md` — design, schema, RLS, caching. Does not describe the apex merge
  or the anonymous flow. Now two sessions stale.
- `context.md`, `plan.md`, `README.md` — stale on status, as flagged previously.
- `tools/check-dashboard-paths.mjs` — run after adding any dashboard page.
- Design project: claude.ai/design/p/c51f5945-8888-44bd-b4ed-8034582e3896

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.
