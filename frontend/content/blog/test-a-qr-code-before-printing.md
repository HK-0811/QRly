---
title: How to test a QR code before printing, so the print run is not the test
description: A QR code scan test that means something: print at real size, scan on iPhone and Android, at angles, in poor light, on wrinkled paper, and check the decoded URL.
date: 2026-09-19
category: design
keywords: test qr code, qr code tester, check if qr code works, qr code scan test, qr code not scanning, verify qr code, qr code checker
---

Almost every QR code that fails in the wild was tested. It was tested on the designer's monitor, with the designer's phone, held steady, at a comfortable distance, in a well-lit office. It passed. Then it was printed at a third of that size on a matte stock, put on a wall at knee height, and scanned by someone with a three-year-old phone in a corridor.

Testing a QR code means recreating the second situation, not the first. It takes about ten minutes and a desktop printer.

## Why testing on a screen tells you almost nothing

A screen is the easiest possible surface for a decoder. It is backlit, so contrast is at its maximum. The code is usually displayed larger than it will be printed. It is flat, perpendicular to the camera and evenly lit. A code that scans on a screen has passed the test that every code passes.

Print takes away all of those advantages at once. Ink spreads on paper, so modules grow and gaps shrink. The paper reflects room light unevenly. The code is smaller. It is often on a surface that curves, folds or gets scuffed. Any of those can push a code that was marginal on screen over the edge, and a code that was styled — rounded modules, a [logo](/blog/qr-code-with-logo), a [brand colour](/blog/custom-qr-code-colours) — starts closer to the edge than a plain black one.

## The test routine

Do these in order. Each one removes an advantage the screen was giving you.

### 1. Print it at the real size

Not a proof at A4 when the code will be 20 mm on a business card. Set the code at its final dimensions in the actual layout, export the artwork as it will go to the printer, and print that page. A home or office printer is fine for this; it is generally *worse* than a commercial press, which makes it a conservative test. If you have the real stock, use it. Glossy, uncoated and coloured papers all behave differently.

If the code is going to be very small or very far away, the [size guide](/blog/qr-code-size-guide) has the numbers.

### 2. Scan it with both an iPhone and an Android

The two camera apps use different decoders with different tolerances. One will occasionally accept a code the other refuses, and it is not always the same one. Use the built-in camera app on each, not a scanner app, because that is what nearly everyone uses.

If you can, add an old phone. A phone that has stopped getting OS updates is the closest thing you have to the worst-case scanner in your audience.

### 3. Scan from the real distance

A useful rule of thumb: a code scans comfortably from a distance of about ten times its width. A 25 mm code is a hand-held code. A 100 mm code works from a metre. A poster across a room needs a code measured in tens of centimetres. Stand where the reader will stand and try it.

### 4. Scan at an angle

Nobody holds a phone perfectly square to a wall. Try it from 30 degrees off to each side, and from above and below. A code with a small quiet zone or a busy surround fails at angles first, because perspective correction depends on clean finder patterns and a clean border.

### 5. Scan in poor light

Take the print into a dim room, or a room with a bright window behind the code, or under the yellow light of a bar. Contrast that looked fine at a desk shrinks fast; coloured codes and tinted backgrounds suffer most. Also try it with the phone torch on, because glossy stock under a torch produces a bright spot that can erase modules.

### 6. Bend it, fold it, scuff it

Curve the paper around a bottle or a tube if the code is going on a curved surface. Fold it once across the code if there is any chance it will be folded. Rub it with a thumb. Error correction exists for this, and [choosing the right level](/blog/qr-code-error-correction-explained) is how you buy the margin; the test is how you find out whether you bought enough.

### 7. Check the decoded URL, not just that something opened

This is the step everyone skips. The phone showed a preview and a page loaded, so the test passed. Look at what the phone actually decoded. Check the hostname. Check the path. Check that it is `https`. If it is a dynamic code, check that the short link lands on the correct final destination, in the right state — not a staging page, not a draft, not a page that requires you to be logged in.

