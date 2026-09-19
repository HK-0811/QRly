---
title: QR code for a Zoom, Google Meet or Teams link that fits on a slide
description: Meeting links are long and change every session. A dynamic QR code turns them into a small reusable code for slides and lobby signs, without a passcode on the poster.
date: 2026-09-19
category: use-cases
keywords: qr code for zoom link, zoom qr code, google meet qr code, teams meeting qr code, meeting link qr code, qr code for webinar, join meeting qr code
---

Someone in the room wants to join the call on their phone. Someone in the lobby wants the link for the town hall. Someone at the back of a lecture theatre wants the Zoom for next week's session. In every case the link is on a screen too far away to read and too long to type, and a QR code is the obvious fix.

The two things that make meeting links awkward as QR codes, their length and their habit of changing, both have the same answer.

## Why meeting links make bad codes on their own

A Zoom link with the passcode embedded looks like this:

```
https://us02web.zoom.us/j/81234567890?pwd=aBcDeFgHiJkLmNoPqRsTuVwXyZ012345
```

That is around 75 characters, which at medium error correction is a version 5 code: 37 modules a side. Acceptable on a slide, marginal on a small sign.

A Teams link is worse:

```
https://teams.microsoft.com/l/meetup-join/19%3ameeting_ZmU4...%40thread.v2/0?context=%7b%22Tid%22%3a%22...%22%2c%22Oid%22%3a%22...%22%7d
```

Fully expanded, those run to 250 to 300 characters. Encoded directly, that is a version 12 or 13 code with 65 to 70 modules a side, which on a projected slide is a grey square that phones at the back cannot resolve. Google Meet links are mercifully short (`meet.google.com/abc-defg-hij`), but the pattern holds: the code is only as clean as the URL inside it.

A short link fixes the density regardless of the platform. A QRly link is about 23 characters and lands in version 2, at 25 modules a side. On the same slide, each module is nearly three times the size, which is the difference between scanning from the front row and scanning from the back. The reasoning is laid out in [why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes).

## Dynamic, because the link changes

The second problem is that a meeting link is rarely the same twice. A recurring meeting might keep its ID, but a webinar series issues a new one per session, a company town hall moves between platforms, and a lecture course has a different Zoom for the guest speaker.

A [dynamic code](/blog/what-is-a-dynamic-qr-code) encodes the short link, and the short link's destination is edited from the dashboard. So:

- **The code on the slide template** stays the same across the whole term. Before each session, paste the new meeting link into the destination; the change is live at every edge in under a minute.
- **The code on the lobby sign** for the monthly all-hands is printed once. Repoint it monthly.
- **The code on the printed agenda** for a conference points at whichever session is running now, if you are willing to update it between sessions, or at a page listing every session's link.

After the session, repoint the code at a "This meeting has ended; the recording is here" page, or leave it pointing at the next one. The post on [reusable QR codes](/blog/reusable-qr-code) covers the pattern in general.

## Security: what not to print

A meeting link with `pwd=` in it is the meeting's key. Anyone who scans the code can join, and anyone who photographs the poster can join later, or share it. That is fine for a public webinar and a bad idea for anything else. Rules that hold up:

1. **Do not put a passcode-embedded link on a poster in a public space.** A lobby, a shop window, a noticeboard in a shared building: treat those as public. Put a **registration page** behind the code instead, and let the platform email the join link to registered people.
2. **Use the waiting room or lobby** on the platform for anything you print at all. A code in a corridor is a code someone will scan out of curiosity.
3. **Remember the short link is public by definition.** A QRly link is not a secret; it is a redirect anyone who scans it can follow. It adds no access control to the meeting. What it adds is the ability to **take the link back**: after the meeting, repoint the code, or set an [expiry date](/blog/qr-code-with-expiration-date) for an hour after the scheduled end so that a photographed poster stops working on its own.
4. **Inside a meeting room**, on a slide visible only to attendees, a passcode-embedded link is reasonable. The people in the room are already in the meeting.

