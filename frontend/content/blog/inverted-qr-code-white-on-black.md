---
title: Inverted QR code: white on black scans on most phones, but not on all
description: White-on-black QR codes read on modern phone cameras and fail on some older decoders. What the quiet zone must look like, and when a light panel is the safer choice.
date: 2026-09-19
category: design
keywords: inverted qr code, white qr code on black background, negative qr code, light qr code dark background, reverse qr code, white qr code, qr code dark mode
---

An inverted QR code has its colours swapped: light modules on a dark background instead of dark on light. It looks right on a black poster, a dark app screen or a charcoal business card, which is why designers keep asking for it. It also fails on a share of phones that you will never hear from, because nobody emails a company to say the code on the poster did not work.

Whether that share is acceptable depends on where the code is going. This is about how to decide, and how to make an inverted code as robust as it can be if you go ahead.

## What the specification assumes

The QR code standard, ISO/IEC 18004, describes the symbol as dark modules on a light background. The finder patterns, the timing patterns and the quiet zone are all defined in those terms. A decoder that implements the standard literally looks for a dark 7×7 finder pattern surrounded by light, and a light border around the whole symbol.

Reading an inverted code is an extension, not a requirement. A decoder that supports it typically tries the image the normal way, fails, inverts it and tries again. That second pass is what has gradually been added to camera apps and scanning libraries over the last decade. It is common now. It is not universal.

## Which scanners handle inversion

Speaking generally, because versions change and nobody publishes a compatibility table:

- **Recent iPhone and Android camera apps** read inverted codes. If your audience is people with a phone bought in the last few years, pointing the default camera at the code, inversion is mostly fine.
- **Older phones and older OS versions** may not. The camera app on a phone that has stopped receiving updates is running whatever decoder it shipped with.
- **Scanners inside other apps** are the unpredictable case. A QR scanner built into a banking app, a ticketing app, a loyalty app or a point-of-sale terminal uses whatever library its developer chose and whatever options they turned on. Some of those libraries support inversion only when a flag is set, and the flag defaults to off.
- **Dedicated hardware scanners** at events and venues vary widely. Some read inverted symbols; some are configured not to.

The pattern is that the *reader you can test with* is the most capable one, and the reader that fails is the one you cannot. That asymmetry is the whole risk.

## The quiet zone must be dark too

This is the mistake that breaks inverted codes even on phones that support them.

In a normal code, the quiet zone is a light border at least four modules wide on every side. In an inverted code, the roles swap, so the quiet zone must be **dark**. The decoder inverts the whole image and then looks for a light border. If your white-on-black code sits on a black panel that is exactly the size of the code, with the rest of the page white, the inverted image has a black frame around the symbol with a white field beyond it. The decoder cannot find the quiet zone and gives up.

So an inverted code needs the dark background to extend at least four modules beyond the modules on every side, and preferably more. On a full-bleed black poster that happens automatically. On a mostly white page with a black square for the code, it does not, and the black square must be enlarged to include the margin. The general rules are in [the quiet zone post](/blog/qr-code-quiet-zone); the only change for inverted codes is that "light" becomes "dark".

Contrast matters as much as it does the normal way round. White on black is the maximum. Pale grey on charcoal is not, and inversion already costs you a margin of tolerance, so do not spend more of it on a muted palette. The [colour rules](/blog/custom-qr-code-colours) apply with the roles swapped.

## When to accept the risk

There are situations where an inverted code is a reasonable call.

- **On a screen you control.** A dark-mode web page, a kiosk, a presentation slide, an in-store display. If it does not scan you find out immediately and change it.
- **A short-lived campaign with a known audience.** A conference badge, an event poster for a technical crowd, a launch party. Modern phones, short window, low cost of a miss.
- **A secondary code.** The inverted one is a design flourish and the same link is available in plain form elsewhere on the same surface, or as a printed URL underneath.
- **Where the alternative is no code.** A brand guideline that forbids any light panel on the artwork, a printing process that cannot lay down white ink on a dark stock. An inverted code that mostly works beats no code.

And situations where it is not:

- **Packaging, signage, anything with a long print life.** The code will outlive the phones you tested with, and you cannot reprint.
- **Anything scanned by an app rather than a camera.** Tickets, loyalty, payments, check-in. You do not control the decoder.
- **Anything where a missed scan costs money.** A menu, a checkout, a form that people will not bother to find another way to reach.

## The safer alternative: a light panel

If the artwork is dark and the code needs to be dependable, put the code on a light panel. It does not have to be white. It has to be light enough that the dark modules contrast with it, and large enough to include the quiet zone.

| Approach | Works on | Fails on | Looks |
|---|---|---|---|
| White code on dark, dark quiet zone | Recent camera apps, most libraries with inversion on | Older phones, some in-app scanners, some hardware | Integrated |
| White code on dark, light quiet zone | Almost nothing | Nearly everything | Integrated, but broken |
| Dark code on a light panel, light quiet zone | Everything | Nothing, if contrast and size are right | A panel |
| Dark code on a light brand tint | Everything, if the tint is genuinely light | Mid-tone tints | Closer to the artwork |

A pale version of the brand colour, a cream instead of pure white, a rounded panel: there is enough room to make the panel feel intentional. The post on [dark backgrounds](/blog/qr-code-on-dark-backgrounds) goes through the layout options.

## Making an inverted code in QRly

The [studio](/create) lets you set both colours independently, so an inverted code is a matter of putting the light colour in the foreground field and the dark colour in the background. Two things to know:

1. The scannability read-out will show a warning that the modules are lighter than the background and that some scanners assume dark-on-light. That warning is not a bug and it does not go away. It is the studio telling you the thing this post is telling you.
2. Set the quiet zone (the margin control) to at least the 4-module minimum, and consider 6 or more for an inverted code. The exported SVG and PNG include that margin filled with the background colour, so the dark border travels with the file. Do not crop it in the layout tool.

If you add a logo, the plate the studio draws behind it uses the background colour, so on an inverted code the plate is dark; the logo must be light enough to read on it.

Whatever you decide, [test it on paper](/blog/test-a-qr-code-before-printing) with the oldest phone you can borrow, not the newest one you own. If you only have new phones, treat the test as passed for new phones and unknown for everything else, because that is what it is.

> An inverted QR code is a bet that everyone scanning it has a decoder that tries twice. On a screen you can watch, take the bet. On a print you cannot recall, put the code on a light panel.

## Frequently asked

**Do inverted QR codes work?**
On most current phone camera apps, yes. On older phones, some scanners built into apps, and some hardware readers, no. The failures are silent, so the safe default for print is a dark code on a light panel.

**Can a QR code be white on a black background?**
It can, and it will read on a modern phone as long as the black extends at least four modules beyond the code on every side. The most common failure is a white code on a black square with a white page around it, which leaves the decoder without a usable quiet zone.

**What is a negative QR code?**
The same thing as an inverted one: light modules on a dark background. Some tools call it reversed or inverse. The decoding issue is identical whichever name is used.

**Does the quiet zone of an inverted QR code need to be black?**
It needs to be the same dark colour as the background, at least four modules wide. The decoder inverts the image and then looks for a light border; a light border in the original becomes a dark frame after inversion and the symbol is not found.

**Is there a way to have a dark design without an inverted code?**
Yes: a light panel, which can be a pale brand tint rather than white, with the standard dark code and its quiet zone inside it. It reads on every scanner and costs one rectangle of layout space.
