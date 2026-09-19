---
title: What is a dynamic QR code? How it works, with an example you can follow
description: A dynamic QR code encodes a short link that redirects to your real page with a 302. That one extra hop is what lets you edit, track and expire a printed code.
date: 2026-09-19
category: dynamic
keywords: what is a dynamic qr code, dynamic qr code meaning, dynamic qr code example, dynamic qr code, dynamic vs static qr code, editable qr code, qr code redirect
---

A dynamic QR code is an ordinary QR code that contains a short link instead of the real destination. When it is scanned, the short link redirects to wherever its owner has currently pointed it. That is the whole definition. Everything sold under the name, from editing after printing to scan analytics to expiry dates, follows from that one indirection.

The word "dynamic" makes it sound like a different kind of code. It is not. The squares are generated from the same specification, a scanner cannot tell the difference, and there is no flag in the data that says "dynamic". What differs is only the text inside: a static code holds `https://example.com/menu`, a dynamic code holds `https://qrly.lol/menu`, and the second one only means something because a server is waiting to answer for it.

## The mechanics, step by step

Here is what happens in the second or so between a scan and a page, using a QRly link as the example.

1. **The camera decodes the squares** and finds the text `https://qrly.lol/menu`. It shows the domain and offers to open it. Nothing has happened on any server yet.
2. **The phone's browser requests that URL.** A plain HTTP GET to `qrly.lol` for the path `/menu`, with the usual headers: which browser, which language, and so on.
3. **The redirect engine looks up the slug.** `menu` is a key in a small table that maps it to a destination, say `https://example.com/spring-menu.pdf`. On QRly this lookup runs on Cloudflare Workers at the edge nearest the phone, and the table is replicated so it is fast everywhere.
4. **The server answers with a 302.** Not a page. A response with status `302 Found` and a `Location` header holding the destination. On the way out it records the scan: time, country, device class, and the other fields listed on the [privacy page](/privacy), none of which need a cookie or a script.
5. **The browser follows the Location header** and loads `example.com/spring-menu.pdf`. The person scanning sees the menu. They may notice the address bar flick through `qrly.lol` on the way; usually they do not.

Written as the exchange itself, step 4 is about this:

```
GET /menu HTTP/1.1
Host: qrly.lol

HTTP/1.1 302 Found
Location: https://example.com/spring-menu.pdf
```

That is a dynamic QR code. The [redirect explainer](/blog/qr-code-redirect-explained) goes deeper into what the server sees and does, and where it runs.

## Why 302 and not 301

The status code is the detail that decides whether a dynamic code is actually dynamic.

A `301 Moved Permanently` tells the browser the redirect will never change, and browsers take that seriously: they cache it, and on the next visit they go straight to the destination without asking the server. That is efficient, and it is exactly wrong for a QR code, because when you edit the destination, every phone that has scanned before would keep going to the old one. It would also stop counting scans from repeat visitors, since the server never hears from them.

A `302 Found` says the redirect is temporary and the browser should ask again next time. Each scan reaches the server, the server reads the current destination, and an edit takes effect for everyone. QRly uses 302 for every link, always. Combined with the edge lookup, an edit reaches every scanner in under a minute.

## What the indirection lets you do

Three things, and every dynamic generator's feature list is a variation on them.

**Edit the destination after printing.** The printed code says `qrly.lol/menu`, and it will say that forever. What `menu` points to is a row in a table, and rows can change. Spring menu becomes summer menu without touching the print. The [editable code guide](/blog/editable-qr-code) covers the workflow, which on QRly is a field in the dashboard.

**Count and describe the scans.** Because every scan makes a request to the server, the server can count it. It can also read what the request carries: country and city from the IP, device and operating system from the user agent, the local time, whether it came from a camera app or a link someone shared. A static code goes straight to the destination and nobody in the middle sees anything. The [tracking guide](/blog/how-to-track-qr-code-scans) explains what can and cannot be known from a redirect.