Do this on the print, because the point is to verify the file that went to the printer. An old version of the code pasted into a layout is a common way to send the wrong URL to press.

## What to do when a test fails

Fixing a failing code is mostly a matter of putting back whatever was taken away.

| Symptom | Likely cause | Fix |
|---|---|---|
| Fails on one platform only | Styled modules, borderline contrast, inverted colours | Simplify the style; raise contrast; see [design rules that still scan](/blog/qr-code-design-rules-that-still-scan) |
| Fails at angle or distance | Quiet zone cropped or cluttered | Restore a 4-module quiet zone; clear the surround |
| Fails in low light | Low contrast, coloured or tinted background | Darken the modules; lighten the background |
| Fails when bent or scuffed | Error correction too low for the wear | Raise to Q or H; increase the physical size |
| Scans but the wrong page opens | Wrong file in the layout, or destination not set | Replace the code from the source; check the link |
| Scans but nothing opens | Destination blocked, expired or non-https | Check the link directly in a browser |

The fix for "fails on the old phone only" is the same as for everything else: bigger, plainer, more contrast, more margin.

## Dynamic codes make the test more useful

If the code is a dynamic one, the test does two extra things.

First, your test scans show up in the analytics, so you can confirm the whole pipeline, from print to redirect to destination to dashboard, before the run. On QRly a real camera scan appears with no referrer, with the device and OS the phone reported, so the iPhone and Android tests are visible separately. Test scans are counted like any other; do them before the campaign date so they sit outside the window you care about.

Second, if you discover after printing that the URL is wrong, you can [change the destination](/blog/how-to-change-a-qr-code-link-after-printing) and the printed codes follow. That is a safety net, not a substitute for the test; a code that does not scan cannot be fixed from a dashboard.

## The checklist

Copy this into the job ticket.

- Code placed in the final artwork at final size
- Printed on paper, ideally the real stock
- Scans with an iPhone camera app
- Scans with an Android camera app
- Scans with the oldest phone available
- Scans from the distance a reader will use
- Scans from 30 degrees off-axis, both sides
- Scans in dim light and with a window or lamp behind it
- Scans after bending, folding or scuffing where relevant
- Decoded URL is exactly the intended one, `https`, correct host and path
- Dynamic code lands on the correct live destination
- Quiet zone is at least four modules and not cropped by the layout
- Contrast is dark on light, or the inverted risk has been accepted knowingly
- The person signing off has scanned the print themselves

If you want to [make a code](/create) to test with, QRly exports SVG and PNG with the quiet zone included, and the studio's scannability read-out flags the design mistakes that the print test would otherwise find for you: a logo too large for the error-correction level, contrast under about 3:1, inverted colours, a margin under four modules.

> The print run is not the test. The test is the ten minutes with a desktop printer and two phones that happen before it.

## Frequently asked

**How do I check if a QR code works?**
Print it at the final size, scan it with an iPhone and an Android from the distance and angle a reader would use, in ordinary and poor light, and confirm the decoded URL is exactly the one intended. Scanning on a screen only shows that the code is valid, not that the print will read.

**Is there a QR code tester tool?**
Your phone camera is the tester that matters, because it is what the audience uses. Online checkers can confirm the code is well-formed, but they cannot see your paper, your lighting or your print size, which is where codes actually fail.

**Why does a QR code scan on one phone but not another?**
The two camera apps use different decoders. Styled modules, low contrast, inverted colours and a cropped quiet zone are the usual reasons one decoder gives up before the other. Simplify the design until both read it.

**How far away can a QR code be scanned?**
Roughly ten times the code's width is a comfortable distance for a phone camera. A 30 mm code works at arm's length; a poster across a room needs a code several hundred millimetres wide.

**Should I test a QR code on paper or on screen?**
Paper. A screen is backlit, large and flat, and hides every problem print introduces. Test on the real stock at the real size if you possibly can.
