---
title: QR code API and automation: generating codes programmatically, honestly
description: What an API-driven QR workflow looks like, which open-source libraries render codes, why static codes need no API, and where QRly stands: no public API, but open source.
date: 2026-09-19
category: advanced
keywords: qr code api, generate qr codes programmatically, qr code automation, qr code library, bulk qr code generation, qr code rest api, open source qr code library, qr code generation script
---

There are two things people mean by *QR code API*, and they are not the same problem. One is rendering: turn this string into an image, ten thousand times. The other is managing dynamic links: create a redirect, get its short URL, change it later, read its scans. The first needs a library and a loop. The second needs a service with a database, and that is where the questions about pricing and lock-in actually live.

This post separates the two, sketches a sensible automated workflow, and is plain about where QRly fits, which is not where a search for "QR code API" might hope.

## Rendering needs no API

A QR code is a deterministic function of its input. Give an encoder the string `https://example.com/x` and an error-correction level, and you get the same grid every time, on any machine, offline. There is nothing for a remote service to add, and every mainstream language has a mature open-source encoder.

| Language | Library | Notes |
|---|---|---|
| JavaScript / Node | `qrcode` | SVG, PNG, canvas, terminal; widely used |
| JavaScript (browser) | `qr-code-styling` | Module shapes, colours, embedded logo |
| Python | `segno` or `qrcode` | `segno` covers the full standard including Micro QR |
| Java / Kotlin / Android | ZXing | The reference decoder as well as an encoder |
| C | `libqrencode` | Small, old, everywhere |
| Go | `go-qrcode` | PNG output, simple API |
| Rust | `qrcode` | With `image` for raster output |

If your task is "generate a code for each of these 5,000 URLs", the whole solution is a script that reads a CSV, calls one of these, and writes a file per row. It runs on a laptop in seconds, costs nothing, and involves no rate limits, keys or terms of service. QRly's own studio renders entirely client-side with a library in this family; nothing is stored as an image.

Two things to get right in the loop. Output SVG, not PNG, for anything going to print, since it scales without loss ([SVG versus PNG](/blog/qr-code-file-formats-svg-png)). And keep the [quiet zone](/blog/qr-code-quiet-zone) in the file; a library will usually include a four-module margin by default and a well-meaning post-processing step will usually crop it.

## Dynamic links are the real API question

Rendering a code that encodes your final URL gives you a static code, and static codes cannot be edited or counted. If you want either, the code must encode a redirect link, and a redirect link is a record on a server. Creating that record is what a QR code API is for.

An API-driven workflow for dynamic codes looks like this:

1. **Create the link.** Send the destination, optionally a chosen ending and a label, and receive the short URL back. Handle the two failure cases: the ending is taken, and the destination fails a safety check.
2. **Render the code from the short URL**, locally, with a library from the table above. The service does not need to render anything; the short URL is the only thing the code contains.
3. **Store what you need.** The link's ID and short URL go into your own system, next to the product, the asset tag, the invoice or whatever the code is attached to. The image can be stored or regenerated on demand, since it is deterministic.
4. **Edit later.** Change the destination by ID when the page moves. The printed code does not change.
5. **Read the scans.** Pull counts and breakdowns by link ID into your reporting.

The principle behind that sequence is that the short URL is the durable artefact and the image is disposable. Anyone who stores images and loses track of which link each one encodes has built a system they cannot maintain. [Why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) covers the other half: the short URL never changes, so it is safe to key on.

## What to check in a vendor's API

Several commercial services publish APIs for this workflow; Bitly, QR Tiger and Uniqode among them. Their pricing models differ and change, so read the current page rather than any summary, but the questions are stable:

- **Is the API on the free tier, or a paid one?** API access is commonly the feature that moves a plan up a band.
- **What happens to links created through the API when the plan lapses?** This is the [free-trial question](/blog/free-qr-code-generator) in another form, and it is more serious at volume, because a thousand printed codes all die together.
- **Is there a per-link or per-scan cap?** A per-scan cap is a billing surprise waiting on a successful campaign.
- **Can you export the links?** If not, the short URLs are the vendor's, and so are your printed codes.
- **Can links live on your own domain?** A [custom domain](/blog/custom-domain-qr-code) is the only arrangement in which the printed hostname is yours to repoint if you ever leave.

