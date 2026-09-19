---
title: Google review QR code: get the link, print it where it gets scanned
description: How to find your Google review link in the Business Profile, put a dynamic QR code in front of it so it can be repointed, where to place it, and how to read the scans.
date: 2026-09-19
category: use-cases
keywords: google review qr code, qr code for google reviews free, google review link qr code, google reviews qr code, leave a review qr code, review qr code for business, qr code for reviews
---

The gap between a customer who is happy and a customer who leaves a review is the minute it takes to find the right page on their phone. A QR code closes that gap to one scan, which is why a review code on the counter or the receipt is the highest-return print job most small businesses will ever do.

Setting it up correctly is three steps: get the real review link, put a dynamic code in front of it, and put the code where a satisfied person is standing.

## Get the review link from your Business Profile

Google gives every verified business a link that opens the "write a review" dialogue directly, with the star selector already on screen. That is the link you want — not the business's Maps listing, not the search result, not the website.

Sign in to your Google Business Profile (from Google Search, search for your business name while signed in as the owner and the management panel appears). In that panel there is an **Ask for reviews** option, which shows a short link of the form `g.page/r/<code>/review`. Copy it.

Open it in a private browser window to check it does what you expect. It should land on a Google page with your business name, a five-star selector and a text box. If it lands on the listing instead, you have the wrong link.

Two things about this link:

- It belongs to the profile, not to you. If the profile is ever merged, re-verified or replaced — which happens after a move, a rebrand or an ownership change — the link changes with it.
- It is a Google URL with a long path. Encoded directly, it makes a denser code than a short link would. That matters on a receipt, where the code is small.

Both are reasons for the next step.

## Make the code dynamic

A static code encodes the review link itself. It works until the link changes, at which point every printed counter card and receipt template opens an error, and the fix is a reprint.

A dynamic code encodes a short link that redirects to the review page. If the review link changes, edit the destination in the dashboard and every printed code follows. The difference is covered in [static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes), and for a review code it decides whether a Google-side change costs you an afternoon or nothing.

Repointing turns out to be useful more often than the profile changing:

- **Rotate the platform.** Point the same printed code at Google this quarter and at Tripadvisor, Trustpilot or an industry directory next quarter, if that is where the reviews are needed.
- **Recover from a mistake.** If the wrong link was printed, fix it in the dashboard instead of throwing out the stock.
- **Reuse the code** for a different purpose entirely when the review push is over.

On QRly, paste the review link on [the home page](/) and download the code — no account needed for that part. Sign up afterwards to keep the link editable. The redirect is a 302, the change reaches every scanner in under a minute, and there is no expiry and no scan cap, so the code on the counter keeps working for as long as the counter does. [How to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) shows the edit.

Choose a readable ending for the short link — `qrly.lol/yourcafe-review` rather than random characters — because on a review code, the customer can often see the link preview on their phone before tapping, and a sensible one gets tapped.

## Where to put it

The code needs to be where a customer is at the moment they are most satisfied, with their phone in their hand. That is a smaller set of places than it sounds.

**The receipt.** Most point-of-sale systems can print an image on the receipt footer. A code there reaches every paying customer, at the moment the transaction is done. Receipts are printed small and on thermal paper, so keep the code plain — no colours, no logo — and at least 2 cm across, with the quiet zone. [The size guide](/blog/qr-code-size-guide) has the reasoning; [how to print QR codes](/blog/how-to-print-qr-codes) covers thermal printers specifically.

**The counter.** A small standing card at the till, with "Enjoyed it? Leave us a review" and the code, 3–4 cm across. This catches the people waiting to pay, which is exactly the moment they are deciding what they thought.

**The table.** For restaurants, a tent card that already carries the menu code can carry the review code on the other face. Keep the two visually distinct — a label above each — or people scan the wrong one.

**Packaging and delivery bags.** A sticker or a printed insert reaches customers who never came in. The delay between purchase and scan is longer, which shows in the scan-time data, but the reviews from delivery customers are often the ones you are missing.

**Email and invoices.** A code in a PDF invoice or a printed thank-you card works for trade and service businesses where the customer is not standing in front of you.

Less useful: the shop window (people outside have not bought anything yet), the website (a link is easier than a code on a screen), and the business card.

## What to say next to it

The line beside the code does most of the work. Keep it to the point: *Happy with your visit? Leave us a Google review* and the code. Avoid two things:

- **Do not gate.** A flow that asks "were you happy?" first and only shows the Google link to people who say yes is against Google's review policies and is the kind of thing that gets reviews removed. One code, one link, everyone.
- **Do not offer a reward** for the review. Also against the policies, and easy to spot.

A plain, honest ask, placed well, outperforms both.

## Scans against reviews

This is where a dynamic code earns its place. The redirect counts every scan, so you know how many people started the journey. Google shows you how many finished it. The ratio is your completion rate, and it moves when you change the placement, the wording, or the moment.

What the scan data on QRly shows for a review code:

- **Total scans and unique visitors per day.** Uniques are per day by design — the same phone scanning on Monday and Thursday counts twice — so read them as a daily figure rather than a lifetime one. [Unique vs total scans](/blog/unique-vs-total-qr-code-scans) explains why.
- **Local hour and weekday**, as a heatmap. A receipt code's heatmap looks like your trading hours; a packaging code's is spread across evenings. If the counter code shows scans clustering at the end of lunch service and none at dinner, that tells you where the card is not visible.
- **Device and OS.** Nearly all mobile, for a review code; a desktop scan usually means someone opened the link from an emailed invoice.
- **Referrer.** A camera scan has none. Scans with a referrer came from somewhere else — a link in an email, say — which lets you separate the printed placements from the digital ones.

What it does not show: who left a review, or whether a given scan turned into one. Google does not pass anything back, and the redirect sees only the scan. You compare two counts over the same period and watch the ratio. That is enough to learn that receipts convert better than counter cards, or that the delivery insert is not being noticed, which is the decision the data is for.

None of this involves a cookie or a script on the customer's phone, and the IP address is used for the country and city fields and then discarded. [The privacy page](/privacy) lists every field, and [what you can actually know](/blog/qr-code-analytics-what-you-can-actually-know) sets the expectations honestly.

## Frequently asked

**Where do I find my Google review link?**
In the Google Business Profile management panel, which appears in Google Search when you are signed in as the owner. The **Ask for reviews** option shows a `g.page/r/.../review` link that opens the review dialogue directly.

**Can I make a Google review QR code for free?**
Yes. Paste the review link into QRly and download the code without an account. Sign up afterwards if you want to edit the destination or see scan counts. There is no paid plan and no expiry.

**Why should the review QR code be dynamic?**
Because the review link belongs to Google and can change when a profile is moved, merged or re-verified, and because you may want to point the same printed code at a different review platform later. A dynamic code is repointed in the dashboard; a static one is reprinted.

**Can I see how many reviews came from the QR code?**
Not directly. The code counts scans; Google counts reviews; you compare the two over the same period. Google does not report which reviews came from which link.

**Is it allowed to ask for reviews with a QR code?**
Yes. What is not allowed under Google's policies is filtering who sees the link based on how happy they say they are, or offering something in return for a review. One code, shown to everyone, with a plain ask.
