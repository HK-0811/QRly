---
title: How to make a QR code on Android: Chrome, Wi-Fi sharing, or a dynamic code
description: How to create a QR code on any Android phone with no app: Chrome's share menu, the built-in Wi-Fi code, Google Lens, and a dynamic code made in the browser.
date: 2026-09-19
category: how-to
keywords: how to make a qr code on android, android qr code generator, create qr code android, chrome qr code android, android wifi qr code, make qr code samsung
---

Android phones scan QR codes from the camera or Google Lens, and have done for years. Generating one is scattered across three different places depending on what you want to encode, and none of them is labelled "QR code generator". Here is where each one lives, what kind of code it makes, and when you should skip all of them and use the browser instead.

## Two kinds of code, and which one Android makes

Android's built-in options all produce **static** codes: the text or URL is encoded directly into the image. That is fine for a link you will never change. It is a problem for anything printed, because the day the link moves the code is scrap.

A **dynamic** code encodes a short link that redirects to the destination, so the destination can be edited later and scans can be counted. Android cannot make one of these natively because it needs a redirect service somewhere. That is the browser method further down. [Static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes) explains the trade-offs in full.

## Method 1: Chrome's share menu (static, any URL)

Chrome for Android generates a QR code for the page you are on.

1. Open the page in Chrome.
2. Tap the **three-dot menu**, then **Share**, or tap the share icon in the address bar.
3. Choose **QR Code**.
4. Chrome shows the code with the page URL under it. Tap **Download** to save a PNG to your Downloads folder, or share it directly.

This works for any web page, including ones you do not control. It encodes the full URL, so a long address with tracking parameters makes a dense code that is harder to scan from a distance. There is no way to change what it points to afterwards, and no scan count. For a quick link to a page that will not move, it is the fastest option on the phone.

The same menu also has a **Scan** tab, which is a decoder using the camera. Handy for checking a code someone sent you.

## Method 2: Wi-Fi sharing (static, Wi-Fi credentials only)

Android 10 and later can show a QR code for a Wi-Fi network you are connected to.

1. Open **Settings → Network & internet → Internet** (the exact path varies by manufacturer; on Samsung it is **Connections → Wi-Fi**).
2. Tap the network you are joined to, or the gear icon beside it.
3. Tap **Share** or the QR code icon. You may be asked for your screen lock.
4. The phone displays a `WIFI:` code. Screenshot it, or on recent versions save it directly.

This is the only place Android generates a Wi-Fi code natively, and it is the right tool for a guest network on a fridge door. It encodes the network name, security type and password in the `WIFI:` format that both Android and iOS cameras understand. It is a static code, and it is not a URL: if you change the password, you make a new code. QRly does not make these, because every QRly code is a URL; [QR code for Wi-Fi](/blog/qr-code-for-wifi) covers the format and the alternatives.

## Method 3: Google Lens (scanning, not generating)

Google Lens is Android's decoder, reachable from the camera app on most phones, from the Google search bar, or from the Lens app. It reads codes; it does not create them. It is worth knowing because it is the tool you will use to **test** whatever you generate, and because its behaviour explains a lot of "my code doesn't scan" reports. Lens is tolerant of low contrast and odd colours, so a code that scans on your Pixel may still fail on an older phone with a plainer camera app. Test on more than one device.

## Method 4: a dynamic code in the browser (editable after printing)

If the code is going on anything physical, or you want to know whether anyone scans it, make it in the browser.

1. Open [qrly.lol](/) in Chrome, Firefox, Samsung Internet or whatever you use.
2. Paste the destination URL and tap the button. You get a short link (`qrly.lol/<ending>`) and a QR code that encodes it. No account is needed.
3. Optionally open the studio: colour, module shape, finder shape, error-correction level, quiet zone width and a logo. The scannability read-out warns you if the design will not decode reliably.
4. Download as SVG, or PNG at 512, 1024 or 2048 pixels.
5. If you want to edit the destination later, or see the scans, create a free account afterwards. The downloaded code is already yours and does not change.

