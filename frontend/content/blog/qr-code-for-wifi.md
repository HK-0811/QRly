---
title: Wi-Fi QR code generator: the format, how phones read it, and its limits
description: How a Wi-Fi QR code works (the WIFI:T:WPA;S:;P:;; format), how to make one from an iPhone or Android, why it cannot be tracked, and when a URL code is better.
date: 2026-09-19
category: use-cases
keywords: wifi qr code generator, qr code for wifi password, free wifi qr code, wifi qr code, qr code wifi, share wifi qr code, guest wifi qr code
---

A Wi-Fi QR code is the one kind of code where the phone does something other than open a web page. Scan it and the camera offers to join the network, password already filled in. For a guest room, a café, a waiting area or a friend's flat it beats reading a 16-character password off a router label.

It is also a kind of code that QRly does not make, and this post explains why, how to make one anyway, and the one situation where a URL code — which QRly does make — is the better tool.

## The format

A Wi-Fi code is a static code containing a short string of text in a de facto standard format that both iOS and Android understand. For a normal home or business network:

```
WIFI:T:WPA;S:MyNetwork;P:MyPassword;;
```

The fields:

| Field | Meaning | Values |
|---|---|---|
| `T` | Security type | `WPA` (covers WPA2 and WPA3 on current phones), `WEP`, or `nopass` for an open network |
| `S` | Network name (SSID) | Exactly as the router broadcasts it, case included |
| `P` | Password | Omit for an open network |
| `H` | Hidden network | `true` if the SSID is not broadcast; omit otherwise |

Each field ends with a semicolon, and the whole string ends with a second semicolon. If the network name or password contains any of `\`, `;`, `,`, `:` or `"`, put a backslash in front of it — a password of `pass;word` is written `P:pass\;word;`.

An open network with no password is `WIFI:T:nopass;S:CafeGuest;;`. A hidden WPA network is `WIFI:T:WPA;S:Office;P:secret;H:true;;`.

That string is the entire code. There is no server, no link and no account. Any QR generator that accepts arbitrary text will produce a working Wi-Fi code from it, and the phone's camera app decodes it directly.

## Make one without any generator

Both phone platforms will produce a Wi-Fi code for a network the phone already knows, and that is usually the easiest route.

**Android** (Android 10 and later): Settings, Wi-Fi, tap the connected network, then **Share**. The phone shows a QR code containing the credentials. Screenshot it, or use the share option to save it. Some manufacturers put the button a tap deeper, but it is there.

**iPhone**: since iOS 18, the **Passwords** app has a Wi-Fi section listing saved networks, and each one has a **Show Network QR Code** option. On earlier versions, iOS shares Wi-Fi passwords between nearby Apple devices automatically but does not produce a code; use any static generator with the string above instead.

Either way, what you get is an image of a static code. Print it, and it works for as long as the network name and password stay the same.

## Why a Wi-Fi code cannot be tracked, and QRly does not make one

QRly is a **URL** short-link service. Every code it produces encodes a link like `qrly.lol/abc123`, which redirects to a destination you choose. That redirect is what makes the destination editable and what makes scans countable — the redirect engine sees the request and records it.

A Wi-Fi code has nothing to redirect. The phone reads the credentials out of the pattern and joins the network, and no request goes to anyone's server. That means:

- **It cannot be counted.** No scan is ever visible to any service. Any generator claiming scan analytics on a Wi-Fi code is either not making a real Wi-Fi code or is not being straight with you.
- **It cannot be edited.** Change the password and every printed code carries the old one.
- **It cannot expire, and nobody can switch it off.** Which is the upside of the same fact.

So there is nothing for a dynamic service to add, and QRly does not pretend otherwise. If your keyword was "free Wi-Fi QR code generator", the honest answer is that your phone already is one, and [static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes) explains why this is one of the cases where static is simply correct.

## When a URL code is the better choice

There is one situation where a Wi-Fi code is the wrong tool, and it is common: **the password changes**.

A café that rotates its guest password monthly, a coworking space with a weekly code, a hotel that resets after each stay — any of these will have printed Wi-Fi codes on the wall that are wrong within weeks. A code that offers to join a network and then fails is worse than no code, because the guest assumes the network is down.

The alternative is a dynamic URL code pointing at a small "connect" page you host: the network name, the current password in large type with a copy button, and, if you like, a Wi-Fi code rendered on the page itself that is regenerated whenever the password changes. Then:

- The printed code never changes; only the page does.
- If you move the page, or want to add house rules or a menu link above the password, edit the destination in the dashboard and every printed code follows within a minute.
- The redirect counts scans, so you can see when and how often guests are looking for the Wi-Fi — by hour, by day, by device — which is a reasonable proxy for how many people would have asked staff instead.

The trade-off is one extra tap and a working mobile data connection to load the page, which a guest who has not yet joined your Wi-Fi does have, almost always. For a home network that never changes its password, that is a tap too many; use a Wi-Fi code. For a venue that changes it, the URL code is the one that stays right.

QRly makes that URL code on [the home page](/), with no account needed for the code itself. There is no expiry and no scan cap, so a code stuck to a wall for years keeps resolving. If you want it to look like it belongs on the wall, [the design rules](/blog/qr-code-design-rules-that-still-scan) cover colours and logos without breaking scannability.

| | Wi-Fi code (static) | URL code to a connect page (dynamic) |
|---|---|---|
| Joins the network in one tap | Yes | No — one tap more |
| Needs mobile data to work | No | Yes, to load the page |
| Survives a password change | No | Yes |
| Scan counts | No | Yes |
| Made by QRly | No | Yes |

## Two practical notes

**The password is in the code, in plain text.** Anyone who can photograph the code can read the password with any decoder. That is fine for a guest network in a public café, which is the point. It is not fine for the network the till runs on. Put guest codes on a guest SSID, isolated from anything that matters, and the code becomes harmless.

**Print size follows the same rules as any code.** A Wi-Fi string is longer than a short URL — 40 to 60 characters is typical — so the code is denser, and it wants to be printed a little larger than a URL code read from the same distance. A tent card on a table wants 3 cm or more; a sign on a wall read from across a room, 10 cm or more. Leave the four-module quiet zone. [The size guide](/blog/qr-code-size-guide) gives the numbers, and [test a QR code before printing](/blog/test-a-qr-code-before-printing) is worth the five minutes.

## Frequently asked

**Does QRly generate Wi-Fi QR codes?**
No. QRly makes URL short links and the codes that encode them. A Wi-Fi code contains credentials, not a link, so there is nothing for a redirect service to do. Use your phone's built-in sharing, or any static generator with the `WIFI:` string.

**What is the format of a Wi-Fi QR code?**
`WIFI:T:WPA;S:<network name>;P:<password>;;` — with `T:nopass` and no `P` field for an open network, and `H:true` for a hidden one. Escape `;`, `,`, `:`, `"` and `\` in the name or password with a backslash.

**Can I track how many people scan my Wi-Fi QR code?**
Not with a real Wi-Fi code; the phone joins the network without contacting any server. If you want counts, use a dynamic URL code that opens a page showing the password, and count the visits to that page.

**What happens to the printed code when I change the Wi-Fi password?**
It stops working, and it cannot be updated. If the password changes regularly, print a dynamic URL code to a page that shows the current password, and update the page.

**Is it safe to put the Wi-Fi password in a QR code?**
The password is readable by anyone who decodes the code, so treat a printed Wi-Fi code as a printed password. Use it for an isolated guest network, not for the network your business runs on.
