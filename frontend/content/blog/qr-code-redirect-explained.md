---
title: QR code redirects explained: why it must be a 302 and never a 301
description: How a dynamic QR code redirect works, why the status code has to be 302 rather than 301, how the redirect is served from the edge, and what it adds to a scan.
date: 2026-09-19
category: dynamic
keywords: qr code redirect, qr code url redirect, 302 vs 301 qr code, qr code redirect explained, dynamic qr code redirect, qr code short link, redirect latency
---

Every dynamic QR code is a redirect. The code encodes a short link, the phone opens it, and a server answers *go here instead*. Most of what makes a dynamic code good or bad — whether it can be edited, whether the edit takes, how fast the scan feels — is decided by how that redirect is implemented. This post is the implementation, from the status code up.

## What a redirect is

When a browser requests a URL, the server answers with a status code. `200` means *here is the page*. The `3xx` codes mean *the thing you want is at a different URL*, given in a `Location` header, and the browser follows it without asking.

For a QR short link, the exchange is:

```
GET /abc123 HTTP/1.1
Host: qrly.lol

HTTP/1.1 302 Found
Location: https://example.com/menu
Cache-Control: no-store, no-cache, must-revalidate
```

The phone's browser reads the `Location`, requests it, and the person scanning sees the menu. The whole hop is a few hundred bytes and, done properly, is not something anyone notices.

Two of the `3xx` codes are relevant, and choosing between them is the single most important decision in a QR redirect.

## 301 versus 302

`301 Moved Permanently` says: this URL has moved for good, do not bother asking me again. `302 Found` says: for now, the thing is over there, but ask me next time.

Browsers take the 301 at its word. A 301 response is cacheable by default under the HTTP specification, and browsers cache it aggressively — in practice, until the cache is cleared. Having seen a 301 once, the browser will jump straight to the recorded destination on the next visit without contacting the server at all.

For an ordinary website moving a page, that is exactly right. For a QR code, it is fatal. The point of a dynamic code is that the destination can change. If the redirect were a 301, then a phone that had scanned the code before an edit would carry on going to the old destination, indefinitely, no matter what the dashboard said. The edit would appear to work on phones that had never scanned the code and silently fail on the ones that had. Worse, the failure would be invisible from the server side, because the phone never asks.

| | 301 | 302 |
|---|---|---|
| Meaning | Moved permanently | Found here, for now |
| Cached by the browser | Yes, by default, effectively forever | No, unless told to |
| Next scan contacts the server | No | Yes |
| Destination can change | Not for anyone who has scanned before | Yes, for everyone |
| Suitable for a QR short link | No | Yes |

So a QR redirect must be a 302. QRly's redirect engine sends nothing else for a live link, and it adds explicit `Cache-Control: no-store` headers so that no intermediate cache — a corporate proxy, a carrier's transparent cache — keeps a copy either. The [editable QR code](/blog/editable-qr-code) post is, in a sense, entirely a consequence of this one header.

There is a second consequence worth knowing about. Because every scan reaches the server, every scan can be counted. A 301 would not just freeze the destination; it would stop the analytics after the first scan from each phone. [How scan tracking works](/blog/how-to-track-qr-code-scans) depends on the 302 as much as editing does.

## What the server does on each scan

The request arrives and the engine, in order:

1. Reads the hostname and the slug. The hostname matters because the same slug can exist on `qrly.lol` and on a custom domain; the pair is the key.
2. Looks the pair up in a key-value store replicated to every edge location. On a hit, the destination and a few flags come back in a millisecond or two.
3. On a miss — the first scan of a code at that edge, or a code not scanned there recently — queries the database, then writes the answer into the key-value store so the next scan at that edge is a hit.
4. Checks the flags: is the link enabled, has an [expiry date](/blog/qr-code-with-expiration-date) passed, has the destination been flagged by Google Safe Browsing. Each of those produces a page instead of a redirect.
5. Sends the 302.
6. Records the scan, after the response has gone.

