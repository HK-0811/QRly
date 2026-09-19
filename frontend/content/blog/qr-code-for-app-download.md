---
title: QR code for app download: one code for both app stores, honestly
description: A QR code links to one URL, and Apple and Google run separate stores. Here are the two honest ways to get one code onto both, and when one link per store is better.
date: 2026-09-19
category: use-cases
keywords: qr code for app download, app store qr code, qr code to download app, one qr code for both app stores, google play qr code, qr code for mobile app, app download qr code generator, qr code app store link
---

A QR code contains one URL. Apple's App Store and Google Play are two websites with two URLs for the same app. So "one QR code for both app stores" is not something a QR code does by itself; it is something a web page does, and the code points at the page. Several generators sell this as a feature called an "app store QR code". What they have built is a small redirect page that sniffs the phone's operating system. You can have the same thing in ten minutes, and it is worth understanding what you are getting.

## What QRly does and does not do here

A QRly code encodes a short link, `qrly.lol/<slug>`, and the redirect engine sends every scan to one destination with a 302. It does not look at the phone's operating system and choose between two destinations. One link, one destination, deliberately; the [redirect post](/blog/qr-code-redirect-explained) explains why the engine stays that simple.

So there are two honest patterns, and which one you want depends on whether you control a web page.

## Pattern one: a landing page that detects the OS

Point the dynamic code at a page on your own site. That page reads the browser's user agent and forwards iPhones and iPads to the App Store and Android phones to Google Play. Anything else — a desktop, a tablet it cannot classify, a phone with an unusual browser — sees both store badges and picks.

It can be done server-side, by reading the `User-Agent` header and issuing a redirect, or client-side with a few lines of JavaScript on an otherwise static page:

```js
var ua = navigator.userAgent;
if (/iPhone|iPad|iPod/i.test(ua)) {
  location.replace("https://apps.apple.com/app/id123456789");
} else if (/Android/i.test(ua)) {
  location.replace("https://play.google.com/store/apps/details?id=com.example.app");
}
// otherwise leave the page showing both badges
```

Two cautions. Modern iPads can present a desktop user agent, so they fall through to the badges, which is acceptable. And test on real phones: both camera apps open the link in a browser, and the browser then hands off to the store app, which is a second hop you cannot skip.

Why this beats a vendor's built-in OS routing: the page is yours. You can add a screenshot, a one-line reason to install, and a fallback for people on a laptop who want to send the link to their phone. And if the app is ever pulled from one store, or you add a third platform, you edit a page rather than a vendor setting that may be behind a paid tier. The [website post](/blog/how-to-add-a-qr-code-to-a-website) has the general pattern for pages that exist to be scanned to.

Do not build this on a third-party deep-linking service unless you have read its shutdown terms. Firebase Dynamic Links, which a great many apps used for exactly this, was shut down in 2025, and every printed code that pointed at one of its links broke. A page on your own domain does not have a shutdown date.

## Pattern two: one store link per placement

The landing page is the general answer, but plenty of placements do not need it, because you already know which phones will scan.

- An onboarding email sent to iPhone users of your web product gets an App Store link.
- The Android section of your help centre gets a Play link.
- An in-store poster in a market that is overwhelmingly one platform gets that platform's link and a small second code for the other.
- Two codes side by side on a print ad, labelled with the store badges, is the pattern Apple and Google both publish guidelines for, and people understand it without thinking.

Each code is a dynamic short link with its own slug pointing straight at one store. No page to maintain, no user-agent parsing, and the scan counts per code tell you the platform split of your audience directly.

## Why dynamic either way

Store URLs are not as permanent as they look. The App Store URL for an app is stable by its numeric ID, but the app moves between developer accounts on acquisition, gets replaced by a rewrite with a new ID, or gets a new Play package name after a rebrand. The landing page URL changes when the site is rebuilt. And the printed code — on packaging, on a poster in a trade-show booth, on the back of a business card — does not change at all.

A dynamic code lets the code stay printed while the destination moves. On QRly the change is made in the dashboard and reaches every edge in under a minute, there is no expiry and no scan cap, and the code does not get deactivated for inactivity, which matters for something like a product insert that gets scanned by a trickle of people over years. The [editable code post](/blog/editable-qr-code) covers the dashboard side.

The short link itself cannot be changed once saved, by design, because it is what is printed. Choose the ending before you print: `qrly.lol/get-the-app` is what a person types when the camera does not cooperate.

## The store URLs and their campaign parameters

For the record, the two URL shapes:

| Store | URL | Campaign tagging |
|---|---|---|
| App Store | `https://apps.apple.com/app/id123456789` | `?pt=<provider token>&ct=<campaign name>&mt=8`, from App Store Connect's campaign links |
| Google Play | `https://play.google.com/store/apps/details?id=com.example.app` | `&referrer=utm_source%3D...`, read by the app via the Install Referrer API after install |

Both stores' campaign parameters are set on the destination URL, not in the QR code, so the code stays small and the parameters can be changed later from the dashboard. If your landing page sits in the middle, the page passes them through. The [UTM post](/blog/qr-code-utm-parameters-google-analytics) covers the web-analytics side; the store parameters are their own thing and the stores' developer documentation explains what each reports.

## Reading the scans

The most useful number here is one QRly records on every scan regardless of pattern: the scanner's **OS and browser**, with versions, from the user agent at the redirect. Before you build a landing page at all, put a plain dynamic code on the poster pointing at the App Store, run it for a week, and read the OS split. If nine in ten scans are Android, the landing page is not optional. If it is even, two codes side by side is simpler. The [device analytics post](/blog/qr-code-device-analytics) explains what the user agent does and does not tell you; device model in particular is reported by some browsers and not others.

Everything else applies as usual: total scans, unique visitors per day, hour and weekday in local time, approximate city, and referrer, where none means a camera scan. Nothing is installed on the phone, no cookie is set, and the IP address is discarded once the geo fields are derived; the [privacy page](/privacy) lists every field.

Use a separate slug per placement — poster, packaging insert, conference slide — and the dashboard shows which one drove installs, or at least which one drove store visits. The store's own analytics has to do the last step. The [poster post](/blog/qr-code-for-flyers-and-posters) has the sizing for each of those.

## Print notes specific to app codes

- Put the store badges next to the code, or the words "Get the app". A bare code gets fewer scans than one that says what it is for.
- Size for the placement: 2 cm on a card or an insert, 8 to 10 cm on an A3 poster, larger on anything read from further away.
- Use the short link, not the full store URL. A Play URL with a referrer parameter is long and makes a dense code; the short link makes a sparse one.
- Test both stores from both platforms, on a print, before the run. The handoff from browser to store app is where things go wrong, and it goes wrong differently on each.

## Frequently asked

**Can one QR code work for both the App Store and Google Play?**
Only via a web page. The code points at a page that detects the phone's OS and forwards to the right store, showing both badges to anything it cannot classify. A QR code itself holds one URL.

**Does QRly route iPhone and Android scans to different destinations?**
No. Each QRly link goes to one destination. Point it at your own OS-detecting page, or make one code per store and place them where they fit.

**Will the App Store or Play link in my code stop working?**
Store URLs change when apps move accounts, get rewritten, or are rebranded. Use a dynamic code so the printed code stays valid and the destination is edited in the dashboard.

**Can I track installs from the QR code?**
The code reports scans and the scanner's OS, which tells you which store they were sent to. Installs are reported by the stores' own campaign parameters, which you add to the destination URL.

**Should the code go straight to the store or to a landing page?**
Straight to the store when you know the platform of the audience, which is most single placements. To a landing page when the same code must serve both platforms or you want to say something before the install.
