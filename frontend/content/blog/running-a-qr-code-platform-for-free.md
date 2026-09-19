---
title: Running a QR code platform for free: build notes from QRly's $0 stack
description: How a dynamic QR code service with analytics and custom domains runs on Cloudflare Workers, KV and Supabase free tiers, and which ceiling binds first.
date: 2026-09-19
category: advanced
keywords: how to run a qr code service for free, cloudflare workers qr code, supabase qr code, free tier architecture, open source qr code platform, qr code redirect cloudflare kv, self host qr code generator
---

A dynamic QR code is a database row and an HTTP 302. The analytics behind it are fields the edge network has already computed and hands over with every request. None of that needs a server you pay for, and QRly is the working proof: a complete platform with a redirect engine, dashboard, auth, analytics, TLS and custom domains, operating at [$0 a month](/cost), with [the source open](https://github.com/HK-0811/QRly) under MIT so the claim can be checked rather than believed.

These are the build notes. What runs where, which free-tier ceiling is the real one, and the two or three decisions that turned out to be load-bearing.

## One hostname, two Workers, one database

Everything at `qrly.lol` enters through a single Cloudflare Worker. That Worker owns the hostname and does three jobs: it is the redirect engine, it exposes the privileged write endpoints the dashboard uses, and it runs the scheduled jobs. It is written in Hono, and the whole thing is small enough that the redirect path pulls in a cache client, a user-agent parser and a geo extractor and nothing else.

The dashboard is a second Worker: a Next.js 15 application built with the OpenNext adapter, so it runs as a Worker rather than on Pages. The backend Worker forwards an enumerated set of paths to it, the dashboard's pages, its build output and the favicon, over a service binding, which is an in-process call with no network hop. Everything not on that list is treated as a slug and goes to the redirect engine.

That ordering is forced. Slugs are arbitrary and unbounded, so the catch-all has to belong to the redirect engine, which means every dashboard route has to be listed explicitly. A script in the repository reads the real Next.js route files and fails if the forwarding list, the frontend and the reserved-slug list disagree, because forgetting the first turns a new page into a 404 and forgetting the last lets someone print a QR code that resolves to your settings page.

Behind both Workers is one Postgres database on Supabase, with Supabase Auth for accounts.

## Who talks to the database

Two decisions here look arbitrary until you know why.

**Reads go from the browser to Supabase directly.** Row-level security policies enforce that an account can only see its own links and scans, and the RLS suite in the repository tests that adversarially with two real signed-in accounts. A read proxy through the Worker would be code with no security value, so there is none.

**Link writes always go through the Worker.** Not for security. Because the Worker owns the edge cache, and a dashboard writing straight to Postgres would leave that cache serving a stale destination for up to an hour. [Caching and propagation](/blog/qr-code-caching-and-propagation) has the details; the rule that falls out is that whoever owns the cache owns the writes.

The service key that bypasses RLS lives in Worker secrets and nowhere else. A test greps the built browser bundle to prove it is not there.

## The redirect path and the cache

A scan hits the Worker at the nearest Cloudflare location, which checks the hostname against the set the platform serves, looks the slug up in Workers KV, and sends a 302. On a miss it queries Postgres and writes the result back into KV. The scan record is written after the response, inside `waitUntil`, so a slow or failing analytics insert never delays a person following a redirect. [How the redirect works at the edge](/blog/how-qr-code-redirects-work-at-the-edge) walks the path step by step, with the timing budget.

The single most valuable property of the design falls out of the cache: if Supabase is down and the cache is warm, redirects keep working. Analytics rows for that window are lost, and the posters keep working.

## Scheduled jobs

Two cron triggers on the backend Worker.

- **Daily:** a Supabase keep-alive and the retention purge. The keep-alive exists because a free Supabase project pauses after seven days without activity, which would take the service down precisely when nobody was looking. The purge deletes scan rows older than each account's retention window, default one year, which is what keeps the database inside its free allowance.
- **Weekly:** a Google Safe Browsing re-check of every destination. Destinations are checked at creation and again each week, because a page that was clean when the code was printed can be compromised later. If no key is configured, links report *unchecked*, never a false *clean*.

Each run writes a row to a `cron_runs` table, so whether the jobs are landing is one query away.

## The ceilings

Every limit in the system is a free-tier limit. This is the table from the project's own notes.

| Service | Free allowance | What it means at target scale |
|---|---|---|
| Supabase Postgres | 500 MB | Roughly a million scan events with indexes; the retention purge keeps it under |
| Supabase Auth | 50,000 monthly active users | Far beyond the thousand or two the platform is sized for |
| Cloudflare Workers | 100,000 requests a day | 100,000 scans a day, dashboard traffic included |
| Workers KV reads | 100,000 a day | Comfortable |
| Workers KV writes | 1,000 a day | The binding constraint |
| Cloudflare for SaaS | A free allowance of custom hostnames | Beyond it, a small monthly charge per hostname |

The one that binds is KV writes. A cache fill is a write, so writes scale with the number of *hot links*, links scanned at least once per cache lifetime, not with scans. At the one-hour TTL a continuously hot link costs 24 writes a day and around forty links can stay hot at once. The TTL was originally 60 seconds, which would have let a single busy poster exhaust the entire day's budget on its own, and the measurement tool is what found it.

That tool, `check-ceilings.mjs`, runs against the live database and reports headroom for each row above rather than asserting it. A number in a document is an opinion; a number from a query is a fact, and the point of the project is that the $0 claim should be a fact.

Rate limiting is the other place the free tier shows. It is per isolate, meaning each Worker instance keeps its own counters, because a shared counter would need a paid product. The comment at the top of that file says exactly what that buys and what it does not.

## Custom domains for nothing

A customer adds `qr.theirbrand.com`, points one CNAME at the platform, and Cloudflare for SaaS registers the hostname and issues the certificate. Verification checks DNS across two resolvers and reports what it found, because a bare "verification failed" is why most people give up on custom domains. Registration state and certificate state are reported separately, so *never registered* cannot masquerade as *still issuing*. [Custom domain QR codes](/blog/custom-domain-qr-code) covers the customer side.

Once the hostname exists it can never be removed, because printed codes carry it. [Why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) covers the database triggers that enforce the same rule on slugs.

## What is deliberately not there

Scale beyond a thousand or two users. Teams. A public API. Bulk import. Password-protected codes. Each would push against a ceiling or add a surface, and the project's scope document says so. [Why dynamic QR codes cost money](/blog/why-dynamic-qr-codes-cost-money) is the argument about what the incumbents are charging for; this stack is the argument about what they are not.

The one real cost is the domain registration, which is excluded from the $0. Everything else is free tier.

## Running your own

The repository has a quick start: Node 22, a free Supabase project, forward-only checksummed migrations, and two Workers deployed from the same repository with different root directories. The [self-hosted QR code generator](/blog/self-hosted-qr-code-generator) post covers the trade-offs of doing that versus using the hosted one, and [open source QR code generator](/blog/open-source-qr-code-generator) covers what open actually buys you. If you just want a code, [the home page](/) makes one without an account.

> A number in a document is an opinion. A number from a query against the live database is a fact. The $0 is the second kind.

## Frequently asked

**Can you really run a QR code service for free?**
At the scale of a small business or a few thousand users, yes. QRly runs on Cloudflare Workers, Workers KV and Supabase free tiers and the cost page publishes the comparison. The excluded cost is the domain name.

**What is the first limit you hit?**
Workers KV writes, at 1,000 a day. Every cache fill is a write, so the limit is on how many links can be continuously busy, not on scans. A one-hour cache lifetime keeps that around forty hot links.

**Why Cloudflare Workers and not a normal server?**
The redirect runs at the location nearest the phone with a replicated cache beside it, so there is no round trip to a single origin and no server to keep patched. The free tier also includes the geographic and network fields the analytics are built from.

**Why is the dashboard a Worker and not Cloudflare Pages?**
The Pages adapter for Next.js is effectively in maintenance; the OpenNext adapter produces a Worker, and a Worker can be reached over a service binding from the redirect engine with no network hop.

**Is the code usable for a commercial deployment?**
It is MIT-licensed, so legally yes. Practically, it is sized for a thousand or two users on free tiers, with per-isolate rate limiting and a 1,000-write cache budget. Beyond that scale you would be moving to paid tiers and revisiting those two choices first.
