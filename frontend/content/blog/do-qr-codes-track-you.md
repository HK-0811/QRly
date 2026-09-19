---
title: Do QR codes track you? What a scan reveals, and what it cannot
description: A static QR code reveals nothing to its maker. A dynamic one sees one HTTP request. What that request contains, what can be derived from it, and what QRly keeps.
date: 2026-09-19
category: privacy
keywords: do qr codes track you, can a qr code track my location, qr code tracking privacy, qr code scan tracking, what data does a qr code collect, qr code privacy, qr code location tracking
---

People ask this in two different tones. One is a scanner wondering whether the code on the menu just told the restaurant where they live. The other is a business wondering whether the analytics they were sold are as precise as the sales page implied. The answer to both is the same, and it depends entirely on one thing: what the code contains.

## Static codes: nothing sees the scan

A static QR code contains the destination address directly. Your camera decodes it, your browser opens it, and the request goes straight to that website. The person who printed the code is not in the loop. They cannot count the scan, let alone learn anything about who made it. The only party that sees anything is the destination site, which sees exactly what it sees when you type the address yourself.

This is why static codes are the right choice for anything that must never be observed, and why they cannot be counted. [Static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes) sets out the trade-off. If you are worried about a specific code, point the camera at it and read the preview: if the domain is the destination itself, nothing in the middle is watching.

## Dynamic codes: the redirect sees one request

A dynamic code contains a short link on a service's domain. Scanning it sends a request to that service, which answers with a redirect to the real page. That one request is the only thing the service ever sees. It has no script on your phone, no cookie from before, no app. It has an HTTP request, which carries:

- **your IP address**, because every request has one;
- **the user-agent string**, which names the browser and operating system, and on Android usually the device model;
- **the Accept-Language header**, your language preferences;
- **a referrer**, if a browser sent one. A camera app sends none, which is how a genuine scan is told apart from a forwarded link;
- **the URL itself**, including any campaign parameters the code's owner put in it;
- **the time**.

From the IP address, a geolocation database gives a country, a region and usually a city, and the name of the network operator. That is what "location" means in QR analytics. It is not GPS. The service has no access to your phone's location services, because it never runs on your phone.

## What can be derived, and how far it goes

| Field | What it actually is | Precision |
|---|---|---|
| Country, region, city | Looked up from the IP address | City-level at best; VPNs and mobile carrier networks routinely land in the wrong city, sometimes the wrong country |
| Coordinates | The centroid of that city | A marker on a city, never on a street |
| Network operator, connection type | The organisation that owns the IP range, and a guess at mobile/broadband/corporate from its name | The network's name, not anyone on it |
| Device, OS, browser | Parsed from the user-agent | Android reports a model; iOS reports "iPhone" |
| Language | The Accept-Language header | Whatever the browser is set to |
| Local time | The timezone of the IP's location, applied to the timestamp | Right when the location is |
| Repeat vs new scan | Only if the service builds an identifier from the request | See below |

What cannot be derived, without running JavaScript on the phone: screen size, battery, installed fonts, hardware, the precise location, anything from previous visits to other sites, and anything about who you are. A redirect returns a status code and a `Location` header; the browser follows it before any page, and therefore any script, could load. A service that shows you an interstitial page before redirecting has given itself the chance to run script, and it is fair to ask why. [QR code analytics: what you can actually know](/blog/qr-code-analytics-what-you-can-actually-know) draws the line in more detail from the business side, and [QR code location tracking](/blog/qr-code-location-tracking) covers the geolocation part specifically.

## The part that varies: what the service keeps

Everything above is what arrives. What a service does with it is a design decision, and it is where services genuinely differ. The two questions worth asking of any provider are whether the IP address is stored, and how "unique visitors" is computed.

Storing the IP address is the easy path. It gives a persistent identifier that links scans across days, across links, and, with enough data, across services. It also means a breach of the analytics database is a breach of visitor addresses. Computing a hash of the IP is only better if the hash cannot be reversed or matched, which depends on what goes into it.

QRly's approach, laid out in full on [the privacy page](/privacy), is:

- **The IP address is discarded.** It is used to look up the location and network fields and to compute the daily identifier, and is then gone. It is not written to any table and not written to any log line.
- **The visitor identifier rotates every 24 hours.** It is a truncated hash of the IP, the user-agent, the link and a salt that is regenerated daily, plus a server-side secret. Yesterday's identifiers cannot be matched against today's even with the same address and the same phone, including by the operator. It also includes the link, so the same person scanning two different codes produces two unrelated values.
- **"Unique visitors" therefore means unique per day.** The dashboard says so. Anyone offering a longer-lived unique count from IP data is either storing something reversible or overstating what they have. [Unique vs total QR code scans](/blog/unique-vs-total-qr-code-scans) covers what the number is good for.
- **Global Privacy Control and Do Not Track are honoured.** A request with `Sec-GPC: 1` or `DNT: 1` is still counted, but recorded with no visitor identifier, no postal code or coordinates and no raw user-agent. What remains is a count with a country and a device class.
- **No script, no cookie, no pixel.** The redirect is a 302 and nothing else. There is no third-party script on any page of the service either.
- **Retention is a setting.** Each account chooses a window, one year by default, and a nightly job deletes scan events older than it. Deleting a link deletes its history; deleting an account deletes everything.

That list is the whole of what a scan of a QRly code produces. The source is [open](https://github.com/HK-0811/QRly), so the claim can be checked against the code rather than the marketing.

## What this means for the person scanning

If the code is static, nobody is watching. If it is dynamic, the redirect service learns roughly what any website learns from a visit: a rough location, a device type, a language, a time. It cannot get your identity, your precise position, or your history from a redirect. What it keeps and for how long is up to the service, and a service that publishes its field list is easier to trust than one that does not.

If you would rather not be counted as a repeat visitor, turning on Global Privacy Control in your browser does that on services that honour it. If you would rather the intermediary saw nothing at all, the destination address is right there in the preview banner; you can type it instead of tapping.

## What this means for the person printing codes

The useful information in scan data is aggregate: which poster is pulling its weight, which city a campaign reached, what time of day people scan, which device to design for. None of that needs an individual to be identified, and the individual-level data that some platforms retain adds nothing to those questions while adding a liability. [GDPR and QR code tracking](/blog/gdpr-and-qr-code-tracking) looks at the regulatory side of that. Choosing a service that collects less is not giving anything up.

> A redirect sees one request and then the phone is gone. Everything a service knows beyond that, it chose to keep.

## Frequently asked

**Can a QR code track my location?**
Only approximately, and only if it is a dynamic code. The redirect service sees your IP address and looks up the city it is registered to. That is often wrong on mobile networks and always wrong through a VPN. It has no access to GPS, because nothing runs on your phone.

**Can a QR code identify me?**
No. A redirect sees an IP address, a browser string and a language, none of which is an identity. A service that stores the IP could link your scans together over time; QRly does not store it, and its visitor identifier expires daily by construction.

**Do QR codes collect personal data?**
A static code collects nothing. A dynamic code's redirect receives the standard HTTP request, which includes an IP address. What is retained varies by service; QRly keeps a city, a device class, a network name and a timestamp, and discards the address.

**Can the person who made the code see who scanned it?**
They see counts and aggregates: how many scans, from which countries and cities, on which devices, at what hours. They do not see names, phone numbers, email addresses or anything that names a person, because none of that reaches a redirect.

**How do I scan a QR code without being tracked?**
Read the destination from the camera preview and type it in yourself, bypassing the redirect entirely. Or enable Global Privacy Control in your browser, which QRly honours by recording the scan with no visitor identifier and no fine-grained location.
