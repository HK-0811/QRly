---
title: QR codes in print ads: magazines, newspapers and billboards that scan
description: How to size a QR code for a magazine page, a newspaper ad or a billboard, why each insertion gets its own code, and what the scan data can tell you about the print buy.
date: 2026-09-19
category: business
keywords: qr code in print ads, magazine qr code, billboard qr code, newspaper ad qr code, qr code print advertising, qr code outdoor advertising, print ad tracking qr code
---

Print advertising has always had one weakness: you pay for the space and then guess at the response. A QR code in the ad does not fix that entirely, but it turns a guess into a count, and it makes the ad do something the moment it is seen rather than hoping the reader remembers a URL until they are at a keyboard.

The code has to be readable in the medium it is printed in, though, and magazines, newspapers and billboards are three very different media. Most failed print codes fail on size, not design.

## Size for the medium

The rule that covers all three: a QR code needs to be about **one tenth of the distance it will be scanned from**. A phone camera can decode a 2 cm code from 20 cm away, a 20 cm code from 2 m, and so on. The [size guide](/blog/qr-code-size-guide) has the derivation; the medium determines the distance.

| Medium | Typical scanning distance | Minimum code size | Notes |
|---|---|---|---|
| Magazine page | 25–35 cm | 2 cm; 2.5 cm is safer | Glossy stock prints cleanly; ink is not the problem |
| Newspaper | 30–40 cm | 3 cm or larger | Newsprint spreads ink; modules blur at small sizes |
| Bus shelter, station poster | 1–3 m | 15–30 cm | People are standing still, which is the whole point |
| Roadside billboard | 20–50 m | 2–5 m | Almost never worth it; see below |

**Magazines** are the easy case. Good paper, good ink, a reader holding the page at reading distance. A 2.5 cm code with a proper quiet zone works reliably. The temptation is to shrink it into a corner; resist that below 2 cm.

**Newspapers** need more care. Newsprint is absorbent, the ink spreads (printers call it dot gain), and the halftone screen is coarse. Small modules blur into each other. Go larger than feels necessary, keep the URL inside the code short so there are fewer modules to blur, and use plain black on the unprinted paper rather than on a tinted panel. Send the printer an SVG, not a PNG, so the code is rendered at the press's resolution rather than upscaled; [SVG vs PNG](/blog/qr-code-file-formats-svg-png) explains why.

**Billboards** are where the arithmetic gets brutal. A roadside board seen from 30 m needs a code around 3 m across, and even then the scanner is in a moving car and should not be pointing a phone at anything. If the board is at a pedestrian location — a station, a bus shelter, a shopping centre — the distance drops to a couple of metres, the code drops to a poster-sized 20–30 cm, and it starts to work. Put the code where people stand, not where they drive.

## Fewer modules, bigger modules

Within a fixed printed size, the fewer modules a code has, the larger each module is, and the more tolerant of blur, distance and poor light. Module count is set by how much data the code contains and the error-correction level.

This is the practical argument for a short URL in print. A code containing `qrly.lol/ad1` is a 25-module-wide version 2 code; one containing a long campaign URL with tracking parameters might be version 6 or 7 at 41–45 modules, nearly twice as many across the same width. [Why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) has the full table. A dynamic code is short by construction; the long tracked URL lives in the destination, where its length costs nothing.

On error correction: a higher level survives more damage but adds modules. For a magazine page that nobody is going to scratch, level M is right. For a newspaper, the blur argument favours fewer, larger modules over more redundancy, so M again, not H. [Error correction explained](/blog/qr-code-error-correction-explained) covers the trade-off.

## One code per publication, per insertion

This is the rule that makes the analytics mean anything. If the same code runs in two magazines, you learn the total and nothing else. If each insertion has its own code, you learn which title, which issue and which position paid for itself.

On QRly there is no per-code cost, so the discipline is purely organisational. Make one link per insertion, named for it: `vogue-oct-p34`, `metro-tue-front`. Point them all at the same landing page if you like; the counts stay separate because the codes are separate. If you want a proper split test — two headlines, two offers — [A/B testing with QR codes](/blog/qr-code-a-b-testing) covers how to set that up so the comparison is fair.

