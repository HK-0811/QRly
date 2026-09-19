---
title: QR code for customer feedback and surveys that people actually finish
description: How to put a survey behind a QR code, use one code per location so results can be compared, expire it when the campaign ends, and read scans against completions honestly.
date: 2026-09-19
category: use-cases
keywords: qr code for feedback, survey qr code, qr code for customer feedback, feedback form qr code, qr code survey link, customer survey qr code, qr code questionnaire
---

A feedback code on a receipt, a table or a delivery box is the cheapest survey distribution there is. It is also the one most likely to produce nothing, because it was printed once, pointed at a form that has since been edited, and put where nobody has a reason to scan it. The mechanics are easy to get right; this post is about the handful of decisions that decide whether you get thirty responses or three.

## What to link

Any form tool works: Google Forms, Microsoft Forms, Typeform, SurveyMonkey, Tally, a page on your own site. The code just opens the URL. Two checks before you use the link:

- Use the **respondent** link, not the editor link. Every form tool has a "send" or "share" button that produces the public URL; the one in your browser's address bar while editing is usually not it.
- Open it in a **private browser window** on a phone. If it asks you to sign in, so will it ask your customers, and most will leave.

The [Google Form post](/blog/qr-code-for-google-form) covers the Google specifics, including prefilled links, which matter in a moment.

## Dynamic, because the form will change

Put the form behind a [dynamic code](/blog/what-is-a-dynamic-qr-code) rather than encoding the form URL directly. Forms get rebuilt. The question order changes, the tool changes, someone duplicates the form to fix a typo and the old URL now points at a closed copy. With the form behind a short link, you [edit the destination](/blog/how-to-change-a-qr-code-link-after-printing) from the dashboard and every printed receipt, sticker and tent follows within a minute.

It also lets you retire the survey cleanly, which comes up below.

## One code per location, so you can compare

The single most useful decision: **make a separate link for each place the code appears**, all pointing at the same form. The [create page](/create) lets you set a custom ending, so name them for the place:

```
qrly.lol/cafe-receipt     →  the form
qrly.lol/cafe-table       →  the form
qrly.lol/cafe-toilet-door →  the form
qrly.lol/cafe-delivery    →  the form
```

Each link then has its own scan count, its own hour-by-weekday heatmap and its own device breakdown, and you can see that the receipt gets scanned at 10 pm from home while the table code gets scanned at 1 pm on Saturdays. That tells you where to put the code next time and which placements are wasted. The [A/B testing post](/blog/qr-code-a-b-testing) describes the same technique for comparing two designs.

To carry the location into the form itself, so responses are labelled and not just scans, do one of two things:

- Add a **UTM parameter** to each destination (`?utm_source=receipt`), which form tools that support hidden fields can capture. The [UTM post](/blog/qr-code-utm-parameters-google-analytics) explains the parameters.
- Use a **prefilled link**: Google Forms and most other tools can generate a URL that pre-answers a "Where did you find this?" question. Each code gets its own prefilled URL as its destination.

Either way, the printed codes are identical to the eye and different in the data.

## Expiry, so a finished campaign does not keep collecting

A survey about the spring menu should stop when the spring menu does. Set an [expiry date](/blog/qr-code-with-expiration-date) on each link; after it, scans land on an "expired" page rather than a form that no longer makes sense. If you would rather keep the code useful, repoint it at the next survey, or at a review link, on the day the campaign ends. The post on [QR codes for Google reviews](/blog/qr-code-for-google-reviews) is the natural next stop for a feedback code that has done its job.

Codes on QRly do not expire on their own and are not deactivated for inactivity; the expiry is a date you set, and only when you set it.

## Scans versus completions

This is where honesty matters. The dashboard shows **scans**: people who scanned the code and hit the redirect. The form tool shows **submissions**. The gap between the two is the drop-off, and it is normally large.

A few things about the scan number:

- **A scan is not a person.** Someone who scans, gets interrupted and scans again is two scans. QRly counts unique visitors per day with a rotating hash, so that person is one unique for that day, but a new one tomorrow; the [unique versus total post](/blog/unique-vs-total-qr-code-scans) explains why it is done per day rather than forever.
- **Nothing is measured after the redirect.** QRly sees the scan and hands the phone to the form. Whether the page loaded, whether it was abandoned on question four, is the form tool's data, and it only sees submissions.
- **A scan with no referrer is a camera scan.** A scan with a referrer came from a link someone shared; if your feedback link is being forwarded, that shows up.

So the number to watch is completions divided by scans. If it is low, the form is the problem, not the code: too long, asks for an email first, or does not say how long it takes. If scans themselves are low, the placement is the problem.

## Getting people to scan

The code does not motivate anyone. The words next to it do.

- **Say how long it takes**, and be truthful: "Three questions, one minute." If the survey is longer than that, cut it.
- **Say what it is for.** "Tell us what to fix" gets more responses than "Customer satisfaction survey".
- **Put it at the moment of the experience**, not after. On the table as the plates are cleared, on the inside of the delivery box lid, on the door as people leave. A feedback code at the till, when someone is paying and holding a bag, gets ignored.
- **Make it big enough to scan at arm's length**: 2 to 3 cm on a receipt or a card, 5 cm on a tent, and with the quiet zone intact. The [size guide](/blog/qr-code-size-guide) has the rule for other distances.
- **One code per sign.** Two codes side by side, one for feedback and one for reviews, confuse the camera and the person.

For hotels, the code belongs in the room, not at checkout; the [hospitality post](/blog/qr-codes-for-hotels-and-hospitality) goes into where. For anything on paper, the [placement post](/blog/where-to-place-a-qr-code) covers the general rules.

## Privacy, on both sides

The scan itself records no cookie, sets nothing on the phone and runs no script; the redirect is a plain 302. The IP is used to derive a country, region and city and a daily hash, then discarded. If a respondent has Global Privacy Control or Do Not Track set, only a count, country and device class are recorded. The full list of fields is on [the privacy page](/privacy).

The form is a different matter. Whatever it collects is between you and the form tool, and if you ask for a name or an email, say why on the form. Anonymous surveys get more honest answers, and if the point is feedback rather than lead capture, make it anonymous and say so next to the code.

## Frequently asked

**Can I track how many people responded to my survey from the QR code?**
You can see how many scanned it. How many completed the form is the form tool's number. Divide one by the other and you have the drop-off, which is the number worth improving.

**Should I use one QR code or several?**
Several, one per placement, all pointing at the same form. The printed codes look identical; the scan data tells you which placement works. Add a UTM or prefilled parameter to each if you want the location inside the responses too.

**What happens when the survey closes?**
With a dynamic code, set an expiry date or repoint it. With a static code encoding the form URL directly, the code keeps sending people to a closed form for as long as the paper exists.

**Does the scanner get tracked?**
The redirect records a scan with approximate location, device type and time, with no cookie and no script on the phone. The IP is not stored. What the form collects afterwards is up to you.

**Do I need an account?**
Not to make the code. You will want one to change the destination, set an expiry and read the per-location scan data, all of which this use case relies on. Make the code first, then claim it.
