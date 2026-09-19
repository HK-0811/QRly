---
title: Instagram QR code: the built-in one versus a code you can redirect
description: Instagram makes its own QR code for your profile. What it can and cannot do, when a dynamic code is better, how to link a post or reel, and what scan tracking shows.
date: 2026-09-19
category: use-cases
keywords: instagram qr code, qr code for instagram profile, instagram link qr code, instagram qr code generator, qr code for instagram, instagram profile qr code, instagram reel qr code
---

Instagram will make you a QR code in about four taps, and for a lot of people that is the end of the question. It is worth ten minutes to understand what that code is, because the moment you print it — on a flyer, a shop window, a product tag — you have made a decision you cannot undo.

## What Instagram's own code is

On your profile, the menu (the three lines) has a **QR code** entry. Instagram generates a code, lets you pick a colour or a background, and you save it to your camera roll. Scanned with any phone camera, it opens your profile — in the app if it is installed, in the browser if not.

Underneath the decoration, it is a static code containing your profile URL: `instagram.com/yourhandle`, sometimes with a parameter that tells Instagram the visit came from a code. Static means:

- It goes where it goes. It cannot be pointed anywhere else once printed.
- It is tied to the **handle**. Instagram redirects old handles to new ones for a while after a change, but not forever and not reliably; a printed code with a retired handle can end up on someone else's profile or a "page not found".
- Nothing counts the scans except Instagram, which folds them into profile visits without a breakdown by code, placement or day.

For a code on a phone screen that you show someone at an event, none of that matters — use Instagram's. For anything printed in quantity or left in place, it is worth doing it differently.

## A dynamic code you can retarget

A dynamic code encodes a short link, and the short link redirects to the Instagram URL. The short link is what is printed; the destination is what you control. [Static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes) explains the mechanics; for Instagram it buys three specific things.

**The destination can change.** Point the same printed code at the profile today, at the launch post next week, at a reel during a campaign and back to the profile afterwards. Change the handle and update the link once, rather than reprinting every flyer.

**Scans are counted.** Every scan passes through the redirect, which records it — with no cookie and no script on the phone. That gives you the per-placement, per-day data that Instagram's own code does not.

**One code can do the work of several.** With a custom ending per placement — `qrly.lol/shop-window`, `qrly.lol/tag`, `qrly.lol/flyer-may` — you learn which placement produced the scans, even though all three point at the same profile. Later, one can be repointed without touching the others.

On QRly, paste the Instagram URL on [the home page](/) and download the code; no account is needed for that. Sign up to keep it editable. There is no expiry, no scan cap and no paid plan, so a code on a shop window keeps resolving for as long as the shop does. The redirect is a 302, and a change reaches every scanner within a minute.

## Profile, post, or reel

The URL you paste decides what opens. Get it from the app's share menu (**Copy link**) or from the browser.

| Destination | URL shape | When to use it |
|---|---|---|
| Profile | `instagram.com/yourhandle` | The default. Follow, browse, message. |
| A post | `instagram.com/p/<id>/` | A specific launch, offer or announcement with a shelf life. |
| A reel | `instagram.com/reel/<id>/` | A demo, a how-to, a piece of content that sells the thing. |
| A Story highlight | `instagram.com/stories/highlights/<id>/` | A curated set that outlives a single story. |
| A DM | `ig.me/m/yourhandle` | When the goal is a conversation, not a follow. |

A few things to know:

- **Posts and reels expire in practice.** Not on Instagram, but in relevance. A post code that points at a March offer in July is a static code's failure mode. With a dynamic code, the March post becomes the July post with one edit.
- **Individual stories cannot be linked reliably**; they disappear after 24 hours. Use a highlight.
- **The app opens the link if it is installed.** On both iOS and Android, Instagram registers its domain so links open in the app rather than the browser. That is handled by the phone; a redirect in front of the link does not change it, because the phone sees the final Instagram URL after the redirect and hands it to the app.

If the goal is a follow, link the profile. If the goal is a purchase or a sign-up, link the post or reel that makes the case, and put the "follow" in the caption.

## Design: make it look like yours without breaking it

Instagram's own code is styled, and a plain black square next to a pastel logo can look like it belongs to a different business. QRly's studio lets you set the foreground and background colours, round the modules or turn them into dots, change the finder patterns, and drop a logo in the centre — with the logo capped at the size the chosen error-correction level can survive, and a scannability read-out that says when the design has gone too far.

Two constraints that hold regardless of the tool:

- **Dark modules on a light background.** A gradient that fades to light pink in one corner stops scanning on older phones first. If the brand is pastel, put the code in a white panel. [Custom QR code colours](/blog/custom-qr-code-colours) sets out what contrast is needed.
- **Keep the quiet zone.** Four modules of blank space around the code, inside any frame. [QR code with logo](/blog/qr-code-with-logo) covers the logo rules and the error-correction trade-off.

Export SVG for print and PNG at 1024 or 2048 pixels for screens, both with no watermark.

## What the tracking tells you

A dynamic Instagram code on QRly reports, per link: total scans, unique visitors per day, country and city, local hour and weekday as a heatmap, device and OS, language, and the referrer. A few of those are particularly useful here.

**Referrer: none.** A real camera scan carries no referrer. If a link shows scans with a referrer, it was opened from somewhere else — someone shared the short link, or it was pasted into a bio. That separates print from digital.

**Hour and weekday.** A flyer handed out at a Saturday market shows a spike on Saturday afternoon and a tail on Sunday evening, when people go through their pockets. A tag on a product shows scans spread across the week. The [scan-time post](/blog/qr-code-scan-time-analytics) explains how to read the heatmap.

**Device.** Almost entirely mobile for an Instagram code. A desktop scan is someone who found the link some other way.

What you cannot see: whether the scan became a follow. Instagram does not report that back, and the redirect only sees the scan. Compare scans over a period against follower growth over the same period and you have a ratio; it is coarse, but it moves when the placement or the content changes, and that is what it is for. Uniques are per day, by design, so a regular customer counts once per day. [What you can actually know](/blog/qr-code-analytics-what-you-can-actually-know) sets the limits out.

## Frequently asked

**Should I use Instagram's own QR code?**
For showing on your phone screen, yes. For anything printed in quantity, a dynamic code is better: it can be repointed if your handle or your campaign changes, and it counts scans per placement.

**Can I make a QR code for a specific Instagram post or reel?**
Yes. Copy the post or reel link from the share menu and paste it into the generator. With a dynamic code, you can later repoint the same printed code to a newer post.

**Will the QR code open the Instagram app?**
If the app is installed, the phone hands Instagram links to it automatically. A dynamic code redirects to the same Instagram URL, so the behaviour is the same.

**Can I track scans on an Instagram QR code?**
Only with a dynamic code. QRly records scans at the redirect — country, city, time, device — with no script on the scanner's phone. It cannot tell you whether the scan became a follow; Instagram keeps that.

**What happens if I change my Instagram handle?**
A static code, including Instagram's own, points at the old handle and eventually breaks. A dynamic code is fixed by editing the destination once in the dashboard.