The [post on QR code safety](/blog/are-qr-codes-safe) is written from the scanner's side; it is worth reading from the organiser's side too, because a code on a public poster that leads to a login prompt looks exactly like a phishing attempt to a wary attendee. A registration page on your own domain looks like what it is.

## Slides

The first slide and the last slide, and a small one in the corner of any slide where you want people to join a poll or a backchannel. Sizes for a projected slide:

- **Closing slide, code alone**: make it a quarter to a third of the slide's height. At that size, on a 3 m screen, the code is 60 to 90 cm across and scans from the back of a large room.
- **Corner code on a content slide**: no smaller than a tenth of the slide height, and hold the slide for long enough. Ten seconds is the minimum for someone to get their phone out.
- **Black on white**, even if the deck is dark. A white panel behind the code is the easy fix; the [dark backgrounds post](/blog/qr-code-on-dark-backgrounds) has the alternatives.
- **Export SVG** and drop it into the deck; there is a post on [inserting a code into PowerPoint, Word and Canva](/blog/insert-a-qr-code-in-word-powerpoint-and-canva).

Put "Scan to join on your phone" under it. A bare code on a slide gets photographed, not scanned.

## Signage and printed material

For a lobby sign or a door sign, the person scanning is typically one to two metres away, so the code wants to be 10 to 20 cm across; the [size guide](/blog/qr-code-size-guide) has the rule. For a conference badge or a printed agenda, 2 to 3 cm is enough because it is scanned at arm's length.

For hybrid meetings specifically, a small standing sign in the physical room saying "Joining on your phone for the poll? Scan here" is more useful than any slide, because it is there before the deck starts.

## How phones open a meeting link

Scanning opens the link in the phone's browser. Zoom and Teams then show an interstitial ("Open in the app?"), and hand off to the app if it is installed or offer the web client if not. Meet opens in the browser or the Meet app directly. None of this is affected by the short link; the redirect is a 302 to the platform's URL and the phone takes it from there. The [redirect explainer](/blog/qr-code-redirect-explained) covers what the redirect does and does not do.

Laptops are the exception. A person on a laptop cannot scan the slide; put the short link in text next to the code (`qrly.lol/yourteam-standup`) so it can be typed. A [custom ending](/blog/custom-short-link-qr-code) makes that typeable, which a random seven-character one is not.

## What the scan data shows

Each link records scans at the redirect, with no cookie and nothing running on the phone. For a meeting code that means:

- **Scans by hour**, which shows how many joined at the start versus drifted in;
- **Scans per session**, when you repoint per session, which gives a rough phone-join count per meeting;
- **Device and OS**, which is nearly all mobile here, and a reminder that the code is measuring phone joins only. Nothing about who typed the link on a laptop is visible.

Unique visitors are counted per day, by a rotating hash, so a person who scans twice during the same meeting counts once. There is more on what can and cannot be known in the [analytics honesty post](/blog/qr-code-analytics-what-you-can-actually-know).

## Frequently asked

**Can I make a QR code for a Zoom link for free?**
Yes. Paste the meeting link on [the home page](/), download the code, and later sign up if you want to change the destination for the next session. No account is needed to make the first one, and there is no expiry or scan cap.

**Should I put the passcode in the link?**
On a slide inside the meeting room, yes, it saves everyone typing. On anything in a public space, no; link to a registration page and let the platform send the join link. Set an expiry on the code for after the meeting either way.

**Can one QR code work for a recurring meeting?**
If the meeting ID is stable, a single code pointing at that link works indefinitely. If the link changes per session, a dynamic code lets you repoint the same printed code before each one.

**Why is my Teams QR code so dense?**
Because a Teams link is 250 characters or more, and the code has to encode all of it. Put the link behind a short link and the code drops from around 65 modules a side to 25.

**Does the QR code add any security to the meeting?**
No. It is a link that anyone who scans it can follow. Security lives in the platform's waiting room, registration and passcode settings. What a dynamic code adds is the ability to revoke or expire the link after the meeting.
