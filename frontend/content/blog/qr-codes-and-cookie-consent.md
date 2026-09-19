---
title: QR codes and cookie consent: why counting scans needs no cookie banner
description: A QR redirect sets no cookie and runs no script, so counting scans never triggers the consent rule. The landing page is a separate matter. How to keep the journey light.
date: 2026-09-19
category: privacy
keywords: qr code cookie consent, cookie banner qr code, qr code tracking without cookies, cookieless qr code analytics, qr code eprivacy, qr code landing page cookies, qr code analytics no cookies
---

The cookie banner is the price the web pays for a particular way of measuring people: put something on the visitor's device, read it back later, and join the visits up. QR code analytics are routinely lumped in with that, and they should not be. The measurement happens somewhere a cookie cannot exist. The banner question moves, entirely, to the page you send people to afterwards.

This post separates the two halves of the journey, because the answer is different for each, and because keeping the second half light is where most of the work is.

## Where the consent rule comes from

The rule that produces cookie banners is Article 5(3) of the ePrivacy Directive, carried into UK law as PECR. It says that storing information on, or gaining access to information already stored in, a user's terminal equipment requires their consent, unless it is strictly necessary for a service they asked for. That covers cookies, local storage, device fingerprinting scripts, and anything else that touches the device to remember or recognise it.

Notice what the rule is about: the device. It is not about counting, or about analytics as an idea. Counting visits without touching the device is outside it. The GDPR still applies to any personal data involved, and [GDPR and QR code tracking](/blog/gdpr-and-qr-code-tracking) covers that side, but the banner specifically is an ePrivacy artefact.

None of this is legal advice; it is a description of which rule does what, so the mechanics can be matched against it.

## What a QR redirect does to the device: nothing

A dynamic QR code contains a short link. Scanning it sends a request to the redirect service, which answers with a 302 status and a `Location` header. The browser reads the header and goes there. That is the whole exchange, and [QR code redirect explained](/blog/qr-code-redirect-explained) walks through it step by step.

Within that exchange there is no page. No HTML is rendered, so no script runs. There is no opportunity to set a cookie that would be sensible to take, and QRly does not take it: the response carries no `Set-Cookie` header, and there is nothing to read back on a later scan because nothing was written. The scan is counted from the request the browser sent on its own initiative, which is the same request every server on the internet receives. [Do QR codes track you](/blog/do-qr-codes-track-you) lists what that request contains.

So the redirect does not store anything on the device, does not read anything from it, and does not run anything on it. Article 5(3) has nothing to attach to. The scan count exists without a banner, without a consent record, and without a "strictly necessary" argument, because the rule was never engaged.

| Step | Touches the device? | Consent rule engaged? |
|---|---|---|
| Camera decodes the code | Entirely on the device, nothing sent | No |
| Browser requests the short link | Ordinary HTTP request | No |
| Service records the scan and returns a 302 | No cookie, no script, no page | No |
| Browser loads the destination page | Whatever that page does | Depends on the page |

## Why some QR services do need a banner anyway

Not every redirect is a bare 302. Some services put an interstitial page between the scan and the destination: a branded splash, a "you are being redirected" screen, or a page that loads for a fraction of a second before forwarding. The reason to do that is to run script, and script is where cookies, fingerprinting and cross-link recognition come from. A service that shows you a page on the way through has given itself the ability to store something on the device, and may well be doing so.

The test is simple. Scan one of the service's codes and watch the browser. If the destination appears with nothing in between, it is a redirect. If a page from the service's domain flashes first, ask what it is for. And if the service reports a "unique visitors" number that persists across weeks, ask how, because a redirect cannot know that without storing something somewhere, either on the device or in a database of addresses. [Unique vs total QR code scans](/blog/unique-vs-total-qr-code-scans) explains why QRly's unique count is per day and why that is the honest version.

## The landing page is a separate question

The redirect is clean. Then the browser arrives at your page, and your page is a website like any other. If it loads a general-purpose analytics tag, an advertising pixel, an embedded video player or a chat widget, those set cookies and run scripts, and the banner obligation is exactly what it would be for a visitor who typed the address. The QR code neither adds to that nor excuses it.

This is where the "cookieless QR analytics" phrase can mislead. The scan counting is cookieless. The page you built to receive the scan may not be, and the person holding the phone experiences the two as one thing. A menu code that leads to a menu page which opens with a full-screen consent dialog has undone the lightness of the redirect.

## Keeping the whole journey light

Because the redirect already gives you the count, the country, the city, the device, the time and the campaign parameter, the landing page has less to measure than you might think. A few choices keep it that way.

**Put the campaign parameter in the QR link, not in a cookie.** A `utm_source=poster-a` on the destination URL travels with the request, is recorded at the redirect, and needs nothing on the device. [QR code UTM parameters and Google Analytics](/blog/qr-code-utm-parameters-google-analytics) shows how to set it up, and also where the analytics tool on the page becomes the banner question.

**Ask what the landing page needs to know that the redirect does not already tell you.** Often the answer is "whether they clicked the button", which a server log or a second QRly link on the button can tell you without a script.

**If you need page analytics, choose a tool that does not use cookies.** Several exist; the defining feature is that they count from the request and store nothing on the device. Check the tool's own documentation for whether it claims to need a banner.

**Do not embed third-party players and widgets on the QR landing page.** An embedded video or map is the commonest way a simple page picks up a dozen cookies. Link out to it instead.

**Make the landing page the thing, not a gateway to it.** A code on a table should open the menu, not a page about the menu with a consent dialog in front of it. [QR code for a restaurant menu](/blog/qr-code-for-restaurant-menu) is a worked example.

## What QRly's own pages do

Since the point of this post is to separate the redirect from the page, it is fair to say what the service's pages do. There is no third-party script on any page of QRly, including the dashboard and the blog. The redirect endpoint sets no cookie. The [privacy page](/privacy) lists every field a scan produces, and the [source](https://github.com/HK-0811/QRly) shows the redirect handler returning a 302 and nothing else. The expired-link page and the safety warning page, which are the two cases where the service does render HTML to a scanner, carry no script either.

> The banner belongs to the page, not the code. Count at the redirect, keep the page simple, and there is nothing to ask consent for.

## Frequently asked

**Do I need a cookie banner for a QR code?**
Not for the code or for counting its scans. A redirect stores nothing on the device, so the consent rule for cookies never applies to it. Whether the page the code opens needs a banner depends on what that page loads, exactly as it would for any visitor.

**Can I track QR code scans without cookies?**
Yes, and it is the normal way. The redirect counts the request the browser sends, and derives country, city, device and time from it. No cookie is set and none is needed. QRly does this for every link.

**Does QR code analytics fall under ePrivacy?**
The ePrivacy consent rule is about storing or reading information on the device. A bare redirect does neither. A service that shows an interstitial page and runs script on it is a different matter, and worth checking.

**Why do some QR generators show a page before redirecting?**
Usually to run script, which allows cookies, fingerprinting, and recognition across links and days. Sometimes it is just branding. Either way it is a page, and the device-storage rule applies to what it does.

**Will a cookie banner on my landing page hurt my scan results?**
It does not affect the scan count, which is recorded before the page loads. It affects what people do next. A code is a promise that the thing is one tap away; a consent dialog is a second tap and a reason to leave.
