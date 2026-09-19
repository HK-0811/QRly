---
title: How to add a QR code to a website: inline SVG, img tags and sizing
description: When a QR code on a web page is useful, how to embed it as inline SVG or an img with alt text and sizing, and why a code linking to the page it sits on is wasted.
date: 2026-09-19
category: how-to
keywords: add qr code to website, qr code on website, embed qr code html, qr code for website visitors to scan, inline svg qr code, qr code img tag, qr code web page
---

A QR code is a bridge from something physical to something on the web, so a QR code sitting on a web page needs a reason to exist. There are good ones, and there is one very common bad one. This post covers when a code on a page earns its place, the two ways to embed it, and the details that make it scan from a screen.

## When a QR code on a web page makes sense

**Cross-device handoff.** The visitor is on a desktop and needs the thing on their phone: an app download, a mobile-only feature, a ticket to show at a door, a login they need on the other device. A code on the desktop page is faster than emailing yourself a link.

**Print from screen.** The page is going to be printed, or is a print preview: a booking confirmation, a boarding pass, a shipping label, a poster generated on the fly. The code has to survive the printer, which changes the sizing rules below.

**A page that is the source for posters.** A restaurant that prints its table cards from a page in its admin panel, a venue that prints event signage, a school that prints classroom sheets. The page is the template and the code is part of it.

## The trap: a code that links to the page it is on

The most common QR code on the web links to the page the visitor is already looking at, usually in a footer with "scan to visit our site". Nobody scans it. If they are on the page, they have the page. If they are on a phone, they cannot scan their own screen.

A code on a page should send the phone somewhere the desktop cannot go, or be there because the page gets printed. If neither applies, leave it out.

## Static or dynamic, for a web embed

For a code that is only ever shown on screen and links to a fixed URL you control, a static code is fine: nothing to expire, nothing to depend on. For anything that will be printed from the page, or where you want to know how many people used the bridge, use a dynamic code. Scans of a static code are invisible to you; scans of a dynamic code hit a redirect that can count them.

QRly makes dynamic codes: the code encodes a short link, the short link sends a 302 to your destination, and you can change the destination from the dashboard. It is free, and the [privacy page](/privacy) lists what the redirect records and what it does not. [Static vs dynamic](/blog/static-vs-dynamic-qr-codes) has the full comparison.

## Option 1: an img tag

The simplest. Download the SVG from the studio, put it with your other assets, and reference it.

```html
<img src="/assets/qr-menu.svg" width="240" height="240"
     alt="QR code linking to the mobile menu at qrly.lol/menu">
```

Points that matter:

- **Use the SVG** as the `src`. Browsers render SVG in `img` at any size with sharp edges, and the file is a few kilobytes. A PNG works too, but you then have to pick a resolution and it will look soft on high-density screens unless you ship 2× or 3× versions.
- **Set width and height** to the same value. The browser reserves the space and the code cannot be squashed by a flexbox rule you forgot about.
- **Write real alt text.** "QR code" tells a screen-reader user nothing. Say where it goes. If the destination URL is short, include it, because a person who cannot scan the code can type it. Better still, put a visible text link to the same destination next to the code; the code is a convenience, the link is the fallback.
- **Do not lazy-load it** if it is above the fold or the page will be printed. A lazy-loaded image that has not arrived when the print dialog opens is a blank square on paper.

## Option 2: inline SVG

Open the downloaded SVG in a text editor and paste its contents straight into the HTML. A QRly SVG is a `viewBox` in module units, a background rectangle, and a group of one-module rectangles or circles for the dark cells, plus the finder patterns and an embedded logo if you added one. It is plain markup.

```html
<figure class="qr">
  <svg viewBox="0 0 37 37" role="img" aria-label="QR code linking to qrly.lol/menu">
    ... contents of the downloaded file ...
  </svg>
  <figcaption>Scan to open the menu on your phone, or go to qrly.lol/menu</figcaption>
</figure>
```

