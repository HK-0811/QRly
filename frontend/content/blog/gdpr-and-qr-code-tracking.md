---
title: GDPR and QR code tracking: where scan analytics stand on privacy law
description: Scan counting at a redirect sets no cookie and can discard the IP address, which is different ground from pixel tracking. What GDPR asks, what QRly does, and the limits.
date: 2026-09-19
category: privacy
keywords: gdpr qr code, qr code tracking gdpr, qr code analytics privacy law, qr code consent, qr code data protection, qr code analytics gdpr compliant, eprivacy qr code, qr code personal data
---

Nothing here is legal advice. It is a description of how QR scan analytics work mechanically, which parts of that touch data-protection law, and what a service can do to keep the footprint small. Whether your particular use is compliant is a question for whoever advises your organisation, and they will want the mechanics first.

The mechanics are the good news. Counting a QR scan is done at a redirect, one of the least invasive things a server can do. Most of what makes web analytics a compliance problem is absent from it by construction. Most, not all.

## What a scan actually processes

Scanning a dynamic code sends one HTTP request to the redirect service, which replies with a 302 and the destination. [Do QR codes track you](/blog/do-qr-codes-track-you) walks through what that request contains: an IP address, a user-agent string, a language header, sometimes a referrer, and the link's own URL with any campaign parameters.

Of those, the IP address is the one that matters legally. Recital 30 of the GDPR names online identifiers, including IP addresses, as something that can make a person identifiable, and the Court of Justice held in 2016 that a dynamic IP address can be personal data for a website operator. So the moment a scan arrives, a redirect service is handling personal data, whatever it does next. A request without an address cannot be answered.

What happens next is the design choice, and it is where services diverge.

## Why a redirect is different from a pixel

The web analytics that produced the cookie banner works by putting something on the visitor's device: a cookie, a local-storage key, a fingerprinting script. The rule that requires consent for that is not in the GDPR at all. It is Article 5(3) of the ePrivacy Directive, which covers storing information on, or reading information from, a user's terminal equipment. The UK's PECR carries the same rule.

A redirect stores nothing on the device and reads nothing from it. It cannot: the browser receives the redirect and leaves before any page, and therefore any script, could load. There is no cookie to consent to, so the mechanism that requires a banner never engages. [QR codes and cookie consent](/blog/qr-codes-and-cookie-consent) goes through this in detail.

That leaves the GDPR itself, which is about processing personal data rather than about devices. The question becomes: what is kept, on what basis, for how long, and can the person be identified from it?

| | Cookie or pixel analytics | Scan counting at a redirect |
|---|---|---|
| Stores something on the device | Yes | No |
| Needs ePrivacy consent for that storage | Yes, unless strictly necessary | Not applicable |
| Can recognise the visitor across sites | Often, by design | No; it sees one request for one link |
| Can recognise the visitor across days | Yes, for the life of the cookie | Only if the IP or a stable hash is stored |
| Runs code on the visitor's device | Yes | No |
| Processes an IP address at all | Yes | Yes, unavoidably |

The remaining exposure in the right-hand column is the IP address, and whether anything derived from it can identify someone later.

## Data minimisation, applied to a scan

Article 5(1)(c) says personal data should be limited to what is necessary. Article 5(1)(e) says it should be kept no longer than necessary. Recital 26 says data that no longer relates to an identifiable person is outside the regulation entirely. Together these are a recipe:

**Derive, then discard.** The IP address is needed for a fraction of a second, to look up a country and a city and to name the network operator. After that it has no analytics value the derived fields do not already carry. QRly uses it for those lookups and for the daily identifier, and then it is gone: not written to the scan row, not written to any log. The retained record has a city and a network name, which describe a place and a company, not a person.

**Make the identifier expire by construction.** Telling a repeat scan from a new one needs some identifier. QRly computes a truncated hash of the IP, the user-agent, the link and a salt regenerated every 24 hours, mixed with a server-side secret. Nobody, including the operator, can match yesterday's values against today's, and the same person scanning two different links produces unrelated values. The consequence, stated on the dashboard, is that "unique visitors" means unique per day. A longer-lived number would require keeping something that identifies.

