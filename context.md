# QRly — Project Context

> Single source of truth for decisions, scope, and architecture.
> Last updated: 2026-08-29 · Status: **built.** Phases 0–6, 9 and 10 complete; 7–8 blocked on a domain.

---

## 1. What this is and why

A self-hosted dynamic QR code and short-link platform. A QR code is printed once and
encodes a permanent short URL; the destination behind that URL stays editable forever.

**The actual goal is a demonstration.** The point is to show that the entire thing —
servers, database, auth, CDN, SSL, custom domains, analytics — runs on free tiers, and
that incumbents charge thousands of dollars a year for it. The build is a proof, not a
business. Scope decisions below consistently favour "cheap, simple, and provably free"
over "scales to a million users."

Target size: **1,000–2,000 users.** Explicitly not designed beyond that.

---

## 2. Current status

| Item | State |
|---|---|
| Code | Built and tested. `plan.md` records what each phase actually proved. |
| `backend/` | Worker: redirect engine, privileged API, analytics pipeline, scheduled jobs |
| `frontend/` | Dashboard: auth, links, QR studio, analytics, settings, privacy, cost page |
| Supabase project | Live — ref `qragyngjqlizazdkaowa`, 7 migrations applied |
| Supabase keys | Present in `.env` (anon + service_role, both verified valid) |
| Postgres password | Present in `supabase.md`. **Use the session pooler string** — the direct host is IPv6-only. |
| Domain | **Not purchased** — blocks phases 7 and 8, and nothing else |
| Cloudflare account | None yet — everything runs and is tested locally; only deployment is blocked |

---

## 3. Locked stack decisions

| Layer | Choice | Note |
|---|---|---|
| Dashboard | Next.js + TypeScript | Deployed as a Worker via the OpenNext Cloudflare adapter, not Pages |
| API + redirect engine | Hono + TypeScript on Cloudflare Workers | |
| Database | Supabase PostgreSQL | Free tier, 500 MB |
| Auth | Supabase Auth | Free tier, 50k MAU |
| Slug cache | Cloudflare Workers KV | Read-through, invalidated on edit |
| Custom domain SSL | Cloudflare for SaaS (Custom Hostnames) | 100 hostnames free |
| Analytics write | `ctx.waitUntil()` direct insert after response | No queue |

**Rejected for scale reasons (not needed at 2k users):** Cloudflare Queues, Durable
Objects, table partitioning, pre-aggregated rollup tables, Cloudflare Analytics Engine.

---

## 4. Architecture

### Redirect hot path

```
QR scan → GET https://<hostname>/<slug>
  ↓
Cloudflare Worker (nearest edge colo)
  ↓
resolve hostname → domain record   (KV, fallback Supabase)
resolve slug     → link record     (KV, fallback Supabase)
  ↓
validate: link exists, is_active, not expired, destination safe
  ↓
302 Location: <destination>        ← response sent HERE, nothing blocks it
  ↓
ctx.waitUntil( enrich + insert scan_event )   ← runs after response
```

The redirect must never wait on the analytics write. KV keeps the lookup at edge
latency instead of a cross-region round trip to Supabase.

### Routing split

Dashboard and redirect engine live on **separate hostnames** so that dashboard routes
never collide with slugs and every dashboard path doesn't become a reserved word:

- `app.<domain>` → Next.js dashboard
- `<domain>` + all custom hostnames → Worker

Until a domain is purchased, development runs on `*.workers.dev`.

---

## 5. Data model (outline, not final DDL)

### `profiles`
Extends `auth.users`. `id` (FK → auth.users), `email`, `display_name`,
`retention_days` (configurable purge window), `created_at`.

### `domains`
`id`, `user_id`, `hostname`, `is_custom`, `verification_status`
(pending / verifying / active / failed), `cf_custom_hostname_id`, `cname_target`,
`dns_verified_at`, `ssl_status`, `created_at`.
Unique on `hostname`.

### `links`
`id`, `user_id`, `domain_id`, `slug`, `destination_url`, `title`, `is_active`,
`expires_at`, `safe_browsing_status`, `safe_browsing_checked_at`, `created_at`,
`updated_at`.
**Unique on `(domain_id, slug)` — this is the hot-path index.**

### `qr_codes`
`id`, `link_id`, `user_id`, `style` (jsonb: fg/bg colour, logo, module shape, ECC
level), `locked_domain_id`, `created_at`.

