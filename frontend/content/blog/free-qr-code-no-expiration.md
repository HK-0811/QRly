---
title: Free QR code with no expiration: do QR codes expire, and why some do
description: The pattern in a QR code never expires. The redirect behind a dynamic code can, and on many free generators it does when the trial ends. How to make one that lasts.
date: 2026-09-19
category: basics
keywords: free qr code no expiration, do qr codes expire, qr code expired, permanent qr code, qr code expiry, qr code stopped working, qr code deactivated
---

A customer holds their phone up to the sticker on your window, the camera finds the code instantly, and the page that opens says *This QR code has expired. Upgrade to reactivate.* The sticker cost nothing to make eight months ago. Now it is advertising someone else's software on your shop front.

"Do QR codes expire" is one of the most searched questions about the format, and the answer is a precise *no, but*. The *no* is about the code. The *but* is about what the code points at.

## The pattern itself cannot expire

A QR code is a grid of dark and light modules that encodes a string of text. There is no date in it, no licence, no counter. The [decoder in your phone](/blog/what-is-a-qr-code) reads the pattern locally and produces the text; nothing phones home. A code printed in 2005 decodes today exactly as it did then. Ink fades, paper tears, but the format has no clock.

So if the text in the code is your own URL — a **static** code — the code works for as long as your URL does. It cannot be deactivated by anyone, because nobody is in the loop. This is the strongest possible meaning of "no expiration", and it is available from any static generator, including the one built into Chrome.

The catch is the flip side of the same fact: a static code cannot be changed, either. If the page moves, every print is wrong, permanently.

## Where expiry actually comes from

A **dynamic** code encodes a short URL on a generator's domain, and a server at that domain redirects each scan to your real page. That indirection is what lets you edit the destination after printing and count the scans. It also puts a third party between your customer and your page, and that third party can stop answering.

The code has not expired. The redirect has. There are four common ways it happens:

**The trial ended.** Many generators let you create a dynamic code free, without labelling it as a trial, and turn the redirect off after 7 or 14 days unless you subscribe. This is the classic trap, because the code scanned perfectly on the day you printed it.

**A scan cap was hit.** Some free tiers serve a fixed number of scans a month. When the cap is reached, scans land on an upgrade page until the month rolls over.

**Inactivity.** Codes that have not been scanned or edited for some period are deleted to save the vendor storage. Seasonal codes — a Christmas menu, an annual event — are the ones this catches.

**The vendor went away.** A generator that shuts down, or is acquired and re-platformed, takes every short link with it. There is no recourse; the domain in your printed code is theirs.

In each case the phone shows either an error, an "expired" page, or an advert. The fix is the same: reprint with a new code. Which is to say, there is no fix.

## How to check before you print

Whatever generator you use, the test takes ten seconds. Make the code, point your phone at the screen, and read the decoded text before you download.

- If it is your URL: static, and it will not expire.
- If it is the vendor's domain: dynamic. Now read the pricing page — the whole thing — for the words *trial*, *scan limit*, *inactive* and *deactivated*. If the free tier's terms are not stated plainly, assume the code will stop working.

The question to answer is not *is it free* but *is the redirect free, indefinitely, with no condition attached*. [What "free" actually means](/blog/free-qr-code-generator) goes through the models one by one.

## What QRly does about it

QRly is a dynamic generator — every code encodes a `qrly.lol` short link that 302-redirects to your page — so it is subject to exactly the risk described above, and the design starts from taking that seriously.

- **There is no trial.** There is no paid plan for a trial to lead to. The whole platform runs on Cloudflare Workers and Supabase free tiers and costs [$0 a month](/cost) to operate, and the [source is open](https://github.com/HK-0811/QRly) so that can be checked.
- **There is no scan cap.** A redirect costs a fraction of a cent per thousand at any realistic volume; capping it would be theatre.
- **Nothing is deleted for inactivity.** A link scanned once in 2026 and never again is still there.
- **No account is needed to make a code**, and an unclaimed code keeps redirecting indefinitely. Signing up lets you edit it; not signing up does not kill it.
- **Expiry exists only if you set it.** Each link has an optional expiry date. After it, scans get a plain "expired" page. This is for things that should stop working — a voucher, a limited offer, a form that closes — and it is off by default.

The honest limit is the last row from the previous section. QRly is deliberately sized for a thousand or two users, not for enterprise, and it is one person's open-source project. If that is not a risk you want on a long-lived print, the answer is a **custom domain**: point `qr.yourbrand.com` at the redirect engine with one CNAME record, and the printed code contains your hostname. Should the platform ever go away, you point the hostname somewhere else and every printed code follows. That is the only version of "dynamic" that is genuinely under your control, and it is covered in [custom domain QR codes](/blog/custom-domain-qr-code).

## Choosing for the life of the print

The right question is not static versus dynamic in the abstract but *how long will this be in the world, and will the destination change during that time*.

| Print | Life | Choose |
|---|---|---|
| A one-off event poster | Weeks | Dynamic, so you can fix a wrong link without reprinting |
| A restaurant menu on the table | Months, menu changes | Dynamic |
| A business card | Years, link might change | Dynamic, ideally on your own domain |
| A book, a plaque, a certificate | Decades, link must not depend on anyone | Static, with the final URL |
| Wi-Fi, a phone number, a vCard | Any | Static, because it is not a URL |
| Product packaging in the supply chain | Years, you will want to update and measure | Dynamic on your own domain |

The [static versus dynamic](/blog/static-vs-dynamic-qr-codes) comparison goes deeper, and [permanent QR codes](/blog/permanent-qr-code-free-forever) covers the case where "forever" is the actual requirement.

## If a code has already expired

There is one thing to try before reprinting. Find out which generator made the code — the short URL's domain tells you — and log in or contact them. Some will reactivate a link on an upgrade; some will export the destination so you can at least see what it pointed at. If the vendor is gone, the domain is gone, and the print is scrap.

Then, for the reprint, put the code on a service whose free tier has no clock, or on your own domain, and write down what each printed code points at and where it lives. The second expiry is always avoidable.

> A QR code expires only when the thing it points at stops answering. Make sure that thing is either your own page, or a redirect nobody can switch off.

## Frequently asked

**Do QR codes expire?**
The code does not; it is a pattern with no date in it. A dynamic code's redirect can be switched off by the generator — at the end of a trial, on a scan cap, or on inactivity — and then the code lands on an error page.

**How do I make a QR code that never expires?**
Either a static code with your URL in it, which depends on nobody, or a dynamic code on a service with no trial, cap or inactivity rule. QRly's codes have no expiry unless you set one yourself.

**Why did my QR code stop working?**
Almost always because it is a dynamic code and the redirect was deactivated. Scan it and look at the page it lands on; the vendor's name will be on it. Occasionally the destination page itself was taken down, which no generator can fix.

**Can an expired QR code be reactivated?**
Only by the vendor whose short link it contains, usually on a paid plan. The printed pattern cannot be changed, so if the vendor will not restore the link, the code must be reprinted.

**Can I set my own expiry?**
On QRly, yes — each link has an optional expiry date, off by default. After it, scans see an "expired" page. It is meant for vouchers and closing forms, not for anything you would rather keep alive.
