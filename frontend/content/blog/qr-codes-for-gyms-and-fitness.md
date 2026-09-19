---
title: QR codes for gyms: instruction videos on every machine, and more
description: Put a dynamic QR code on each machine that opens its instruction video, plus codes for class booking, trial offers and feedback, and what the scans say about the floor.
date: 2026-09-19
category: business
keywords: gym qr code, qr code fitness, qr code workout instructions, qr code gym equipment, fitness studio qr code, qr code class booking, gym equipment instruction video
---

Every gym has the same problem at seven in the evening: a member standing in front of a machine they have never used, a laminated diagram that shows a torso and an arrow, and no staff free to explain it. Most of those members walk to a treadmill instead. Some use the machine wrong.

A QR code on the machine that opens a thirty-second video of it being used correctly solves this for the cost of a sticker. It is the best use of a QR code in a gym, and this post starts there, then covers class booking, trial offers and feedback.

## A code on every machine

The pattern is one code per machine, or per machine type if you have four identical leg presses, linking to a page or video for that machine.

**What the page holds.** A short video, ideally your own trainer on your own machine so the settings and adjustments match. Under it: the muscles worked, how to set the seat and the pins, a common mistake, a suggested starting weight. Keep it to one screen; the person is standing on a gym floor, not reading at a desk.

**Where the video lives.** Anywhere: an unlisted YouTube or Vimeo upload, a page on your site, a shared folder. QRly does not host video or pages. It makes the short link and the code, and lets you change what the link points at. [QR codes for YouTube videos](/blog/qr-code-for-youtube-video) covers the simplest version.

**Why dynamic.** This is an asset tag, in the sense of [the asset tag post](/blog/qr-codes-for-asset-tags-and-equipment): a label on a physical object that has to stay right for the life of the object. Machines last ten years. The video will be re-shot, the page will move, the hosting will change. A static code containing the YouTube URL is wrong the day you replace the video. A dynamic code is repointed from the dashboard, and the sticker stays on the machine.

**Custom endings.** Name each link for the machine: `lat-pulldown`, `leg-press-2`, `cable-station-a`. The ending is printed under the code, so staff can see at a glance that a label is on the right machine. The ending is fixed once saved; the destination is not.

The sticker itself gets touched, wiped and sweated on. Print at 3 cm or larger, on laminated vinyl or a polyester label rather than paper, and put it on the frame near where the hands go, not on a moving part. Use error-correction level Q or H, since a label that gets scratched benefits from the redundancy; [error correction explained](/blog/qr-code-error-correction-explained) has the trade-off.

Test a scan on the printed sticker, on the machine, in the gym's lighting, with a phone that has been used for an hour — a sweaty, smudged lens is the realistic case.

## Class booking

A code on the class timetable poster, on the studio door and at reception, opening the booking page for the class or the timetable. The reason it works is timing: a member walking past the studio at the moment a class is starting is the person most likely to book the next one.

Make the code dynamic, because booking systems change more often than posters. The code on the wall pointed at the old system last year and the new one now, with nothing reprinted. If the class is at a fixed time, the link can point at that class's booking page directly; if the timetable is rotating, point at the timetable.

For a stack of posters, one code per poster location — `timetable-entrance`, `timetable-studio-door`, `timetable-changing-room` — tells you which one members actually use. There is no per-code fee on QRly, so there is no reason to share one code.

## Trial offers and referrals

Two codes with money behind them:

**The trial offer**, on the window, the flyer and the local café's noticeboard. It opens the trial sign-up, pre-filled with the offer. Set an expiry date on the link so that a flyer found in a drawer in March does not open a January promotion. After the date, the code shows an expired page. [Coupons and discounts](/blog/qr-code-for-coupons-and-discounts) covers keeping the offer page short enough to complete on a phone.

**The referral code**, on a card given to members: bring a friend, they scan, you both get the month. Track scans against sign-ups. One code per member is possible but tedious to make without bulk import; one code per month of the referral campaign is the practical version.

For the window code specifically, print large — 10 cm or more — on the inside of the glass, plain dark on light, because reflections and distance both work against it. [Where to place a QR code](/blog/where-to-place-a-qr-code) covers the physical side.

## Feedback

A code on the changing-room door or at the exit, opening a form with two questions. Members will tell you the showers are cold through a form that takes fifteen seconds; they will not email. [Feedback and surveys](/blog/qr-code-for-feedback-and-surveys) has the form design. Keep this code separate from the others so its scan count is its own.

## What the scans tell you about the floor

QRly records each scan with the hour and weekday in the scanner's local time, the device and OS, and the approximate location. For a gym the location is redundant, but the time and the per-machine counts are not:

| What you see | What it means |
|---|---|
| The lat pulldown scans ten times a week, the leg press once | Members are confused by one and not the other; the leg press label may also be hidden |
| Machine scans peak 6–8 pm on weekdays | That is when the floor needs a trainer walking it |
| A machine's scans jump after a re-shot video | The old video was not answering the question |
| Timetable scans peak Sunday evening | Members plan the week then; send the timetable email on Sunday afternoon |
| Trial code scans by hour, from the window | The window is being read after closing |

Unique visitors are counted per day, so a member scanning the same machine on Monday and Wednesday counts twice, which is the right behaviour for this purpose. [Scan time analytics](/blog/qr-code-scan-time-analytics) goes into the heatmap.

Nothing runs on the member's phone. The redirect sets no cookie and serves no script; the IP address is used for the city and a daily hash, then discarded. [The privacy page](/privacy) lists every field, which is worth knowing before a member asks.

## Setting it up

A gym with forty machines, six posters, a window and a feedback form is about fifty links. On QRly that is one free account, with no watermark, no expiry and no scan cap on any of them. The [home page](/) makes a code without an account; sign up to keep and edit them, and the codes you made first can be claimed into the account.

For each machine, [make a code](/create) with a custom ending, paste the video or page URL, and download the SVG for the label printer. Use the QR studio to set the error-correction level to Q or H, and, if you want the gym's colour on the label, [custom colours](/blog/custom-qr-code-colours) explains how far you can go before the scannability read-out objects.

Keep a spreadsheet of machine, ending and destination. When the video changes, edit the destination in the dashboard. The sticker never moves.

## Frequently asked

**How do I put a workout video on a gym machine?**
Upload the video somewhere (unlisted YouTube is the simplest), make a dynamic QR code pointing at it, print the code on a durable label and stick it on the machine's frame. When the video changes, edit the code's destination rather than the label.

**Do I need a different code for each machine?**
Yes, or for each machine type. It costs nothing extra, and per-machine scan counts tell you which equipment confuses members.

**What label material should I use?**
Laminated vinyl or polyester, not paper. Machines get wiped with disinfectant several times a day. Print at 3 cm or larger with error-correction level Q or H.

**Can the same code be used for the class timetable when it changes?**
Yes. A dynamic code's destination is edited in the dashboard, so the poster on the wall follows the new timetable or the new booking system within a minute.

**Are members tracked when they scan?**
The scan is counted with time, device type and approximate location. No cookie, no script, no stored IP address. The full list of fields is on the privacy page.
