---
title: QR code caching and propagation: why an edited link takes up to 60 seconds
description: Edit a dynamic QR code's destination and some scans see the old page for up to a minute. Here is why, what the cache TTL really does, and how to tell delay from fault.
date: 2026-09-19
category: advanced
keywords: qr code redirect delay, why did my qr code update take time, edge cache qr code, qr code destination not updating, kv propagation, qr code cache ttl, dynamic qr code update delay
---

You change a link's destination, scan the code, and it goes to the old page. Thirty seconds later it goes to the new one. Nothing was broken; the edit was travelling. This post explains what it was travelling through, why the delay is bounded at about a minute, and why the two numbers involved, the propagation delay and the cache lifetime, are set for entirely different reasons.

It uses QRly's redirect engine as the example, since [the code is public](https://github.com/HK-0811/QRly). Any dynamic QR service with an edge cache has an equivalent, whether or not it tells you.

## Two stores, one truth

A dynamic QR code's destination lives in a database. On QRly that is a Postgres row on Supabase in a single region. If every scan had to reach that row, every scan would pay a round trip to that region, and the database would be on the critical path of every poster in the world.

So there is a second store: Workers KV, a key-value cache replicated to every Cloudflare location. The redirect Worker looks there first, and [the redirect path at the edge](/blog/how-qr-code-redirects-work-at-the-edge) explains a hit and a miss. The database is the truth; KV is a copy of the parts of it that have been asked for recently. Any copy can be stale, and "how long until my edit works everywhere" is the question of how the copy is kept in step with the truth.

## What happens when you save an edit

The dashboard does not write the destination straight to the database. It sends the edit to the Worker, and the Worker does two things in order:

1. Updates the row in Postgres.
2. Writes the new link record into KV, overwriting the cached copy.

That second step is a write-through, not a delete. Deleting the entry would mean the next scan at every location misses and goes to the database at the same moment, a small stampede for a popular link. Writing the new value means a stale read returns the old destination, not a cache miss.

This is also why the dashboard never writes to the database directly. A row changed behind the Worker's back would leave the cache serving the old destination until the entry expires, which is an hour. The Worker owns the cache, so the Worker owns the writes.

## Why up to 60 seconds

Workers KV is eventually consistent. A write is visible immediately at the location that made it, and it takes time to replicate to the other locations. Cloudflare documents that time as up to about 60 seconds. There is no setting that shortens it; it is a property of how KV is built, trading global read speed for a bounded window of staleness.

So after an edit, the location that handled your dashboard request sees the new destination at once; every other location sees it as soon as the write reaches it, usually seconds and at most about a minute; and a scan during that window at a location that has not yet received the write is served the previous destination.

The dashboard says this next to the edit form, and it is deliberately not hidden. A redirect that silently serves an old address is the kind of thing that makes people distrust the whole product. If you are scanning from the same city you edited from, you will almost always see the change immediately. If you are testing with a colleague on another continent, wait a minute before deciding something is wrong.

## What the cache TTL is for, and why it is an hour

Every entry in KV carries an expiry. On QRly a cached link expires after one hour. People reasonably assume this is the freshness window, so that a shorter TTL would mean faster edits. It is not, and it would not.

Freshness after an edit comes from the write-through above. The TTL exists for one situation only: a row changed outside the Worker, such as a migration or a manual fix in the database console, which the Worker did not see and so could not write through. After an hour the stale entry expires, the next scan misses, and the database is consulted again.

Why an hour rather than a minute? Because on the free tier a cache fill is a KV write, and KV allows 1,000 writes a day:

| Cache TTL | Refills per hot link per day | Links that can stay continuously hot |
|---|---|---|
| 60 seconds | 1,440 | 0 (one link exhausts the budget alone) |
| 5 minutes | 288 | about 3 |
| 1 hour | 24 | about 40 |

A hot link is one scanned at least once every TTL, so that its entry is refilled every time it expires. At a 60-second TTL, one busy poster would burn the entire day's write quota by itself and take the cache down for the whole platform. At an hour, roughly forty links can be continuously hot and the budget holds. The `check-ceilings` tool in the repository measures this against the live database rather than assuming it.

The TTL was originally 60 seconds. It was wrong, for exactly the reason above, and a measurement found it. The number that controls freshness and the number that controls quota are different numbers, and conflating them costs you one or the other.

## Negative caching

There is a second kind of cache entry: a note that a slug does not exist. Without it, a bot walking random slugs would send every probe to the database. With it, each probe costs one KV write, and a thousand probes is the whole day's budget. So the miss is only cached on its second sighting; almost no random slug is ever requested twice, but a genuinely mistyped code is, because people retry. A negative entry lives five minutes, and link creation performs the same write-through as an edit, so a slug probed a moment before it is created is not stuck as missing.

## Catching up versus broken

When an edit does not appear to take, the difference between a delay and a fault comes down to timing and location.

| Symptom | Likely cause | What to do |
|---|---|---|
| Old destination for under a minute after an edit, then correct | KV propagation | Nothing; it caught up |
| Old destination, same place, more than two minutes after an edit | Browser cached something, or you scanned an older code | Open the short URL in a private window; check the code encodes the slug you edited |
| Old destination for over an hour | Row changed outside the Worker, or the edit did not save | Check the dashboard shows the new destination; if it does, the TTL will clear it and this is a bug worth reporting |
| An "expired" or "unavailable" page | The link has an expiry date that passed, or the database was unreachable at scan time | Check the expiry on the link; try again in a moment |

The first row is the only one that is normal, and it is the one that prompts most of the questions. A redirect uses a [302 and `Cache-Control: no-store`](/blog/qr-code-redirect-explained), so the phone's browser should not be caching the redirect itself; if a phone seems stuck, it is usually an app's in-memory copy of the last page, and a fresh scan clears it.

## Why not skip the cache

A service could serve every scan from the database and have no propagation window at all. The cost is latency and fragility. Every scan would take the round trip to one region, and if that region were unavailable, every poster on earth would stop working at once. With the cache, a link scanned in the last hour keeps redirecting even when the database is down, because the edge does not need to ask. That is the most valuable property of the design, and a minute of eventual consistency after an edit is the price of it.

Related: [changing a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) for the dashboard side, [why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) for the part of a link that never changes, and [running a QR code platform for free](/blog/running-a-qr-code-platform-for-free) for the other ceilings that shaped these numbers. You can [make a link](/create), edit it, and time the change yourself.

## Frequently asked

**Why did my QR code take a minute to update?**
The new destination was written to the edge cache at one location and had to replicate to the others. Workers KV takes up to about 60 seconds to do that. Scans during the window at a location that has not received the write see the old destination.

**Is there a way to make the update instant?**
Not on an eventually consistent cache, and no setting on QRly changes it. The location you edited from is updated at once; the rest follow within a minute. Every edge-cached redirect service has an equivalent window whether or not it is disclosed.

**Does the cache TTL affect how fast edits appear?**
No. Edits are written through to the cache immediately. The TTL, one hour, only bounds how long a change made outside the Worker could go unnoticed, and it is set by the free tier's write quota, not by freshness.

**What happens to scans while the edit is propagating?**
They are served the previous destination, not an error. The write-through overwrites the cached value rather than deleting it, so there is never a moment where the link appears missing.

**Does the delay apply to a brand-new link?**
Creation performs the same write-through, so a new link is scannable immediately where it was created and everywhere within a minute.
