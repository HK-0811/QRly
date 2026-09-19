---
title: vCard QR codes for contact details, and when a contact page is better
description: What a vCard QR code contains, why it is static, large and untrackable, and the alternative of a contact page or hosted .vcf behind a dynamic link that can change later.
date: 2026-09-19
category: use-cases
keywords: vcard qr code, contact qr code, qr code for contact details, qr code save contact, vcf qr code, add contact qr code, business card contact qr code
---

Scan a code, tap "Add contact", and the name, number, email and company land in the phone's address book. That is the vCard QR code, and it is one of the oldest and most genuinely useful things a QR code does. It is also static in the strictest sense, it makes a large dense code, and it tells you nothing about who scanned it.

QRly does not generate vCard codes. Every QRly code is a URL short link. This post explains what a vCard code is, how to make one with something else, and when a contact page behind a dynamic link is the better tool. Both are legitimate choices; they suit different situations.

## What a vCard QR code contains

The code encodes a block of text in the vCard format (RFC 6350; most generators still use version 3.0 because phones parse it most reliably):

```
BEGIN:VCARD
VERSION:3.0
N:Kotkar;Himanshu;;;
FN:Himanshu Kotkar
ORG:Example Ltd
TITLE:Founder
TEL;TYPE=CELL:+44 7700 900123
TEL;TYPE=WORK:+44 20 7946 0123
EMAIL:himanshu@example.com
URL:https://example.com
ADR;TYPE=WORK:;;12 High Street;Leeds;;LS1 1AA;United Kingdom
END:VCARD
```

The phone's camera recognises `BEGIN:VCARD`, parses the fields and offers to create a contact. No internet connection is involved; the data is in the code. There is a shorter cousin, MECARD (`MECARD:N:Kotkar,Himanshu;TEL:+447700900123;EMAIL:...;;`), which packs the same idea into fewer characters and is well supported on Android, less consistently on iPhone.

## The four properties that follow from that

**It is static.** The details are printed. When the phone number changes, the job title changes or you leave the company, every card carrying the code is wrong, and the only fix is a reprint. There is no destination to edit because there is no destination. The [static versus dynamic post](/blog/static-vs-dynamic-qr-codes) is the general version of this point.

**It is phone-native.** No page, no redirect, no server. It works in a basement with no signal, it works if every website in the world is down, and it depends on nobody. That is a real advantage, and the one reason to choose it.

**It is large.** The vCard above is roughly 300 characters. At medium error correction that is a version 11 to 13 QR code: 61 to 69 modules a side, against 25 for a short URL. On a business card the modules become very small, which is why vCard codes on cards are so often the ones that do not scan until the phone is held perfectly still. The [versions and capacity post](/blog/qr-code-versions-and-capacity) has the table; the practical consequence is that a vCard code needs 3 cm or more on a card, error correction no higher than M, and no logo.

**It is not trackable.** Nothing sees the scan. You will never know whether the code on the back of two hundred cards was scanned two hundred times or twice.

## How to make one

Since QRly cannot, here is what can:

- **Any static generator with a "vCard" or "contact" type.** Most of the well-known ones offer it, including QR Code Monkey and qr-code-generator.com, and generate the text block from a form. Check that the download is the code image only and that nothing is watermarked; the [watermark post](/blog/qr-code-generator-without-watermark) has the checks.
- **A QR library** in any language, fed the text block above. This is the most controllable route, and the output is yours.
- **Some contact apps** can display a QR code for a contact directly on screen, for a one-off in-person exchange. That is for showing, not printing.

Whichever you use, keep the vCard short. Drop the postal address unless people will actually post you things; drop the second phone number; use the short website. Every field removed makes the code smaller and the modules bigger. Then print it, and [test it from the print](/blog/test-a-qr-code-before-printing) on an iPhone and an Android.

## The alternative: a contact page behind a dynamic link

The other way to put your details behind a QR code is to put them on a **page**, and put the page behind a [dynamic short link](/blog/what-is-a-dynamic-qr-code). The code encodes `qrly.lol/your-name`, which redirects to the page. The page shows your name, a tap-to-call number, a tap-to-email address, a link to your site or [LinkedIn profile](/blog/qr-code-for-linkedin-profile), and a **Save contact** button that downloads a `.vcf` file, which is the same vCard text served as a file with the `text/vcard` content type. iPhones open a `.vcf` in Safari as a contact preview with "Create New Contact"; Android behaviour varies by browser and usually goes through a download and an "open with Contacts" prompt.

