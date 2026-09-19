---
title: QR code on a business card: what to link, how big, and which side
description: A business card QR code should open a page you can change, not a contact file you cannot. Sizing for an 85 by 55 mm card, the quiet zone, and where to put it.
date: 2026-09-19
category: use-cases
keywords: qr code business card, qr code on business card, business card qr code generator, business card qr code, qr code for business card free, vcard qr code, digital business card qr code
---

A business card is the one print job where the QR code is almost certain to outlive the information on it. Cards come in boxes of 250 or 500, and the job title, the extension or the company changes long before the box is empty. The code is the part that can keep up — if it is set up to.

There are two things a business card code can do, and they behave very differently once printed.

## Option one: a code that opens a page

The code encodes a URL, and the phone opens it in the browser. The page can be:

- **A landing page you control** — a short "about me" page on your site with your role, a photo, a contact form and links out. This is the strongest option because you own the page and can change any of it.
- **A LinkedIn profile.** Practical if LinkedIn is where you want the conversation to continue. The profile URL is stable, and the phone will usually open the app if it is installed. [QR code for a LinkedIn profile](/blog/qr-code-for-linkedin-profile) covers the specifics.
- **A contact page** on your company site, or a booking link if the card's job is to get meetings.

The important choice is not which page but whether the code is **dynamic**. A dynamic code encodes a short link that redirects to the page, and the redirect can be changed after printing. Change jobs, and the code on every card you have already handed out follows you to the new page. That is the whole argument, and for a card it is decisive. [Static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes) sets out the mechanics.

On QRly the short link is made on [the home page](/) before any signup, it never expires, and there is no plan to lapse. For a card that will sit in a drawer for three years, the thing to check on any generator is what happens to the redirect when you stop paying or logging in. Here, nothing.

A dynamic code also counts. Each scan is recorded at the redirect — country, city, device, time of day — with no script on the scanner's phone, so you know whether the cards from a conference were scanned at all, and when. [Free QR code tracking](/blog/free-qr-code-tracking) explains what is recorded and what is not.

## Option two: a vCard code

A vCard code encodes the contact details themselves — name, phone, email, organisation — as text in the vCard format. When a phone scans it, the camera offers to save a new contact. Nothing is downloaded, no page opens, and it works with no network connection.

That is genuinely useful, and for some people it is the right choice. It has two limits, which are one limit seen from two sides.

First, a vCard code is **static by nature**. The details are in the code. If your phone number changes, every printed card carries the old one, permanently. Second, it **cannot be tracked**: the phone reads the contact straight out of the pattern, and nothing on any server sees the scan.

There is also a size cost. A vCard with a name, two numbers, an email, a company and an address is a few hundred characters, which produces a dense code — a version 10 or higher, with small modules that need to be printed larger and cleaner than a short URL does. On an 85 by 55 mm card that is a real constraint.

**QRly does not generate vCard codes.** Every QRly code is a URL short link. If you want the save-a-contact behaviour, any static generator will make one, and [QR code for a vCard contact](/blog/qr-code-for-vcard-contact) explains the format and the trade-offs. A common compromise is a dynamic URL code that opens a small page with a "save contact" button linking to a `.vcf` file — you keep the editable destination and the scan count, and the person still gets a one-tap contact save.

| | URL code (dynamic) | vCard code (static) |
|---|---|---|
| What happens on scan | Opens a page | Offers to save a contact |
| Works offline | No | Yes |
| Editable after printing | Yes | No |
| Scan count | Yes | No |
| Code density | Low (short link) | High (hundreds of characters) |
| Made by QRly | Yes | No |

## Size on an 85 by 55 mm card

The standard card in most of the world is 85 by 55 mm; the US and Canada use 3.5 by 2 inches, which is 89 by 51 mm. Either way, a QR code competes for space with a name, a logo and a phone number, and the temptation is to shrink it.

A card is scanned from around 20–30 cm — someone holding it in one hand and a phone in the other. The rule of thumb of one tenth of the scanning distance gives a minimum of 2 cm; **2.5 cm is comfortable**, and it fits on a card without dominating it. Below 1.5 cm you are relying on good lighting and a recent phone. [The size guide](/blog/qr-code-size-guide) has the reasoning.

Two things make a small code more reliable:

**Keep the data short.** A dynamic code encoding `qrly.lol/yourname` is a version 2 or 3 code with a 25 or 29 module grid, which at 2.5 cm gives modules of nearly a millimetre. A long URL — a LinkedIn profile address with tracking parameters, say — pushes the code to version 5 or 6 and the modules to half that. This is the single biggest lever on a card. QRly lets you choose the ending of the short link, so the encoded text can be as short as the domain plus a handful of characters.

**Leave the quiet zone.** The blank margin around the code must be at least four modules on every side, and it must be *blank* — no border, no logo, no text. On a 2.5 cm code that is roughly 3 mm of white. Designers crop it because it looks like wasted space. It is not. [The quiet zone post](/blog/qr-code-quiet-zone) has the details, including what happens on coloured cards.

## Which side, and where on it

Put the code on the **back**, unless the back is blank anyway. The front carries the name and the logo and is what a person looks at when they take the card; the back is what they turn to when they have decided to do something with it. A code on the back, centred or in one corner with a three-word instruction ("Scan for contact" or "Book a call"), is the layout that gets scanned.

Avoid:

- **Spot varnish, foil or embossing over the code.** Gloss reflects the phone's flash and creates highlights the camera reads as light modules. Matte stock is friendlier to codes.
- **Dark cards with a dark code.** A code needs dark modules on a light background. On a black card, put the code inside a white panel with the quiet zone inside the panel — do not invert it. [Inverted QR codes](/blog/inverted-qr-code-white-on-black) explains why that fails on some phones.
- **Rounded card corners cutting into the quiet zone.** Keep the code at least 5 mm from any edge.

A small logo in the centre of the code is fine — QRly's studio caps the logo size to what the chosen error-correction level can absorb and warns when the design stops scanning — but on a card, the logo is usually already elsewhere and the code is better plain. [QR code with logo](/blog/qr-code-with-logo) covers when it is worth it.

## Export and test

Send the printer an **SVG**. Card printing is high resolution, and a screen-sized raster placed at 2.5 cm goes soft at the module edges; a vector scales exactly. If the design tool refuses SVG, use PNG at 2048 pixels and place it at 2.5 cm without resampling.

Then order a proof, or print one card at real size, and scan it with two phones from 25 cm. It is the cheapest QR test you will run and the most expensive to skip: 500 cards with a code that does not scan is 500 conversations that end at "it doesn't work".

## Frequently asked

**Should a business card QR code open a page or save a contact?**
A page, if you want to change it later or know whether it was scanned. A vCard, if the details will never change and offline saving matters more. A dynamic URL code that opens a page with a "save contact" button gives you most of both.

**Does QRly make vCard QR codes?**
No. QRly makes URL short links and the codes that encode them. For a vCard code, use a static generator or your phone's own contact-sharing feature; the vCard post explains the format.

**How big should a QR code be on a business card?**
At least 2 cm, ideally 2.5 cm, with a blank border of four modules on each side. Keep the encoded link short so the modules stay large.

**Which side of the business card should the QR code go on?**
The back, with a short line saying what it does. The front is for the name and logo; the back is where someone looks when they want to act on the card.

**Can I change where the QR code goes after the cards are printed?**
Only with a dynamic code. Edit the destination in the dashboard and every card already handed out follows within a minute. A static or vCard code cannot be changed once printed.
