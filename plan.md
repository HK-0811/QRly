# qrify — Implementation Plan

> Phased build plan with tasks, deliverables, and acceptance criteria.
> Reads alongside `context.md` (scope and decisions) and `architecture.md` (technical design).
>
> Last updated: 2026-08-29 · Status: **phases 0–6 complete**

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
| `.gitignore` before first commit | Phase 0 | ✅ done — `.env`, `supabase.md`, `.dev.vars`, `.env.local` all ignored |
| Next.js deploy target decision | Phase 0 | ✅ OpenNext Cloudflare adapter, configured |
| Supabase pooler connection string | Phase 1 | ✅ obtained, migrations run against it |
| Cloudflare account | Worker deploy | ⛔ **none yet — building local-only** |
| Domain purchased + on Cloudflare | Phase 7 | ⛔ not purchased |
| Google Safe Browsing API key | Phase 9 | ❓ free, needs a Google Cloud project |

Phases 0–6 and 9–10 need nothing beyond the Cloudflare account. Only 7 and 8 are hard-blocked.

---

## Phase 0 — Scaffold · **S** · ✅ **complete**

**Goal:** both apps run locally and the Worker is reachable on the public internet.

- [x] `git init`, and `.gitignore` covering `.env`, `supabase.md`, `.dev.vars`, `.env.local`, `node_modules`, `.wrangler`, `.next` — written before the first commit
- [x] `backend/`: TypeScript + Hono + Wrangler 4, `wrangler.toml`, KV binding, `/api/health`
- [x] `frontend/`: Next.js 15 App Router + TypeScript + Tailwind v4
- [x] Deploy target configured — `@opennextjs/cloudflare` (`open-next.config.ts`, `wrangler.jsonc`)
- [x] `supabase/migrations/` and `tools/` directories
- [x] `backend/src/types.ts` as the canonical shared type source
- [ ] Deploy the Worker to `*.workers.dev` — **deferred, no Cloudflare account yet**

**Acceptance:** `wrangler dev` serves `/api/health` on `:8787` and `next dev` serves on
`:3000`; `tsc --noEmit` clean in both; 3 vitest tests pass. The public HTTPS deploy is
the one item outstanding and is blocked only on a Cloudflare account.

---

## Phase 1 — Database + Auth · **M** · ✅ **complete**

**Goal:** schema live, RLS provably enforced, signup produces a usable account.

- [x] **Open question 1 resolved** — ES256 via JWKS (see `architecture.md` §15)
- [x] **Open question 2 resolved** — session pooler required; direct host is IPv6-only
- [x] Migration `0001_schema.sql`: `profiles`, `domains`, `links`, `qr_codes`, `scan_events`, `daily_salts`
- [x] All indexes from `architecture.md` §5.3, plus a partial index for the visitor hash
- [x] Migration `0002`: `updated_at`, profile provisioning, and immutability guards on `slug`, `domain_id` and `locked_domain_id`
- [x] Migration `0003`: RLS on every table, `force row level security` everywhere
- [x] Migration `0004`: platform domain seed + first daily salt
- [x] Migration `0005`: `cron_runs` audit trail
- [x] Cron: daily keep-alive, salt rotation, retention purge; weekly Safe Browsing slot

**Acceptance — met.** `tools/reset-db.mjs` drops everything and all five migrations
reapply clean from scratch. `tools/verify-rls.mjs` creates two real accounts, signs both
in, and runs **34 adversarial checks — all pass**: cross-tenant reads return zero rows
rather than errors, cross-tenant writes affect zero rows, forged `user_id` inserts are
rejected, `scan_events` cannot be fabricated from a browser JWT, `daily_salts` is
unreachable, and the security-definer functions are not executable by `authenticated`.
The cron fires locally against the real project and lands four `cron_runs` rows.

**Tooling added:** `tools/migrate.mjs` (checksummed, forward-only, refuses to run an
edited migration), `tools/verify-rls.mjs`, `tools/reset-db.mjs`, `tools/query.mjs`.

---

## Phase 2 — Link creation · **M** · ✅ **complete**

**Goal:** a signed-in user can create, edit, disable, and delete links.

- [x] Supabase Auth: signup, login, logout, session persistence, password reset, email callback
- [x] Protected dashboard layout, middleware session refresh, route guards
- [x] Worker JWT middleware — `jose` + remote JWKS, **algorithm pinned to ES256** so the HS256 `anon`/`service_role` API keys can never authenticate as a user
- [x] `POST /api/links` · `PATCH /api/links/:id` · `DELETE /api/links/:id`
- [x] Slug generator (crypto random, no ambiguous glyphs), 60-word reserved list, collision retry on the unique constraint
- [x] URL validation: scheme allow-list; private, loopback, link-local, CGNAT and metadata addresses blocked, **including their decimal, octal, hex and IPv4-mapped-IPv6 spellings**; embedded credentials blocked
- [x] Links list, create dialog, edit dialog, active toggle, filter
- [x] Copy-to-clipboard with an execCommand fallback for non-secure origins
- [x] Delete guard: a link with QR codes needs explicit confirmation, and offers "turn off instead"