You can also skip the page and point the short link **straight at a hosted .vcf file**. That gets the scanner to "Add contact" in one step, like a native vCard code, but through a URL. The file has to be served directly by the host, not shown in a preview page first; the hosting advice in [QR code for a PDF](/blog/qr-code-for-pdf) applies exactly.

What this gives you, against the native vCard:

- **Editable.** New number, new title, new employer: edit the `.vcf` file or the page, and if the URL changed, [repoint the link](/blog/how-to-change-a-qr-code-link-after-printing) from the dashboard. Cards already handed out update themselves.
- **Small.** The code is a version 2 short link, 25 modules a side. It fits in 1.5 cm on a card with room for a [logo in the middle](/blog/qr-code-with-logo), and scans at arm's length without ceremony.
- **Counted.** Every scan is recorded at the redirect: country, city, device, time, with no cookie and no script on the phone. You find out that the cards from the conference in March were scanned mostly in the following week, and by nobody after that.
- **More than a contact.** The page can carry a booking link, a portfolio, whatever the card cannot.

What it costs you: the scanner needs a data connection, and "Save contact" is one tap further away than on a native vCard code. The link also depends on the redirect service existing; QRly's runs at [no cost](/cost) on free infrastructure and the code is [open source](https://github.com/HK-0811/QRly), and a [custom domain](/blog/custom-domain-qr-code) puts your own hostname in the code so that the dependency is on you rather than on anyone else.

## Which to choose

| Situation | Choose | Why |
|---|---|---|
| A name badge or table card for one event, scanned in the room | vCard (static) | No signal needed, no page to build, one event's worth of shelf life. |
| Business cards you will hand out for a year or more | Contact page or hosted .vcf behind a dynamic link | Titles and numbers change; a reprint costs more than a page. |
| You want to know whether the cards get scanned at all | Dynamic link | A static code cannot be counted. |
| The code has to be small, or carry a logo | Dynamic link | 25 modules against 60-odd. |
| You want the contact saved in one tap and nothing else | vCard, or a link straight to a .vcf | Both land on "Add contact"; the link version stays editable. |
| A resume or CV | Dynamic link to a page | The page can hold the portfolio too; see the [resume post](/blog/qr-code-on-a-resume). |

If the card is for a role you expect to hold for years, with a number you will keep, the native vCard is fine and pleasantly self-contained. If anything about the card is likely to change before the box of cards runs out, put a page behind a link. The [business card post](/blog/qr-code-for-business-card) goes further into the card itself.

## One more thing on the card

Whichever route you take, print the phone number and email as text on the card as well. Some people do not scan things, some phones are old, and a card whose only contact detail is a QR code has failed at the one job a card has. The code is the convenient route, not the only one; the same applies to a [phone number code](/blog/qr-code-for-phone-number-and-sms) or an [email code](/blog/qr-code-for-email), which are the other static formats people ask for.

## Frequently asked

**Does QRly make vCard QR codes?**
No. Every QRly code is a URL short link, and a vCard is not a URL. Use any static generator with a contact type for a native vCard code, or point a QRly link at a contact page or a hosted .vcf file for an editable one.

**Why is my vCard QR code so hard to scan?**
Because it encodes 200 to 400 characters, which makes a dense code with very small modules at business-card size. Cut fields, print it larger, keep error correction at M or lower, and drop the logo. Or put the details on a page and encode a short link instead.

**Can a vCard QR code be edited after printing?**
No. The details are in the code. A code that points at a hosted .vcf or a contact page can be edited, because the code holds only the link.

**Does a contact page work without internet?**
No, and a native vCard code does. For a code that will be scanned somewhere with no signal, a trade hall basement or a rural site, the native vCard is the right choice.

**Can I see who scanned my contact code?**
Not who. With a dynamic link you can see how many scans, when, from roughly where and on what kind of device, with no cookie and no identity. With a native vCard code, nothing at all is recorded.
