---
title: How to make a QR code in Google Sheets and Excel, and its limits
description: The IMAGE() formula that generates QR codes in Google Sheets and Excel 365, why it depends on a third-party endpoint, and how to get trackable codes into a sheet.
date: 2026-09-19
category: how-to
keywords: qr code in google sheets, excel qr code, qr code formula, generate qr codes from spreadsheet, google sheets image qr code, excel qr code add-in, bulk qr codes spreadsheet
---

A spreadsheet is where lists of links live, so it is where people want QR codes to appear. There is a formula that does it in one cell, and it works. It also has two properties that are not obvious from the tutorials that recommend it: the code is static, and it is fetched live from somebody else's server every time the sheet renders. Both matter if the codes are going to be printed.

This post covers the formula for Sheets and Excel, what it is actually doing, when that is fine, and what to do when you need codes that can be edited or counted.

## The one-cell formula in Google Sheets

Google Sheets has an `IMAGE()` function that displays any image URL inside a cell. Several public services return a QR code as an image when you put the content in the URL. Combine them and you get:

```
=IMAGE("https://<qr-image-service>/?size=300x300&data=" & ENCODEURL(A2))
```

Replace `<qr-image-service>` with whichever image API you choose, put the link in A2, fill down, and every row shows a code. `ENCODEURL` matters: without it, a link containing `&` or `?` is cut off at the first special character and the code encodes half a URL.

Three things to know about what you just made.

**It is a static code.** The content of A2 is encoded directly. If the link changes, the cell changes, the image changes, and any print you already made is wrong. It cannot count scans, because nothing sits between the phone and the destination.

**It is not in the sheet.** `IMAGE()` stores a URL, not pixels. Every time the sheet opens, it asks the service for the image again. If that endpoint slows down, rate-limits you, changes its parameters or shuts down, the cells go blank. Google's own Image Charts endpoint, which most old tutorials use, was deprecated years ago; it still answers at the time of writing, but a printed workflow that depends on a deprecated URL is a risk you should know you are taking. Whatever service you use, you are also sending every link in your sheet to it.

**Copying the cell copies the formula, not the image.** Right-click, copy, paste into a document gives you an empty cell or a broken reference. To get the image out, you have to open the service URL in a browser and download it, or use a Sheets add-on that exports images. The image size is whatever the URL parameter says, typically 150 to 500 pixels, which is enough for a screen and marginal for print at any real size. See the [print size guide](/blog/qr-code-print-size-and-resolution).

## The same in Excel

Excel has had its own `IMAGE()` function in Microsoft 365 since late 2022, and `ENCODEURL` has been there longer. The identical formula works:

```
=IMAGE("https://<qr-image-service>/?size=300x300&data=" & ENCODEURL(A2))
```

Everything above applies. The image is fetched, not embedded, and Excel will show a security prompt about external content the first time. Older Excel (2019, 2016, LTSC) does not have `IMAGE()` at all. Your options there are:

- **An add-in** from the Office Store. Several exist; they generally insert a real picture object into the sheet from the cell content, which is better than the live-fetch approach because the image is then stored in the file. Check whether the add-in encodes locally or calls a web service, and what it does with your data.
- **VBA**. Macros that draw a QR code from scratch exist and encode locally with no network call. They are fiddly to install and most organisations block macros by default.
- **LibreOffice Calc** has a native QR code generator under Insert → OLE Object → QR and Barcode, no network involved. If you only need static codes and can use LibreOffice for the export step, this is the cleanest offline option.

Barcode fonts do not help. A QR code is a two-dimensional matrix, not a row of bars, and there is no font that turns text into one.

## When the formula is the right tool

The live-fetch formula is a reasonable choice when all of these are true:

- The links will never change, or the codes are disposable.
- The codes will be viewed on screen or printed once at small size, and nobody will ask you for a vector.
- You do not need scan counts.
- You are comfortable with the links being sent to the image service.