**Acceptance — met.** 38 unit tests, plus `tools/test-api.mjs` running **46 end-to-end
checks** against the live Worker and the real Supabase project. Verified by hand in
Chrome: sign in, create, toggle off, toggle on, and a rejected private-IP edit surfacing
the Worker's message in the dialog. No console errors.

**Note on the tenant boundary here:** inside the Worker, RLS is off — `service_role`
bypasses it. Every ownership check in `routes/links.ts` is a hand-written `user_id=eq.`
filter, so the cross-tenant cases in `test-api.mjs` are testing the code, not the
database.

---

## Phase 3 — Redirect engine · **M** · ✅ **complete**

**Goal:** the core product. Fast, cached, correct.

- [x] Hostname + slug parsing, with the hostname resolved against `domains` first
- [x] KV read-through cache, plus the `null` sentinel for unknown slugs
- [x] Validation chain in order: hostname active → slug resolves → domain still active → `is_active` → not expired → not flagged
- [x] `302` to destination — never `301`, which the scanner's browser would cache forever
- [x] Branded pages for **every** failure: not found, turned off, expired, flagged, and service-unavailable
- [x] Write-through cache invalidation wired into the phase 2 write endpoints
- [x] Dashboard copy stating edits propagate within ~60s, in the edit dialog itself
- [x] `Server-Timing` on every response, and a measured latency run in `tools/test-redirect.mjs`
- [x] `robots.txt` disallowing crawlers, `favicon.ico` → 204, branded page at the bare hostname
- [x] `Referrer-Policy: no-referrer` so the short URL never leaks into the destination's analytics

**Acceptance — met.** 10 unit tests on the validation chain plus **34 end-to-end checks**
against the live Worker, KV and Postgres. Warm-cache resolve measured at **p50 3 ms,
p95 4 ms** (local Miniflare KV — directionally right, not a production number). Disabled,
expired, flagged, deleted and unknown slugs each render their own page, verified in a
browser.

**A hostname allow-list was added that the design did not specify.** On a cache miss the
Worker checks the request hostname against a 5-minute cached set of active domains before
touching Postgres. Without it, a flood of requests carrying random `Host` values would
each write a distinct negative-cache sentinel and exhaust the free tier's 1,000 KV writes
per day. It also means a spoofed `Host` is refused without a database round trip.

**Two things the design specified that reality would not allow, both documented in code:**
KV rejects any `expirationTtl` below 60s, so the negative cache is 60s and not the
specified 30s; and a link's expiry is evaluated at read time from the cached record, so
expiry needs no invalidation at all.

---

## Phase 4 — QR generation · **M** · ✅ **complete**

**Goal:** downloadable, styled, scannable QR codes. First fully demonstrable build.

- [x] Client-side QR generation — no server round trip, and nothing stored, because the code is derivable from the short URL. This is why there is no object-storage line item.
- [x] Style controls: colours, module shape, finder shape, error-correction level, quiet zone, logo
- [x] Live preview, updating as you change anything
- [x] Download as PNG (512 / 1024 / 2048) and SVG
- [x] Persist style to `qr_codes` with `locked_domain_id`
- [x] Domain-lock warning stating the exact address the image encodes
- [x] A scannability panel that reports module count, recovery budget, contrast ratio, and every constraint being hit

**Acceptance — met, and more strictly than specified.** Instead of scanning one file with
a phone, `tools/render-qr-fixtures.mjs` renders **49 style-and-size combinations through
the shipped renderer** and `tools/test-qr.mjs` puts every one through a real decoder
(jsQR). All 49 decode back to their own short URL. The browser's own canvas
rasterisation was then verified in Chrome at 512, 1024 and 2048 px on the riskiest style
— dots with ring finders — and all three decoded correctly.

**That test caught a real defect that eyeballing would not have.** Dot modules at
`r = 0.45` decoded at 256 px and failed at every larger size, because the alignment and
timing patterns were being drawn as separated dots. A decoder uses those to correct for
camera angle. The fix is in `qr.ts`: structural modules — finder, alignment and timing —
are always drawn solid, and only data modules carry the style. Dot radius went to 0.5
(tangent) for the same reason; every smaller value failed at some render size.

**Logo size is capped per error-correction level rather than trusted to the slider,** and
the cap is well under the theoretical budget because the recovery budget also has to
absorb print quality, glare and a crumpled poster.

