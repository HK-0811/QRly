---
title: How to track QR code scans, step by step, and how to read the charts
description: Make a dynamic code, keep it with an account, open the analytics tab. Each step on QRly, what every chart means, and the Google Analytics side of the same scan.
date: 2026-09-19
category: analytics
keywords: how to track qr code scans, track qr code, qr code scan tracking, qr code scan analytics, track qr code scans free, qr code dashboard, qr code google analytics
---

Tracking a QR code means tracking the redirect behind it. A code that contains your URL directly cannot be tracked by anyone but your own server, so step one is making the right kind of code. After that it is a dashboard, and the useful part is knowing what each chart can and cannot tell you.

This is the process on QRly. Other dynamic generators work the same way with different menus; the reading-the-charts section applies to all of them.

## Step 1: make a dynamic code

Go to [the home page](/) or [/create](/create) and paste the destination URL. QRly makes a short link — `qrly.lol/` followed by a slug you can choose or accept — and a QR code that encodes that short link. The code and the link both work immediately, before any account exists.

Two things worth doing at this stage:

- **Pick the ending.** A slug like `qrly.lol/menu-spring` is easier to read aloud and to recognise in the dashboard later than a random one. Once saved it cannot be changed, because it may already be printed; [why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) explains the reasoning.
- **Make one code per place it will appear.** If the same destination goes on a poster, a flyer and a table card, make three codes. Scan counts are per link, and this is the only way to know which placement did the work. [Measuring print campaigns](/blog/measure-print-campaign-roi-with-qr-codes) is built on this habit.

If you are not sure whether your existing code is dynamic, point a phone at it and look at the decoded text before it opens. Your own URL means static, which means untrackable; a short URL on someone's domain means dynamic, tracked by whoever owns that domain.

## Step 2: sign up to keep it

An anonymous code works forever, but its analytics are only readable by an owner. Sign up and the codes you made in this browser are attached to the account; from then on they appear in the dashboard, can be edited, and report scans.

There is no plan to choose. The [cost page](/cost) shows what the platform costs to run, which is nothing, and there is no scan cap or expiry to watch for.

## Step 3: open the analytics tab

Each link in the dashboard has an analytics view; there is also an account-wide view across all links. Pick a date range. The first scans to appear will almost certainly be your own test scans, which is fine — they are real scans and they confirm the pipeline works. Scan the code from a printed proof, not from the screen, so the test is honest.

From here on it is a matter of reading.

## Reading the charts

**Scans over time.** The headline series. Bots and link previews are excluded by default and shown separately, because a messaging app fetching a link to draw a preview is not a person at a poster. Look for the shape: a spike on delivery day followed by a slow tail is a flyer; a flat daily rhythm is a fixture like a menu or a sign.

**Unique visitors.** The number of distinct scanners per day, computed from a hash of the connecting address, user agent and link, with a salt that changes every 24 hours. That means unique is *per day* — the same person on two days is two uniques — and it is designed that way so the hash cannot follow anyone across time. The trade-offs are in [unique vs total scans](/blog/unique-vs-total-qr-code-scans). The repeat rate beside it is the share of scans that were a second scan from the same daily hash.

**Where the scans happen.** Country, region and city, as lists and a map. This is IP geolocation: roughly right for cities, occasionally wrong by a lot for mobile carriers and always wrong for VPNs. Cities are marked at their centroid. Treat it as a distribution, not as a record of where any individual stood; [QR code location tracking](/blog/qr-code-location-tracking) explains the error.

**When people scan.** A heatmap of hour against weekday, in the *scanner's* timezone rather than yours. A restaurant sees lunch and dinner blocks; a conference sees the coffee breaks. It is the chart most likely to change a decision, and [scan time analytics](/blog/qr-code-scan-time-analytics) goes into the pitfalls.

**Device, operating system, browser.** Straight from the user agent. iPhones report as "iPhone" without a model; Android phones usually name the model. Use it to test your destination page on the devices that actually turn up, which is the one practical purpose of [device analytics](/blog/qr-code-device-analytics).

**Network.** The ISP or carrier name and a rough connection class — mobile, broadband, corporate, datacentre. A poster in a street should be mostly mobile; a code in an internal document should be mostly corporate broadband. Datacentre scans are usually automated and are flagged as such.

**How people arrived.** A camera scan sends no referrer, so "direct" here means a real scan. Scans with a referrer came from a link someone tapped — the short URL was forwarded in a chat or posted somewhere. UTM parameters present on the short link are listed under campaigns.

A distinction worth keeping in mind for every chart: the dashboard knows about the *request*, not the *person*. It can say a scan came from a phone running a particular browser in a particular city at a particular hour. It cannot say who, and it cannot say what they did next. [What QR code analytics can actually know](/blog/qr-code-analytics-what-you-can-actually-know) is the field-by-field version of that.

## Step 4: track the other side with Google Analytics

The redirect sees the scan. Your site's analytics sees the visit. Joining them takes one habit: put UTM parameters on the **destination** URL you paste into QRly, not on the QR code itself.

```
https://example.com/menu?utm_source=qr&utm_medium=print&utm_campaign=spring&utm_content=window-poster
```

When the redirect lands the phone on that URL, Google Analytics (or Plausible, or Matomo) attributes the session to that source, medium and campaign. Without tags, a scan usually shows up as direct traffic, indistinguishable from someone typing the address, because a redirect on QRly is sent with a no-referrer policy so the short link is not leaked to your site.

Because the destination is editable, the tags can be fixed or changed after printing. Print the code, open the link in the dashboard, adjust the destination URL, and every scan follows within a minute. The scheme for naming tags per placement is in [UTM parameters for QR codes](/blog/qr-code-utm-parameters-google-analytics).

Now you have the two halves: QRly's dashboard for how many, where, when and on what; your site analytics for what they did once they arrived.

## What tracking cannot do

It is worth being clear, because generators are not always.

- It cannot count scans of a static code. Nothing sees them.
- It cannot identify a person, or recognise them next week.
- It cannot see GPS. Location is where the network says the address is.
- It cannot see anything that requires a script: screen size, time on page, scroll depth. Those are for the destination page's own analytics.
- It cannot tell a scan that bounced from one that converted. Only your site can.

## Frequently asked

**Do I need an account to track scans?**
You need one to read them. Codes are made without an account and start recording from the first scan; signing up claims the codes you made and shows their analytics. There is nothing to pay for.

**Can I track a QR code I have already printed?**
If it is a QRly code, yes — claim it with an account and the history is there. If it is a static code containing your URL, no; the scan never touched anything that could count it.

**Why does the dashboard show fewer scans than I expected?**
Common reasons: bots and previews are excluded from the headline number; a printed code was cropped too tightly to scan reliably; or the code was static. Check the bot line first, then [test the code from a print](/blog/test-a-qr-code-before-printing).

**How long is scan data kept?**
For a retention window you set per account: one year by default, adjustable between one day and ten years. Older events are removed on schedule. The dashboard is the intended way to read it; there is no public API to describe.

**Does tracking work on a custom domain?**
Yes. A code on `qr.yourbrand.com` goes through the same redirect engine and records the same fields.
