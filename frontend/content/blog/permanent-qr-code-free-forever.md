---
title: A permanent QR code that never expires, and what actually makes it last
description: Static codes are permanent by nature; dynamic codes last as long as the redirect does. How to get a lifetime QR code for free, and one insurance policy worth taking.
date: 2026-09-19
category: basics
keywords: permanent qr code, qr code that never expires, lifetime qr code free, qr code free forever, non expiring qr code, qr code expiry, permanent dynamic qr code
---

"Permanent" is doing a lot of work in the phrase *permanent QR code*. The pattern of squares is permanent the moment it is printed; ink does not expire. What people mean is that the code should keep *working*, and that depends on three separate things surviving: the print, the redirect if there is one, and the page at the end. Each fails for different reasons, and a code that is free forever needs all three covered.

## Static codes are permanent by construction

A static QR code encodes your URL directly. There is no intermediary. When someone scans it, the phone reads the address out of the squares and opens it. Nothing on any server is consulted about whether the code is still allowed to work.

That makes a static code permanent in the strongest sense: it will work for exactly as long as the URL it contains works. No generator can expire it, because no generator is involved after the download. If a company makes a static code with a tool that shuts down next month, the code is unaffected.

The weakness is the same fact from the other side. The code is permanent, so its content is permanent, and if the page moves, the code points at the old address forever. A restaurant's static menu code printed with `example.com/menu.pdf` breaks the day the menu becomes `example.com/menu`. The only fix is a reprint. The [static versus dynamic comparison](/blog/static-vs-dynamic-qr-codes) is essentially a discussion of this one trade-off.

If your destination is a page you control and will never move, and you do not need to count scans, a static code is the right choice and the permanence question is answered. Any static generator will do, and the code contains nothing of theirs.

## Dynamic codes are permanent only if the redirect is

A dynamic code encodes a short link, and a server turns that short link into your destination on every scan. That is what makes it editable, which is the fix for the static code's weakness. It is also a dependency: the code works while the redirect is served and stops the moment it is not.

So the permanence of a dynamic code is not a property of the code. It is a property of the service, and it has to be read off the service's terms rather than its home page. The ways a "free" dynamic code stops working, in order of how often they happen:

- **The trial ends.** The generator was free for 14 days and the code was the dynamic kind. Scans now land on a page saying the link has been deactivated.
- **The code is deleted for inactivity.** Some services remove free links that have had no scans for a period. A code on the back of a product that sells slowly can go months without a scan.
- **A scan cap is hit.** Free plans that allow a number of scans per month stop redirecting past it, or start showing an interstitial.
- **The service closes or changes model.** A free tier becomes paid, or the company folds. Every code on their domain goes at once.

The [expiry guide](/blog/free-qr-code-no-expiration) lists the questions to ask any vendor, and the [pricing explainer](/blog/why-dynamic-qr-codes-cost-money) explains why the redirect is what they charge for.

## What QRly commits to

QRly is a dynamic generator, so it has to answer these questions plainly.

- **Codes do not expire.** There is no trial period; there is no paid plan for a trial to convert into.
- **Codes are not deactivated for inactivity.** A link that gets its first scan three years after it was made will redirect.
- **There is no scan cap.** Scans are counted for your analytics, not against a quota.
- **The short link cannot change.** Once a link is saved, its hostname and slug are immutable, enforced at the database level, because they are already printed. Nobody, including the owner, can rename a link out from under a code. The [immutability post](/blog/why-qr-code-short-links-must-be-immutable) explains why that rule exists.
- **The only expiry is one you set.** A link can be given an expiry date by its owner, after which scans see an expired page. Leave it unset and there is none.

Why it can afford this is the same reason it is free at all: the redirect engine runs on Cloudflare Workers, the database on Supabase, both on free tiers, and the [cost page](/cost) shows the monthly bill, which is zero. There is no per-scan cost to recover, so there is no reason to cap scans or expire codes.

What that promise is not: a guarantee from a large company with a legal department. QRly is a free, open-source project. Its design has no mechanism for expiring your code, and its economics have no reason to add one, and that is a stronger position than a free tier subsidised by a paid one. But if a code truly has to outlive any single service, the honest advice is the next section.

## The insurance policy: your own domain

The printed code contains a hostname. Whoever controls that hostname controls where scans go. If the hostname is the vendor's, the vendor controls it. If the hostname is yours, you do.

QRly supports custom domains. You add `qr.yourbrand.com`, point one CNAME record at the platform, and Cloudflare issues the certificate; the [custom domain guide](/blog/custom-domain-qr-code) walks through the setup, including how verification reports what it found in DNS. From then on every code you make on that domain contains `qr.yourbrand.com/<slug>` rather than `qrly.lol/<slug>`.

The permanence this buys is total. If QRly disappeared tomorrow, you would point `qr.yourbrand.com` at something else that serves the same redirects, and every printed code would follow. The source is MIT-licensed at https://github.com/HK-0811/QRly, so "something else" can be your own copy; the [self-hosting guide](/blog/self-hosted-qr-code-generator) covers running it. You would need the list of slugs and destinations, which is your data, and a domain you already own.

Compare that with a code on any vendor's domain, QRly's included: if the vendor goes, the hostname goes, and there is no DNS record you can change to save it. A custom domain requires an account, and it is the one piece of setup worth doing before printing anything with a long life: packaging, signage, engraved plaques, anything that will be expensive to replace.

## The third failure: the page itself

The failure nobody plans for is the destination. Websites are reorganised. Product pages are retired. A PDF on a shared drive is moved by someone tidying up. A static code cannot recover from any of that; a dynamic one can, in one edit from the dashboard, and the change reaches every scanner in under a minute.

For a genuinely permanent code, this argues for a dynamic code pointed at a page you intend to keep, with the dynamic layer as the repair mechanism rather than the daily tool. Set it, print it, and when the page inevitably moves in four years, update the destination instead of the print.

## Putting it together

| You want | Use | What makes it permanent |
|---|---|---|
| A code for a fixed page, no scan data | Static | Nothing to expire; the code is the URL |
| A code you may need to redirect later | Dynamic, on a service with no expiry | The service's terms, and the immutable slug |
| A code on packaging, signage, anything with a long life | Dynamic, on your own domain | You control the hostname; the service is replaceable |

The first row is free on any generator. The second is free on QRly and on very few others without a trial. The third is free on QRly with an account and a domain you already own.

## Frequently asked

**Do QR codes expire?**
Static codes never expire; they contain the URL and depend on nobody. Dynamic codes expire when the service stops serving the redirect, which for many free generators is the end of a trial or a period of inactivity. QRly codes do neither.

**Can I make a QR code that never expires for free?**
Yes. A static code from any generator is permanent. A dynamic code is permanent on QRly, which has no trial, no inactivity rule and no scan cap, and is free because it costs nothing to run.

**What is a lifetime QR code?**
A term some vendors use for a one-off payment that keeps a dynamic code active indefinitely. It is a promise about their redirect. The stronger version of the same promise is a code on your own domain, which you can point anywhere.

**How do I make sure a QR code keeps working if the generator shuts down?**
Use a static code, or a dynamic code on a domain you own. With your own domain, you re-point the CNAME at another service that serves the same short links, and the printed codes follow.

**Can QRly change or delete my short link?**
The hostname and slug are immutable once saved, by a database rule, and there is no inactivity deletion. The only expiry is a date you set yourself.
