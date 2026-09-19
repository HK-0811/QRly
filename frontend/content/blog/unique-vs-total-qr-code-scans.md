---
title: Unique vs total QR code scans: how unique is counted without cookies
description: Total scans is an exact count of requests. Unique scans is inferred from the request, and without a cookie that only holds for a day. What each number means and why.
date: 2026-09-19
category: analytics
keywords: unique qr code scans, unique vs total scans, qr code scan count, unique visitors qr code, qr code repeat scans, how are unique scans counted, qr code scan statistics
---

Every QR analytics dashboard shows two headline numbers: scans and unique scans. The first is straightforward. The second is an estimate wearing a whole number, and how it was estimated changes what it means. A dashboard that claims 30-day unique visitors from a redirect is telling you something it cannot know.

This is how the two are counted on [QRly](/), why unique is deliberately a daily figure there, and what to make of the longer-lived claims elsewhere.

## Total scans: the number that is exact

A dynamic QR code contains a short link. Each time a phone opens that link, the redirect engine receives one HTTP request and answers with a `302` to the destination. Total scans is a count of those requests. It is exact for everything that reached the server.

Three adjustments are made to it, and they are worth knowing about:

- **Bots and previews are separated.** When someone pastes the short link into WhatsApp or Slack, the app fetches it to draw a preview card. Security tools follow links before a person taps. Crawlers find short URLs. QRly flags these using request headers and network classification and shows them on their own line, off the headline. The flagging is heuristic, and it errs on the side of counting a real person.
- **Your test scans are in there.** They are real requests. On a link with a handful of scans they matter; on a link with hundreds they do not.
- **Nothing counts a scan that never opened.** Someone who pointed a camera at the code, saw the notification and put the phone away did not generate a request.

So "total" is the number of times the redirect ran for something that looked like a person. It is the reliable one.

## Unique scans: what a redirect can actually tell apart

Here the problem starts. A redirect sees one request with no memory of the last one. To decide whether two requests came from the same phone, it has to compare what they carry, and what they carry is:

- the connecting IP address,
- the user agent string (browser, OS, and on Android usually the model),
- the link being requested.

That is the entire basis for uniqueness without a cookie. Two scans that match on all three are probably the same phone. Two scans that differ on any of them are probably different phones. Both "probably"s are load-bearing.

**Where it undercounts:** an office, a campus or a mobile carrier's gateway puts many people behind one public address. Two colleagues with the same iPhone model on the same corporate Wi-Fi look identical to a redirect. On cellular data, a carrier's NAT can put thousands of phones behind one address, and iPhones all report the same user agent, so a pair of iPhone users scanning a poster from the same carrier in the same hour can collide.

**Where it overcounts:** the same phone on Wi-Fi and then on mobile data has two addresses. A phone whose carrier rotates addresses looks new after each rotation. A browser update changes the user agent.

Within a day these errors are modest and roughly cancel for most links. Over a month they do not, because IP addresses on phones are simply not stable across weeks. Which is why the next design decision follows.

## Why QRly's unique is per day, on purpose

QRly computes uniqueness as a hash:

```
hash = sha256( daily_salt + secret_pepper + ip + user_agent + link_id )
```

truncated, and with the **salt rotating every 24 hours**. Two scans on the same day from the same phone and link produce the same hash and count as one unique visitor. The same phone the next day produces a different hash and counts as a new one.

Two things are going on there, and they pull the same way.

First, **honesty**. Across days, IP-based uniqueness is unreliable for the reasons above. Reporting a monthly unique figure would be reporting noise with a confident face. A daily figure is the longest window over which the inference actually holds.

Second, **privacy**. A stable hash of IP and user agent is a tracking identifier — it would let anyone with the database follow one phone across every link it ever scanned. Rotating the salt daily makes the hash self-expiring: yesterday's hashes cannot be matched to today's, even with the database and the secret in hand. The raw IP is used to compute the hash and then discarded; it is never stored. [The privacy page](/privacy) lists this, and [do QR codes track you](/blog/do-qr-codes-track-you) is the scanner's-side view.

The consequence for reading the dashboard: **unique visitors over a range is the sum of daily uniques**. Over a week it is "how many distinct scanners each day, added up", not "how many distinct people this week". A person who scans a menu every lunchtime is five uniques in a working week. That is the correct reading of the number, and the dashboard is built so that it cannot be read any other way.

## Repeat rate

Beside unique visitors the dashboard shows a repeat rate: the share of scans that were a second or later scan from the same daily hash on the same link. It is computed at insert time by checking whether that hash has been seen on that link before, and it inherits the same 24-hour horizon.

A high repeat rate within a day means people are scanning again — a menu that gets scanned before ordering and again for the bill, or a code that opens something people come back to during an event. A low repeat rate is the normal state for a poster. Scans that carried a privacy signal have no hash and are left out of both sides of the rate rather than being counted as new.

## What longer-lived unique claims are made from

Other dashboards report 30-day or all-time unique scanners. There are only three ways to do that, and each has a cost that should be visible on the pricing or privacy page.

| Method | How it identifies a return | What it costs |
|---|---|---|
| Stable IP + user agent hash | Same as above, without rotation | Overstated across weeks; a persistent identifier |
| Cookie set on an interstitial page | The redirect first loads a page that sets a cookie, then forwards | A slower scan, a consent obligation in much of the world, and blocked by many browsers |
| Fingerprinting script on an interstitial | Canvas, fonts, screen size, etc. | Same as above plus a privacy problem |

A claim of long-term uniqueness that comes with no cookie and no interstitial is the first method. It is not more accurate than a daily count; it is the same guess held for longer. [What QR code analytics can actually know](/blog/qr-code-analytics-what-you-can-actually-know) draws the line between what a request contains and what has to be invented.

## Which number to use for what

**Use total scans** for volume, for comparing placements against each other, and for anything that feeds a cost calculation. It is exact and it is the number your print run is trying to move. [Measuring print ROI](/blog/measure-print-campaign-roi-with-qr-codes) uses total scans per placement throughout.

**Use daily unique visitors** to distinguish "one person scanned this twenty times" from "twenty people scanned this once". On a menu or an event code that difference is the whole story.

**Use the ratio** — scans per unique per day — as a rough measure of how much a code is being reused within a visit. It is usually a little over one. If it is much higher, something on the destination page is sending people back to scan again, which is worth knowing.

**Do not use** the sum of daily uniques as a count of people reached. It is an upper bound on that, and for a fixture that people return to it is a loose one.

## Frequently asked

**What is the difference between unique scans and total scans?**
Total is the number of times the redirect ran. Unique is an estimate of how many distinct phones did it, made from the request's address and user agent, and on QRly it is only reliable within a single day.

**Why does the same person count as unique again the next day?**
Because the salt in the hash changes every 24 hours, on purpose. It keeps the hash from being a tracking identifier and it reflects the fact that IP-based identity is not stable across days anyway.

**Why is unique lower than total on a code that only I have scanned?**
Because you scanned it more than once on the same day and network. That is the mechanism working. Scan it tomorrow and you will be a new unique.

**Can I get a real count of people who scanned?**
Not from a redirect. The closest honest measure is daily uniques on a fixture, or total scans on a one-off. Anything claiming person-level counts across weeks is either guessing or setting a cookie on the way through.

**Are bots included in unique visitors?**
No. Flagged bots and link previews are kept out of the headline totals and the unique count, and shown on their own.
