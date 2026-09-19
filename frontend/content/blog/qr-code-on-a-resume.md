---
title: QR code on a resume: when it helps, when it is a gimmick, how to do it
description: A QR code on a CV earns its space only if it leads somewhere a hiring manager cannot reach in one click. What to link, how small to print it, and why to make it dynamic.
date: 2026-09-19
category: use-cases
keywords: qr code on resume, resume qr code, cv qr code, qr code for portfolio, qr code on cv, linkedin qr code resume, should i put a qr code on my resume
---

Whether to put a QR code on a resume is a question with an honest answer: usually no, sometimes yes, and the difference is entirely about where the code goes and who is holding the paper. A code that opens your LinkedIn profile, printed on a PDF that nobody will ever print, is decoration. A code on a CV handed across a table at a careers fair, opening a portfolio that would otherwise need a typed URL, is doing real work.

This article is about telling those two cases apart, and then doing the second one properly.

## When a QR code on a CV helps

The code helps when all three of these are true.

**The CV will exist on paper.** Careers fairs, interviews where you bring a copy, networking events, industries that still print. A recruiter reading a PDF on a laptop cannot scan it without picking up a phone, and will click the hyperlink instead. On a screen, the printed URL beside the code is what does the work; the code is inert.

**The destination is worth a visit.** A portfolio of design work, a GitHub profile with real projects, a short video introduction, a research page, a personal site that goes beyond the CV. These are things a reader would want to see and cannot see from the paper. A link to LinkedIn is weaker: most readers already have LinkedIn open and will search your name in the time it takes to lift a phone. The [LinkedIn QR code article](/blog/qr-code-for-linkedin-profile) covers when that one does earn its place.

**The URL is awkward to type.** `github.com/yourname` is not. `yourname.design/work/2026-brand-system` is. A code justifies itself in proportion to how annoying the alternative is.

Fields where it tends to land well: design, front-end and creative development, photography, architecture, video, UX, anything with a portfolio. Fields where it tends to look odd: law, finance, medicine, most public-sector roles, and anywhere the reader is an applicant-tracking system first and a person second. An ATS ignores the image entirely; it neither helps nor hurts parsing, but it does take space you could spend on a line of text the ATS can read.

## When it looks like a gimmick

A few signals reliably mark the code as a gimmick rather than a tool.

- It is large. A code that is bigger than your name is asking for attention it has not earned.
- It has a logo, colours or rounded modules. On a resume the code is a utility, and styling it draws attention to the styling.
- It links to something the reader could reach in one click anyway, or to your email address.
- There is no printed URL next to it, so the screen reader (the human kind) has no alternative.
- There are two of them.

The rule that survives all of this: one code, small, plain, in the header, next to the URL it encodes, pointing at one thing that is worth the trip.

## What to link: one thing

Pick one destination. If you have several things worth seeing, link to a single page that lists them: portfolio, GitHub, a two-minute video, a downloadable PDF of the CV itself. A page you control is also the easiest thing to update, which matters in the next section.

Do not link to a `mailto:` address or a phone number. The reader has both in the header already, and a code that opens a mail app on a recruiter's phone during a fair is an interruption, not a convenience. Do not link to a file that requires a login, a Drive file that is not shared publicly, or a portfolio platform's page that shows other people's work in the sidebar. Open it in a private browser window and check what a stranger sees.

## Make it dynamic, because the CV is already sent

A resume has an unusual property: it is out of your hands the moment it is sent, and it keeps circulating. The copy you handed over in March is in a drawer; the PDF is forwarded internally. The portfolio it points to, meanwhile, changes.

A **static** code encodes the URL directly, and if the portfolio moves, the project you were proudest of is replaced, or the domain lapses, every copy in circulation points at the wrong thing. A **dynamic** code encodes a short link that redirects to the destination, and the destination can be changed after sending. On QRly you paste the URL, get a short link like `qrly.lol/yourname` (you choose the ending), and the code encodes that. [Edit the destination](/blog/editable-qr-code) later and every printed and emailed copy follows within a minute. It is free, there is [no paid plan](/cost), and the code does not expire.

What this lets you do in practice:

- **Fix a broken link** after the CV has gone out, which happens more often than anyone admits.
- **Lead with a different project** for a different kind of application, without regenerating the document.
- **Retire the link** when you have the job. QRly lets you set an optional expiry date on a link, after which scans see an expired page rather than your portfolio. A CV in a drawer from four years ago can stop pointing at the work you did at 22.
- **See whether anyone scanned it.** QRly counts scans at the redirect, with country, city, device and time, and no script on the scanner's phone. Read this loosely: a scan tells you someone looked, not who or whether they liked it, and unique counts are per day. But "the code on the careers-fair copies was scanned nine times on Thursday" is worth knowing.

The [custom short link article](/blog/custom-short-link-qr-code) explains the choice of ending; a slug that is your name looks better than a random one when the URL is printed beside the code.

## Print details

- **Size.** Between 1.5 and 2 cm square is enough at reading distance, which is the only distance a CV is read at. Do not go below 1.5 cm on a laser printer; below that the modules start to fill in. The [size guide](/blog/qr-code-size-guide) covers the reasoning.
- **Plain.** Black modules, white background, square modules, no logo. Error correction level M is fine on clean office paper.
- **Quiet zone.** Four clear modules on every side. Do not butt the code against a border, a photo or the edge of a coloured header block.
- **Placement.** Top right of the header, or the end of the contact line, with the URL beneath it in small type. Never in the margin where a stapler or a hole punch lands.
- **Format.** Export SVG and place it in Word, Google Docs, InDesign or Canva; the [insertion guide](/blog/insert-a-qr-code-in-word-powerpoint-and-canva) walks through each. When you export the CV to PDF the vector survives. A PNG at 1024 px is acceptable if the tool refuses SVG.
- **Test the PDF and the print.** Scan the code from the printed page and from the PDF on a screen, with an iPhone and an Android. The [testing checklist](/blog/test-a-qr-code-before-printing) takes two minutes and prevents the one failure mode that matters.

If the CV is also going out as a PDF only, keep the hyperlink on the URL text. The link is what a screen reader uses; the code is what the paper reader uses.

## Frequently asked

**Should I put a QR code on my resume?**
Only if the CV will exist on paper and the code leads to something worth seeing that is awkward to type, such as a portfolio. For a PDF-only application, a plain hyperlink does the same job better.

**What should a resume QR code link to?**
One thing: a portfolio, a GitHub profile with real projects, a short introduction video, or a single page that lists them. Not your email address and not LinkedIn unless there is a specific reason.

**How big should the QR code on a CV be?**
About 1.5 to 2 cm square, black on white, with a clear margin, in the header beside the printed URL. Larger than your name is too large.

**Can I change the link after I have sent the CV?**
With a dynamic code, yes. On QRly the code contains a short link whose destination you edit from the dashboard, and every copy already in circulation follows within a minute. A static code cannot be changed.

**Will an applicant tracking system read the QR code?**
No. An ATS ignores images. The code neither helps nor harms parsing, but the printed URL next to it will be read as text, so keep that.
