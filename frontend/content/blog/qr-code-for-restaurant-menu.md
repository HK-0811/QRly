---
title: QR code for a restaurant menu that survives the next price change
description: How to make a free QR code menu that keeps working after the menu changes — host the menu, use a dynamic code, size it for a table tent and export the right file.
date: 2026-09-19
category: use-cases
keywords: qr code menu, free qr code for menu, restaurant menu qr code, digital menu qr code, qr code for restaurant, menu qr code generator, table tent qr code
---

A menu QR code fails in a predictable way. It works on the day it is printed. Then, some weeks later, a price changes, a dish comes off, the kitchen adds a lunch special — and the code on every table tent now opens a menu that is wrong. Reprinting fifty laminated tents is cheap; noticing which tables still have the old ones is not.

The fix is not a better QR code. It is putting the right thing behind the code, so the printed square never has to change.

## Host the menu first

A QR code does not contain your menu. It contains a web address, and the phone opens whatever is at that address. So before you make any code, the menu needs to live somewhere on the web. The choices, roughly in order of how well they work on a phone:

**A web page.** If you have a website, a `/menu` page is the best option. It reflows to a phone screen, it loads fast, and updating it means editing a page rather than regenerating a file. A single long page with a heading per section beats a paginated one; people scroll, they do not tap "next".

**A PDF.** Most restaurants already have the print menu as a PDF, and it is tempting to use that. It works, with caveats: a PDF laid out for A4 or Letter is unreadable on a phone without pinch-zooming, and a 12 MB print-ready export takes long enough to load on café Wi-Fi that some people give up. If a PDF is what you have, export a phone-sized version — single column, portrait, well under 1 MB — and host it on Google Drive, Dropbox or your own site with sharing set to "anyone with the link". The details are in [QR code for a PDF](/blog/qr-code-for-pdf).

**A third-party menu page.** Delivery and reservation platforms often provide a public menu page. Fine as a destination, if you are comfortable with their branding sitting between your customer and your food.

Whichever you pick, open it on a phone over mobile data, not on the office computer. That is what your customer will see.

## Make the code dynamic, not static

This is the decision that determines whether the table tents survive.

A **static** code encodes the menu's URL directly. If the URL never changes — say `yourrestaurant.com/menu` — that is fine. But the moment the menu moves to a new PDF with a new filename, or from a Drive link to a website page, the printed code points at the old location and nothing short of reprinting fixes it.

A **dynamic** code encodes a short link instead, and the short link redirects to wherever you tell it. Change the destination in a dashboard and every table tent, window sticker and takeaway bag follows, without anyone touching a printer. The mechanics are covered in [static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes); the short version is that dynamic is the right choice for anything whose destination might move, and a menu is the textbook case.

On QRly, that means pasting the menu link on [the home page](/), downloading the code, and signing up afterwards so you can edit the destination later. The redirect is a 302, so the change is honoured on the next scan, and it reaches every scanner in under a minute. There is no expiry, no scan cap and no paid plan, which matters for a code that will sit on tables for years — the [cost page](/cost) explains why that is sustainable.

One habit worth building: when the menu changes, change the *file* and leave the *link* alone. Upload the new PDF, copy its share link and update the code's destination; or, for a web page, just edit the page. The code on the table does not change. [How to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) walks through the dashboard side.

## Size it for a table tent

Scanning distance decides size. A table tent is scanned from a seat, roughly 30–40 cm away. A good rule is a code no smaller than **one tenth of the scanning distance** across, which puts a table tent code at 3 cm minimum. Go to 4 cm and you have margin for a scratched lens, dim lighting, or a customer who does not hold still.

Two other things affect it:

