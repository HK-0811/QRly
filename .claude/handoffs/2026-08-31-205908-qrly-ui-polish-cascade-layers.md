# Handoff: QRly — The Colours Were Wrong Because of Cascade Layers, Not Components

## Session Metadata
- Created: 2026-08-31 20:59:08
- Project: X:\Projects\qrify
- Branch: main
- Remote: https://github.com/HK-0811/QRly.git
- Session duration: ~3 hours

### Recent Commits (for context)
  - c0bc667 Handoff: rename to QRly, monorepo push, deployment, apex merge
  - a79249d Serve the dashboard from qrly.lol, not app.qrly.lol
  - 19d0b27 Give the dashboard its own route on qrly.lol
  - 19f96ec Point production at qrly.lol and fix what broke the first CI deploy
  - 27aa000 Set the repo up for deployment from git (Workers Builds)

**Still nothing is committed.** The tree now carries *two* sessions of uncommitted
work — the previous session's rebuild and this session's fixes on top of it.
58 dirty paths.

## Handoff Chain

- **Continues from**: [2026-08-30-162535-qrly-redesign-anonymous-flow.md](./2026-08-30-162535-qrly-redesign-anonymous-flow.md)
  - Previous title: QRly — Redesigned, and Signup Is No Longer a Gate
- **Supersedes**: nothing. Both prior handoffs remain accurate. This one closes
  the previous handoff's step 1 ("Look at it") and nothing else.

> The previous handoff is still the record of the anonymous flow, the migrations
> and the deployment. Read this one for what the screens actually looked like
> when somebody finally rendered them, and why.

## Current State Summary

The previous session built the redesign and shipped it untested — its own words:
*"Nothing has been visually reviewed. No screen has been looked at by a human or
an agent."* This session looked at it.

The user opened by reporting one symptom: the landing page's "Get the Code"
button was black and turned orange on hover. That turned out to be the visible
edge of a **systemic CSS defect** — `globals.css` wrote its base element rules
*outside any cascade layer*, and in Tailwind v4 unlayered CSS outranks every
utility in `@layer utilities`. Two rules were silently overriding the whole
product: `input,button,select,textarea { color: inherit }` beat `text-white`, so
**every primary button rendered near-black type on a near-black ground and had no
visible label**; and `a { color: var(--accent) }` beat every text colour utility,
so **every anchor in the app rendered vermilion** regardless of what it asked for.
Neither was reachable by editing the component that looked wrong.

That was fixed, along with a contrast floor problem (the ink ramp bottomed out at
2.81:1, where every caption and hint lived), a missing focus system
(`input:focus { outline: none }` with nothing put back), six instances of invalid
`<Link><Button></Link>` nesting, and four hand-rolled copies of the button recipe.

Then the user raised a second, unrelated problem: **the word "code" was naming
three different things** — the QR code, the URL slug, and (on `/cost`) the source
repository. All copy was rewritten to one name per object.

Everything typechecks, lints and builds. 172/172 backend tests pass. The landing,
create, auth, cost and privacy screens have now been rendered and inspected in
Chrome. The dashboard screens have **not** — they need a login.

## Codebase Understanding

### Architecture Overview

Unchanged from the previous handoff. Nothing structural moved this session; the
work was entirely in the presentation layer plus one backend copy change.

The one architectural thing worth recording is the CSS layer model, because it is
invisible and it silently governs every style in the frontend:

```
@import 'tailwindcss'  ->  @layer theme, base, components, utilities;

  :root { --tokens }        <- UNLAYERED on purpose (nothing competes)
  @layer base       { * html body h1-h3 p a input/button/select/textarea
                      :focus-visible ::selection }
  @layer components { .tabular .numeral .eyebrow .hairline .focus-frame
                      .animate-rise .stagger .skeleton }
  @media (prefers-reduced-motion) { ... !important }   <- beats layers by design

  Tailwind utilities land in @layer utilities and therefore win over all of it.
```

