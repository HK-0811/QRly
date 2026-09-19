---
title: QR code location tracking: can a QR code find out where you are?
description: QR scan location is IP geolocation, not GPS. What it resolves to, why carriers and VPNs put scans in the wrong city, and what a dot on a scan map really means.
date: 2026-09-19
category: analytics
keywords: qr code location tracking, can qr codes track location, qr code gps, qr code scan location, qr code geolocation, where was a qr code scanned, qr code map
---

Scan a dynamic QR code and, a few seconds later, the owner's dashboard shows a dot on a map. That looks like location tracking, and in a loose sense it is. In the sense most people mean — the phone's position, the way a maps app knows it — it is not, and cannot be.

This is what a scan's "location" actually is, how it is derived, how far off it can be, and how to read a scan map without fooling yourself.

## GPS is never involved

When a camera app decodes a QR code and opens the URL, it sends an ordinary web request. That request contains a few headers about the browser and language and, unavoidably, comes from an IP address. It does not contain coordinates. Camera apps do not attach the phone's position to a URL, no web standard would let them, and a redirect has no page in which a script could ask for it.

Location services on the phone can only be used by a web page that asks, and only after the person taps "allow" on a browser prompt. A QR redirect is not a page. It is a `302` response that sends the phone somewhere else before anything renders.

So the location a QR dashboard shows is worked out from the IP address, on the server, without the phone's involvement. That process is called IP geolocation and its accuracy is the whole subject.

## What IP geolocation actually resolves to

IP addresses are allocated in blocks to network operators, who announce where those blocks are used. Geolocation databases combine those announcements with other signals to map each block to a country, a region, a city, and a representative coordinate. On QRly the lookup is done by the Cloudflare edge that receives the request; the fields it returns are stored, and the IP itself is discarded.

What comes back, in decreasing order of confidence:

| Field | Typical accuracy |
|---|---|
| Country | Right in nearly all cases |
| Region / state | Usually right |
| City | Often right for fixed broadband; frequently off for mobile |
| Postal code | Rough at best |
| Coordinates | The **centre of the resolved city**, not a position |
| Timezone | Follows the city |

The coordinates are the line to remember. A geolocation database does not know where an IP address *is*; it knows which city it *belongs to*, and returns that city's centroid. Every scan from a given city lands on the same point. When QRly's map places city markers, it is placing centroids by design — the map title says so — and shading countries by volume, because that is the resolution the data honestly supports.

## Why scans land in the wrong city

Three network arrangements account for most of the errors.

**Mobile carriers.** Phones on cellular data do not get an address in the town they are in. The carrier routes traffic through a small number of gateways, often in a regional or national hub, and the public IP address belongs to the gateway. A scan of a poster in a small town may resolve to the nearest large city, or to the capital, or to a city on the other side of the country where the carrier keeps its equipment. Carrier-grade NAT also means thousands of phones share one address at a time, which matters for unique counts as well as for location. Since most QR scans happen on phones, most QR scans are subject to this.

**VPNs and privacy relays.** A VPN puts every scan at the VPN exit node. Apple's iCloud Private Relay, which is on for many Safari users, does something gentler — it preserves a rough region but not the exact network — so those scans resolve to a plausible but not precise city. Some browser privacy modes route traffic similarly.

**Corporate and campus networks.** A company with offices in five cities often sends all its internet traffic through a head-office gateway. A scan from a branch resolves to head office. University and hospital networks behave the same way.

Fixed home broadband is the well-behaved case: the address usually resolves to the right city, and sometimes the right suburb. Home Wi-Fi is also how a fair share of scans happen — a flyer read at the kitchen table — so the picture is not as bad as the carrier problem suggests.

## What "scan location" on a dashboard means

Read a scan map as **the distribution of network locations from which the redirect was requested**. That is a mouthful, but each word is doing work.

- *Distribution*: it is meaningful in aggregate. Fifty scans mostly in one city tells you something. One scan in a surprising city tells you almost nothing.
- *Network locations*: where the address is registered, not where the phone was.
- *Requested*: this is where the scan was opened, which for a flyer taken home might be nowhere near the flyer.

Questions the map can answer well:

- Is this campaign reaching the city it was placed in, or mainly somewhere else?
- Did the poster in one country get scanned from another (a sign the short link was shared online)?
- Which countries scan a product's packaging, roughly in what proportions?

Questions it cannot answer:

- Which shop was this scanned in?
- Was this person at the event?
- Did anyone scan the code on the north side of the street?

For the last kind of question, the only honest tool is a **different code per location**. Two shops, two codes, two counts. That is exact, involves no geolocation at all, and is the approach [measuring print campaigns](/blog/measure-print-campaign-roi-with-qr-codes) is built around.

## Privacy: what is stored, and what is not

Because "location tracking" sounds alarming, it is worth being specific about QRly.

- The IP address is used for the geolocation lookup and for a daily visitor hash, and is then dropped. It is not written to the database or to logs.
- The stored location fields are country, region, city, postal code where the lookup returns one, city-centroid coordinates and timezone.
- If the phone sends a Global Privacy Control or Do Not Track signal, the postal code and coordinates are not stored at all — only the country.
- Nothing on the phone is read, asked for, or run.

The full field list is on [the privacy page](/privacy), and [do QR codes track you](/blog/do-qr-codes-track-you) is written from the scanner's side. The short version is that a scan reveals about as much location as visiting any website does, and less than most, because there is no page to ask for more.

## How QRly shows it

Per link and across the account, the dashboard has a countries list, a regions list, a cities list and a world map. Countries are shaded by scan volume; cities are marked at their centroid with the count. The timezone from the same lookup feeds the hour-and-weekday heatmap, so [scan time analytics](/blog/qr-code-scan-time-analytics) inherits the same accuracy: right when the city is right.

Alongside location, the network panel names the ISP or carrier and classifies the connection as mobile, broadband, corporate or datacentre. That is often the more useful field. A poster whose scans are mostly "mobile" is being scanned in the street; one whose scans are mostly "broadband" is being scanned at home or at work, and its city data is correspondingly more trustworthy.

## Frequently asked

**Can a QR code track my exact location?**
No. A scan sends a web request, not GPS coordinates. The server can estimate a city from the IP address, and that estimate is often wrong for phones on cellular data.

**Can a QR code track location without me knowing?**
It can estimate the city, the same way any website you visit can. It cannot get a precise position without a web page asking for location permission, which a redirect cannot do and which you would see.

**Why does my own test scan show the wrong city?**
Almost certainly because you scanned on mobile data and your carrier's gateway is elsewhere. Scan again on home Wi-Fi and the city will usually correct itself. Neither is a fault in the code.

**Can I get more accurate location from a QR code?**
Only by design, not by measurement: use one code per physical location. The counts are then exact and no geolocation is needed. See [where to place a QR code](/blog/where-to-place-a-qr-code) for how placements differ.

**Does QRly store IP addresses?**
No. The address is used for the lookup and a daily hash during the request and is discarded. What is stored is listed on [the privacy page](/privacy), and the source is open at https://github.com/HK-0811/QRly if you want to check.
