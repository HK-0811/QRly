# Handoff: QRly — Renamed, Monorepo Pushed, Live on qrly.lol. Auth Chain Half-Wired.

## Session Metadata
- Created: 2026-08-30 02:01:45
- Project: X:\Projects\qrify
- Branch: main (renamed from `master` this session)
- Remote: https://github.com/HK-0811/QRly.git
- Session duration: ~7 hours, single session

### Recent Commits (for context)
  - a79249d Serve the dashboard from qrly.lol, not app.qrly.lol
  - 19d0b27 Give the dashboard its own route on qrly.lol
  - 19f96ec Point production at qrly.lol and fix what broke the first CI deploy
  - 27aa000 Set the repo up for deployment from git (Workers Builds)
  - 60fda56 Rename the project from qrify to QRly

## Handoff Chain

- **Continues from**: [2026-08-29-120732-qrify-implementation-phases-0-10.md](./2026-08-29-120732-qrify-implementation-phases-0-10.md)
  - Previous title: qrify — Built and Tested. One Unverified Claim.
- **Supersedes**: None. The previous handoff remains the record of what was built and
  why. This one records the rename, the deployment, and the one architectural change
  made since. Its "Immediate Next Steps" are all done except the custom-hostname test.

> Read the previous handoff for the *product* reasoning. Read this one for the
> *deployed reality*, which differs from what the docs in the repo still claim.

## Current State Summary

**The platform is live at https://qrly.lol and serving production traffic.** The project
was renamed qrify → QRly, both apps were pushed to a single GitHub repo, and both deploy
automatically to Cloudflare Workers on push to `main`. The domain is bought, on
Cloudflare as an active zone, and Cloudflare for SaaS is fully configured with an active
fallback origin — but **zero custom hostnames are registered**, deliberately.

One architectural change was made this session that is not in any design document: the
dashboard and the redirect engine now **share the apex hostname**. `qrly.lol/links` is the
dashboard and `qrly.lol/aB3xK9p` is a short code, resolved by one Worker. That decision is
explained below and is effectively permanent.

Signup works end to end in the browser. **The email-confirmation redirect does not** — it
bounces to `http://localhost:3000/?code=...` because Supabase's Auth URL configuration is
still pointed at development. That is the single blocking item, it is a two-field change
in the Supabase dashboard, and it cannot be done from code.

Working tree is clean. All 5 commits are pushed. 160 backend tests pass.

## Codebase Understanding

### Architecture Overview

Everything in the previous handoff's architecture section still holds. One thing changed,
and it changes how you read the whole repo:

**`backend/` and `frontend/` are two Workers that answer on the same hostname.** They are
not two sites. The folder names are now actively misleading:

| Folder | Worker | What it actually is |
|---|---|---|
| `backend/` | `qrly-backend` | The front door. Receives *every* request to qrly.lol. Redirect engine, `/api/*`, cron. |
| `frontend/` | `qrly-dashboard` | The Next.js app — landing page, auth pages, dashboard, /cost, /privacy. **Has no hostname and no DNS record.** |

Request flow, all on `qrly.lol`:

```
        browser / phone camera
                 |
      Cloudflare edge, one route: */*
                 |
           qrly-backend                 <- every request lands here
                 |
    +------------+------------+
    |            |            |
 /api/...    /login /cost   /aB3xK9p
 answers     forwards to    answers itself
 itself      qrly-dashboard  (302 + waitUntil analytics)
             via SERVICE BINDING
```

`qrly-dashboard` is unreachable from the internet. The only thing that can invoke it is
`qrly-backend`, through a service binding — same thread, same server, no network hop, no
second request charge.

**Why it had to be this way:** the product needs `qrly.lol/aB3xK9p` to be a redirect and
`qrly.lol/login` to be a page. Something must own the hostname and decide. It has to be
the backend, because slugs are arbitrary and unbounded so the catch-all cannot belong to
anything else. Everything the dashboard owns is a known finite list, which is exactly why
that list can be enumerated and checked. Bitly solves this with two domains
(bitly.com + bit.ly); QRly has one, so the split is by path.

**The `*/*` route is also the custom-domain mechanism.** It matches every hostname
entering the zone, so a customer's `qr.theirbrand.com` reaches the same Worker with no
per-customer deploy, once Cloudflare for SaaS has terminated TLS for it.

### Critical Files

