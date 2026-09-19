---
title: WhatsApp QR code: a wa.me link with a pre-filled message you can edit
description: How to make a QR code that opens a WhatsApp chat with your number and a pre-written message using a wa.me link, and why a dynamic code lets you change the number later.
date: 2026-09-19
category: use-cases
keywords: whatsapp qr code, qr code for whatsapp number, whatsapp link qr code, wa.me qr code, whatsapp business qr code, qr code to open whatsapp chat, whatsapp qr code with message, whatsapp qr code for shop
---

A WhatsApp QR code is a QR code that contains a link. That is the whole thing. WhatsApp publishes a link format, `wa.me`, that opens a chat with a given number and can pre-fill the first message; a QR code that encodes that link opens the chat when scanned with a phone camera. Because it is a link, everything that applies to a link QR code applies here, including the option of making it editable after it is printed on the shop window.

## The link format

The link is `https://wa.me/` followed by the phone number in international format with nothing but digits: no plus sign, no leading zeros, no spaces, brackets or dashes.

- A UK number written as +44 20 7946 0123 becomes `https://wa.me/442079460123`
- An Indian number written as +91 98765 43210 becomes `https://wa.me/919876543210`
- A US number written as (415) 555-0123 becomes `https://wa.me/14155550123`

To pre-fill the first message, add `?text=` and the message, URL-encoded. Spaces become `%20`, and most punctuation needs encoding too:

```
https://wa.me/442079460123?text=Hi%2C%20I%20saw%20your%20poster%20at%20the%20station
```

When that opens, the scanner sees your number as a new chat with the message already typed and a send button. They can edit it before sending, and nothing is sent until they tap.

Any text encoder will do the `%20` work; a search for "URL encode" gives a dozen. Keep the message short. It is the opening line of a conversation, not a form, and the longer it is the more suspicious it looks in the chat window. The older form `https://api.whatsapp.com/send?phone=442079460123&text=...` still works and does the same thing.

## Business or personal

**WhatsApp Business** has a short-link feature in its business tools that produces a link of the form `wa.me/message/XXXXXXXX`, with a default message you set in the app, and it shows a QR code for that link in the same screen. That code encodes the short link, so it is a link code like any other. The advantage is that the message is edited in the app rather than in the URL; the limit is that the link is tied to that account and that number.

**Personal WhatsApp** has a QR code in its settings that other people scan to add you as a contact. That is a contact-sharing feature rather than a "start a chat with this message" link, and it is not what you want on a poster.

For either kind of account, the `wa.me/<number>` link works and opens a chat with that number. It does not need the Business app, it does not require the business tools, and it is what you should encode if you want to control the message or the number yourself.

## This is not the WhatsApp Web code

There is a third QR code with WhatsApp's name on it, and people do occasionally print it. The code on web.whatsapp.com, and in the desktop app, is a device-pairing code: you scan it from *Linked devices* in the phone app to log that computer into your account. It changes every minute or so and it is a session credential, not a link. Scanning it with a camera does nothing useful, and a screenshot of it on a flyer is just a picture of an expired code. If you have scanned a WhatsApp code from a shop and nothing happened, this is often what it was.

## Make it dynamic, because numbers change

The `wa.me` link is a static payload; a phone camera reads it and opens the chat. You can encode it directly with any static generator and it will work forever, for that number, with that message.

That is the problem. The number on the shop window is the number of whoever answers WhatsApp for the shop, and that person changes. Staff leave. The business gets a proper business line. The SIM that ran the "orders" phone dies. Every one of those events makes a static WhatsApp code on a window, a menu, a van and five hundred flyers wrong at once.

A [dynamic code](/blog/what-is-a-dynamic-qr-code) fixes this by putting the `wa.me` link behind a short link. The printed code encodes `qrly.lol/<slug>`; the redirect sends the scanner on to `https://wa.me/442079460123?text=...` with a 302; when the number changes, you edit the destination in the dashboard and the printed code follows within a minute. The [change-after-printing post](/blog/how-to-change-a-qr-code-link-after-printing) walks through the edit.

