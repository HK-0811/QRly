---
title: QR code device analytics: iOS vs Android, browsers, and in-app scans
description: What the user agent tells a QR redirect about the phone, why iPhones report no model while Android does, how in-app browsers appear, and what to change because of it.
date: 2026-09-19
category: analytics
keywords: qr code device analytics, qr code ios vs android, qr code browser data, qr code device type, qr code operating system stats, qr code in-app browser, qr code user agent
---

Every phone that opens a QR link introduces itself. The introduction is the `User-Agent` header, a line of text that names the browser, the operating system and, on some platforms, the phone itself. It is the most reliable field a QR redirect records, and the one with the most practical use: it tells you which phones to test your destination page on.

This is what QRly's device panels contain, why they look lopsided between iOS and Android, and what to do with them.

## What is recorded

For each scan, the user agent is parsed into:

- **Device type** — mobile, tablet, desktop, or unknown; bots get their own class.
- **Vendor and model** — where the string contains them.
- **Operating system and version** — iOS 18, Android 15, and so on.
- **Browser and version** — Safari, Chrome, Samsung Internet, Firefox, and in-app browsers where identifiable.

The raw string is kept too, capped in length, because it is the only way to work out afterwards why a phone was classified oddly. It is dropped when the phone sends a privacy signal. None of this needs a script: the header arrives with the request, the redirect reads it and answers with a `302`, and the phone is on its way. [What QR code analytics can actually know](/blog/qr-code-analytics-what-you-can-actually-know) puts this field alongside the others.

## Why iPhones have no model and Android phones do

Open the device model chart and it will look as if Android users own phones and iPhone users own an abstraction. That is the data, not a fault.

Android browsers generally include the model identifier in the user agent: `SM-S911B` for a particular Samsung, `Pixel 8 Pro`, and so on. Some vendors use marketing names, some use internal codes, and the parser maps what it can. Chrome on Android has been reducing what it sends for several years, so newer devices may report a generic model or none, but the majority still show something.

Apple removed the model from Safari's user agent long ago. Every iPhone reports `iPhone`; every iPad reports `iPad` or, on recent versions with desktop-class Safari, looks like a Mac. There is no way for a redirect to tell an iPhone 12 from an iPhone 16, and any dashboard that claims to is inferring it from screen size, which needs a script on a page and is still a guess.

So the honest device model chart has one big bar labelled "iPhone" and a long tail of Android models. Read the vendor chart for the split you probably want — Apple against Samsung against Google against Xiaomi — and the model chart for the Android detail.

## iOS vs Android: what the split is for

The proportion varies enormously by country and by audience. A code on a product sold in Japan or the United States will skew to iOS; the same code in India or Brazil will skew to Android. Neither number is interesting in itself. What it is for:

**Testing.** The destination page must work on the phones that actually turn up, and the dashboard tells you which those are. If the split is 70% iOS, test on Safari first. If the long tail contains a lot of one Samsung model, test on that model's browser, which is often Samsung Internet rather than Chrome.

**Choosing what to put behind the code.** Some destinations behave differently by platform. An app-store link needs to go to the right store; a calendar file opens differently; a PDF renders in-browser on iOS and prompts a download on some Android browsers. QRly does not route by device — one link goes to one destination — but the destination page can, and the split tells you whether it is worth the effort. [QR code for app download](/blog/qr-code-for-app-download) covers the store-link case.

**Reading the other charts.** A code whose scans are mostly desktop is not being scanned from a printed thing; it is being opened from a link. That is not a fault, but it changes what the [location](/blog/qr-code-location-tracking) and [time](/blog/qr-code-scan-time-analytics) charts mean.

## Browsers and versions

The browser chart on a QR link is usually dominated by two entries, Safari and Chrome, because those are what the camera apps hand off to. The version columns matter more than they look.

Older browser versions are where the destination page breaks first: a CSS feature that is not supported, a JavaScript syntax the engine rejects, a font that does not load. If a meaningful share of scans arrives on a browser several versions behind, the page needs to degrade gracefully for it. The dashboard will not tell you the page broke — that is on the far side of the redirect — but it will tell you that a fifth of your scanners run a browser from two years ago, which is enough to go and check.

Two caveats on versions. Some browsers now freeze the OS version they report, so an "iOS 18" column can include newer releases. And Chrome on Android reports a reduced user agent by default, so version detail there is coarser than it was. Both are properties of the platforms, and both affect every analytics tool equally.

## In-app browsers

When a QR link is opened from inside an app — because the code was scanned with Instagram's or WhatsApp's own camera, or because the short link was pasted into a chat and tapped — the page opens in that app's embedded browser rather than in Safari or Chrome. The user agent usually says so, and the parser surfaces it where it can.

In-app browsers deserve attention because they are where destination pages fail quietly:

- They may not share the user's logged-in state with the real browser, so "sign in with Google" flows can loop or fail.
- They may block or mishandle downloads, so a PDF that works in Safari opens as a blank screen.
- They may not support some web features, and there is no address bar for the person to notice what went wrong.
- Some apps' scanners open the link inside the app by default; the person has to choose "open in browser" to escape.

If the browser chart shows a large in-app share, the destination page should be simple: no login required, no file download, one clear action. Where the link has to go somewhere that only works in a real browser, a landing page with a short "open in Safari or Chrome" line is a workable compromise.

## Network alongside device

The device panels sit next to the network ones — ISP or carrier, and a connection class of mobile, broadband, corporate or datacentre — and they are best read together. The dashboard also records the median round-trip time from the phone to the edge, which is a rough proxy for connection quality.

A code scanned mostly on mobile carriers, with a slow median round trip and a large share of older Android phones, is a code whose destination page should be small. Every image, font and script on that page is being fetched over that connection by that phone. The device data cannot measure whether the page loaded; combined with your own site analytics per [UTM placement](/blog/qr-code-utm-parameters-google-analytics), the gap between scans and recorded sessions will tell you.

## What device data cannot tell you

Because dashboards elsewhere sometimes suggest otherwise:

- **Screen size and resolution.** Not in the user agent. Needs a script on a page.
- **The iPhone model.** Not sent. Anyone showing it is guessing from a screen measurement taken on a page.
- **Whether it was the built-in camera or a scanner app.** Both hand the URL to the default browser and look the same. Only in-app scanners that keep the link inside their own browser are distinguishable.
- **Anything about the person.** The user agent describes the software, not who is holding it.
- **Desktop scans that were actually phone scans.** A person who scans with a phone and then sends the link to their laptop opens it from a desktop browser; the redirect sees the laptop.

## Frequently asked

**Can a QR code tell if I have an iPhone or Android?**
Yes, from the user agent the phone sends with every web request. It cannot tell which iPhone, and it learns nothing else about you from the header.

**Why does my dashboard show "iPhone" with no model but full model names for Android?**
Because Safari on iOS does not include the model in its user agent and Android browsers generally do. It is the same on every analytics product.

**Why are some scans from desktop computers?**
The short link was opened from a link rather than a camera — pasted into an email, a chat, or a document. The referrer field will often show where. It is normal on any code that has been shared.

**Can QRly send iPhone and Android users to different pages?**
No. One link goes to one destination. The destination page can redirect by platform itself if it needs to; the device split tells you whether that is worth building.

**How should I test the destination page?**
On the top two or three combinations the dashboard shows — typically Safari on a recent iPhone, Chrome on a recent Android, and whichever in-app browser appears most. From a printed proof, on mobile data, not from a screen on office Wi-Fi. [Test a QR code before printing](/blog/test-a-qr-code-before-printing) has the checklist.
