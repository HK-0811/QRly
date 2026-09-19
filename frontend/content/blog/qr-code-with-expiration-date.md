---
title: QR code with an expiration date: temporary and time-limited codes
description: How to make a QR code that stops working after a date you choose, what scanners see afterwards, when a temporary code is useful, and how it differs from vendor expiry.
date: 2026-09-19
category: dynamic
keywords: qr code with expiration date, temporary qr code, qr code that expires after a date, time limited qr code, expiring qr code, qr code expiry, dynamic qr code expiration
---

There are two completely different things people mean by *a QR code that expires*, and they are almost opposites.

One is expiry you choose: a code for an offer that ends on Sunday, a code on a conference lanyard that should stop working when the conference does. The other is expiry imposed on you: a code from a free generator that stops working when the trial ends. This post is about the first kind, how to set one up, and how to make sure you never get the second by accident.

## A QR code cannot expire by itself

A QR code is a pattern that encodes text. There is no clock in it. If the text is your URL, the code will decode to that URL in a hundred years, and whether the URL still works is up to your web server, not the code. A [static code](/blog/static-vs-dynamic-qr-codes) has no expiry mechanism at all.

Expiry, in any form, lives in the redirect. A dynamic code encodes a short link on a redirect service, and the service decides on every scan whether to forward the visitor. That decision can consult a date. So *a QR code with an expiration date* means, precisely, a short link whose redirect checks the time before answering.

This is also why the imposed kind of expiry exists. The same mechanism that lets you switch a code off on a date lets a vendor switch it off when you stop paying. [Free QR codes with no expiration](/blog/free-qr-code-no-expiration) is the checklist for telling the two apart before you print.

## Setting an expiry on QRly

Every QRly link has an optional expiry, off by default. You can set it when you [make the code](/create) or later from the dashboard, and it takes a date and a time, not just a date, so a lunch offer can end at 2pm rather than midnight.

Before the moment you set, the link behaves exactly as any other: a 302 to the destination, scans counted. After it, the redirect engine stops forwarding and instead serves a plain page headed *This QR code has expired*, with the date it expired. No redirect, no destination, no advertising.

Three properties of the implementation are worth knowing.

**It is reversible.** Expiry is a field on the link, not a deletion. Clear it, or move it later, and the code resumes forwarding within a minute — the same propagation window as any other edit. A code for an annual event can be expired after this year's and revived for next year's without reprinting.

**It is checked on every scan.** Because the redirect is a 302 and is never cached, the check happens at the edge each time the code is scanned. A phone that scanned the code at 1:59pm is not remembered at 2:01pm; it gets the expired page like everyone else. [QR code redirects explained](/blog/qr-code-redirect-explained) covers why a 301 would break this.

**Scans after expiry still show up.** The analytics keep recording, so you can see how many people scanned an expired code and where. That number is useful: it tells you how long after a campaign ended the printed material was still in circulation, which is something no other channel can tell you.

What QRly does not have is anything more elaborate: no scan-count limit that expires a code after N scans, no schedule that changes the destination on a date, no start date before which the code is inactive. If you need the destination to change on a date rather than stop, set a reminder and edit it. The [editable destination](/blog/how-to-change-a-qr-code-link-after-printing) takes under a minute to propagate, which is close enough to scheduling for nearly every purpose.

## Where a time-limited code is the right tool

**Offers and discounts.** A code on a flyer for 20% off until the end of the month should not be redeemable in the following month. Expire the link and the flyer becomes inert on the date, no matter how many are still on windscreens. The design of the offer page itself is a separate question.

**Events.** A code on the poster, the ticket or the lanyard that links to the schedule, the venue map or the live stream. After the event it should stop pointing at a page nobody maintains. The code covers the before; expiry covers the after.

**Temporary access.** A code on the door of a rented meeting room, a holiday let, a pop-up shop. It links to the house rules, the Wi-Fi details page, the booking contact — and it should not work for the next tenant. Note that the code links to a *page* holding the details; a QR code cannot itself hold credentials with an expiry, because a Wi-Fi code is static text.

**Recruitment and applications.** A code on a vacancy notice that links to the application form, with the closing date as the expiry. Applications after the deadline get a clear *expired* rather than a form that quietly still accepts them.

**Proofs and previews.** A code you hand to a client to preview a page, set to expire after the meeting, so the link does not circulate afterwards.

**Print you cannot recall.** This is the general case. Anything printed leaves your control the moment it is distributed, and an expiry date is the only way to stop it working without collecting it.

## What to put on the expired page, and what you cannot

The expired page on QRly is a fixed, plain page. It states that the code has expired and when. It is not customisable, and it is served without any script, cookie or tracking, in keeping with the rest of the [privacy model](/privacy).

If you want people who scan after the deadline to land somewhere useful — *this offer has ended, here is the current one* — do not set an expiry. Instead, edit the destination on the date to point at that page. That gives you a branded ending and keeps the code alive for the next campaign, which is the [reusable code](/blog/reusable-qr-code) pattern.

The rule of thumb: use expiry when the right answer after the date is *stop*; use a destination edit when the right answer is *go somewhere else*.

## Expiry you choose versus expiry imposed on you

| | Expiry you set | Expiry a vendor imposes |
|---|---|---|
| Who decides the date | You | The pricing plan, the trial, or an inactivity rule |
| What scanners see afterwards | A plain expired page | Whatever the vendor shows: not found, a deactivation notice, or an advert |
| Reversible | Yes, from the dashboard | Usually by paying |
| Exists on QRly | Yes, optional | No |

The second column is worth reading before printing with any generator. The honest ones say on the pricing page what happens to a free dynamic code after the trial, after a scan cap, or after months without a scan. [Why dynamic codes cost money](/blog/why-dynamic-qr-codes-cost-money) explains what that pricing is paying for; the point here is that a code you did not intend to be temporary should not become one.

QRly has no imposed expiry of any kind. No trial, no scan cap, no inactivity rule. A link expires when you set an expiry on it, and not otherwise.

## Frequently asked

**Can I make a QR code that expires on a certain date?**
Yes, with a dynamic code. On QRly, set an expiry date and time on the link, at creation or later. After that moment, scans get an expired page instead of the destination. A static code cannot expire; it contains the URL directly.

**What do people see when they scan an expired QR code?**
On QRly, a plain page saying the code has expired and when. No redirect, no advert. Other services show whatever their deactivated-link page is.

**Can I un-expire a QR code?**
Yes. Clear the expiry or move it later in the dashboard and the code resumes forwarding within a minute. Nothing is deleted when a code expires.

**Can I make a QR code that expires after a number of scans?**
Not on QRly; expiry is by date and time only. For a limited-quantity offer, put the limit on the offer page itself, which can count redemptions properly.

**Do free QR codes expire?**
Static ones never do. Dynamic ones on a free trial or a capped free tier can, on the vendor's terms. QRly's dynamic codes do not expire unless you set a date.
