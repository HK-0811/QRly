---
title: Safe Browsing and QR codes: how a link checker catches bad destinations
description: How Google Safe Browsing works in outline, how QRly checks every destination at creation and weekly, which addresses it refuses, and what it says when it cannot check.
date: 2026-09-19
category: privacy
keywords: qr code safe browsing, qr code link checker, malicious qr code detection, google safe browsing qr code, qr code url scanner, check qr code for malware, qr code destination check
---

A dynamic QR code contains a short link, and the service behind that link decides where a scan ends up. That makes the service an open redirect: anyone can point one of its links at anything. The only thing that separates a useful product from phishing infrastructure someone else runs for free is what the service refuses to redirect to.

This post is about that layer on QRly: the Google Safe Browsing check, the schedule it runs on, the addresses that are refused before any check is needed, and the cases where the honest answer is "not checked". The code for all of it is [public](https://github.com/HK-0811/QRly), so nothing here has to be taken on trust.

## What Google Safe Browsing is

Safe Browsing is a set of lists Google maintains of URLs known to be dangerous, sorted into categories: malware, social engineering (phishing and deceptive pages), unwanted software, and potentially harmful applications. Chrome, Safari and Firefox all consult these lists, which is why a browser sometimes shows a full-page red warning before a site loads. The lists are built from Google's own crawling and from reports, and they change continuously.

Anyone can query the lists through an API. The Lookup API sends a URL to Google and gets back whether it matches any list; the Update API downloads hashed prefixes so matching can happen locally. QRly uses the Lookup API: it sends the destination URL and receives either nothing, meaning no match, or the threat types it matched. What is sent is the address the code's owner typed. Nothing about any person who scans the code is involved, and the check runs when the link is made or re-checked, not when it is scanned.

A page that has been phishing people for a day is very likely listed. A page registered this morning is very likely not. Any link checker built on threat lists inherits that lag, and a checker that implies otherwise is overselling.

## When QRly checks

**At creation.** When a destination is saved, its URL is sent to Safe Browsing and the verdict is stored with the link as one of three states: clean, flagged, or unchecked. A flagged destination gets a link, but not a working redirect; see below.

**Weekly, for every link.** A scheduled job runs once a week and re-checks every stored destination in batches. This is the check that matters most, because the common failure is not a link that was bad on day one. It is a link that was clean when the poster was printed and whose destination was compromised, expired and re-registered, or quietly repurposed months later. The printed code cannot be recalled, so the re-check is the only defence that reaches it. A link whose verdict changes is updated, and the cached copy at the edge is overwritten straight away rather than waiting for its TTL to expire, so a newly flagged link starts serving the warning page immediately.

**On edit.** Changing a link's destination from the dashboard is a new destination, and it is checked like a new link.

## What happens to a flagged link

It keeps resolving. A link printed on a thousand leaflets and later flagged does not become a 404, because a dead address tells the person scanning nothing. Instead the redirect engine serves a warning page: this destination has been reported as unsafe, and here is the address it would have gone to, so that someone who genuinely needs it can decide for themselves. The link's owner sees the status on the dashboard and can change the destination, which triggers a fresh check.

A web link can be edited in place. A printed code is fixed, and the service's job is to make sure that fixed thing keeps saying something useful.

## What is refused before any check

Safe Browsing answers "is this a known bad page". A separate, older question is "is this even a legitimate place for a public code to point", and that one is answered locally, with no network call, before a link is ever saved. The rules, in order:

| Refused | Why |
|---|---|
| Any scheme other than `http`, `https`, `mailto`, `tel` or `sms` | `javascript:`, `data:` and `vbscript:` are instructions to the browser, not addresses |
| A URL with a username or password in it | `https://paypal.com@attacker.example` is a phishing pattern with no legitimate use here |
| `localhost` and its aliases, and names ending `.local`, `.internal`, `.home.arpa` or `.onion` | Never a public destination |
| Cloud metadata hostnames such as `metadata.google.internal` | An attack against whoever scans from inside a cloud network |
| Private IPv4 ranges: `10/8`, `172.16/12`, `192.168/16`, loopback, link-local, carrier-grade NAT, multicast, reserved | A code pointing at `192.168.1.1/admin` is an attack on whoever scans it on that network |
| The same addresses written as a single decimal, octal or hexadecimal number | `http://2130706433/` is `127.0.0.1` to a browser; blocking only the dotted form leaves the obvious bypass open |
| Private IPv6: `::1`, link-local `fe80::`, unique-local `fc00::/7`, and IPv4-mapped `::ffff:` addresses re-checked as IPv4 | Same reasoning, different notation |
| A hostname with no dot | An intranet name or a typo, either way not public |
| Control characters, or anything over 2,048 characters | An encoding bug or a header-splitting attempt |

Each refusal comes back with a message written for the person pasting the URL, not for a log file, so a genuine mistake is easy to correct.

One limit is worth stating plainly. These rules inspect the address as written. They cannot catch a public domain name that resolves to a private address, because that would require resolving it at creation and again at every scan, and an attacker controls the DNS record's lifetime. The 302 model contains the damage: the service never fetches the destination itself, so it cannot be used as a probe into anyone's network. The scanner's own browser makes the request, from its own network, which is the same exposure as any link.

## "Unchecked" is a real answer

Safe Browsing is a third-party network call on a path that has to work when Google does not. So a failed check never blocks link creation. If the API is unreachable, times out, or returns an error, the link is saved with the status unchecked, and the weekly sweep picks it up.

The same applies if the service is running without a Safe Browsing key configured, which can happen on a self-hosted copy, since the API is free but requires a Google Cloud project. In that case every link is unchecked, and that is what the status says. It does not say clean.

This sounds like a small thing and it is the whole point. A link checker that reports "clean" when it could not check is worse than no checker, because it manufactures confidence. The three states exist so the dashboard can tell the truth: this was checked and passed, this was checked and failed, or this has not been checked yet.

## What it does not do

Because a reader who catches one overclaim distrusts the rest:

- It does not catch a phishing page that is not yet on the lists. Threat lists lag new domains. The preview check on the phone, described in [check where a QR code goes before scanning](/blog/check-where-a-qr-code-goes-before-scanning), is still the scanner's job.
- It does not inspect the destination page's content. The check is a list lookup, not a scan of the page.
- It does not check pages the destination itself redirects to, only the address stored on the link.
- It does not stop someone putting a different code, from a different service, over yours. [Quishing](/blog/qr-code-phishing-quishing) covers what an organisation can do about that, chiefly using a [custom domain](/blog/custom-domain-qr-code) so its codes are recognisable.

What it does is remove the known bad and the structurally bad, on every link, every week, for free, with a status you can read on the dashboard and code you can read on GitHub. That is the part a platform can do. [Are QR codes safe](/blog/are-qr-codes-safe) puts it next to the parts only the scanner can do.

## Frequently asked

**Does QRly check QR code links for malware?**
Every destination is checked against Google Safe Browsing when it is saved and re-checked weekly. A flagged destination resolves to a warning page instead of redirecting. If a check cannot run, the status is unchecked, never clean.

**Can I check a QR code link myself before scanning?**
Yes. Read the domain from your phone's camera preview, and for a short link, paste it into a link-expander service to see the final address before visiting it. If the destination is on Safe Browsing's lists, Chrome, Safari and Firefox will also warn you when the page loads.

**Why does QRly refuse a link to my local server?**
Private and local addresses, in any spelling, are never a legitimate destination for a public code, and a code pointing at one is an attack on whoever scans it inside that network. Use a public hostname, or a tunnelling service that gives you one, for testing.

**What happens if a destination becomes malicious after I print the code?**
The weekly re-check catches it if Safe Browsing lists it. The link then serves a warning page rather than the destination, and you can change the destination from the dashboard, which takes effect at the edge in under a minute.

**Is the Safe Browsing check a privacy concern for people scanning?**
No. The check sends the destination URL that the link's owner typed, and only at creation and during the weekly sweep. Nothing about any individual scan, and no scanner's address, is sent to Google.