**Anything written unlayered in `globals.css` outranks every Tailwind class in
the product.** That is the trap this session was spent climbing out of. If a
future change adds a bare element rule to that file, it will re-break colour
across the app in a way that looks like a component bug.

### Critical Files

| File | Purpose | Relevance |
|------|---------|-----------|
| `frontend/src/app/globals.css` | **Rewritten this session.** Tokens, the three cascade layers, motion | The header comment on `@layer base` explains the whole defect. Read it before touching this file. |
| `frontend/src/components/ui/index.tsx` | The primitive library. Now exports `buttonClass`, `segmentClass`, `chipClass`, `InlineLink` | The `Button` comment block documents why the old hover was wrong, with the measured contrast numbers. |
| `frontend/src/components/chrome.tsx` | `Mark`, `Wordmark`, `GridGround`, `Screen`, `GUTTER` | `CursorGrid` now carries `suppressHydrationWarning` — see Gotchas. |
| `frontend/src/components/create/create-flow.tsx` | The three-phase create flow | The "More options" panel is where the "code" collision was worst. |
| `backend/src/lib/pages.ts` | Scanner-facing error pages | Only backend file touched, and copy only. `backend/test/failure-modes.test.ts:87` asserts on its wording — see Gotchas. |
| `backend/src/lib/cloudflare.ts` | Cloudflare for SaaS client | Not touched, but read closely for the custom-domain answer. Its own header says it has **never run against the real API**. |
| `backend/src/routes/domains.ts:55` | `cnameTarget()` returns `PLATFORM_HOSTNAME` | Customers are told to CNAME at the zone apex. Works, but see Deferred. |
| `dev.bat` | **New.** Starts both dev servers in two labeled windows | **Gitignored** (`.gitignore:56`). See Gotchas. |
| `flow.md` | The user flow spec | Also gitignored (`.gitignore:57`). Still uses the old "code" vocabulary — see Deferred. |

### Key Patterns Discovered

- **In Tailwind v4, unlayered beats layered, and specificity is never compared
  across layers.** A `.text-white` class loses to a bare `button { }` rule if the
  latter is unlayered. This is the single most important thing learned this
  session and it is not intuitive.
- **A symptom in one component can have its cause in the stylesheet.** The user
  reported a button. The cause was a global rule affecting every button and every
  anchor in the product. When a colour looks wrong, check the computed style and
  which rule won *before* editing the component.
- **`getComputedStyle` in the browser is the fastest way to settle a CSS
  argument.** Reading the source suggested `.text-white` should win on
  specificity; the browser said the colour was `rgb(10,10,10)`. The browser was
  right and the reasoning was wrong.
- **Terminology collisions hide in plain sight.** "Code" read fine in every
  individual string. It only became visibly broken when the strings were listed
  together — `grep` for the noun and read the results as a set.
- **The user reviews visually and reports precisely.** Both problems this session
  came from them looking at the screen. Both were real, and both were bigger than
  the report suggested. Take their UI observations seriously and look for the
  general case.

## Work Completed

### Tasks Finished

