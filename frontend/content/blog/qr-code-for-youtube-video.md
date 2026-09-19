---
title: YouTube QR code for a video or channel that you can change later
description: Which YouTube link to encode (youtu.be, timestamps, channel handles), why the code should be dynamic so the video can change, and where video codes work in print.
date: 2026-09-19
category: use-cases
keywords: youtube qr code, qr code for youtube video, qr code for youtube channel, youtube video qr code, qr code youtube link, youtube channel qr code, video qr code
---

A QR code that opens a video is the shortest path from a printed thing to a moving picture. A product box that opens the setup video. A manual page that opens the two-minute demonstration the manual is failing to describe. A print ad that opens the spot. The code is trivial; the decisions are which link to use and what happens when the video changes.

## Get the right YouTube link

YouTube has several URL shapes for the same video, and they are not equal for a QR code.

| Link | Shape | Notes |
|---|---|---|
| Share link | `youtu.be/<video id>` | Short. Use this one. |
| Watch page | `youtube.com/watch?v=<video id>` | Same video, longer; denser code. |
| With a timestamp | `youtu.be/<video id>?t=90` | Starts at 1:30. Good for a manual that references one step. |
| Channel | `youtube.com/@handle` | Opens the channel. Handles can change; see below. |
| Playlist | `youtube.com/playlist?list=<id>` | For a series: a set of setup videos, a course. |
| Shorts | `youtube.com/shorts/<id>` | Opens in the Shorts player. |

Get the share link from the **Share** button under the video; it is already the short `youtu.be` form, and the timestamp option adds `?t=` from the current position. Strip the `?si=` parameter YouTube appends — harmless, but it lengthens the code.

Two cautions on channels. The `@handle` form is the one to use, not the older `/channel/UC...` or `/c/name` forms, which still work but are long. And a handle can be changed by the owner, after which the old one redirects for a while and then does not. That makes a printed channel code a static-link liability — which is the argument for the next section.

## Make it dynamic, because the video will change

A static code encodes the YouTube link directly. It works until the video is taken down, re-uploaded, replaced by a better version, made private, or the channel handle changes. Every one of those happens to real videos on real channels, and after any of them the printed code opens "Video unavailable".

A dynamic code encodes a short link that redirects to the video. When the video changes, change the destination in the dashboard and every printed code follows. The reasoning is in [static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes), and for video it is the difference between a manual that stays right and one that quietly rots.

The cases that come up:

- **The re-upload.** YouTube does not let you replace the file behind a video ID. A corrected version is a new ID, and a static code still points at the old one, which you have now unlisted.
- **The localised version.** A product sold in a new market wants the video in another language. Repoint the code for that market's packaging, or keep one code and point it at a playlist.
- **The version bump.** The 2027 model gets a new setup video; the boxes printed for it can carry the same code as the 2026 ones.
- **The campaign that ends.** A print ad's code can be repointed from the spot to the product page when the spot is retired, so the ad keeps working in a magazine that sits in a waiting room for a year.

On QRly, paste the YouTube link on [the home page](/) and download the code — no account needed for that. Sign up to keep the destination editable. There is no expiry, no scan cap and no paid plan, which is the property that matters for a code printed on a box that will be sold for years. The redirect is a 302, and a change reaches every scanner in under a minute. Editing is covered in [how to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing).

## Where video codes get used

**Packaging.** A "watch the setup" code on the box or the inside of the lid. The person scanning has the product in one hand and a phone in the other; the video needs to open fast and start at the point that matters. Use a timestamp if the video has a preamble. Size: 2 cm minimum on a box read at arm's length, with the four-module quiet zone; [the size guide](/blog/qr-code-size-guide) has the reasoning.

**Manuals and quick-start cards.** One code per step that is hard to describe in words, each pointing at a timestamp in the same video, or at a short video per step. This is where the custom ending on a short link helps — `qrly.lol/model-x-step-3` is readable in the manual's margin, and each step's code reports its own scan count, so you learn which step people get stuck on.

