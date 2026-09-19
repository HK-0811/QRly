---
title: Free QR code generator, with no catch — what "free" actually means in 2026
description: Most free QR code generators are free for 14 days, or free until you print. Here is how to tell the difference before your code is on a poster, and how to make one that stays free.
date: 2026-09-19
category: basics
keywords: free qr code generator, qr code generator free, free qr code, make a qr code for free, free qr code maker, qr code generator no sign up, free qr code no expiration
---

Search for *free QR code generator* and you get a page of results that all say free. Print one of those codes on five hundred flyers and, a fortnight later, some of them stop working — the trial ended, and the code was pointing at the vendor's server, not at your website.

This is the single most common way a QR code goes wrong, and it has nothing to do with the code itself. It comes down to one question you should ask of any generator before you print anything: **when I scan this, where does it go first?**

## The two kinds of "free" QR code

Every QR code encodes some text. When that text is a web address, a phone's camera opens it. There are only two ways a generator can set that up.

**A static code** encodes your URL directly. The code *is* the link. Nothing sits between the scanner and your page, so there is nothing to expire, nothing to subscribe to, and nothing the generator can switch off. The trade-off is that the code is permanent in the literal sense: if the URL changes, the printed code is wrong forever.

**A dynamic code** encodes a short URL on the generator's domain, which redirects to your real page. That indirection is what makes the destination editable after printing, and it is also where the money is. The redirect runs on the vendor's server, and a vendor that charges for it can stop serving it the day you stop paying.

Every "free trial" horror story is a dynamic code whose redirect was turned off. The code still scans perfectly. It just lands on a page that says *this link has been deactivated* — or, worse, on a page advertising the generator to your customers.

## How to tell, in ten seconds

Make a code, then look at what it contains before you download it. Any phone will show you the decoded text when you point the camera at the screen.

- If the decoded text is **your** URL, it is static. It will work for as long as your URL does.
- If it is something like `qr-vendor.com/r/8fk2Ls`, it is dynamic. Now read the pricing page — the *whole* pricing page, including the part about what happens to existing codes on the free plan.

A vendor whose free tier is honest will say plainly that free dynamic codes keep working. Many say the opposite in the fine print: scans capped per month, codes deleted after inactivity, or a 14-day trial that was never labelled as one on the generator page.

## What a free dynamic QR code costs to run

Here is the part the market prefers you not to think about. A dynamic QR code is a database row and an HTTP redirect. Serving that redirect costs, at any realistic volume, a fraction of a cent per thousand scans — and the infrastructure to do it is available on free tiers from every major cloud.

That is why QRly exists. It is a dynamic QR code generator whose entire stack — the redirect engine, the database, the analytics, the custom domains, the TLS certificates — runs on free tiers and costs [$0 a month to operate](/cost). The source is [open](https://github.com/HK-0811/QRly) so that claim can be checked rather than believed. There is no paid plan because there is no cost to pass on.

Concretely, a QRly code:

- **Needs no account.** Paste a link on the [home page](/) and download the code. You can sign up afterwards to keep it and edit it, or not.
- **Does not expire.** There is no trial, and nothing gets deactivated for inactivity.
- **Has no watermark**, on the SVG or the PNG.
- **Is editable after printing.** The destination can be changed from the dashboard, and the change reaches every scanner in under a minute.
- **Reports scans** — country, city, device, operating system, time of day — without running any script on the scanner's phone. The [privacy page](/privacy) lists every field, including the ones deliberately not collected.

## Static or dynamic: which should you actually use?

It depends on one thing: **will the destination ever change?**

| Situation | Use | Why |
|---|---|---|
| A link to a page you control and will never move | Static | Nothing between the scanner and your page. |
| Wi-Fi credentials, a phone number, a plain-text message | Static | These are not URLs; there is nothing to redirect. |
| A menu, a campaign, a product page, an event | Dynamic | The page will change; the poster will not. |
| Anything you want scan counts for | Dynamic | Static codes cannot be counted — nothing sees the scan. |
| A code going on packaging or signage with a long life | Dynamic, on a domain you trust | If the code outlives the vendor, the indirection must too. |

For that last row, the strongest position is a dynamic code on **your own domain**. QRly supports custom domains — `qr.yourbrand.com` pointing at the redirect engine via one CNAME record — which means the printed code contains your hostname. If you ever moved away, you would point that hostname somewhere else and every printed code would follow. That is the only version of "dynamic" that is truly yours.

## Things to check before you print

Regardless of which generator you use, five checks cost nothing and prevent nearly every reprint:

1. **Scan it from a print, not a screen.** Paper, at the size it will actually be used, under the lighting it will actually be in.
2. **Check the quiet zone.** The blank border around the code should be at least four modules wide. Cropping it to save space is the most common design mistake.
3. **Keep the contrast.** Dark modules on a light background. Inverted, low-contrast and busy-background codes fail on older phones first, and you will not hear about it.
4. **Test on both an iPhone and an Android.** The camera apps decode differently and one will occasionally refuse a code the other accepts.
5. **Know what the code contains.** If it is a vendor's short URL, know the terms that short URL lives under.

## Frequently asked

**Is a free QR code really free forever?**
A static code, yes — it contains your URL and depends on nobody. A dynamic code is free forever only if the redirect service is. QRly's is, and the cost page shows why that is sustainable rather than a promotional promise.

**Do free QR codes expire?**
Static ones cannot. Dynamic ones expire when the vendor stops serving the redirect — which for many "free" generators is the end of a trial. Check before you print.

**Can I make a QR code without signing up?**
Yes. On QRly the code is made and downloadable before any account exists. An account is for editing the destination and reading scan data later.

**Can I track scans on a free QR code?**
Only on a dynamic one — a static code goes straight to your page and nothing counts it. QRly records the scan at the redirect, with no cookie and no script on the phone.

**What file format should I download?**
SVG for anything going to print, because it scales with no loss. PNG at 1024 or 2048 pixels for anywhere that will not accept SVG. Both are available on every QRly code.
