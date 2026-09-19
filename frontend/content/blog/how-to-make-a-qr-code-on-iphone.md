---
title: How to make a QR code on iPhone: Shortcuts, Chrome, or a dynamic code
description: Four ways to create a QR code on an iPhone with no app install: the Shortcuts action, Chrome's share menu, Safari, and a dynamic code you can edit after printing.
date: 2026-09-19
category: how-to
keywords: how to make a qr code on iphone, iphone qr code generator, create qr code iphone, qr code shortcuts iphone, make qr code safari, ios qr code generator free
---

An iPhone has been able to *read* QR codes from the Camera app since iOS 11. Making one is less obvious. There is no "create QR code" button in Safari's share sheet, and the App Store is full of generator apps that want a subscription for something the phone can already do.

Here are the four routes that actually work, from the most built-in to the most useful, and when each one is the right choice.

## First, decide what kind of code you need

Every QR code encodes some text. When it is a web address, the phone opens it. There are two ways to set that up, and the difference matters more on a phone than anywhere else because you are usually about to send the code somewhere you cannot take it back from.

A **static** code encodes your URL directly. It never expires and needs nobody's server, but if the link changes the code is dead. The Shortcuts and Chrome methods below make static codes.

A **dynamic** code encodes a short link that redirects to your page. You can change where it goes later, and you can see how often it is scanned. That needs a service, which is the Safari method below. The trade-offs are covered properly in [static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes); the short version is that if the destination might ever change, or you want a scan count, go dynamic.

## Method 1: the Shortcuts app (built in, static)

Apple's Shortcuts app ships on every iPhone and has a **Generate QR Code** action. It takes text and outputs an image. This is the nearest thing iOS has to a native generator.

1. Open **Shortcuts** and tap **+** to make a new shortcut.
2. Add the action **Ask for Input** (so the shortcut prompts you for a URL each time), or **Text** if you want to hard-code one.
3. Add **Generate QR Code**. Set its input to the text from the previous step.
4. Add **Save to Photo Album**, or **Quick Look** if you just want to see it.
5. Name the shortcut and run it. Add it to the Home Screen or the share sheet if you will use it often.

What you get is a plain black-on-white PNG of a static code. There is no logo, no colour and no way to change what it points to. It is also not a vector, so for print you should follow the [size guide](/blog/qr-code-size-guide) and check the output will survive at the size you need. Shortcuts does not let you set the pixel size directly; the output is fixed and modest, which is fine for a screen and marginal for a poster.

