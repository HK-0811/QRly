---
title: Free dynamic QR code generator with no trial, and why most of them are not
description: Most free dynamic QR code generators are trials with an expiry. QRly has no paid plan because its stack costs nothing to run; here is what it does and does not do.
date: 2026-09-19
category: dynamic
keywords: free dynamic qr code generator, dynamic qr code free, free editable qr code, dynamic qr code no trial, free qr code with tracking, free editable qr code no expiry, dynamic qr code generator
---

Search for a free dynamic QR code generator and nearly every result is a paid product with a free door. You make a code, it works, and somewhere between 14 days and a few hundred scans later it stops, because the thing you were using for free was the trial of a subscription. It is the standard business model, and the "free" on the button is technically true, but it catches people whose code is already printed, and it is worth understanding why the model looks like this before picking a tool.

## Why dynamic is where the money is

A static QR code is finished the moment you download it. The generator has no further role, so there is nothing to charge for, which is why static generators are free everywhere and always have been.

A [dynamic code](/blog/what-is-a-dynamic-qr-code) is different in one way: every scan goes to the generator's server first, which redirects it on. That gives the generator two things. A small ongoing cost, since a server has to answer, and complete control, since the server can also decline to answer. The first is the justification for charging; the second is the leverage. Once your code is printed, the redirect is the only thing standing between it and a dead link, and the vendor sets the terms for the redirect.

So the market settled on a shape: free static codes as the hook, dynamic codes as the product, and a free tier of dynamic codes that is limited in one of a few ways. The [pricing explainer](/blog/qr-code-generator-pricing-explained) goes through the models; in brief they are:

| Model | How the free part ends | What to check |
|---|---|---|
| Time-limited trial | After 7, 14 or 30 days the codes deactivate unless you subscribe | Whether the generator page says it is a trial, or only the pricing page does |
| Scan cap | A number of scans per month, after which redirects stop or show an interstitial | What happens on the scan after the cap |
| Code cap with inactivity rule | A few free codes, deleted if unscanned for a period | The inactivity window, and whether you are warned |
| Free with watermark or landing page | Scans see a branded page before your destination | What the scanner experiences, not just what you do |
| One-off "lifetime" payment | It does not end, in theory | Whether the company will |

None of these is dishonest if it is written down where you can see it. The problem is that the generator page rarely says any of it, and the person who finds out is the one holding a box of printed flyers. The [subscription-free guide](/blog/dynamic-qr-code-no-subscription) has the questions to ask, and the [free versus paid comparison](/blog/free-vs-paid-qr-code-generator) covers when paying is actually the right answer.

## What "free" would have to mean

For a dynamic generator to be free in the plain sense, three things have to hold at once: no trial that ends, no cap that trips, and no reason for the operator to switch the redirect off later. The third is the hard one. A free tier that exists to convert people to a paid tier has a reason to make the free tier worse over time. A free tier subsidised by investors has a reason to end when the money does.

The only stable version is a service whose cost of operation is low enough that free is not a loss. That is a question about infrastructure, and it has a concrete answer.

## What QRly does

QRly is a dynamic QR code generator with no paid plan. Not a free tier; the whole thing. What you get:

- **A short link and a code, with no account.** Paste a destination on the [home page](/) or the [create page](/create). The link works and the code is downloadable before any sign-up. Register afterwards to keep it, and the links you made anonymously become yours.
- **An editable destination.** Change where the link points from the dashboard, at any time, as often as you like. The change reaches every edge in under a minute.
- **Scan analytics.** Total scans, unique visitors per day, country and city, device and operating system, browser, language, local hour and weekday, network type, referrer, UTM parameters. Collected at the redirect, from the request, with no cookie and no script on the phone; the [privacy page](/privacy) lists every field.
- **A custom ending** for the link, chosen by you or generated. Once saved it is immutable, because it is printed.
- **An optional expiry date**, set by you and nobody else. Without one, the link does not expire.
- **A design studio.** Colours, module and eye shapes, error correction level, a logo capped at what the error correction can survive, and a scannability warning when a design goes too far. Export as SVG or PNG at 512, 1024 or 2048 pixels, with no watermark.
- **A custom domain**, `qr.yourbrand.com`, via one CNAME record, with the certificate issued automatically. This needs an account.
- **Safety checks** on destinations against Google Safe Browsing, rechecked weekly.
- **No trial, no scan cap, no inactivity deletion, no watermark.**

