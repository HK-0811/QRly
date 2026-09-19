---
title: QR code asset tags: one code per machine, linking to its record
description: A QR code label on each asset that opens its record, manual or maintenance log, why the code must outlive the software behind it, and which label materials last.
date: 2026-09-19
category: business
keywords: qr code asset tag, equipment qr code, qr code for inventory, qr code labels for equipment, asset tracking qr code, maintenance log qr code, qr code equipment manual
---

An asset tag is a label that turns a physical object into a lookup. Someone standing at the machine scans the tag and gets the thing they need: the manual, the service history, the fault-report form, who to call. The value is entirely in that moment — a technician with the panel open, not a manager at a desk — and a QR code is the cheapest way to make that moment work.

The catch is the same one as with any label meant to last: the machine will be in service for fifteen years and the software behind the label will not. This post is about setting up tags that survive that, and about what a QR tag is and is not.

## One code per asset

The pattern: each asset gets its own dynamic QR code, with a custom ending that matches your asset number, pointing at a page for that asset.

`qrly.lol/cnc-0417`, or on your own domain, `tag.yourcompany.com/cnc-0417`. The ending is printed under the code, so the label is readable without a phone and cross-checked against the asset register by eye.

What the page holds depends on who scans:

| Scanner | What they need at the machine |
|---|---|
| Operator | Start-up procedure, safety card, the instruction video |
| Technician | Manual, wiring diagram, parts list, service history |
| Anyone | Fault-report form, pre-filled with the asset number |
| Manager | Warranty, purchase date, location, who is responsible |

The page can be a row in your asset management system, a shared document, a folder, a wiki page, a page on an intranet, or a form. QRly does not host it; QRly makes the short link and the code, and lets the destination be changed. If your asset system gives each record a URL, point the code at that. If it does not, a folder per asset in a shared drive is a reasonable start; [QR codes for PDFs](/blog/qr-code-for-pdf) covers linking to a manual stored that way.

Pre-filling the asset number into a form is done in the destination URL, not in the code: point `cnc-0417` at `yourform.com/fault?asset=cnc-0417`. The parameter lives in the destination, so the code stays small, and it can be changed if the form changes.

## Why the code must be dynamic

A static code contains the URL of the page. The label is fine until the first of these happens:

- The asset system is replaced.
- The manuals move from one shared drive to another.
- The wiki is migrated.
- The URL scheme changes in an upgrade.

Each of those is a certainty over fifteen years, and each turns every label in the building into a 404. Relabelling four hundred machines, some of them in places that need a ladder and a permit, is the cost.

A dynamic code contains a short link that redirects to the page. When the page moves, edit the destination from the dashboard; the label stays where it is, and the change reaches every scan within a minute. [Static vs dynamic](/blog/static-vs-dynamic-qr-codes) covers the mechanism, and [how to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) shows the edit.

## And on your own domain

A dynamic code on a vendor's domain has moved the dependency, not removed it. The label now works for as long as that vendor serves the redirect on its terms, and vendors change pricing, discontinue free tiers and disappear on a shorter timescale than a lathe.

The position that actually holds for fifteen years is a dynamic code whose hostname you own: `tag.yourcompany.com`, pointed at the redirect platform by one CNAME record. If the platform changes — including if QRly changes — the CNAME is pointed at whatever serves the redirects next, and every label follows. [Custom domain QR codes](/blog/custom-domain-qr-code) has the reasoning and the setup; on QRly it needs an account and costs nothing.

Once a link is saved, its hostname and ending cannot be changed, by design, because the label is assumed to be on the machine. [Why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) explains this. The destination changes freely.

