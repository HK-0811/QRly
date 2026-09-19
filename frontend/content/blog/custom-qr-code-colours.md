---
title: Coloured QR codes — which custom colours scan and which quietly do not
description: A phone camera reads a QR code in greyscale, so colour only works when the foreground stays much darker than the background. Which brand colours pass and which fail.
date: 2026-09-19
category: design
keywords: colored qr code, custom qr code colour, qr code color generator, coloured qr code, red qr code, blue qr code, qr code colours, qr code contrast, brand colour qr code
---

A QR code does not have to be black on white. It does have to look black on white to a camera that has thrown the colour away, which is what every decoder does in its first step. Get that one idea straight and most of the colour advice on the internet collapses into a single rule: **the foreground must be much darker than the background, and the camera decides what "darker" means, not you.**

## What the camera actually sees

A phone camera captures a colour image, and the decoder immediately converts it to greyscale and then to pure black and white by picking a threshold. Every pixel above the threshold becomes light, every pixel below becomes dark. Hue never enters into it. A red module and a green module of the same brightness are, to the decoder, the same module.

This is why the QR specification talks about reflectance rather than colour: dark modules should reflect much less light than light modules. Two colours that look vivid and different to a person can be nearly identical in brightness, and a code built from them is a grey square to the phone.

The cheapest test is to do what the decoder does. Take a screenshot of the code and desaturate it in any image editor. If the result still looks like a crisp dark code on a light background, the colours are fine. If it has gone muddy, no amount of squinting at the colour version will save it.

## Colours that work

The safe pattern is a dark, saturated foreground on a white or very pale background.

| Foreground | On white | Notes |
|---|---|---|
| Black, charcoal, near-black | Works | The baseline; nothing beats it. |
| Navy, dark blue, royal blue | Works | Blues are dark to a camera even when they look bright. |
| Dark green, forest, bottle green | Works | Avoid lime and mint, which are light. |
| Deep red, maroon, burgundy | Works | A pure bright red is borderline; darken it. |
| Dark purple, aubergine, indigo | Works | |
| Dark brown | Works | |
| Orange | Usually fails | Orange is light in greyscale. |
| Yellow, gold | Fails | Yellow is nearly white to a camera. |
| Pink, pastels, light grey | Fails | |
| Cyan, light blue, teal | Borderline | Depends on how dark the tint is; test it. |

For backgrounds the list is shorter. White is best. Cream, ivory and very pale tints of almost any colour are fine. Pale yellow is fine, because it is light. Mid-tones are where it goes wrong: a mid-grey, a sky blue or a salmon background eats half the contrast before the foreground has done anything.

If you want a number rather than a table, a WCAG contrast checker is a reasonable proxy, because it computes the same luminance difference a decoder depends on. It is a proxy, not a spec: the QR standard does not set a ratio. But a foreground and background pair that fails the checker's text threshold will not fare well as a QR code either, and a pair that passes comfortably almost always scans.

## Colours that do not

**Inverted codes.** Light modules on a dark background is the single most common colour mistake. Some phones handle it, many older ones do not, and the ones that do not fail silently. If you have a dark design to fit, the answer is a light plate behind the code, not a light code; the details are in [QR codes on dark backgrounds](/blog/qr-code-on-dark-backgrounds) and [white-on-black QR codes](/blog/inverted-qr-code-white-on-black).

**Gradients across the modules.** A gradient from navy to teal looks good in a mock-up and means that one end of the code is dark and the other end is borderline. The decoder picks a single threshold for the whole image; the light end of the gradient sits on the wrong side of it. A gradient that stays entirely within dark tones can survive; one that runs into anything you would not use as a solid foreground will not.

**Two foreground colours that are not both dark.** Colouring the finder patterns differently from the data modules is fine as long as both colours pass the greyscale test individually. Colouring the finders in a brand red and the data in a pale grey does not.

**Transparent backgrounds over anything.** A code with a transparent background is only as good as whatever it lands on. The quiet zone has to be the light colour too, and it is easy to lose that when the code floats over a photograph. See [transparent background QR codes](/blog/transparent-background-qr-code).

**Foreground and background swapped by a designer.** It happens more than you would think when a code is dropped into a dark-themed layout and someone "fixes" it. Send the finished artwork through the greyscale test one last time.

## Using a brand colour

Most brand palettes have one dark colour in them, and that is the one to use for the modules. If the primary brand colour is bright (a red, an orange, a yellow), the honest options are:

- **Darken it.** A red at 60% of its brightness still reads as the brand's red next to the logo, and scans. A print shop can hold that in CMYK far more reliably than a bright red anyway.
- **Use it in the logo, not the modules.** A black or navy code with the brand mark in its true colours in the centre is the pattern most large brands land on. The logo rules are in [QR codes with a logo](/blog/qr-code-with-logo).
- **Use it as a pale background.** A tint of the brand colour at 10 to 15% behind dark modules keeps the association without touching contrast.

What does not work is insisting the modules be bright yellow because the brand is bright yellow. The camera will win that argument every time.

Print shifts colours too. Screens show RGB; presses print CMYK; a rich navy on screen can print as a lighter, purpler blue. If the code is going to press, ask for a proof, or specify a colour build that is unambiguously dark, and keep black as the fallback.

## Setting colours in QRly

The QR studio has a foreground picker and a background picker. Both accept any colour, and the scannability read-out drops when the pair no longer has enough contrast, which is the greyscale test done for you. Rounded and dot modules, finder shapes and a logo all sit on top of whichever colours you choose.

Export as **SVG** if the code is going to a designer or a printer: the colours are plain fills in the file and can be adjusted later without regenerating anything. Export **PNG** at 1024 or 2048 px for social posts, slides and anywhere that will not accept SVG. Neither carries a watermark, and [making a code](/create) needs no account. Because every QRly code is a dynamic short link, the destination can be changed from the dashboard after the coloured version is printed.

## Test from print

Colour is where screen tests mislead most. A monitor is backlit, so even a marginal pair looks fine; paper reflects, and reflected colours are duller. Print the code on the stock it will actually use, then scan it with an iPhone and an Android, at an angle, under the lighting the reader will have. If either phone hesitates, darken the foreground and try again. The full checklist is in [how to test a QR code before printing](/blog/test-a-qr-code-before-printing), and colour is one of the eight [design rules that keep a code scannable](/blog/qr-code-design-rules-that-still-scan).

## Frequently asked

**Can a QR code be any colour?**
The foreground can be any colour that is dark in greyscale, and the background any colour that is light. Navy, dark green, maroon and charcoal on white all scan; yellow, orange and pastels as the foreground do not, because a camera converts the image to greyscale before decoding.

**Does a red QR code work?**
A deep red or maroon on white works. A bright, pure red is borderline because it is lighter than it looks; darken it slightly, or use the bright red in a centre logo and keep the modules dark.

**Can the QR code be white on a coloured background?**
This is an inverted code, and it fails on a meaningful share of phones. Put a white plate behind a dark code instead. The quiet zone needs to be light as well, so the plate must extend at least four modules beyond the code on every side.

**Can I use a gradient in a QR code?**
Only if every colour along the gradient would pass on its own as a solid foreground. A gradient from one dark tone to another usually survives; one that lightens towards a bright colour usually does not, because the decoder thresholds the whole image at once.

**Does colour affect error correction?**
Not directly, but weak contrast eats the same tolerance that error correction provides for print damage and camera noise. A coloured code with a logo is spending that tolerance twice, so keep the colours clearly dark on light and use level H.
