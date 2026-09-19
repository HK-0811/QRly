---
title: QR codes for museums and self-guided tours: exhibits, audio, languages
description: A QR code on each exhibit placard for audio, video or a multilingual page, why a placard that outlasts its software needs a code on your own domain, and per-exhibit data.
date: 2026-09-19
category: business
keywords: museum qr code, qr code audio guide, qr code exhibit, self guided tour qr code, qr code heritage trail, museum audio guide qr code, qr code interpretation panel
---

The audio guide handset is the most expensive way ever devised to play a two-minute recording. It has to be bought, charged, cleaned, handed out, explained and collected, and the content on it is updated whenever someone can find the cable. Meanwhile every visitor is carrying a better device with headphones already in.

A QR code on the placard, opening that exhibit's audio, video or page on the visitor's own phone, is the replacement. It costs a label. The hard part is not the code; it is that a placard in a museum stays on the wall for twenty years, and nothing about the page behind the code will last that long.

## What goes behind each code

One code per exhibit, stop or panel, each opening a page for that item. The page can hold:

- **Audio**: the two-minute narration, as a simple player. Host the file anywhere that serves audio to a phone; a page on your site with an audio element is enough.
- **Video**: a curator talking, archive footage, a reconstruction.
- **Text and images** the placard has no room for: the full provenance, the conservation story, the high-resolution photograph, the related objects elsewhere in the building.
- **Navigation**: next stop, previous stop, map. For a trail, this is what makes it self-guiding.
- **Language selection**, which gets its own section below.

QRly does not host the pages or the audio. It makes the short link and the code, and lets the link's destination be changed at any time. The pages live on your website, a collections platform, a simple site builder, an unlisted video account; [QR codes for YouTube videos](/blog/qr-code-for-youtube-video) covers the simplest version for video.

Give each link a custom ending that matches your catalogue: `qrly.lol/gallery2-14`, or on your own domain, `guide.themuseum.org/g2-14`. The ending is printed under the code, so a placard that has migrated to the wrong case is spotted, and a visitor who cannot scan can type it.

## Multilingual landing pages

A museum's visitors speak many languages and the placard has room for two. The page behind the code has room for all of them. Two patterns work:

**A language chooser** at the top of the page: flags or names, then the content. Simple, obvious, one more tap.

**Automatic selection** by the phone's language, done on your page. Every browser sends its preferred language with the request, and a page can serve the matching version and offer the others. QRly does not do this routing itself — one link goes to one destination — but the destination page can, and this is the cleaner experience.

Either way, the scan data tells you which languages you need. QRly records the scanner's browser language for each scan, per link. If the Rosetta gallery's codes are being scanned by phones set to Korean and Italian and you offer neither, that is the next translation to commission. It also tells you which exhibits are being scanned by which language groups, which is a curatorial question nobody could previously answer.

## The placard outlives the software

This is the part that makes museums different from cafés. A café's menu code is reprinted with the next menu. A museum's interpretation panel is designed, fabricated in a durable material, installed, and left for a decade or two. The code on it must work for that whole period, and in that period:

- The audio files will be re-recorded and moved.
- The website will be rebuilt at least twice, and every URL will change.
- The collections platform will be replaced.
- The company that made the QR codes may cease to exist or change its terms.

A **static** code, containing the page URL directly, fails at the first website rebuild. Every panel in the building then points at a 404, and the fix is refabricating every panel.

A **dynamic** code contains a short link that redirects to the page, and the redirect is edited from a dashboard. Website rebuild: repoint every link, in an afternoon, with nothing refabricated. [Static vs dynamic](/blog/static-vs-dynamic-qr-codes) explains the mechanism; [reusable QR codes](/blog/reusable-qr-code) covers the repointing.

But a dynamic code on a vendor's domain only moves the problem. It now fails when the vendor fails. The code on a placard fabricated in 2026 contains a hostname, and whoever controls that hostname in 2040 controls whether the code works.

