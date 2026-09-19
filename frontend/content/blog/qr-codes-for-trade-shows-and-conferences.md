---
title: QR codes for trade shows and conferences: booths, badges, talks
description: Booth banners, lead capture forms, slide decks and one code per talk, with expiry after the event and what the scan analytics tell you the morning after.
date: 2026-09-19
category: business
keywords: trade show qr code, conference qr code, qr code for booth, event badge qr code, exhibition qr code, qr code lead capture, qr code for presentation slides, event qr code analytics
---

A trade show is three days of people walking past your booth at two metres with a phone in one hand and a coffee in the other. A conference talk is forty minutes of people looking at your last slide and wondering whether to ask for it. Both are QR code situations, and both are usually handled with a code that was made the night before, pointed at the home page, and never looked at again.

This post is about doing it so that the morning after the event you know what happened, and so that the banners can be used again next year.

## The booth

**The banner code.** A code on the back wall or the roll-up banner, large enough to scan from the aisle. At two metres that is 20 cm or more; the [size guide](/blog/qr-code-size-guide) has the rule of one tenth of the distance. It should open one thing, stated on the banner: the demo video, the product page, the lead form. Not the home page. A visitor who scans from the aisle is deciding whether to walk over; give them the reason.

**The lead capture code.** Smaller, on the counter or a table card, opening a short form: name, email, what they are interested in. This replaces the fishbowl of business cards and the borrowed badge scanner. Keep the form to four fields, because the visitor is standing up. [Google Forms](/blog/qr-code-for-google-form) is the simplest way to make one; [feedback and surveys](/blog/qr-code-for-feedback-and-surveys) covers keeping it short.

**The handout code.** On the flyer or the one-pager, opening the digital version and the follow-up form. Most handouts go in the bin at the hotel; the ones that survive should still work, which is a point about expiry, below.

**The giveaway code.** If there is a prize draw, the code that enters it. This one will get the most scans of anything on the booth, which makes it the best surface to put your one-line pitch on.

One code per surface. The banner, the counter card, the flyer and the giveaway all have separate codes, even where two open the same page, because separate codes are the only way to learn which surface worked. There is no per-code fee on QRly, so there is no reason to share one.

## Badges

Event badges often carry a QR code printed by the organiser, encoding an attendee ID for the organiser's own lead-retrieval system. That is a static code in the organiser's format, and QRly has nothing to do with it; use whichever scanner the organiser provides.

Where a QRly code belongs on a badge is on your own staff's. A code on the back of each team member's badge, or on the lanyard card, opening a contact page or a calendar booking link, so a conversation that has to end can continue. [The business card post](/blog/qr-code-for-business-card) covers what belongs on that page. One code per person tells you who is generating follow-ups.

## Talks

**One code per talk**, on the last slide, opening the slides and a way to follow up. Different code for each session, even if it is the same deck, because the point is to learn which session's audience wanted more. Put the code up for the whole of the questions, not for the two seconds before the next speaker's slide replaces it.

The deck itself lives wherever you keep decks: a shared drive, a slides platform, a PDF on your site. QRly does not host files; [QR codes for PDFs](/blog/qr-code-for-pdf) covers hosting the file somewhere and linking to it. The code is dynamic, so the deck can be replaced with the corrected version after the talk without changing the code, and the same code can point at the recording once it is published.

A speaker giving the same talk at four events makes four links: `talk-webconf-mar`, `talk-devsummit-may`. The scans per link are a reasonable proxy for how the talk landed at each.

**The print in the programme.** If the organiser prints a code in the programme or on the schedule board for your session, that is the same code, and it will be scanned before the talk as well as after. The hour-of-day data separates the two.

## Expiry after the event

A trade show generates print with a short life and a long tail. The banner goes back in its tube; the flyers surface in briefcases for months. Two mechanisms handle the tail:

**Set an expiry date** on the codes for anything that must stop: the giveaway entry, the show-only offer, the "book a meeting at the show" link. After the date, scans see an expired page rather than an offer you cannot honour. [QR codes with an expiry date](/blog/qr-code-with-expiration-date) covers it.