That last ordering is deliberate. The analytics write happens after the redirect has been sent, so a slow or failed write never delays a scan. The person is already on their way to the destination before anything is stored about the visit.

Editing a destination is the inverse path: the database is updated, and the key-value entry for that hostname and slug is rewritten, which reaches every edge in under 60 seconds. [Caching and propagation](/blog/qr-code-caching-and-propagation) covers the window in more detail.

## Where the server is

*The server* is a misleading phrase for a modern redirect. QRly's engine runs on Cloudflare Workers, which means the code executes at whichever Cloudflare location is nearest the phone, not in one data centre somewhere. A scan in Manchester is answered from Manchester; a scan in Mumbai from Mumbai. The key-value store is replicated to those same locations, so the lookup is local too.

This is what makes a redirect cheap enough to serve for nothing and fast enough not to notice. [How QR redirects work at the edge](/blog/how-qr-code-redirects-work-at-the-edge) is the architecture in full; the short version is that the hot path is a cache read and a response, with the database only consulted on a miss.

## Latency, honestly

A redirect adds one round trip to a scan. How long that round trip takes depends on where the phone is, what network it is on, and whether the lookup was a cache hit.

QRly's engine is built to a budget: a warm-cache scan should resolve in under 15 milliseconds of server time, and a cold one — where the edge has to ask the database — in under 250. The engine reports its own resolution time in a `Server-Timing` header on every response, so the figure can be measured from outside with `curl` rather than taken on trust.

Server time is not what the person feels, though. What they feel is the full round trip from their phone: DNS resolution for the short link's hostname, a TLS handshake, the request, the response, and then the same again for the destination. On a mobile network that is dominated by the network, not by the lookup, and the honest comparison is with the destination page itself, which typically takes far longer to load than the redirect took to issue.

Two things reduce what the redirect adds:

- **Short links keep the QR code small.** A shorter URL means fewer modules, which means a code that scans at a smaller size and from further away. The redirect pays for itself before the network is involved; [why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) has the numbers.
- **The destination hostname is not the redirect's.** When you set up a custom domain, the short link's DNS points at the same edge network, so nothing changes about the path; the certificate is issued for your hostname and the redirect is served in the same place.

## What a redirect does not do

A redirect is a response, not a page. It runs no JavaScript on the phone, sets no cookie and loads no pixel. Everything QRly records about a scan comes from the request headers and the connecting address, and the address is used to derive a country, a city and a daily hash, then discarded. [The privacy page](/privacy) lists every field. A redirect also sends no referrer to the destination — the engine sets `Referrer-Policy: no-referrer` — so the destination's own analytics see a direct visit, not the short link.

This is the reason a 302 is a better privacy model than a landing page, as well as a better editing model than a 301. There is nothing on the scanner's phone but a header.

## Frequently asked

**Should a QR code redirect be a 301 or a 302?**
A 302. A 301 is cached permanently by the browser, so any phone that had scanned the code before the destination changed would keep going to the old one. A 302 makes every scan ask the server, which is what allows editing and counting.

**Does the redirect slow the scan down?**
It adds one round trip. On QRly the server side of that is a cache read, budgeted at under 15 milliseconds when warm, and the network dominates. The destination page will take longer to load than the redirect took to issue.

**Can the redirect be cached by the phone?**
No. QRly sends `Cache-Control: no-store` with every 302, so neither the phone nor any proxy in between keeps a copy. The next scan always asks the edge.

**What happens when the link is expired or disabled?**
The engine returns a page saying so instead of a 302. The printed code still resolves; it just does not forward. Clearing the expiry or re-enabling the link restores the redirect within a minute.

**Does the destination see that the visit came from a QR code?**
Not from the referrer, which QRly suppresses. If you want the destination's analytics to attribute the visit, add UTM parameters to the destination URL; the redirect passes them through unchanged.
