---
title: QR code to add an event to a calendar: Google Calendar links and .ics files
description: How to make a QR code that adds an event to Google Calendar, Apple Calendar or Outlook via a calendar link or hosted .ics file, and why it should hold a URL you can edit.
date: 2026-09-19
category: use-cases
keywords: qr code add to calendar, calendar event qr code, google calendar qr code, add to calendar qr code, ics qr code, qr code for event date, save the date qr code
---

An "add to calendar" QR code sounds like a single thing. It is actually three things, depending on which calendar the person scanning it uses, and the choice you make on the poster decides who gets a working button and who gets a login screen.

This post covers the three routes, which one to put behind the code, and why the code itself should carry a link rather than the event data.

## The three ways a phone can add an event

**A Google Calendar "add event" link.** Google Calendar accepts a URL that opens a pre-filled new event. It looks like this:

```
https://calendar.google.com/calendar/render?action=TEMPLATE
  &text=Autumn+open+evening
  &dates=20261105T180000Z/20261105T200000Z
  &details=Main+hall,+doors+at+17:45
  &location=12+High+Street,+Leeds
  &ctz=Europe/London
```

The `dates` field takes start and end in basic ISO format; a trailing `Z` means UTC, and `ctz` tells Google which timezone to display it in. Omit the `Z` and the time is taken as local to `ctz`. Anyone signed into Google on the phone gets a filled-in event and a Save button. Anyone not signed into Google gets a sign-in page, which on an iPhone with no Google account is a dead end.

