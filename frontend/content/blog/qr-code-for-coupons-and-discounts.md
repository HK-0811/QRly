---
title: QR code coupons and discount vouchers: what a code can and cannot do
description: How a QR code coupon actually works, why the code itself cannot be single-use, how to end an offer cleanly with a link expiry, and how to give each channel its own code.
date: 2026-09-19
category: use-cases
keywords: qr code coupon, discount qr code, qr code voucher, promo code qr, qr code discount offer, qr code promotion, coupon qr code print
---

A QR code on a flyer that says "scan for 20% off" is a promise the code cannot keep on its own. A QR code is a picture of a URL. It cannot tell one scanner from another, it cannot count down, it cannot be spent. Everything that makes a coupon a coupon happens on the page it opens or at the till. Once that is clear, the design of a QR coupon campaign is straightforward, and the parts that can go wrong are predictable.

## How a QR coupon actually works

The code opens an **offer page**. That page shows the discount, the terms, and one of three things:

1. **A promo code in text** ("use SPRING20 at checkout"), for online redemption;
2. **A screen to show at the till** (the offer, a date, perhaps a barcode the POS can read), for in-store redemption;
3. **A button that applies the discount** directly to a basket, if your shop's checkout accepts a URL with the code in it, for example `yourshop.example/cart?discount=SPRING20`.

The QR code's only job is to get the person to that page, reliably, from print. Every other property of the coupon (who can use it, how many times, until when) is a property of the page or the POS.

## What a QR code cannot do

Worth stating plainly, because coupon campaigns get designed as if the opposite were true.

- **It cannot be single-use.** Every copy of a printed code is identical. Ten thousand flyers carry the same code, and a photo of one flyer is as good as the flyer. If an offer must be redeemed once per person, the page has to issue a unique voucher (a code tied to an email, a login or a one-time link), or the POS has to enforce it. The QR code cannot.
- **It cannot know who scanned it.** Analytics report country, city, device and time at the redirect, with no cookie and no identity. That is deliberate, and it also means the code cannot personalise the offer.
- **It cannot check a basket, a date or a customer's history.** Those are the page's job.

What a *dynamic* code can do, which a static one cannot, is stop, and change. The rest of this post is about using those two abilities well.

## Ending the offer cleanly

The commonest coupon failure is the offer that will not die. The flyer was printed in March, the offer ended in April, and in July people are still arriving at the till with a phone showing 20% off, because the code encoded the offer page's URL and the page is still up.

With a [dynamic code](/blog/what-is-a-dynamic-qr-code) on QRly, set an [expiry date](/blog/qr-code-with-expiration-date) on the link when you make it. After that date, scans land on an "expired" page rather than the offer. Or, better, on the last day, [repoint the code](/blog/how-to-change-a-qr-code-link-after-printing) at a page that says "That offer has ended; here is the current one." Old flyers then keep working as a door into whatever you are offering now, which is more than most print ever manages.

Either way the change reaches every scanner in under a minute, and the flyers in the pile by the door never need touching.

## Rotating the promo code without reprinting

Put the promo code in the **destination**, not in the QR code. The printed code opens `qrly.lol/yourshop-spring`, which redirects to `yourshop.example/offers/spring?code=SPRING20`. When the code leaks to a voucher site, or you want to bump the discount for the last week, change the destination to `...?code=SPRING25` and the flyer carries on. A code printed with the promo code inside the QR payload is stuck with it.

The short link's [custom ending](/blog/custom-short-link-qr-code) is immutable once saved, so choose it for the campaign rather than the specific offer: `yourshop-spring`, not `yourshop-20off`.

## One code per channel

Give every place the offer appears its own link, all pointing at the same offer page:

| Channel | Ending | Why separate |
|---|---|---|
| Flyer through doors | `yourshop-spring-flyer` | Cost per scan of a leaflet drop |
| Receipt footer | `yourshop-spring-receipt` | Repeat-customer response |
| Packaging insert | `yourshop-spring-box` | Online customers coming back |
| Shop window | `yourshop-spring-window` | Passing trade, and hours of the day |
| Partner's counter | `yourshop-spring-partner` | Whether the partnership does anything |

Each has its own scan count, its own [hour and weekday heatmap](/blog/qr-code-scan-time-analytics), and its own city breakdown, which for a leaflet drop shows whether the streets you paid for are the streets that scanned. Add a UTM parameter to each destination (`utm_source=flyer`, `utm_source=receipt`) so the offer page's own analytics see the same split; the [UTM post](/blog/qr-code-utm-parameters-google-analytics) has the details. This is the whole method in [measuring print campaign ROI](/blog/measure-print-campaign-roi-with-qr-codes), applied to one offer.

The same idea works within a channel: two flyer designs, two codes, and the [A/B test](/blog/qr-code-a-b-testing) writes itself.

## Scans versus redemptions

The dashboard counts scans. The POS or the checkout counts redemptions. The gap between them is the number to manage, and it is normally the offer page's fault rather than the code's:

- The page asks for an email before showing the code.
- The terms are longer than the offer.
- The promo code is shown but not copyable, and it is eleven characters.
- The page is not mobile-friendly, and every scanner is on a phone.

QRly's unique visitor count is per day, using a rotating hash, so a person who scans a flyer twice in one evening is one unique that day and a new one if they come back next week. The [unique versus total post](/blog/unique-vs-total-qr-code-scans) explains the reasoning. A scan with no referrer came from a camera; a scan with a referrer came from a shared link, which for a coupon usually means the offer is being passed around, which is either good or the leak you were worried about.

## Printing the code on coupons

Coupons get printed on cheap stock, small, and often on a thermal receipt printer. A few specifics:

- **Receipt printers are low-resolution.** Keep the code at least 2 cm across, at error correction M, with the quiet zone intact, and print a test receipt and scan it before the campaign starts. Thermal paper also fades; a receipt in a wallet for a month may not scan by the end.
- **Flyers and inserts**: 2.5 to 3 cm is comfortable at arm's length. Black on white; the brand colour goes around it, not in it. [Design rules that still scan](/blog/qr-code-design-rules-that-still-scan) covers how far a colour can go.
- **Put the offer next to the code**, in words. "Scan for 20% off your next visit" gets scanned; a bare code gets ignored.
- **Export SVG** for anything going to a print shop, PNG at 1024 or 2048 px for a thermal printer's template. The [formats post](/blog/qr-code-file-formats-svg-png) explains why.

For packaging inserts and receipts there is more in the posts on [retail QR codes](/blog/qr-codes-for-retail-stores) and [product packaging](/blog/qr-code-for-product-packaging).

## Frequently asked

**Can a QR code coupon be used only once?**
Not by itself. Every printed copy is the same code, and a photograph of it is equivalent. Single-use has to be enforced on the page (unique vouchers, a login, a one-time link) or at the till. The QR code gets people to the page; the page does the counting.

**How do I stop a QR coupon after the offer ends?**
Set an expiry date on the dynamic link, or repoint it at a "this offer has ended" page on the last day. A static code that encodes the offer URL directly cannot be stopped without taking the page down.

**Can I change the discount after the flyers are printed?**
Yes, if the promo code lives in the destination URL rather than in the QR code. Edit the destination and the printed code carries on. Every QRly code works this way.

**Does the QR code tell me who redeemed the coupon?**
No. It tells you when and roughly where the code was scanned, on what kind of device, with no cookie and no identity. Redemption is the POS's or the checkout's data. Comparing the two gives you the drop-off.

**Is there a scan limit on a free code?**
No. There is no scan cap, no expiry unless you set one, and no paid tier. The [cost page](/cost) shows why that is sustainable.
