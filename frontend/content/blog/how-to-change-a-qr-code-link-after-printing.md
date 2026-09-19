---
title: How to change a QR code link after it has already been printed
description: Step by step, how to change the link behind a QR code that is already printed using the QRly dashboard, and what your realistic options are if the printed code is static.
date: 2026-09-19
category: dynamic
keywords: change qr code link after printing, update qr code url, redirect qr code to new url, edit qr code destination, change qr code after printing, dynamic qr code, qr code link changed
---

Whether you can change the link behind a printed QR code comes down to a single fact about the code, and you can find it out in ten seconds with your phone. Point the camera at the code and look at the decoded text before you tap it.

- If the text is a short link on a QR service — `qrly.lol/something`, or a similar pattern on another domain — the code is **dynamic** and the link can be changed from that service's dashboard.
- If the text is your own URL, the code is **static** and the link cannot be changed. Skip to the last section; there are options, but none of them is an edit.

The rest of this post is the dynamic case on QRly, then the honest version of the static case.

## Step 1: make sure the link is yours

A QRly code can be made without an account, from [the home page](/) or [/create](/create). Editing it later needs an account, because the dashboard has to know which links you are allowed to touch.

If you made the code while signed in, it is already in your dashboard. If you made it anonymously, the browser you used holds a claim token for it; sign up from that same browser and the link is transferred to the new account. If you made it anonymously on a machine you no longer have, the link cannot be claimed, and the honest advice is to treat it as a static code from here on.

This is the one step worth doing before printing rather than after: claim the link, then print.

## Step 2: open the link in the dashboard

The dashboard lists every link you own, with its short link, current destination and scan count. Open the one that is printed. The page shows two things you cannot change, which are the hostname and the slug, and the things you can, which start with the destination.

You will notice the short link has no edit control. That is deliberate and it is enforced at the database, not just in the interface. The short link is what is printed, and renaming it would break every copy. [Why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) is the long version.

## Step 3: change the destination

Replace the destination URL and save. Two checks run before the change goes live:

1. The new URL is tested against Google Safe Browsing. A destination flagged as malware or phishing is refused; every destination is also re-checked weekly.
2. Private and local addresses — `localhost`, `10.x`, `192.168.x`, and the rest — are refused, because a redirect to them is never what a public code should do.

If the URL passes, the change is saved and pushed to the key-value store that the redirect engine reads from at every edge location.

## Step 4: wait up to a minute, then test

Propagation to every edge takes **under 60 seconds**. Most of the time it is a few seconds, but a minute is the figure to plan around. Scan the printed code with a phone — not the on-screen preview, the actual print — and confirm it lands on the new page.

Two things can make it look as if the change has not taken:

- **You scanned within the window.** Wait the full minute and scan again.
- **The destination page itself redirects.** If the new URL bounces somewhere else, that is the page's doing, not the QR code's. Open the new URL directly in a browser and see where it goes.

What will *not* cause a stale result is the phone's cache. QRly serves every short link as an HTTP 302, which browsers do not cache. A vendor that served a 301 would have a real problem here — a phone that scanned the code before the edit could keep going to the old destination indefinitely — and that is the reason a 301 is never used. [QR code redirects explained](/blog/qr-code-redirect-explained) goes into it.

## What else you can change while you are there

The destination is the main event, but the same page lets you:

- **Set or clear an expiry date.** After it, scans get an expired page instead of the destination. Useful for offers; see [QR codes with an expiration date](/blog/qr-code-with-expiration-date).
- **Add UTM parameters** to the destination so a web analytics tool can attribute the traffic. A `utm_source=qr` on the destination is enough for most tools.
- **Re-export the code** in a new design. The new file encodes the same short link, so old and new prints behave identically. Existing prints keep the old design.

None of these affect the scan history. Analytics for the link are one continuous record across every destination it has ever had.

## What to do if the printed code is static

There is no way to change a static code's link. The URL is in the pattern; the pattern is on paper. What you have are options, none of them an edit, and the cheapest one depends on where the old URL points.

**If you control the old URL's domain**, set up a redirect on the server. If the code encodes `example.com/menu` and the menu is now at `example.com/food`, a redirect from the first to the second makes every printed code work again. This is the same trick a dynamic code uses, done at your own web server rather than at a QR service. It only works if the old domain is yours and stays yours.

**If the old URL is on someone else's domain** — a social profile, a document link, a page on a service that has changed its URL scheme — nothing can be done. The code will go where the text says, and that is somewhere you do not control. Reprint.

**If you can reach the printed material**, a sticker with a new code over the old one is not elegant, but it is the standard fix for signage, packaging that is still in the warehouse and small print runs.

When you reprint, this is the moment to make the new code dynamic so the problem cannot recur. A [static versus dynamic](/blog/static-vs-dynamic-qr-codes) comparison is worth a minute before choosing, but the short version is: if you have ever needed to change a printed code's link, you want a dynamic one.

## Avoiding the problem next time

A few habits make this a non-event rather than a reprint:

1. Use a dynamic code for anything whose page might change — which, over the life of a print run, is nearly everything.
2. Claim the link in an account before the code goes to the printer.
3. Choose the short link's ending with care, because it is the one part you can never alter afterwards. [Custom short link QR codes](/blog/custom-short-link-qr-code) explains the constraint.
4. For material with a long life, consider a [custom domain](/blog/custom-domain-qr-code) so the printed hostname is yours. If the QR service ever went away, you could point the hostname at another redirect and the print would survive.
5. Test the code from a proof, not from a screen.

## Frequently asked

**Can I change the link on a QR code I already printed?**
Only if the code is dynamic, meaning it encodes a short link on a redirect service rather than your URL directly. On QRly you change the destination from the dashboard and every printed copy follows within a minute. A static code cannot be changed.

**How long does the change take to work?**
Under 60 seconds to reach every edge location, usually less. Scan the actual print after a minute to confirm.

**Will people who scanned the old code still see the old page?**
No. The redirect is a 302, which phones do not cache, so the next scan from any phone gets the current destination.

**Can I change the short link itself, not just where it goes?**
No. The hostname and slug are locked once saved, because they may already be printed. Only the destination, the expiry and the design are editable.

**I made the code without an account. Can I still edit it?**
Yes, if you sign up from the same browser that made it; the link carries a claim token that becomes ownership on registration. If that browser is gone, the link cannot be claimed.
