---
title: How to check where a QR code goes before scanning, on any phone
description: Read a QR code's destination from the camera preview on iPhone and Android, decode one from a screenshot, expand a short link, and judge the domain against the context.
date: 2026-09-19
category: privacy
keywords: check qr code link, see where a qr code goes, preview qr code url, qr code url checker, qr code link preview, decode qr code from screenshot, expand short url qr code, is this qr code safe
---

A QR code hides its address until it is scanned. That is the entire reason it is useful for phishing, and it is also a problem that both phone platforms solved years ago: the camera decodes first and opens second, with the address shown in between. Most people tap through that step without reading it. This post is about reading it, and about what to do when the address is a short link that does not tell you much on its own.

The good news is that nothing here needs an app. The camera, a screenshot, and a browser are enough.

## The camera preview, on iPhone

Open the Camera app and point it at the code. Do not press the shutter; the camera recognises the code on its own and shows a yellow banner at the top or bottom of the screen. For a web link the banner reads something like **Open "qrly.lol" in Safari**, with the domain in the quotes.

That domain is the thing to read. Tapping the banner opens the page. Tapping and holding it instead brings up a menu with the full address and options to copy it, which is what you want when the domain alone is not enough to judge.

If no banner appears, check Settings, then Camera, and make sure Scan QR Codes is turned on. The Code Scanner in Control Centre does the same job with a larger view. [How to scan a QR code](/blog/how-to-scan-a-qr-code) covers both.

## The camera preview, on Android

Open the camera app and point it at the code. On most recent phones a chip or a small card appears over the code with the URL or its domain in it. Tap to open; long-press to copy or share the text. If your camera app does not show anything, Google Lens will, either from its icon in the camera or from the Lens button in the Google app, and it shows the full address before opening.

The exact appearance varies by manufacturer, but every current camera app has the step, and every one shows the domain. Read it before tapping.

## Reading a code you cannot scan live

Sometimes the code is on your own screen, in an email, in a PDF or in a photo someone sent you. You cannot point the phone at itself, and a laptop screen does not always scan well. Two options:

**Decode it from a screenshot or image.** On iPhone, take a screenshot and open it in Photos; touch and hold the code, or tap the Live Text button in the corner, and the same **Open in Safari** option appears with the domain. On Android, open the image in Google Photos and tap the Lens button. Both give you the address without visiting it.

**Use another device.** Display the code on one screen and scan it with a different phone, which is the honest way to test a code you are about to print anyway; [test a QR code before printing](/blog/test-a-qr-code-before-printing) goes through that.

Either way the rule is the same: get the text out of the code, then look at the text.

## When the address is a short link

A lot of codes contain a short link rather than the final address: something like `qrly.lol/menu` or a vendor's domain followed by a few characters. That is what makes a code editable after printing, and [what is a dynamic QR code](/blog/what-is-a-dynamic-qr-code) explains the mechanism. It also means the domain you read on the preview is the redirect service, not the destination.

To see the final destination without visiting it, copy the address from the preview and paste it into a short-link expander in your browser. These are ordinary websites that follow the redirect on your behalf and show you where it lands. Search for "URL expander" and use one that shows the full redirect chain rather than just the last hop. Some short-link services also offer their own preview route; check the service's documentation for the pattern, and if it has none, an expander works on any of them.

For QRly links specifically, the redirect is a single 302 to the destination stored on the link, with no interstitial page and no script, so an expander shows the destination in one step. If the destination has been flagged by Google Safe Browsing, the link does not redirect at all; it resolves to a warning page that names the destination without following it. [Safe Browsing and QR codes](/blog/safe-browsing-and-qr-codes) describes how that check works.

## What a trustworthy short domain looks like

Since the domain is the one thing on the preview you can judge, it helps to know what a good one looks like.

| Signal | Reads as |
|---|---|
| The organisation's own domain, or a subdomain of it, such as `qr.brandname.com` | Made by the organisation; anyone else would have to control their DNS |
| The domain of a known redirect service | Anyone could have made it, including the organisation; judge by context |
| A domain that is almost the organisation's name, with a letter swapped, a word added or a different ending | Lookalike, and the strongest single warning sign |
| A raw IP address, or a domain with no recognisable name at all | No reason for a legitimate printed code to look like this |
| A domain printed in plain text under the code that matches the preview | The printer wanted you to be able to check, which is itself a good sign |

Organisations that take this seriously put codes on their own domain for exactly this reason: a staff member or a regular customer can learn what the real one looks like. On QRly that is a [custom domain](/blog/custom-domain-qr-code), one CNAME record and a certificate issued automatically, so that every code an organisation prints previews as its own hostname.

## The rule: preview against context

Everything above comes down to one comparison. The preview tells you where the code goes. The surroundings tell you where it claims to go. If they agree, tap. If they disagree, do not.

A parking machine's code should preview as the parking operator or the app you already use. A restaurant's should preview as the restaurant or a menu platform, and the staff will know which. A bank letter's should preview as the bank's own domain, and a bank would much rather you typed the address you know than scanned anything. A code on a lamp post with no context at all has nothing to agree with, and that is an answer too.

The comparison takes two seconds and needs no technical knowledge. It defeats stickers over real codes, lookalike domains and the bulk of [quishing](/blog/qr-code-phishing-quishing), because all of those depend on the address not being read. [Are QR codes safe](/blog/are-qr-codes-safe) puts this in the wider picture of what a scan can and cannot do; the short version is that the code is inert, the link is the whole risk, and the preview is where you read the link.

> If the preview and the printed context disagree, the code has already told you everything you need to know.

## Frequently asked

**How do I see where a QR code goes without opening it?**
Point the camera at it and read the banner or chip that appears, which shows the domain. Tap and hold on iPhone, or long-press on Android, to copy the full address instead of opening it.

**Can I check a QR code from a screenshot?**
Yes. On iPhone, open the screenshot in Photos and use Live Text or touch and hold the code. On Android, open it in Google Photos and tap the Lens button. Both show the address without visiting it.

**How do I find the real destination of a short link in a QR code?**
Copy the short address from the preview and paste it into a short-link expander in your browser, which follows the redirect and shows where it lands. A QRly link redirects in one step, so the expander shows the destination directly.

**Is there an app that checks if a QR code is safe?**
The built-in camera on both platforms already previews the address before opening, and Chrome, Safari and Firefox warn about pages on Google Safe Browsing's lists when they load. A third-party scanner app adds another set of permissions and rarely adds a check those two do not already make.

**What if the preview shows a domain I do not recognise?**
Do not tap it. Look for a domain printed in plain text near the code, ask whoever appears to own it, or go to the organisation the normal way, through its app or its address as you know it. A code is a convenience, not an obligation.
