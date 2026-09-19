---
title: QR code scan time analytics: when people scan, in their own timezone
description: Hour and weekday of a scan only mean something in the scanner's local time. How that is derived, how to read the heatmap, and the timezone mistakes that make it lie.
date: 2026-09-19
category: analytics
keywords: qr code scan time, when are qr codes scanned, qr code hour of day analytics, qr code heatmap, best time for qr code scans, qr code weekday analytics, qr code timing
---

Of all the fields a QR redirect can record, the time of the scan is the one that most often changes what somebody does next. A restaurant that learns its menu code is scanned mostly between seven and nine in the evening has learned when to staff the kitchen. A conference that sees a spike at every coffee break has learned where to put the sponsor's banner.

But a timestamp is only useful if it is in the right timezone, and most dashboards get this wrong in a way that is hard to notice. This is how scan time works on [QRly](/), how to read the heatmap, and where it can mislead.

## Server time, your time, and their time

A scan arrives at the redirect with a timestamp in UTC. That is what gets stored, and it is exact. The question is what to convert it to before showing it on a chart, and there are three candidates:

1. **UTC.** Honest but useless for a shop in Melbourne.
2. **The account owner's timezone.** What most analytics products do. It is fine while your scanners are in the same place you are, and silently wrong the moment they are not.
3. **The scanner's timezone.** What the question actually is: when, in *their* day, did they scan?

The failure of option two is quiet. A campaign running in Mumbai read from an office in London shows its lunch peak at 08:00. Nobody notices because 08:00 is a plausible time for a scan. A code on packaging sold in four countries produces a heatmap that is the sum of four shifted daily curves and looks like nothing at all.

QRly records the **local hour and weekday for each scan in the scanner's own timezone**, and that is what the heatmap is drawn from. Two scans at the same wall-clock moment in Sydney and Lisbon land in different cells, which is correct.

## Where the scanner's timezone comes from

The phone does not send its clock setting in a web request. What the redirect has is the IP address, and the Cloudflare edge that receives the request resolves that address to a location and to the timezone of that location. The local hour and weekday are computed from the UTC timestamp and that timezone, and stored as two small numbers. The IP itself is then discarded.

That means scan time inherits the accuracy of [IP geolocation](/blog/qr-code-location-tracking), which is good for country, decent for city, and can be off for phones on mobile data whose carrier routes them through a gateway elsewhere. Within a single country with one timezone, a wrong city does not matter for the hour. Across a large country with several zones, or for a VPN user placed on another continent, it does.

In practice the error is small for most links. A code placed in one city is mostly scanned in that city, and the few scans mislocated by a carrier gateway are usually mislocated to a city in the same zone.

## Reading the heatmap

The dashboard shows a grid: seven rows for the weekdays, twenty-four columns for the hours, each cell shaded by how many scans landed there. It is the most information-dense chart on the page, and a few readings are worth learning.

**A fixture.** A menu, a shop sign, a museum label. Expect a stable weekly pattern: the same hours on the same days, week after week. The cells that are dark are your opening hours as your customers experience them. If the dark cells stop earlier than you close, people are not scanning in your last hour, which might mean they are not there or might mean the code is not visible under the evening lighting.

**A one-off.** A flyer drop, a mailer, a newspaper advert. Expect a burst on delivery day and a tail. The heatmap is less useful than the time series here, but it will still show whether the tail scans happen in the evening (people read it at home) or in working hours (it went to offices).

**An event.** A conference badge, a stage screen, a stand. Expect sharp cells that correspond to the programme. Compare the heatmap with the agenda and it will tell you which sessions people scanned during, which usually means which sessions people were bored in.

**A product.** Packaging sold across regions. Because each scan is in its own local time, the pattern should still look like a human day — evenings and weekends for consumer goods, working hours for trade products. If it does not, check the countries list: a large share from a place where the product is not sold usually means the short link is circulating online.

The pattern to be suspicious of is a **flat one**. Human scanning is never flat across the night. A code that shows steady scans at three in the morning is being fetched by something automated, and the bot filter is either missing it or you have switched bots on in the filter.

## What time data is good for

The uses that hold up:

- **Staffing and stock.** If scans of an ordering code cluster at particular hours, that is demand, measured for free.
- **When to change the destination.** A dynamic code's destination can be [edited after printing](/blog/how-to-change-a-qr-code-link-after-printing). If a code is scanned almost entirely on Saturday mornings, that is when a changed destination will be seen, and also the worst possible time to have it broken.
- **When to post.** The hours at which a poster is scanned are the hours at which the same people are on their phones and looking at you.
- **Distinguishing placements.** Two codes for the same campaign, one on a bus shelter and one in a lift lobby, will have different heatmaps even if they have similar totals. The shape tells you what each placement is for.

The uses that do not hold up: reading anything from a single scan's hour, or from a link with a few dozen scans. A heatmap needs a few hundred scans before its shape is the pattern rather than the noise. Below that, the time series and the totals are the better charts.

## Timezone pitfalls

**Daylight saving.** The stored local hour already accounts for it, because the conversion uses the zone's rules for that date. But a fixture that runs across a clock change may show its peak drift by an hour in the weeks either side, because customers' habits move with the sun rather than with the clock.

**Multi-zone countries.** A national campaign in the United States, Australia, Russia, Brazil or Canada is scanned across several zones. Per-scan local time handles this correctly; a dashboard that converts to one zone would blur it. If you want to see each zone separately, filter by region.

**VPNs and privacy relays.** A scan that is geolocated to the wrong continent gets that continent's hour. It is a small share of scans on most links and it shows up as a scattering of cells at implausible hours.

**Your own test scans.** They happen when you are at your desk. On a new link with few scans they dominate the heatmap. Ignore the first few days, or filter them out by date.

**Corporate networks.** A scan from a company that routes traffic through a head office in another country gets head office's hour. This matters for codes in internal documents and almost nowhere else.

## Time and privacy

Storing an hour and a weekday, rather than a full timestamp with a location, is a deliberate reduction. Combined with a city and a device class it still cannot pick out a person, and the daily-rotating [visitor hash](/blog/unique-vs-total-qr-code-scans) cannot link one day's scans to the next. The timestamp of each event is kept for the time series and removed when the account's retention window passes. The full list of stored fields is on [the privacy page](/privacy).

## Frequently asked

**What time of day are QR codes scanned most?**
Whenever the thing they are on is in front of people. There is no general answer; a menu peaks at meal times, a poster at commuting hours, packaging in the evening. Your own heatmap is the only one that applies.

**Is the scan time in my timezone or the scanner's?**
On QRly, the scanner's, derived from the location of their connection. That is what makes the hour meaningful when your scanners are not where you are.

**How accurate is the scanner's timezone?**
As accurate as the city lookup. Right for most fixed and mobile connections in the same zone as the code; wrong for VPNs and for some mobile gateways in multi-zone countries.

**How many scans do I need before the heatmap means anything?**
Enough that the pattern stops changing week to week — a few hundred for a fixture. On a link with fewer, read the time series instead.

**Can I see scans for one weekday or hour only?**
The heatmap shows all of them at once, and the dashboard filters by date range, country, device and other fields. Pick a range that contains only the days you care about.