**An .ics file.** This is the calendar standard (iCalendar, RFC 5545) that Apple Calendar, Outlook, Google Calendar and everything else can import. A minimal one is a few lines of text:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your org//Open evening//EN
BEGIN:VEVENT
UID:open-evening-2026-11@yourorg.example
DTSTAMP:20260919T090000Z
DTSTART:20261105T180000Z
DTEND:20261105T200000Z
SUMMARY:Autumn open evening
LOCATION:12 High Street, Leeds
DESCRIPTION:Main hall, doors at 17:45
END:VEVENT
END:VCALENDAR
```

Save it as `open-evening.ics`, host it somewhere that serves it as a plain file with the `text/calendar` content type, and a phone that opens the URL offers to add the event. iPhones handle this well through Safari. Android behaviour depends on the browser and the calendar app, and is usually a download followed by an "open with" prompt. Hosting is the same problem as for [a QR code for a PDF](/blog/qr-code-for-pdf): a file host that serves the file directly, not one that shows a preview page first.

**An event page with buttons.** A web page that describes the event and offers "Add to Google Calendar", "Add to Apple Calendar" and "Add to Outlook" buttons, each of which is one of the two links above. This is the only route that works for everyone, and it is what most ticketing and event platforms generate for you.

## Which one goes behind the code

For a poster, an invitation or a slide that a mixed audience will scan, put the **event page** behind the code. It costs one extra tap and it never strands anyone. If you know the audience is entirely on Google Workspace, an internal school or company notice for instance, the Google link alone is fine and saves the tap. If you know they are entirely on iPhones, which you rarely do, the .ics file alone is fine.

If you do not have an event page and do not want to build one, the .ics file is the more universal of the two links. It also works offline once downloaded, which the Google link does not.

## Why the QR code should carry a URL, not the event

There is a fourth option, and it is worth explaining why QRly does not offer it. A QR code can encode the `VEVENT` block above directly as text, and some camera apps will recognise it and offer to add the event without any web page in between.

It has three problems.

1. **Size.** The event block above is around 300 characters, which pushes the code to version 12 or 13 at medium error correction: roughly 65 to 70 modules a side. That is a dense code that needs to be printed large and photographed carefully. A QRly short link is about 23 characters and fits in version 2. The [versions and capacity](/blog/qr-code-versions-and-capacity) post has the exact table.
2. **Support.** Recognising a raw calendar payload is a camera-app feature, not a QR feature. iOS does it; many Android camera apps show the text and stop. A URL is the one payload every camera app treats identically: it opens it.
3. **It is frozen.** The time, the room, the date are baked into the printed code. When the venue moves the event by an hour, every poster is wrong.

Every QRly code is a URL short link, so QRly cannot make the raw payload version. If you specifically want one, any static generator with an "event" type will produce it, and it will scan; just print it large and test it on an Android phone before committing. For nearly every event, the link is the better tool, for the reason in the next section.

## Dynamic, so a time change does not mean a reprint

A [dynamic code](/blog/what-is-a-dynamic-qr-code) encodes a short link that redirects to your calendar link, .ics file or event page. Once the poster is printed, the redirect is the only thing you need to touch:

- **The time moves.** Update the `dates` in the Google link, or the `DTSTART` in the .ics, and [change the destination](/blog/how-to-change-a-qr-code-link-after-printing) in the dashboard. Every poster and every invitation updates within a minute. If the .ics is at the same URL, you do not even need to touch the dashboard; just replace the file.
- **The venue changes.** Same edit.
- **Registration opens.** Repoint the code from the calendar link to a ticket page, then back to the calendar link once sold out.
- **The event has passed.** Set an [expiry date](/blog/qr-code-with-expiration-date) on the link for the day after, or repoint it at "This one has happened; the next date is..." with a fresh calendar link. A [reusable code](/blog/reusable-qr-code) on a noticeboard can announce a different monthly event every month without ever being reprinted.

For a recurring series, put the recurrence in the .ics (`RRULE:FREQ=MONTHLY;BYDAY=1TU`) rather than issuing a new code each month.

## Getting the time right

Time zones are the thing that goes wrong. Write the times in UTC with the `Z` suffix and let the calendar app display them locally, or write local times and state the timezone explicitly with `ctz` in the Google link or a `TZID` in the .ics. Do not write a local time with a `Z` on the end; that is the mistake that puts a 6 pm event at 6 pm UTC, which in a British summer is 7 pm.

Then scan the code with one iPhone and one Android and check that the event lands at the right hour on both. The rest of the [pre-print checklist](/blog/test-a-qr-code-before-printing) applies too.

## Where the code goes

On an invitation, next to the date, with "scan to add to your calendar" beneath it. On a poster, at a height people can reach and at a size for the distance they will stand at; the [size guide](/blog/qr-code-size-guide) has the arithmetic. On the closing slide of a talk, alongside the date of the next one. On an email, do not bother: an email can carry the link as a button, and nobody scans their laptop screen with their phone when they could click.

If the event needs an RSVP as well as a calendar entry, the event page is again the answer: calendar buttons at the top, a form underneath. The post on [QR codes for events and invitations](/blog/qr-code-for-events-and-invitations) covers the rest of the invitation.

## Frequently asked

**Can a QR code add an event directly to my calendar?**
Some phones recognise a raw calendar payload in a code and offer to add it, but support is uneven and the code is large and cannot be changed. A code that opens a calendar link or a hosted .ics file works on every phone and can be edited after printing.

**Does QRly make calendar QR codes?**
QRly makes a QR code that opens a URL. Point that URL at a Google Calendar add-event link, a hosted .ics file or an event page and it is a calendar code. It does not embed the event data in the code itself.

**Google Calendar link or .ics file?**
The Google link is one tap for Google users and a sign-in wall for everyone else. The .ics file is universal but slightly clunkier on Android. An event page with both buttons is the safe default for a mixed audience.

**What if the event moves after the posters are printed?**
With a dynamic code, update the calendar link or the .ics file and, if the URL changed, repoint the code. The posters do not need touching. With a static code or an embedded event payload, they do.

**Can I see how many people added the event?**
You can see how many people scanned the code, when, and from roughly where. Whether they then saved the event happens on their phone and is not visible to anyone. The [analytics post](/blog/qr-code-analytics-what-you-can-actually-know) is honest about that line.
