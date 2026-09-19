---
title: QR code for donations: church giving, nonprofit appeals and what to link
description: How to put a donation page behind a QR code, why it should be dynamic so the appeal can change, where to place it, and how to see which venue the gifts came from.
date: 2026-09-19
category: use-cases
keywords: qr code for donations, donation qr code, church qr code giving, nonprofit qr code, qr code for fundraising, charity qr code, qr code giving, scan to donate
---

Fewer people carry cash, and the collection plate, the bucket and the envelope in the pew all depend on it. A QR code on the card, the screen or the banner gets a donor from "I would like to give" to the payment form in one scan, on their own phone, with their own saved card details. Churches, charities and community groups have adopted it faster than almost any other sector, and mostly done it right. The mistakes that do happen are predictable, and this article is about avoiding them.

## What to link: a page, not a payment app

The first decision is where the scan lands. Link to your **donation page**, not directly into a payment app.

A donation page (whatever platform runs it: the church management system, a fundraising service, a page on your own site) works on every phone, shows who you are, lets the donor choose an amount and Gift Aid or tax status where applicable, and handles the receipt. It is the thing you already trust with card details.

Deep links into a specific payment app (a PayPal.me link, a bank app link, a [payment link](/blog/qr-code-for-payment-links)) work only for donors with that app and that account, and they land on a bare amount field with your name and nothing else. They are fine as one option on the donation page; they are a poor thing to print on their own.

If the appeal is specific, link to the specific campaign page, not the general giving page. A scan from the "new roof" banner should land on the new-roof page with the total so far and the target, not on a menu.

## Make it dynamic so the appeal can change

Here is the mistake that costs money. The pew cards, the banner, the bulletin template and the sticker on the collection box are printed once and used for years. The appeal behind them changes every few months.

A **static** QR code encodes the donation page URL directly. Print it for the Christmas appeal and it points at the Christmas appeal in July, or at a 404 when the platform archives the campaign. Change giving platform, as most organisations do eventually, and every printed code is dead.

A **dynamic** code encodes a short link that redirects to the destination, and the destination is editable. On QRly, paste the donation page, get a short link and a code, and when the appeal changes, [change where the link goes](/blog/how-to-change-a-qr-code-link-after-printing) from the dashboard. Every card and banner follows within a minute. The code is free, there is [no paid plan](/cost) and no expiry, and the [static versus dynamic](/blog/static-vs-dynamic-qr-codes) explainer covers the trade-off in full.

Practical patterns that follow from this:

- **One permanent `give` code** on everything, pointing at whatever you want general giving to go to this season.
- **A `campaign` code** on appeal-specific material that you switch to the next appeal, then to the general fund when the campaign closes, so old banners never dead-end.
- **Keep the old slug alive.** When a campaign ends, do not delete the link; point it at the thank-you page or the general fund. Material you forgot about is still out there.

For an organisation that expects to be giving through the same codes in ten years, put them on your own domain. QRly supports a custom domain (`give.yourchurch.org` pointing at the redirect engine with one CNAME record), which means the printed code carries your hostname, and if you ever moved services the codes would move with you. The [custom domain article](/blog/custom-domain-qr-code) explains the setup.

## Where to place it

Donation codes work where people have both the impulse and a phone in hand.

- **Pew cards and service sheets.** The classic. A small code with "Give online" beside it, sized about 2 to 3 cm for reading distance.
- **The screen at the end of the service.** A large code on the final slide, held for long enough to scan, which is longer than you think: thirty seconds minimum. Test the projected code from the back row.
- **The offering plate or box.** A laminated card in or on it, for the person who reaches for a wallet and finds no cash.
- **Event banners and pull-ups.** For fundraising dinners, fêtes and sponsored events. Size for the distance: a code on a banner read from three metres needs to be around 30 cm. The [flyers and posters article](/blog/qr-code-for-flyers-and-posters) has the arithmetic.
- **Thank-you letters and annual reports.** A code to the "give again" page, for donors who read on paper.
- **Vehicles and noticeboards** for community organisations, where the code may be scanned by someone who has never heard of you. Print the organisation name and the URL alongside it.

In every case, print the address in text as well. Some people will not scan a code, and a printed URL is the fallback that costs nothing. [Where to place a QR code](/blog/where-to-place-a-qr-code) covers glare, height and the other physical mistakes.

## Which placement actually converted

Because a dynamic code is counted at the redirect, it answers a question the collection plate never could: where do the gifts come from?

Make a **separate code per placement**: `pew`, `screen`, `banner`, `letter`. Each points at the same donation page, but each counts its own scans. After a quarter, you know that the screen code is scanned every Sunday and the pew cards are barely touched, or the reverse. QRly reports scans over time, by hour and weekday (a church code has a very recognisable heatmap), by city and by device, with no cookie or script on the donor's phone.

Two honest limits. A scan is a visit to the donation page, not a gift; QRly cannot see what happens on the page. To connect scans to gifts, add [UTM parameters](/blog/qr-code-utm-parameters-google-analytics) to each destination (`?utm_source=qr&utm_medium=pew`) and read the result in the donation platform's or website's own analytics. And unique visitor counts are per day, so the same donor scanning on two Sundays is two uniques; the [total versus unique scans](/blog/unique-vs-total-qr-code-scans) article explains why.

The [print campaign measurement article](/blog/measure-print-campaign-roi-with-qr-codes) turns this into a routine for organisations that want to compare placements properly.

## Trust: donors need to know the code is yours

Money is involved, so the scanner is right to be cautious, and you should make caution easy.

- **Print the destination next to the code.** "Scan or visit yourchurch.org/give". A donor who sees the code lands on the domain they were told to expect.
- **Use your own domain on the code** if you can, for the same reason. A short link on a hostname nobody recognises asks for more trust than one on yours.
- **Check the destination shows who you are** before the amount field: name, charity number, a photo. A bare payment form is what a scam looks like.
- **Watch for stickers.** The known pattern of QR fraud in public places is a fake code stuck over a real one. Codes in a pew or on a screen are safe; codes on a noticeboard outside are worth a glance each week. The [quishing article](/blog/qr-code-phishing-quishing) explains what to look for.

On QRly's side, every destination is checked against Google Safe Browsing when it is set and re-checked weekly, so a compromised donation platform page would be flagged rather than served.

## Frequently asked

**How do I make a QR code for donations?**
Paste your donation page URL into a QR generator and download the code. Make it a dynamic code so the page behind it can change when the appeal does; on QRly that is free, needs no account, and does not expire.

**Should a church giving QR code link to PayPal or a bank app?**
Link to your giving page, which works on every phone and shows who you are. Offer PayPal or bank transfer as options on that page rather than printing them directly; a payment-app deep link only works for people who use that app.

**Can I change where the donation QR code goes after printing?**
Only with a dynamic code. On QRly, edit the destination from the dashboard and every card and banner follows within a minute.

**Can I see which QR code raised the most?**
You can see which one was scanned most, per placement, if each placement has its own code. To connect scans to actual gifts, add UTM parameters to the destination and read them in the giving platform's analytics.

**Is a QR code safe for donations?**
As safe as the page it opens. Print the URL beside the code so donors can check the domain, use your own domain if possible, and check codes in public places for stickers placed over them.
