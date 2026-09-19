---
title: QR code for events and invitations: one code from RSVP to the photo album
description: How to put one QR code on a wedding or event invitation that collects RSVPs, then gives directions on the day, then shares the photo album, without reprinting.
date: 2026-09-19
category: use-cases
keywords: qr code for event, wedding qr code, qr code for invitation, event qr code generator, qr code for rsvp, qr code for wedding invitation, event qr code, save the date qr code
---

An invitation is printed once and read for months. The RSVP form it points to is useful for six weeks, the map is useful for one afternoon, and the photo album does not exist until the event is over. A single QR code has to serve all three, and the only way it can is if what the code points to can change while the card on the fridge stays the same.

That is the whole trick. Everything else is detail.

## Why the obvious approach fails

The obvious approach is to open a Google Form, copy its link, paste it into any generator and print the result on the invitation. It works, right up to the day after the RSVP deadline, when guests still scan the card to find the venue and land on a closed form.

The code encodes the form's URL directly. A [static code](/blog/static-vs-dynamic-qr-codes) is the link, and a link to a form is a link to a form forever. Guests do not throw invitations away when they RSVP; they keep them precisely because the details are on them.

The fix is a [dynamic code](/blog/what-is-a-dynamic-qr-code): the printed code encodes a short link, and you decide from a dashboard where that short link goes this week. With QRly the short link is `qrly.lol/<your-slug>`, the redirect is a 302 so it can change, and an edit reaches every scanner in under a minute.

## One code, three lives

Plan the destination in phases before you print. A typical wedding or launch event looks like this:

| Phase | Destination | What the guest sees |
|---|---|---|
| Invitation sent, until the RSVP deadline | Your RSVP form or event page | Name, attendance, dietary needs, plus-ones |
| Deadline passed, until the event | A details page: address, map link, timings, dress code, parking | Everything they would otherwise text you to ask |
| During the event | The same details page with a "share your photos" upload link added | Somewhere to drop the photos they are taking |
| After the event | The shared album, a thank-you note, a video | The reason they scan a card two years later |

Each row is one edit in the dashboard. The invitation, the table cards, the welcome sign and the order of service all carry the same code and all move together.

The details page in the middle rows is worth building even if the rest of your setup is a form and an album. A single page with the address, a Google Maps link, the timings and an add-to-calendar link is what people actually want from an invitation on the day, and it means you do not need a second code.

## Setting it up

1. Make the RSVP form first. Google Forms, a Typeform, a page on your wedding site — anything with a URL. The [Google Form post](/blog/qr-code-for-google-form) covers the settings that matter, such as limiting to one response.
2. Paste that URL on [the QRly home page](/) or at [/create](/create). You get a short link and a code immediately, before any account exists.
3. Choose the ending. `qrly.lol/ana-and-tom` reads better on a card than seven random characters, and it is what a guest with a broken camera will type. The slug is permanent once saved because it is about to be printed, so pick it carefully.
4. Sign up to claim the link. This is the step that gives you the dashboard, and the dashboard is where the phases above happen.
5. Download the SVG for the printer, and a PNG for anything digital.

The details page and the album do not need to exist yet. You only need the first destination to be right on the day the cards go out.

## Design for stationery

Invitations are the one place where people most want to restyle a code, and the one place where a code most often fails, because the substrate is unusual. A few things that hold up:

- **Size.** On an A6 or 5×7 inch card the code will be scanned from about 20 cm. Two centimetres square is a sensible minimum; 2.5 cm is comfortable.
- **Colour.** Dark ink on the paper colour works. Foil, metallic and white-on-dark do not reliably scan. Letterpress and textured stock are fine as long as the contrast survives.
- **Quiet zone.** Leave a clear border of at least four modules around the code. Ornamental frames that touch the code are the most common reason a wedding code fails.
- **A line of text under it.** "Scan to RSVP" now and, because the card will outlive the RSVP, something like "Scan for details and photos" is more honest.
- **Test the proof.** Scan the printer's proof, not your screen, on an iPhone and on an Android, before approving the run. The [testing checklist](/blog/test-a-qr-code-before-printing) is short.

If you want a monogram in the centre, QRly's studio caps the logo at what the error-correction level can absorb and shows a scannability read-out. Use level H for a logo and keep the logo well inside the cap.

## Save-the-dates, table cards and signage

The same short link can appear on every printed piece for the event, and it usually should. A save-the-date sent months earlier can point at the same slug; on that day the destination is a holding page, and it grows into the RSVP form when the invitations go out.

Table cards, the welcome sign and the order of service are where a second slug is worth considering. Guests at the venue are not RSVPing; they want the schedule, the Wi-Fi, the photo upload. You can serve them with the single slug by changing the destination on the morning of the event, or you can give the venue signage its own slug pointing straight at the details page. A second slug also tells you, from the scan analytics, how many people scanned at the venue versus at home. Both approaches work; the first is simpler, the second is more informative.

For a large printed welcome sign, treat it like a [poster](/blog/qr-code-for-flyers-and-posters): the code needs to be around a tenth of the distance it is scanned from, so 10 cm for a sign read from a metre away.

## After the event

Two choices, and both are legitimate.

**Keep it alive.** Point the slug at the album and leave it. QRly codes do not expire and are not deactivated for inactivity, so the card in the drawer opens the album in five years. Update the destination if the album ever moves.

**Let it end.** If the page held anything you do not want reachable indefinitely — a private address, a form with guest names in the URL — set an [expiry date](/blog/qr-code-with-expiration-date) on the link. After that date scans reach a plain expired page rather than whatever the vendor decides to show, and you can remove the expiry later if you change your mind.

The analytics are a modest bonus here. Total scans against invitations sent tells you roughly how many households used the code rather than replying by post. Unique visitors are counted per day, so the same guest scanning on Monday and Friday counts twice, which is fine for this purpose. Nothing runs on the guest's phone and no IP address is kept; the [privacy page](/privacy) lists every field, which matters when the scanners are your relatives.

## Frequently asked

**Can I change where the invitation QR code goes after the cards are printed?**
Yes, if it is a dynamic code. The printed code holds a short link; you change the destination from the dashboard and the change is live everywhere within a minute. A static code that encodes the form URL directly cannot be changed.

**Does a wedding QR code expire?**
Not on QRly unless you set an expiry date yourself. There is no trial and no inactivity rule. Many generators do expire free dynamic codes, so check what the code contains before printing.

**What should a wedding QR code link to?**
The RSVP form until the deadline, then a details page with the address, timings and map, then the photo album. One code can do all three because the destination is edited, not the card.

**How big should the code be on an invitation?**
At least 2 cm square on a standard card, with a clear border around it. Scan a printed proof before the run; screens are more forgiving than card stock.

**Do I need an account to make the code?**
No. The code and short link are made on the home page before any signup. You need an account to edit the destination later, which for an event is the point, so sign up once the code is made.
