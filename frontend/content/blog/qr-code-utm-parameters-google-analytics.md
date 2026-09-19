---
title: QR code UTM parameters: tracking QR code scans in Google Analytics
description: Put UTM tags on the destination URL, not in the QR code, so scans appear as a campaign in Google Analytics. A naming scheme per placement and what QRly records.
date: 2026-09-19
category: analytics
keywords: qr code utm, qr code google analytics, track qr code in google analytics, utm parameters qr code, qr code campaign tracking, qr code utm_source, qr code attribution
---

A QR redirect counts the scan. Google Analytics counts the visit. They are two views of the same moment from different sides, and without a deliberate link between them, the GA side shows most QR traffic as **direct** — lumped in with people who typed the address or opened a bookmark.

The link is UTM parameters, and the whole trick is putting them in the right place.

## Where the tags go

There are two URLs involved in a dynamic QR code: the short link inside the code, and the destination it redirects to. UTM tags belong on the **destination**.

```
Inside the code:   https://qrly.lol/spring-menu
Destination:       https://example.com/menu?utm_source=qr&utm_medium=print&utm_campaign=spring-2026&utm_content=window-poster
```

When the redirect fires, the phone lands on the tagged URL, and GA attributes the session to `qr / print / spring-2026`. The QR code itself stays short and clean.

Putting the tags inside the code instead — encoding the full tagged destination as a static code — works for GA but costs you everything else: the code becomes dense and harder to scan, the tags can never be corrected, and nothing counts the scan on the QR side. [Why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) covers the density problem; the untrackability is the difference between [static and dynamic codes](/blog/static-vs-dynamic-qr-codes).

Putting the tags on the short link — `qrly.lol/spring-menu?utm_source=qr` — is a third option that people try and that does something different. QRly records any UTM parameters it sees on the short link and lists them under campaigns in its own dashboard. But it redirects to the stored destination exactly as saved; the query string on the short link is **not** forwarded. So tags on the short link reach QRly and not GA. That is occasionally useful — when the short link is shared as text in a newsletter and you want QRly to distinguish that traffic from camera scans — but for GA attribution it is the wrong place.

## Why untagged QR traffic shows as direct

A camera scan opens the URL from nowhere. There is no referring page, so the phone sends no `Referer` header. When the redirect then sends the phone to your site, QRly explicitly sets a no-referrer policy on the response so the short link is not leaked into your site's logs. The result is that your destination page is opened with no referrer at all, which every analytics tool records as direct.

Direct traffic is the bucket for everything unattributable. A spike in direct after a poster campaign is suggestive but not measurable. Tags make it measurable.

## The five parameters, and what to put in them

| Parameter | Purpose | For QR codes |
|---|---|---|
| `utm_source` | Where the traffic came from | `qr` — or the vendor or venue if you prefer |
| `utm_medium` | The channel type | `print`, `packaging`, `signage`, `flyer` |
| `utm_campaign` | The campaign or period | `spring-2026`, `launch`, `menu` |
| `utm_content` | The specific placement or variant | `window-poster`, `table-card`, `back-page` |
| `utm_term` | Paid keyword; rarely useful here | Leave empty, or use for a variant |

GA needs at least `utm_source` and `utm_medium` to attribute a session to a campaign; without both, it may fall back to direct. `utm_campaign` and `utm_content` are where the actual information lives for QR work.

Conventions that avoid a mess three months later:

- **Lowercase everything.** GA treats `Print` and `print` as different mediums.
- **No spaces.** Use hyphens. A space becomes `%20` and then `+` and then a report row you cannot find.
- **Same vocabulary every time.** Write down the allowed values for source and medium and reuse them. One person's `print` and another's `poster` and a third's `offline` produce three reports of one campaign.
- **Put the variable part in `utm_content`.** Source, medium and campaign should be constant across a campaign; content is what distinguishes one placement from another.

## A scheme for one code per placement

The reason to make a separate code for every physical placement is that scan counts are per link. Combine that with `utm_content` and the two sides line up exactly:

| Placement | QRly link | `utm_content` |
|---|---|---|
| Window poster | `qrly.lol/sp-window` | `window-poster` |
| Table cards | `qrly.lol/sp-table` | `table-card` |
| Local paper, half page | `qrly.lol/sp-paper` | `paper-half` |
| Delivery bag sticker | `qrly.lol/sp-bag` | `bag-sticker` |

Each row has a QRly count (scans, when, where, on what) and a GA segment (sessions, pages, conversions). Dividing the second by the first per row gives a landing rate per placement, which is the number that tells you whether the poster is being scanned by people who then leave immediately. [Measuring print ROI with QR codes](/blog/measure-print-campaign-roi-with-qr-codes) takes this through to cost per conversion.

A slug that matches the content tag, as in the table, is a small kindness to whoever reads the two dashboards side by side. The slug is chosen when the code is made and cannot be changed afterwards; the tags can.

## Fixing tags after printing

This is where the dynamic code earns its keep. A tagged static code is a permanent record of whatever was typed in on the day, typos included. A QRly code redirects to a destination you can edit from the dashboard, and the edit reaches every edge within a minute.

So when the campaign name changes, when someone notices the medium was set to `Print` with a capital, or when the page moves and the tags need to follow it, the fix is an edit to the destination and no reprint. [How to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) walks through it.

The same edit lets one printed code serve successive campaigns: change the destination and its `utm_campaign` each season, and GA sees clean campaign boundaries while the code on the sign stays the same.

## Checking that it works

Before printing, scan a proof and watch GA's realtime report. The session should appear with the source and medium you set. If it shows as direct, the tags are on the wrong URL or are misspelt; if it does not appear at all, the destination page's tag is not loading on that browser, which is a page problem rather than a QR one.

Then check the QRly side: the same scan should appear in the link's analytics with no referrer, which is how a camera scan looks. If you put nothing on the short link, the campaigns panel will be empty, and that is correct.

## Reading the two dashboards together

QRly's dashboard answers **how many people scanned, where, when and on what phone** — with no cookie and no script, which is why it is the same regardless of consent banners or ad blockers on your site. GA answers **what they did after arriving**, subject to whatever share of visitors its script was allowed to see.

Expect the QRly number to be higher. Some scans bounce before the page loads; some phones block the analytics script; some visitors decline consent. The gap between the two, per placement, is itself informative: a large gap on one placement and a small one on another often means the destination page is slow on the connection people have at that placement, which the [network and device breakdown](/blog/qr-code-device-analytics) will usually confirm.

## Frequently asked

**Do UTM parameters make the QR code harder to scan?**
Only if they are inside the code. On a dynamic code they live in the destination, and the code contains just the short link, so the module count is unchanged.

**Can I use UTMs with a static QR code?**
Yes: encode the full tagged URL. The code gets denser, the tags are permanent, and nothing counts the scan except GA. It works, and it is the right choice when you have no redirect at all.

**Why does Google Analytics still show my QR traffic as direct?**
Usually one of: the tags are on the short link rather than the destination; `utm_source` or `utm_medium` is missing; or the destination redirects again on your side and drops the query string. Test with the realtime report on a proof.

**Does QRly forward query parameters from the short link to the destination?**
No. The redirect goes to the stored destination as saved. Tags on the short link are recorded in QRly's campaigns panel and go no further. Put tags meant for your site on the destination URL.

**What if my site uses Plausible, Matomo or Fathom instead of GA?**
Same tags, same place. All of them read the standard UTM parameters from the landing URL.