QRly is free to use and [free to run](/cost), and the source is [open](https://github.com/HK-0811/QRly), so a company that wanted to guarantee the redirect layer for itself could host it. For most, owning the hostname is enough.

## Label materials

The code is only as durable as the thing it is printed on. Paper labels are for the office. For a workshop, a warehouse, a vehicle fleet or outdoors, the usual choices:

| Material | Survives | Typical use |
|---|---|---|
| Laminated vinyl | Wiping, handling, mild solvents | Indoor equipment, IT kit, tools |
| Polyester (PET) with permanent adhesive | Heat, oil, most chemicals, abrasion | Machinery, workshop, engine bays |
| Anodised aluminium, printed or laser-marked | Outdoors, UV, decades | Plant, pumps, poles, outdoor assets |
| Engraved plastic laminate | Scratching, tampering | Where the tag must not be removed cleanly |
| Tamper-evident vinyl | Removal attempts, by leaving a pattern | Audited assets |

Whatever the material, the code needs a light background and dark modules with real contrast; a code laser-marked in dark grey on dark aluminium will not scan. Size it at 2.5 cm or more, because a technician's phone is often in a dirty hand at an awkward angle. Use error-correction level H, so that a scratch, a paint splash or a corner rubbed off does not stop the read; [error correction explained](/blog/qr-code-error-correction-explained) has the trade-off.

Send the label printer the SVG so the code is rendered at the printer's own resolution; [how to print QR codes](/blog/how-to-print-qr-codes) covers the file choices. Place the tag on a flat, non-moving, reachable surface, away from heat sources, and where it will not be covered by a guard or a cable tray. Then scan it, on the machine, with a phone that has been in a pocket all day.

## Setting it up

There is no bulk import on QRly, so each link is made individually: [make a code](/create), set the custom ending to the asset number, paste the destination, download the SVG. For a workshop with forty machines that is an hour. For a site with four thousand assets, it is not the right tool, and that is worth saying plainly.

Keep the asset register as the source of truth, with the code's ending as a column. When a page moves, the register tells you which links to repoint. When an asset is scrapped, repoint its link at a "this asset has been retired" page rather than deleting it, because the label may still be on a machine in someone's yard.

There is no per-code fee and no scan cap, so the marginal asset costs nothing. Codes do not expire and are not deactivated for inactivity, which matters for a spare pump that is scanned once every three years.

## What the scans tell you

Per link, QRly records the scan time, device and OS, and approximate location. For asset tags the interesting field is simply which tags are scanned and how often. A machine whose manual is opened twice a week is either being operated by new people or misbehaving; a machine whose tag is never scanned may have a label nobody can find. The hour-and-weekday heatmap shows when the technicians are actually at the equipment, which is occasionally not when the schedule says.

Nothing runs on the scanner's phone and no IP address is stored. For a company handing phones to staff, [the privacy page](/privacy) lists exactly what is recorded.

## What a QR tag is not

A QR asset tag is a front door. It is not the asset system, and it does not replace one. It does not know where the asset is, who has it, or when it was last serviced; the page it opens does, if the page is maintained. It does not do stock counts — that is what barcodes and a scanner gun are for, and [QR code vs barcode](/blog/qr-code-vs-barcode) explains why each exists. It is not a security measure; anyone can scan it, so the page behind it should be protected by the page's own login if it holds anything sensitive.

What it is: the cheapest possible way to make "scan the thing on the machine" open the right page for fifteen years, provided the code is dynamic and the domain is yours.

## Frequently asked

**How do I make a QR code label for a piece of equipment?**
Make a dynamic QR code with a custom ending matching the asset number, point it at the asset's record or manual, download the SVG and print it on a durable label. When the record moves, edit the code's destination instead of the label.

**Can I make hundreds of asset codes at once?**
Not on QRly, which has no bulk import. Codes are made one at a time, which is fine for dozens and slow for thousands. For a very large estate, a dedicated asset platform with built-in labelling is the right tool.

**What material should an equipment QR label be?**
Polyester for machinery and workshops, anodised aluminium for outdoors, laminated vinyl for indoor kit. Dark code on a light background, 2.5 cm or larger, error-correction level H.

**What happens to the labels if the asset software changes?**
With dynamic codes, repoint each link at the new system's page from the dashboard; the labels are unchanged. With a custom domain, the labels also survive a change of QR platform.

**Is a QR asset tag secure?**
No. Anyone who can see the tag can scan it. Put the protection on the page it opens, not on the code.