Why bother:

- **No extra request.** The code arrives with the page and is there the instant it paints. For a page that gets printed, that removes a class of blank-square bugs.
- **Styleable.** You can set the size with CSS, and because the file has `shape-rendering="crispEdges"` the modules stay sharp at any size.
- **Accessible with less effort**: `role="img"` and `aria-label` on the `svg` do what `alt` does on an `img`.

The cost is a few kilobytes of markup and the temptation to style it. Do not change the fill colours with CSS to match a dark theme. A code that follows `prefers-color-scheme` into white-on-black is an inverted code, and a share of phone cameras will refuse it. If your site has a dark mode, keep the code in a light box. [Inverted QR codes](/blog/inverted-qr-code-white-on-black) explains what breaks.

## Sizing for screen and for print

On screen, the code is scanned from about 30 cm by someone holding a phone up to a monitor. A code 160 to 240 CSS pixels a side is comfortably readable on any laptop.

For a page that gets printed, the CSS pixel size is not what matters; the physical size on the paper is. Browsers print at 96 CSS pixels per inch, so a 96 px code prints at 25 mm. Set an explicit print size:

```css
@media print {
  .qr svg, .qr img { width: 30mm; height: 30mm; }
}
```

Thirty millimetres is a safe minimum for a code scanned from a sheet of paper in the hand. The [print size and resolution](/blog/qr-code-print-size-and-resolution) post has the numbers for other distances.

Browsers drop CSS background colours when printing by default. The QRly SVG carries its own background rectangle, so this does not affect it, but a code whose light area comes from CSS will lose it.

## Generating codes on the page itself

If the page produces many codes, one per order or per table, you do not want a downloaded file per code. Two approaches:

- **Server-side**: generate the SVG when you render the page, using any QR library in your stack, and inline it. With QRly, you create the links first from the dashboard, store each short link against the record, and have the page render a QR of that short link. The page is not calling QRly; it is rendering a link that already exists.
- **Client-side**: a small JavaScript QR library renders into a canvas or SVG element from a string. Fine for an admin panel, but the code exists only after the script runs, which matters for print previews.

QRly has no public API for creating links, so neither approach calls it from your page. [QR code API and automation](/blog/qr-code-api-and-automation) covers what that means for larger sets.

## A checklist before you ship

1. The code goes somewhere the visitor's phone needs to be, not to the page it is on.
2. It is an SVG, either as `img` or inline, with alt text that says where it leads.
3. A visible text link to the same destination sits next to it.
4. Width equals height, and neither is set by a rule that can squash it.
5. It sits on a light background, in both light and dark themes.
6. If the page prints, there is a print rule fixing the physical size at 30 mm or more.
7. You scanned it from a real screen and, if relevant, from a real print, with two different phones.

## Frequently asked

**Should I put a QR code on my website?**
Only if it takes the visitor's phone somewhere the page they are viewing cannot: an app store, a ticket, a mobile-only feature, or a printed version of the page. A code linking to the page itself is decoration.

**Is it better to embed a QR code as SVG or PNG?**
SVG. It is smaller, sharp at every size and density, and prints cleanly. Use PNG only where SVG is not accepted, and then use a large one.

**How do I make a QR code on my website accessible?**
Give it alt text or an aria-label that says where it leads, and put a visible text link to the same place beside it. A code is never the only way to reach its destination.

**Can I make the QR code match my dark theme?**
Keep the modules dark on a light panel regardless of theme. A white-on-black code is inverted and some phone cameras will not read it. Colour it in a generator that checks contrast if you want a brand colour, and do not restyle it with CSS.

**Can I track how many people scanned the code on my page?**
Only with a dynamic code, whose short link passes through a redirect that counts the scan. A static code goes straight to the destination and nothing sees it. QRly records the scan at the redirect with no script and no cookie on the phone; [free QR code tracking](/blog/free-qr-code-tracking) explains what it can and cannot tell you.
