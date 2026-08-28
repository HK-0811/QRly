# qrify — Implementation Plan

> Phased build plan with tasks, deliverables, and acceptance criteria.
> Reads alongside `context.md` (scope and decisions) and `architecture.md` (technical design).
>
> Last updated: 2026-08-29 · Status: **not started**

---

## Sequencing overview

```
Phase 0  Scaffold
   ↓
Phase 1  Database + Auth          ← foundation, everything depends on this
   ↓
Phase 2  Link creation            ── ┐
   ↓                                 │  core loop
Phase 3  Redirect engine          ── ┘  ← the product works after this
   ↓
Phase 4  QR generation            ← the product is demonstrable after this
   ↓
Phase 5  Analytics collection     ── ┐
   ↓                                 │  the differentiator
Phase 6  Analytics dashboard      ── ┘
   ↓
Phase 7  Custom domain DNS        ⛔ needs domain
Phase 8  Cloudflare for SaaS SSL  ⛔ needs domain
   ↓
Phase 9  Security + privacy
Phase 10 Production hardening
```

**First demonstrable moment:** end of phase 4 — create a link, print a QR, scan it,
change the destination, scan again, watch it go somewhere else. That is the entire pitch
in thirty seconds, and it lands before any analytics work is done.

**Optional early de-risk:** the redirect engine (phase 3) only needs a schema and one
seeded row. If you want the riskiest piece proven first, it can be pulled ahead of
phase 2 and tested against a hand-inserted link. Phases 2 and 3 are otherwise written to
be built together, since link editing and cache invalidation are two halves of one
mechanism.

**Sizes** are relative, not hours: **S** = a sitting · **M** = a session · **L** = multiple sessions.

---

## Gates — what's needed from you, and when

| Gate | Needed before | Status |
|---|---|---|
| `.gitignore` before first commit | Phase 0 | ⚠️ **outstanding** — `.env` holds a `service_role` key |
| Cloudflare account | Phase 0 deploy | ❓ not confirmed |
| Next.js deploy target decision | Phase 0 | ❓ recommendation: OpenNext adapter |
| Domain purchased + on Cloudflare | Phase 7 | ⛔ not purchased |
| Google Safe Browsing API key | Phase 9 | ❓ free, needs a Google Cloud project |

Phases 0–6 and 9–10 need nothing beyond the Cloudflare account. Only 7 and 8 are hard-blocked.

---

## Phase 0 — Scaffold · **S**

**Goal:** both apps run locally and the Worker is reachable on the public internet.

- [ ] `git init`, and **`.gitignore` covering `.env`, `supabase.md`, `node_modules`, `.wrangler`, `.next`** — before any commit
- [ ] `backend/`: TypeScript + Hono + Wrangler, `wrangler.toml`, hello-world route
- [ ] `frontend/`: Next.js (App Router) + TypeScript + Tailwind
- [ ] Decide and configure the Next.js deploy target
- [ ] `supabase/migrations/` directory
- [ ] `backend/src/types.ts` as the canonical shared type source
- [ ] Deploy the Worker to `*.workers.dev`

**Acceptance:** `wrangler dev` and `next dev` both serve locally; the deployed Worker
responds over HTTPS at its `workers.dev` URL.

---

## Phase 1 — Database + Auth · **M**

**Goal:** schema live, RLS provably enforced, signup produces a usable account.

- [ ] Resolve **open question 1** — Supabase JWT signing method (ES256/JWKS vs HS256)
- [ ] Resolve **open question 2** — direct vs pooler Postgres connection for migrations
- [ ] Migration: `profiles`, `domains`, `links`, `qr_codes`, `scan_events`, `daily_salts`
- [ ] All indexes from `architecture.md` §5.3
- [ ] RLS policies on every table
- [ ] Trigger: auto-insert `profiles` row on `auth.users` insert
- [ ] Seed the default platform domain row (the `workers.dev` hostname for now)
- [ ] Cron: daily Supabase keep-alive ping — **prevents the 7-day auto-pause**

**Acceptance:** migration applies clean from scratch. Signing up creates a `profiles`
row. **RLS is verified adversarially** — with user A's JWT, querying user B's links
returns zero rows, not an error. Cron fires and the ping lands.

