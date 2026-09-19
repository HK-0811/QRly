---
title: Rounded and dot QR codes — what module shape does to scannability
description: Square, rounded and dot modules all decode, but dots only when they touch. How a decoder reads modules, why gaps fail at poster size, and which finder shapes are safe.
date: 2026-09-19
category: design
keywords: rounded qr code, dot qr code, circle qr code, qr code with round corners, dotted qr code, qr code module shape, qr code eye shape, qr code finder pattern
---

A QR code made of dots looks softer than one made of squares, and most phones read it just as well. Most is the operative word. Module shape is one of the few design choices where a code can pass every test on a screen and fail on a poster, and the reason is geometric rather than mysterious. This is what the decoder actually does with a module, and what that means for each shape.

## How a decoder reads a module

The decoder does not look at modules as shapes. It finds the three finder patterns, uses them and the timing patterns to work out where the grid lines fall, and then samples the image at the centre of each grid cell. If the sample is dark, the module is a 1; if light, a 0. The edges of the module are never examined directly.

That single fact explains most of the tolerance. A rounded square, a circle or a diamond that fills its cell all have a dark centre, and the decoder cannot tell them apart. It also explains the failure mode: anything that makes the centre of a cell ambiguous, or that breaks the runs the decoder relies on to find the grid in the first place, is a problem regardless of how the module looks.

Two structures do depend on runs rather than centres. The finder patterns are located by scanning for a dark-light-dark-light-dark sequence in the ratio 1:1:3:1:1, and the timing patterns (the alternating rows between the finders) are used to count modules across the grid. Gaps introduced inside those runs make them look like more transitions than they should have.

## Rounded modules

A rounded module is a square with its corners radiused. At a small radius it is a softened square; at a radius of half the module width it is a circle. Adjacent rounded modules still share their full edge along the flat part, so runs of dark modules stay connected and the finder patterns keep their proportions.

This is the safest of the styled shapes. The only thing to avoid is combining a large corner radius with a shrunk module, which produces the same gaps as dots. QRly's round modules keep the full cell size and only radius the corners, so they behave as squares to the decoder.

## Dot modules, and why they must touch

A dot module is a circle inscribed in the cell. At a radius of exactly half the module width, each dot is tangent to its four neighbours: they touch at a single point. Along a row of dark modules, that means an unbroken chain, and the decoder's runs survive, if only just.

Shrink the dots at all, and a gap opens between every pair. Whether that gap matters depends on the render size, which is the part that catches people out.

- **On a phone screen or a small print**, the camera's own blur and the printer's ink spread fill the gaps. Neighbouring dots smear into a continuous run, the centre of each cell is dark, and the code reads perfectly.
- **On a poster or a large sign** viewed from close enough to resolve individual dots, the gaps become real light pixels between real dark ones. A run of seven dark modules in a finder pattern turns into seven dark blobs with six light slivers, the 1:1:3:1:1 ratio is no longer found, and the phone does not even recognise the code.

So a dot code that scans from your laptop at 300 pixels wide is not evidence that it scans at a metre wide. It is evidence that blur was doing the work. This is why QRly's dot modules are drawn at full radius, tangent to their neighbours, and why the studio does not offer a slider to shrink them. Smaller gaps look more elegant in a mock-up and fail on larger renders, and there is no good print size at which that trade pays off.

There is a second, quieter cost to dots: they contain less ink. A grid of tangent circles covers about 79% of the area that squares would, so at distance the code reads as a lighter grey to the camera and contrast drops. Dots in a strong dark colour on white are fine; dots in a marginal colour on a tinted background are asking for trouble twice. Colour limits are in [custom QR code colours](/blog/custom-qr-code-colours).

## "Circle QR codes"

A frequent request is a QR code that is itself circular. There is no such symbol. The data grid is square, and trimming the corners off it to fit a circle removes real modules. Corner modules include parts of the finder patterns, so the trimmed code is not slightly damaged, it is unreadable.