`locked_domain_id` exists because **a printed QR binds to a domain permanently.** Once
generated, the encoded hostname can never change or every printed code breaks. The UI
must make this explicit and the old hostname must stay alive forever.

### `scan_events`
The wide table. Full column inventory in section 6.

### `daily_salts`
`date` (PK), `salt`. Rotates every 24h to power the privacy-safe visitor hash.

### Indexes
- `links (domain_id, slug)` unique — every redirect hits this
- `scan_events (link_id, created_at desc)`
- `scan_events (user_id, created_at desc)`
- `scan_events (created_at)` — for the retention purge sweep
- `domains (hostname)` unique

### RLS
Enabled on every table, keyed on `auth.uid() = user_id`. `scan_events` is
select-only for the owner — inserts come from the Worker using the service_role key,
which bypasses RLS by design. **The service_role key lives only in Worker secrets and
never reaches the browser.**

---

## 6. Analytics — what we can actually capture

Priority per the brief: **IP-derived geolocation is what matters most.** Everything
else is a bonus. All of the following is available server-side on a plain 302 with no
JavaScript and no consent prompt.

### From `request.cf` (Cloudflare edge)
| Field | Example | Note |
|---|---|---|
| `country` | `IN` | ISO 3166-1 alpha-2 |
| `city` | `Pune` | |
| `region` / `regionCode` | `Maharashtra` / `MH` | |
| `postalCode` | `411001` | |
| `continent` | `AS` | |
| `latitude` / `longitude` | `18.5204` / `73.8567` | **City centroid, not the user** |
| `timezone` | `Asia/Kolkata` | IANA — powers local-time analysis |
| `asn` | `24560` | |
| `asOrganization` | `Bharti Airtel` | ISP / carrier name |
| `colo` | `BOM` | CF datacenter — good network-proximity proxy |
| `isEUCountry` | `1` | Useful for GDPR gating |
| `httpProtocol` | `HTTP/3` | |
| `tlsVersion` / `tlsCipher` | `TLSv1.3` | |
| `clientTcpRtt` | `42` | Connection quality in ms |

### From request headers
- `CF-Connecting-IP` — true client IP. **Hashed, never stored raw.**
- `User-Agent` — parsed into browser name + version, OS name + version, device type
  (mobile / tablet / desktop), device vendor, device model, rendering engine
- `Accept-Language` — ordered language and locale preferences
- `Referer` — usually absent on a camera-app QR scan, present on shared links.
  Its absence is itself a useful signal (true scan vs forwarded link)
- `Sec-Fetch-Dest` / `Mode` / `Site` — navigation vs prefetch vs iframe; strong bot signal
- `Sec-CH-UA`, `Sec-CH-UA-Platform`, `Sec-CH-UA-Mobile` — Chromium only, partial
- `Sec-GPC` / `DNT` — Global Privacy Control; honoured

### From the URL
- hostname (platform domain vs which custom domain)
- slug → link_id, qr_id
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- arbitrary passthrough query params

### Derived server-side
- UTC timestamp
- **Local time-of-day and day-of-week in the scanner's own timezone** (via `cf.timezone`)
- `is_bot` flag
- `visitor_hash` = truncated `sha256(daily_salt + ip + user_agent + link_id)`
- `is_first_scan` for that visitor hash
- ASN classification: mobile carrier / broadband / corporate / datacenter (datacenter ⇒ bot)

### Honestly NOT available — do not promise these
- **Screen dimensions, viewport, colour depth, pixel ratio** — require JavaScript, which
  a 302 never runs. Dropped by decision; no interstitial page will be built.
- **Precise GPS location** — never. Geolocation is IP-derived and approximate.
- **Device model on iOS** — Apple reports only `iPhone` / `iPad`. Android usually gives
  the real model string. Dashboard must show this asymmetry honestly.
- Battery, RAM, CPU cores — require JavaScript.
- Any personal identity of the scanner.

### Accuracy caveat (must appear in the UI)
IP geolocation is approximate. VPNs, proxies, carrier-grade NAT on mobile networks, and
corporate egress routinely resolve to the wrong city or region. Lat/long is a **city
centroid**, so maps will be plotted jittered or as a region choropleth — never as a pin
implying a real position.

---

## 7. Dashboard reports to build

**Volume:** total scans · unique scans (daily-unique) · repeat rate · first vs returning
· scans over time (hour / day / week / month) · scan velocity and spike detection

