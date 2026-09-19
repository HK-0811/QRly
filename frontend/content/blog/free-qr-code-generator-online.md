---
title: Free online QR code generator, and the six things to check before using one
description: What a free online QR code generator should and should not do, why it matters whether the code renders in your browser, and where QRly sits on each point.
date: 2026-09-19
category: basics
keywords: online qr code generator free, qr code generator online, free qr code generator online, make qr code online, qr code maker online, browser qr code generator, qr code generator no download
---

An online QR code generator is a web page with a text box. You paste something in, a code appears, you download it. The whole category is so simple that the differences between generators are not in what they produce, which is the same grid of squares from the same specification, but in what happens around it: what the code contains, where the image is made, what you are asked for, and what the page quietly keeps.

Here are the six things worth checking. They take a couple of minutes and they are the difference between a code that is yours and a code you are renting.

## 1. Where the scan goes

Point a phone at the code before you download it. The camera shows the decoded content.

If it shows **your URL**, the code is static. It contains your address directly, and nothing the generator does later can affect it. If it shows **a short link on the generator's domain**, the code is dynamic: a scan goes to their server first, and their server redirects to your page. That is a useful thing, since it makes the destination editable and the scans countable, but it means the code only works for as long as the redirect does.

For a static code, the check ends here. For a dynamic one, the next question is the terms that redirect lives under, which the [free QR code generator guide](/blog/free-qr-code-generator) covers in detail. The short version: read the pricing page for what happens to free codes after the trial, after a period of inactivity, or after a monthly scan cap. Many "free" dynamic generators are free for a fortnight.

QRly makes dynamic codes only. Every code encodes a short link, `qrly.lol/<slug>`, and the redirect is a 302 to your destination. There is no trial and no paid tier; the [cost page](/cost) shows what it costs to run, which is nothing, and why that is sustainable.

## 2. Whether the image is made in your browser

This is the check almost nobody makes, and it has two consequences.

Some generators build the image on their server. You submit the content, the server renders a PNG and sends it back, often as a URL like `generator.com/qr?data=...`. Two things follow. First, whatever you typed has been sent to their server and may be logged, which matters if the content is a private link, an internal address or anything you would not paste into a stranger's form. Second, if the "download" is really a link to an image hosted on their server, the image can change or vanish.

Other generators build the image in the browser. The page loads a QR encoding library as JavaScript, and everything happens on your machine; the file you download was made there. Check by watching the network tab, or more simply by disconnecting from the internet after the page has loaded and seeing if the code still updates as you type.

QRly renders client-side. The SVG and the PNG are drawn in your browser from the short link, and nothing is stored as an image anywhere. What the server does hold is the short link and its destination, because that is what a redirect is. That record is the product; the picture is just a picture of it.

## 3. What you can download, and what is on it

A generator should give you at least an SVG and a large PNG, with nothing on them but the code.

**SVG** is the one that matters for print, because it scales without loss. A generator that offers only PNG, or only a small PNG, has decided that your code is for screens. **PNG** should be available at a size large enough for print if the SVG is refused, which means 1000 pixels or more. **JPG** should not be on the list at all; it blurs module edges.

And look at the corner of the download. A watermark, a "made with" line or a tiny second QR code in the margin is a common way of making the free tier pay for itself. The [watermark guide](/blog/qr-code-generator-without-watermark) has the list of what to look for. QRly puts nothing on the file: SVG, or PNG at 512, 1024 or 2048 pixels, all clean.

## 4. Whether the code appears before the sign-up form

A pattern to recognise: you paste a link, the generator shows a blurred preview, and the download button opens an account form. Sometimes the form is the whole business model, and the free code you get afterwards is a dynamic one on a trial.

There is no technical reason a generator needs to know who you are to make a code. It needs an account for exactly one thing: to let you come back later and edit or read scan data, which requires knowing which links are yours.

QRly does it in that order. The [home page](/) and [create page](/create) produce a working code and a working short link with no account at all. If you then want to change the destination or see the scans, you sign up, and the links you made before registering are attached to the new account. If you never sign up, the code keeps working. The [no sign-up guide](/blog/qr-code-generator-no-sign-up) has the details of how that hand-off works.

## 5. What the page does to the person who scans

A generator's own page can be as ad-heavy as it likes; you are the one visiting it. What matters more is what it does to the people who scan your code, since they did not choose the generator and will blame you.

For a static code, nothing: the scanner goes to your page. For a dynamic code, the redirect is a chance to do things. Some services show an interstitial page, some set a cookie, some load a script that fingerprints the phone before sending it on. None of that is necessary for a redirect, and a scanner who hits a consent banner between the code and the menu has been given a reason not to bother.

QRly's redirect is a bare 302. No page, no cookie, no pixel, no JavaScript; a redirect never runs any. The scan is counted at the edge from the request headers, the IP is used to derive a country and city and a daily-rotating hash, and then it is discarded. The full field list is on the [privacy page](/privacy), including what is deliberately not collected.

## 6. Whether the limits are written down

Every free tool has limits. A trustworthy one states them where you can see them before you build on it.

QRly's are these. It makes URL codes only: a short link that redirects. It does not make Wi-Fi, vCard, phone, SMS, email, plain-text or payment codes, because those formats are not URLs and cannot be redirected. If you need one of those, a phone's built-in sharing (for Wi-Fi) or any static generator produces it. There is no bulk import, no API for the public, no teams, no password-protected codes. It is sized for a thousand or two users, not for an enterprise roll-out. The code is open, under the MIT licence, at https://github.com/HK-0811/QRly, so the limits can be read rather than discovered.

## Online, offline and open source

"Online" is not the only option. The QR specification is public, encoding libraries exist for every language, and a code can be made from a command line with no web page at all. The [open source generator guide](/blog/open-source-qr-code-generator) lists the tools.

For the one-off code that most people need, an online generator is faster, and a good one is no less private than an offline tool if it renders in the browser. The static-versus-dynamic question is the one that matters, and the [comparison](/blog/static-vs-dynamic-qr-codes) is short: static if the destination will never change and you need no scan count; dynamic otherwise, on a service whose free tier does not end.

If you want a broader look at what is available, the [round-up of free generators](/blog/best-free-qr-code-generators) applies these six checks across the tools people actually use.

## Frequently asked

**Is it safe to use an online QR code generator?**
For a static code from a generator that renders in the browser, yes; the content never leaves your machine. For a dynamic code, the safety question is whether the redirect will still be served next year, which is a matter of reading the terms.

**Do online QR code generators keep my links?**
A static generator that renders client-side keeps nothing. A dynamic generator must store the destination, because that is what the redirect reads. QRly stores the short link and destination and nothing about you unless you create an account.

**Why does an online generator want me to sign up?**
Either to let you edit and track the code later, which is legitimate and should be optional, or to convert you to a paid plan. If the code is not shown until after the form, assume the second.

**Can I make a QR code online without a watermark?**
Yes. A watermark is a choice the generator makes, not a property of the format. QRly's SVG and PNG exports carry nothing but the code.

**Does QRly work offline?**
The image rendering is client-side, but creating a link needs a request to the server, since the short link has to exist before a code can encode it. For a fully offline workflow, use a static generator or a library.
