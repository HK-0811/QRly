---
title: QR codes for retail stores: shelf, product, loyalty, receipt and window
description: Where a QR code earns its place in a shop, from shelf talkers and product pages to loyalty, receipts and the window after closing, and what hour-of-day scans tell you.
date: 2026-09-19
category: business
keywords: qr code retail, in store qr code, shelf qr code, retail qr code ideas, qr code for shop, qr code shelf talker, qr code window display, retail store qr code
---

A shop is the best place a QR code can be. The customer is standing still, holding a phone, looking at a product, and has a question the label does not answer. Every other QR placement is trying to manufacture that situation; the shop floor has it by default.

The trick is not to waste it. A code that opens the home page is a wasted scan. A code that opens the answer to the question the customer had, at the shelf where they had it, is a sale you would otherwise have needed a member of staff for.

## Shelf talkers

The small card at the shelf edge. This is where most of the value in a shop is, because it is where decisions are made.

What to put behind it depends on the product:

- **Considered purchases** (electronics, tools, cosmetics, anything over a certain price): the reviews, a comparison with the product next to it, a two-minute demo video.
- **Products with variants** the shelf cannot hold: other colours, sizes, the range online.
- **Food and drink**: ingredients, allergens, the producer's page, a recipe.
- **Anything with instructions**: the video, not the leaflet.

One code per SKU, or per shelf section if the range is large. This is where a dynamic code pays for itself twice: the destination can be updated when the product changes without reprinting the card, and the scan count per SKU tells you which products customers hesitate over. A product that gets scanned a lot and bought a little has a price or a page problem, and you have now found it without a survey.

Print the code at 2 cm or larger — the customer is at arm's length — with a line of text saying what it opens. [The size guide](/blog/qr-code-size-guide) has the distance rule, and [where to place a QR code](/blog/where-to-place-a-qr-code) covers height, angle and lighting on a shelf.

## Product information and the extended range

Related to the shelf talker but on the product itself, or on the swing tag. For clothing, a code on the tag that opens that item in other sizes and colours, with the option to order for delivery, turns a "we do not have it in your size" into a sale rather than a walk-out.

For anything with packaging, the code on the box that opens the manual or the setup video is [covered in the packaging post](/blog/qr-code-for-product-packaging); in a shop, it is also a pre-purchase reassurance. Someone who can see the setup takes five minutes is more likely to buy the thing.

## Loyalty sign-up

A counter card, a till-point sticker or a code on the bag. It works when the benefit is stated on the card in one line and the form asks for as little as possible.

Track sign-ups against scans. If the form gets 200 scans and 20 completions, the form is the problem, not the code. QRly reports unique visitors per day, so you can distinguish 200 people trying once from 20 people trying ten times each; [unique vs total scans](/blog/unique-vs-total-qr-code-scans) explains what that number does and does not mean.

## Receipts

The receipt is the one piece of paper every customer leaves with, and most tills can print a QR code on it. Two things earn the space:

**A review code**, opening the review form directly, while the customer is at peak goodwill. [The Google reviews post](/blog/qr-code-for-google-reviews) has the direct-link details.

**A feedback form**, short, for the customers who had a problem and would otherwise tell a friend instead of you. [Feedback and surveys](/blog/qr-code-for-feedback-and-surveys) covers keeping the form short enough to complete on a phone.

Both should be dynamic, because the review platform, the form tool and the questions all change, and the till template does not get updated often. If the code is dynamic, you change the link and the receipts follow. Thermal receipt printers are low resolution, so keep the URL short (fewer modules), and test a real receipt with a real phone before assuming it works.

## The window, when the shop is closed

A code on the door or the window is the only part of the shop that works at 9 pm. What it should open:

- **The online shop**, if there is one.
- **The booking page**, for anything appointment-based.
- **Opening hours and a contact page**, at minimum.
- **The menu or the current stock**, for food shops and specialists.

This is the code most likely to be scanned from further away and in poor light, through glass with reflections. Print it larger than feels necessary — 10 cm or more — at chest height, on the inside of the glass with the code facing out, and use plain dark modules on a plain light background. [Dark backgrounds](/blog/qr-code-on-dark-backgrounds) and [inverted codes](/blog/inverted-qr-code-white-on-black) explain why a stylish white-on-black window vinyl is a bad idea for scanning.

## What the hour-of-day data tells you

Every scan on a dynamic code is recorded with the scanner's local hour and weekday, and QRly shows those as a heatmap per link. For a shop, this is unusually useful, because it is a footfall counter you did not have to buy.

| Pattern | What it usually means |
|---|---|
| Shelf code peaks at lunchtime and Saturday afternoon | That is when considered shoppers come; staff the floor then |
| Window code peaks after closing | The window is doing a job the shop cannot; make it a better one |
| Receipt review code peaks in the evening, at home | People act on it later; the card in the bag works as well as the till print |
| Loyalty code is flat across the day | It is being scanned when staff mention it, not spontaneously |

The data is recorded at the redirect, with no script on the customer's phone and no cookie; the [privacy page](/privacy) lists every field. Location is city-level and approximate, which for a shop is redundant anyway — you know where the customer was. [Scan time analytics](/blog/qr-code-scan-time-analytics) goes into the heatmap in detail.

## Reusing codes across seasons

A shop's print is seasonal: window vinyl for the sale, shelf talkers for the range, counter cards for a promotion. With static codes, each season needs new print. With dynamic codes, the print can stay and the destinations move.

The window code that opened the Christmas gift guide in December opens the January sale in January, then the spring range. Same vinyl, three campaigns. The shelf talker for the seasonal bay is reprinted for its new products, but the code on it can be the same one, renamed and repointed, so the year's scan history for that bay stays in one place.

Two cautions. If two campaigns need comparing, use two codes; a reused code cannot separate them. And if a promotion has a hard end date, set an expiry on the link so a card someone kept in a drawer shows an expired page rather than a discount that no longer exists. [Reusable QR codes](/blog/reusable-qr-code) and [QR codes with an expiry date](/blog/qr-code-with-expiration-date) cover both.

## Setting it up

None of this needs a budget line. On QRly a dynamic code is free, without a watermark, an expiry or a scan cap, and there is no per-code fee, so a shop with forty shelf talkers makes forty links. The [home page](/) makes a code without an account; an account is for editing destinations and reading the scan data afterwards, and the anonymous codes you made first can be claimed into it.

Name each link for where it is — `shelf-a3-kettles`, `window-main`, `receipt-review` — and download the SVG for anything going to a printer. For the till, a PNG at 512 pixels is usually what the template wants. [How to print QR codes](/blog/how-to-print-qr-codes) covers the file and resolution choices.

## Frequently asked

**What should a QR code in a shop link to?**
Whatever answers the question the customer has at that spot: reviews or a demo at the shelf, other sizes on the tag, the review form on the receipt, the online shop on the window. Never the home page.

**How big should a shelf QR code be?**
At least 2 cm across, since the customer is at arm's length. On the window, 10 cm or more, because the scanner is further away and shooting through glass.

**Can I see which products get scanned most?**
Yes, if each product or shelf section has its own code. QRly shows scans, unique visitors per day and the hour-and-weekday heatmap per link. That is a direct read on which products customers hesitate over.

**Can I reuse the same printed code for different promotions?**
With a dynamic code, yes: change the destination and the print follows. Use separate codes when you need to compare two campaigns, and set an expiry on time-limited offers.

**Do QR codes on receipts actually scan?**
Usually, if the URL is short and the code is printed at 2 cm or more. Thermal printers are coarse, so test a real receipt rather than a preview. A dynamic code's short URL helps here, because it has fewer modules than a full review link.
