---
title: Are QR codes safe? What a scan can and cannot do to your phone
description: A QR code is only text, so the code itself cannot harm a phone. The risk is the destination. How to see it before you tap, and what a redirect service should refuse.
date: 2026-09-19
category: privacy
keywords: are qr codes safe, is it safe to scan a qr code, qr code safety, qr code security, scanning qr codes risks, fake qr code sticker, safe qr code scanning
---

The short answer is that scanning a QR code is exactly as safe as tapping a link someone handed you on a piece of paper. Not more, not less. The code is not the dangerous part and never has been. The place it sends you might be.

That distinction matters because most of the advice on this subject treats the code as if it were an executable. It is not. Once you know what a code actually contains, the sensible precautions get a lot shorter.

## What a QR code actually contains

A QR code is a way of printing text so a camera can read it. That is the whole specification. The largest version, 40, holds just under three kilobytes, and the codes you meet in the wild hold a few dozen characters: a web address, a Wi-Fi password, a phone number. [What is a QR code](/blog/what-is-a-qr-code) goes through the structure.

The phone's camera decodes the pattern into a string and then decides what to offer. If it looks like a URL, the phone offers to open it. If it looks like a phone number, it offers to dial. Nothing happens without that offer being accepted, which is why modern camera apps show a preview before doing anything at all.

There is no mechanism by which the pattern of squares can run code, install anything, change a setting, or read your data. A code cannot "contain a virus" any more than a printed sentence can; [QR code malware myths](/blog/qr-code-malware-myths) takes that apart in detail.

## Where the risk actually is

So the code is inert, and the risk lives entirely in the destination. A QR code can point at:

- a phishing page dressed up as a bank, a parcel courier or a parking app, which is the common case and has its own name, [quishing](/blog/qr-code-phishing-quishing);
- a page that offers a download, hoping you will install something outside the app store;
- a payment link that goes to the wrong account;
- a perfectly ordinary page that just is not the one the poster promised.

Every one of these would be equally dangerous as a link in an email. The only reason QR codes are a better delivery mechanism for them is that a printed code carries no visible address, and it borrows trust from its surroundings: a sticker on a parking meter looks like the council put it there.

That is the vulnerability, and it is a human one. The fix is to look at the address before you tap, and to distrust a mismatch between the address and the printed context.

## How your phone shows you the destination

Both major platforms decode the code first and open it second, with a visible step in between.

On an **iPhone**, pointing the Camera app at a code brings up a yellow banner. For a web link it shows the domain of the address, such as `qrly.lol` or `example.com`, and only opens it when you tap the banner. If you tap and hold instead, you get the full URL and options to copy it.

On **Android**, the camera app or Google Lens draws a chip over the code with the URL or the domain in it. Tap the chip to open, or long-press to copy the text. The exact appearance depends on the manufacturer's camera app, but every recent one has the step.

If your phone opens links immediately with no preview, that is a setting worth changing, and [how to scan a QR code](/blog/how-to-scan-a-qr-code) covers the camera settings on both platforms. For a detailed walk through of reading the destination, including from a screenshot and through a short-link expander, see [check where a QR code goes before scanning](/blog/check-where-a-qr-code-goes-before-scanning).

## The sticker problem

The most common real-world attack is not technically clever. Somebody prints a code on a sticker and puts it over a legitimate one. Parking meters, pay-and-display machines, restaurant tables, charity collection points and bus shelters have all had this done to them, because those are places where people expect to scan and pay without thinking.

Three checks cost a few seconds:

1. **Is it a sticker on top of something?** Raised edges, a slightly different shade of white, a code that does not quite align with the printed design around it. A council or a restaurant prints its codes into the sign; it does not add them afterwards.
2. **Does the previewed domain match the context?** A parking code should go to the parking operator's domain or the app you already use. A menu code should go to the restaurant or a menu platform. A code that previews as an unfamiliar short domain, on a surface where money changes hands, deserves a second look.
3. **Is the page asking for more than the task needs?** Paying for parking needs a card. It does not need your date of birth or your online banking login.

None of this requires understanding the technology. It is the instinct you would apply to a stranger asking for your card details at a car park.

## What a reputable redirect service does

Many codes do not contain the final address at all. They contain a short link on a service's domain, and that service redirects the scan to the real page. This is what makes a code editable after printing, and [static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes) explains the trade-off. It also means the service is an open redirect by definition: anyone can point one of its short links anywhere.

A redirect service that takes this seriously does a few specific things, and you can ask any provider whether it does them.

| What a redirect service should do | Why it matters |
|---|---|
| Screen every destination against a threat list when the link is made | Stops known phishing and malware pages from ever getting a short link |
| Re-check destinations on a schedule | A page that was clean on day one can be compromised on day ninety |
| Serve a warning page for a flagged link, not a silent redirect | The printed code cannot be recalled, so the address has to keep saying something useful |
| Refuse private and local network addresses | A code pointing at `192.168.1.1/admin` is an attack on whoever scans it on that network |
| Refuse `javascript:` and `data:` schemes | Those are not places; they are instructions to the browser |
| Report "unchecked" honestly when a check could not run | A false "clean" is worse than no verdict |

QRly does all of these. Destinations are checked against Google Safe Browsing when a link is created and re-checked weekly; a flagged link resolves to a warning page rather than to the destination; private, loopback and link-local addresses are refused in every spelling, including the decimal and hexadecimal forms of an IPv4 address that browsers quietly accept. If the Safe Browsing key is not configured, the link's status is reported as unchecked rather than clean. [Safe Browsing and QR codes](/blog/safe-browsing-and-qr-codes) describes how the screening works, and the code is [open](https://github.com/HK-0811/QRly) so the claims can be read rather than taken on trust.

## What a scan does not do

It is worth being equally clear about the things a scan cannot do, because fear of them makes people ignore the real risk.

A scan does not reveal your identity to whoever made the code. A dynamic code's redirect sees an ordinary HTTP request, the same one every website sees: an IP address, a browser string, a language preference. What can and cannot be derived from that is the subject of [do QR codes track you](/blog/do-qr-codes-track-you). A static code is seen by nobody but the destination.

A scan does not give the code's owner access to your camera roll, your contacts or your location. The camera app decodes an image and hands a string to the browser. That is the extent of the exchange.

> The code is paper. The link is the thing. Read the link.

## Frequently asked

**Is it safe to scan a QR code from an unknown source?**
Scanning is safe; the camera only decodes text and shows it to you. Opening the result is the decision that matters. Read the previewed domain, and if it does not fit the context the code was printed in, do not tap.

**Can a QR code hack my phone just by scanning it?**
No. The code contains text, and decoding text does not execute anything. The realistic risks all come after you open the link: a convincing phishing form, or a page pushing a download. A phone with current updates and app-store-only installs is well protected against the second.

**How do I know if a QR code is fake?**
Check whether it is a sticker placed over an original, and check whether the previewed domain matches the organisation that appears to have printed it. A mismatch between the two is the clearest signal there is.

**Are dynamic QR codes less safe than static ones?**
Not inherently. A dynamic code adds a redirect service between you and the page, so its safety depends on whether that service screens destinations and refuses dangerous ones. A service that does, and says how, is a safer intermediary than no intermediary at all, because it catches known bad pages that a static code would send you to directly.

**What should I do if I scanned a suspicious code?**
If you only opened the page, close it. If you entered credentials, change them and enable two-factor authentication on that account. If you installed something outside the app store, uninstall it and run the platform's security check. If money was involved, contact your bank.
