---
title: Static vs dynamic QR codes — the difference, and which one to print
description: A static QR code contains your link; a dynamic one contains a short link that redirects to it. That decides whether the code can be edited, counted or switched off.
date: 2026-09-19
category: basics
keywords: static vs dynamic qr code, difference between static and dynamic qr code, dynamic qr code, static qr code, editable qr code, qr code redirect, which qr code to use
---

Every QR code generator offers a choice between *static* and *dynamic*, and most explain it in a sentence that leaves you no wiser: *dynamic codes are editable and trackable*. True, but it does not say why, and without the why you cannot judge the trade-offs — including the ones the generator would rather you did not notice.

The whole distinction is one fact: **what text is inside the code**.

## What each one contains

A QR code encodes a string of text. The phone decodes it and, if it looks like a web address, opens it. [How a phone reads a QR code](/blog/what-is-a-qr-code) covers the mechanics; for this post, the only thing that matters is the string.

**A static code contains your destination.** `https://example.com/menu`, exactly. The phone opens it directly. Nothing else is involved — no server, no vendor, no account. The code and the link are the same thing.

**A dynamic code contains a short link.** `https://qrly.lol/menu`, say. The phone opens that, a redirect server looks up where `menu` currently points, and answers with a 302 redirect to `https://example.com/menu`. The phone follows it. The scanner sees the same page, half a second later.

Every difference between the two follows from that one indirection.

## The comparison

| | Static | Dynamic |
|---|---|---|
| What the code contains | Your URL | A short link on the generator's domain |
| Can the destination change after printing | No | Yes, by editing the short link |
| Can scans be counted | No, nothing sees the scan | Yes, at the redirect |
| Depends on a third party | No | Yes, the redirect server |
| Can be switched off by someone else | No | Yes, if the vendor stops redirecting |
| Can expire | No | Only if the vendor or you decide it does |
| Code size for a long URL | Large, more modules | Small, the short link is short |
| Non-URL payloads (Wi-Fi, vCard, tel:) | Yes | No, only URLs can redirect |
| Works with no internet | For non-URL payloads, yes | No, the redirect is a network request |
| Cost to the generator | Nothing | A database row and a redirect per scan |
| Needs an account | No | To edit, usually yes |

Two rows deserve a closer look, because they are where people get burned.

## Dependency: the row that decides whether to trust a generator

A static code depends on nobody. It will work for as long as your URL does, and no vendor can interfere, because no vendor is involved after the moment it is drawn.

A dynamic code depends on the redirect server answering, indefinitely. That is a service, and services have terms. On many generators the free dynamic code is a trial; after it ends, the redirect stops and the printed code lands on an error page or an advert. Others cap scans per month or delete inactive links. The code has not changed; the service behind it has. [Do QR codes expire](/blog/free-qr-code-no-expiration) goes through each of those failure modes.

So the question to ask before printing a dynamic code is not "is it free" but "is the redirect guaranteed, indefinitely, without a condition". QRly's answer is that there is no paid plan, no trial, no scan cap and no inactivity rule; the platform costs [$0 a month](/cost) to operate on free cloud tiers, and the [source is open](https://github.com/HK-0811/QRly). The remaining dependency — on the platform continuing to exist — is addressed by a [custom domain](/blog/custom-domain-qr-code): if the printed code contains `qr.yourbrand.com`, you can re-point that hostname anywhere.

## Editability: the row that decides whether to reprint

A static code is a fixed fact. Print it on a thousand boxes and the URL in it is the URL forever. If the page moves, the site is redesigned, the campaign ends, or the marketing agency loses the domain, every box is wrong. The only fix is to keep the old URL alive with a redirect of your own — which is a dynamic code you built by hand, without the tooling.

A dynamic code's destination is a database row. Change it from the dashboard and the next scan, anywhere in the world, goes to the new page. On QRly the change propagates to every edge location in under a minute. The printed code has not changed and never will; only what it resolves to.