**Print ads and posters.** The code opens the spot, the trailer or the behind-the-scenes cut. Posters are read from a distance, so the code needs to be large — 10 cm or more for something on a wall — and the four-module quiet zone matters more, not less, at that size. [QR codes for print advertising](/blog/qr-codes-for-print-advertising) goes into the placement.

**Event signage and merch.** A code on a stage banner or a T-shirt that opens the channel or the latest release. [QR code for T-shirts and merch](/blog/qr-code-for-t-shirts-and-merch) covers what happens to a code on fabric.

**Business cards and CVs** for people whose work is video — a showreel code beats a URL typed by hand.

In every case, export **SVG** for print. A QR code is sharp edges and a JPG blurs them; [the file formats post](/blog/qr-code-file-formats-svg-png) explains why. PNG at 1024 or 2048 pixels is fine where a vector cannot be used.

## What opens on the phone

On iOS and Android with the YouTube app installed, the phone hands YouTube links to the app rather than the browser. A dynamic code does not change this: the phone follows the redirect, sees the final YouTube URL and opens the app. Timestamps and playlists survive the hand-off.

Without the app, the video opens in the mobile browser's YouTube page, which plays fine. Age-restricted videos and videos with embedding or region restrictions behave as they would from any link — a QR code does not bypass any of that.

One thing to check: **unlisted** videos open from a link, so they work behind a code, and that is a reasonable way to serve a support video without it appearing on the channel. **Private** videos do not open for anyone but the owner. If a scan shows "Video unavailable", private is the first thing to check.

## Scans against views

A dynamic code counts every scan at the redirect — with no cookie and no script on the phone — and reports total scans, unique visitors per day, country and city, local hour and weekday, device and OS, language and referrer. YouTube Studio counts views. The two numbers do not match and should not be expected to.

YouTube's view count includes everyone who found the video by any route, and it applies its own rules about what counts as a view. The scan count is the number of times the printed code was scanned, which is the number you actually want to know: how many people the box, the manual or the ad got to reach for their phone.

Useful reads:

- **Per-code counts** for the manual tell you which step generates the most scans, which is the step the manual explains worst.
- **Scans by hour** for a packaging code cluster in the evenings and on weekends, when people unbox things. If they cluster on weekday mornings, it is retailers scanning, not customers.
- **Country** for a product sold in several markets tells you where the video is being watched — and, if a market is missing, where the packaging with the code has not landed yet.
- **Referrer: none** identifies camera scans. Scans with a referrer came from the short link being shared some other way.

UTM parameters on a YouTube link do not reach YouTube Studio in any useful form, so the redirect is the only place the print channel gets measured. [How to track QR code scans](/blog/how-to-track-qr-code-scans) has the fuller picture; [what you can actually know](/blog/qr-code-analytics-what-you-can-actually-know) has the honest limits, including that unique visitors are per day and geolocation is city-level and approximate.

## Frequently asked

**Which YouTube link should I put in a QR code?**
The `youtu.be/<id>` share link, with `?t=` if you want it to start at a particular moment. For a channel, the `youtube.com/@handle` form. Strip the `?si=` tracking parameter to keep the code smaller.

**Will the QR code open the YouTube app?**
If the app is installed, yes; the phone passes YouTube links to it. Without the app, the video opens in the browser. A dynamic code redirects to the same YouTube URL, so the behaviour is identical.

**Can I change the video after the QR code is printed?**
Only with a dynamic code. Edit the destination in the dashboard and every printed code opens the new video within a minute. A static code points at the old video ID permanently.

**Does the QR code work for an unlisted video?**
Yes. Unlisted videos open from a direct link, so they work behind a code without appearing on the channel. Private videos do not open for anyone but the owner.

**Can I see how many people scanned versus watched?**
The code reports scans — with time, country, device and more — at the redirect. YouTube reports views under its own rules. Compare them over the same period, but do not expect them to match; the scan count is the measure of the print placement.