Add UTM parameters to the destination URL so your own web analytics sees the source too. The parameters live on the destination, not in the code, so they do not make the code any larger; [UTM parameters and Google Analytics](/blog/qr-code-utm-parameters-google-analytics) has the pattern.

## Expiry

A print ad runs for a fixed period; back issues do not. Magazines sit in waiting rooms for a year. If the ad promoted an offer that ended in October, a scan in March should land somewhere sensible.

There are two ways to handle that with a dynamic code. Either set an expiry date on the link, so scans after the offer ends see an expired page, or leave the link live and change its destination to the evergreen product page when the offer closes. The second is usually better for advertising, because a late scan is still a warm lead. [QR codes with an expiry date](/blog/qr-code-with-expiration-date) covers when each makes sense.

## What the analytics tell you about the print buy

A scan on a dynamic code is recorded at the redirect. For a print ad, the useful fields are:

- **Scans per insertion.** The raw response to each placement. Divided by the circulation, it is a response rate you can put next to the rate card.
- **Scans over time.** A magazine ad produces a slow curve over weeks, with a tail from back issues. A newspaper ad produces a spike on the day and almost nothing after. If a newspaper code is still being scanned a fortnight later, the paper is being kept, which is worth knowing.
- **City and region.** Approximate, since it is IP-based and mobile networks mislocate, but at the scale of a regional print buy it is good enough to see whether a national title's readers in one region responded and another's did not. [Location tracking](/blog/qr-code-location-tracking) explains the precision honestly.
- **Hour and weekday.** A newspaper read at breakfast shows a morning peak. A magazine read at the weekend shows a Saturday one. If the peak is not where you expected, the title's readership is not who the media pack said.
- **Unique visitors.** Counted per day, from a rotating hash, so a person scanning on two days counts twice. Fine for a print campaign, where the question is how many people responded on each day.

What the scan data cannot tell you is whether the person then bought anything. That is measured on your side, on the landing page. The scan count is the numerator of the response rate; the conversion rate comes from your own analytics. [Measuring print campaign ROI](/blog/measure-print-campaign-roi-with-qr-codes) covers joining the two, and the [what you can actually know](/blog/qr-code-analytics-what-you-can-actually-know) post is the honest limit of the whole exercise.

None of this involves running anything on the reader's phone. A QRly redirect sets no cookie and serves no script; [the privacy page](/privacy) lists every field recorded.

## The production checklist

1. Make the code and download the **SVG**. Send that to the publication, not a screenshot.
2. Check the ad proof at actual size. Measure the code with a ruler.
3. Keep the **quiet zone** — four modules of clear space around the code — inside the ad's own boundary, not borrowed from the page margin, which may be trimmed or filled by a neighbouring ad. [The quiet zone](/blog/qr-code-quiet-zone) is the single most common failure in print.
4. Put a line of text next to the code saying what it opens. "Scan for the full range" outperforms a bare code.
5. Scan the printed proof, on paper, with an iPhone and an Android. Not the PDF. [Test before printing](/blog/test-a-qr-code-before-printing) has the full routine.

## Frequently asked

**How big should a QR code be in a magazine ad?**
At least 2 cm across including the quiet zone; 2.5 cm is more comfortable. Readers hold a magazine at roughly 30 cm, and one tenth of that is the safe minimum.

**Do QR codes work on billboards?**
On a roadside billboard, effectively no: the distance requires a code several metres wide and the audience is driving. On a pedestrian billboard, at a station or bus stop, a 20–30 cm code works because people are standing within a couple of metres of it.

**Should I use the same QR code in every publication?**
No. One code per insertion costs nothing on QRly and is the only way to learn which placement responded. Point them at the same page if the content is the same.

**What happens when the ad's offer ends?**
With a dynamic code, either set an expiry so late scans see an expired page, or change the destination to the evergreen page. The printed code does not need to change either way.

**Can I tell how many readers scanned versus how many scans there were?**
Roughly. QRly counts unique visitors per day using a daily-rotating hash, so repeat scans on the same day by the same phone collapse to one; across days they do not. For a print campaign that is the right granularity.
