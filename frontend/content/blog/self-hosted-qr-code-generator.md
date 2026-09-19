---
title: Self-hosted QR code generator — host your own QR redirect, and the cost
description: Self-hosting a dynamic QR code generator means running a redirect on a domain you own, with a database and TLS. Why people do it, what it takes, and the ops you inherit.
date: 2026-09-19
category: comparisons
keywords: self hosted qr code generator, host your own qr code redirect, self hosted url shortener qr, self host dynamic qr code, qr code redirect server, own domain qr code
---

A dynamic QR code is a printed short link and a server that redirects it. The code can be made anywhere; the server is the thing you depend on. Self-hosting means running that server yourself, on a domain you own, so that nobody else's pricing page, acquisition or shutdown can change where your printed codes go.

## Why someone self-hosts

Three reasons come up, and they are all legitimate.

**Control.** A printed code is immutable. Whoever owns the hostname inside it owns the code. If that hostname is a vendor's, you can only ever do what the vendor permits, for as long as they permit it. If it is yours, the redirect target is yours to change, keep, or move to a different platform entirely. The [immutable short links](/blog/why-qr-code-short-links-must-be-immutable) post explains why the slug and hostname can never change once printed.

**Longevity.** Codes on packaging, equipment tags, signage, museum plaques and headstones need to work for a decade or more. No SaaS vendor can credibly promise that, and most of the ones that existed ten years ago do not exist today in the same form. A redirect you run yourself works for as long as you renew the domain and keep the service up, which is a promise you can actually make.

**Privacy.** Every scan of a dynamic code hits the redirect with the scanner's IP, user agent and language. Some organisations — healthcare, education, public bodies, anyone under a strict data-processing regime — cannot let that request land on a third party's server at all. Self-hosting puts the scan on infrastructure they control, and the [GDPR post](/blog/gdpr-and-qr-code-tracking) covers why the redirect is the point of exposure.

If none of those three describes you, a hosted service on a [custom domain](/blog/custom-domain-qr-code) gets you most of the control benefit with none of the operations, and you should probably stop reading here.

## What it takes

A self-hosted dynamic QR system has four parts. None is exotic, but all four have to exist and keep existing.

**A domain you own.** The hostname in every printed code. Something short, because it is encoded into the code and [shorter URLs make smaller, more robust codes](/blog/why-short-urls-make-better-qr-codes). Once printed it is permanent, so pick one you will still want in fifteen years, and set the registrar to auto-renew with a payment method that will not lapse.

**A redirect service.** Something that receives `GET /abc123`, looks up `abc123`, and answers `302 Location: <destination>`. It must be a 302 or 307, never a 301; a 301 lets browsers cache the destination and the "edit after printing" feature silently stops working for anyone who has scanned before. It must also be fast at the edge, because a scanner is standing in a car park waiting. The [redirect at the edge](/blog/how-qr-code-redirects-work-at-the-edge) post explains how QRly does this with a key-value cache in front of the database.

**A database.** The slug-to-destination mapping, the owner of each link, and — if you want them — the scan records. For a small deployment this is any Postgres.

**TLS.** Phones follow `https://` links without complaint and increasingly warn on `http://`. You need a certificate for the redirect hostname, and automated renewal, because a lapsed certificate is a broken code for every scanner at once.

Beyond those four: a dashboard so someone who is not you can edit a destination, some form of authentication, and backups of the database, because the database *is* the codes.

## Deploying QRly on free tiers

QRly is built to be deployed from its repository, and its hosted copy runs on exactly the setup you would use: two Cloudflare Workers (the redirect engine and the Next.js dashboard), a Supabase project for Postgres and auth, and a Cloudflare KV namespace as the redirect cache. All of it is on free tiers, which is why the hosted service [costs nothing to run](/cost) and why the same is true for your copy.