| File | Purpose | Relevance |
|------|---------|-----------|
| `backend/src/lib/dashboard.ts` | **New.** The list of path segments the dashboard owns, and `isDashboardPath()` | Read the header comment first. Three non-obvious rules live there. |
| `backend/src/index.ts` | Route registration + the forwarding middleware | Order is load-bearing: `/api` → forwarding → redirect catch-all. Only that order works. |
| `backend/wrangler.toml` | Two configs in one file | Top level is local dev. `[env.production]` is what deploys. **Always `--env production`.** |
| `frontend/wrangler.jsonc` | Dashboard Worker config | Deliberately has **no routes**. Do not add one. |
| `tools/check-dashboard-paths.mjs` | **New.** Reads the real Next.js routes and asserts three lists agree | `npm run check:paths`. Run after adding any dashboard page. |
| `supabase/migrations/0008_platform_hostname.sql` | **New.** Inserts `qrly.lol` into `domains` | Applied. Without it every scan 404s. |
| `backend/src/lib/slug.ts` | `RESERVED_SLUGS` | These are now *live paths*, not precautions. The comment says so. |
| `cloudflare.md` | **Gitignored.** Cloudflare account id, API token, unused R2 keys | Was untracked but NOT ignored for several hours. Now ignored. Never committed — verified against full history. |
| `plan.md` / `README.md` / `context.md` / `architecture.md` | Docs | **Stale.** They still say there is no Cloudflare account and no domain. |

### Key Patterns Discovered

All patterns from the previous handoff still apply. New ones:

- **Where a list must agree with reality, a script reads reality.**
  `tools/check-dashboard-paths.mjs` walks `frontend/src/app` rather than trusting a
  hand-maintained list. It was verified by deliberately breaking it (deleting `cost`)
  and confirming it failed with a useful reason.
- **Test names state the consequence, not the mechanism.** e.g. *"does NOT serve our
  dashboard on a customer custom hostname"*, *"forwards Next.js build output, or the page
  loads with no JavaScript"*.
- **Config comments explain what breaks.** `wrangler.toml` says why `[env.production]`
  exists (a bare deploy ships `localhost:8787` and 404s every scan), not just what it is.

## Work Completed

### Tasks Finished

- [x] Renamed qrify → QRly across 40 files. `QRly` for anything a person reads, `qrly` for
      identifiers that cannot carry case. Header is `X-Qrly-Source`.
- [x] Pushed the existing monorepo to `github.com/HK-0811/QRly`, `master` → `main`
- [x] Added `[env.production]` to `backend/wrangler.toml` so a git-triggered deploy cannot
      publish development hostnames
- [x] Connected both Workers to the repo via Workers Builds (user did the dashboard half)
- [x] Created the `qrly-links` KV namespace; fixed the CI failure it was causing
- [x] Set 6 production secrets on `qrly-backend` and verified them
- [x] Migration 0008 — `qrly.lol` as the platform hostname. Applied.
- [x] DNS: created `app` and `fallback` AAAA `100::` proxied records; later deleted `app`
- [x] Cloudflare for SaaS: fallback origin `fallback.qrly.lol`, status **active**
- [x] **Merged the dashboard onto the apex** — the architectural change described above
- [x] Deleted the now-pointless `app.qrly.lol` DNS record and route
- [x] Diagnosed the signup hang in a real browser: missing build variables
- [x] Diagnosed the confirmation-email redirect: Supabase Site URL still localhost

### Files Modified

Working tree clean; everything committed and pushed. Shape of the change:

| Area | Contents |
|------|----------|
| Rename | 40 files across `backend/`, `frontend/`, `tools/`, docs, lockfiles |
| New source | `backend/src/lib/dashboard.ts` |
| New tests | `backend/test/dashboard.test.ts` (13), CORS block in `health.test.ts` (6) |
| New tooling | `tools/check-dashboard-paths.mjs`, `npm run check:paths` |
| New migration | `supabase/migrations/0008_platform_hostname.sql` |
| Config | `backend/wrangler.toml` (production env, route, service binding), `frontend/wrangler.jsonc` (routes removed), `.gitignore` (+`cloudflare.md`) |

### Decisions Made

