---
title: How QR code redirects work at the edge, from the scan to the 302
description: A dynamic QR code scan is one HTTP request to an edge server, a cache lookup and a 302. Here is QRly's redirect path step by step, with the latency and the failure modes.
date: 2026-09-19
category: advanced
keywords: how do qr code redirects work, qr code redirect server, edge redirect, qr code 302 redirect, cloudflare workers redirect, qr code redirect latency, dynamic qr code backend
---

A dynamic QR code contains a short URL. When a phone scans it, the phone opens that URL, a server answers with a redirect, and the phone follows it to the real destination. [The redirect explained](/blog/qr-code-redirect-explained) covers that at the level most people need.

This post is the level below: what happens on the server between the request arriving and the 302 leaving, using QRly's redirect engine as the worked example because [the source is open](https://github.com/HK-0811/QRly) and the numbers can be checked.

## Where the request lands

The short URL's hostname resolves to Cloudflare's network, and the request is handled by a Worker, a small program that runs in whichever Cloudflare data centre is nearest the phone. There is no central server for the scan to travel to. A scan in Manchester is answered in Manchester; a scan in Pune is answered in Pune.

The round trip to a distant origin is usually the largest part of a redirect's latency, and it is the part an edge deployment removes. The Worker has the code; what it needs is the data, and that is where the cache comes in.

## The hot path, in order

Every step here is on the critical path of a physical scan, so the order is cheapest check first, and the response goes out before any bookkeeping.

**1. Resolve the hostname.** The Worker serves more than one hostname, since [custom domains](/blog/custom-domain-qr-code) point at it too, and the set it will answer for lives in the database, cached at the edge for five minutes. A request for a hostname not on the list is refused before anything else happens, which is what stops a spoofed `Host` header from doing any work.

**2. Look up the slug in the edge cache.** The cache is Workers KV, a key-value store replicated to every Cloudflare location. The key is the hostname plus the slug; the value is a small record with the destination, whether the link is active, its expiry date if it has one, and its Safe Browsing status. A hit returns in a few milliseconds.

**3. On a miss, ask the database.** The Worker queries Postgres on Supabase for the link. This is the slow step, because it crosses the network to a single region. The result is written back to KV so the next scan anywhere in the world is a hit. An unknown slug is also cached, as a negative entry, but only on its second sighting, because a bot walking random slugs would otherwise spend the free tier's write budget on keys nobody will request again.

**4. Evaluate.** The record decides what the person sees. An active link with a destination gets a redirect. An expired one gets an expired page. A disabled one, or one that Safe Browsing has flagged, gets an interstitial rather than the destination. A slug that does not exist gets a 404.

**5. Send the 302.** The response is a status 302 with a `Location` header holding the destination, `Cache-Control: no-store` so nothing caches the redirect, `Referrer-Policy: no-referrer` so the short URL is not leaked to the destination's own analytics, and an `X-Robots-Tag` telling search engines not to index the short link.

**6. Record the scan, after the response.** The analytics write is registered with the runtime's `waitUntil` before the response is returned, but it runs after the response has been sent. The phone is already following the redirect while the Worker is still deriving country, city and device from the request headers and inserting a row. A failed analytics write is swallowed; the scan already succeeded for the person who mattered.

## The timing budget

The code carries the budget as a comment, and the end-to-end test in the repository measures it against production.

| Path | Target |
|---|---|
| KV hit to 302 | under 15 ms |
| KV miss to 302 | under 250 ms |
| Analytics insert | after the response, unbudgeted |

The first row is what almost every scan sees, because a link scanned once anywhere is in the cache for an hour. The second row is the first scan of a link, or the first after the cache entry expires. Neither figure includes the phone's DNS lookup and TLS handshake, which are the same for any URL.

## Why 302 and not 301

The difference is whether the browser is allowed to remember the answer. A 301 says the resource has moved permanently, and browsers cache that: the next time the same short URL is opened, the browser may go straight to the old destination without asking the server. A 302 says the resource is temporarily elsewhere, and browsers ask every time.

