---
title: How to set up a custom domain for QR codes with one CNAME record
description: Pick a subdomain like qr.yourbrand.com, add it to QRly, create the CNAME at your DNS provider, wait for verification and the certificate, then make codes on it.
date: 2026-09-19
category: how-to
keywords: custom domain for qr codes, qr code subdomain setup, cname qr code domain, qr code on my own domain, branded short link qr code, qr.yourbrand.com, custom domain dynamic qr code
---

A dynamic QR code contains a short link, and the short link contains a hostname. By default that hostname belongs to the generator: `qrly.lol/spring`. With a custom domain it belongs to you: `qr.yourbrand.com/spring`. The code on the poster then carries your name, and if you ever leave the service, you point the hostname somewhere else and every printed code follows.

Setting it up is one DNS record and some waiting. This is the whole procedure, including the parts where people get stuck.

## Before you start

You need three things.

1. **A QRly account.** Making codes needs no account, but custom domains are tied to one, because someone has to own the hostname. Sign up from [the home page](/) if you have not.
2. **A domain you control**, with access to its DNS. That means the control panel at your registrar or DNS host: Cloudflare, GoDaddy, Namecheap, Route 53, Google Domains' successor, whoever it is.
3. **A subdomain name.** Not the root. See the next section.

Also read this sentence twice: **the hostname is printed into every code you make on it.** A code created on `qr.yourbrand.com` is a code for `qr.yourbrand.com` forever; the hostname and the ending are locked once the link is saved, because they may already be on paper. Choose the name as if you will keep it for a decade. [Why short links must be immutable](/blog/why-qr-code-short-links-must-be-immutable) explains what would go wrong otherwise.

## Step 1: choose a subdomain

Use a subdomain: `qr.yourbrand.com`, `go.yourbrand.com`, `scan.yourbrand.com`, `link.yourbrand.com`. Short is good, because the short link is often printed under the code and sometimes typed.

Do not use the root (`yourbrand.com`). DNS does not allow a CNAME record at the apex of a zone, and a CNAME is how this works. QRly refuses a root domain when you add it and tells you why. Some DNS hosts offer "CNAME flattening" or ALIAS records at the apex, but you almost certainly want the root pointing at your actual website anyway.

Do not reuse a subdomain that already has records. If `qr.yourbrand.com` currently points at something, that something stops working when the CNAME replaces it.

## Step 2: add the domain in QRly

Open the **Domains** page in the dashboard and press **Add a domain**. Type the hostname and submit.

QRly saves the hostname, registers it with the certificate provider (Cloudflare for SaaS), and shows you the record to create:

| Type | Name | Value |
|---|---|---|
| CNAME | `qr.yourbrand.com` | the platform target shown on the page |

Copy buttons are beside both. The value is the same for everyone; it is the hostname the redirect engine already answers on.

The domain now shows as **Pending**. Nothing works yet, and nothing should: DNS has not been told.

## Step 3: create the CNAME at your DNS provider

In your DNS control panel, add a record:

