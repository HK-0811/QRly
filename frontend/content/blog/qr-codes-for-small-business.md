---
title: QR codes for small business: the five uses that actually pay off
description: Reviews, menu, contact, offers and social are the five QR code uses that earn their space in a small business, and why a free dynamic code beats a static one.
date: 2026-09-19
category: business
keywords: qr code for small business, small business qr code free, qr codes for business, free qr code for business, qr code for shop, dynamic qr code small business, qr code marketing small business
---

Most small businesses that try QR codes put one on something, watch nothing happen, and decide the format is dead. Usually the code was fine. It was pointing at the home page, with no reason to scan it, on a surface nobody looks at for more than a second.

A QR code is a shortcut. It pays off when the thing on the other end is something the customer wanted anyway and would not have typed a URL to reach. There are about five of those in a typical small business, and they are the same five whether you run a café, a plumbing firm or a shop.

## 1. Reviews

The one with the clearest return. A customer who has just had a good experience is willing to leave a review for about as long as it takes to walk to the car. A code on the receipt, the counter or the table card that opens the review form directly — not your listing, the *write a review* form — catches that window.

Point it at the direct review link from your Google Business Profile. [The Google reviews post](/blog/qr-code-for-google-reviews) covers how to get that link and what to put around the code so people know what it does.

Tracking note: scans against reviews received tells you what fraction of people who tried actually finished. If it is low, the form is asking too much or the link lands in the wrong place.

## 2. The menu, catalogue or price list

Anything that changes more often than you reprint. Menus are the obvious case — [the restaurant menu post](/blog/qr-code-for-restaurant-menu) goes into that in detail — but the same logic applies to a salon's price list, a builder's services page, a shop's current stock.

The point is not the code; it is that the printed thing on the wall stays right when the prices move. That only works with a dynamic code, which is the subject of the section after next.

## 3. Contact and booking

On the van, the shop window, the business card, the invoice. A code that opens a page with a tap-to-call number, a booking link, opening hours and a map pin removes the step where the customer has to remember your name well enough to search for it later.

Do not encode a phone number directly unless you are certain it will never change. A dynamic code to a small contact page is more useful, because you can add a WhatsApp link or a booking form later without touching the print. [The business card post](/blog/qr-code-for-business-card) covers the trade-offs.

## 4. Offers

A code on a flyer, a bag stuffer or a receipt that opens a specific offer. This is where tracking earns its keep: if you hand out 500 flyers and 30 people scan, you know that. With a paper coupon you know roughly how many came back and nothing about the rest.

Set an expiry date on the link so the offer ends itself; after the date, the code shows an expired page rather than a stale one. [Coupons and discounts](/blog/qr-code-for-coupons-and-discounts) has the details.

## 5. Social

Instagram, Facebook, whichever one you actually post on. A code on the counter or the packaging that opens your profile is the lowest-effort follow you will ever get. It works because the customer is already holding a phone and already in the shop; it fails when the profile has nothing on it.

One code, one profile. A code that opens a "link in bio" page with six options gets fewer follows than a code that opens the one that matters.

## Why free and dynamic matters more at small scale

The difference between a static and a dynamic QR code is explained properly in [static vs dynamic](/blog/static-vs-dynamic-qr-codes). The short version: a static code contains your URL and is permanent; a dynamic code contains a short link that redirects to your URL, which is what makes it editable and countable.

For a large company the choice barely matters, because they reprint constantly. For a small business the dynamic code matters more, not less:

- **You reprint rarely.** The menu board, the window vinyl and the van livery are done once and left for years. The destination behind them will change several times in that period.
- **You cannot afford a dead code.** Five hundred flyers with a wrong link is a real loss when five hundred is the whole run.
- **You have no other analytics.** A chain has footfall counters and loyalty data. You have the till and your memory. Scan counts per surface are the cheapest data you will get on what customers notice.

The catch is that dynamic codes are where generators charge. The model is usually a monthly fee per account, sometimes per code, sometimes with a scan cap, and often a free trial whose codes stop redirecting when it ends. The [pricing explainer](/blog/qr-code-generator-pricing-explained) walks through the models, and [the cost page](/cost) puts what the incumbents publish next to what the thing actually costs to run.

QRly is a dynamic generator that is free, with no paid tier to be upgraded into. It runs on Cloudflare and Supabase free tiers and is [open source](https://github.com/HK-0811/QRly), so the claim is checkable. For a small business the practical consequences are:

| What you need | How it works on QRly |
|---|---|
| Codes for all five uses | One account, as many links as you need, no per-code fee |
| Change the menu link after the board is printed | Edit the destination in the dashboard; live everywhere in under 60 seconds |
| An offer that ends on a date | Set an expiry on the link; scans after it see an expired page |
| Know which surface gets scanned | Per-link scans, unique visitors per day, city, device, hour of day |
| A code that survives the generator | Put it on your own domain via a CNAME, so the print contains your hostname |
| Try before signing up | The [home page](/) makes a working code without an account |

The penultimate row matters more than it looks. A code whose printed content is `qrly.lol/<slug>` depends on qrly.lol. A code on `qr.yourshop.com` depends on your DNS, which you control. The [custom domain post](/blog/custom-domain-qr-code) explains how that is set up.

## One account, one habit

In practice this is not five separate projects. It is one account with one link per surface, named for where it lives: `counter-reviews`, `window-contact`, `flyer-sept-offer`, `bag-instagram`. Each surface gets its own code, even when two of them point at the same page, because that is the only way to learn which surface is working.

Every few weeks, look at the dashboard. The numbers will be small — a corner shop is not going to see thousands of scans — but small numbers still rank. If the window code out-scans the receipt code five to one, the next offer goes in the window.

When something changes — a new menu, a new booking system, a new phone number — the print stays where it is. You change the link.

## Things that do not pay off

For balance, three uses that usually disappoint:

- **A code to the home page** with no stated reason. Nobody scans a code that does not say what it opens.
- **A code on a website.** The reader is already online; give them a link.
- **A code on something moving.** A van in traffic, a rotating sign. Vans work when parked, with the code at eye height on the side, not on the back doors.

[Where to place a QR code](/blog/where-to-place-a-qr-code) covers the physical side: height, distance, lighting and size.

## Frequently asked

**Is there a genuinely free QR code for business use?**
Yes. QRly makes dynamic codes with no plan, no watermark and no expiry, for commercial use, and the source is open so the terms cannot quietly change. Static codes from any generator are also free and permanent, but cannot be edited or counted.

**How many QR codes does a small business need?**
One per physical surface, roughly. Five uses across a shop with a window, a counter, receipts and flyers might be six to eight links. There is no per-code cost on QRly, so make one per surface rather than reusing one code everywhere.

**Can I change where a QR code goes after it is printed?**
Only with a dynamic code. The destination is edited in the dashboard and the change reaches scanners within a minute; the printed code does not change. [How to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) walks through it.

**Do customers need an app to scan?**
No. The camera app on any iPhone or Android from the last several years reads QR codes natively. Put a short line of text under the code saying what it opens.

**What size should the code be printed?**
For something held in the hand, 2 cm across is a safe minimum. For a window or wall, scale with distance, roughly one tenth of the distance it will be scanned from. The [size guide](/blog/qr-code-size-guide) has the working.
