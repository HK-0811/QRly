---
title: QR code analytics: what data a scan can actually reveal, field by field
description: A QR redirect sees one HTTP request and the edge that received it. Every field those two sources can yield, how reliable each is, and what no QR code can know.
date: 2026-09-19
category: analytics
keywords: qr code analytics, qr code data, what data does a qr code collect, qr code tracking data, qr code scan data, what can a qr code track, qr code metrics
---

Every QR analytics dashboard is drawn from the same raw material: one HTTP request, arriving at one server, from a phone that has just decoded a URL. There is no page yet, so there is no script, and there is no cookie because nothing has set one. Whatever the dashboard shows either came out of that request or was inferred from it.

That makes the honest answer to "what data does a QR code collect" a short list with a long footnote. This is the list, field by field, with the footnote attached to each. It is written from running [QRly](/), which records all of these at the redirect and none of anything else; the full inventory is on [the privacy page](/privacy).

## Where the data comes from

Two sources, and only two.

**The request.** A phone opening a URL sends a handful of headers: `User-Agent`, `Accept-Language`, sometimes `Referer`, and the URL itself including any query string. That is the entire contribution of the phone.

**The edge.** The request arrives at a Cloudflare data centre, which knows the connecting IP address and attaches what it can look up about that address: approximate location, the network operator, the timezone of that location. The server sees these as metadata. QRly uses the IP for those lookups and for a daily hash, then discards it — it is never stored.

Everything below is one of those two, or derived from them.

## Field by field

| Field | Source | How reliable |
|---|---|---|
| Timestamp | Server clock | Exact |
| Total scans | Count of requests | Exact, minus bot filtering |
| Unique visitors | Daily salted hash of IP + user agent + link | Good within a day; meaningless across days |
| Country | IP lookup | Very good |
| Region, city | IP lookup | Usually right for broadband; often off for mobile; wrong for VPNs |
| Coordinates | IP lookup | City centroid, not a position |
| Timezone, local hour, weekday | IP lookup | As good as the city |
| ISP or carrier | IP lookup (ASN) | Very good |
| Connection type | Classified from the ASN | Heuristic: mobile, broadband, corporate, datacentre |
| Device type | User agent | Good |
| Device vendor and model | User agent | Android: usually a model; iOS: just "iPhone" or "iPad" |
| OS and version | User agent | Good, though some browsers freeze the reported version |
| Browser and version | User agent | Good; in-app browsers identifiable |
| Language | `Accept-Language` | Good; it is the phone's setting, not the person's fluency |
| Referrer | `Referer` header | Absent for a camera scan; present when the short link was tapped |
| UTM parameters | Query string on the short link | Exact, if present |
| Bot or preview | Heuristics on headers and network | Good for the obvious cases; not perfect |

A few of these deserve more than a row.

### Total scans

The one exact number. Every request that reached the redirect is counted, including your own tests. What gets subtracted is automated traffic: link-preview fetchers from messaging apps, crawlers, and security scanners that follow a link before a person taps it. Those are flagged, kept, and left out of the headline. The flagging is heuristic, so the headline is very close rather than perfect.

### Unique visitors

Without a cookie, uniqueness has to be inferred from the request. QRly hashes the IP address, user agent and link ID with a salt that rotates every 24 hours. Two scans from the same phone on the same day collide; the same phone tomorrow gets a different hash. So "unique" means unique *that day*, and a 30-day unique count is a sum of daily uniques, not a count of people. This is deliberate — a stable hash would be a tracking identifier — and it is the reason [unique vs total scans](/blog/unique-vs-total-qr-code-scans) needs its own explanation.

### Location

IP geolocation gives a country with high confidence, a city with moderate confidence, and coordinates that are the centre of that city. Mobile carriers route traffic through gateways that may be in another city; VPNs put everyone at the VPN exit; corporate networks put every branch at head office. It is fine for "which cities is this poster reaching" and useless for "where was this person standing". [QR code location tracking](/blog/qr-code-location-tracking) covers the error modes in detail.