What people usually want is achievable another way: keep the square symbol intact, round the modules, and set the code inside a circular badge or frame whose inner diameter is at least the symbol's diagonal plus the quiet zone. The circle is decoration outside the code, not a crop of it. The margin rules are in [the QR code quiet zone](/blog/qr-code-quiet-zone).

## Finder (eye) shapes

The finder patterns are the one part of the code you must not damage, but their shape has a little freedom because the decoder checks proportions along lines through the centre rather than the outline. Three styles are common and all three work:

| Style | What changes | Safe because |
|---|---|---|
| Square | Nothing; the spec default. | The reference. |
| Round | Outer ring and inner block get rounded corners, or become circles. | Any line through the centre still crosses dark-light-dark-light-dark at 1:1:3:1:1. |
| Ring | Outer ring drawn as a circle, inner block as a circular dot. | Same ratio holds through the centre; concentric circles are still concentric. |

What breaks a finder pattern: hollowing out the inner block, drawing the outer ring thinner than one module, making the inner block smaller than three modules, replacing it with a letter or icon, colouring it lighter than the data modules, or covering part of it with a logo. Every one of these changes the ratio the decoder is scanning for, and no amount of error correction helps because the decoder never reaches that stage. That rule and the others are collected in [QR code design rules that still scan](/blog/qr-code-design-rules-that-still-scan).

Keep all three finders the same style. Mixing them is not a decoding problem, but a human checking the artwork will assume something went wrong.

## When to use which

| Situation | Module | Finder |
|---|---|---|
| Small print (business card, label, packaging under 3 cm) | Square or round | Square or round |
| Screen use (slides, web, social) | Any | Any |
| Large print (poster, banner, signage) | Square or round; dots only at full radius | Square or round |
| Marginal contrast or a coloured background | Square | Square |
| Code with a logo at level H | Square or round | Square or round |
| Textured or absorbent stock (uncoated card, fabric) | Square | Square |

The pattern is simple: the more the print or the colours are already spending tolerance, the closer to plain squares the modules should stay.

## Doing it in QRly

The QR studio offers **square, round and dots** for modules and **square, round and ring** for the finder patterns. Dots are rendered tangent, round modules keep their full cell, and the finder variants keep the 1:1:3:1:1 ratio. Combine them with colour and a logo, and the scannability read-out reports when the combination has gone too far.

Export **SVG** for anything printed: the shapes are real vector paths, so a dot code at poster size is a clean tangent circle rather than an upscaled blur. PNG at 1024 or 2048 px is available for everything else. [Make a code](/create) without an account; because it is a dynamic short link, the destination can change later without reprinting the shaped design. Then confirm it on paper, following [how to test a QR code before printing](/blog/test-a-qr-code-before-printing).

## Frequently asked

**Do rounded QR codes scan as well as square ones?**
Yes, when the rounded modules keep their full size and only the corners are radiused. The decoder samples the centre of each module, and rounded corners do not change what it finds there.

**Why does my dot QR code scan on screen but not on the poster?**
On a small render the camera's blur fills the gaps between undersized dots. On a large print the gaps are resolved as light pixels, the runs the decoder relies on are broken, and the finder patterns are not recognised. Use dots drawn at full radius so they touch, or switch to round modules.

**Can I make a QR code that is a circle?**
Not the symbol itself, which is a square grid. Cropping it into a circle removes corner modules, including parts of the finder patterns. Put the square code inside a circular frame instead, with the quiet zone inside the frame.

**Which finder pattern shape is safest?**
Square, then round, then ring, but all three work if the dark-light-dark-light-dark proportions through the centre stay at 1:1:3:1:1. Do not hollow the centre, thin the outer ring or cover any part of a finder with a logo.

**Should I use dots on a code with a logo?**
Preferably not both at once. The logo spends error correction, and dots lower the code's average contrast. Either alone is fine; together they leave less margin for print and lighting than most people want.