So the position for anything fabricated to last is a **dynamic code on your own domain**: `guide.themuseum.org/g2-14`, with the subdomain pointed at the redirect platform by a CNAME record. If the platform ever changes, the CNAME is pointed somewhere else and every placard follows. [Custom domain QR codes](/blog/custom-domain-qr-code) explains what is involved; on QRly it needs an account and one DNS record, and it costs nothing. [Why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) explains why the platform refuses to let the hostname or ending be changed once saved — the placard is assumed to exist.

Two related cautions. QRly is free and [open source](https://github.com/HK-0811/QRly), which reduces the commercial reasons it might disappear, but that is a weaker guarantee than owning the hostname. And the domain registration itself must be the museum's, renewed by the museum, not held by an agency or a departed IT contractor.

## Per-exhibit scan analytics

With a code per exhibit, the scan data becomes a visitor study that runs continuously and costs nothing:

| What the data shows | What it tells you |
|---|---|
| Scans per exhibit | Which objects visitors want more about; which panels are being ignored |
| Scans by hour and weekday | Flow through the building, and which galleries are busy when |
| Language per scan | Which translations to commission, and for which galleries |
| Sequence of stops on a trail | Where people give up, from where the scans stop |
| Country and city | Approximate, from IP, but a reasonable read on where visitors came from |
| Device and OS | Whether the audio player works on what people actually carry |

"Unique visitors" is counted per day with a rotating hash, so a visitor scanning three exhibits is three scans and, within the day, one unique visitor per link. Location is city-level and mislocates on some mobile networks, so treat it as indicative. [Scan time analytics](/blog/qr-code-scan-time-analytics) and [what you can actually know](/blog/qr-code-analytics-what-you-can-actually-know) are the honest account of the whole thing.

Nothing is installed on the visitor's phone. The redirect sets no cookie and serves no script; the IP address is used to derive the city and the daily hash, then discarded. [The privacy page](/privacy) lists every field, which is a useful document to have when a visitor, or a board, asks.

## Fabrication notes

Placards are viewed from a metre or so, often behind glass, sometimes in dim conservation lighting. Size the code at 4–5 cm minimum, more if the panel is set back. Use error-correction level H, which allows a scratched or partly obscured code to be read; [error correction explained](/blog/qr-code-error-correction-explained) covers the trade-off in modules.

Send the fabricator the SVG, not a PNG, so the code is rendered cleanly at whatever size and process they use, whether that is screen-printed vinyl, etched metal or a direct print on acrylic. [SVG vs PNG](/blog/qr-code-file-formats-svg-png) explains why. Keep the four-module quiet zone inside the panel's design, and keep the code plain dark on plain light; a code etched in brass on brass will not scan.

Before fabrication, print a proof at actual size, put it where the panel will go, and scan it under the actual lighting with an iPhone and an Android. The [pre-print test](/blog/test-a-qr-code-before-printing) is cheap; the panel is not.

## Outdoor trails

A heritage trail or sculpture walk is the same thing with weather. The codes go on posts or plaques, the pages hold the audio and the map, and the durability argument is stronger still, because a plaque in a park is replaced even less often than one in a gallery. The [asset tag post](/blog/qr-codes-for-asset-tags-and-equipment) covers label materials that survive outdoors.

## Frequently asked

**Can a QR code replace a museum audio guide?**
For the playback, yes: the code opens the audio on the visitor's own phone. It does not replace the handset for visitors without a phone, so keep a few handsets, or offer the same audio on a loan device with the page bookmarked.

**How do I make one QR code work in several languages?**
Point the code at a page that offers a language choice, or that selects the language automatically from the phone's settings. The code itself is the same; the page does the work. The scan data reports each scanner's language, which tells you which translations are needed.

**What happens when the website is rebuilt?**
With dynamic codes, repoint each link at its new page from the dashboard; the placards are unchanged. With static codes, every placard has to be refabricated.

**Does a museum need its own domain for its QR codes?**
For placards expected to last decades, yes. The code contains a hostname, and owning that hostname is the only way to guarantee the code works regardless of which platform serves the redirect. On QRly it is one CNAME record and free.

**Is the visitor tracked?**
The scan is counted with time, language, device type and approximate location. No cookie, no script and no stored IP address. The full list of fields is on the privacy page.