The code contains the short link. A scan hits the redirect engine, which sends a **302** to your destination. Change the destination from the dashboard and every scanner sees the new page in under a minute. There is no expiry, no cap and no watermark, and QRly [costs nothing to operate](/cost), which is why it can stay free without a paid tier.

## Saving SVG and PNG on Android

Android's file handling is more predictable than iOS's, but two things trip people up.

**PNG** downloads land in **Downloads**, and Chrome and Samsung Internet both put them in the Gallery or Photos app as well. Attach from either. For a message or a social post, 1024 is plenty. For anything printed, 2048, or the SVG.

**SVG** downloads also land in Downloads, but the Gallery will not show them and most messaging apps will preview them as a blank tile. That is normal. The file is intact; it just is not a photo. Send it to a printer or designer through Files, Drive or email, and they will open it in the vector editor of their choice. If you need to check it yourself, Chrome can open a local SVG from the Files app. [Downloading a QR code as SVG](/blog/how-to-download-a-qr-code-as-svg) covers what is inside the file and which tools open it.

| You want to | Use |
|---|---|
| Send the code in WhatsApp, Telegram, email | PNG 1024 from Downloads or Gallery |
| Put it in Google Docs or Slides on the phone | PNG 1024 or 2048 (the mobile apps do not place SVG well) |
| Hand it to a printer or designer | SVG via Files, Drive or email |
| Print at home over the network | PNG 2048, at least 2 cm a side on the page |
| Show it on screen for someone to scan | Any; turn the brightness up |

Do not screenshot a code and use the screenshot for print. The quiet zone is cropped, the resolution is whatever the screen was, and the result scans worse than the file you could have downloaded in one tap.

## Which method for which job

- **A link to a page you own, sent right now**: Chrome's QR Code share. Five seconds, static, done.
- **Guest Wi-Fi**: the built-in Wi-Fi share. Nothing else on the phone does this, and a URL-based generator cannot.
- **A contact card**: Android has no native vCard code. Any static generator handles vCard; [QR code for a business card](/blog/qr-code-for-business-card) explains why a dynamic link to a profile page is often the better choice anyway.
- **A menu, a poster, a sticker, packaging, a sign, anything you want counted**: the browser method. It is the only one where the printed code and the destination are separate.

Before you rely on the result, scan it with the camera and with Lens, from a print if it is going to print, and check the URL the phone shows before it opens anything. [Test a QR code before printing](/blog/test-a-qr-code-before-printing) has the checklist, and [QR code not working](/blog/qr-code-not-working-how-to-fix) is the diagnosis order when one fails.

## Frequently asked

**Does Android have a built-in QR code generator?**
For a web page, Chrome's share menu makes one. For Wi-Fi, the Wi-Fi settings make one. There is no general-purpose generator in Android itself, and no built-in way to make a code whose destination can be changed later.

**How do I make a QR code on a Samsung phone?**
The same ways. Samsung Internet has a QR option in its menu too, Wi-Fi sharing is under Connections → Wi-Fi, and the browser method works in any browser. Samsung's camera scans codes directly when "Scan QR codes" is on in camera settings.

**Do I need an app from the Play Store?**
No. Most generator apps wrap the same static encoding Chrome already does, behind ads or a subscription. A dynamic code needs a service, not an app, and that is done in the browser without installing anything.

**Where do downloaded QR codes go on Android?**
The Downloads folder. PNGs also appear in Gallery or Photos. SVGs stay in Downloads and will not preview as images, which is expected.

**Can I change the link after making the code on Android?**
Only with a dynamic code. Chrome and Wi-Fi sharing produce static codes containing the data itself. A QRly code contains a short link whose destination you edit from the dashboard after signing up; the code you already downloaded and printed stays the same.
