---
title: Measure print campaign ROI with QR codes: one code per placement
description: A separate dynamic QR code per placement, tagged through to conversion, gives each poster and flyer a cost per result. How to set it up and what a scan rate can bear.
date: 2026-09-19
category: analytics
keywords: qr code campaign tracking, measure print advertising with qr codes, print roi qr code, qr code marketing analytics, track print ads with qr codes, qr code conversion tracking, print attribution
---

Print advertising has the oldest problem in marketing: you pay for it and then you guess. A QR code does not solve that entirely, but it turns the guess into a count, and if you set it up carefully the count runs all the way to a sale.

The setup is not complicated. It is one habit, applied consistently, and a little discipline about what the resulting numbers can bear.

## The habit: one code per placement

A dynamic QR code is a short link with a counter behind it. The counter is per link. If the same code goes on the bus shelter, the flyer and the shop window, you get one total and no idea which of the three earned it.

So make a separate code for every placement whose performance you might ever want to compare. On [QRly](/) that is a paste and a slug per placement, no account required to make them and no cost per code, so there is no reason to economise:

| Placement | Slug | Notes |
|---|---|---|
| Shop window A3 | `qrly.lol/sp-window` | Fixture; expect a weekly rhythm |
| Flyer, 2,000 copies, north side | `qrly.lol/sp-flyer-n` | One-off; expect a burst |
| Flyer, 2,000 copies, south side | `qrly.lol/sp-flyer-s` | Same artwork, different distribution |
| Local paper, half page | `qrly.lol/sp-paper` | Dated; the tail tells you the paper's shelf life |
| Delivery bag sticker | `qrly.lol/sp-bag` | Reaches existing customers only |

Every code points at the same destination, or at destinations that differ only in their tags. The person scanning sees no difference. You see five counters.

A "placement" is whatever you would want to compare. Two distribution areas for the same flyer are two placements. The window and the door of the same shop are two placements if you are curious which one people scan; one if you are not.

## Scan, visit, conversion

The QR counter is the first of three numbers, and on its own it is the least interesting.

**Scans** are recorded at the redirect: how many, when, from which city, on what phone. This is QRly's dashboard, and it works without a cookie or script because it sees the request before any page loads. [How to track QR code scans](/blog/how-to-track-qr-code-scans) walks through it.

**Visits** are recorded by your site's analytics when the destination page loads. To attribute them to a placement, the destination URL carries UTM parameters with `utm_content` set per placement — `window-poster`, `flyer-north` and so on. This goes on the destination, not in the code; [UTM parameters for QR codes](/blog/qr-code-utm-parameters-google-analytics) has the scheme.

**Conversions** are whatever you decided the campaign was for: a booking, an order, a sign-up, a voucher redeemed. Your site analytics attributes them to the same UTM values, which means to the same placement.

Set up that way, each placement has three numbers in a row, and two ratios between them:

- **Scans to visits** — how many scanners actually arrived. Below one because some bounce before the page loads, some block analytics, some decline consent. A placement with a much worse ratio than the others usually has a slow page on a poor connection, which the [device and network panels](/blog/qr-code-device-analytics) will show.
- **Visits to conversions** — the destination page's job. The same for every placement if they share a page; different if they do not.

## Comparing channels

With cost added, the table becomes the thing print could never produce:

| Placement | Cost | Scans | Conversions | Cost per scan | Cost per conversion |
|---|---|---|---|---|---|
| Window A3 | small | steady | steady | low | low |
| Flyer north | printing + delivery | burst | some | mid | mid |
| Flyer south | printing + delivery | smaller burst | fewer | higher | higher |
| Local paper | large | modest | few | high | high |
| Bag sticker | negligible | modest | modest | very low | very low |

The numbers are yours to fill; the shape is typical. Some things become visible only in a table like this:

