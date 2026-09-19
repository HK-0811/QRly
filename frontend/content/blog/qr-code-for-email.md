---
title: QR code for email: mailto links, pre-filled subjects, and a better option
description: A mailto: QR code opens the phone's mail app with your address filled in. Here is the exact syntax, where it breaks, and when a link to a contact page works better.
date: 2026-09-19
category: use-cases
keywords: qr code for email, email qr code generator, mailto qr code, qr code to send email, qr code email address, qr code with subject line, contact qr code
---

An email QR code is one of the simplest codes there is, and one of the least understood. Scan it and the phone opens its mail app with a new message already addressed to you, optionally with a subject and body filled in. No typing, no misspelt address. That much works well. What people do not expect is what it costs them: a payload that can never be changed, no idea whether anyone scanned it, and a printed email address that harvesters can read as easily as customers.

This article covers how the format works, how to make one, and the alternative that fixes the parts that go wrong.

## What an email QR code contains

A QR code is just text. For email, the text is a `mailto:` URL, the same thing a "contact us" link on a web page uses.

The simplest form is the address alone:

```
mailto:hello@example.com
```

Add a subject and body with URL query syntax. Spaces and most punctuation must be percent-encoded, so a space becomes `%20` and a line break becomes `%0A`:

```
mailto:hello@example.com?subject=Quote%20request&body=Hi%2C%20I%20saw%20your%20flyer%20at
```

The recognised fields are `subject`, `body`, `cc` and `bcc`. Separate them with `&`. The first field after the address is introduced by `?`.

| You want | Payload |
|---|---|
| Address only | `mailto:hello@example.com` |
| Address and subject | `mailto:hello@example.com?subject=Booking` |
| Subject and body | `mailto:hello@example.com?subject=Booking&body=Name%3A%0ADate%3A` |
| Two recipients | `mailto:hello@example.com,sales@example.com` |
| Copy someone in | `mailto:hello@example.com?cc=boss@example.com` |

There is also an older format called `MATMSG:` (from the Japanese phone standard that QR codes grew up in) which some generators still produce. Modern phone cameras understand both, but `mailto:` is the one every browser and mail client agrees on, so use it.

Keep the body short. Every character adds modules to the code, and a pre-filled paragraph produces a dense, high-version code that scans badly from print. A subject line and a couple of prompt words are plenty; the reader is about to type anyway.

## How to make one

A `mailto:` code is a **static** code: the text above is encoded directly into the pattern, and nothing sits between the scanner and the mail app. Any static QR generator or QR library will encode it, because they will encode any text you give them. Type the payload exactly, including the `mailto:` prefix, and check the result by pointing a phone at the screen: the camera should offer to open Mail, not a browser.

QRly does not make this kind of code. Every QRly code is a URL short link that redirects to a web address, which is a different tool for a different job. If you want a code that opens a mail app directly, use a static generator; the [guides for iPhone](/blog/how-to-make-a-qr-code-on-iphone) and [Android](/blog/how-to-make-a-qr-code-on-android) cover the built-in options.

## Where mailto codes break

The format is fine. The context it gets used in is where the trouble starts.

**No mail app.** A phone with no configured mail client (common on shared devices, work phones with webmail only, and many people's second phone) opens nothing, or opens an app-store prompt. The scanner sees a failure and blames your poster.

**It is on the wrong device.** The person scanning is holding a phone, but the reply they want to write is often from a laptop, with attachments, later. A `mailto:` code forces the phone.

**The address is permanent.** If the person leaves, the mailbox is retired or the department is renamed, every printed code is wrong. There is no redirect to update, because there is no redirect. The [static versus dynamic](/blog/static-vs-dynamic-qr-codes) distinction is the whole story here.

**The address is public.** Decoding a QR code takes a camera, and harvesting bots have cameras too. Printing `mailto:you@example.com` on a poster is the same as printing the address in text, with the same spam consequences.

**You learn nothing.** Nothing sees the scan. You cannot tell whether the code on the trade-show banner produced ten emails or none, or whether anyone scanned it at all.

## The better option: link to a contact page

For most uses, put a **web page** behind the code instead of a mail address. A contact page can hold a form, a `mailto:` button for people who prefer their mail app, a phone number, hours, and a map. It works on every device, and it can be changed whenever you like.

Made as a dynamic code, it also fixes the permanence problem. On QRly, you paste the contact page URL, get a short link and a code, and the code encodes the short link, not the page. Move the contact page, change the recipient, replace the form with a booking tool: [edit the destination](/blog/editable-qr-code) from the dashboard and every printed code follows within a minute. The scan is counted at the redirect, so you see how many people scanned each placement, from where, on what device, without any cookie or script on their phone.

Two details make this work well:

- **Pre-fill from the URL, not the code.** If you want the subject line to say where the enquiry came from, put it on the destination: `example.com/contact?source=flyer`, and have the page pre-fill the form or the `mailto:` button. A different code per flyer lets the same page distinguish them, and [UTM parameters](/blog/qr-code-utm-parameters-google-analytics) do the same for your web analytics.
- **Give the page a fallback.** Someone who scans and does not want a form can still tap an email link on the page. You have lost nothing from the direct `mailto:` approach and gained a page you control.

A dynamic code needs a working redirect service for as long as the print is in circulation, which is the honest caveat. QRly's runs on free infrastructure, the [cost page](/cost) shows what it costs to keep up, and the source is [open](https://github.com/HK-0811/QRly); if it ever mattered, a custom domain would let you take the hostname with you.

## When a plain mailto code is still right

Some cases genuinely suit the direct approach:

- **Internal use.** A code on a meeting-room door that opens an email to facilities, or on a noticeboard for reporting a fault. Everyone has the mail app, the address is not secret, and nobody needs analytics.
- **Very short lifetimes.** A one-day event feedback address on a screen.
- **Where a web page is overkill.** A [business card](/blog/qr-code-for-business-card) for someone who simply wants to be emailed, though a [vCard contact code](/blog/qr-code-for-vcard-contact) saves the whole card, not just the address, and is usually the better static choice.

For anything printed in quantity, aimed at the public, or expected to last more than a season, link to a page.

## Frequently asked

**How do I make a QR code that sends an email?**
Encode a `mailto:` URL with any static QR generator: `mailto:you@example.com?subject=Hello`. Percent-encode spaces as `%20`. QRly does not generate this format; it makes dynamic URL codes, which suit a contact page better than a raw address.

**Can I pre-fill the subject and body?**
Yes, with `?subject=` and `&body=` on the `mailto:` URL. Keep both short: long bodies make dense codes that scan poorly from print, and the reader will edit them anyway.

**Can I change the email address after the code is printed?**
Not on a `mailto:` code; the address is the code. If the address might change, print a dynamic code that links to a contact page, and change the page or the destination later.

**Does an email QR code work on every phone?**
It works on any phone with a configured mail app. Phones without one open nothing useful. A web page fallback avoids the problem entirely.

**Can I see how many people scanned an email QR code?**
Not a `mailto:` one; nothing sits between the scan and the mail app. A dynamic code pointing at a contact page records each scan at the redirect, which is the only way to count them.
