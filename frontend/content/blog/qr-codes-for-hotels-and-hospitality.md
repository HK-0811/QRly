---
title: QR codes for hotels: in-room directory, Wi-Fi, room service and reviews
description: One dynamic QR code per room for the guest directory, Wi-Fi details, room service, a local guide and reviews, with a custom ending so the front desk can tell them apart.
date: 2026-09-19
category: business
keywords: hotel qr code, qr code for hotel guests, hospitality qr code, qr code hotel room, qr code guest directory, hotel wifi qr code, qr code room service
---

The in-room guest directory is a leather folder with a laminated Wi-Fi card, a room service menu that was reprinted in 2023, and a list of local restaurants of which two have closed. Every hotel has one, every hotel knows it is out of date, and every hotel reprints it as rarely as possible because it is expensive to do across 120 rooms.

A QR code in the room replaces the folder with a page, and the page can be changed tonight. This post is about what to put on that page, how to handle Wi-Fi honestly, and why each room should have its own code.

## What goes behind the code

A single page, mobile-first, with the things a guest reaches for in the first ten minutes:

- **Wi-Fi details.** Network name and password, at the top, large. More on this below.
- **Room service and breakfast**, with the current menu and hours, and if you have online ordering, the link to it.
- **The directory**: checkout time, housekeeping, the gym and pool hours, laundry, how to reach reception.
- **A local guide**: places to eat and things to do, kept current by whoever at the front desk actually knows.
- **Late checkout, upgrades, spa booking**, anything with revenue attached.
- **The review link**, for the end of the stay.

The page itself lives wherever you keep pages: your website, a simple site builder, a document. QRly does not host pages; it makes the code and the short link that redirects to your page, and lets you change that redirect at any time. [What a dynamic QR code is](/blog/what-is-a-dynamic-qr-code) covers the mechanism.

Because the code is dynamic, the folder's problem goes away. The room service menu changes: edit the page. The restaurant closes: edit the page. You move the page to a new site: edit the link's destination in the dashboard, and the code in every room follows within a minute. The card on the desk is printed once.

## Wi-Fi: a page or a WIFI code

There are two ways to give a guest Wi-Fi via a QR code, and it is worth being clear about which one QRly does.

A **WIFI: code** is a static code containing the network name and password in a special format. When scanned, the phone offers to join the network directly, with no page in between. It is the smoothest experience for the guest, and QRly does not make it, because QRly only makes URL codes. Any static generator, or the Wi-Fi sharing feature built into Android and recent iPhones, will make one; [the Wi-Fi post](/blog/qr-code-for-wifi) explains the format and how to generate it.

A **URL code to a page that shows the credentials** is what QRly does. The guest scans, the page opens, the password is there to copy. One more tap than the WIFI code, but three things in its favour for a hotel:

1. **The password can change.** A WIFI code is printed with the password inside it. When the password changes, every card in every room is wrong. A page is updated once.
2. **It is the same code as everything else.** One card, one code, Wi-Fi at the top of the page and the directory below it.
3. **Captive portals.** Many hotel networks require a login page after joining, at which point the WIFI code's advantage disappears anyway.

The honest recommendation: if your Wi-Fi password never changes and you want the slickest join, print a static WIFI code on the card alongside the dynamic directory code. If it changes, or you want one code, put the credentials on the page.

## One code per room, with a custom ending

The obvious approach is one code for the whole hotel. The better approach is one code per room, all pointing at the same page, each with a custom ending: `qrly.lol/room-101`, `qrly.lol/room-102`, or on your own domain, `guest.thehotel.com/101`.

Why bother, if they all open the same page:

- **You learn which rooms scan.** If the fourth-floor rooms scan the directory at twice the rate of the second floor, something about the fourth floor is prompting it — or the second-floor cards are behind the kettle.
- **The page can know the room.** Point `room-101` at `yourpage.com/directory?room=101` and the page can pre-fill the room number in the room service order form or the housekeeping request. The parameter lives in the destination, so the code stays small.
- **Housekeeping can tell them apart.** A card that has wandered from 214 to 216 is spotted because the ending is printed under the code.
- **A room can be taken out of service.** Repoint one link to a "this room is being refurbished, call reception" page without touching the rest.

Custom endings are chosen when the link is made; once saved, the hostname and ending are fixed, because the card is assumed to be printed. [Custom short link QR codes](/blog/custom-short-link-qr-code) explains the naming, and there is no per-code fee on QRly, so 120 rooms is 120 links in the same account.

There is no bulk import, so the links are made one at a time. For a hotel that is an afternoon's work, once.

## Reviews at the end of the stay

The review request belongs at checkout, not on the room card, because the guest's opinion is formed by then. A small code on the folio, the checkout email's printed equivalent, or a card handed over with the receipt, opening the direct review form.

Keep the review code separate from the room code, so its scan count means something on its own. [The Google reviews post](/blog/qr-code-for-google-reviews) has the direct-link and the wording; [feedback and surveys](/blog/qr-code-for-feedback-and-surveys) covers the private form for the guests you would rather hear from directly.

## Restaurant, bar and spa

The same pattern extends across the property. A code on the restaurant table for the menu — [the menu post](/blog/qr-code-for-restaurant-menu) covers that in detail — a code at the pool for the bar menu, a code in the spa for the treatment list and booking. Each is a dynamic link to a page that changes, on print that does not.

For a hotel with several outlets, a custom domain is worth the CNAME. The card in the room then says `guest.thehotel.com/101` rather than a third party's address, which matters when a guest is being asked to enter a room number or a card. [Custom domain QR codes](/blog/custom-domain-qr-code) explains what is involved, and it needs an account but not a payment.

## What the scan data shows

Per link, QRly records the scan time in the guest's local hour and weekday, the device and OS, the language, and the approximate location. For a hotel the location is redundant, and the language is the interesting one: a page that gets scanned by phones set to German and Japanese is a page that should exist in German and Japanese. [Device analytics](/blog/qr-code-device-analytics) covers what is and is not reported.

None of this identifies the guest. The redirect sets no cookie and runs no script; the IP address is used to derive the city and a daily-rotating visitor hash, then discarded. [The privacy page](/privacy) lists every field, which is a reasonable thing to be able to show a guest who asks.

## Printing the card

The card lives on a desk or bedside table, so 2.5–3 cm is plenty. Print from the SVG, keep the four-module quiet zone, and put the room ending and "Wi-Fi, room service and local guide" under the code so the guest knows what it opens. [Test a code before printing](/blog/test-a-qr-code-before-printing) has the routine; do it on the actual card stock, in the actual room lighting, which is usually worse than the office.

## Frequently asked

**Can a QR code connect guests to hotel Wi-Fi directly?**
A static WIFI code can, and any static generator or a phone's built-in sharing will make one. QRly makes URL codes only, so its version is a code to a page that shows the credentials, which has the advantage that the password can change without reprinting.

**Should every hotel room have a different QR code?**
Yes, pointing at the same page. It costs nothing extra on QRly, lets you see which rooms scan, lets the page know the room number, and lets one room be repointed without affecting the rest.

**What happens when the room service menu changes?**
Edit the page the code opens. If the page moves, edit the link's destination in the dashboard; the change reaches every room's code within a minute, and no card is reprinted.

**Do guests need an app?**
No. The camera app on any recent phone reads the code and opens the page. Put a short line under the code saying what it is for.

**Is the guest tracked?**
The scan is counted, with approximate location, device type and time. No cookie, no script and no stored IP address. The full list is on the privacy page.