Name badges for a one-day event, a list of internal wiki pages, a check-in sheet: fine. Anything going on packaging, a menu, a sign or a campaign: read on.

## Trackable codes in a spreadsheet: the honest workflow

To get a QR code that can be edited after printing or that reports scans, it has to encode a short link that redirects, and the redirect service has to exist. QRly is one such service, it is free, and it is honest about a limit that matters here: **there is no bulk import**. You cannot upload a CSV and get a hundred codes back. Each link is created one at a time.

Given that, the workflow that works is:

1. Keep the spreadsheet as the source of truth: one row per destination.
2. For each row, [make a code](/create) on QRly. Paste the destination, choose a custom ending if you want the short link readable (`qrly.lol/table-12` rather than a random string), and download the SVG or PNG. Ten codes takes a few minutes; a hundred is an hour, and at that point you should ask whether you actually need a hundred distinct destinations or one code pointing at a page that handles the routing.
3. Paste the short link back into the sheet in its own column. Now you have the destination, the short link and, if you want, an `IMAGE()` formula pointing at the short link in a third column so the sheet shows what was printed. The short link is stable, so that image will not go stale even when the destination changes.
4. Keep the downloaded SVGs in a folder named after the row. Those are the files that go to print.

The point of step 3 is that the sheet stops being the generator and becomes the register. When a destination changes, you edit it in the QRly dashboard, the printed code follows within a minute, and you update the destination column in the sheet for your own records. Nothing gets reprinted. [How to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) covers what happens on the redirect side.

The account is optional for making codes but required to keep and edit them, so for a spreadsheet's worth of links, sign up first. Anonymous codes work forever but cannot be edited once you have lost the browser session that made them.

> If you need more than a couple of hundred trackable codes, or you need them regenerated automatically from a database, QRly is the wrong size of tool. It is deliberately built for a thousand or two users, not for a pipeline. Vendors with bulk generation describe their per-code pricing on their own pages; the [cost page](/cost) shows what that model looks like next to running your own.

## Getting the images out for print

Whichever route you took, the spreadsheet is not the place to print from. Cells clip images, print scaling is unpredictable, and the quiet zone is at the mercy of column widths.

| Source | Export for print |
|---|---|
| `IMAGE()` formula | Open the service URL at the largest size it allows and save the PNG. Vector is not available. |
| Excel add-in | Right-click the picture object → Save as Picture. Check whether SVG is offered. |
| LibreOffice QR object | Export the object, or the page, to PDF or SVG. |
| QRly | Download the SVG from the studio; PNG at 2048 if the destination will not accept SVG. |

Place the exported file into the layout tool at the size it will be printed, keep the quiet zone, and test-print one before running the batch. [How to print QR codes](/blog/how-to-print-qr-codes) covers the material side, and [test a QR code before printing](/blog/test-a-qr-code-before-printing) the checks.

## Frequently asked

**Is there a QR code formula in Google Sheets?**
Not a dedicated one. `IMAGE()` combined with a public QR image service URL and `ENCODEURL()` displays a code in a cell. It is static and fetched live from that service.

**Can Excel generate QR codes without an add-in?**
Microsoft 365 Excel can, with the same `IMAGE()` formula. Excel 2019 and earlier cannot; you need an add-in, a VBA routine or LibreOffice.

**Do the codes from the formula stop working?**
The codes themselves encode the URL directly, so a printed one works as long as the URL does. The images in the sheet disappear if the image service stops responding, because they were never stored in the file.

**Can I bulk-create trackable QR codes from a spreadsheet on QRly?**
No. QRly has no CSV import. You create each link individually, download it, and paste the short link back into your sheet. For a handful to a few dozen codes this is quick; for hundreds it is not the right tool.

**Can I track scans on a QR code made with the Sheets formula?**
No. It encodes the destination directly, so nothing observes the scan. Tracking needs a redirect in the middle, which is what a dynamic code is. [Free QR code tracking](/blog/free-qr-code-tracking) explains what a redirect can and cannot see.
