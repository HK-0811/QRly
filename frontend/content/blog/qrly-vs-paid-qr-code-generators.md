---
title: QRly vs paid QR code generators — an honest side-by-side by capability
description: What QRly has (dynamic codes, analytics, custom domains, a studio, no limits), what it lacks (bulk, API, teams, non-URL codes, routing), and who should still pay.
date: 2026-09-19
category: comparisons
keywords: qrly, qrly vs, free alternative to paid qr code generator, qrly qr code generator, free dynamic qr code generator, qr code generator comparison, paid qr code generator alternative
---

QRly is a free, open-source dynamic QR code generator. The obvious question from anyone comparing it against a paid tool is what the catch is. The honest answer is that there is no catch on the things it does, and a clear list of things it does not do. This post is that list, both halves, so you can decide in a few minutes rather than after signing up.

The comparison is by capability rather than by vendor, because paid generators differ from each other more than they differ from QRly on the basics. Where a capability is gated by plan, that is stated in general terms; check the vendor's pricing page for the tier, and the [cost page](/cost) for sourced figures.

## The short version

| Capability | QRly | Paid generators (typical) |
|---|---|---|
| Dynamic codes with editable destination | Yes, unlimited | Yes, usually counted per plan |
| Static codes for URLs | No (every code is a short link) | Usually yes |
| Static codes for Wi-Fi, vCard, SMS, email | No | Usually yes |
| Scan analytics | Yes, all fields, no plan | Yes, depth often gated by plan |
| Custom domain | Yes, with an account | Often on higher tiers |
| Design studio (colours, shapes, logo) | Yes | Yes, sometimes gated |
| Export SVG and high-resolution PNG | Yes, always | Yes, SVG sometimes gated |
| Watermark on free tier | None | Sometimes |
| Expiry, scan caps, trials | None | Common on free and low tiers |
| Account required to make a code | No | Usually yes |
| Bulk / CSV generation | No | Yes on most |
| Public API | No | Yes on most |
| Teams and permissions | No | Yes on business tiers |
| Routing by OS, geography or time | No | Yes on some |
| Password-protected codes | No | Yes on some |
| Scheduled or scan-limited destinations | No | Yes on some |
| PDF or file hosting | No | Yes on some |
| Source code | MIT, public | Closed |
| Operating cost passed on | None | Subscription |

## What QRly has

**Dynamic codes, without a counter.** Paste a URL, get a `qrly.lol/<slug>` short link and a QR code that encodes it. Scanning hits the redirect engine, which sends a 302 to your destination. Make as many as you want; none is metered. [What is a dynamic QR code](/blog/what-is-a-dynamic-qr-code) covers the mechanism.

**Editable destination.** Change where a printed code goes from the dashboard. The change propagates to every edge location in under 60 seconds. The short link's hostname and slug are immutable once saved, deliberately, because they are already on paper; [why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) explains why that is a feature.

**Analytics with every field on every code.** Total scans, unique visitors per day, country, region and city, local hour and weekday, carrier and network type, device type, vendor and model where the phone reports it, OS and browser versions, language, referrer and UTM parameters. Time series, heatmap and world map. There is no "advanced analytics" tier because there is no tier. Geo data is city-level IP geolocation, so approximate, and "unique" is per day by design; [what QR analytics can actually tell you](/blog/qr-code-analytics-what-you-can-actually-know) sets expectations.

**Custom domains.** Add `qr.yourbrand.com`, point one CNAME at the platform, and a certificate is issued automatically. Verification checks DNS across two resolvers and reports what it found. This needs an account, and it is what makes a printed dynamic code genuinely yours: if you ever leave, you repoint the hostname.

**A design studio that refuses to break the code.** Foreground and background colours, square, round or dot modules, square, round or ring finder eyes, error-correction level, quiet zone with a four-module minimum, and an embedded logo whose size is capped by what the chosen error-correction level can survive. A scannability read-out warns when a design goes too far. Export as SVG or PNG at 512, 1024 or 2048 pixels, rendered in the browser.

**No account to start.** The [home page](/) and [/create](/create) produce a working code and link before any signup. Sign up afterwards to claim it, edit the destination and read the analytics.

**No limits of the kind that cause reprints.** No watermark, no trial, no scan cap, no inactivity deletion, no expiry unless you set one yourself.

