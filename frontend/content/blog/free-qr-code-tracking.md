---
title: Free QR code tracking: what a trackable QR code can record for nothing
description: Only a dynamic QR code can be tracked. What a free redirect records about each scan, how it does that without a cookie, and where the numbers stop being exact.
date: 2026-09-19
category: analytics
keywords: free qr code tracking, trackable qr code free, qr code with tracking, qr code scan counter, track qr code scans free, qr code analytics free, dynamic qr code tracking
---

A QR code is a picture. It cannot count anything. When someone points a camera at it, the phone decodes some text and, if the text is a URL, opens it. The code itself never finds out.

So "QR code tracking" is always tracking something else: the web request that follows the scan. Whether that request can be counted, and by whom, depends entirely on what URL is inside the code. That one fact sorts every "free tracking" offer into two piles.

## Only a dynamic code can be tracked

A **static** code contains your destination URL directly. The phone goes straight to your page. The generator that drew the code is not involved in the scan, so it cannot count it, and neither can anyone else except your own web server. If a site offers "tracking" on a static code, it is offering you your own server logs.

A **dynamic** code contains a short URL on the generator's domain. The phone requests that short URL, the generator's server records the request and answers with a redirect to your real page. The scan is counted at the moment of the redirect. That is the only place a QR scan can be counted by a third party, and it is why every tracking feature you have ever seen is attached to a dynamic code.

The difference is explained at more length in [static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes). For tracking purposes the rule is short: no redirect, no counter.

This also tells you what "free tracking" actually costs the vendor. Each scan is one HTTP request and one database row. Serving that is close to free at any volume a poster will generate, which is why the paid tiers on most generators are priced on features, not on cost.

## What QRly records on every scan, for free

QRly is a dynamic QR code generator with no paid plan. Every code is a short link (`qrly.lol/your-slug`) and every scan of it is recorded at the redirect. The whole stack runs on free cloud tiers and the source is [open](https://github.com/HK-0811/QRly), so what follows can be checked against the code rather than taken on trust.

Per link, the analytics tab shows:

- **Scans** — total, over time, with bots and link previews separated out.
- **Unique visitors** — counted per day, using a salted hash that rotates every 24 hours. More on why below.
- **Where** — country, region and city, on a map and as ranked lists.
- **When** — the hour and weekday in the scanner's own timezone, as a heatmap.
- **Network** — the carrier or ISP, and whether the connection looks mobile, broadband, corporate or datacentre.
- **Device** — type, vendor and model where the phone reports it; operating system and browser with versions.
- **Language** — from the phone's settings.
- **How they arrived** — referrer if one was sent (a real camera scan sends none), and any UTM parameters present.

None of this requires an account to set up. You [make a code](/create) first; you sign up afterwards if you want to keep it and read the numbers. There is no scan cap, no expiry on the code, and no watermark on the download. The [cost page](/cost) shows why that is sustainable rather than a trial in disguise.

If you want the walkthrough rather than the list, [how to track QR code scans](/blog/how-to-track-qr-code-scans) goes step by step.

## How it works without a cookie or a script

The scanner's phone never runs anything. A redirect is a single HTTP response — a `302` status and a `Location` header — and there is no page in which a script could execute. Everything above comes from two sources:

1. **The HTTP request itself.** The `User-Agent` header (device, OS, browser), `Accept-Language` (language), `Referer` (referrer, usually absent), and the query string (UTMs).
2. **The edge that received it.** The request lands on a Cloudflare worker, which supplies the approximate location and the network operator for the connecting IP address.

The IP address is used to derive those fields and the daily visitor hash, and is then discarded. It is not written to the database and not written to a log. There is no pixel, no cookie and no fingerprinting. If the phone sends a Global Privacy Control or Do Not Track signal, the scan is recorded as a count with country and device class only. The full field list, including what is deliberately not collected, is on [the privacy page](/privacy), and [do QR codes track you](/blog/do-qr-codes-track-you) covers what the scanner's side of this looks like.

> A redirect can see what any web server sees about one request, and nothing more. Any tracking claim beyond that needs a script on the phone, and a QR redirect has nowhere to run one.

## Where the limits are

Free or paid, scan analytics have edges that dashboards tend to smooth over. These are the ones that matter.

**Unique means unique per day.** Without a cookie there is no durable identity, so uniqueness has to be computed from what the request carries: IP address, user agent and the link, hashed with a salt. QRly rotates that salt every 24 hours, on purpose, so the hash cannot be used to follow a person over time. The consequence is that the same person scanning on Monday and Thursday counts as two unique visitors. A dashboard that claims 30-day uniques from IP data alone is guessing; [unique vs total scans](/blog/unique-vs-total-qr-code-scans) explains why.

**Location is approximate.** It is IP geolocation, not GPS. City-level is typical for broadband; mobile carriers often resolve to a city some distance from the phone; VPNs resolve to the VPN. The map shows city centroids, not the spot someone was standing. [QR code location tracking](/blog/qr-code-location-tracking) goes into how wrong it can be and when.

**Device model is uneven.** Android phones usually report a model string; iPhones report "iPhone" and nothing more specific. That is Apple's choice, not a gap in the tracker.

**Some scans are not people.** Messaging apps fetch links to build previews, security tools follow links before a person taps, and crawlers find short URLs. QRly flags these and keeps them out of the headline numbers, but the classification is heuristic.

**The count stops at the redirect.** What happens on your page afterwards — whether they bought anything, filled in the form, stayed ten seconds — is not visible to the redirect. That side belongs to your own site analytics, and the two are joined with [UTM parameters](/blog/qr-code-utm-parameters-google-analytics).

## What to check on any "free tracking" offer

The pile of generators that advertise free tracking is large, and the terms vary more than the landing pages suggest. Before printing, read the pricing page for:

| Question | Why it matters |
|---|---|
| Does the free code keep redirecting after the trial? | A dead redirect is a dead code on every poster. |
| Is there a monthly scan cap? | A busy campaign hits it mid-month and the code stops. |
| Are codes deleted for inactivity? | Seasonal signage can sit unused for months. |
| Which fields are on the free tier? | Often just a total; the breakdowns are paid. |
| Is the redirect on your domain or theirs? | Only your own domain survives a change of vendor. |

On QRly the answers are: yes, no, no, all of them, and either — a [custom domain](/blog/custom-domain-qr-code) can be pointed at the redirect engine with one CNAME record, so the printed code carries your hostname.

## Frequently asked

**Can I track a QR code for free?**
Yes, if it is a dynamic code and the vendor's free tier keeps the redirect running. QRly records every scan with location, device, time and network data, with no plan to upgrade to and no cap.

**Can I add tracking to a QR code I already printed?**
Only if it was dynamic. A static code goes straight to your URL and the scan is invisible to everyone but your web server. If the printed code is a short link, whoever runs that short link controls the tracking.

**Does QR code tracking need the scanner to accept cookies?**
No. Tracking happens at the redirect, before any page loads, so there is no cookie to accept and no consent banner in the way. It also means there is no persistent identifier — which is why uniqueness is per day.

**How accurate is a free QR scan counter?**
The total is exact for requests that reached the redirect, minus whatever the bot filter removes. The breakdowns are as accurate as their source: user agent strings are reliable, IP geolocation is roughly city-level, and unique visitor counts are daily.

**Does tracking slow down the scan?**
Not measurably. The redirect is answered first and the record is written afterwards; a failed analytics write never delays or blocks the redirect.