**Expire or retire the code.** The table can say "this slug stopped on this date", and scans after that get an expired page instead of a redirect. Useful for offers, event registration and anything with a deadline; the [expiry date guide](/blog/qr-code-with-expiration-date) shows how QRly does it. The same mechanism is what lets a vendor switch off a code when a trial ends, which is the less welcome side of the feature.

## What it costs you

Nothing is free in the engineering sense, and a dynamic code has three costs worth knowing.

**A dependency.** The code works while the redirect is served. If the service stops, every code on it stops, and the print is worthless. This is the real difference between dynamic generators: not features, but whether the redirect will be there in five years. The [free dynamic generator guide](/blog/free-dynamic-qr-code-generator) is mostly about this question.

**An extra hop.** The redirect adds a round trip before the destination loads. At the edge that is tens of milliseconds; on a service with one server in one region it can be a noticeable pause on the far side of the world.

**A visible short link.** The camera shows `qrly.lol`, not your domain. For most uses nobody cares. For a brand that wants its own name in the address, a custom domain puts `qr.yourbrand.com` in the code instead, and has the side benefit that the redirect can be moved to another service without reprinting.

## A worked example

A café prints a table card with a code for its menu. Consider the two versions.

With a static code, the card encodes `cafe.example/menu.pdf`. It works until the café replaces the PDF with a web page at `cafe.example/menu`, at which point every card leads to a 404. New cards are printed. Six months later the café adds a lunch menu and wants to know how many people are looking at it; there is no way to tell, because nothing observes a static scan.

With a dynamic code, the card encodes `qrly.lol/cafemenu`. When the PDF becomes a page, the owner changes the destination in the dashboard; the cards are untouched. The dashboard shows scans per day, which are heaviest from noon to two and at weekends, mostly on iPhones, and, as far as city-level location can say, mostly local. When a winter menu goes live it is one more edit. When the café moves premises, the same cards work at the new address, pointing at a new page.

The second café made a code once. The first will make one every time anything changes.

## Static and dynamic, side by side

| | Static | Dynamic |
|---|---|---|
| Contains | Your URL | A short link |
| Works without any service | Yes | No |
| Editable after printing | No | Yes |
| Scans can be counted | No | Yes |
| Can expire | Never | If the owner or the vendor says so |
| Size of the code | Depends on URL length | Small, since the short link is short |
| Non-URL content (Wi-Fi, vCard) | Yes | No, there is nothing to redirect |

The last two rows are worth a moment. A dynamic code is usually smaller and easier to scan than a static one for the same destination, because a short link is shorter than most URLs. And a dynamic code can only ever be a URL, which is why QRly does not make Wi-Fi or contact codes; those formats have no destination to redirect to. The [full comparison](/blog/static-vs-dynamic-qr-codes) goes through the choice case by case.

## Making one

On QRly, paste the destination on the [home page](/), optionally choose the ending of the short link, and the code and the link exist before any account does. Sign up to edit it or read the scans later. The service is free with no paid plan, the redirect is a 302 at the edge, and the code does not expire; the [cost page](/cost) shows why that is affordable.

## Frequently asked

**What does dynamic QR code mean?**
A QR code whose content is a short link that redirects to the real destination. The code is fixed; the redirect can be changed, counted and expired by whoever controls it.

**Can you tell if a QR code is dynamic by looking at it?**
Not from the squares. Point a camera at it and read the decoded link: if it is a short link on a generator's domain, it is dynamic; if it is the destination itself, it is static.

**Do dynamic QR codes expire?**
Only if the redirect stops being served. On many free services that happens at the end of a trial. On QRly a link is permanent unless its owner sets an expiry date.

**Why does a dynamic QR code use a 302 redirect?**
Because a 302 makes the browser ask the server every time, so an edited destination reaches every scanner and every scan is counted. A 301 would be cached by phones and the edit would never arrive.

**Is a dynamic QR code slower to open?**
By one round trip, which at the edge is a few tens of milliseconds. A scanner does not notice it.
