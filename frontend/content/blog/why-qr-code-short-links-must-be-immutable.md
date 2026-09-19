---
title: Why QR code short links must be immutable once the code is printed
description: You can change where a dynamic QR code goes, but not the short link inside it. Here is why QRly locks the hostname and slug at the database, and what that protects.
date: 2026-09-19
category: advanced
keywords: can you change a qr code url, qr code slug change, immutable short link, change qr code short link, qr code permanent link, qr code hostname locked, dynamic qr code what can change
---

A dynamic QR code has two URLs. There is the one inside the code, the short link, and there is the one the short link redirects to, the destination. People ask *can you change a QR code URL* and the answer depends entirely on which one they mean. The destination: yes, whenever you like. The short link: no, and any service that lets you is setting you up for a reprint.

This post is about the second half of that answer, and about why QRly enforces it in the database rather than trusting the interface to behave.

## The printed code is the contract

A QR code is ink. Once it is on a poster, a menu, a van or a box, the pattern cannot be updated, and the pattern encodes exactly one string: the short link. `https://qrly.lol/aB3xK9p`, say, or `https://qr.yourbrand.com/spring`. Every phone that scans the code will open that string and no other, for as long as the ink lasts.

So the short link is a promise the service makes to every copy already in the world. Two parts of it carry the promise:

- **The hostname.** It has to keep resolving to a server that knows the slug. If `qrly.lol` stopped answering, every code on it would die together.
- **The slug.** It has to keep mapping to the right record. If `aB3xK9p` were renamed to `spring-2026`, every copy carrying `aB3xK9p` would start returning a not-found page.

The destination is not part of the promise. It is the thing the promise protects. [Static versus dynamic](/blog/static-vs-dynamic-qr-codes) covers why that indirection exists at all; the short version is that you print the promise once and move the destination as often as you like.

## What can change and what cannot

| Field | Editable after saving | Why |
|---|---|---|
| Destination URL | Yes | The whole point of a dynamic code |
| Title or label | Yes | Only you see it |
| Expiry date | Yes, set, extend or remove | Controls what a scan gets after a date; the code itself is unaffected |
| QR design: colours, shapes, logo | Yes, for a new download | A restyled code encodes the same link; already-printed copies are simply the old style |
| Slug | No | It is in the ink |
| Hostname | No | It is in the ink |

The design row surprises people. You can re-export the same link with a different colour or a [logo](/blog/qr-code-with-logo), and both the old print and the new one keep working, because both encode the same string. Design is a rendering of the link, not part of it. [Editable QR codes](/blog/editable-qr-code) walks through that distinction.

## Enforced by trigger, not by convention

QRly could have made the slug read-only in the dashboard and left it at that. It does not, because an interface rule is a rule that survives until someone writes a script against the database, or fixes something by hand in the console at midnight. A printed code has to survive all of those.

So the rule lives in Postgres. A `before update` trigger on the links table compares the old and new rows and refuses the update if the slug or the domain changes:

```
slug is immutable once created (was aB3xK9p, got spring-2026)
```

A second trigger does the same for the hostname a QR code was rendered with, which is stored on the code record as a locked domain. Neither trigger can be bypassed by the dashboard, by the Worker, or by an operator with the service key, short of dropping the trigger itself. The error code is a restriction violation, which is what it is.

The other half of the guarantee is operational rather than technical: old hostnames must stay alive forever. A [custom domain](/blog/custom-domain-qr-code) that was ever used to print a code is a hostname the redirect engine must keep answering for. That is written into the project's own contributor notes, because it is the kind of thing a well-meaning cleanup would otherwise delete.

## But I want a nicer slug

The usual reason someone wants to change a slug is that the generated one is ugly and they would prefer `qrly.lol/menu`. There are two honest answers.

If the code has not been printed yet, make a new link with the ending you want, and delete the old one. Nothing has been promised to anyone; the old slug has no copies in the world. QRly lets you choose a [custom ending](/blog/custom-short-link-qr-code) at creation, three characters or more, and the ending is the one decision to make carefully because it is the one you keep.

If the code has been printed, the slug in the ink is the slug you have. You can make a second link with the nicer ending, point both at the same destination, and use the new one on the next print run. The old one keeps working for as long as the old posters exist. What you must not do is rename the old one, and QRly will not let you.

## Why a rename is worse than it looks

A service that allowed slug renames would have to decide what happens to the old slug. Three options, all bad:

- **Old slug returns not-found.** Every printed copy breaks at once, with no warning to the people holding them.
- **Old slug redirects to the new slug.** Now there are two records to keep forever, the rename was cosmetic, and every rename adds another. This is immutability with extra steps.
- **Old slug is released for reuse.** Someone else can now claim it, and your printed posters send your customers to their page. On a service with a shared hostname, this is the worst outcome available.

The third one is not hypothetical; it is one way a QR code ends up "pointing at the wrong thing" years after printing, on services that expire or recycle short links. [A permanent QR code](/blog/permanent-qr-code-free-forever) requires that the slug is never recycled, which requires that it is never released, which requires that it is never renamed. Immutability is the simplest rule that gets you there.

## The same rule, elsewhere in the design

Immutability shows up in two other places once you look for it.

The redirect is a [302, never a 301](/blog/qr-code-redirect-explained). A permanent redirect would let phones cache the destination, which would make the destination effectively immutable too, and the destination is the one thing that must stay changeable.

And slug collisions on creation are handled by letting the database's unique constraint reject the insert and retrying with a new random slug, rather than checking first and then inserting. A check-then-insert can race with another request and produce two links claiming the same slug, which would be two contracts on one string. The constraint cannot be raced.

None of this is elaborate. It is a small number of rules, each placed where it cannot be worked around, protecting the one thing in the system that cannot be fixed by an edit: the ink. You can [make a code](/create) and try to change its ending from the dashboard; the field is not there, and the reason is this post.

## Frequently asked

**Can you change a QR code's URL after printing?**
The destination, yes, from the dashboard, and the change reaches every scanner within about a minute. The short link encoded in the code, no; it is what the printed pattern contains and cannot be altered without reprinting.

**Can I change the slug on a QRly short link?**
No. The slug and the hostname are locked by a database trigger the moment the link is created. Make a new link with the ending you want, and if the old one has never been printed, delete it.

**What if I printed the wrong short link?**
If the code scans to a link you own, edit that link's destination; the printed code does not care which slug it carries as long as the slug goes where you need. If it scans to a link you do not own or that does not exist, there is no fix short of reprinting.

**Why not just redirect the old slug to the new one?**
Because then the old slug must be kept forever anyway, and every rename adds another permanent record. Keeping the original slug immutable achieves the same result with one record and no chain.

**Does this apply to the QR design as well?**
No. Colours, shapes and a logo are a rendering of the same link. You can re-export a printed link with a new design and both the old and new prints keep working.