**Geography:** country / region / city breakdown · choropleth map · jittered lat-long
scatter · timezone distribution · CF colo heat map

**Network** *(a genuine differentiator — paid tiers rarely expose this)*: ISP / carrier
via `asOrganization` · ASN breakdown · mobile vs broadband vs corporate · connection
quality via `clientTcpRtt` · HTTP protocol and TLS version mix

**Device:** device type · vendor · model (Android) · OS + version · browser + version ·
language and locale

**Acquisition:** referrer, including direct-scan vs shared-link · full UTM breakdown
across source, medium, campaign, term, content

**Time:** time-of-day **in the scanner's local timezone** (most tools wrongly show the
account owner's timezone) · day-of-week · heat map

**Quality:** bot vs human split with a toggle to include or exclude

**Filters:** date range · link · QR · domain · country · region · city · device type ·
OS · browser · UTM · bot inclusion

---

## 8. Explicitly out of scope

| Cut | Reason |
|---|---|
| Hosted microsites / landing pages / link-in-bio | Dropped by decision. It's a QR app, nothing else. An `event_type` column stays in `scan_events` so the distinction could return later at no cost. |
| Screen dimensions and any client-side JS capture | Not worth an interstitial page that slows every redirect. |
| Teams / organisations / member roles | Solo accounts only. |
| Queues, Durable Objects, partitioning, rollup tables | Unnecessary below ~1M events. |
| Horizontal scaling work | Deliberately out of scope. Free-tier ceilings in section 9 are the accepted limits. |

---

## 9. Free-tier budget

| Service | Free limit | Headroom at target scale |
|---|---|---|
| Supabase DB | 500 MB | ~1M scan events with indexes; retention purge keeps it under |
| Supabase Auth | 50,000 MAU | far beyond 2,000 users |
| Supabase projects | 2 active | fine |
| Workers | 100,000 req/day | 100k scans/day |
| Workers KV | 100k reads/day · 1k writes/day | **the binding constraint.** A cache fill is a write, so writes scale with *hot links*, not scans. At the 60-minute TTL roughly 42 links can stay continuously hot. Measured by `tools/check-ceilings.mjs`. |
| Pages | unlimited requests · 500 builds/mo | fine |
| Cloudflare for SaaS | 100 custom hostnames | 100 client domains, then $0.10/mo each |

**Running cost at target scale: $0/month**, excluding domain registration.

`tools/check-ceilings.mjs` measures these against the live database rather than asserting
them, and `/cost` publishes the comparison using each competitor's own published prices
with the date they were read.

### Known hazard — Supabase auto-pause
Free Supabase projects **pause after 7 days of inactivity**, which would kill the demo
precisely when someone finally looks at it. Mitigation: a Cloudflare Cron Trigger pings
the database daily. To be wired in during phase 1.

---

## 10. Custom domains (deferred — blocked on domain purchase)

The client-facing flow is deliberately trivial: add one DNS record, come back, click
Verify.

```
1. Client adds  qr.client.com  in the dashboard
2. We POST /zones/{zone}/custom_hostnames to the Cloudflare API
3. Dashboard shows:  CNAME   qr → cname.<our-domain>
4. Client adds that record at their own DNS provider
5. Client clicks Verify → we poll CF hostname status + do our own DNS lookup
6. Cloudflare validates over port 80 through that CNAME and issues the cert
7. Cloudflare auto-renews it forever
8. qr.client.com/ABC123 now routes to our Worker
```

**Important correction to the original assumption:** a CNAME alone is not sufficient. It
produces a TLS certificate error, because no certificate exists for `qr.client.com`.
Cloudflare for SaaS must register the hostname so a cert gets issued. This is one
automated API call and is invisible to the client — from their side it really is just
"add a CNAME and come back."

DNS only steers the hostname to our infrastructure. The Worker still performs every
lookup and every redirect.

### Edge cases to handle in the UI
- **Apex domains cannot take a CNAME** — requires ALIAS / ANAME / CNAME flattening
- **If the client's DNS is on Cloudflare, the record must be grey-cloud (unproxied)** or
  validation fails
- Free tier gives no wildcard hostnames and no custom CA — neither is needed

### Free-tier constraints confirmed
100 custom hostnames free on the Cloudflare Free plan, $0.10/month each beyond that.
Verified 2026-08-29 against Cloudflare for Platforms documentation.

