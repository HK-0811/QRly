---
title: QR code A/B testing: how to compare two QR code designs or placements
description: Two dynamic codes, one destination, one difference between them: a fair test of a design, position or call to action. How to set it up and how many scans it needs.
date: 2026-09-19
category: analytics
keywords: qr code a/b testing, test two qr codes, compare qr code designs, qr code split test, qr code call to action test, which qr code design scans more, qr code experiment
---

Does a round-module code with a logo get scanned more than a plain black one? Does "Scan for the menu" beat "Scan me"? Is the code better at the top of the poster or the bottom? These are all testable, cheaply, with two dynamic codes. What is harder is running the test in a way that tells you something, because print does not split traffic the way a website does.

This is the method, the mistakes, and an honest account of how many scans it takes.

## The setup: two codes, same destination

A dynamic QR code is a short link with a counter. Two codes are two short links with two counters. Point both at the same destination and the person scanning has an identical experience whichever one they scan; the only thing that differs is the count.

On [QRly](/) that is two pastes of the same URL with two slugs, say `qrly.lol/menu-a` and `qrly.lol/menu-b`. Make one thing different between the two printed versions, keep everything else the same, print, and read the two counts.

The candidates for that one thing:

| Variable | Version A | Version B |
|---|---|---|
| Design | Plain black squares | [Round modules with a logo](/blog/qr-code-with-logo) |
| Colour | Black on white | Brand colour on white |
| Size | 25 mm | 40 mm |
| Call to action | "Scan me" | "Scan for 10% off" |
| Position | Top right of the poster | Bottom centre, next to the offer |
| Framing | Bare code | Code in a labelled frame with an arrow |
| Placement | Shop window | Shop counter |

A test changes one row. Two rows changed at once gives you a winner and no idea why.

The destination should be genuinely the same page. To tell the two apart in your site analytics as well, give the two destinations different `utm_content` values and nothing else — [UTM parameters for QR codes](/blog/qr-code-utm-parameters-google-analytics) has the scheme.

## How print splits traffic, and how it does not

A website A/B test shows each visitor one version at random. Every visitor is a coin flip, the two groups are the same kind of people, and any difference in the outcome is down to the version.

Print cannot do this. A poster is one version, and everyone who walks past sees that version. To compare two, you have to put them in different places or at different times, and then the places or the times are a second variable you did not mean to test.

The ways to keep that second variable small:

**Alternate within a run.** For flyers, table cards, stickers or anything distributed in quantity, print half with A and half with B and interleave them — deal them out alternately, not the first thousand A and the second thousand B. Every recipient is then close to a coin flip, and this is the nearest print gets to a proper split test.

**Pair placements.** For posters, put A and B in positions you believe are equivalent — two identical shelters on the same route, two doors of the same shop — and then swap them after a week. If A still wins after the swap, it is the design. If the position wins both times, it was the position.

**Alternate in time.** For a single fixture, run A for two weeks and B for two weeks. This is the weakest design, because the two fortnights differ in weather, holidays and whatever else happened, but it is sometimes the only option. Run it longer than feels necessary.

What does not work is splitting a single print run by geography and calling it a design test. North side A, south side B measures north against south, with the design as a footnote. [Measuring print campaigns](/blog/measure-print-campaign-roi-with-qr-codes) uses that split to compare areas — a fine test of distribution, a bad test of design.

## How many scans it takes

Here is the uncomfortable part. Scan counts are small, and small counts are noisy.

Suppose version A gets 30 scans and version B gets 40 in the same period. B looks a third better. But run the same two posters again with nothing changed and the counts could easily come out as 38 and 33. Random variation in a count is roughly its square root — around six either way at these sizes — so a difference of ten is within what chance produces on its own.

A rough guide, for two versions with equal exposure:

| Scans per version | A difference is probably real if it is at least |
|---|---|
| 25 | about 40% |
| 100 | about 20% |
| 400 | about 10% |
| 1,600 | about 5% |

These are not exact; they are the order of magnitude you need before believing a result. The practical reading is that a design tweak worth a few percent is not measurable with a poster. A call to action or a position that doubles the scan rate is measurable with a few dozen scans per side. Test big differences, or accept that you are guessing with numbers attached.

Two things help. Run the test longer — counts grow, the threshold falls. And look at the shape as well as the total: if the [heatmap](/blog/qr-code-scan-time-analytics) for A and B looks the same and the totals differ, the difference is more likely real than if B's total comes from one strange afternoon.

## Reading the result

Once the counts are in:

- **Use total scans**, with bots excluded, which is the default. Bots and link previews are not people looking at a poster. [Unique vs total scans](/blog/unique-vs-total-qr-code-scans) explains why unique is not the better number here; it is daily and it discards the repeat scans that a good call to action may legitimately produce.
- **Check that the two versions were actually equal in exposure.** Same period, same quantity, same kind of place. The location and device panels for the two codes should look alike; if one has scans from another city and the other does not, the short link was shared and the test is contaminated.
- **Look past the scan.** Two codes with the same destination and different `utm_content` tell your site analytics which version each visit came from. If B gets more scans but the same conversions as A, B's extra scanners were curious rather than interested. That happens with "Scan me" against a specific offer: the vague one gets more scans and the specific one gets more customers.
- **Do not stop early on a lead.** Decide the length before starting and read it at the end.

## Tests that tend to be worth running

From experience rather than from a study, the differences that are usually large enough to measure with print volumes:

- **A call to action that says what happens** against one that does not. "Scan for the menu" or "Scan to book" against a bare code or "Scan me".
- **Code size** at the edge of scannability. A code that is too small at the distance people stand loses a large share of attempts silently; a bigger one recovers them. [The size guide](/blog/qr-code-size-guide) gives the starting point, and this test tells you where the edge is for your placement.
- **Position** on a large-format piece. Eye level against knee level on a standing poster is a large effect.
- **Placement** between two locations. Not a design test, but the most common and most useful A/B in practice.

The ones that are usually too small to measure: subtle colour choices, module shape, logo or no logo, at any print volume short of a national campaign. Choose them on the [design rules that keep a code scanning](/blog/qr-code-design-rules-that-still-scan), not on a test you cannot power.

## Tidying up afterwards

When a test has a winner, the loser does not need to be reprinted out of existence. Both codes are dynamic and both keep working; leave them pointing at the destination and print only the winner next time. If the test was for a dated offer, set an expiry on both. The counters stay in the dashboard for as long as your retention window keeps them, which is where the next test's baseline comes from.

## Frequently asked

**Can I A/B test a QR code?**
Yes, with two dynamic codes pointing at the same destination and one difference between the printed versions. The two scan counters are the result.

**Can I A/B test with a static QR code?**
Only on the destination side: encode two URLs that differ by a tag and count the visits in your site analytics. Nothing counts the scans themselves, and you cannot change the two URLs afterwards.

**How long should a QR code A/B test run?**
Until each side has enough scans for the difference you are looking for — see the table above — and for at least a full week so that weekday patterns appear on both sides. Decide the length first.

**What if both versions get very few scans?**
Then the test has no result, and that is a result of sorts: the placement itself is the problem, not the design. Move the code somewhere people stand still with a phone before testing anything about it.

**Does the person scanning see any difference between the two codes?**
No. Both redirect to the same page in the same way. Only the counters differ, and any `utm_content` tag on the destination is invisible to the visitor.