| Decision | Options Considered | Rationale |
|----------|-------------------|-----------|
| Dashboard and slugs share the apex | Frontend on apex + links on `qr.qrly.lol` / keep the split | User chose. Keeps links shortest, makes the API same-origin. Cost is a reserved-path list, which is guarded by a script. Zero links and zero printed QR codes existed at the time, so the choice was still free. |
| Forward via service binding, not a route | Worker route per path prefix / frontend proxies to backend | Enumerating ~10 route patterns is brittle; a frontend proxy would put Next.js in front of the redirect hot path. Service binding is same-thread and free. |
| Forward only on the platform hostname | Forward everywhere | A customer's custom domain must serve their redirects and nothing of ours. |
| Worker named `qrly-backend`, not `qrly` | Rename the CI project | Matching the existing Workers Builds project avoided a delete/recreate, and it pairs with `qrly-dashboard`. |
| `[env.production]` with repeated keys | Inherit from top level | `vars` and bindings are non-inheritable anyway; repeating the rest means what deploys is one readable block. Also makes a bare `wrangler deploy` fail loudly rather than ship dev values. |
| Left the placeholder KV id at top level | Put the real id there | The placeholder makes an unqualified production deploy impossible. The failure is the feature. |
| Migration headers still say `-- qrify` | Edit them / repair checksums | `tools/migrate.mjs` reports DRIFT on any edit to an applied file. Breaking a working integrity guard to rename a comment is a bad trade. No identifier, table, function or policy carries the old name. |
| `.claude/handoffs/*` not renamed | Rename for consistency | They are dated records. Rewriting them would make them say something untrue at the time of writing. |
| Two Cloudflare API tokens recommended | One broadened token | The SaaS token lives *inside* the Worker as a runtime secret. If it could also edit Workers Scripts, anyone extracting it could replace the deployed code. (User currently has one token with both; see Blockers.) |

## Pending Work

### Immediate Next Steps

1. **Supabase → Authentication → URL Configuration.** Set **Site URL** to
   `https://qrly.lol` and add `https://qrly.lol/**` to **Redirect URLs**, keeping
   `http://localhost:3000/**` for dev. This is the only thing blocking the auth flow.
   It also fixes password reset, which is broken the same way. Cannot be done from code —
   Supabase auth config needs a Management API personal access token, and the
   service_role key does not reach it.
2. **Verify signup end to end** once (1) is done: throwaway address → email link →
   `/auth/callback` → session cookie → `/links`. Browser automation is available and was
   used successfully this session.
3. **Fix the stuck-spinner bug in the four auth forms** (`login`, `signup`,
   `forgot-password`, `reset-password`). All four do `setBusy(true)` then
   `createClient()` with no `try`/`finally`, so a thrown error escapes the handler and the
   button spins forever with no message. This is why the build-variable problem cost an
   afternoon instead of being obvious. User was offered this and had not answered.
4. **Bring the docs in step with reality.** `README.md` § Status, `context.md` §13 and
   `plan.md` all still claim no Cloudflare account, no domain, and phases 7–8 unverified.
   On a project whose stated deliverable is honesty, that matters. Also add the apex-merge
   architecture, which no document describes.
5. **Replace the apex `A qrly.lol → 192.64.119.117`** (Namecheap's parking page, inherited
   at import) with `AAAA @ → 100::` proxied. It works today only because the record is
   proxied and the route intercepts first. Same for `www.qrly.lol`, still CNAMEd to
   `parkingpage.namecheap.com`. User was asked twice and had not decided.

### Blockers/Open Questions

- [ ] **Supabase Auth URL configuration.** Dashboard-only. Blocks email confirmation and
      password reset. See step 1.
- [ ] **Custom hostname test — REQUIRES EXPLICIT USER APPROVAL. See Important Context.**
- [ ] **The Cloudflare API token is over-scoped.** It now has zone SSL/Certificates *and*
      account Workers Scripts/KV. It is also the token that would be stored in the Worker
      as `CLOUDFLARE_API_TOKEN`. Splitting it was recommended and not done.
- [ ] **`CLOUDFLARE_API_TOKEN` is not set on the Worker.** `CLOUDFLARE_ZONE_ID` is. Until
      the token is set, `backend/src/lib/cloudflare.ts` cannot register custom hostnames at all.
- [ ] **Does `qrly-dashboard` rebuild on push?** It last deployed noticeably before a push
      that touched `frontend/wrangler.jsonc`. Its build watch paths or GitHub connection
      may be wrong. Nothing is broken — that change was applied directly via the API — but
      it is unverified.
- [ ] **A leftover test account** `an-1787955871727@qrify.test` survived a test run on
      2026-08-28. The suites are supposed to delete their accounts in a `finally`. Worth
      understanding before trusting the cleanup.
- [ ] **Stale `domains` row** `qr.himanshukotkar.tech`, state `verifying`, with
      `cname_target: "localhost:8787"` from local dev. Inert, but with a working token in
      place, clicking Verify on it would attempt a real custom-hostname registration.