For a dynamic QR code, editing the destination is the entire product. A 301 would let a phone that had scanned the code once keep going to the old address after the link was changed, for as long as its cache lasted. So the redirect is a 302, always, and it is sent with `Cache-Control: no-store` for the same reason. [Changing a QR code's link after printing](/blog/how-to-change-a-qr-code-link-after-printing) is only possible because of that choice.

## What happens on an edit

When you change a link's destination in the dashboard, the write goes through the Worker rather than straight to the database, and the reason is the cache. The Worker updates the row in Postgres and then writes the new record into KV directly, a write-through. It does not delete the cache entry, because a delete would send the next scan at every location to the database at once.

KV is eventually consistent: a write is visible immediately at the location that made it and takes up to about 60 seconds to reach every other location. During that window a scan at a distant edge may still be served the previous destination. The dashboard says so next to the edit form, and [caching and propagation](/blog/qr-code-caching-and-propagation) goes into why the window is 60 seconds and why the cache TTL is an hour.

## What happens when things break

An edge redirect has two dependencies, the cache and the database, and it is worth knowing what each one failing does.

- **Database down, cache warm.** Redirects keep working from KV. Nothing on the hot path needs Postgres for a link that has been scanned in the last hour. Analytics rows for that period are lost, since there is nowhere to write them. This is the single most useful property of the design: the thing on the poster keeps working when the back end does not.
- **Cache down.** The Worker falls through to Postgres on every request. Slower, still correct.
- **Both down.** The scan gets an "unavailable" page rather than a hang, and the code is not blamed.
- **Too many requests from one place.** A per-location rate limit returns a 429 rather than passing the flood to the database. It is per isolate, which is a free-tier constraint rather than a full solution, and the code says so.

None of this is exotic. It is what any competent redirect service should do, and it is why a dynamic QR code costs almost nothing to serve at the volumes a small business will ever see. [Running a QR code platform for free](/blog/running-a-qr-code-platform-for-free) adds up the free-tier ceilings.

## What the scanner's phone does not do

The phone's browser makes one request and receives one redirect. No page is rendered at the short URL, no HTML is sent, and no JavaScript runs. Everything QRly knows about the scan comes from the request itself: the IP address, the user agent, and the geographic and network fields Cloudflare derives from the connection. The IP is used to compute those and a daily-rotating visitor hash, then discarded. [Do QR codes track you](/blog/do-qr-codes-track-you) and [the privacy page](/privacy) list what is kept.

You can watch this yourself. [Make a code](/create), then open its short URL with the browser's network tab open. You will see a single request, a 302 with the headers above, and the destination loading. That is the entire product, from the phone's point of view.

## Frequently asked

**How does a QR code redirect work?**
The code encodes a short URL. The phone opens it, the server looks up the slug, and answers with an HTTP 302 whose `Location` header holds the real destination. The phone follows it. On QRly the lookup happens in an edge cache and takes a few milliseconds.

**What is an edge redirect?**
A redirect served from a data centre near the person scanning rather than from one central server. The code and a replicated cache run in every location, so there is no long round trip. QRly runs on Cloudflare Workers with Workers KV as the cache.

**Why is a dynamic QR code redirect a 302 and not a 301?**
A 301 is permanent and browsers cache it, so a phone might keep going to an old destination after you edit the link. A 302 is temporary and the browser asks every time. Editable destinations require 302.

**Does the redirect slow down the scan?**
By a few milliseconds when the link is cached, which is nearly always. The first scan of a link after an hour of quiet goes to the database and takes longer, still well under a second. The phone's own DNS and TLS setup dominate either way.

**Where is the scan recorded?**
At the redirect, after the 302 has been sent, from the request headers. No script runs on the phone and no page is served at the short URL. If the database is unreachable the scan still redirects and the record is dropped.
