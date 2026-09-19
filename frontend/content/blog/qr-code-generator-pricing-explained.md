---
title: QR code generator pricing explained: what each model really charges for
description: Per-code, per-scan, per-seat, trial-then-paywall and annual lock-in: what each QR code generator pricing model actually buys, and why a redirect costs almost nothing.
date: 2026-09-19
category: comparisons
keywords: qr code generator pricing, how much does a qr code cost, qr code subscription cost, qr code pricing models, dynamic qr code cost, qr code generator subscription, free dynamic qr code
---

Ask how much a QR code costs and you get two contradictory answers. The code itself costs nothing: it is a pattern of squares defined by an open standard, and any library can draw one. Yet the QR code generator market runs on subscriptions, and the pricing pages are dense enough to need a guide.

The gap between those answers is a redirect. This post explains what you are being charged for under each pricing model, what the service actually costs to run, and whether a subscription is buying you anything. It quotes no prices; the [cost page](/cost) holds sourced numbers next to what QRly costs to operate, and they change often enough that a blog post would be wrong within months.

## What is actually for sale

A static QR code encodes your URL. Nobody can charge you for it after the fact, because nothing sits between the scanner and your page. Generators that charge for static codes are charging for design tools or convenience, and once you have the file the transaction is over.

A dynamic QR code encodes a short link on the vendor's domain. Every scan hits their server, which looks up the destination and redirects. That lookup is the product. It is what makes the destination [editable after printing](/blog/how-to-change-a-qr-code-link-after-printing) and scans countable, and it is also what can be switched off. Almost every QR code subscription is a subscription to keep a redirect running, and each pricing model is a different way of metering it.

## The five pricing models

### Per dynamic code

You pay for a number of dynamic codes: five, fifty, five hundred. The metered unit is the database row. This is the most transparent model, but it punishes experimentation: a code made to test a flyer layout counts the same as the one on your shopfront, and the tier boundaries are set so that a growing business crosses them.

What to check: whether deleted codes free a slot, and what happens to existing codes if you downgrade past your count.

### Per scan

You pay for a scan allowance, and codes stop resolving, or you are charged overage, past it. The metered unit is the redirect request. This looks cheap for a business card and expensive for a poster in a busy place, and its real problem is unpredictability: a code that gets shared, or ends up somewhere you did not put it, burns your allowance without your involvement.

What to check: what happens at the cap. A code that silently stops working mid-campaign is worse than one that never existed, because you have already printed. Check whether total or unique scans are metered; it is usually total.

### Per seat

You pay per user with access to the account. The metered unit is a person. This is the model of tools built for marketing teams and agencies, and it charges for collaboration rather than for the redirect. If one person makes all the codes, you may be paying for a team feature you never use.

What to check: whether a single seat can do everything, or whether analytics, custom domains and bulk features sit behind a team tier regardless of headcount.

### Trial then paywall

The generator is free to use, produces a working dynamic code, and asks for nothing. After a set number of days the redirect stops, and the code resolves to a page asking the owner, or the scanner, to upgrade. The metered unit is your urgency: by the time the trial ends, the code is printed.

This is the model behind most "my free QR code stopped working" complaints; [the post on free generators](/blog/free-qr-code-generator) covers how to spot it in ten seconds by decoding the code. The trial is rarely labelled on the generator page; it is in the terms.

What to check: the decoded contents of the code, and the fine print about what happens to free codes when the trial lapses.

### Annual lock-in

The monthly price is shown, but the annual discount is steep enough that most customers commit to a year. The metered unit is time. The vendor's incentive is reasonable, since printed codes are a long-term dependency, but the customer's exposure is that a code printed in month two needs the subscription in month fourteen, and every year after, for as long as the print exists.

What to check: what the vendor does with your codes if you do not renew. Most terms do not say clearly.

## What a redirect actually costs to serve

A dynamic QR code scan is one HTTP request, one key-value lookup, and one 302 response of a few hundred bytes. It renders no page, runs no script and moves no image. At any realistic volume the compute cost is a fraction of a cent per thousand scans, and the free tiers of major cloud providers include request allowances that cover a small business's lifetime of scanning many times over.