**Risk:** RLS that looks correct but isn't is the single most dangerous silent failure
in this build. It gets tested with two real accounts, not assumed.

---

## Phase 2 — Link creation · **M**

**Goal:** a signed-in user can create, edit, disable, and delete links.

- [ ] Supabase Auth: signup, login, logout, session persistence, password reset
- [ ] Protected dashboard layout + route guards
- [ ] Worker: JWT verification middleware
- [ ] `POST /api/links` · `PATCH /api/links/:id` · `DELETE /api/links/:id`
- [ ] Slug generator, reserved-word list, collision retry via unique constraint (no pre-check — it races)
- [ ] URL validation: scheme allow-list, private/loopback/link-local IP block
- [ ] Links list, create form, edit form, active toggle
- [ ] Copy-to-clipboard for the short URL

**Acceptance:** full CRUD works through the UI. Invalid schemes (`javascript:`) and
private IPs are rejected with a clear message. A second account cannot see or modify the
first account's links.

---

## Phase 3 — Redirect engine · **M**

**Goal:** the core product. Fast, cached, correct.

- [ ] Hostname + slug parsing
- [ ] KV read-through cache, plus the `null` sentinel for unknown slugs
- [ ] Validation chain in order: hostname active → slug resolves → `is_active` → not expired → not flagged
- [ ] `302` to destination
- [ ] Branded 404 page and flagged-link warning page — **never a bare error**
- [ ] Write-through cache invalidation wired into the phase 2 write endpoints
- [ ] **Dashboard copy stating edits propagate within ~60s** (KV eventual consistency)
- [ ] Latency measurement

**Acceptance:** visiting a slug 302s correctly. Editing a destination changes the target
within the propagation window. Disabled, expired, and unknown slugs each render their
correct page. Warm-cache p50 measured **under 20ms**.

**Risk:** the 60-second KV propagation window. If someone edits a URL, immediately
scans, and gets the old page with no explanation, the demo reads as broken. The UI copy
is not optional polish here — it's part of the deliverable.

---

## Phase 4 — QR generation · **M**

**Goal:** downloadable, styled, scannable QR codes. First fully demonstrable build.

- [ ] Client-side QR generation (no server round trip, no storage cost)
- [ ] Style controls: foreground/background colour, logo, module shape, error-correction level
- [ ] Live preview
- [ ] Download as PNG and SVG
- [ ] Persist style to `qr_codes` with `locked_domain_id`
- [ ] **Domain-lock warning in the UI** — the encoded hostname is permanent once printed

**Acceptance:** generate, style, download, then scan the downloaded file with a real
phone and land on the destination. Raising the logo size degrades scannability, so
verify a logo-bearing code still scans at high error correction.

---

## Phase 5 — Analytics collection · **M**

**Goal:** every scan writes a rich, privacy-safe event without slowing the redirect.

- [ ] `geo.ts` — `request.cf` extraction
- [ ] `ua.ts` — user-agent parsing to device / OS / browser
- [ ] `asn.ts` — ASN → `network_type` classification
- [ ] `bot.ts` — bot and link-preview-fetcher detection
- [ ] `hash.ts` — visitor hash + daily salt rotation cron
- [ ] `analytics.ts` — enrichment and insert under `ctx.waitUntil()`
- [ ] Local hour / day-of-week derived from the scanner's timezone
- [ ] `is_first_scan` via conditional insert (no read-before-write)
- [ ] Honour `Sec-GPC` / `DNT`

**Acceptance:** scan from a phone on mobile data, from desktop wifi, and via a WhatsApp
share. Inspect the rows: geo, network, and device fields populated; carrier name present
on mobile; the WhatsApp fetch flagged as a bot; **no raw IP stored anywhere**. Redirect
latency unchanged from phase 3.

---

## Phase 6 — Analytics dashboard · **L**

**Goal:** the payoff. Where the "why is Bitly charging for this" argument gets made.

