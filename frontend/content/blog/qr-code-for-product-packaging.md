---
title: QR code on product packaging: making a code that outlives the print run
description: What a packaging QR code should link to, why it has to be dynamic and ideally on your own domain, and the print checks to run before a run of ten thousand boxes.
date: 2026-09-19
category: use-cases
keywords: qr code on packaging, product qr code, qr code for product information, qr code for product packaging, packaging qr code generator, qr code for instructions, qr code product label, qr code for warranty registration
---

A packaging run is the longest-lived print most businesses ever commission. Ten thousand boxes, printed this quarter, sold over the next eighteen months, then kept in a cupboard by the customer for years. The URL on the box has to work across all of that, and the page it opens has to be right for whoever scans it, whenever they scan it. That is a different problem from a poster, and it has a different answer.

## What the code should link to

The temptation is three codes: one for instructions, one for warranty registration, one for reordering. Resist it. A box with three codes gets zero scans because nobody reads the labels, and each extra code is another thing that can go wrong on press.

One code, one page, built for the person holding the product. In rough order of what they want:

1. **Instructions.** The setup guide, the manual as a page rather than a PDF where possible, a short video. This is the reason most people scan packaging, and it is the reason they scan it a year later.
2. **Registration** for warranty or for a first-purchase discount, if you do that. A form, not a login.
3. **Reorder.** For consumables, the product page with the exact variant pre-selected. This is where packaging codes quietly make money.
4. **Support.** A contact route that is not the main switchboard.

If the manual must be a PDF, host it on your own site and link to it. Do not link the code directly to the PDF; a page that links to it can also carry the other three items and can be changed later.

## Why static is the wrong choice

A static code encodes the destination URL itself. On a poster that is often fine; the poster comes down in a month. On packaging, the page URL will change during the life of the box more often than not:

- The product page moves when the site is rebuilt.
- The product gets a new version and the instructions page splits into v1 and v2.
- Registration moves from a form to a customer portal.
- The company is acquired, renamed, or changes domain.

Every one of those events makes a static code on ten thousand boxes wrong, and you cannot recall boxes. A dynamic code encodes a short link instead, and the short link's destination is edited from a dashboard. On QRly the redirect is a 302, the change reaches every edge in under a minute, and the code does not expire or get deactivated for inactivity, which for an eighteen-month sell-through is the property that matters most.

The short link itself is immutable once saved, by design: the hostname and slug cannot be edited because they are what is printed. The [immutability post](/blog/why-qr-code-short-links-must-be-immutable) explains why.

## Why the domain matters more than usual

A dynamic code introduces a dependency: whoever serves the redirect has to keep serving it for the life of the packaging. With a vendor's domain in the code — `qrly.lol/<slug>`, or any other generator's short host — that dependency is on the vendor.