### Device and browser

The user agent string is the most reliable field on the list and the most misread. It names the browser and OS well. Model detail depends on the platform: Android phones generally include a model identifier, iPhones never do. When the scan opens inside an app's own browser — Instagram, Facebook, WhatsApp — the user agent usually says so, and that is worth knowing because those browsers behave differently from Safari or Chrome. [Device analytics](/blog/qr-code-device-analytics) explains what to do with it.

### Referrer

A camera scan opens the URL directly; there is no page it came from, so no referrer is sent. That absence is the single most useful signal in QR analytics: scans with no referrer are people at the printed thing. Scans with a referrer came from the short link being pasted somewhere and tapped. On the dashboard these are separated as "direct scans" and "how people arrived".

## What a QR code cannot know

This list is shorter but more important, because it is where vendors' marketing tends to drift.

- **Who scanned.** No name, no phone number, no email, no account. The request carries none of these and nothing could ask for them.
- **The same person over time.** No cookie, no stable identifier. A daily hash is the most that can honestly be offered.
- **GPS position.** The phone's location services are never involved. A camera app does not attach coordinates to a URL.
- **Screen size, scroll, time on page, taps.** These require JavaScript running on the phone, and a redirect never runs any. They belong to the destination page's own analytics.
- **What happened after the redirect.** Whether they bought, booked or bounced is invisible from the redirect. Join the two sides with [UTM parameters](/blog/qr-code-utm-parameters-google-analytics).
- **Scans that never reached the redirect.** A static code goes straight to the destination. A dynamic code photographed but not opened is not a scan. A phone that decoded the code and showed the URL, then had the notification dismissed, is not a scan.
- **Anything about a scan the phone declined to send.** If the phone sends a Global Privacy Control or Do Not Track signal, QRly records a count, a country and a device class, and drops the rest.

> A dynamic QR code's analytics are one web server's view of one request. Anything a vendor claims beyond that is either running a script on the destination page or is not true.

## Accuracy in practice

Some rough expectations, from running the thing rather than from a benchmark:

- Country is right nearly every time. The exceptions are VPNs and a few carriers with cross-border gateways.
- City is right often enough to plan around, wrong often enough that you should never read a single scan's city as fact.
- Device and OS are right whenever the phone is honest, which is almost always for consumer phones.
- Bot filtering removes the obvious automated traffic. A slow trickle of one or two unclassified fetches per day on a widely shared link is normal.
- Unique counts are conservative within a day (two people behind one office NAT with identical phones collide) and overstated across days (everyone comes back new).

The thing to keep in mind is that all of these are distributions, and distributions are what the questions are about. "Mostly iPhones, mostly evenings, mostly within the city" is exactly what the data can support. "This person scanned twice" is not.

## Frequently asked

**Does a QR code collect personal data?**
The request carries an IP address, which is personal data in most jurisdictions until it is discarded. QRly uses it for the lookups above and a daily hash and does not store it. The stored fields — city, device, hour, language — are not tied to any person. [GDPR and QR code tracking](/blog/gdpr-and-qr-code-tracking) has the longer version.

**Can a QR code see my phone number or contacts?**
No. Opening a URL sends the headers listed above and nothing else. A web page could ask for permissions afterwards; a redirect cannot.

**Can QR code analytics tell me how long someone stayed on my page?**
No. That needs a script on the page, which is your site's analytics, not the QR code's.

**Why do some scans show as "unknown" for a field?**
The source did not supply it. Some networks return no city; some privacy browsers send a reduced user agent; a GPC signal blanks most fields on purpose. Unknown is the honest value.

**Is a static QR code tracked at all?**
Not by the generator. The scan goes from the phone to your destination and only your own server sees it. [Free QR code tracking](/blog/free-qr-code-tracking) explains why only dynamic codes can be counted.
