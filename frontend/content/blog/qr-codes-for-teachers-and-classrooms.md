---
title: QR codes for teachers: worksheets, quizzes and newsletters without accounts
description: Practical ways to use QR codes in a classroom, how to make them free with no student accounts, and what to check about tracking before a child scans one.
date: 2026-09-19
category: use-cases
keywords: qr codes for teachers, qr code classroom, qr codes in education, qr code worksheet, qr code for students, classroom qr code generator, qr code google form quiz, school qr codes
---

A QR code in a classroom solves a specific, tedious problem: getting thirty children to the same web page without thirty attempts at typing a URL. That is the whole pitch. Everything else is a consequence of it working, which it does, provided the code is made with a generator that does not expire it, put a tracker on a child's device, or ask the child to sign up for anything.

This article covers what teachers actually use codes for, how to make them free and account-free, how to keep a laminated code useful for years, and what to check about privacy before a pupil scans one.

## What a classroom QR code is good for

Most uses fall into a handful of patterns.

**Worksheet to video.** A code in the corner of a printed worksheet that opens the explainer video for that topic, so a pupil stuck at home has the lesson, not just the questions. The [YouTube video article](/blog/qr-code-for-youtube-video) covers linking to a specific timestamp.

**Quizzes and exit tickets.** A code on the board that opens a Google Form. Pupils scan at the end of the lesson, answer three questions, and the responses land in a spreadsheet. The [Google Form article](/blog/qr-code-for-google-form) has the setup, including how to get the short form link rather than the editing one.

**Library and reading.** A code inside the front cover of a class book that opens a review page, an author interview, or a form where pupils leave a one-line review for the next reader.

**Parent newsletters.** One code on the classroom door, the same every week, that opens this week's newsletter. Parents learn where it is; you just update what it points to.

**Stations and scavenger hunts.** A numbered code at each station opening the instructions or a clue. Because the codes are laminated and reused, they are worth making dynamic (below).

**Homework and resources.** A code on a homework sheet linking to a [PDF](/blog/qr-code-for-pdf) hosted on Google Drive or the school site, or to a shared folder of past papers.

**Display walls.** Codes next to pupils' work that open the audio of them reading it, a slideshow of the project, or the research behind it. Grandparents on open evening are the target audience.

## Free, with no accounts for anyone

Two constraints matter more in a school than anywhere else: the code must not stop working, and nobody, least of all a pupil, should have to create an account.

A **static** code encodes the URL directly. Any generator makes one, it never expires, and it needs no account. The limitation is that the URL is fixed, which is fine for a video that will not move and a nuisance for a newsletter that changes weekly.

A **dynamic** code encodes a short link that redirects to the destination, so the destination can be changed after the code is laminated. This is where most "free" generators become a problem: the redirect runs on the vendor's server, and vendors that charge for it turn it off when the trial ends. A teacher discovers this when the station codes from September stop working in November. The [free QR code generator article](/blog/free-qr-code-generator) explains how to check any generator for this before you print.

QRly makes dynamic codes with none of that. Paste the link on [the home page](/), download the code, and it works: no account, no expiry, no scan cap, no watermark. Sign up afterwards if you want to edit the destination later, which for a classroom code you probably will. There is [no paid plan](/cost); the whole service runs on free infrastructure and the source is [open](https://github.com/HK-0811/QRly). Pupils never need an account for anything, because scanning a code is just opening a link.

## Making one laminated code last for years

The trick that saves the most time is to stop making codes per resource and start making them per **place**.

- A `door` code that always points at the current newsletter.
- A `board` code that always points at today's task, quiz or form. Change it between lessons from your phone.
- `station-1` through `station-6`, laminated, reused for every activity you ever run in stations.
- A `homework` code on the class page or the front of the exercise book.

Each is a dynamic code whose destination you edit from the dashboard; the change reaches every phone within a minute. The [reusable QR code article](/blog/reusable-qr-code) goes further into the pattern, and the custom ending option lets you pick slugs like `qrly.lol/year5-board` so you can tell them apart in the dashboard without scanning.

For codes that must never change, such as a permanent video link on a worksheet you will photocopy for a decade, a static code is perfectly reasonable. Use whichever fits the resource.

## Privacy: what happens when a child scans

This is the part to read before anything is printed. Scanning a QR code opens a link, and whoever serves that link can, in principle, learn things about the device that opened it. With a dynamic code there are two parties: the redirect service and the destination.

For the destination, you already know the rules: use the tools the school has approved (Google Workspace for Education, the school's own site, the VLE), and do not send pupils to anything else.

For the redirect, ask the generator what it collects. The honest answer for QRly is on [the privacy page](/privacy), and the short version is:

- **No JavaScript runs on the scanning phone.** A redirect is an HTTP response; there is nothing to execute. No pixel, no fingerprinting script.
- **No cookies.** Nothing is set on the device, so nothing follows the pupil to the next site.
- **No identity.** The service does not know who scanned. It records that a scan happened, the approximate location from the IP address (city-level, and often wrong on school networks, where every device shares one address), the device type and browser, and the time. The IP address itself is used to derive those fields and a daily hash for counting, then discarded; it is never stored or logged.
- **Do Not Track and Global Privacy Control are honoured.** A device sending either signal is recorded as a count, a country and a device class, nothing more.
- **Retention is yours to set**, per account, and can be shortened well below the default year.

That is not "no data"; it is a small amount of aggregate data, and the [do QR codes track you](/blog/do-qr-codes-track-you) article walks through exactly what any QR redirect can and cannot know. Take it to whoever handles data protection at the school if they want to review it. A generator that will not tell you what it collects is the one to avoid.

## Print details that stop codes failing in class

Classroom codes are scanned from close range by children holding tablets, which is forgiving, but a few things still go wrong.

- **Size.** On a worksheet, 2 cm square is enough at reading distance. On the board, for a pupil scanning from the back row, make it at least 10 cm and preferably larger. The [size guide](/blog/qr-code-size-guide) has the distance rule.
- **Photocopying.** Codes survive a copier, but a copy of a copy of a copy loses contrast and fills in. Print from the original file each time, or use error correction level H so a degraded copy still scans.
- **Laminating.** Matte laminate is fine. Glossy laminate under fluorescent lights reflects, and a tablet camera sees a white glare instead of a code. Angle the sign or use matte.
- **Label every code.** "Scan for the video" beside the square. A code with no label is a code nobody scans.
- **Test on a school device**, not your own phone. School iPads are often older and locked-down, and a code that scans on a new phone may not on them. The [testing checklist](/blog/test-a-qr-code-before-printing) is short.

## Frequently asked

**Do students need an account to scan a QR code?**
No. Scanning opens a link in the device's browser or app; there is nothing to sign up for. The destination might need a school login (a Google Form restricted to the school domain, for instance), but that is your choice, not the code's.

**Can I change what a classroom QR code points to?**
Only with a dynamic code. On QRly, edit the destination from the dashboard and every laminated copy follows within a minute. This is what makes a permanent "today's task" code on the board possible.

**Are free QR codes for teachers really free?**
Static codes always are. Dynamic codes are free only if the redirect service stays free; many "free" generators expire them after a trial. QRly has no paid plan and nothing expires.

**Does scanning a QR code track my students?**
It depends on the generator. QRly runs no script and sets no cookie on the phone, does not know who scanned, and discards the IP address after deriving an approximate location. The full list of what is and is not recorded is on the privacy page.

**What is the best size for a QR code on a worksheet?**
About 2 cm square, with a clear white margin around it, scans reliably from reading distance. Bigger never hurts; smaller starts to fail after photocopying.
