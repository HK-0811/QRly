---
title: A dynamic QR code without a subscription, and how that is possible
description: Most dynamic QR codes are sold as a monthly plan, sometimes as a one-time fee with limits attached. Here is how each model works and why QRly has no plan of any kind.
date: 2026-09-19
category: dynamic
keywords: dynamic qr code without subscription, dynamic qr code one time, qr code no monthly fee, dynamic qr code no subscription, free dynamic qr code, qr code subscription, lifetime qr code
---

A dynamic QR code is the useful kind — the destination can be changed after printing, and scans can be counted — and it is also the kind that almost every generator charges a monthly fee for. People searching for *dynamic QR code without subscription* have usually worked out that the fee is the price of the redirect staying switched on, and want to know whether there is a way round it.

There is, but it helps to understand first why the subscription exists and what the alternatives actually promise.

## Why dynamic codes come with a subscription

A [static code](/blog/static-vs-dynamic-qr-codes) contains your URL. Once made, it needs nothing from anyone; the generator could vanish and the code would carry on working. There is nothing to subscribe to because there is nothing ongoing.

A [dynamic code](/blog/what-is-a-dynamic-qr-code) contains a short link on the generator's domain. Every scan, for as long as the code is in use, hits the generator's server, which looks up the destination and issues a redirect. That is an ongoing service. A vendor providing it has a server bill, a domain to keep, and — the part that dominates — a company to run. A monthly fee is the natural way to charge for something ongoing.

The problem for you is what happens when the fee stops. The code is still printed. The redirect is not being served. Depending on the vendor, scans land on a not-found page, a *this link has been deactivated* page, or a page promoting the vendor to your customers. The subscription is not a payment for a product you own; it is rent on a redirect you do not.

## The models you will see

Vendor pricing pages describe a handful of models. The names vary; the shapes do not. Check the actual numbers on [what it costs](/cost), which lists what the well-known generators publish, rather than here.

| Model | What you pay | What to check |
|---|---|---|
| Monthly or annual plan | A recurring fee, usually tiered by number of codes and scans | What happens to existing codes when you cancel |
| Free tier of a paid product | Nothing, with limits | Scan caps, code caps, inactivity deletion, whether it is a trial in disguise |
| One-time or "lifetime" payment | A single fee | Whether the redirect has a scan cap, a time limit, or depends on the company still existing |
| Pay per code | A fee per dynamic code created | Whether that includes the redirect indefinitely or for a fixed term |
| Self-hosted software | Your own server and time | Whether you want to run a redirect service for years |

The **free tier** model needs the closest reading. A free tier that keeps dynamic codes working indefinitely, at a low scan cap, is a genuine no-subscription option for small uses. A free tier that is a 14-day trial, or that deletes codes after inactivity, is a subscription with a delay. The pricing page will say which; the generator page usually will not.

The **one-time payment** model sounds like the answer to the search and sometimes is. The thing to notice is that a one-time fee is being asked to fund a service with an ongoing cost, which only works if either the cost is negligible or the promise has a limit somewhere — scans, years, or the company's lifespan. Read for the limit.

## What QRly does instead

QRly has no subscription because it has no plan of any kind. There is no free tier as distinct from a paid tier; there is one tier, and it is the whole product.

That is possible because the ongoing cost the subscription was meant to cover is, at QRly's scale, zero. The redirect engine runs on Cloudflare Workers; the database and authentication on Supabase; both on free tiers whose limits are far above what a service sized for a thousand or two users needs. The [cost page](/cost) shows the monthly bill — $0 — and the source is [public](https://github.com/HK-0811/QRly), under the MIT licence, so the claim is checkable rather than a promotional line. [Why dynamic QR codes cost money](/blog/why-dynamic-qr-codes-cost-money) goes through the arithmetic.

What that means in terms of the checklist above:

- **No scan cap.** There is no counter that switches a code off, and no tier that unlocks a higher one.
- **No code cap.** Make as many as you need.
- **No expiry** unless you set one yourself, and **no deactivation** for inactivity. A code made today and first scanned in three years works.
- **No watermark** on the SVG or the PNG.
- **No account needed** to make a code. Sign up afterwards if you want to edit the destination or read the analytics, which is the point of a dynamic code, but the code works before you do.
- **No trial.** There is nothing to trial into.

The [free dynamic QR code generator](/blog/free-dynamic-qr-code-generator) post covers what you get in more depth. The short version is that the redirect, the [editable destination](/blog/editable-qr-code), the analytics, the QR studio and custom domains are all the same tier.

## The honest limits

A reader who catches one overclaim distrusts the rest, so here is what a no-subscription service run on free tiers does not offer.

**Scale.** QRly is deliberately sized for a thousand or two users, not for an enterprise campaign expecting tens of millions of scans a month. Free-tier quotas are generous but finite.

**Support.** There is no support desk. There is a public repository where issues can be filed, and a person who reads them.

**Enterprise features.** No teams, no API documented for the public, no bulk import, no scheduled destinations. These are the things a subscription at a commercial vendor genuinely pays for, and if you need them, a commercial vendor is the right choice.

**Longevity is a promise, not a contract.** No fee also means no contract. The mitigations are that the source is open, that the stack costs nothing to run so there is no financial reason to shut it down, and that a [custom domain](/blog/custom-domain-qr-code) puts the printed hostname under your control. That last one is the strongest position any dynamic code can be in, on any service: if the hostname is yours, the print survives the vendor.

## Choosing between the options

If you need the redirect to run for years, on print that is expensive to replace, and you want a contract and a phone number, pay a vendor and read the cancellation terms first.

If you need a working dynamic code with no monthly fee, no cap and no trial, make one on [QRly](/create), claim it in an account, and put it on your own domain if the print will outlive your interest in checking on it.

And if the destination will never change and you do not need scan counts, a static code from any generator, including the built-in one in Chrome, costs nothing and depends on nobody.

## Frequently asked

**Is there a dynamic QR code with no monthly fee?**
Yes. QRly's dynamic codes have no fee, no plan and no trial. Some commercial vendors also offer a free tier with limits; check the limits, particularly what happens to existing codes and whether inactive ones are deleted.

**Can I pay once for a dynamic QR code instead of subscribing?**
Some vendors sell a one-time or lifetime option. Read for the limit on scans or years, because a one-time payment funding an ongoing service has to have one somewhere. QRly charges nothing, once or monthly.

**What happens to a dynamic QR code when the subscription ends?**
The redirect stops being served, and the printed code goes to whatever page the vendor shows for a deactivated link. Each vendor's terms say what that is. On QRly there is no subscription to end.

**Why can QRly be free when others charge?**
The redirect costs almost nothing to serve and runs on cloud free tiers. What vendor fees mostly cover is the business around the redirect, which QRly does not have. The cost page lists the bill.

**Is a free dynamic code safe to print on something expensive?**
The safest version is a dynamic code on your own custom domain, on any service. Then the printed hostname is yours, and if the service ever changed, you would point the hostname elsewhere and the print would follow.