The [README](https://github.com/HK-0811/QRly) covers deployment step by step. In outline:

1. Create a free Supabase project and apply the SQL migrations in order.
2. Create the KV namespace and set the Worker secrets — Supabase keys, a visitor-hash pepper, and optionally a Google Safe Browsing key (without it, destinations are marked "unchecked", never falsely "clean").
3. Deploy the backend Worker and the dashboard Worker, either from your machine with Wrangler or through Cloudflare's git-connected builds.
4. Point your domain at the backend Worker. Custom domains for your *users* additionally need a Cloudflare zone and an API token scoped to certificate management.

Two operational details from the README are worth knowing before you start, because they are where free tiers bite:

- **Supabase pauses free projects after about a week of inactivity.** QRly has a daily cron in the Worker that touches the database to prevent this. If you disable the cron, a quiet deployment will go to sleep and every code will fail until someone wakes it.
- **KV writes are capped daily on the free tier.** Every cache fill is a write, so the redirect cache TTL is an hour rather than a minute. Destination edits bypass the cache and reach every edge in under 60 seconds regardless; the TTL only governs how long an *unedited* entry is served from cache. The [caching and propagation](/blog/qr-code-caching-and-propagation) post explains the trade-off.

At the scale QRly is designed for — a thousand or two users, a few million scans a year — the free tiers hold. If you outgrow them, the same code runs on paid tiers of the same services, and the bill is predictable.

## The honest cost: you own the ops

A hosted service has someone whose job it is to notice when it breaks. Once you self-host, that someone is you, for the entire life of every printed code. Concretely:

- **Domain renewal.** One missed renewal and every code you ever printed is dead, possibly to a domain squatter. This is the single largest risk and it is entirely administrative.
- **Certificate renewal.** Automated on Cloudflare, but automation fails silently when an API token expires or a zone setting changes.
- **Provider changes.** Free tiers change their terms. A quota that was generous becomes tight; a feature moves to a paid plan. You will have to read the announcement emails.
- **Dependency updates.** The platform's dependencies will need updating for security. Nobody does this for you.
- **Backups.** Supabase keeps some on paid tiers; on the free tier, schedule your own dump. The database is the only copy of what every code points to.
- **Monitoring.** You need to know when a redirect starts returning errors. A scanner will not tell you; they will just leave.

Set against that: an open-source platform on your own domain is the only setup where a printed code has no single point of commercial failure. You can swap the platform underneath, the cloud underneath the platform, or the person underneath both, and the code keeps scanning.

> Self-host when the codes must outlive any vendor and you can commit to the maintenance. Use a hosted service on your own domain when you want the exit without the pager.

## A middle path

For most people the right answer is neither pure SaaS nor pure self-host. It is a hosted platform with a custom domain, where the printed code contains your hostname and the platform behind it is open source. You get someone else running it day to day, and the exit — deploying the same code under the same hostname — if you ever need it.

QRly supports that on its free tier: [make a code](/create), add `qr.yourbrand.com` with one CNAME record, and the certificate is issued for you. The README and the dashboard walk through the steps. If the day comes when you want to bring it in-house, the repository is the same one the hosted service runs.

## Frequently asked

**Can I host my own QR code redirect?**
Yes. A dynamic QR code is a short link, so any redirect service on a domain you own will do it. You need the domain, a service that answers 302 redirects, a database for the mappings, and a TLS certificate with automated renewal. QRly can be deployed from its repository for this.

**Is a self-hosted URL shortener the same as a self-hosted QR code generator?**
Mostly. The redirect is identical. A QR-focused platform adds print-oriented export, design controls with scannability checks, and analytics shaped around physical scans, which a shortener typically lacks. If you already run a shortener, you can generate codes from its links with any static generator.

**What does it cost to self-host a QR code generator?**
On Cloudflare Workers and Supabase free tiers, the cash cost is the domain name. The real cost is time: renewals, updates, backups and monitoring, for as long as any printed code is in the world.

**Do I lose analytics by self-hosting?**
No. The scan still passes through your redirect, so everything a hosted service could record, you can record. QRly's analytics work the same way on a self-hosted copy, with the same privacy model: no cookie, no script on the phone, IP discarded after deriving geography.

**What if I self-host and then want to stop?**
Because the printed codes contain your hostname, you can move the redirect to any other platform — hosted or not — that will serve your domain. That portability is the main reason to own the hostname in the first place.
