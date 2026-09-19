---
title: QR code not working? How to find out why it will not scan, in order
description: A diagnosis order for a QR code that will not scan: content and redirect first, then quiet zone, contrast, size, logo, distortion, file quality, damage and phone settings.
date: 2026-09-19
category: how-to
keywords: qr code not working, qr code not scanning, why won't my qr code scan, fix qr code, qr code expired, qr code scanner not working iphone, qr code won't scan android
---

When a QR code fails there are two separate questions, and people usually ask the wrong one first: whether the phone can **decode** the code at all, and whether what it decodes **goes anywhere useful**. The symptoms look the same to the person holding the phone, the fixes are completely different, and the second kind is more common than most guides admit.

Work through this in order. Each step rules something out before you move to the next.

## Step 1: does it decode, and to what?

Point a phone at the code. Do not tap anything. Look at what the phone shows.

- **A notification or banner with a URL appears.** The code decodes. Whatever is wrong is in the content or the destination. Go to step 2.
- **Nothing appears, or the phone hunts and gives up.** The code does not decode. Skip to step 3.
- **A banner appears but the link is not what you expected.** The code decodes, but to the wrong content. The person who made it pasted the wrong thing, or a static code was made for a URL that has since changed. There is no fix for a printed static code except a reprint; a dynamic code is fixed by changing the destination.

