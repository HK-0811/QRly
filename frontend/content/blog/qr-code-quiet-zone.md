---
title: The QR code quiet zone — why the margin matters and how much you need
description: The QR spec asks for a blank border of four modules on every side. What it does for the decoder, what happens when you crop it, and where frames and captions belong.
date: 2026-09-19
category: design
keywords: qr code quiet zone, qr code margin, qr code border, white space around qr code, qr code padding, qr code white border, qr code frame, qr code spacing
---

The blank border around a QR code is not padding. It is part of the symbol, the specification defines its width, and the decoder depends on it. It is also the part of the code that gets deleted most often, because it looks like empty space and empty space is what layout tools are designed to remove. This is what the quiet zone is for, how wide it must be in the units that matter, and what belongs outside it.

## What the specification says

ISO/IEC 18004, the standard that defines QR codes, specifies a quiet zone of **four modules** on every side of the symbol, in the light (background) colour. A module is one cell of the grid, the small square that makes up the code, so the quiet zone is defined relative to the code's own resolution rather than in millimetres or pixels.

Four modules is a minimum, not a target. More is harmless. Less is where the trouble starts.

## What the decoder uses it for

A decoder begins by searching the image for the three finder patterns, the concentric squares in the corners. It looks for lines of pixels that go dark, light, dark, light, dark in the ratio 1:1:3:1:1. The outermost dark ring of each finder pattern is the first "dark" in that sequence, and to recognise it as the start of the pattern, the decoder needs to see light before it.

That light is the quiet zone. If a black frame, a line of text, a photograph or another code sits directly against the edge, the outer ring merges with it. The run is no longer one module of dark followed by one of light; it is some unknown width of dark, and the ratio does not match. The decoder never finds the finder pattern and never gets to the stage where error correction could have helped.

The quiet zone also lets the decoder establish where the symbol ends, which it needs to map the grid. And when the code sits on a busy background, the zone is the only thing separating real modules from things that merely look like modules.

## What happens when you crop it

Modern phone decoders are more tolerant than the specification requires. Many will read a code with a two-module margin, some with one, and a few will read a code with none as long as the surroundings happen to be light. That tolerance is why cropping usually seems to work when the designer checks it on their own phone.

It stops working in a pattern that is hard to see from the desk:

- **Older or cheaper phones fail first.** Their decoders and cameras are the least forgiving, and their owners will not report the failure; the camera simply shows nothing.
- **Dark surroundings fail before light ones.** A cropped code on white paper often survives; the same code set directly into a dark box, a coloured band or a photograph does not.
- **Angles and distance make it worse.** Perspective and blur spread the dark surroundings into the edge of the code, so a margin that was marginal head-on becomes nothing from the side.
- **Print makes it worse again.** Ink spread and registration errors on a press eat into a thin margin from the outside.

The practical rule: assume the margin you can see on screen is roughly half the margin the worst phone will see in the field, and keep the full four modules so that halving it still leaves something.

## Modules, not millimetres

Because the quiet zone is measured in modules, its physical size depends on how many modules the code has and how large it is printed. Three examples make the arithmetic concrete:

| Code | Modules across | Printed width | Module size | Quiet zone each side |
|---|---|---|---|---|
| Short link, version 2 | 25 | 25 mm | 1.0 mm | 4 mm |
| Short link, version 3 | 29 | 50 mm | 1.7 mm | 7 mm |
| Long URL, version 6 | 41 | 50 mm | 1.2 mm | 5 mm |

Two things follow. First, a code with fewer modules has larger modules at the same size, which is one more reason [short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes). Second, "leave 5 mm around it" is not a rule that transfers between codes; the layout needs to know the module count, or simply use the margin that the generator already exported.

A QRly export includes the quiet zone in the file. A 2048 px PNG of a 25-module code is 33 modules wide including the margin, so each module is about 62 px and the margin about 248 px on each side. If the layout tool shows a code with no white edge around it, someone has cropped it.

## Frames, captions and "scan me"

Frames, call-to-action labels and captions are useful. They tell a reader what the code is for, and a reader who knows what they will get is more likely to scan. They belong **outside** the quiet zone, without exception.

- **A frame** goes around the quiet zone, so its inner edge is the outer edge of the four-module margin, not the edge of the code. A dark frame with the code sitting directly inside it is the single most common way a professionally designed code fails.
- **A caption** ("Scan for the menu") goes below or beside the frame. Text is dark, thin and busy, exactly the kind of thing that confuses finder detection when it touches the code.
- **A logo** belongs in the centre of the code, paid for with error correction, and never in a corner or against an edge. The mechanics are in [how to add a logo to a QR code](/blog/qr-code-with-logo).
- **Other codes** need their own quiet zones. Two codes side by side need eight modules between them, four from each.

If the design leaves no room for a frame plus the margin, the answer is a smaller frame or no frame, not a smaller margin.

## Dark and coloured backgrounds

The quiet zone must be the background colour of the code, which means the light colour. A dark code on a white plate on a dark poster is fine as long as the plate extends at least four modules beyond the code on every side. A dark code dropped straight onto a navy background with a transparent margin has no quiet zone at all, even if the file technically contains one, because the "margin" is navy.

That is the trap with transparent exports. The transparency lets whatever is behind the code become the margin, and if that is anything other than a light, plain colour, the zone is gone. See [transparent background QR codes](/blog/transparent-background-qr-code) and [QR codes on dark backgrounds](/blog/qr-code-on-dark-backgrounds) for how to handle both.

## The margin in QRly

The QR studio has a margin control with a **minimum of four modules**. You can widen it; you cannot go below the specification. The margin is rendered into both the SVG and the PNG exports in the background colour you chose, so what leaves the studio is a valid symbol.

What happens after that is the layout tool's business. When placing the file in a design, do not crop to the modules, do not mask the code with a shape that cuts the margin, and do not set a frame's inner edge inside it. If a designer needs the code to fit a fixed box, scale the whole file including its margin, which SVG does without loss.

Then print it and scan it. A margin problem is easy to catch from paper and hard to catch on screen, and the two-phone routine in [how to test a QR code before printing](/blog/test-a-qr-code-before-printing) takes a couple of minutes. The quiet zone is the first of the [eight design rules that keep a code scannable](/blog/qr-code-design-rules-that-still-scan), and it is first for a reason.

## Frequently asked

**How much white space does a QR code need?**
Four modules on every side, in the background colour, where a module is one cell of the code's grid. For a 25-module code printed 25 mm wide, that is a 4 mm margin. More is fine; less is where failures start.

**Can I put a border around a QR code?**
Yes, outside the quiet zone. The border's inner edge should sit at least four modules from the code's edge. A border drawn directly against the modules merges with the finder patterns and stops many phones from recognising the code.

**My QR code scans without a margin. Why does it matter?**
Your phone, your lighting and your angle are a best case. Older phones, dark surroundings, perspective and print ink spread all consume margin, and the readers who fail will not tell you. The four modules are there to cover the cases you cannot test.

**Does the quiet zone have to be white?**
It has to be the same light colour as the code's background. White is the usual choice. A pale tint is fine if the code's background is that tint. A dark or transparent margin over a dark surface is no margin at all.

**Does QRly include the quiet zone in the download?**
Yes. The margin control in the studio has a four-module minimum and the margin is rendered into both SVG and PNG exports. If the placed code shows no light edge in your layout, it has been cropped after export.