- [x] Rendered and inspected the landing, create, login, signup, cost pages in Chrome
- [x] **Found and fixed the cascade-layer defect** — base rules into `@layer base`, component classes into `@layer components`
- [x] Fixed the primary button hover: `--accent-dim` (60% alpha, salmon, 2.7:1) → full-strength accent with white type (4.8:1)
- [x] Re-spaced the ink ramp so all four text steps clear 4.5:1; added an explicit glyphs-only step
- [x] Replaced `input:focus { outline: none }` with a `:focus-visible` system plus `.focus-frame` for wrapped fields
- [x] Exported `buttonClass()` and removed 4 hand-rolled copies of the primary button
- [x] Added `segmentClass()` (3 copies, none handling the abutting-border seam) and `chipClass()` (2 copies)
- [x] Added `InlineLink` and a `ghost-danger` button variant (replacing two `!important` overrides)
- [x] Fixed 6 × `<Link><Button></Link>` and 1 × nested `role="menuitem"` — invalid interactive nesting
- [x] Fixed two dead rules: `hover:opacity-100` with no resting opacity; a hover wash 1% off white
- [x] Polish pass: staggered hero entrance, press scale 0.96, 40px dense-control floor, cross-faded copy icon, `text-wrap` defaults, one motion curve, one float shadow
- [x] Fixed the hydration mismatch the cursor-grid script logged on every page load
- [x] Gave the auth cards an opaque ground (the grid was showing through the form)
- [x] **Rewrote all "code" copy** across 20 files + the scanner pages — one name per object
- [x] Created `dev.bat` and verified it end to end
- [x] Diagnosed the Worker "hang" (duplicate wrangler sessions, orphaned `workerd`)
- [x] Researched and wrote up the Cloudflare for SaaS custom-domain requirements

### Files Modified

Roughly 30 frontend files, 1 backend file, 1 new root file. Grouped by why:

All paths below are relative to `frontend/src/` unless the row says otherwise.

| Area | Files | Change |
|------|-------|--------|
| **The layer fix** | `app/globals.css` | Base rules → `@layer base`, component classes → `@layer components`. Ink ramp re-spaced for contrast. New tokens: `--accent-strong`, `--accent-fill`, `--accent-tint`, `--surface-hover/press`, `--shadow-float`, `--ease`, `--dur*`. `.press` deleted (dead). |
| **Primitives** | `components/ui/index.tsx` | `buttonClass`, `segmentClass`, `chipClass`, `InlineLink`, `ghost-danger`, `Spinner tone`, `Input` focus + 44px, `Sparkline`, `StatTile` skeleton sizing |
| **Button call sites** | `app/page.tsx`, `app/(dashboard)/layout.tsx`, `app/create/design/page.tsx`, `app/(auth)/signup/page.tsx`, `app/(auth)/forgot-password/page.tsx`, `components/landing/hero-form.tsx`, `components/create/create-flow.tsx`, `components/links/links-screen.tsx` | Use `buttonClass`; unnest `<Link><Button>` |
| **Segmented / chips** | `components/analytics/filter-bar.tsx`, `components/links/link-detail.tsx`, `components/qr/qr-studio.tsx`, `components/settings/settings-form.tsx` | Use `segmentClass` / `chipClass` |
| **Interaction polish** | `components/nav-link.tsx`, `components/copy-button.tsx`, `components/sign-out-button.tsx`, `components/links/link-row.tsx`, `components/chrome.tsx` | Hit areas, press states, cross-fade, `suppressHydrationWarning` |
| **Auth cards** | all four `app/(auth)/*/page.tsx` + `app/(auth)/layout.tsx` | `bg-[var(--bg)]`, `InlineLink`, staggered entrance, "Forgot?" hit area |
| **Copy — "code"** | ~20 files across `app/` and `components/`, plus `backend/src/lib/pages.ts` (repo-root path) | One name per object (see Decisions) |
| **Docs pages** | `app/cost/page.tsx`, `app/privacy/page.tsx` — plus `backend/src/lib/pages.ts` | Chrome link hit areas; *"The code is here to be read"* → *"The source is here to be read"* |
| **New** | `dev.bat` (root) | Two-window dev launcher with dependency, env-file and port checks |

### Decisions Made

