---
title: Open source QR code generator — libraries, platforms, what open buys
description: Open-source QR libraries are everywhere; open-source dynamic QR platforms are rarer. What each gives you, why it matters for printed codes, and where MIT QRly fits.
date: 2026-09-19
category: comparisons
keywords: open source qr code generator, open source dynamic qr code, qr code generator github, mit licence qr code, self hosted qr code, qr code library, free qr code generator open source
---

Search *open source QR code generator* and you get two very different kinds of result mixed together. One is a library: a few hundred lines that turn a string into a grid of modules, which every language has had for fifteen years. The other is a platform: the redirect engine, database, dashboard and analytics that make a QR code *dynamic*. The first is a commodity. The second is where open source starts to mean something for the person printing the code.

## The QR code itself is already open

The QR symbology is an ISO standard (ISO/IEC 18004), and Denso Wave, which invented it, has declined to enforce its patents against implementations. Consequently the encoder is a solved problem in every ecosystem.

A few of the widely used libraries, named so you know where to look rather than as a ranking:

- **ZXing** ("zebra crossing"), the Java library behind a great many Android scanners, with ports to most other languages.
- **libqrencode**, the C library that powers the `qrencode` command-line tool on Linux and macOS.
- **qrcode** on npm and **qrcode** on PyPI, the defaults for JavaScript and Python respectively.
- **Nayuki's QR Code generator**, a small, carefully written implementation available in several languages, often used as a reference.
- **qrcode-generator** and **qr.js**, the browser-side options that most web "generators" are thin wrappers around.

If your need is *turn this text into a QR image*, any of these does it in a millisecond and you owe nobody anything. Every code they produce is static: the payload is whatever string you passed in, and the [error correction](/blog/qr-code-error-correction-explained), version and mask are chosen by the library. That is the right tool for Wi-Fi codes, vCards, serial numbers, and a link to a page that will never move.

What a library does not give you is anything that happens *after* the scan. There is no redirect, so there is no editing, no counting, and no "change the link after printing". For that you need a running service, and that is where the second meaning of open source comes in.

## What an open-source platform is

A dynamic QR code is a short link. The code encodes `example.com/abc123`, a server looks `abc123` up in a database, and answers with a 302 redirect to wherever the link currently points. Everything a dynamic-code vendor sells — editable destination, scan analytics, custom domains — is a feature of that server, not of the code. The [redirect explainer](/blog/qr-code-redirect-explained) goes through the mechanics.

An open-source *platform* is that server, with its schema and dashboard, published under a licence that lets you read it, run it and change it. Several open-source URL shorteners have grown QR features (YOURLS, Shlink and Kutt are the names that come up most), and they work well if what you want is primarily a shortener. A QR-first platform adds the parts a shortener does not think about: the design studio, print-oriented export, the scannability checks, and analytics shaped around physical scans rather than clicked links.

