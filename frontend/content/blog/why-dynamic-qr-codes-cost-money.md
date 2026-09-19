---
title: Why dynamic QR codes cost money, and what you are actually paying for
description: A dynamic QR code is a database lookup and a 302 redirect. Here is what that costs to serve, what vendor pricing really covers, and why a $0 a month service is possible.
date: 2026-09-19
category: dynamic
keywords: why are dynamic qr codes not free, dynamic qr code pricing, dynamic qr code cost, qr code subscription cost, free dynamic qr code, qr code generator pricing, cost of a qr code redirect
---

Static QR codes are free everywhere, and dynamic ones cost money almost everywhere. The usual explanation is that dynamic codes *do more*, which is true but does not explain the price. What a dynamic code does, mechanically, is very little. The interesting question is what the fee is actually covering.

This post separates the three things that get bundled into *dynamic QR code pricing*: the cost of the redirect, the cost of the business selling it, and the margin. It ends with the arithmetic behind QRly, which charges nothing, so the claim can be checked rather than taken on trust.

## What a dynamic QR code does on every scan

A [dynamic code](/blog/what-is-a-dynamic-qr-code) encodes a short link, and every scan turns into one HTTP request to that link. The server does the following:

1. Reads the slug out of the path.
2. Looks up the slug in a store to find the destination.
3. Checks that the link is active and not expired.
4. Records the scan — a timestamp, a country, a device class, whatever the analytics keep.
5. Answers with an HTTP 302 and the destination in the `Location` header.

Steps 2 and 5 are the product. Step 4 is the analytics. Step 3 is a comparison. None of them takes more than a few milliseconds; the whole thing is [served from a cache at the edge](/blog/how-qr-code-redirects-work-at-the-edge) and never touches a hard disk on the hot path.

Put a number on it. Compute for one such request is measured in fractions of a millisecond of CPU. The response is a few hundred bytes. The storage for a link is one row — a slug, a destination, an owner, a couple of flags — and the storage for a scan is another small row. At a thousand scans a day, a year of analytics for one code is a few hundred thousand rows, which is a small table by any database's standard.

The cost of serving that, at any cloud's published per-request pricing, is a fraction of a cent per thousand scans. The reference post on [free generators](/blog/free-qr-code-generator) makes the same point in one sentence. This is the whole of the *infrastructure* cost, and it is not what you are paying for.

## What the price actually covers

A commercial vendor's fee has to cover the redirect, and then everything else the company does. Everything else is most of it.

**Customer acquisition.** Search advertising on terms like *QR code generator* is contested, because every vendor is bidding on the same handful of phrases, and contested terms are not cheap. Some meaningful share of a subscription goes back out as the cost of having found you.

**Support.** A help desk that answers *my code stopped working* — usually because the quiet zone was cropped or the print was too small — is people, and people are the expensive part of any service.

**Sales and accounts.** Enterprise tiers need contracts, invoicing, procurement questionnaires, single sign-on, data-processing agreements. All of that is staff.

**The product beyond the redirect.** Bulk generation, an API, team seats, templates, integrations, landing-page builders. Some vendors have built a great deal on top of the redirect, and that engineering is real.

**Margin.** A business needs one.

None of this is a criticism. It is simply what a subscription is: a payment for a company, of which the redirect is the smallest line. The [pricing explained](/blog/qr-code-generator-pricing-explained) post looks at how vendors structure the tiers; the actual published numbers are on [what it costs](/cost), next to QRly's.

> The redirect is nearly free. The subscription pays for the company that sells it.

## Why the free tiers of clouds change the picture

Every major cloud has a free tier, and for the specific workload of a QR redirect, those free tiers are enormous relative to the need.

Cloudflare Workers, which QRly's redirect engine runs on, includes on its free plan a daily request allowance in the six figures and a key-value store that is replicated to every Cloudflare edge location. Supabase, which holds QRly's links, users and scan records, includes a Postgres database and authentication on its free plan. Cloudflare for SaaS, which issues TLS certificates for custom domains, has a free allowance too.

A service designed around those limits — rather than designed first and then priced — can run with a monthly bill of nothing. That is the design constraint QRly was built to, and it is also why QRly is explicit about being sized for a thousand or two users rather than for an enterprise. The free tiers are large, not infinite. A vendor expecting hundreds of millions of scans a month has a real infrastructure bill; a service at QRly's scale does not.

The [running a QR platform for free](/blog/running-a-qr-code-platform-for-free) post walks through each component and its quota. The bill itself, itemised at $0, is on the cost page, and the source that produces it is at https://github.com/HK-0811/QRly under the MIT licence.

## What zero cost does and does not buy you

Because the money in a subscription mostly funds things other than the redirect, a service without a subscription is missing those other things, and it is worth being clear-eyed about which ones matter to you.

| You get on QRly | You do not get |
|---|---|
| The redirect, indefinitely, with no cap | A support desk |
| Editable destination, under a minute to propagate | Teams and shared workspaces |
| Analytics without a cookie or script on the phone | An API or bulk import |
| Custom domains on a CNAME | A contract or an SLA |
| Design studio, SVG and PNG export, no watermark | Scale for tens of millions of scans a month |

If the right-hand column contains something you need, a commercial vendor is the correct choice and their price is the price of those things. If it does not, you have been paying for them anyway.

## The one cost that is yours regardless

Whatever you pay or do not pay, a dynamic code has a dependency: the domain in the short link has to keep resolving to a working redirect. On a vendor's domain that dependency is the vendor. With a [custom domain](/blog/custom-domain-qr-code), the printed hostname is yours, and the dependency becomes something you can re-point — to a different service, or to a redirect on your own server — without touching the print.

That is the only version of a dynamic code where the ongoing cost is under your control rather than a vendor's. It is available on QRly at the same price as everything else, which is none.

## Frequently asked

**Why are dynamic QR codes not free?**
Because a redirect is an ongoing service, and the companies that run one have costs — mostly marketing, support and staff, not servers. The redirect itself costs a fraction of a cent per thousand scans. QRly charges nothing because it runs on cloud free tiers and has none of the surrounding company.

**How much does it cost to serve a QR code redirect?**
One lookup and one 302 response per scan; at published cloud prices, fractions of a cent per thousand. For a service under a few thousand users it fits inside free tiers entirely.

**Is a free dynamic QR code worse than a paid one?**
The redirect is the same. What a paid plan adds is support, teams, an API, bulk tools, a contract, and capacity for very large campaigns. Whether that is worth paying for depends on whether you need it.

**Where can I see what the paid generators charge?**
On the cost page, which lists what each vendor publishes next to QRly's $0 bill. Competitor prices change, so it is kept there rather than repeated in posts.

**Will QRly start charging?**
There is no cost to pass on at the current scale, so there is no plan to. The source is open under MIT, so if the service ever changed, the redirect engine could be run by anyone, and a custom domain means printed codes would not need to change.