| Decision | Options Considered | Rationale |
|----------|-------------------|-----------|
| Base rules into `@layer base` | Raise specificity on the utilities; use `!important` | Layers are the actual mechanism. Fighting specificity would have left the trap in place for the next rule someone adds. |
| Primary hover = full accent, white label | Keep the tint but darken the text; hover to `--accent-600` | The design's stated intent was "the accent arrives as a surface." Full strength delivers that *and* passes AA at 4.8:1. The tint could not carry any label legibly. |
| Re-space the ink ramp downward, keep four steps | Collapse to three; leave it and accept the contrast | The hierarchy was right, the values were too light. Re-spacing preserves the design and fixes legibility without a redesign. |
| `--text-ghost` is a **glyph** colour, documented as not-for-words | Delete it; raise it to pass AA | The arrows and dividers genuinely want to be faint. Naming the constraint stops it being reached for as text. |
| Export class recipes rather than force `<Button>` everywhere | Wrap anchors in a `<Button asChild>` | `next/link` anchors and layout-owning submit buttons cannot be a `<button>`. A recipe an anchor can wear is the only thing that covers all of them. |
| One dense-control floor of 40px | 36px to match the old visual weight | The skill guidance is ≥40 for dense desktop, 44 for touch. One number is easier to hold than two, and these forms get used on phones. |
| **"QR code"** for the artefact | Keep bare "code"; use "QR" everywhere | Bare "code" reads as verification/promo code to a first-time visitor, and collided with the slug. |
| **"link ending" / "custom ending"** for the slug | "short code" (status quo); "slug"; "back-half" | "Short code" *is* the collision. "Ending" is plain and describes what it is. "Slug" is jargon. |
| Did **not** submit the create form | Run the flow end to end | Dev points at the **live Supabase**; submitting writes a real row. Not mine to do unasked. |
| Did **not** touch Cloudflare | Configure the token/zone | The user's infrastructure, no credentials, and the previous handoff says ask first. |

## Pending Work

### Immediate Next Steps

1. **Commit. Two sessions of work are uncommitted and unprotected.** This is now
   the single largest risk in the project. Suggested split:
   - migrations + backend anonymous surface + tests *(previous session)*
   - design system + public screens *(previous session)*
   - dashboard screens *(previous session)*
   - **the cascade-layer fix + UI polish** *(this session)*
   - **the "code" → "QR code" copy pass** *(this session)*
2. **Look at the dashboard screens.** `/links`, `/links/[id]`, `/analytics`,
   `/domains`, `/settings` have never been rendered by anyone — they need a
   login, which this session did not have. They received substantial edits
   (`segmentClass`, `chipClass`, hit areas, the `MenuItem` rewrite) and the
   `MenuItem` link/button switch in particular is unexercised.
3. **Custom domains.** The user asked what to do; the full answer is in this
   session's final message. Short version: enable Cloudflare for SaaS on the
   `qrly.lol` zone → add a proxied dummy DNS record (`AAAA fallback 100::`) →
   set it as the Fallback Origin → create a token scoped
   `Zone → SSL and Certificates → Edit` → `wrangler secret put
   CLOUDFLARE_API_TOKEN --env production` and the same for `CLOUDFLARE_ZONE_ID`.
   Verify the token with a bare `curl` to `/custom_hostnames` **before** wiring it in.
4. **Supabase → Authentication → URL Configuration.** Still `localhost:3000`.
   Unchanged from both previous handoffs and still blocking email confirmation,
   password reset, and the claim flow end to end.
5. **Mobile.** Still unverified — see Blockers.

### Blockers/Open Questions

- [ ] **Nothing is committed.** Two sessions deep now.
- [ ] **Mobile is still unverified.** `resize_window` reported success but the
      viewport never changed (`window.innerWidth` stayed 1526), so no narrow
      layout was ever rendered. Chrome DevTools device emulation or a real phone
      is needed. The responsive classes are all present; none have been seen.
- [ ] **The dashboard screens have never been rendered.** Needs a login.
- [ ] **`backend/src/lib/cloudflare.ts` has never run against the real API.** Its
      own header says so. The first custom domain is also its first live call.