**Repoint** the codes for anything that should carry on. The flyer's code that opened the show landing page opens the evergreen product page from Monday. The banner's code, when the banner comes out of its tube next year, is repointed at next year's page. The banner never needs reprinting, which is the practical argument for dynamic codes on anything fabricated for reuse; [reusable QR codes](/blog/reusable-qr-code) has the detail.

The exception is comparison. If next year's banner should be compared with this year's, the counts need to be separate, which means a new code or a note of the date the old one was repointed. QRly's time series per link shows the boundary either way.

## The morning after

This is the part that justifies the setup. Every scan on a dynamic code is recorded at the redirect, and the per-link analytics the next morning answer questions that a fishbowl of cards cannot:

| Question | Where the answer is |
|---|---|
| How many people engaged with the booth | Unique visitors per day, across the booth codes |
| Which surface pulled | Scans per code: banner vs counter vs flyer vs giveaway |
| When the booth was busy | The hour-of-day heatmap; a dead hour is a staffing note for next year |
| Was the banner visible from the aisle | Banner scans specifically; if zero, it was too small or too high |
| Which talk's audience wanted the deck | Scans per talk code, in the hour after each session |
| Who came | Country and city, approximate, but for an international show a real read |
| Did the form work on their phones | Device and OS, against form completions |
| Are handouts still being scanned a month later | Scans over time on the flyer code |

Unique visitors are counted per day with a rotating hash, so a visitor who scans the banner and the giveaway counts once per link, and a visitor who returns on day two counts again. For a multi-day show that is the right shape. Location is city-level, from IP, and exhibition-hall Wi-Fi will place everyone at the venue, which is at least correct. [Unique vs total scans](/blog/unique-vs-total-qr-code-scans) and [what you can actually know](/blog/qr-code-analytics-what-you-can-actually-know) are the honest account.

What the scan data cannot tell you is who the person was. That is what the form is for. The scan count is the top of the funnel; the form completions are the next step; the deals are yours to track. [Measuring print campaign ROI](/blog/measure-print-campaign-roi-with-qr-codes) covers joining the numbers.

Nothing is installed on the visitor's phone, no cookie is set and no IP address is stored; the [privacy page](/privacy) lists every field, which is worth being able to answer at a stand in a jurisdiction with strict rules.

## Production

Banners are printed large by a print shop from an SVG; send that, not a PNG, and keep the four-module quiet zone inside the design. If the banner is a dark brand colour, put the code on a white panel; [dark backgrounds](/blog/qr-code-on-dark-backgrounds) explains why the reversed version fails. Counter cards and flyers at 2.5 cm. The last slide's code at least a tenth of the screen's height, on a plain background, with the URL's custom ending printed under it for anyone at the back.

Make all the codes a week before. Test the banner code from a printed proof at two metres, in ordinary office lighting, on an iPhone and an Android. Exhibition halls are lit worse than offices. [Test before printing](/blog/test-a-qr-code-before-printing) has the full routine, and [how to print QR codes](/blog/how-to-print-qr-codes) covers what to send the print shop.

## Frequently asked

**How big should a QR code be on a trade show banner?**
At least 20 cm across for scanning from a two-metre aisle, larger if the banner is behind a counter. The rule is one tenth of the scanning distance.

**Can I use the same QR code for every event?**
With a dynamic code, the same printed banner can be repointed at each event's page, so the banner is reused. Make a separate code where you want to compare events, and one per talk regardless.

**How do I capture leads with a QR code?**
Point a code at a short form, four fields at most, and put it on the counter and the flyer. The scans tell you how many tried; the form tells you who they were.

**What happens to the codes after the event?**
Set an expiry on time-limited ones so late scans see an expired page, and repoint the rest at evergreen pages. The printed material never needs to change.

**Is there a cost per code for a large event?**
Not on QRly. Codes are free, without a watermark, expiry or scan cap, and there is no per-code fee. Make one per surface, per talk and per staff badge.