**Privacy by construction.** A redirect runs no JavaScript on the scanner's phone, so there is no cookie, pixel or script. IP addresses derive the geo fields and a rotating daily hash, then are discarded. GPC and Do Not Track are honoured. The [privacy page](/privacy) lists every field.

**Safety checks.** Destinations are checked against Google Safe Browsing and re-checked weekly; private addresses are refused.

**Open source, MIT.** The whole thing is at https://github.com/HK-0811/QRly. If QRly disappeared, the code would not.

## What QRly does not have

This is the part to read before deciding.

**No static codes, and no non-URL payloads.** Every QRly code is a URL short link. It does not make Wi-Fi codes, vCard contact codes, phone, SMS or email codes, plain text or payment codes. For those, a static generator or your phone's built-in tools are the right choice; [QR codes for Wi-Fi](/blog/qr-code-for-wifi) explains how, and when a dynamic code pointing at a page is better anyway.

**No bulk or CSV import.** Five hundred serialised codes for packaging or asset tags would be made one at a time. A paid tool with bulk generation is the correct purchase for that job.

**No public API.** The source is open, but there is no documented API for programmatic creation. Print-on-demand and ticketing pipelines need one.

**No teams.** One account, one owner. No shared workspaces, roles or audit logs. Agencies managing codes for several clients, or departments with several editors, will find this limiting quickly.

**No OS or geo routing.** One link goes to one destination. QRly cannot send iPhones to the App Store and Androids to Google Play from one code, though a destination page you control can itself redirect by device.

**No password protection, no scheduled destinations, no scan-count limits.** Useful for gated content or time-boxed promotions; QRly has none of them.

**No file hosting.** A "QR code for a PDF" on QRly is a code pointing at a PDF you host elsewhere.

**No app, no dark mode, no enterprise scale.** It is a web application deliberately sized for a thousand or two users, not for a stadium or a national campaign.

## Who QRly is for

The person or small organisation making a modest number of codes that need to be editable, trackable, unwatermarked and free for as long as the print exists. A restaurant with menus, a shop with a review code on the counter, an estate agent with signs, a charity with a donation link on a leaflet, a teacher with worksheets. Anyone burned by a free trial they did not know they were on. Anyone who wants to read the code before trusting the privacy claims.

It also suits developers who want a dynamic QR platform they can inspect, fork or host themselves, which is the subject of [self-hosted QR code generators](/blog/self-hosted-qr-code-generator).

## Who should still pay

Anyone who needs bulk generation, an API, team access, non-URL payloads alongside dynamic ones, OS or geo routing, password protection, or a contract with someone to phone when something breaks. Those are legitimate features with real engineering behind them, and a subscription that includes them is priced for the rest, not for the redirect. [QR code generator pricing explained](/blog/qr-code-generator-pricing-explained) goes through what each model buys.

The mistake is paying for those features and using none of them, because the only thing you needed was a code that keeps working. That is the case QRly exists for.

## A fair way to test the claim

Make a code on [the home page](/) without signing up. Decode it and confirm it is a `qrly.lol` short link. Download the SVG and check it has no frame. Scan it and confirm it lands on your destination with nothing in between. Sign up, change the destination, and scan again within a minute. If any of that does not match this post, the post is wrong and should be fixed.

## Frequently asked

**Is QRly really free, or is there a plan I am not seeing?**
There is no paid plan. The platform runs on Cloudflare Workers and Supabase free tiers at $0 a month, and the cost page shows the numbers. Nothing is gated.

**What is the biggest thing QRly lacks compared with a paid generator?**
Bulk generation and an API, followed by teams. If you make codes by the hundred or by machine, or several people need access, a paid tool fits better.

**Can QRly make a Wi-Fi or contact QR code?**
No. Every QRly code is a URL short link. Use a static generator or your phone's built-in sharing for Wi-Fi and vCard formats.

**Can I take my codes with me if I stop using QRly?**
Only if they are on your own custom domain, in which case you repoint the hostname. Codes on `qrly.lol` depend on `qrly.lol`, the same way any vendor's codes depend on that vendor. This is why custom domains exist.

**Does QRly track the people who scan?**
It records the redirect request: country, city, device, OS, browser, time and referrer. No cookie, no script, no stored IP. The privacy page lists every field.