- [ ] **Supabase Auth URL configuration.** Dashboard-only.
- [ ] Everything still open from the previous handoffs: over-scoped Cloudflare
      token, stale `qr.himanshukotkar.tech` domains row, Namecheap parking A
      record, the stray `an-1787955871727@qrify.test` account.

### Deferred Items

- **`flow.md` still uses the old vocabulary** ("short code", bare "code"). The
  product and its spec now disagree. Offered to the user; not yet taken up.
  Note it is gitignored, so it lives only on this machine.
- **The CNAME target is the zone apex.** `cnameTarget()` returns
  `PLATFORM_HOSTNAME`, so customers CNAME at `qrly.lol` itself. This *works*, but
  Cloudflare recommends a dedicated target (`customers.qrly.lol`) so that
  changing the apex's records later does not drag every customer domain with it.
  One-line change plus a DNS record; cheapest to do now at zero customers.
- Renaming `backend/` and `frontend/`. Still cosmetic, still deferred.
- A dark palette. Still explicitly rejected.

## Context for Resuming Agent

### Important Context

**THE CASCADE-LAYER RULE IS THE THING TO REMEMBER.** `frontend/src/app/globals.css`
now has three regions: unlayered `:root` token blocks, `@layer base`, and
`@layer components`. **Do not add a bare element selector outside a layer.** If
you do, it will beat every Tailwind utility in the product and the damage will
present as unrelated components having the wrong colour. The header comment above
`@layer base` explains this with the two real examples; leave it there.

**The user reviews visually, and their reports understate the problem.** Twice
this session they pointed at one small thing and it turned out to be systemic.
When they say a colour is off, verify in the browser with `getComputedStyle` and
find which rule won — do not go straight to the component.

**The dev environment points at the live Supabase.** Submitting the create form,
signing up, or deleting anything in the UI writes to the real database. The
previous session did this deliberately and cleaned up afterwards. **Ask before
doing it.** This session declined to and said so.

**Ask before touching the user's infrastructure.** Held from the previous
handoff and reaffirmed: this session researched the Cloudflare setup and wrote up
the steps but changed nothing, because it is their account.

**The user is learning this stack.** Still true across three sessions. When
something is non-obvious — why unlayered CSS beats a utility, why a CNAME alone
gives a TLS error — explain the mechanism rather than just applying the fix.

### Assumptions Made

- The design language (vermilion accent, zero radius, hairline rules, light-only)
  is settled. This session polished within it and changed no design decisions.
- The accent stays out of the categorical viz palette. It is spent on the
  single-series sparkline and the single-series scans chart only, which is
  documented in `Sparkline`'s comment.
- The validated `--viz-series-*` and `--viz-ramp-*` values were not touched. Only
  `--viz-muted` (axis labels, `#9a9a9a` → `#767676`) changed, and that is not a
  series colour.
- 40px is the dense-control floor and 44px the field floor across the product.
- Inline prose links (the citations on `/cost`) keep their natural line-box
  height. Padding them to 40px would make adjacent lines' hit areas overlap.

### Potential Gotchas

- **`next build` kills a running `next dev`.** It rewrites `.next` underneath it
  and the dev server starts returning 500. Stop the dev servers before building.
  This happened once this session and looked like a code failure.
- **Killing wrangler leaves orphaned `workerd.exe` processes**, and they respawn
  if the wrangler parent is still alive. The result is a Worker that logs
  `Ready on http://127.0.0.1:8787` while every request hangs, because a stale
  process holds the port. Kill the wrangler node parents *first*
  (`Get-CimInstance Win32_Process ... CommandLine -like '*wrangler*'`), then
  `taskkill /IM workerd.exe /F`. `dev.bat`'s port check exists to catch this.
- **`dev.bat` is gitignored** (`.gitignore:56`, sitting next to `flow.md`). The
  ignore entry predates the file, so it looks deliberate — a local-only
  launcher. It will not survive a fresh clone. Left as-is rather than "fixed".
