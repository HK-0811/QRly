---
title: QR code for a phone number or text message: how tel: and sms: codes work
description: A tel: QR code dials a number and an sms: code opens a text with the body filled in. Both are static. Here is the syntax, the pitfalls, and when a link is better.
date: 2026-09-19
category: use-cases
keywords: qr code for phone number, qr code to call, sms qr code, qr code to send text, tel qr code, qr code call phone, text message qr code, click to call qr code
---

"Scan to call" and "text us" codes appear on van doors, estate-agent boards, takeaway menus and the back of tradespeople's business cards. They do exactly one thing each: open the dialler with a number ready, or open the messaging app with a number and a message ready. There is no web page in between, which is both the appeal and the limitation.

This article explains what those codes contain, how to make them, where they fail, and when you are better off with a dynamic link to a contact page.

## What a phone-number QR code contains

A QR code holds text. For a call, the text is a `tel:` URI:

```
tel:+442071234567
```

For a text message, it is an `sms:` URI, optionally with a body:

```
sms:+442071234567?body=Hi%2C%20I%20saw%20your%20sign%20on
```

The rules that matter:

- **Use the international format.** A leading `+` and the country code, no spaces, brackets or dashes. `tel:+14155551234`, not `tel:(415) 555-1234`. The local form works on a phone in the same country and fails for anyone else, and you cannot know who will scan.
- **Percent-encode the body.** A space is `%20`, a comma `%2C`, a line break `%0A`. Keep it short: every character adds modules to the code, and the recipient is about to type anyway.
- **The `?body=` form is the standard one.** Older iPhones wanted `;body=` and older Android readers used a `SMSTO:number:message` format. Current iOS and Android both accept `sms:number?body=text`, and it is what the relevant RFC (5724) specifies, so use it and test on both platforms.
- **Multiple recipients** are separated with commas in `sms:`, though support varies and it is rarely what a printed code needs.

| Code | Payload | What the phone does |
|---|---|---|
| Call | `tel:+442071234567` | Opens the dialler with the number; the user taps to call |
| Text | `sms:+442071234567` | Opens Messages to that number, blank |
| Text with message | `sms:+442071234567?body=Quote%20please` | Opens Messages with the text ready to send |

Phones do not auto-dial or auto-send. The scan puts the number in front of the user; the user presses the button. That is deliberate and there is no way round it.

## How to make one

These are **static** codes: the text is encoded directly into the pattern. Any static generator or QR library will produce one, since they encode whatever text they are given. Type the payload exactly, including the `tel:` or `sms:` prefix, and check by pointing a phone at the screen: the camera should offer to call or message, not to open a browser.

On an iPhone, the Shortcuts app has a "Generate QR Code" action that takes any text. On Android, several manufacturers' camera or Quick Share tools do the same, and the [Android guide](/blog/how-to-make-a-qr-code-on-android) lists them. Chrome's built-in generator only makes codes for the page you are on, so it is no use here.

QRly does not make `tel:` or `sms:` codes. Every QRly code is a URL short link that redirects to a web address. That is a different tool, and it is the right tool more often than people expect, which is the second half of this article.

## Where phone-number codes break

**Someone scans it from a tablet or laptop.** A device with no phone function opens nothing, or an error. Trade-show visitors scanning with an iPad, or anyone using a desktop webcam scanner, get a dead end.

**The number changes.** A new office line, a staff member who leaves with the mobile, a switch from a landline to a WhatsApp business number. Every printed code now dials the wrong thing, and there is no redirect to update, because there is no redirect. The [static versus dynamic](/blog/static-vs-dynamic-qr-codes) distinction is the entire issue.

**You cannot tell whether it works.** No scan is counted anywhere. A "scan to call" sticker on fifty vans might be generating half your enquiries or none, and there is no way to know which.

**One action only.** The person who scanned might have preferred WhatsApp, or a callback form, or to see your opening hours before ringing. A `tel:` code offers exactly one door.

**The number is public.** A decoded QR code is plain text. Printing `tel:+44…` in a code is printing the number, with the same exposure to scrapers.

## When a dynamic link is better

For anything printed in quantity or expected to last more than a season, point the code at a **contact page** instead. A single page can hold a tap-to-call button (itself a `tel:` link, so the one-tap convenience is not lost), a [WhatsApp link](/blog/qr-code-for-whatsapp), an SMS button, a form for people at a desk, opening hours and a map. It works on every device, and the buttons that need a phone simply do not appear on a tablet.

Made as a dynamic code, the page also becomes changeable. On QRly you paste the contact page URL, get a short link and a code that encodes the short link, and when the number moves you [change the destination](/blog/how-to-change-a-qr-code-link-after-printing) or the page itself. Every van door, sign and card follows within a minute. There is no account needed to make the code, [no paid plan](/cost), and no expiry.

Because the redirect sees the scan, you also get a count. QRly records where, when and on what kind of device each scan happened, without any cookie or script on the scanner's phone. Print a different code for each placement (`van`, `board`, `menu`) and you learn which one people actually use. Location is city-level and approximate, but "the estate-agent boards in one town are scanned and the ones in the other are not" is a real finding.

A reasonable rule of thumb:

- **One number, one device type, short life, no need to count:** a `tel:` or `sms:` static code is fine and slightly faster for the user.
- **Anything else:** a dynamic code to a page with the call button on it.

For [real-estate signs](/blog/qr-code-for-real-estate-signs) and vehicle livery, where the print outlives the phone number almost every time, the dynamic route is the safe default.

## Testing before you print

Whichever you choose, test from a print at the final size, not from a screen. For `tel:` and `sms:` codes specifically:

1. Scan with an iPhone camera and check it offers Call or Message.
2. Scan with an Android camera and check the same, and that the pre-filled body survives intact.
3. Check the number shown includes the `+` and country code.
4. Send yourself the text once, to be sure the encoding did not mangle punctuation.
5. Keep the quiet zone: four clear modules on every side, and dark on light. The [general troubleshooting list](/blog/qr-code-not-working-how-to-fix) covers the rest.

A code that dials the wrong number is worse than no code, and unlike a wrong web link, you will not get a bounce report telling you.

## Frequently asked

**How do I make a QR code that calls a phone number?**
Encode `tel:+` followed by the full international number, with any static QR generator or the Shortcuts app on an iPhone. Scanning shows the number and offers to call; the user still has to tap. QRly does not make `tel:` codes, only dynamic URL codes.

**How do I make a QR code that sends a text message?**
Encode `sms:+number?body=your%20message`, percent-encoding spaces. The phone opens its messaging app with the number and text filled in, ready to send.

**Can I change the phone number after the code is printed?**
Not on a `tel:` or `sms:` code. If the number might change, print a dynamic code that links to a contact page with a call button on it, and update the page or the destination later.

**Does a phone-number QR code work on a tablet or computer?**
Usually not; there is no dialler to open. A link to a contact page works everywhere and can still offer one-tap calling on a phone.

**Can I track scans on a call QR code?**
Not on a static one. A dynamic code to a contact page records each scan at the redirect, which is the only place a scan can be counted.
