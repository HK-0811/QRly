---
title: LinkedIn QR code: the app's built-in code versus one you actually control
description: LinkedIn generates a QR code for your profile inside its app. Here is what it does, when it is enough, and when a code you own is better on slides, badges and CVs.
date: 2026-09-19
category: use-cases
keywords: linkedin qr code, qr code for linkedin profile, linkedin profile qr code, qr code linkedin, linkedin qr code generator, linkedin qr code for business card, qr code for resume linkedin, linkedin custom url
---

LinkedIn will make a QR code for your profile in about three taps, and for showing someone your profile across a table it is exactly right. The moment the code is going onto something printed — a name badge, a CV, the last slide of a talk — the built-in code has three limits worth knowing about, and there is a five-minute alternative that removes all of them.

## What LinkedIn's built-in code does

In the LinkedIn mobile app, the icon at the right of the search bar opens a QR screen with two tabs: *My code* and *Scan*. Your code can be saved as an image or shared. When another LinkedIn user scans it with the *Scan* tab, your profile opens in their app. When anyone scans it with a normal phone camera, it opens your profile URL on linkedin.com, and the phone then does whatever it does with LinkedIn links — usually a prompt to open the app.

For the case it was designed for, that is fine. The limits appear when you print it:

- **It encodes your profile URL, fixed.** If you later want the same badge or slide to send people to a portfolio, a booking page or a company profile, the printed code cannot follow.
- **It counts nothing.** You will not know whether anyone scanned the badge at the conference, or whether the slide worked.
- **It is an image from an app.** Fine on a screen; not a vector, not sized for print, and styled in LinkedIn's colours.

None of that is a criticism. It is a feature for in-person exchange, and it does that well.

## Set your custom URL first

Before making any code, fix the URL the code will contain. A new profile has an address like `linkedin.com/in/firstname-lastname-8b1a72c9`. In the public profile settings you can change that to `linkedin.com/in/firstname-lastname` or any available slug of your choosing.

Do it before printing, because changing the custom URL later means the old address may not keep working, and you should not count on it doing so. Once it is set, that clean URL is what goes on the CV and under the code, and it is also short enough that the code has fewer modules and scans more easily.

While you are in those settings, check what a person who is not logged in sees. LinkedIn shows a sign-in prompt for some profile views to visitors without an account. A recruiter scanning from their phone almost certainly has one; a person scanning your badge at a non-tech event may not. Make sure your public profile is set to be visible, with the sections you want shown.

## Making a code you control

Paste your profile URL on [the QRly home page](/) or at [/create](/create). You get a short link and a code before any account exists. The code encodes the short link, `qrly.lol/<slug>`, which redirects to your profile with a 302.

Three things this gives you over the app's code:

1. **The destination is editable.** After the badges are printed you can point the same code at your portfolio, a calendar booking page, a company page while you are representing the company, and back to LinkedIn afterwards. Changes reach every scanner in under a minute. The [editable code post](/blog/editable-qr-code) covers the mechanics.
2. **A readable ending.** Choose the slug: `qrly.lol/jane-doe`. It goes under the code in small type, so a person who cannot scan can type it. The [custom short link post](/blog/custom-short-link-qr-code) explains why a short, readable slug also makes a better code physically.
3. **Scan data.** Total scans, unique visitors per day, hour and weekday, approximate city, device and OS, all recorded at the redirect without any script on the scanner's phone. After a conference that tells you whether the badge or the slide did the work.

Then export. SVG for anything printed; PNG at 1024 or 2048 px for a slide or a PDF.

Sign up afterwards to claim the link. That is what turns "a code" into "a code you can edit", and for a badge that will be worn at three events a year, it is the point.

## On slides

The last slide of a talk is where LinkedIn codes get the most scans and the least care. A code that fills a corner at 2 cm on a laptop screen fills about 10 cm on a projected screen, and the people scanning it are four to ten metres away. At that distance the rule of thumb — code width about a tenth of the scanning distance — asks for 40 cm to a metre.

So: make the code a quarter to a third of the slide height, centred, on a plain background, with the URL in large type under it. Leave it up while you take questions. People will not scan a code that is on screen for four seconds. The [Word and PowerPoint post](/blog/insert-a-qr-code-in-word-powerpoint-and-canva) covers inserting the SVG so it stays sharp when projected.

If the talk is recorded, the code on the recording keeps working, and because the destination is editable it can point at the slides or the paper later instead of your profile.

## On name badges

A conference badge is scanned from about 20 cm, by someone standing in front of you, often in poor light, while you are both holding a drink. Two centimetres square is the floor; 2.5 cm is kinder. Use the short link rather than the full LinkedIn URL so the code has fewer, larger modules. Dark on light, with a clear border of at least four modules.

Badges printed by the event organiser sometimes carry the organiser's own code on the front, for their lead-scanning app. Yours goes on the back or on a lanyard card. The [trade show post](/blog/qr-codes-for-trade-shows-and-conferences) covers what the organiser's code does and does not do for you.

If your badge or business card carries one code, the question is whether it should point at LinkedIn at all. For many people a [business card code](/blog/qr-code-for-business-card) should open a small page with LinkedIn, email and a booking link on it. Because the destination is editable, you can start with LinkedIn and change your mind once the cards exist.

## On a CV

A code in the header of a CV, next to the LinkedIn URL in text, is now common and harmless. Two things to get right. Size: 2 cm, because the CV will be printed at A4 and scanned from a desk, and also viewed as a PDF on a screen where it will be scanned from a laptop display at arm's length. Position: top right, clear of the margin and of any coloured header band, with the quiet zone intact.

Applicant tracking systems do not read QR codes, so the URL must also be there as text. The code is for the human who has the printout. The [CV post](/blog/qr-code-on-a-resume) covers the rest, including why the code should point at something you control if the application is for a role where the portfolio matters more than the profile.

## Reading the scans

The numbers from a LinkedIn code are small and that is fine. What they tell you:

- **Which placement worked**, if the badge, the slide and the CV each have their own slug pointing at the same profile. Three links cost nothing extra.
- **When**: hour and weekday in the scanner's local time. Scans clustered in the hour after your talk are the talk; scans spread over the following week are the CV.
- **Where**, approximately. City-level from the IP address, and mobile carriers mislocate, so treat it as which city, not which room.
- **Referrer**: none means a camera scan; a referrer means someone clicked the short link from wherever you also posted it.

Unique visitors are counted per day, and nothing is stored that identifies a person; the IP address is discarded after the geo fields are derived. The [privacy page](/privacy) lists every field.

## Frequently asked

**Does LinkedIn have its own QR code?**
Yes. In the mobile app, the QR icon in the search bar shows your code and a scanner for other people's. It encodes your profile URL and cannot be edited or tracked, which is fine for in-person use and limiting for print.

**Can I make a LinkedIn QR code that I can change later?**
Yes. Make a dynamic code that encodes a short link to your profile. On QRly the destination is editable from the dashboard after printing, so the same badge or slide can later point at a portfolio or booking page.

**What size should a LinkedIn QR code be on a name badge or CV?**
About 2 cm square, with a clear border, using a short link so the code is not dense. On a projected slide, make it a quarter to a third of the slide height.

**Should I set a custom LinkedIn URL before making the code?**
Yes. Set `linkedin.com/in/yourname` in the public profile settings first, then make the code. Changing the URL after printing may break the address, and the short form is easier to type under the code.

**Will people without a LinkedIn account see my profile?**
Sometimes with a sign-in prompt. Check your public profile visibility settings, or point the code at a page you control that links to LinkedIn along with your other contact details.