A decoder that shows the raw text (most camera apps do, and Chrome's scan tab does) is the tool for this step.

## Step 2: the content is fine, the destination is not

The code decodes to a URL and the URL is right, but tapping it lands somewhere wrong. This is not a QR problem; it is a link problem.

**"This link has expired", "deactivated", "upgrade to continue".** The code contains a short link on a generator's domain, and that generator has stopped serving the redirect. The usual cause is a free trial that ended, a scan cap, or an account that lapsed. The printed code cannot be changed. Your options are to reactivate the account, or reprint with a code you control. [Free QR code, no expiration](/blog/free-qr-code-no-expiration) covers how to avoid this in future.

On QRly, an expired page appears only if you set an expiry date on the link yourself; there is no trial and nothing is deactivated for inactivity. If a QRly code shows "This QR code has expired", open the link in the dashboard and clear or extend the date. The page tells the scanner the date it expired so they know it was deliberate.

**A 404 on your own site.** The destination moved. With a dynamic code, edit the destination and the fix is live everywhere in under a minute. With a static code, reprint.

**The redirect goes to the right place, then the page fails.** The page is down, blocks mobile, or requires a login. Fix the page.

## Step 3: it does not decode

Now the phone cannot read the code. Check these in order; the early ones account for most failures.

### Quiet zone

The blank border around the code. It must be at least **four modules** wide on every side, in the background colour. A code cropped tight to its edge, or placed against a border line, a photo or text, is the single most common cause of "it won't scan". The decoder uses that clear area to find the edges of the symbol. Fix: re-export with the margin, or add a clear area in the layout. [The quiet zone](/blog/qr-code-quiet-zone) explains it.

### Contrast and inversion

Dark modules on a light background, with strong contrast. Grey on white, navy on black, yellow on white, and any pastel combination fail on older cameras first. **Inverted** codes (light modules on a dark background) are read by some phones and refused by others; there is nothing you can do on the phone side. Fix: recolour, or put the code in a light panel. [Custom colours](/blog/custom-qr-code-colours) has the combinations that survive.

### Size and distance

A code that is too small for the distance cannot be resolved. The working rule is that the code should be about a tenth of the scanning distance wide: 3 cm from 30 cm, 10 cm from a metre. A dense code (long URL, high error correction) needs to be bigger than a sparse one. Fix: bigger code, or shorter content. The [size guide](/blog/qr-code-size-guide) has the table.

### Logo too big

A logo covers modules, and the code survives only if the error correction can reconstruct them. At level L that is about 7% of the code; at H, 30%. A logo that overflows the budget, or that sits on a finder pattern, kills the code. The QRly studio caps the logo to what the chosen level can carry and warns when scannability drops; other tools may not. Fix: shrink the logo, or raise the error-correction level and regenerate.

### Distortion

A QR code is square. Stretched to fit a box, skewed by a perspective effect, wrapped around a bottle, or printed across a fold, it is no longer square and the decoder's grid does not line up. Fix: lock the aspect ratio in the layout tool, keep the code flat.

### Low-resolution or JPG source

A small PNG scaled up has soft, fuzzy module edges. A JPG has compression halos around every edge. Either can push a marginal code over the line. Fix: re-export as SVG, or as a PNG large enough for the print size.

### Damage, glare and wear

Scratches, sun fading, a torn corner, a reflection from gloss laminate. Error correction handles some of this, but a damaged finder pattern (one of the three big squares) is usually fatal. Fix: reprint on matte, at a higher error-correction level if the location is rough.

### The screen it is displayed on

Brightness turned down, a dirty screen, moiré from photographing one screen with another, a code shown too small in a video call. Fix: brightness up, code bigger, hold still.

## Step 4: the phone

If the code passes all of the above and one particular phone still fails, the phone is the problem.

**iPhone.** The Camera app scans QR codes only if **Settings → Camera → Scan QR Codes** is on. It is on by default, but it can be turned off. Tap the code to make the camera focus on it. Control Centre has a dedicated Code Scanner that ignores the setting.

**Android.** Most camera apps scan natively, but manufacturers put the toggle in different places (Samsung: Camera settings → Scan QR codes). Google Lens, from the camera, the Google app or the search bar, always works.

**Any phone.** A greasy lens, a case that partly covers the camera, or an old fixed-focus camera that cannot focus at 15 cm. Move the phone further away.

**The link opens but the page does not load.** That is the network or the destination, not the scanner. Go back to step 2.

## Quick reference

| Symptom | Most likely cause | Fix |
|---|---|---|
| Phone shows nothing | Quiet zone cropped, low contrast, too small | Re-export with margin, recolour, enlarge |
| Phone hunts, then decodes slowly | Marginal size or contrast, glare | Enlarge, matte finish |
| Decodes to a "link expired" page | Generator stopped serving the redirect | Reactivate, or reprint on a service you control |
| Decodes to a 404 | Destination moved | Edit the dynamic destination, or reprint a static code |
| Works on one phone, not another | Inverted or low-contrast code, or a phone setting | Dark on light; check the camera's QR toggle |
| Worked last month, not now | Faded print, expired redirect, moved page | Scan and read the URL; then decide which |

## Preventing the next one

Almost every decode failure is caught by one habit: scan the code from the actual output, on two phones, before you distribute it. Almost every destination failure is avoided by using a dynamic code you control, so that a moved page is a dashboard edit rather than a reprint. On QRly the edit reaches every scanner in under a minute and nothing switches the link off unless you set a date. [Test a QR code before printing](/blog/test-a-qr-code-before-printing) is the checklist; [how to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) is the safety net.

## Frequently asked

**Why does my QR code scan on my phone but not on other people's?**
Usually an inverted or low-contrast colour scheme, which some cameras tolerate and others refuse, or a code that is marginal in size and your phone happens to have a better camera. Make it dark on light and larger.

**Why does my QR code say it has expired?**
The code contains a short link on a service that has stopped redirecting it, typically because a trial or plan ended. The printed code cannot be changed; the link behind it can, if you still control the account. On QRly, expiry only happens if you set a date yourself.

**My QR code is fine but the link goes to the wrong page. Can I fix it without reprinting?**
Only if it is a dynamic code. Change the destination in the generator's dashboard. A static code contains the URL itself and can only be fixed by reprinting.

**Does a logo stop a QR code scanning?**
It can, if it is bigger than the error-correction level allows or covers a finder pattern. Keep it inside the budget the generator shows and test it.

**What is the fastest way to tell whether the code or the link is broken?**
Point the camera at it and read the banner without tapping. If a URL appears, the code is fine and the link is the problem. If nothing appears, the code is the problem.