- **`backend/test/failure-modes.test.ts:87` asserts on scanner-page copy** — it
  matches the substring `'turned off'`. This session's rewrite happened to keep
  that phrase ("This QR code has been turned off"), so it still passes, but a
  further edit to those headings can break a test that lives nowhere near
  `pages.ts`. There is no `pages.test.ts`; that one assertion is the only
  coverage of this copy.
- **Five pre-existing `tsc` errors in `backend/test/dns.test.ts`** remain, and
  they are the *only* backend type errors — verified this session. Vitest does
  not typecheck.
- **The Worker returns `404` on `/`, and that is correct** — it is the "Nothing
  to redirect to" page. Do not read it as a failure.
- **`suppressHydrationWarning` on `#qrly-cursor-grid`** is load-bearing. The
  inline decoration script mutates that node's style before React hydrates. Do
  not remove it without moving the mask into component state, which would make
  the landing page a client component.
- **`--accent-dim` still exists as an alias** for `--accent-fill`, so a stray
  reference renders as a fill rather than a broken variable. New code should say
  `--accent-fill`. It is a bar/fill colour and must never sit under white type.
- **The reduced-motion block uses `*:active { scale: 1 !important }`** rather than
  relying on the `motion-reduce:` variants, because two same-specificity Tailwind
  variants resolve by generated order. Do not "simplify" it away.

## Environment State

### Tools/Services Used

- **Supabase** — untouched this session. Still 11 migrations applied, no drift.
  Auth URL config still points at localhost.
- **Cloudflare** — **untouched.** Nothing deployed. Production still runs the
  pre-redesign code from commit `c0bc667`.
- **GitHub** — untouched. Nothing pushed.
- **Chrome (claude-in-chrome)** — used for the visual review. All tabs closed.
- Node 22.16, Wrangler 4.x, Vitest 4, Next 15.5.24, Tailwind v4.

### Active Processes

Both dev servers were started via `dev.bat` and are running in their own windows:

| Port | Process | Verified |
|------|---------|----------|
| 3000 | Next dev | `200` on `/` |
| 8787 | Worker (wrangler dev) | `404` on `/` — correct, that is `rootPage()` |

They will not survive the session. Restart with `dev.bat` from the repo root.

### Environment Variables

No new variables introduced by this session. Names only; values live in
gitignored files and must never be reproduced in any document.

`.env`, `backend/.dev.vars`, `frontend/.env.local`, `cloudflare.md`, `supabase.md`.

The two that custom domains need, currently **unset on the deployed Worker**:
`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`.

## Verification Status

- **172/172 backend tests pass** — re-run after the scanner-page copy change
- Frontend `tsc --noEmit` clean; `next lint` clean; `next build` clean, 16 routes
- Backend `tsc --noEmit` clean **except** the 5 pre-existing `dns.test.ts` errors
  (confirmed by filename this session — no other file errors)
- `npm run check:paths` — all pass
- **Rendered and inspected in Chrome**: `/`, `/create` (idle + More options),
  `/login`, `/signup`, `/cost`. Button hover verified as solid vermilion with
  white type. Focus rings verified. Console clean of the hydration error.
- `dev.bat` executed end to end: both ports bound, both servers answered, and the
  Worker's root page confirmed serving the updated copy.
- **Not verified**: the create→building→done→design flow (would write to the live
  database), every dashboard screen (needs a login), any viewport below desktop.

## Related Resources

- `flow.md` — the spec. Gitignored. Now stale on vocabulary.
- `architecture.md` — §4.4 covers Cloudflare for SaaS. Does not describe the
  anonymous flow or the apex merge. Three sessions stale.
- `context.md`, `plan.md`, `README.md` — stale on status.
- `tools/check-dashboard-paths.mjs` — run after adding any dashboard page.
- Cloudflare for SaaS setup:
  [getting started](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/),
  [Workers as fallback origin](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/advanced-settings/worker-as-origin/)

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.