For a flyer that is acceptable. For packaging it is the thing to fix before the print run, and the fix is a [custom domain](/blog/custom-domain-qr-code). You add `qr.yourbrand.com`, point one CNAME at the platform, and the certificate is issued for you. The code on the box then contains your hostname. If you ever change provider, self-host from the [open source repo](https://github.com/HK-0811/QRly), or bring the redirect in-house, you point that hostname somewhere else and every box already shipped follows.

The domain is also the only thing a cautious customer sees before the redirect. `qr.yourbrand.com/setup` on a box is reassuring; a random short host is a small but real friction, particularly now that QR phishing is a known problem and people are told to look at the URL.

Custom domains need an account; set one up the day before you need the SVG, not the morning of.

## Print-quality checks for packaging

Packaging presses are less forgiving than a laser printer. The checks, in the order they cause reprints:

**Size.** A code on a box is scanned from about 15 to 25 cm, hand-held. Two centimetres square is the floor; 2.5 to 3 cm is comfortable and survives a bit of ink spread. On a small label, use the short link rather than a long URL so there are fewer, larger modules to print.

**Substrate.** Corrugated cardboard and uncoated kraft absorb ink and the dots grow. Ask the printer for the expected dot gain and, if it is significant, go up a size and use a higher error-correction level. Shrink sleeves and labels on curved bottles distort the code; keep it on the flattest face, and keep it small enough that the curvature across the code is slight.

**Contrast and finish.** Dark ink on a light area of the box. Do not print the code over a photograph or a metallic panel. If the box is laminated gloss, expect glare under shop lighting and consider a matte varnish over the code area.

**Error correction.** Level M is the sensible default. Go to Q or H if the code carries a logo, if the substrate is rough, or if the product is one that gets knocked about (tools, garden products, anything sold outdoors). Higher levels make the code denser, so pair them with a larger printed size. The [error-correction post](/blog/qr-code-error-correction-explained) explains the trade.

**Logo.** A brand mark in the middle is fine within limits. QRly's studio caps the logo width to what the chosen level can absorb (up to 30% at level H) and shows a scannability read-out, and the [logo post](/blog/qr-code-with-logo) covers what the cap means in practice. On packaging, be conservative; the logo is already on the box.

**Quiet zone.** At least four modules of clear space around the code, in the background colour. Die-cut edges, fold lines and adjacent barcodes are not quiet zones. Keep it well clear of the EAN barcode.

**File.** Send the printer an SVG, never a PNG scaled up. Every QRly code exports as SVG, and the [print post](/blog/how-to-print-qr-codes) has the wording for the print brief.

**Proof.** Scan the press proof, on the actual substrate, under a shop light, with an iPhone and an Android, and then the first box off the run. A code that scans on the proof and not on the run is a dot-gain problem, and it is cheaper to find at box one than at box ten thousand.

## Retail barcodes are going 2D too

If you sell through retailers, you will hear about GS1 Digital Link and the industry move toward 2D barcodes at the till. That is a separate standard: a QR code whose URL is structured to carry the product's GTIN and possibly batch and expiry, so a point-of-sale scanner can read it as a barcode and a phone can read it as a link. QRly makes ordinary URL short links, not GS1-structured identifiers, so if your retailer requires a GS1 Digital Link on pack, that code comes from your GS1 workflow and a QRly code is an addition to it, not a replacement.

## What the scans tell you

Because every scan passes through the redirect, the dashboard shows where the product actually ends up and when it is used:

- **Country, region and city**, approximate, from the IP address. City-level, and mobile carriers mislocate, but it will show a product sold in one market being scanned in another, which is how grey-market resale tends to be noticed.
- **Language** of the scanner's browser, which is a direct signal for which translations of the instructions to prioritise.
- **Hour and weekday**, local to the scanner. Unboxing peaks are visible.
- **Unique visitors**, counted per day, so a customer who scans on setup day and again a month later counts twice. For packaging that is the right measure: repeat scans are support demand.

Nothing runs on the customer's phone, no cookie is set, and the IP address is discarded after the fields above are derived. The [privacy page](/privacy) lists every field, and the [tracking post](/blog/do-qr-codes-track-you) describes what a scan does and does not reveal, which is a fair thing to reference from your own packaging privacy notice.

## Frequently asked

**Should a packaging QR code be static or dynamic?**
Dynamic. The box will be in customers' hands for years, and the page it points at will move. A dynamic code lets you change the destination without recalling anything. Use your own domain in the code so the dependency is on a hostname you control.

**How big does a QR code need to be on a box?**
At least 2 cm square for hand-held scanning, 2.5 to 3 cm on rough or absorbent board. Use a short link so the modules are larger, and keep at least four modules of clear space around it.

**Can one code cover instructions, registration and reorder?**
Yes, and it should. Point it at one page built for the customer holding the product, with those three things on it. Three separate codes on a box get fewer scans than one.

**What error-correction level should packaging use?**
M by default; Q or H if the code carries a logo, the substrate is rough, or the product is handled hard. Higher levels need a larger printed size.

**Does a QRly code on packaging expire?**
No. There is no trial, no inactivity rule and no scan cap. You can set an expiry date yourself if a promotion on the pack should end, and remove it later.