### Deferred Items

- Renaming the `backend/` and `frontend/` folders to something that reflects what they are
  (router/redirect engine, and web pages). Cosmetic; agreed to leave until the
  custom-domain work is finished.
- Everything the previous handoff deferred (teams, roles, SSO, queues, Durable Objects,
  partitioning) remains rejected by decision, not oversight.

## Context for Resuming Agent

### Important Context

**THE USER HAS ADDED A PAYMENT CARD TO CLOUDFLARE. Do not create custom hostnames without
asking first.** The user asked for this explicitly. Cloudflare for SaaS is 100 free and
then $0.10 per active hostname per month; deleting one removes it from the count. One or
two test hostnames cannot approach the ceiling — the real risk is code creating them in a
loop — but the instruction stands regardless. **Currently 0 of 100 registered.**

**The user is learning this stack, not just directing it.** Several times the right
deliverable was an explanation, not a change — what Cloudflare actually is, what a TLS
certificate does, why a CNAME alone fails, why the two Workers share a hostname. When the
user says they do not understand something, explain the mechanism rather than restating
the fix. It worked: they made the apex decision themselves once they could see the
trade-off.

**The user is right about product instincts; verify before contradicting.** They caught
that `app.qrly.lol` for the dashboard was backwards, and they were correct.

**`plan.md`'s one unverified claim is still unverified**, but everything blocking it is
now gone except approval: the domain is bought, the zone is active, the fallback origin is
active, and the token has SSL/Certificates access. The user owns a **second** domain,
`himanshukotkar.tech`, which is what makes a genuine test possible — a subdomain of
`qrly.lol` would not exercise the SaaS path at all, since Cloudflare handles same-zone
hostnames natively.

**Hostname choices are permanent.** `qr_codes.locked_domain_id` is immutable by trigger
and `on delete restrict` protects the row. Once a code is printed, its hostname must live
forever. This is why the apex-merge decision was put to the user rather than assumed.

### Assumptions Made

- The apex merge assumed the dashboard's route surface stays small and enumerable. It is
  currently 12 pages plus `_next` and `geo`. `npm run check:paths` enforces it.
- `DASHBOARD_ORIGIN` is now a single origin (`https://qrly.lol`) because the dashboard is
  same-origin with the API. The middleware still splits on commas, so a second origin can
  be added without a code change.
- Local development is unchanged: `wrangler dev` on :8787 and `next dev` on :3000, two
  separate servers. The service binding is production-only and the forwarding middleware
  no-ops when the binding is absent — there is a test for exactly that.
- Free-tier limits and Cloudflare for SaaS pricing were re-read on 2026-08-29.

### Potential Gotchas

Everything in the previous handoff's gotchas list still applies. Add these:

- **Build variables are NOT runtime variables.** This cost the most time this session.
  `NEXT_PUBLIC_*` are inlined into the browser bundle by webpack at *build* time. Setting
  them under Settings → Variables & Secrets (runtime) makes server-side rendering work and
  leaves the browser bundle containing `undefined`. Result: every page loads perfectly and
  the app breaks the instant the browser needs Supabase. They must be set under
  **Settings → Build → Build variables and secrets**, and only a *new build* applies them.
- **This machine has no working IPv6 route.** `curl https://…` returns `000` on any
  hostname with an AAAA answer. Always use `curl -4`. An hour was nearly lost to a
  "broken" `app.qrly.lol` that was fine.
- **`*/` inside a block comment closes it.** Writing `**/api/*` in a JSDoc comment
  produced `TS2304: Cannot find name 'api'`. Do not write glob patterns containing `*/`
  inside `/** */`.
- **Workers Builds must deploy with `--env production`.** The default `npx wrangler deploy`
  publishes the development vars and succeeds. Wrangler warns; the warning is the only
  signal.
- **The frontend deploy does not reconcile routes.** Removing `routes` from
  `frontend/wrangler.jsonc` did not delete the existing route; it had to be deleted via
  the API.
- **Five pre-existing `tsc` errors in `backend/test/dns.test.ts`** (`Property 'hint' does
  not exist on type VerificationOutcome`). They predate this session — verified against a
  stash. Vitest does not typecheck, so all tests pass. Not fixed.
- **`RESERVED_SLUGS` and `DASHBOARD_SEGMENTS` must agree.** If they drift, a printed code
  can be shadowed by a dashboard page, permanently. `npm run check:paths` catches it.