**Honour the signals the browser sends.** A request carrying `Sec-GPC: 1` or `DNT: 1` is recorded by QRly with no visitor identifier, no postal code or coordinates and no raw user-agent. The scan still counts, as a count with a country and a device class.

**Give the controller a retention window.** GDPR does not say how long is too long; it says no longer than necessary, and leaves the controller to decide. QRly makes retention a per-account setting, one year by default and anywhere from one day to ten years, with a nightly job that permanently deletes older scan events. Deleting a link deletes its history. Deleting an account deletes everything.

**Publish the field list.** Transparency obligations under Articles 13 and 14 are easier to meet when the processor has already written down what is recorded and what is deliberately not. [The privacy page](/privacy) is that list, including the fields that were possible and left out.

## Where responsibility sits

If you print a QR code and read its scan data, you are the controller of that data in the usual reading: you decided to collect it and why. The redirect service is processing it on your behalf. That has two practical consequences.

First, the lawful basis is yours to choose and document. Aggregate scan counting, with the address discarded and no cross-site tracking, is the kind of processing organisations commonly put under legitimate interests, with a short assessment on file. Whether that is right for your case is what your advisor exists for; the point here is that it is a different and much easier assessment than the one for a cookie-based analytics suite.

Second, the destination page is a separate matter. The QR platform covers the redirect. Whatever happens on the page you send people to, including its cookies, scripts and forms, is your website's compliance question. [QR code UTM parameters and Google Analytics](/blog/qr-code-utm-parameters-google-analytics) is worth reading with that in mind: campaign parameters in the URL are harmless in themselves, but the analytics tool that reads them on the landing page is where the banner lives.

## The honest limits

A post like this is only useful if it says where the argument stops.

The IP address is still processed, for the moment it takes to derive the fields. Discarding it immediately is the minimisation the regulation asks for, but it is not the same as never having it.

City-level location plus a device model plus a timestamp is aggregate for a busy link and much less so for a quiet one. A code that gets one scan a week, from a small town, on an unusual phone, describes a person more closely than the field list suggests. The retention window limits how far that goes, but the controller should know it.

The service runs on Cloudflare and Supabase, which see the request and hold the database respectively. Both are named on the privacy page. Where data is stored, and whether that suits your organisation's transfer requirements, is a question to ask before adopting any hosted tool, this one included.

And QRly is a free, [open-source](https://github.com/HK-0811/QRly) project deliberately sized for a thousand or two users, run by one person. If your procurement process needs a signed data-processing agreement with every processor, a project that size is not going to supply one. Better to know that before the code is on the packaging.

> A redirect can be designed so that the retained data describes a place, a device and a time, and not a person. That is a smaller thing to justify than a cookie, and it is the thing worth asking a provider for.

## Frequently asked

**Do QR codes need a cookie banner under GDPR?**
Cookie banners come from the ePrivacy Directive, which covers storing information on a device. A redirect stores nothing on the device, so counting the scan does not trigger that rule. The page the code sends people to is a separate question with its own answer.

**Is QR code tracking personal data?**
The request that arrives carries an IP address, which can be personal data. What a service retains is the design choice: QRly discards the address and keeps a city, a device class, a network name and a timestamp, with a visitor identifier that expires every 24 hours.

**Do I need consent to track QR code scans?**
Consent is one lawful basis of several. Aggregate scan counting with no device storage and no cross-site identifier is the kind of processing organisations often document under legitimate interests instead. Take that to whoever advises you, with the field list from the privacy page.

**How long should QR scan data be kept?**
No longer than the purpose needs. On QRly the window is a per-account setting, one year by default, and a nightly job deletes older events permanently.

**Is QRly GDPR compliant?**
Compliance belongs to a use, not a tool. What can be said is what the tool does: no cookie, no script, IP discarded after lookup, a daily-expiring identifier, GPC honoured, configurable retention, a published field list and open source to check it all against. Whether that fits your processing is your assessment.