- **The quiet zone.** The blank border around the code must be at least four modules wide — a module being one of the small squares. Table tents get designed by people who want to fill every millimetre, and cropping the border to fit a logo is the most common reason a menu code fails. [The quiet zone post](/blog/qr-code-quiet-zone) has the detail.
- **The URL length.** A short link makes a simpler code, because fewer characters means fewer modules, and each module can be larger at the same print size. A dynamic code encoding `qrly.lol/abc123` has far fewer modules than one encoding a 90-character Drive share URL, which is a second reason to prefer the short link over encoding the PDF address directly.

For window stickers and A-frames read from a metre or two away, scale up in proportion — 10 cm or more. [The size guide](/blog/qr-code-size-guide) covers the full range.

## Do not print a JPG

The code you print should be a vector file, and if it cannot be a vector, it should be a large PNG. Not a JPG.

JPEG compression blurs sharp edges, and a QR code is nothing but sharp edges. At screen size the blur is invisible; printed at 3 cm it can turn a clean module boundary into a grey smear that a phone reads as the wrong colour. A code that "mostly works" from a JPG fails on the oldest phone in the room.

Export **SVG** for anything going to a printer. It scales to any size with no loss, and every print shop accepts it. If your design tool only takes raster, use **PNG at 1024 or 2048 pixels** — PNG is lossless, so the modules stay square. QRly exports both, with no watermark; [the file formats post](/blog/qr-code-file-formats-svg-png) explains the trade-offs.

Then, before the print run, [test from a print](/blog/test-a-qr-code-before-printing). One tent, on the real card stock, scanned from a seat, with an iPhone and an Android. It takes five minutes and prevents the reprint.

## What the scan data tells you

Because a dynamic code passes through a redirect, the redirect can count. That gives a restaurant two pieces of information it cannot get any other way.

**Scans by hour.** The analytics on a QRly link include local hour and weekday, shown as a heatmap. A menu code's heatmap is a picture of your service: a lunch peak, a dinner peak, and — often the useful part — the size of the gap between them. If Thursday evening scans are half of Friday's, you know before the till does. [Scan time analytics](/blog/qr-code-scan-time-analytics) goes into reading it.

**Scans by device and language.** The browser's language header is recorded, so a menu that gets a third of its scans from phones set to German wants a German page. Device and OS tell you which phones are opening the PDF.

Two honest limits. Scans are not covers: one person scans for the table, another scans twice because the page loaded slowly. And unique visitors are counted per day, using a hash that rotates every 24 hours, so a regular who comes in twice a week is a new visitor each time. Treat the numbers as a trend line, not a headcount.

None of this requires a cookie or a script on the customer's phone; a redirect never runs any. The [privacy page](/privacy) lists every field.

## If you want ordering, not just viewing

A menu code shows the menu. Some venues want the code to *take* the order — that is an ordering platform's job, and the QR code just opens it, ideally with the table number in the URL. The same rules apply, plus one: use a separate dynamic code per table, so table 7's code can be repointed if the platform changes its URL scheme. [QR code for restaurant table ordering](/blog/qr-code-for-restaurant-table-ordering) goes through it.

## Frequently asked

**Can I make a free QR code for my menu without an account?**
Yes. On QRly the code and its short link are created before any signup. Signing up afterwards is what lets you edit the destination when the menu changes, and see the scan data.

**Should the QR code point to a PDF or a web page?**
A web page, if you have one; it reads properly on a phone. A PDF works if it is exported for a phone screen and kept small. Either way, put a dynamic code in front of it so you can switch later.

**How big should a menu QR code be on a table tent?**
At least 3 cm across, with a blank border of four modules on every side. 4 cm is safer. For codes read from standing distance, such as a window or counter sign, 10 cm or more.

**What happens to the code when I change the menu?**
If the code is dynamic, nothing. Update the destination in the dashboard and every printed code opens the new menu within a minute. If it is static, the printed code still opens the old address, and the only fix is a reprint.

**Can I see when people scan the menu?**
With a dynamic code, yes: total scans, local hour and weekday, country and city, device and language. A trend, not a headcount — a table of four might scan once.
