---
title: Quishing: how QR code phishing works, and how to spot a fake QR code
description: Quishing is phishing delivered through a QR code. The attack patterns, the tells that give a fake code away, and what organisations and platforms can do about it.
date: 2026-09-19
category: privacy
keywords: quishing, qr code phishing, qr code scam, fake qr code, qr code phishing attack, qr code scam parking, phishing qr code email, how to spot a fake qr code
---

Phishing is the trick of getting someone to hand over credentials or money by pretending to be an organisation they trust. Quishing is the same trick with a QR code as the delivery mechanism. The word is ugly, but the idea is simple, and it works for one reason: a printed code carries no readable address, so the habit of looking at the link before you click has nothing to look at.

Nothing about the QR format is broken. The code is doing what it was designed to do, which is to carry text to a camera. [Are QR codes safe](/blog/are-qr-codes-safe) covers why the code itself is harmless. This post is about the attack that uses it and the practical defences.

## Why a QR code makes a good phishing vehicle

An email link can be hovered over. A text-message link is at least visible as text. A QR code is opaque until it is scanned, and it is scanned with a phone, where the address bar is small. The attacker gets three advantages from that:

1. **The address is hidden until the last moment.** The scanner sees a preview banner with a domain on it, but only if they look.
2. **The code borrows trust from where it is placed.** A sticker on a parking meter looks like the council's. A code on a fake invoice looks like the supplier's.
3. **The scan happens on a phone.** Mobile browsers show less of the URL, and people are more used to typing card details into a phone than into a work laptop with a security team behind it.

There is a fourth advantage in the email variant. Corporate mail filters inspect links in the text of a message. A QR code embedded as an image is not a link as far as the filter is concerned, so a message that would be blocked with a URL in it sails through with the same URL encoded as a picture. The recipient then scans it with a personal phone, outside the corporate network entirely.

## The patterns you will actually meet

The attacks cluster into a handful of shapes. Recognising the shape is most of the defence.

**Stickers in public places.** Parking meters and pay-and-display machines are the classic, because the expected action is to pay with a card. A code is stuck over the real one, or added to a machine that never had one, and the page it opens copies the operator's branding. Restaurant tables, bike hire stands, charity collection tins and electric-vehicle chargers have all been used the same way.

**Fake invoices and letters.** A printed letter that looks like a utility bill, a tax notice or a supplier invoice, with a code to "pay now" or "verify your account". Paper is cheap to make convincing. The code goes to a page that takes a payment or a login.

**Email attachments and images.** A message about an expiring password, a shared document, a multi-factor reset or an undelivered parcel, with the code inline or in an attached PDF. The text tells you to scan with your phone. That instruction is itself a tell: no legitimate IT department wants you to leave the managed laptop to log in on your personal phone.

**Fake app installs.** A code that claims to install the official app but leads to a download outside the app store, or to a store listing for an impostor with a similar name and icon.

**Code swaps on legitimate material.** A flyer or a menu reprinted with the real design and a different code, left where the real ones were.

## How to recognise a fake code

The most reliable check is also the simplest: **does the previewed domain match the organisation that appears to have printed the code?** Both iOS and Android show the domain before opening; [check where a QR code goes before scanning](/blog/check-where-a-qr-code-goes-before-scanning) shows where to look. A parking operator's code goes to the parking operator. A bank's letter goes to the bank. If the preview shows an unfamiliar domain, a random-looking short link, or a domain that is almost but not quite the real one, stop.

Beyond that, the tells are physical and contextual:

| Signal | What it suggests |
|---|---|
| A sticker over a printed code, or a code that does not align with the design around it | Placed after the fact by someone other than the owner |
| A code on a surface that never needed one (a lamp post, a wall, a bench) | Nobody legitimate put it there |
| The page asks for more than the task needs: a login for a parking payment, a card number to "confirm" a delivery | The task is a pretext |
| Urgency: pay in 10 minutes, account will be locked, final notice | Phishing's oldest tool |
| An email that says "scan with your mobile device" | Trying to move you off a monitored device |
| A domain with a typo, an extra word, or a different top-level domain from the real one | Lookalike registration |

