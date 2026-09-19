---
title: Custom domain QR codes: why the hostname inside the code matters
description: A QR code on your own domain shows your name in the phone's preview, survives a change of vendor, and is the only dynamic code you truly own. How QRly sets one up.
date: 2026-09-19
category: business
keywords: custom domain qr code, qr code with own domain, branded qr code domain, white label qr code, qr code custom url, qr code own domain, branded short link qr code
---

Every dynamic QR code contains a URL on someone's domain. Scan a code made with most generators and the phone's preview shows something like `qr-vendor.io/r/x7Kp2`. That hostname is not cosmetic. It is the one part of the system the scanner sees before deciding whether to tap, and it is the one part you cannot change after printing.

A custom domain moves that hostname onto something you control: `qr.yourbrand.com`, `go.yourbrand.com`, whatever you like. The code then contains `qr.yourbrand.com/menu` instead of a vendor's address. This post is about why that is worth doing and how it works on QRly.

## What the scanner sees

When a phone camera reads a QR code, it shows a preview before opening anything. On iOS it is a small yellow banner with the hostname; on Android the notification shows the URL. Most people glance at that banner for a fraction of a second and tap.

That glance is where trust is decided. A hostname the person recognises — the name on the sign they are standing in front of — gets tapped. A random short-link domain gets tapped too, mostly, but a growing share of people have been told not to, and [quishing](/blog/qr-code-phishing-quishing) warnings from banks and employers are making that share larger. A code on your own domain sidesteps the question. The address on the poster and the address in the preview match.

This matters most for anything where the scanner is being asked to do something sensitive: pay, log in, enter details. It matters least for a menu. But even for the menu, the preview showing `qr.thecafe.com` rather than a stranger's domain is the difference between a professional artefact and a borrowed one.

## Longevity: the code will outlive the vendor

A printed QR code has no expiry. Signage, packaging, engraved plaques, vehicle livery and museum placards routinely stay in service for a decade. Almost no QR code vendor has been in business for a decade in its current form, and several well-known ones have changed pricing, changed hands or discontinued free tiers in that time.

If the code contains a vendor's hostname, the code's lifespan is the vendor's lifespan, on the vendor's terms. When the redirect stops being served, every printed code dies at once, and there is nothing you can do about it because you do not control the domain the code points at.

If the code contains your hostname, the redirect is served by whoever your DNS says. Today that is QRly. If QRly disappeared, you would point `qr.yourbrand.com` at something else — another platform, a redirect rule on your own web server, anything that can turn a path into a 302 — and every printed code would follow. [Permanent QR codes](/blog/permanent-qr-code-free-forever) goes further into what "permanent" actually requires; a hostname you own is the first condition.

## Portability is the whole point

It is worth being blunt about this, since QRly is the vendor in this scenario. A custom domain is the one feature that reduces your dependence on the platform that provides it. That is why it is the feature to insist on, from any platform, before printing anything that will stay up for years.

QRly is [open source](https://github.com/HK-0811/QRly) and [free to run](/cost), which lowers the odds of it going away for commercial reasons. But "we probably will not disappear" is a weaker guarantee than "if we did, you would not notice", and only a custom domain gives you the second one.

There is a related point about the slug, the part after the slash. On QRly the hostname and slug of a link are immutable once saved: a database trigger refuses the change, because the code is assumed to be printed. [Why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) explains the reasoning. The destination changes freely; the address printed on the wall does not.

## What "white label" means here

Generators use "white label" loosely. It can mean any of:

| Claim | What it usually covers |
|---|---|
| Custom domain | The hostname in the code is yours |
| Branded short links | A vanity slug on the vendor's domain, so `vendor.io/yourbrand` — the hostname is still theirs |
| Branded landing pages | Interstitial pages carry your logo, but the URL is still the vendor's |
| Branded code design | Colours and a logo in the code image; nothing to do with the URL |

Only the first one changes what is inside the code. The other three are fine to have, but a "branded" link whose hostname belongs to the vendor has all the dependency problems described above, with your name on top. When comparing platforms, ask specifically whether the hostname can be yours, and what the platform's pricing tier for that is; on many it is the feature that moves you from a starter plan to a business one. On QRly there is no tier.

For the visual side of branding — colours, logo, module shapes — see [branded QR codes](/blog/branded-qr-code). That is separate from the domain and does not require one.

## How custom domains work on QRly

The mechanics are one DNS record and a short wait.

1. **Add the domain in the dashboard.** You need an account for this; anonymous codes cannot be put on a custom domain because someone has to own the hostname. Choose a subdomain — `qr.yourbrand.com` is conventional, but any label works. Using a subdomain rather than the bare domain means your main website is unaffected.
2. **Create one CNAME record** at your DNS provider, pointing that subdomain at the platform hostname the dashboard shows you.
3. **Wait for DNS to propagate.** This is your provider's timing, not QRly's; it is usually minutes and occasionally hours. QRly does not claim it is instant, because it is not in QRly's control.
4. **Verification.** QRly checks the record from two independent resolvers and reports exactly what each one saw: the record it found, or the record it expected and did not find. If the two disagree, propagation is still in progress. There is no "pending, please wait" with nothing behind it; the report is the actual DNS answer.
5. **Certificate.** Once the CNAME resolves, Cloudflare for SaaS issues a TLS certificate for the hostname automatically. Scans over `https://qr.yourbrand.com/...` then serve exactly as `qrly.lol` does: an edge redirect with a 302 to the destination. [How redirects work at the edge](/blog/how-qr-code-redirects-work-at-the-edge) covers the path a scan takes.

From then on, new links can be created on the custom hostname. Everything else — editing the destination, expiry dates, the analytics, the QR studio — is identical. The step-by-step, including what the record looks like at common DNS providers, is in [how to set up a custom domain](/blog/how-to-set-up-a-custom-domain-for-qr-codes).

## Before you commit a hostname to print

Three things to get right, because the hostname cannot be changed afterwards.

- **Own the domain outright.** Not a free subdomain from a site builder, not a domain registered by an agency in its own name. If the registration lapses, every code dies with it, and this time it is your fault.
- **Keep the subdomain short.** It is going to be inside a QR code, and shorter URLs make smaller, more scannable codes. [Why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) has the version-and-module arithmetic. `qr.brand.com/x` is about as short as it gets.
- **Test a code on the custom domain from a print** before the print run, on both an iPhone and an Android. The certificate, the redirect and the destination all need to be checked from a real camera scan, not a browser.

## Frequently asked

**Do I need a custom domain for a QR code to work?**
No. A code on `qrly.lol` works identically and needs no account. A custom domain is for when the hostname matters: trust on sensitive pages, print that will outlive any one vendor, or simply having your own name in the phone's preview.

**Can I use my main domain rather than a subdomain?**
Technically a CNAME cannot be placed at the apex of a domain that also has other records, which is why a subdomain like `qr.` or `go.` is the norm. It also keeps your website's DNS untouched.

**Does a custom domain cost anything on QRly?**
No. There is no paid plan; custom domains are included, with the certificate issued automatically. The [cost page](/cost) shows what the incumbents publish for the same feature.

**What happens to my codes if I move away from QRly?**
Point the CNAME somewhere else that can serve the same paths, and the printed codes keep working. That portability is the reason to use a custom domain in the first place. Codes made on `qrly.lol` rather than your domain would need that hostname to keep serving them.

**Can I change the domain on an existing code?**
No. The hostname and slug are fixed once the link is saved, because they may already be printed. Make a new link on the custom domain and use that code for new print; the old code keeps working on its old address.
