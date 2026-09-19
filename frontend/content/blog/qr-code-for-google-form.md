---
title: QR code for a Google Form: the link to use and how to keep it working
description: How to get the right Google Form link (shortened or prefilled), why the code should be dynamic so a closed form can be repointed, and scan counts beside responses.
date: 2026-09-19
category: use-cases
keywords: qr code for google form, google form qr code, qr code survey, google forms qr code generator, survey qr code, feedback form qr code, qr code for sign up form
---

A Google Form behind a QR code is the cheapest survey infrastructure there is: a form that costs nothing, a code that costs nothing, and a printed card at the till, the event exit or the classroom door. It works well, and the ways it goes wrong are all avoidable, mostly by using the right link and not printing it directly.

## Get the right link

Open the form in the editor and click **Send** (top right). The dialogue has a link tab (the chain icon). That gives you the respondent link — the one that ends in `/viewform` — and a **Shorten URL** checkbox that turns it into a `forms.gle/<code>` link.

Three things to get right here:

**Use the respondent link, not the editor link.** The address in your browser while editing ends in `/edit`. Anyone scanning that gets a "you need permission" page, or, worse, if the form is shared with editors, the editing view. It is the single most common Google Form QR mistake, and it is invisible to you because you have permission.

**The shortened link is fine, and shorter is better for a code.** `forms.gle/abc123XYZ` produces a much simpler QR code than the full `docs.google.com/forms/d/e/<40 characters>/viewform`. A simpler code prints smaller and scans more reliably. (A dynamic short link is shorter again — see below.)

**Check the form's access settings.** In the form's settings, "Restrict to users in your organisation" — on by default for Google Workspace accounts — means the public gets a sign-in wall. Turn it off for a public survey. Then open the link in a private browser window and confirm it loads without signing in.

### Prefilled links

The Send dialogue is not the only link the form offers. The three-dot menu in the editor has **Get pre-filled link**, which lets you answer some questions in advance and produces a URL with those answers baked in. Anyone opening it sees the form with those fields already set.

This is how a single form can know where it was scanned. Add a question — "Location" or "Source" — fill it with "Counter card" and generate the prefilled link; fill it with "Receipt" and generate another. Put a different code on each placement, each pointing at its own prefilled link, and the responses arrive already labelled. The prefilled field can be a short-answer question you tell people to leave alone, or, in a form with sections, a question on a section respondents never see.

Prefilled links are long — a couple of hundred characters — which is another reason to put a short link in front of them rather than encoding them directly.

## Make the code dynamic

A static code encodes the form link itself. It works until the form is closed, replaced or rebuilt, which happens constantly: this term's feedback form becomes next term's; the event survey closes and the next event needs a new one; someone adds a question and starts a fresh copy for clean data.

After any of those, a static code on a printed card opens "This form is no longer accepting responses", and the card goes in the bin.

A dynamic code encodes a short link that redirects to the form. When the form changes, edit the destination in the dashboard and every printed code opens the new form within a minute. [Static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes) sets out the mechanics; for a form, the practical effects are:

- **A closed form can be repointed.** Close last quarter's survey, open this quarter's, update the link. The cards on the tables do not change.
- **A laminated card lasts as long as the laminate.** A classroom sign-up code, a "how did we do" card at a hotel reception, a suggestion box on the wall — print once.
- **The same code can outlive Google Forms.** If you move to another survey tool, the printed code follows.

On QRly, paste the form link on [the home page](/) and download the code — no account needed for that part. Sign up afterwards to keep the link editable. There is no expiry, no scan cap and no paid plan, which is the property a code on a wall needs. The redirect is a 302, and the edit is covered in [how to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing).

Give the short link a readable ending — `qrly.lol/feedback` rather than random characters. On a survey card, the person may see the link in the camera's preview before tapping, and a sensible one gets tapped.

## Where survey codes work