And the source is on GitHub under the MIT licence at https://github.com/HK-0811/QRly, so every one of those claims can be read in the code rather than taken from a marketing page.

## Why it can be free

The redirect engine runs on Cloudflare Workers. The database is Supabase. The custom-domain certificates come from Cloudflare for SaaS. Every one of those has a free tier, and QRly fits inside all of them, so the monthly bill for running the service is $0. The [cost page](/cost) sets that out line by line, next to the published prices of the incumbents, and the [post on running a platform for free](/blog/running-a-qr-code-platform-for-free) explains the engineering choices that keep it there.

The underlying fact is that a dynamic QR code is a database row and an HTTP redirect. Serving a redirect at the edge costs a fraction of a cent per thousand requests at any realistic volume, and free tiers cover a great many thousands. The reason paid generators cost what they cost is not the redirect; it is the sales team, the marketing, the enterprise features and the margin. QRly has none of those, and so has nothing to pass on. The [post on why dynamic codes cost money](/blog/why-dynamic-qr-codes-cost-money) makes this argument in full.

There is no catch to disclose, but there are limits, and they belong in the same paragraph.

## What it does not do

- **Non-URL codes.** No Wi-Fi, vCard, phone, SMS, email, plain-text or payment codes. Every QRly code is a redirecting short link; those formats have nothing to redirect. Use a phone's built-in sharing or any static generator for them.
- **Bulk creation.** No CSV import, and no public API. If you need five thousand codes from a spreadsheet, this is the wrong tool.
- **Teams.** One account, one owner. No shared workspaces or roles.
- **Advanced routing.** One link goes to one destination. No per-device or per-country destinations, no password-protected codes, no scheduled switches.
- **File hosting.** A code for a PDF points at a PDF you host elsewhere.
- **Scale.** It is deliberately sized for a thousand or two users. It is not built for an enterprise deployment, and it does not pretend to be.

If you need any of those, a paid product is the right choice, and the comparison posts say so. What QRly covers is the case that most people searching for a free dynamic generator actually have: a handful of codes, on print, that need to be editable and countable and need to keep working.

## How to check any generator, including this one

Make a code. Point a phone at it and read the decoded link. It will be a short link on the vendor's domain, which is what makes it dynamic; now go and read the pricing page for what happens to that short link on the free plan. Look for the words "trial", "inactive", "per month" and "deactivated". If the pricing page and the generator page disagree, the pricing page is the one that will apply to your print.

For QRly, the decoded link is `qrly.lol/<slug>`, the pricing page does not exist because there is no price, and the cost page and the repository are the two documents that stand in for it.

## Frequently asked

**Is there a genuinely free dynamic QR code generator?**
Yes. QRly makes editable, trackable dynamic codes with no paid plan, no trial and no scan cap. It is free because its infrastructure runs on free tiers and costs nothing to operate.

**Why do most dynamic QR code generators charge?**
Because the redirect is a recurring service and the point of leverage: once a code is printed, the vendor controls whether it works. The actual cost of serving redirects is tiny; the price covers the business around it.

**Can I make an editable QR code for free with no expiry?**
On QRly, yes. The destination is editable from the dashboard for as long as the link exists, and there is no expiry unless you set a date yourself.

**Do I need an account for a free dynamic QR code?**
Not to make one. The code and the link work before sign-up. An account is needed to edit the destination later, read the analytics or add a custom domain.

**What is the catch?**
There is no pricing catch. The limits are functional: URL codes only, no bulk import or API, no teams, no per-device routing, and a scale suited to a small user base rather than an enterprise.