If you use the share-sheet version (enable **Show in Share Sheet** in the shortcut's details and accept URLs), you can be on any web page in Safari, tap Share, tap the shortcut, and have a code for the current page in one step.

## Method 2: Chrome for iOS (built in, static)

If you have Google Chrome installed, it has had a QR code option for the current page for a few years.

1. Open the page in Chrome.
2. Tap the **Share** icon in the address bar.
3. Choose **QR Code** (sometimes under "More").
4. Chrome shows a code for the page URL. Tap **Share** or save the image.

This is a static code of the full page URL. Long URLs make dense codes; a Chrome-generated code for a page with tracking parameters can easily be 33 or more modules a side, which is harder to scan from a distance. There is no editing afterwards. It is the quickest option when the page is on a domain you control and the link will not move.

## Method 3: Safari share sheet (what is not there)

Safari on iOS does not generate QR codes. The share sheet can send a URL to any app or shortcut, and that is the route Apple expects you to use: add the Shortcuts action from Method 1 to the share sheet, and Safari becomes a generator by proxy. If you were searching for a Safari setting that does this natively, there is not one.

## Method 4: a dynamic code in Safari (no app, editable later)

This is the method to use if the code is going anywhere physical: a menu, a business card, a sticker on a product, a poster in a window. The reason is that you get to change the destination after printing, which the two built-in methods cannot do.

1. Open [qrly.lol](/) in Safari.
2. Paste the URL and tap the button. You get a short link (`qrly.lol/<ending>`) and the QR code that encodes it. No account is needed for this step.
3. Optionally open the studio to change colour, module shape, finder shape and add a logo. The scannability read-out tells you if a design has gone too far.
4. Download. On iPhone, a **PNG** download goes to Photos or Files depending on your Safari settings (Settings → Apps → Safari → Downloads). An **SVG** goes to Files, because Photos does not accept vector files. For anything a designer or printer will handle, take the SVG; for messaging and social, take the PNG at 1024.
5. If you want to edit the destination later or see scans, create a free account afterwards. The code you already downloaded does not change; the account just gives you the dashboard for it.

The code encodes the short link, which sends a **302** redirect to your destination. Changing the destination from the dashboard reaches every scanner in under a minute, and there is no expiry, no scan cap and no watermark. QRly costs [nothing to run](/cost) and the source is public, so that claim is checkable rather than a promise.

## Saving and sharing on iPhone: the practical bits

| You want to | Do this |
|---|---|
| Put the code in a message or email | Save the PNG to Photos and attach it, or share directly from the download sheet. |
| Add it to a Pages or Keynote document | Use the SVG from Files. Both apps place vectors cleanly. |
| Send it to a printer | SVG, via Files, AirDrop or email. Not a screenshot. |
| Show it on your screen for someone to scan | Any format. Turn the brightness up; auto-brightness in a dim room is the usual failure. |
| Print from an AirPrint printer | Open the PNG at 1024 or 2048 in Photos and print. Keep it at least 2 cm a side. |

Do not screenshot a QR code from a web page and use the screenshot for anything printed. You lose the quiet zone, the resolution is whatever your screen was, and any compression artefacts are baked in. Download the file.

## Which method for which job

- **A link to send someone right now, from a page you own**: Chrome or Shortcuts. Static, done in five seconds.
- **A Wi-Fi code for guests**: neither of these, and not QRly either. iOS can share Wi-Fi between nearby Apple devices but does not generate a `WIFI:` code in the Settings app. See [QR code for Wi-Fi](/blog/qr-code-for-wifi) for how to make that with a static generator.
- **A contact card**: any static generator handles vCard, and recent versions of iOS can show a code for your own contact card from the Contacts app. The [business card post](/blog/qr-code-for-business-card) covers when a dynamic link to a profile page is the better choice.
- **Anything printed, or anything you want to count**: the dynamic route in Safari. It is the only one of the four where the printed thing and the destination are separate.

Test the result before you rely on it. Point the Camera at the code on your own screen, then on a print, and confirm the notification that appears shows the address you expect. The full checklist is in [test a QR code before printing](/blog/test-a-qr-code-before-printing), and if something refuses to scan, [QR code not working](/blog/qr-code-not-working-how-to-fix) walks through the causes in order.

## Frequently asked

**Does the iPhone have a built-in QR code generator?**
Not as a single button. The Shortcuts app has a Generate QR Code action that produces a static code from any text, and Chrome for iOS can make one for the current page. Safari does not generate codes itself.

**Do I need to install an app to make a QR code on iPhone?**
No. Shortcuts is already on the phone, and a dynamic code can be made in Safari at qrly.lol without an account. The generator apps in the App Store mostly wrap the same two things behind a subscription.

**Can I make a QR code on iPhone for free without a watermark?**
Yes. Shortcuts output has no watermark, and neither does a QRly SVG or PNG. Watermarks are a feature of specific generator apps, not of the format.

**Where does the downloaded QR code go on my iPhone?**
PNG images go to Photos or the Downloads folder in Files, depending on Safari's download setting. SVG files always go to Files. Check Settings → Apps → Safari → Downloads if you cannot find one.

**Can I edit the link after I have made the code?**
Only with a dynamic code. Shortcuts and Chrome make static codes that contain the URL itself. A QRly code contains a short link whose destination you can change from the dashboard after signing up, without touching the printed code.