---

## 11. Security, privacy, abuse

**Credentials.** `service_role` key lives only in Worker secrets. Never in the Next.js
client, never in a public env var, never in the repo. The browser only ever sees the
`anon` key, backed by RLS.

**Host header is untrusted input.** Every incoming hostname is resolved against the
`domains` table and rejected unless verified. Combined with Cloudflare for SaaS only
routing hostnames we registered, this closes the spoofed-Host hole.

**Open redirect and malicious destinations.** Scheme allow-list: `http`, `https`,
`mailto`, `tel`, `sms` only — `javascript:`, `data:`, `vbscript:` blocked outright.
Private and link-local IP ranges blocked. Google Safe Browsing check on create and on a
schedule. A kill switch swaps a flagged link to a warning page **without breaking the
printed QR**.

**IP handling.** Raw IP is never stored. Only a truncated `sha256(daily_salt + ip + ua +
link_id)`, where the salt rotates every 24 hours — so the hash cannot be reversed and
expires daily. This means "unique per day", not "unique per person forever", which is
the honest and defensible definition.

**Retention.** Configurable per account via `profiles.retention_days`, enforced by a
scheduled purge over the `scan_events (created_at)` index.

**Bots.** Link-preview fetchers (WhatsApp, Slack, iMessage, Facebook) are recorded but
flagged, and excluded from headline metrics by default — otherwise a single WhatsApp
share inflates an entire campaign. Dashboard toggle to include them.

**Rate limiting.** Per-IP-hash and per-link caps to blunt scan flooding.

**Privacy signals.** `Sec-GPC` and `DNT` are honoured.

---

## 12. Build phases

| # | Phase | Status |
|---|---|---|
| 0 | Scaffold — tooling, wrangler, Next.js, shared types | Ready |
| 1 | Supabase schema, RLS, auth, keep-alive cron | Ready |
| 2 | Dashboard auth + link CRUD | Ready |
| 3 | Worker redirect engine + KV cache | Ready |
| 4 | QR generation and download | Ready |
| 5 | Analytics collection | Ready |
| 6 | Analytics dashboard | Ready |
| 7 | Custom domain DNS verification | **Blocked — needs domain** |
| 8 | Cloudflare for SaaS hostname + SSL | **Blocked — needs domain** |
| 9 | Security, privacy, abuse prevention | Ready |
| 10 | Production hardening | Ready |

Phases 0–6 and 9–10 can all proceed on `*.workers.dev` with no domain. Only the custom
domain phases are gated.

---

## 13. Open items

1. **Domain not purchased.** Blocks phases 7–8 only. Development proceeds on
   `*.workers.dev` until then. Short URLs will be long and ugly in the interim but
   functionally identical.
2. **Cloudflare account not confirmed.** Needed before phase 3 deployment. The zone must
   be on Cloudflare for custom hostnames to work later.
3. ~~**Next.js deploy target undecided.**~~ Resolved: the OpenNext Cloudflare adapter,
   deploying the dashboard as a Worker. `next-on-pages` is effectively in maintenance and
   nothing here uses Cloudflare Pages.
4. ~~**`.gitignore` does not exist and this is not yet a git repo.**~~ Resolved: one
   repository at `github.com/HK-0811/QRly`, holding both apps. `.env`, `supabase.md`,
   `backend/.dev.vars` and `frontend/.env.local` are ignored, and `tools/test-security.mjs`
   asserts no secret reaches a build artefact.

---

## 14. Credentials inventory

Secrets are **not** reproduced here. Locations only.

| Secret | Location | Verified |
|---|---|---|
| `SUPABASE_ANON_KEY` | `.env` | Yes — role `anon`, ref `qragyngjqlizazdkaowa` |
| `SUPABASE_SERVICE_KEY` | `.env` | Yes — role `service_role`, same ref |
| Postgres host / user / password | `supabase.md` | Present |

**Project ref:** `qragyngjqlizazdkaowa`
**Project URL:** `https://qragyngjqlizazdkaowa.supabase.co`

### Two gotchas on the Postgres connection
- The password contains a literal `@`, so it **must be percent-encoded** (`@` → `%40`)
  anywhere it is used inside a connection URI, or it fails with a misleading DNS error.
- Direct `db.<ref>.supabase.co:5432` connections are IPv4-deprecated on newer Supabase
  projects. The **pooler** connection string may be required instead. To verify in phase 1.