The same edit changes the message. A seasonal opener, a different message for a different promotion, or a switch from "book a table" to "order for collection" when the rules change, without touching the print.

Setting it up on QRly:

1. Build the `wa.me` link with the number and the encoded message.
2. Paste it at [/create](/create) or on the [home page](/). No account is needed for this step.
3. Choose an ending, `qrly.lol/chat-with-us` or similar, and download the SVG.
4. Sign up to claim the link, so the number is editable later.

One caution: the destination is checked against Google Safe Browsing and private or local addresses are refused, but `wa.me` is a public domain and passes. Every QRly code goes through the same check; the [safe browsing post](/blog/safe-browsing-and-qr-codes) explains what it does and does not catch.

## What happens on a phone without WhatsApp

Not every scanner has WhatsApp installed, and an iPhone or Android without it opens the `wa.me` link in the browser, where WhatsApp shows a page with a button to continue to the chat and a link to install the app. That is WhatsApp's page, not yours. If the audience is likely to be mixed — a tourist area, an older customer base — consider pointing the dynamic code at a small page of your own with the WhatsApp link, your phone number and email on it, and let people choose. The [phone number and SMS post](/blog/qr-code-for-phone-number-and-sms) covers the `tel:` and `sms:` codes for the other two, which are static payloads a phone's own tools can make.

## Where the code goes, and what to write in the message

The message you pre-fill can do a job the code cannot: tell you where the scan happened. "Hi, I'm at the counter and want to order" versus "Hi, I saw the van" versus "Hi, I found you on the leaflet" arrive in your chat window labelled by placement, before you have looked at any dashboard. One dynamic code per placement, each with its own message, and the chat itself becomes the report.

Common placements and the message that fits:

| Placement | Pre-filled message |
|---|---|
| Shop window or door | "Hi, I'm outside. Are you open today?" |
| Table tent or menu | "Hi, I'd like to order from table" |
| Delivery packaging or invoice | "Hi, this is about order number" |
| Vehicle | "Hi, I saw your van and I'd like a quote" |
| Business card | "Hi, we met at" |

Leave the message ending open where the customer needs to fill something in; they will. The [business card post](/blog/qr-code-for-business-card) covers sizes and placement for the smallest of these.

For print: 2 cm square minimum on cards and packaging, 5 cm or more on a window, dark on light, with a clear border of at least four modules. Export the SVG for the printer.

## What the dashboard adds

Because the redirect sees every scan before WhatsApp does, QRly records for each link the total scans, unique visitors per day, hour and weekday in the scanner's local time, approximate city, device and OS, and the referrer, where none means a real camera scan. The [time analytics post](/blog/qr-code-scan-time-analytics) is the useful one here: a food business finds out when the window code is scanned and whether anyone is answering at that hour.

Nothing runs on the scanner's phone, no cookie is set, and the IP address is discarded once the geo fields are derived. What the scanner then says to you in WhatsApp is between you and WhatsApp; the redirect never sees it. The [privacy page](/privacy) lists everything kept.

## Frequently asked

**How do I make a QR code for my WhatsApp number?**
Build the link `https://wa.me/<number>` with the number in international format and digits only, add `?text=` and a URL-encoded message if you want one, and make a QR code from that link. A dynamic code lets you change the number later.

**Can the QR code pre-fill a message?**
Yes. Add `?text=` followed by the URL-encoded message to the `wa.me` link. The scanner sees the message typed and ready, and nothing is sent until they tap send.

**Do I need WhatsApp Business for this?**
No. The `wa.me/<number>` link works for any WhatsApp number. WhatsApp Business adds its own short link and a QR code for it, with a default message set in the app; both are link codes and either works.

**Can I change the number after the code is printed?**
With a dynamic code, yes. The printed code holds a short link; edit its destination in the dashboard to the new `wa.me` link and the change is live everywhere within a minute. A static code encoding the `wa.me` link directly cannot be changed.

**Is the WhatsApp Web QR code the same thing?**
No. The code on web.whatsapp.com is a login credential for pairing a computer to your account, it expires within minutes, and it does nothing when scanned with a camera. Never print it.
