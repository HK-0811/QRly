---
title: QR code for a PDF: host the file, then link it so you can replace it later
description: A QR code cannot hold a PDF. Host the file on Google Drive, Dropbox or your site with the right sharing, then encode a dynamic link so it can change without reprinting.
date: 2026-09-19
category: use-cases
keywords: qr code for pdf, pdf to qr code, qr code that opens a pdf, pdf qr code generator, qr code pdf link, convert pdf to qr code, qr code for a document
---

"Convert PDF to QR code" is a search people run in good faith, and the first thing to know is that it is not a conversion. A QR code holds at most about 3 KB of text, and a phone that scans one does not know what to do with a file anyway. What a PDF QR code actually is: a code that opens a **web address**, and the web address serves the PDF.

So there are two jobs. Put the PDF somewhere on the web with a link, and make a code that opens the link. Doing the second job well means the first one can be redone later without touching the print.

## Host the PDF first

The file needs a public URL. The three common choices:

**Your own website.** Upload the PDF to your site (most CMSs have a media library) and copy its address — something like `yoursite.com/files/brochure.pdf`. This is the cleanest option: no third-party page, no login prompt, the file opens straight into the phone's PDF viewer, and you control the URL.

**Google Drive.** Upload, right-click, **Share**, and change the access from "Restricted" to **Anyone with the link**. Copy the link. This is the step people skip: a Drive link with the default sharing opens a "request access" page for everyone but you, and you find out from a customer. Open the link in a private browser window to check.

The link Drive gives you opens a preview page with a download button. That is fine on a phone. If you want the file itself, the address `drive.google.com/uc?export=download&id=<file id>` serves it directly, where the file ID is the long string in the share link; large files may show an interstitial first.

**Dropbox.** Create a shared link. The link opens a preview page; changing the `dl=0` at the end to `dl=1` makes it download the file directly instead. As with Drive, check the link in a private window.

Any of the three works. The differences that matter on a phone are whether the person sees a preview page or the document, and whether the file loads before they lose patience — which is the section after next.

## Then make the code, and make it dynamic

With the link in hand, you can make a static code that encodes it directly. That works until the PDF changes. And PDFs change: the price list, the brochure, the spec sheet, the safety data sheet, the programme. A new version is a new file, usually with a new filename and — on Drive or Dropbox — always a new share link. A static code points at the old one forever.

A dynamic code encodes a short link instead, and the short link redirects to the PDF. When the file changes, upload the new one, copy its link, and update the destination in the dashboard. Every printed code opens the new file within a minute. [Static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes) sets out the mechanics; for documents, it is the whole point.

There is a second reason. A Drive share link is around 80 characters; a Dropbox one is similar; both make a dense code that needs to be printed larger to scan reliably. A short link like `qrly.lol/brochure` is a fraction of that, and the code is correspondingly simpler — a real difference when the code goes on a business card or a product label. [Why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) has the numbers.

On QRly, paste the PDF link on [the home page](/) and download the code — no account needed for that. Sign up afterwards to keep the destination editable. There is no expiry, no scan cap and no paid plan, so a code on a document that will be reprinted for years stays live. To be clear about what QRly does not do: it **does not host files**. The PDF lives on Drive, Dropbox or your site; QRly holds the link and the code.

A habit that avoids most trouble: on Drive, upload the new version *as a new version of the same file* (right-click, **Manage versions**) and the share link stays the same. On your own site, overwrite the file at the same path. Then even the destination does not need editing — though with a dynamic code, you have the option either way.

## Make the PDF readable on a phone

The code is the easy part. The thing that decides whether anyone reads the document is what it looks like on a 6-inch screen over mobile data.

**Size.** A print-ready export with embedded high-resolution images can be 20 MB or more. On a phone, that is a spinner. Export a web or "smallest file size" version; under 2 MB is a good target, under 1 MB better. Most PDF tools have a "reduce file size" option, and re-exporting from the source with images downsampled to 150 dpi usually gets there.

**Layout.** A two-column A4 page needs pinch-zooming on a phone, and every zoom is a place to give up. If the document is being made for the code, lay it out as a single column, portrait, with type no smaller than it would be on a phone screen. If it is an existing print document, consider a phone version alongside it.

**Page count.** A phone viewer loads pages progressively but a 60-page catalogue is still a 60-page catalogue. If the code is on a product, link the product's page, not the whole catalogue. Some viewers honour `#page=12` at the end of the URL to open on a specific page, though support is uneven on mobile.

**Preview page or direct file.** A Drive or Dropbox preview page adds a tap but shows the file name and a download button, which some people prefer. A direct file link opens the viewer immediately. Test both on a phone and pick one; either is fine, and a dynamic code lets you change your mind.

**Fonts and images.** Embed the fonts (any modern export does), and do not rely on colour alone for anything that matters, because phone viewers render conservatively.

## Print and test

Export the code as **SVG** for anything going to a printer; a QR code is sharp edges, and a JPG blurs them. PNG at 1024 or 2048 pixels where a vector is not accepted. [The file formats post](/blog/qr-code-file-formats-svg-png) covers the reasoning, and [test a QR code before printing](/blog/test-a-qr-code-before-printing) is the five minutes that prevents the reprint — print the code at real size, scan it with an iPhone and an Android, and open the PDF over mobile data, not office Wi-Fi.

Size follows the scanning distance: 2 cm minimum on a flyer or leaflet read in the hand, 3–4 cm on a table card, 10 cm or more on a poster. Leave the four-module quiet zone. [The size guide](/blog/qr-code-size-guide) gives the full range.

## What the scans tell you

Because a dynamic code passes through a redirect, every scan is counted there — with no cookie and no script on the scanner's phone. For a document, the useful reads are simple:

- **Total scans** against the number of documents printed tells you whether the code is being noticed.
- **Scans by hour and weekday** tell you when — a trade-show handout's scans spike during the show and tail off over the following week.
- **Device and OS** tell you what is opening the PDF, which decides whether a 5 MB file is acceptable.
- **Country and city** (approximate, from the IP, which is then discarded) tell you where the printed document has travelled.

What is not visible is whether the person read past page one — the redirect sees the scan, not the document. [Free QR code tracking](/blog/free-qr-code-tracking) explains what is recorded, and the [privacy page](/privacy) lists every field.

## Frequently asked

**Can a QR code contain a PDF?**
No. A QR code holds a few kilobytes of text at most, and a phone would not know how to open a file from one. A PDF QR code opens a link, and the link serves the file.

**Where should I host the PDF?**
Your own website if you have one; otherwise Google Drive or Dropbox with sharing set to "anyone with the link". Test the link in a private browser window before you make the code.

**Can I change the PDF after the QR code is printed?**
With a dynamic code, yes: upload the new file, copy its link and edit the destination in the dashboard. Every printed code opens the new file within a minute. A static code points at the old link permanently.

**Does QRly host the PDF?**
No. QRly makes the short link and the code. The PDF lives on Drive, Dropbox or your site, and the short link redirects to it.

**Why does my PDF QR code open a "request access" page?**
The file's sharing is still set to restricted. On Drive, change it to "Anyone with the link"; on Dropbox, create a shared link rather than copying the address from your own browser.