That is why the short link in a dynamic code must be **immutable**. Once `qrly.lol/menu` is printed, the slug `menu` cannot be renamed, ever — it is enforced at the database level, because a renamed slug is a dead print. [Why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) goes into the reasoning; the practical rule is to pick the slug as carefully as a filename you can never change.

## Tracking: what a dynamic code can and cannot tell you

Because every scan of a dynamic code is an HTTP request to the redirect server, the server can count it. What it knows is what any web server knows from a request: the time, the country and rough city from the IP address, the device and browser from the user agent, the language, the referrer (none, for a real camera scan). On QRly that is recorded with no cookie, no pixel and no script on the scanner's phone — a redirect response cannot run one — and the IP is used to derive the geo fields and then discarded. The [privacy page](/privacy) lists every field.

What it cannot know: who the person is, whether they are the same person who scanned yesterday (unique visitors are counted per day, by design), or exactly where they stood (city-level, and VPNs mislocate). [QR code analytics: what you can actually know](/blog/qr-code-analytics-what-you-can-actually-know) draws the line honestly.

A static code can tell you none of this, because nothing sees the scan. If you need a count, it has to be dynamic — or you put a UTM parameter in a static code's URL and let your web analytics count the landing, which works, but only if the page has analytics and the scanner has not blocked them.

## Size: the row nobody mentions

A QR code's density grows with the length of its text. A 25-character short link fits in a version 2 or 3 code — around 25 to 29 modules a side. A 110-character URL with campaign parameters needs a version 7 or more, with 45 modules a side, each one nearly half the size at the same print dimension. Smaller modules are harder to read from a distance or at an angle.

So a dynamic code is, as a side-effect, usually a *better* code physically. [Why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) has the numbers.

## Which to use

| Job | Use | Because |
|---|---|---|
| Wi-Fi, vCard, phone number, SMS, plain text | Static | Not a URL; there is nothing to redirect. Use a phone's built-in tool or any static generator. |
| A link in a book, on a plaque, in a legal document | Static | Must not depend on anyone, ever. |
| A link you will never change and never need to count | Static | Simplest possible thing. |
| A menu, a campaign, a product page, an event | Dynamic | The page will change; the print will not. |
| Anything you want a scan count for | Dynamic | Nothing else sees the scan. |
| Packaging, signage, anything with a life of years | Dynamic, on your own domain | The indirection must outlive the vendor. |
| A code you are not sure about yet | Dynamic | You can fix it after printing. You cannot fix a static one. |

QRly makes dynamic URL codes only. It does not make Wi-Fi, contact, phone or text codes, and it does not pretend to; for those, a static code from your phone's own settings or any static generator is correct. For everything that is a link, [make a code](/create) with no account and decide later whether to claim it.

If you have not yet chosen a generator at all, [what "free" actually means](/blog/free-qr-code-generator) is the post to read before this one.

## Frequently asked

**What is the difference between a static and a dynamic QR code?**
A static code contains your URL directly. A dynamic code contains a short link that redirects to your URL. The redirect is what makes a dynamic code editable and countable, and also what makes it dependent on the service that runs it.

**Can you tell if a QR code is static or dynamic by looking?**
Not from the pattern, but from what it decodes to. Point a phone at it and read the text. Your domain means static; a short link on someone else's domain means dynamic.

**Are dynamic QR codes always paid?**
No. The redirect costs a fraction of a cent per thousand scans and runs on free cloud tiers. Many vendors charge for it, and [why dynamic QR codes cost money](/blog/why-dynamic-qr-codes-cost-money) explains the market; QRly does not charge because there is no cost to pass on.

**Can a static QR code be tracked?**
Not by the code. If the URL carries UTM parameters, your web analytics can attribute the landing, but the scan itself is invisible. Only a redirect can count scans.

**Can I convert a static QR code to a dynamic one?**
Not a printed one; the text in it is fixed. You can make a new dynamic code and reprint. For unprinted static codes, just regenerate as dynamic before they go anywhere.