A useful habit: for anything involving money or a login, do not use the code at all. Open the app you already have, or type the address you already know.

## What an organisation printing codes can do

If you put codes on your material, you have a stake in this: the first thing a successful attack on your customers costs you is their trust in your codes.

**Put your own domain in the code.** A code that previews as `qr.yourbrand.com` is one staff and customers can learn to recognise; a code that previews as a generic short domain teaches them nothing, and cannot be told apart from a fake on the same service. On QRly this is a [custom domain](/blog/custom-domain-qr-code): one CNAME record, a certificate issued automatically, and every code carries your hostname. The steps are in [how to set up a custom domain for QR codes](/blog/how-to-set-up-a-custom-domain-for-qr-codes).

**Print the code into the design, not on top of it.** A code integrated into the artwork, with the domain in plain text underneath, gives people something to compare the preview against and makes a sticker obvious.

**Tell people what your codes do not ask for.** "Our parking codes take you to the app; we never ask for your card on a web page" defeats most of the attack.

**Check your own codes in the field.** Scan them occasionally. If one previews somewhere it should not, you have found a sticker.

**Use dynamic codes where a compromise would need a fix.** A code printed with a direct address is wrong forever if that address is compromised. A [dynamic code](/blog/what-is-a-dynamic-qr-code) can be re-pointed in under a minute from the dashboard.

## What a platform can do

A short-link service is infrastructure that anyone can point at anything. That is the whole product, and it is also why the service is the natural place for a filter.

QRly screens every destination against Google Safe Browsing when a link is created, and a scheduled job re-checks every link weekly, because a page that was clean when the code was printed can be compromised later. A flagged link does not redirect; it resolves to a warning page, since the printed code cannot be recalled and the address has to keep saying something. If the check cannot run, the status is recorded as unchecked, never as clean. [Safe Browsing and QR codes](/blog/safe-browsing-and-qr-codes) goes into the mechanics.

Separately, the service refuses destinations that are never legitimate for a public code: `javascript:` and `data:` schemes, URLs with embedded usernames (the `paypal.com@attacker.example` trick), and private or local network addresses in every spelling a browser accepts. None of that stops a well-made phishing page on a fresh domain, and it would be dishonest to claim it does. Threat lists lag new domains. The platform removes the known bad and the structurally bad; the human check of the preview against the context catches the rest.

> The domain on the preview banner is the only part of a QR code you can verify. Everything else is decoration.

## Frequently asked

**What is quishing?**
Phishing delivered by QR code. The code points at a page that impersonates a bank, a parking operator, a courier or an employer's login, and the page collects credentials or payment details. The code is ordinary; the destination is the attack.

**How do I know if a QR code is a scam?**
Compare the domain your phone previews with who appears to have printed the code. Look at whether the code is a sticker placed over something. Ask whether the page wants more than the task justifies. Any one of those failing is enough to walk away.

**Why do phishing emails use QR codes instead of links?**
Because mail filters inspect links in text but usually not the content of images, and because scanning moves the victim from a managed laptop to a personal phone. An email that asks you to scan a code with your phone to log in to a work system is almost never legitimate.

**Can a QR code scam work without me entering anything?**
Rarely. On an updated phone with app-store-only installs, opening a page does very little on its own. The attack needs you to type or install something. [QR code malware myths](/blog/qr-code-malware-myths) covers what a page can and cannot do by itself.

**Does using a QR code platform protect my customers from fake codes?**
It protects them from your codes being pointed at known-bad pages, and from a compromised destination staying live. It does not stop someone sticking a different code over yours. A custom domain, a printed URL under the code, and the occasional field check handle that.