QRly is one of those. It is a dynamic QR code generator published under the MIT licence at [github.com/HK-0811/QRly](https://github.com/HK-0811/QRly). The stack is Cloudflare Workers for the redirect engine and API, Supabase (Postgres and auth) for storage, and Next.js for the dashboard, all chosen because they run on free tiers, which is what lets the hosted copy at qrly.lol cost [nothing to operate](/cost).

## What "open source" buys a user

This is the part worth being precise about, because "open source" on a landing page is sometimes a badge and sometimes a material fact. For someone whose code is about to be printed on ten thousand boxes, it changes four things.

**Auditability.** The privacy claims on any QR platform are claims about what the redirect does with a scan. With closed source, you trust the privacy policy. With open source, you read the handler. QRly's [privacy page](/privacy) says that no cookie is set, no script runs on the phone, and the IP is used to derive a country and a daily-rotating visitor hash and then discarded. The repository is where you check that this is what the code does.

**No lock-in.** A printed code cannot be changed, so whoever controls its hostname controls it. If the platform is open source and deployable, then the worst case — the hosted service disappearing — has a remedy: deploy the same code under the same hostname and every printed code keeps working. Combined with a [custom domain](/blog/custom-domain-qr-code), the printed code contains *your* hostname, and the platform underneath it becomes replaceable. This is the strongest form of "no expiry" there is: not a promise, but an exit.

**Run your own.** Some organisations cannot let scan data leave their infrastructure, or need a redirect to keep working for a decade with no vendor in the loop. An open-source platform can be deployed in their own accounts. The [self-hosting guide](/blog/self-hosted-qr-code-generator) is honest about what that involves.

**Verifiable pricing.** A claim like "this is free with no catch" is usually marketing. When the infrastructure is visible — which cloud, which tier, which quotas — the claim becomes checkable arithmetic. The [running a platform for free](/blog/running-a-qr-code-platform-for-free) post walks through QRly's numbers.

What open source does *not* buy you, and it would be dishonest to imply otherwise: support, uptime guarantees, or a roadmap you can influence by paying. Those come from a company with staff. A licence file does not answer a support ticket.

## Library vs platform: which do you need

| You want | Reach for | Notes |
|---|---|---|
| A code from a string, inside your own app | A library | Static; pick the one native to your language |
| Wi-Fi, vCard, plain text, payment strings | A library or any static generator | These are not URLs; there is nothing to redirect |
| A link that might change after printing | A platform | Dynamic; encodes a short link |
| Scan counts, countries, devices | A platform | Only a redirect can see the scan |
| Thousands of codes from a script | A library, with short links from a platform if they must be editable | The library draws, the platform redirects |
| Codes that must outlive any vendor | A platform on your own domain | Open source makes the platform replaceable |

The two are not competitors. QRly's own front end draws its codes in the browser with a rendering library; the platform's value is the redirect, the analytics, and the fact that the printed code can be edited a year later.

## Reading a repository before you trust it

If you are evaluating any open-source QR platform, five minutes in the repository tells you more than the landing page.

1. **Licence.** MIT, Apache 2.0 and BSD let you run and modify it freely. AGPL requires publishing your changes if you offer it as a service. "Source available" licences may forbid running it commercially at all. QRly is MIT.
2. **The redirect handler.** Find the code path that serves a short link. Look for what it stores about the scan. That file is the whole privacy policy.
3. **Status codes.** The redirect should be a 302 (or 307), never a 301. A 301 tells browsers to cache the destination permanently, which quietly breaks "edit after printing". The [immutable short link](/blog/why-qr-code-short-links-must-be-immutable) post explains the related rule about slugs.
4. **A deploy path.** A README that gets from clone to running in an afternoon is the difference between "open source" and "source published".
5. **Tests that run against a real deployment.** They tell you the author runs the thing, not just publishes it.

## Frequently asked

**What is the best open source QR code generator?**
For static codes inside your own software, the library native to your language: ZXing for Java, `qrcode` for Python or Node, libqrencode for C and the command line. For dynamic codes with editing and analytics, you need a platform rather than a library; QRly is an MIT-licensed one, and several open-source URL shorteners also produce QR codes.

**Is there an open source dynamic QR code generator?**
Yes. A dynamic generator is a short-link service with a QR front end, and open-source versions exist. QRly is one, published on GitHub, running on Cloudflare Workers, Supabase and Next.js, with a hosted copy that is free to use and needs no account.

**Can I use a GitHub QR code library for commercial work?**
Almost always. The major libraries are MIT, Apache or BSD licensed, and the QR format itself is an open ISO standard with patents that Denso Wave has said it will not enforce. Check the licence file of whichever you pick.

**Does open source mean the QR codes are free?**
The library is free; the code it produces is yours. A hosted platform built from open source can charge for hosting if it wants to. QRly's hosted service happens to be free because it runs on free cloud tiers, and the source lets you verify that rather than take it on trust.

**Why does it matter whether the platform is open source if I am not going to read the code?**
Because someone else can, and because you could deploy it yourself if you ever had to. For a printed code that cannot be recalled, the ability to keep the redirect alive without the original vendor is the one guarantee that does not depend on anyone's goodwill.
