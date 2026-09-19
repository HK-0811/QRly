---
title: How to scan a QR code on iPhone and Android, and what to do when it won't
description: Scan a QR code with the camera on iOS or Android, use Google Lens, read one from a screenshot, and fix the usual reasons a code refuses to scan.
date: 2026-09-19
category: basics
keywords: how to scan a qr code, scan qr code iphone, scan qr code android, qr code scanner, scan qr code from screenshot, google lens qr code, qr code not scanning
---

Pointing a phone camera at a QR code works on nearly every phone sold in the last several years, with nothing to install. When it does not work, the cause is almost always on a short list, and none of the items on it needs a new app.

## Scan a QR code on an iPhone

Open the built-in Camera app and point it at the code. Do not press the shutter. After a moment a yellow notification appears at the top of the viewfinder showing the link's domain; tap it and the page opens in Safari. This has been built into iOS since version 11, so every iPhone that still receives updates can do it.

If nothing appears:

- Check the setting. Settings, then Camera, then **Scan QR Codes**. It is on by default but can be switched off.
- Move back. The camera needs the whole code in frame, including the blank border, and it needs to be in focus. Ten to twenty centimetres from a business-card-sized code is about right. A code across a room has to be a large code; see the [size guide](/blog/qr-code-size-guide) for how large.
- Use the Code Scanner instead. It is a Control Centre control (Settings, Control Centre, add **Code Scanner**). It opens links in an in-app browser rather than Safari, has a torch button, and does nothing else, which makes it useful in a dim restaurant.

To scan a code that is already on the phone as a photo or screenshot, open it in Photos, touch and hold on the code, and Live Text offers to open the link. That needs iOS 16 or later. On an older iPhone, open the image in the Google app or Google Photos and use the Lens button.

## Scan a QR code on Android

Android is more varied because each manufacturer ships its own camera app. Try these in order:

1. **The camera app.** On a Pixel, the camera detects a code automatically and shows a chip with the link. On a Samsung phone, the toggle is in the camera's own settings, labelled **Scan QR codes**, and is on by default on recent versions of One UI. Most other manufacturers have either automatic detection or a similar toggle.
2. **The Quick Settings tile.** Android 13 and later include a **QR code scanner** tile. Swipe down twice from the top of the screen, tap the edit pencil, and drag it into the active set. Some manufacturers rename it or leave it out.
3. **Google Lens.** Open the Google app and tap the camera icon in the search bar, or open any saved image in Google Photos and tap **Lens**. Lens decodes the code and shows the link.

The third route is also how to scan a screenshot: open it in Google Photos, tap Lens, tap the link. If the code is on a web page, there is no need to screenshot at all: long-press the image in Chrome and choose **Search image with Google**, which decodes it in place.

## Do you need a separate QR code scanner app

Mostly not. The built-in scanners are maintained by the operating system vendor, ask for no extra permissions, and do not keep a history of what you scanned for anyone else's benefit. A separate app earns its place in two situations: you scan dozens of codes a day and want a searchable history, or you want to see the full decoded text before anything opens.

If you do install one, check the permissions it requests. A scanner needs the camera and nothing else. One that wants location, contacts or a network of advertising SDKs is not a scanner; it is a data collector with a scanner attached.

## Read what a code contains before you open it

Both camera apps show you something before you tap. On iPhone it is the domain. On most Android scanners it is the full URL.

What you see depends on the kind of code. A **static** code contains the real address, so what the camera shows is where you will land. A **dynamic** code contains a short link, something like `qrly.lol/menu`, and the real destination is only revealed after the redirect. That is true of every dynamic generator, not just QRly; it is [how a dynamic code works](/blog/what-is-a-dynamic-qr-code). If the short domain is one you recognise, or the code is printed on something that clearly belongs to the business you are standing in, tapping it is a normal act. If it is a sticker on top of a parking meter's original code, it is not; there is a [longer guide to checking where a code goes](/blog/check-where-a-qr-code-goes-before-scanning).

## When a QR code will not scan

There are two different failures and they need different fixes. First work out which one you have.

**The camera shows nothing at all.** The code has not been decoded. In rough order of likelihood:

| Symptom | Likely cause | Fix |
|---|---|---|
| Blurry in the viewfinder | Too close, or the camera has not focused | Move back to 15 to 20 cm, hold still, tap the code on screen to focus |
| Bright patch across the code | Glare from a lamp or a window on glossy paper or a screen | Change the angle so the reflection moves off the code |
| Code fills the whole frame | No blank border visible | Step back until there is clear space around all four sides |
| Code is tiny in the frame | Too small for the distance | Get closer, or use the camera's zoom |
| Light modules on a dark background | Inverted colours | Some scanners handle this, many do not; try Google Lens |
| Pale colours, patterned background | Contrast too low | Try Lens; if it is your own code, redesign it |
| Scratched, creased, partly covered | Physical damage beyond what error correction can recover | Nothing to do on the scanning side |
| Square dots in a solid block, no corner squares | Not a QR code (Data Matrix, Aztec) | A dedicated scanner app usually reads these; camera apps often do not |

**The code scans but the page is wrong or broken.** The code is fine. The problem is the link inside it. A static code pointing at a page that has since moved will show a 404 for the rest of its life. A dynamic code whose vendor stopped serving the redirect shows a "deactivated" page, or an advert for the vendor. If it is your code, [there is a repair guide](/blog/qr-code-not-working-how-to-fix). If it is a dynamic code you own on QRly, the fix is to edit the destination in the dashboard; the printed code does not change.

**It scans on one phone but not another.** The design is borderline. Cameras decode differently, and a code with a thin quiet zone or a large logo will pass one and fail the other. For your own codes, test on both platforms before printing, and keep the design conservative. The [quiet zone](/blog/qr-code-quiet-zone) is the usual culprit.

## Making your own codes easy to scan

If you are on the other side of the camera, the scanning problems above turn into a short checklist. Keep the four-module quiet zone. Keep dark modules on a light background. Print at a size that suits the distance. Use a short link so the code has fewer, larger modules; a [QRly code](/create) encodes a short link and a version 2 or 3 code, which scans at smaller sizes and from further away than a code stuffed with a long URL. Then scan the printed result with both an iPhone and an Android before ordering five hundred more.

## Frequently asked

**Do I need an app to scan a QR code?**
No. The Camera app on iPhone and the camera or Quick Settings scanner on Android decode codes without anything installed. Google Lens covers the remaining cases, including images already saved on the phone.

**How do I scan a QR code that is on my own phone's screen?**
Take a screenshot, then open it in Photos (iPhone, touch and hold the code) or Google Photos (Android, tap Lens). You cannot point a phone's camera at its own screen, but you never need to.

**Why does my camera not show a link when I point it at a code?**
Usually one of: the scan setting is off, the phone is too close to focus, there is glare, or the blank border around the code is missing. Step back, move the reflection off the code, and check the setting.

**Is it safe to scan an unknown QR code?**
The scan itself is safe; decoding a pattern of squares runs nothing. The link it contains is the same as any link, so treat it the way you would treat a link in an email. The camera shows the domain before opening it, and there is a [full guide to QR code safety](/blog/are-qr-codes-safe).

**Why does the camera show a short link rather than the real website?**
The code is dynamic. It contains a short link that redirects to the destination, which is what lets the owner change the destination later and count scans. The redirect happens when you tap, in the browser, and no code runs on your phone.
