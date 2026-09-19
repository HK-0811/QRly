---
title: Editable QR codes: how a printed code can change where it goes
description: An editable QR code never changes; the redirect behind it does. What you can and cannot edit after printing, and how QRly pushes a change out within a minute.
date: 2026-09-19
category: dynamic
keywords: editable qr code, qr code you can edit, change qr code destination, edit qr code after printing, dynamic qr code, update qr code link, qr code redirect
---

The phrase *editable QR code* is slightly misleading, and understanding why is most of what you need to know. The QR code itself — the grid of dark and light modules — is never edited. Once it is on paper, it cannot be. What changes is the thing the code points at.

If you keep that one distinction straight, everything else about editable codes follows: what you can change, what you cannot, and why some vendors can switch your code off.

## What a QR code actually contains

A QR code is a container for a short piece of text. Point a phone camera at it and the phone decodes the text; if the text looks like a URL, the phone offers to open it. That is the whole mechanism. There is no server involved in the decoding, no network request, nothing the phone consults. The text is fixed in the pattern.

Change one character of that text and the pattern is a different pattern. The error correction built into every QR code can recover *damaged* modules, but it recovers the original text, not a new one. Error correction repairs the pattern; it does not rewrite it.

So editing a code, in the literal sense, means making a new code. If the old one is printed, that means reprinting. This is the reason [static codes](/blog/static-vs-dynamic-qr-codes) are permanent in both the good sense and the bad one.

## How an editable code gets around this

The trick is indirection. Instead of encoding your destination, the code encodes a short URL on a redirect service. With QRly that is `qrly.lol/` followed by a slug. When a phone opens that URL, the service looks up the slug, finds the destination on file, and answers with an HTTP 302 redirect. The phone follows it and the person scanning sees your page, usually without noticing the hop.

The printed code never contained your page. It contained the short link. The destination lives in a database row, and a database row can be edited.

That is the entire meaning of *editable*. Not the code — the row behind it.

| Part of the system | Editable after printing? |
|---|---|
| The pattern of modules | No. It is ink. |
| The short link the pattern encodes (`qrly.lol/abc123`) | No, for the same reason. |
| The destination the short link redirects to | Yes, from the dashboard. |
| An expiry date on the link | Yes; set, change or remove it. |
| The scan history | Carries on accumulating across every edit. |

## What QRly deliberately refuses to let you edit

The short link — the hostname and the slug together — is locked the moment a link is saved. On QRly this is enforced by a database trigger, not by a greyed-out button, so nothing in the application can change it by accident.

The reason is the same one that makes the code un-editable: the short link is already printed. If `qrly.lol/menu` could be renamed to `qrly.lol/menu-2`, every printed copy of the first one would start returning a not-found page. A link that might be on a thousand table tents has to be treated as ink too. There is a longer argument for this in [why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable), and the practical side of choosing a good ending in [custom short link QR codes](/blog/custom-short-link-qr-code).

The design of the code is a slightly different case. You can re-export a QRly code at any time with a different colour, a logo, or rounded modules, and the new file encodes the same short link, so old prints and new prints both land in the same place. But the copies already printed keep the design they were printed with. Design changes produce a new file, never a new link.

## How fast an edit takes effect

This is the part worth being precise about, because most vendors are vague.

When you save a new destination on QRly, the mapping is written to the database and pushed to Cloudflare's key-value store, which is replicated to every edge location the redirect runs from. Propagation to all of them takes **under 60 seconds**. It is usually much quicker, but a minute is the figure to plan around: within that window a scanner in one part of the world might still get the previous destination.

For the practical cases this rarely matters. If a menu changes at 5pm, edit the link at 4:55. If an event moves venue, edit the link the moment you know, not the moment the doors open.

There is one more thing that makes fast edits possible, and it is invisible unless a vendor gets it wrong: the redirect has to be a 302, not a 301. Browsers cache a 301 permanently, which means a phone that has scanned the code once would keep going to the old destination no matter what you edit. [QR code redirects explained](/blog/qr-code-redirect-explained) covers why QRly never serves a 301.

## Where an editable code earns its keep

An editable code is worth having wherever the printed thing outlives the page it points to.

- **Menus.** The card on the table stays; the dish list, the prices and the specials do not. A [restaurant menu code](/blog/qr-code-for-restaurant-menu) is the canonical example.
- **Packaging.** A product's support page, manual or promotion changes over the life of a print run measured in tens of thousands of units.
- **Business cards.** A card printed once can follow you through two job changes and a new portfolio.
- **Campaign material.** A poster's landing page can be swapped, tested or retired without touching the poster.
- **Signage with a long life.** Real estate boards, equipment tags, notice boards, anything laminated.

If the destination will genuinely never move — your home page, a document with a permanent URL — a static code is fine and has the advantage of depending on nobody. The honest answer to *do I need an editable code* is *will this change?*, and for most printed material the answer turns out to be yes.

## Editing a code on QRly

The mechanics are short. You can [make a code](/create) with no account; the code and the short link work immediately. To edit it later you need an account, because there has to be some way of proving the link is yours. Anonymous links carry a claim token that becomes ownership when you register.

From there: open the dashboard, open the link, change the destination, save. The new destination is checked against Google Safe Browsing before it goes live, and private or local addresses are refused. There is a step-by-step walkthrough in [how to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing).

Nothing else about the link changes. The analytics for the old destination and the new one are one continuous record, which is what you want if the code is on a piece of print you are trying to measure.

> The code is ink. The short link is treated as ink. Only the destination is data, and data can be edited.

## Frequently asked

**Can I edit a QR code that I made somewhere else?**
Only if it was a dynamic code on that service, and only through that service's dashboard. If the code contains your URL directly, it is static and nothing can edit it; you would make a new code and reprint.

**Does editing the destination change the QR code image?**
No. The image encodes the short link, and the short link does not change. Every copy already printed keeps working and starts going to the new destination within a minute.

**Can I change the short link itself?**
No. Once saved, the hostname and slug are permanent, because they may already be printed. Choose the ending carefully before you save; after that, only the destination is editable.

**Is there a limit to how many times I can edit a code?**
No. Edit it as often as the destination changes. Each edit is a single database update; there is no counter and no charge.

**What happens to scanners during the propagation window?**
For up to 60 seconds after an edit, a scanner may be sent to the previous destination. After that, everyone gets the new one. Make the edit a minute early if timing matters.