---

## Phase 5 — Analytics collection · **M** · ✅ **complete**

**Goal:** every scan writes a rich, privacy-safe event without slowing the redirect.

- [x] `geo.ts` — `request.cf` extraction, with implausible RTT values discarded as measurement artefacts
- [x] `ua.ts` — device / OS / browser, language preferences ordered by q-value, UTM and referrer
- [x] `asn.ts` — organisation name → `network_type`, returning `unknown` rather than guessing
- [x] `bot.ts` — link-preview fetchers named individually, crawlers, automation, prefetch, non-navigation requests, datacentre origin
- [x] `hash.ts` — daily-rotating salted hash, read through KV
- [x] `analytics.ts` — enrichment and insert under `ctx.waitUntil()`
- [x] Local hour and weekday **in the scanner's timezone**, not the account owner's
- [x] `is_first_scan` resolved by a BEFORE INSERT trigger — one round trip, and race-free in a way a read-then-insert is not
- [x] `Sec-GPC` and `DNT` honoured

**Acceptance — met.** 48 unit tests plus **42 end-to-end checks** driving real scans at
the running Worker and reading back the stored rows. Verified: Android reports its real
model and iOS does not; carrier name and `network_type` populated from `asOrganization`;
WhatsApp, Googlebot and curl each flagged with their own reason while a real browser is
not; **no raw IP anywhere in the row**; repeat visits resolve first-versus-returning
correctly and eight concurrent scans produce at most one "first". Redirect latency
unchanged at p50 3 ms — and separately proven to be off the critical path by measuring
it against a live Supabase round trip.

**Two defects the tests caught.** Telegram's real user agent is
`TelegramBot (like TwitterBot)`, so every Telegram share was being attributed to Twitter
until the pattern order was fixed. And `waitUntil` inserts land out of order, which the
first version of the harness assumed they would not.

**What GPC actually does here,** because "honoured" is doing a lot of work in most privacy
policies: the scan is still counted, but with no visitor hash (so no unique-visitor
attribution and no first-versus-returning), no postal code, no latitude or longitude, and
no raw user-agent string. What remains is aggregate by construction. The visible
consequence is that unique-visitor totals under-count, and phase 6 has to say so.

---

## Phase 6 — Analytics dashboard · **L** · ✅ **complete**

**Goal:** the payoff. Where the "why is Bitly charging for this" argument gets made.

- [x] Seven RPC aggregates, all `security invoker` so RLS runs before aggregation
- [x] Six stat tiles, each with the qualification printed under the number
- [x] Scans over time, hour/day/week/month, two series on **one** axis
- [x] Geography: country / region / city bar lists, choropleth, city overlay
- [x] Network: ISP name, connection type, edge location, protocol mix
- [x] Device, vendor, model, OS, browser, language
- [x] Referrer and full UTM breakdown
- [x] Time-of-day heatmap in the scanner's local timezone
- [x] Filters for range, link, country, region, city, device, OS, browser, network, ISP and all three UTM fields — shown as removable chips, so a narrowed dataset is never invisible
- [x] Bot include/exclude toggle
- [x] Accuracy caveats rendered beside the data they qualify, never in a settings page

**Acceptance — met.** Verified in the browser against 6,000 seeded events: the bot toggle
moves the headline from 4,890 to 6,000, clicking a country narrows it to 3,083 and raises
a removable chip. `tools/test-analytics-rpc.mjs` runs **35 checks** with two real accounts.

**Open question 4 resolved: Natural Earth 110m topology, self-hosted, no library.** 105 KB
of public-domain geometry in `public/geo/`, projected with `d3-geo` into inline SVG and
fetched at render time so it never enters the bundle for people who only look at the link
list. No tile server, no API key, nothing metered. A hosted map would have put a
third-party bill on the critical path of the one claim this project exists to make.

**The colour is validated, not chosen.** Series slots and the sequential ramp come from
the reference palette and were run through the palette validator against this app's own
light and dark surfaces — six checks, both modes, worst adjacent CVD ΔE 24.7 / 26.8
against a floor of 8. The ramp is a single hue because every scale that uses it encodes
magnitude.

**Three defects found by looking at the rendered output rather than the code.** The United
Kingdom never appeared on the map, because CLDR gives the withdrawn code `UK` the same
display name as `GB` and it was overwriting the canonical entry — the generator now
carries a withdrawn-code deny list and spot-checks eighteen mappings, failing rather than
emitting a quietly wrong file. The heatmap collapsed 24 hour columns into eight, because
most hour headers are deliberately blank and an auto table layout sizes columns to their
content. And the seeder was picking a UTC hour and letting each timezone land where it
fell, which flattened the local-time heatmap into noise — precisely the failure that chart
exists to avoid.

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