- [ ] RPC aggregate functions: summary, timeseries, geo, device, UTM, local-time heatmap
- [ ] Summary cards: total scans, unique scans, repeat rate, first vs returning
- [ ] Scans-over-time chart with hour/day/week/month granularity
- [ ] Geography: country/region/city tables, choropleth map, jittered lat-long scatter
- [ ] **Network breakdown: ISP/carrier, mobile vs broadband vs corporate, connection quality**
- [ ] Device, OS, browser, language breakdowns
- [ ] Referrer and full UTM breakdown
- [ ] **Time-of-day heatmap in the scanner's local timezone**
- [ ] Filters: date range, link, QR, domain, country, region, city, device, OS, browser, UTM
- [ ] Bot include/exclude toggle
- [ ] **Accuracy disclaimers rendered in the UI** — geo is approximate; iOS reports no device model

**Acceptance:** dashboard renders real collected data. Every filter narrows results
correctly. The bot toggle visibly changes totals. Approximation caveats are visible
where geography is shown, not buried in a settings page.

**Note:** the map library must be key-free and offline-capable, or the $0 claim breaks.
That's **open question 4** in `architecture.md`.

---

## Phase 7 — Custom domain DNS verification · **M** · ⛔ **needs domain**

**Goal:** a client adds one CNAME and comes back to a working custom domain.

- [ ] Domains UI: add hostname, show the exact CNAME record, verify button
- [ ] DNS-over-HTTPS lookup from the Worker, independent of Cloudflare's validation
- [ ] Status states: pending → verifying → active → failed, each with distinct copy
- [ ] **Distinguish "record not found yet" from "record found, certificate issuing"** — very different messages to a confused user
- [ ] Edge cases: apex domain cannot take a CNAME; Cloudflare-hosted DNS must be grey-cloud/unproxied
- [ ] Block domain deletion while links or QR codes still reference it

**Acceptance:** add a real subdomain on a real domain, add the CNAME at a real registrar,
click verify, and it goes live.

---

## Phase 8 — Cloudflare for SaaS SSL · **M** · ⛔ **needs domain**

**Goal:** automatic certificates. The step that makes the CNAME actually work.

- [ ] Cloudflare API client (`cloudflare.ts`)
- [ ] `POST /custom_hostnames` on domain registration
- [ ] Certificate status polling
- [ ] Fallback origin configuration
- [ ] Worker route wiring for custom hostnames
- [ ] Hostname cleanup on domain deletion

**Acceptance:** `https://qr.realclient.com/ABC123` resolves with a **valid certificate**
and redirects correctly. Certificate issuance is fully automatic — the client never sees
a validation step.

---

## Phase 9 — Security, privacy, abuse · **M**

**Goal:** safe to put in front of strangers on the public internet.

- [ ] Google Safe Browsing on link create + weekly re-check cron
- [ ] Flagged links serve the warning page — **the printed QR keeps resolving**
- [ ] Rate limiting: per-IP-hash and per-link
- [ ] Retention purge cron honouring each account's `retention_days`
- [ ] Retention setting in account UI
- [ ] Privacy policy page describing exactly what is collected and what is not
- [ ] **Secrets audit** — confirm `service_role` appears in no client bundle
- [ ] Verify the full threat table in `architecture.md` §11

**Acceptance:** a known-malicious test URL is flagged and serves the warning page.
Rate limits trigger under a scripted burst. Purge deletes events past the retention
window. `grep` the built client bundle for the service key and find nothing.

---

## Phase 10 — Production hardening · **M**

**Goal:** durable, presentable, and self-explanatory.

- [ ] Error handling and structured logging across the Worker
- [ ] Branded 404 and 500 pages
- [ ] Verify every failure mode in `architecture.md` §12 — **especially "Supabase down, cache warm"**, the design's best property
- [ ] Load sanity check against free-tier ceilings
- [ ] **Public cost-comparison page** — this build's real running cost against incumbents' published pricing. The showcase piece.
- [ ] README with setup and self-host instructions
- [ ] Final pass over `context.md` and `architecture.md` for drift

**Acceptance:** killing the Supabase connection with a warm cache leaves redirects
working. All documented failure modes behave as written. The cost page cites current
published competitor pricing, pulled at build time rather than from memory.

---

## Immediate next step

Phase 0, starting with `.gitignore` — `.env` currently holds a `service_role` key in
plaintext, and that key bypasses RLS entirely. If it reaches a public repo it has to be
rotated and every downstream secret re-issued.

Confirm the Cloudflare account and the Next.js deploy target and phase 0 can run
straight through to a deployed Worker.
