---
title: Custom short link QR codes: choose your own ending and hostname
description: How to make a QR code with a custom short link on QRly, why the ending is locked once saved, and how a custom domain puts your own brand in the hostname as well.
date: 2026-09-19
category: dynamic
keywords: custom qr code url, qr code with custom link, short link qr code, branded short link, custom slug qr code, qr code short url, vanity url qr code
---

A dynamic QR code encodes a short link, and the short link has two parts you can see: the hostname and the ending. On QRly the default is `qrly.lol/` followed by seven random characters. Both parts can be yours instead — the ending straight away, the hostname with a little DNS work — and both, once printed, are permanent. This post is about choosing them well.

## Why the short link is worth caring about

Most people never see the short link. They point a camera at the code and the phone opens the destination. But the link is visible in three places, and in each it does some work.

**Under the code in print.** A short link printed as text beneath the code is the fallback for anyone who cannot or will not scan. `qrly.lol/spring-menu` can be typed; `qrly.lol/x8Kq2Lp` can, but nobody wants to.

**In the phone's preview.** Most camera apps show the decoded URL before opening it. A readable, on-brand link is a small reassurance at the moment someone decides whether to tap; a random one is neutral at best. Checking where a code goes before tapping is exactly what a careful scanner does in that moment.

**In your own records.** A dashboard of forty links called `spring-menu`, `lobby-wifi-info` and `van-rear-door` is easier to manage than forty random strings, and the scan analytics are easier to read.

It also, incidentally, keeps the code small. Any short link is far fewer characters than a typical destination URL, which means fewer modules and a code that scans at a smaller size. [Why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) has the module counts.

## Choosing the ending on QRly

When you [make a code](/create), the ending — the slug — is generated for you unless you type one. The rules for a custom one are short:

- Between 3 and 64 characters.
- Letters, digits, hyphens and underscores only. No spaces, no dots, no slashes.
- Not a word the platform reserves for its own paths.
- Not already taken on that hostname.
- Not made entirely of punctuation, because `qrly.lol/---` resolves but looks broken on a poster.

Slugs are case-sensitive: `qrly.lol/Menu` and `qrly.lol/menu` are different links. For anything that will be typed by hand, use lower case throughout so there is nothing to get wrong. Hyphens read better than underscores in print, and underscores disappear entirely when the text is underlined.

A generated slug is seven characters drawn with cryptographic randomness, which is the point of it: a predictable slug would let anyone enumerate links and inflate a stranger's scan counts. If you are not going to print the link as text, a generated slug is fine and slightly safer against guessing. If you are, choose one.

## Why the ending is locked after saving

Once a link is saved, its hostname and slug cannot be changed. Not by you, not by the dashboard, not by anything in the application — the restriction is a trigger in the database, so there is no path around it.

The reason is the same one that makes a printed code permanent. The short link is what the QR code encodes. The moment the code is printed, the short link is on paper, and renaming it would send every printed copy to a not-found page. The whole value of a [dynamic code](/blog/editable-qr-code) is that the printed thing keeps working while the destination changes; renaming the slug would break exactly that promise.

So the design treats the slug as if it were already printed from the moment it exists, even though it usually is not yet. This is stricter than strictly necessary for a link you made a minute ago and have not downloaded, and that is deliberate. A rule with exceptions is a rule someone will eventually rely on incorrectly. [Why QR short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) is the full argument.

The practical consequence: **if you want a different ending, make a new link.** Before printing that costs nothing. After printing it is a reprint, which is why the ending is worth thirty seconds of thought before saving.

What you *can* change, indefinitely, is everything behind the slug: the destination, an [expiry date](/blog/qr-code-with-expiration-date), the design of the exported code.

## Choosing the hostname: custom domains

The other half of the short link is the hostname. `qrly.lol` is short and does the job, but it is not your brand, and it is not under your control. A custom domain fixes both.

On QRly you add a hostname you own — `qr.yourbrand.com`, `go.yourbrand.com`, whatever you like — point one CNAME record at the platform, and Cloudflare for SaaS issues a TLS certificate for it. Verification checks your DNS across two resolvers and reports exactly what it found, so a misconfigured record is diagnosed rather than left to time out. It needs an account, and it is not instant; DNS takes as long as DNS takes. The rest is a dashboard form.

From then on, new links can be made on that hostname, and the code encodes `qr.yourbrand.com/spring-menu`. That is a branded short link in the full sense: both parts are yours.

There is a second reason for a custom domain that has nothing to do with branding, and for long-lived print it is the more important one. **The hostname is the dependency.** A code on `qrly.lol` depends on `qrly.lol` continuing to serve redirects. A code on `qr.yourbrand.com` depends on you continuing to own `yourbrand.com`, and nothing else; if the redirect service behind it ever changed, you would point the CNAME elsewhere and every printed code would follow. [Custom domain QR codes](/blog/custom-domain-qr-code) makes the case for business use.

| | Default hostname | Custom domain |
|---|---|---|
| Short link | `qrly.lol/spring-menu` | `qr.yourbrand.com/spring-menu` |
| Setup | None | Account, one CNAME, DNS verification |
| Certificate | Already there | Issued for your hostname automatically |
| What the print depends on | The platform's domain | Your domain |
| Cost on QRly | Nothing | Nothing |

## A short checklist before you save

1. Decide whether the link will be printed as text. If yes, choose the slug; if no, a generated one is fine.
2. Use lower case, hyphens, and words that will still make sense in a year. `menu`, not `menu-v2-final`.
3. Do not encode the current destination in the slug. `qrly.lol/summer-sale` is wrong the day the sale ends and the link is repointed; `qrly.lol/window-poster` is right forever. A [reusable code](/blog/reusable-qr-code) is named for the place it lives, not the page it points to.
4. If the print will outlive your attention, set up the custom domain first and make the link on it. You cannot move a link between hostnames later.
5. Save, then scan the code from a print before ordering more.

## Frequently asked

**Can I choose the URL inside my QR code?**
On a dynamic code you choose the short link's ending, and on QRly the hostname too if you add a custom domain. The destination the short link redirects to is separate and can be changed at any time.

**Can I change the short link after making the code?**
No. The hostname and ending are permanent from the moment the link is saved, because they may already be printed. Make a new link if you want a different ending; only the destination is editable.

**What characters can a custom ending contain?**
Letters, digits, hyphens and underscores, 3 to 64 of them. It is case-sensitive, so use lower case for anything that will be typed.

**Can I use my own domain in the short link?**
Yes. Add the hostname in your account, point a CNAME at the platform, and a certificate is issued for it. Links made on that hostname encode it. There is no charge.

**Does a custom ending make the QR code bigger?**
Slightly, in proportion to length. A few characters either way rarely changes the code's version; a 40-character slug adds a version or two. Keep it short and it will not matter.