- **Type**: CNAME
- **Name / host**: `qr` (most panels want just the subdomain part; some want the full `qr.yourbrand.com`; the panel's hint text will say)
- **Target / value / points to**: the value QRly showed you, exactly
- **TTL**: the default is fine

Two provider-specific notes.

**If your DNS is on Cloudflare**, set the record to **DNS only** (the grey cloud), not Proxied (the orange cloud). A proxied record answers public DNS queries with Cloudflare's own addresses and hides the CNAME, so verification cannot see it, and the certificate flow will not complete. This is the single most common reason a custom domain sits at Pending.

**If your registrar has "domain forwarding" or "URL redirect" features**, do not use them for this. They are not a CNAME and they will not present a certificate for your hostname.

Save the record.

## Step 4: wait, then check

DNS changes take anywhere from a minute to a few hours to become visible across resolvers, depending on your provider and the old TTL on the name if it had one. Go back to the Domains page and press **Check now** when you are ready; there is no need to hammer it.

Verification does two independent things and reports both:

**DNS.** QRly asks two public resolvers (Cloudflare's and Google's) for the CNAME on your hostname and compares the answers. It shows you what each one returned: the target it found, `(no CNAME)` if the record is not there yet, or `(unreachable)` if a resolver did not answer. A single resolver is not trusted on its own, because a record created minutes ago can be visible to one and not the other, and reporting "verified" on the strength of one answer would let you print a code that half the internet cannot resolve. When both agree on the right target, DNS is verified and the page records the date.

**Certificate.** Separately, the certificate provider has to see the CNAME too and issue a TLS certificate for your hostname. The page shows the certificate status in plain words. Until the certificate is active, a scan of a code on the domain gives a TLS error in the browser, which is exactly why the page will not call the domain live on DNS alone. A CNAME with no certificate is the thing people most often mistake for "set up".

Once both pass, the badge changes to **Active**. This is not instant, and the page does not pretend otherwise. Plan for hours, not minutes, and do not send anything to print before the badge says Active.

If verification reports a wrong target, the most likely causes are a typo in the value, a trailing dot missing or extra (most panels handle this), or a record at the wrong name (a CNAME on `qr.qr.yourbrand.com` happens more often than you would think when a panel wanted just the host part and you gave it the full name).

## Step 5: make codes on the domain

Once the domain is Active, [the create form](/create) shows a **Domain** field when you are signed in. Pick your domain, paste the destination, choose a custom ending if you want one, and create the code as usual. The short link is now `qr.yourbrand.com/<ending>` and the QR code encodes that.

Everything else is unchanged: the code redirects with a 302, the destination is editable from the dashboard and changes reach every scanner in under a minute, the analytics are the same, and there is no cost. What is different is who the hostname belongs to.

The Domain field is locked once the code is saved. Existing codes on `qrly.lol` stay on `qrly.lol`; they cannot be moved onto the custom domain, because the old hostname is what was printed. Make new codes for new print runs.

## What you get from doing this

**The code carries your name.** People are, reasonably, more willing to scan `qr.yourbrand.com` than an unfamiliar short domain. [QR code phishing](/blog/qr-code-phishing-quishing) is a real concern and a recognisable hostname is the only thing a scanner can check before tapping.

**Portability.** The redirect service is a dependency; the hostname is not, if it is yours. If QRly disappeared tomorrow, you would change the CNAME to point at any other redirect service, or at your own server, recreate the slug-to-destination mapping there, and every printed code would keep working. The [custom domain business post](/blog/custom-domain-qr-code) makes the case at length, and [why dynamic QR codes cost money](/blog/why-dynamic-qr-codes-cost-money) explains why this is the one feature that most changes your position relative to a vendor.

**Nothing else.** A custom domain does not make codes scan better, does not change the analytics, and does not affect scan speed. It is about ownership.

## Things that are not supported

Honest limits, so you do not plan around them:

- **Root domains** cannot be used. CNAME only, on a subdomain.
- **It is not instant.** DNS propagation and certificate issuance both take real time.
- **Moving existing codes** between hostnames is not possible; the hostname is part of what was printed.
- **There is no claim about how many domains an account may add.** Add the ones you need.
- **Verification depends on your DNS being publicly visible.** Split-horizon or internal-only DNS will not verify.

## Frequently asked

**Do I need an account to use a custom domain?**
Yes. Codes can be made without one, but a hostname has to belong to someone, so domains are tied to an account.

**Can I use my root domain, like yourbrand.com?**
No. DNS does not allow a CNAME at the root, and QRly will refuse it. Use a subdomain such as qr.yourbrand.com.

**How long does verification take?**
As long as DNS propagation and certificate issuance take, which is usually minutes to a few hours. The Domains page shows what each resolver saw and the certificate status, so you can tell which part is still pending.

**Why does my domain show a TLS or certificate error when I scan?**
The CNAME is in place but the certificate has not been issued yet, or the record is proxied on Cloudflare and the provider cannot see it. Set the record to DNS only and wait for the certificate status to become active before printing.

**Can I move my existing QR codes onto the new domain?**
No. The hostname is locked into each code when it is saved, because it is what was printed. Create new codes on the custom domain for new print runs; the old ones keep working on the old hostname.