The [pricing page](/cost) on this site puts published prices side by side with the date each was read, which is a more reliable place to compare than a post that will go stale.

## Where QRly stands

QRly has no public API documented for third parties. That is a scope decision, not an oversight. The platform is [sized for a thousand or two users on free tiers](/blog/running-a-qr-code-platform-for-free), and a public API is the fastest way to exhaust a free tier's quotas on behalf of one automated client. There is no bulk or CSV import in the dashboard, for the same reason.

What there is instead is the source, under MIT, at https://github.com/HK-0811/QRly. A team that needs programmatic link creation can run its own copy, on its own free-tier accounts, with its own quotas, and wire the dashboard's write path into whatever system it likes. The repository's quick start covers standing it up on Cloudflare Workers and Supabase; [self-hosted QR code generator](/blog/self-hosted-qr-code-generator) covers whether that is sensible for your situation, and [open source QR code generator](/blog/open-source-qr-code-generator) covers what open actually buys you.

For one code or a hundred made by hand, [the hosted service](/create) is free, needs no account, and the links do not expire. For ten thousand codes created by a script, you want a copy you control.

## Alternatives for bulk without an API

Most bulk requests are not really about automation. They are about making a lot of codes once. Three approaches that need no API:

**Static codes from a spreadsheet.** If the codes will never need editing, each row's URL becomes a code via a formula or a script. [QR codes in Google Sheets and Excel](/blog/how-to-make-a-qr-code-in-google-sheets-and-excel) covers the spreadsheet route, and a short Python script with `segno` covers everything else.

**One dynamic link, many codes.** Often the "thousand codes" are a thousand copies of the same code, one per table, poster or unit, and the real need is a single editable link. Make one, render it once, print it a thousand times. If you want to know which copy was scanned, that is [per-placement links](/blog/qr-code-a-b-testing), and a handful of links, not a thousand, is usually enough.

**Per-unit identity.** For asset tags and product units where each copy must be told apart, there are two honest routes. Static codes, one per unit, encoding your own URL with a unit parameter, rendered in a loop from the table above, with the page behind them doing the lookup; you give up editability, but the URL is yours and nothing sits in the middle. Or one dynamic link per unit, made by hand for tens and from a self-hosted copy for thousands. What does not work is appending a parameter to a single QRly short link: the redirect sends the phone to the stored destination exactly as saved, and a query string on the short URL is not forwarded. UTM parameters on it are recorded in that link's analytics, which is useful for [telling placements apart](/blog/qr-code-utm-parameters-google-analytics), but nothing else survives the hop. [Asset tags and equipment](/blog/qr-codes-for-asset-tags-and-equipment) goes through the trade-offs.

## A minimal script

For completeness, the static case in Python, which is the whole solution for most people who arrive at this page:

```python
import csv, segno

with open("links.csv") as f:
    for row in csv.DictReader(f):
        segno.make(row["url"], error="m").save(
            f'{row["id"]}.svg', scale=10, border=4
        )
```

Error correction M, a four-module border, SVG out. Use `error="h"` if a logo is going on top, and shorten the URLs first if the codes come out dense; [why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) explains why.

## Frequently asked

**Does QRly have an API?**
Not a public one. There is no documented API for third parties and no bulk import. The code is open source under MIT, so a team that needs automation can run its own copy and integrate with it directly.

**Do I need an API to generate QR codes in bulk?**
Not for static codes. An open-source library and a loop over a CSV produce thousands of codes locally in seconds. An API is only needed when each code must be a dynamic, editable link, because that requires a record on a server.

**What is the best library for generating QR codes?**
Any of the mainstream ones: `qrcode` for Node, `segno` for Python, ZXing for Java, `libqrencode` for C. They all implement the same standard and produce interchangeable output. Pick the one in your language.

**Can I automate dynamic QR codes for free?**
With a self-hosted copy of an open-source platform, yes, within the free-tier quotas of the services it runs on. Commercial APIs are generally a paid-tier feature; check the current pricing page and what happens to existing links if the plan ends.

**Should I store the QR images or regenerate them?**
Store the short URL and regenerate the image on demand. The image is a deterministic function of the URL, and the URL is the source of truth.