**The receipt and the counter**, for customer feedback, at the moment the experience is complete. The code needs to be at least 2 cm on a receipt, 3–4 cm on a counter card, with the four-module quiet zone. [Where to place a QR code](/blog/where-to-place-a-qr-code) goes through placements in general; [QR code for feedback and surveys](/blog/qr-code-for-feedback-and-surveys) is the fuller treatment of feedback specifically.

**Event exits and name badges**, for post-event surveys. The response rate is highest in the room and falls off within a day, so the code goes on the last slide, the exit banner and the badge, not in the follow-up email alone.

**Classrooms and notice boards**, for sign-ups, permission slips and quizzes. [QR codes for teachers and classrooms](/blog/qr-codes-for-teachers-and-classrooms) covers the classroom side.

**Packaging and delivery inserts**, for product feedback from people you never see. A prefilled "Source" field per product line makes one form serve the whole range.

Wherever it goes, keep the ask short and say what happens: "Two questions, thirty seconds" next to the code does more for the response rate than any design choice. A form that turns out to be twenty questions gets abandoned, and a dynamic code at least lets you count how many people it lost.

## Scan tracking beside response tracking

Google Forms counts responses. It does not count how many people opened the form and left, or how many scanned the code and never got as far as the form. A dynamic code fills in the first half of that funnel.

What QRly records at the redirect, per link: total scans, unique visitors per day, country and city, local hour and weekday, device and OS, language, and the referrer. None of it involves a cookie, a pixel or a script on the phone; a redirect never runs any, and the IP address is used for the geography fields and then discarded. The [privacy page](/privacy) lists every field, which matters when the form itself is asking people for their opinion of you.

The comparison that is worth making:

| Number | Where it comes from | What it tells you |
|---|---|---|
| Scans | The redirect | How many people reached for their phone |
| Responses | Google Forms | How many finished |
| Responses ÷ scans | Both, same period | Completion rate |

The completion rate is the number that moves when you shorten the form, change the wording on the card, or move the card from the wall to the counter. Watch it per placement — one dynamic code per placement, each with its own count — and the placements that produce scans but no responses are the ones where the form is the problem, not the code.

Two honest limits. Unique visitors are per day, by design, so the same person scanning on two days counts twice; [unique vs total scans](/blog/unique-vs-total-qr-code-scans) explains why. And the scan count includes people who opened the form and closed it — that is the point, but it means scans and responses are never expected to match.

Scan time is worth a look too. A feedback card's heatmap should look like your opening hours; if the scans cluster at closing time, that is when the card is being noticed. [Scan time analytics](/blog/qr-code-scan-time-analytics) covers reading it.

## Print and test

Export **SVG** for anything printed, PNG at 1024 or 2048 pixels for screens and slides. Print one card at real size and scan it with an iPhone and an Android before the run; submit a test response from the scan, then delete it from the responses sheet. That catches the `/edit` link, the restricted-access setting and the closed form, which between them account for most "the QR code doesn't work" reports about Google Forms.

## Frequently asked

**Which Google Form link should I put in the QR code?**
The respondent link from the Send dialogue — it ends in `/viewform`, or is the `forms.gle` shortened version. Not the `/edit` address from your browser bar.

**Why does my Google Form QR code ask people to sign in?**
Either it is the editor link, or the form is restricted to your organisation in its settings. Use the respondent link and turn off the restriction, then test in a private window.

**Can I reuse the QR code for a new form?**
With a dynamic code, yes. Edit the destination to the new form's link and every printed code follows within a minute. A static code points at the old form permanently.

**Can I tell which placement a response came from?**
Yes, with prefilled links: add a "Source" question, generate a prefilled link per placement, and put a separate code on each. Responses arrive labelled. The scan counts per code show the other half — how many scanned but did not respond.

**Does the QR code track who answered?**
No. The redirect records the scan — time, country, device — and nothing about the person; there is no cookie or script. What the form itself collects is set in Google Forms, including whether it records email addresses.