- The paper advert reaches many more people than it converts. Its scans arrive over the paper's shelf life, and a code lets you see that shelf life for the first time.
- The two flyer runs, identical in artwork and cost, differ because the areas differ. That is distribution data, and it is the difference between repeating the north run and repeating both.
- The bag sticker reaches only existing customers, so its low cost per conversion is partly a reflection of who scans it. A cheap channel to a warm audience is still cheap, but it is not comparable to acquisition.

Print's cost per conversion can now sit beside paid search's or social's, computed the same way. That comparison is the point of the exercise, and it is what "print ROI" means in practice: not a return on the whole print budget, but a cost per result per placement, which tells you where to put next quarter's money.

## Closing a campaign

Two features of a dynamic code matter at the end of a campaign as much as the start.

**Expiry.** A QRly link can be given an expiry date, after which scans see an "expired" page instead of the destination. For a dated promotion this stops a February voucher being claimed in June, and it also makes the campaign window explicit in the data: scans after expiry are still counted, so you can see how long the printed material kept circulating after it should have stopped. [QR code with an expiration date](/blog/qr-code-with-expiration-date) explains the options.

**Reuse.** The alternative to expiring a code is redirecting it. The shop window code does not need to die with the spring campaign; edit its destination to the summer one, change the `utm_campaign` tag, and the window keeps its counter and its history while the campaign boundary appears cleanly in your site analytics. Reprinting is only necessary when the artwork changes. [Reusable QR codes](/blog/reusable-qr-code) covers the pattern.

Either way, the slug stays fixed once printed — the platform will not let it change — so the counter never breaks.

## What a scan rate can and cannot tell you

A scan rate — scans divided by impressions, or scans divided by copies printed — is the number people most want and the one to be most careful with.

**It can tell you** which placement, of several with comparable audiences, got more people to act. Two flyers, two areas, same artwork: the difference in scans per thousand copies is real and worth acting on.

**It can tell you** whether a change to the artwork mattered, if you change one thing at a time. [QR code A/B testing](/blog/qr-code-a-b-testing) is the disciplined version.

**It cannot tell you** how many people saw the advert. Impressions for print are estimated by the publisher or by footfall, and a scan rate computed against an estimate inherits its uncertainty.

**It cannot tell you** what the advert did for people who did not scan. Most readers of a print advert never scan anything, and some of them later search for the brand, walk into the shop, or tell a friend. Scans measure the fraction who acted through the code, which is a floor on the advert's effect, not its total. Treat the scan count as a comparison tool between placements, not as the whole return.

**It cannot be compared** across formats with different physical affordances. A poster on a station platform, where people stand still with their phones out, will be scanned far more than a better advert read on a sofa. Comparisons are most reliable within a format and across placements.

## A checklist before the print run

1. One code per placement, slugs that say which is which.
2. UTM tags on the destination with `utm_content` matching the slug.
3. A conversion defined and measured on the site before anything is printed.
4. A test scan of a proof, on mobile data, checked in both dashboards.
5. An expiry date on anything dated, or a note of when to redirect it.
6. The code printed at a [size that scans](/blog/qr-code-print-size-and-resolution) from where people will actually stand.

None of these cost money. Skipping any of them costs the campaign its numbers.

## Frequently asked

**How do I measure the ROI of a print advert with a QR code?**
Give the advert its own dynamic code, tag the destination so your site analytics attributes visits and conversions to it, and divide the advert's cost by the conversions it produced. Compare that figure across placements and against other channels.

**Do I need a paid QR tool for campaign tracking?**
No. Per-link scan counts, location, time and device data are on every QRly code without a plan, and the UTM side runs on whatever site analytics you already have. The [cost page](/cost) shows what it takes to run.

**How many scans is a good response?**
There is no benchmark that transfers between formats and audiences. Compare your placements against each other and against your own previous runs; that comparison is the useful one.

**What if people scan but do not convert?**
Then the destination page is the problem, not the print. The scans-to-visits ratio says whether the page loads; the visits-to-conversions ratio says whether it persuades. Fix the page, and because the code is dynamic, the fix reaches every printed placement in under a minute.
