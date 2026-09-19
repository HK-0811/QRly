---
title: Reusable QR codes: one printed code, repointed as often as you need
description: How one printed QR code can serve a menu, then a seasonal menu, then an event, with its scan history intact, and why a reusable static code cannot exist.
date: 2026-09-19
category: dynamic
keywords: reusable qr code, qr code you can reuse, one qr code multiple uses, repurpose qr code, reuse qr code for different link, dynamic qr code, permanent qr code
---

The most useful QR code in a café is the one on the table tent, and the reason is not what it points at. It is that it has been pointing at different things for two years — the menu, then the winter menu, then a Christmas booking form, then the menu again — and has never been reprinted. One code, laminated once, repointed a dozen times.

That is a reusable QR code. It is not a special kind of code; it is an ordinary dynamic code used the way dynamic codes are meant to be used. This post is about the pattern, what carries over between uses, and why it only works with one kind of code.

## What makes a code reusable

A QR code encodes text. A [static code](/blog/static-vs-dynamic-qr-codes) encodes your destination URL directly, so the code and the destination are the same thing. To reuse it for a different destination, you would have to change the text, which means a different pattern, which means a new code. A static code has exactly one use, for as long as that one URL is right.

A dynamic code encodes a short link, `qrly.lol/table-tent` say, and the redirect service maps that short link to a destination it looks up on every scan. Reusing the code means changing the row in the database. The pattern on the table stays put.

So *reusable* is a property of where the destination is stored. If it is in the ink, the code is single-use. If it is in a database the ink refers to, the code is reusable for the life of the print, which for a laminated card is years.

The technical detail that makes this work is that the redirect is an HTTP 302 rather than a 301. A 301 is cached by the phone, so a code that had been scanned before a repoint would keep going to the old destination on that phone. [QR code redirects explained](/blog/qr-code-redirect-explained) has the reasoning; the consequence is that on a 302, every scan asks the server, so a repoint reaches every phone.

## The table-tent code, as a worked example

Take a single code on a café table, made on QRly with the slug `table-tent`. Its life over a year:

| When | Destination | Why |
|---|---|---|
| January | The menu page | Its ordinary job |
| February | A Valentine's set menu | Two-week promotion |
| March | The menu page again | Promotion over; one edit reverts it |
| June | The summer menu | Seasonal change |
| September | A feedback form | Two-week push for reviews |
| October | The menu page | Back to normal |
| December | A Christmas booking page | Event bookings |

Seven destinations, one print. Each change is a single edit in the dashboard that reaches every scanner in under 60 seconds. With static codes that is seven print runs, or, more realistically, one print run and six promotions that never got a code at all.

The slug is `table-tent`, not `menu`, and that is a small but real decision. A [custom short link](/blog/custom-short-link-qr-code) is permanent once saved, so a reusable code should be named for the place it lives, not the page it points to today. `menu` is wrong the day it points at a booking form; `table-tent` is right forever.

## What carries over between uses

Because the link is the same link throughout, everything attached to it persists across repoints.

**The analytics are one continuous record.** The dashboard shows scans over time for the link, and you can see the September feedback push as a bump in the same series as the December bookings. You can compare the two directly, because they were measured by the same code in the same place under the same conditions. That is a cleaner comparison than two separate codes would give, and it is the basis of measuring print over time.

**Scan history is not lost on repoint.** Nothing is reset when the destination changes. Total scans, the daily unique count, the country and city breakdown, the hour-by-weekday heatmap — all of it continues.

**The design is unchanged.** The printed code encodes the short link, so any logo or colour it was printed with is irrelevant to the repoint. You can re-export it with a new design for the next print run, and old and new prints behave identically.

One thing does *not* carry over automatically, and it is worth handling deliberately: **which destination a given scan went to.** The analytics record the scan against the link, not against the destination at that moment. If it matters later that September's scans went to the feedback form and October's went to the menu, keep a note of the dates you changed it. A simple way is to add a UTM parameter to each destination — `utm_campaign=feedback-sept` — so the destination's own analytics know, as described in [UTM parameters for QR codes](/blog/qr-code-utm-parameters-google-analytics).

## Reusable codes beyond the café

The same pattern fits anything printed once and used for a long time.

- **A shop window.** One code by the door, pointing at whatever the current thing is: opening hours, a sale, a recruitment page, the Christmas closing dates. Most retail print benefits from this.
- **A business card.** Printed with a code to your portfolio; two jobs later, repointed to a new one. The cards in other people's drawers still work.
- **A vehicle.** A code on a van's rear door that goes to a quote form this year and a new services page next year, without a new wrap.
- **Equipment and asset tags.** A code on a machine that points at the manual, then at a maintenance log, then at the disposal form when the machine is retired. Asset tags are reusable by nature.
- **Event materials.** A banner reused for an annual event: point it at this year's page, expire it afterwards, revive it next year.
- **A classroom door.** The same code pointing at this term's timetable, then a parents' evening booking form, then next term's timetable.

In every case the discipline is the same. Print the code once, on something durable, name the link for the place, and treat the destination as the thing you manage.

## The alternative that does not exist

Every so often someone asks for a *reusable static code*: a code with no third party involved that can nonetheless be repointed. It cannot exist, and the reason is worth stating because the request is reasonable.

A code with no third party involved contains the destination, by definition. Repointing it means changing the destination, which means changing the code. The only way to have a code that stays fixed while the destination moves is to put something between them — a redirect — and that something is a third party unless you run it yourself.

There is a middle position, and for long-lived print it is the right one. Put the redirect on **your own hostname**. QRly's [custom domains](/blog/custom-domain-qr-code) let the printed short link be `qr.yourbrand.com/table-tent`; the redirect is still served by the platform, but the hostname is yours. If the platform ever changed, you would point the hostname at a different redirect — another service, or a rule on your own web server — and the print would keep working. That is as close to a reusable code with no dependency as physics allows: the one dependency is a domain you already own.

## Making one on QRly

[Make a code](/create), give it a slug named for where it will live, download the SVG, and print it once on something that will last. Claim the link in an account before the print goes out; anonymous links can be claimed later from the same browser, but a reusable code is one you will be editing for years, so do it now.

After that, reusing it is the dashboard, the link, a new destination, save. There is no charge for the edit, no limit on the number of them, and no expiry unless you set one. The [free dynamic QR code generator](/blog/free-dynamic-qr-code-generator) post lists what the link includes, on its first use or its fortieth.

## Frequently asked

**Can I reuse a QR code for a different link?**
If it is a dynamic code, yes: change the destination in the dashboard and every printed copy follows within a minute. If it is a static code, no; it contains the URL and would have to be reprinted.

**Can one QR code go to multiple places at once?**
Not simultaneously; a link has one destination at a time. It can go to different places over time, which is what reusable means. For choosing by device or language, have the destination page do the routing.

**Do I lose the scan statistics when I repoint a code?**
No. The analytics belong to the link, not the destination, and continue as one record across every change. Note the dates you changed the destination if you will want to attribute scans later.

**How many times can I change where a QR code goes?**
As often as you like. Each change is a single edit, propagated in under 60 seconds, with no count and no fee.

**Is a reusable QR code safe to print on something permanent?**
The safest form is a dynamic code on a custom domain you own, so the print depends on your hostname rather than the platform's. On QRly that costs nothing beyond one CNAME record.