- **`cloudflare.md` is gitignored now, but was not for several hours.** If any tooling
  writes new credential files at the repo root, check `.gitignore` before `git add -A`.

## Environment State

### Tools/Services Used

- **Cloudflare** — account active. Zone `qrly.lol`, **active**, Free plan, nameservers
  `dane`/`eva.ns.cloudflare.com`. Workers.dev subdomain `himanshukotkar007`.
  - Workers: `qrly-backend` (route `*/*`, cron `0 0 * * *` and `15 3 * * 1`, KV binding,
    service binding to the dashboard), `qrly-dashboard` (no routes).
  - KV namespace `qrly-links` — id is in `backend/wrangler.toml`.
  - Cloudflare for SaaS: enabled; fallback origin `fallback.qrly.lol`, **active**;
    **0 custom hostnames**.
  - DNS: `A qrly.lol` (Namecheap parking IP, proxied — see step 5),
    `AAAA fallback → 100::` proxied, `CNAME www → parkingpage.namecheap.com` proxied,
    5 × MX and 1 × TXT for Namecheap email forwarding (unproxied, untouched).
- **Supabase** — unchanged project, region `ap-northeast-1`, free tier. **8 migrations
  applied, nothing pending.** Auth URL configuration still points at localhost.
- **GitHub** — `HK-0811/QRly`, branch `main`, both Workers connected via Workers Builds.
- Node 22.16, Wrangler 4.127.1, Vitest 4, Next 15.5.

### Active Processes

None. No `wrangler dev`, `next dev` or `workerd` running. Nothing on :8787 or :3000.
Production runs entirely on Cloudflare.

### Environment Variables

Names only. Values live in gitignored files and must never be reproduced in any document.

`.env` (used by `tools/`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`,
`SUPABASE_PROJECT_REF`, `DATABASE_URL`

`backend/.dev.vars`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`,
`SUPABASE_JWKS_URL`, `VISITOR_HASH_PEPPER`, `SAFE_BROWSING_API_KEY` (empty),
`CLOUDFLARE_API_TOKEN` (empty), `CLOUDFLARE_ZONE_ID` (empty)

`frontend/.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_REDIRECT_ORIGIN`

`cloudflare.md`: Cloudflare account id, API token, and unused R2 S3 credentials.

`supabase.md`: Postgres host, port, database, user, password.

Set as secrets on the `qrly-backend` Worker (production): `SUPABASE_URL`,
`SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_JWKS_URL`, `VISITOR_HASH_PEPPER`,
`CLOUDFLARE_ZONE_ID`. **Not set:** `CLOUDFLARE_API_TOKEN`, `SAFE_BROWSING_API_KEY`.

Set as **build** variables on the `qrly-dashboard` Workers Builds project: the four
`NEXT_PUBLIC_*` names. Also present as runtime secrets on that Worker, which is what makes
server-side rendering work.

All credential files are gitignored, and `tools/test-security.mjs` asserts that the
service_role key and the visitor-hash pepper appear in no shipped build artefact — while
asserting the anon key does, which catches the opposite mistake.

## Verification Status

- **160/160 backend tests pass** (up from 141: +6 CORS, +13 dashboard forwarding)
- `npm run check:paths` — all checks pass; verified by deliberately breaking it
- `npm run migrate:status` — 8 applied, none pending, no drift
- Frontend typecheck and lint clean
- Live, confirmed with `curl -4`: `/` 200, `/login` 200, `/cost` 200, `/privacy` 200,
  `qrly.lol/geo/countries-110m.json` 200, `/api/health` 200 (`environment: production`),
  unknown slug 404
- Signup reproduced and fixed in a real browser; account exists and is confirmed
- `cron_runs` is still empty — the daily job first fires at 00:00 UTC after deploy.
  **Check it.** An empty table after that means the Supabase keep-alive is not running and
  the project will pause after 7 days.

## Related Resources

- `plan.md` — what each phase proved (stale on status)
- `architecture.md` — design, schema, RLS, caching (does not describe the apex merge)
- `context.md` — scope and reasoning behind every cut (§13 stale)
- `README.md` — setup and deploy (§ Deploying is current; § Status is stale)
- `tools/check-dashboard-paths.mjs` — run after adding any dashboard page
- [Worker as origin for Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/advanced-settings/worker-as-origin/)
- [Cloudflare for SaaS plans](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/) — 100 free custom hostnames, then $0.10/month each
- [OpenNext env vars](https://opennext.js.org/cloudflare/howtos/env-vars) — the build vs runtime distinction

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.