QRly runs on exactly that: the redirect engine on Cloudflare Workers, the database on Supabase, both on their free tiers, for a total operating cost of $0 a month. The [cost page](/cost) sets this out with the actual usage figures and the sources for what incumbents publish. [How QR redirects work at the edge](/blog/how-qr-code-redirects-work-at-the-edge) explains the mechanics if you want to see why there is nothing expensive in the path.

None of this means paid vendors are overcharging for the redirect itself. It means the redirect is not what you are paying for. You are paying for the things wrapped around it, and those are worth naming honestly.

## What a subscription can legitimately buy

Some of the money in a QR code subscription pays for things that do cost real effort to provide:

- **Bulk generation.** Uploading a spreadsheet and getting a thousand serialised codes back.
- **An API.** Programmatic creation for packaging lines, ticketing or print-on-demand.
- **Teams and permissions.** Shared workspaces, roles, audit logs, single sign-on.
- **Non-URL payloads.** Wi-Fi, vCard, and other static formats alongside dynamic ones.
- **Routing.** iOS and Android to different stores from one code, or geo-based destinations.
- **Support and an SLA.** Someone to phone, and a contract that the redirect stays up.

If you need those, pay for them; a free tool without them is not a bargain, it is the wrong tool. The [QRly vs paid generators comparison](/blog/qrly-vs-paid-qr-code-generators) lists which of these QRly lacks.

What a subscription should not have to buy is the basic promise that a printed code keeps working, has no watermark, can be edited and counts its scans. Those are the redirect, and the redirect is nearly free.

## Reading a pricing page in three minutes

1. Find the free tier and read what happens to its dynamic codes over time. Look for "trial", "inactive", "expire" and "scan limit".
2. Identify the metered unit on the paid tiers: codes, scans, seats or months. That is which of your behaviours makes the bill grow.
3. Find the downgrade and cancellation terms. The question is what happens to your printed codes if you stop paying.
4. Check whether custom domains exist and at what tier. A code on your own domain is the only dynamic code you can take with you, which is the point of [custom domain QR codes](/blog/custom-domain-qr-code).

## Where the hidden cost really is

The largest cost of a QR code is almost never the subscription. It is the reprint. A code that expires, hits a cap, or lands on an upgrade page has to be replaced on every menu, sign or box it was printed on, and that print run is the expensive part.

So a pricing model is acceptable if it cannot leave you with a dead print. A per-code plan you have budgeted for is fine. A per-scan cap on a code in a public place is a reprint waiting to happen. A trial you did not know you were on is one that has already happened.

QRly's answer is to have no pricing model. There is no paid plan, no cap, no trial and no expiry, because there is no cost to recover; the platform is [open source](https://github.com/HK-0811/QRly) so the claim can be checked. [Why dynamic QR codes cost money](/blog/why-dynamic-qr-codes-cost-money) covers why the market settled on subscriptions anyway.

## Frequently asked

**How much does a QR code cost?**
A static code costs nothing; it is a pattern defined by an open standard. A dynamic code costs whatever the vendor charges to keep its redirect running, which ranges from nothing to a monthly subscription. The [cost page](/cost) has sourced figures.

**Why do dynamic QR codes cost money when static ones are free?**
Because a dynamic code depends on a server that must stay up for as long as the code is printed, and vendors charge for that dependency. The work itself is one lookup and one redirect per scan, which is why it can also be provided free.

**What happens to my QR codes if I cancel a subscription?**
It depends on the vendor, and the honest answer is that many terms do not say clearly. Some keep codes resolving on a free tier; some stop. Check before printing, and prefer a code on your own domain so the printed hostname is yours regardless.

**Is there a genuinely free dynamic QR code generator?**
Yes. QRly makes dynamic codes with editable destinations, analytics and custom domains, with no paid plan, no cap and no expiry. It does not offer bulk import, an API, teams or non-URL codes, so it is not a replacement for enterprise tools.
