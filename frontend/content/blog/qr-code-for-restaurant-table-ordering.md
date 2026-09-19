---
title: QR code ordering system for restaurant tables: one code per table
description: How scan-to-order works, why each table gets its own QR code with a custom ending, how to print tents that survive service, and how to change platform without a reprint.
date: 2026-09-19
category: use-cases
keywords: qr code ordering system, table qr code, qr code for table ordering, scan to order, restaurant table qr code, order at table qr code, qr code menu ordering
---

Scan-to-order is now ordinary enough that customers expect it in a pub garden and tolerate it in a café. The mechanics are simple: a code on the table opens the ordering platform with the table already selected, the customer orders and pays, and the kitchen sees "table 7". What goes wrong is rarely the ordering platform. It is the code on the table: printed once, pointing at a URL the platform later changed, or moved to a different table by a member of staff clearing up.

This post is about the codes, not the platform. It applies whichever ordering system you use.

## How the table URL works

Every ordering platform that supports table ordering gives you a URL per table. The shape varies, but it is always the venue plus a table identifier, something like `order.example.com/v/yourcafe?table=7` or `example.app/yourcafe/t/7`. Opening that URL on a phone lands on the menu with the table filled in; the customer never types a table number.

Most platforms will also generate the QR codes for you, and if you are happy to be tied to that platform for the life of the printed tents, that is fine. The problem is that the code they give you is usually **static**: it encodes their URL directly. When the platform renames its URL scheme, when you change platform, or when they update how tables are identified, every tent is wrong and you are reprinting forty of them during a busy week.

The alternative is one extra layer: a **dynamic code** that encodes a short link you control, and a short link that redirects to the platform's table URL. The [difference between static and dynamic codes](/blog/static-vs-dynamic-qr-codes) is exactly this layer. The table tent then contains a URL that never changes, and the thing it points at can.

## One code per table, with a custom ending

Make one QRly link per table, not one link for the venue. The reason is partly the platform, which needs the table number, and partly the analytics: with a link per table you can see which tables scan and which do not.

Give each one a **custom ending** so the links are legible in the dashboard and in the printed test sheet. On the [create page](/create) the ending is the part after `qrly.lol/`; choose something like:

```
qrly.lol/yourcafe-t01  →  order.example.com/v/yourcafe?table=1
qrly.lol/yourcafe-t02  →  order.example.com/v/yourcafe?table=2
qrly.lol/yourcafe-t03  →  order.example.com/v/yourcafe?table=3
```

Two things to know before you save them. The custom ending is **immutable once saved**, deliberately, because a code that has been printed must keep meaning the same thing; the post on [custom short link codes](/blog/custom-short-link-qr-code) goes into why. So settle the table numbering first, and use the same numbers the floor plan and the kitchen use. And there is **no bulk import**: you make each link individually. For a forty-table venue that is forty minutes once, which is less than one reprint.

Keep a spreadsheet with three columns: ending, table, current destination. It is the thing you will reach for when the platform changes.

## Printing tents that survive a service

A table tent is scanned from about 30 to 50 cm, which by the usual rule of a tenth of the scanning distance means the code should be at least **3 to 5 cm** across. Go to 5 cm; a code that is easy to scan at arm's length gets scanned by the person who would otherwise ask for a paper menu.

Beyond size:

- **Print black on white**, with the four-module quiet zone intact. A brand colour can go on the tent; the code itself should stay high-contrast. [Colour rules that still scan](/blog/qr-code-design-rules-that-still-scan) covers how far you can push it.
- **Laminate matte, not gloss.** Tents get wiped with a cloth and a spray several times a day, so laminate is not optional. Gloss laminate under a pendant light throws a reflection straight into the phone camera; matte laminate does not.
- **Same code on both faces** of a folded tent, so it reads from either side of the table.
- **Put the instruction on the tent**: "Scan to order and pay" with "or order at the bar" underneath. People scan when told what happens next.
- **Export the SVG**, not a PNG, if a print shop is doing it. There is a short post on [how to print QR codes](/blog/how-to-print-qr-codes) without them going soft.

For a busy venue, consider fixing the code to the table itself: a printed vinyl sticker under a clear acrylic disc, or a code under the table's lacquer. Tents walk.

## The wrong table problem

This is the failure you will actually see. Table 4's tent ends up on table 9 during a clear-down, a customer at table 9 orders, and the food goes to table 4. The ordering platform cannot tell; it trusts the URL.

Mitigations, in order of effectiveness:

1. Fix the code to the table (see above), so it cannot move.
2. Print the table number on the tent in large type, so staff and customers can both see a mismatch.
3. Have the ordering platform show the table number prominently on the order confirmation screen, if it supports that, so the customer notices.

None of this is a QR problem, but the QR code is where it surfaces, and a code per table makes the diagnosis easy: the scan analytics for `yourcafe-t04` and `yourcafe-t09` will show the pattern.

## When the platform changes

Changing platform, or having the platform change its URLs, is the whole point of the dynamic layer. Open the dashboard, edit each link's destination to the new table URL, and every tent follows. The change reaches every edge in under a minute; you can do it between lunch and dinner service. The post on [changing a code after printing](/blog/how-to-change-a-qr-code-link-after-printing) describes the mechanics, and the [redirect explainer](/blog/qr-code-redirect-explained) covers why a 302 rather than a 301 is what makes this safe.

The same layer handles the smaller cases:

- **Kitchen closed, bar open**: repoint every table at a drinks-only menu, then back.
- **Private hire**: repoint the tables in the hired room at a set-menu page for the evening.
- **Platform outage**: repoint at a static PDF of the menu with "order at the bar" on it. A [QR code for a PDF](/blog/qr-code-for-pdf) is just a link to a hosted file, so this takes a minute.

Codes in QRly do not expire and are not deactivated for inactivity, which matters for a seasonal terrace whose tents sit in a cupboard from October to April.

## What the analytics tell a manager

Each link records scans at the redirect, without any script on the customer's phone and without a cookie. Per table, you get:

- **Scans per day**, which against covers tells you what fraction of customers are ordering by phone versus at the counter.
- **Hour and weekday heatmap**, which shows when the phone-ordering crowd arrives. The [scan time post](/blog/qr-code-scan-time-analytics) shows how to read it.
- **Device and OS**, which is worth a glance once: if a large share of scans come from older Android versions, keep the code big and the error correction at M rather than pushing the design.
- **Unique visitors**, counted per day by a rotating hash. A customer who scans twice during one sitting is one visitor; the same customer next week is a new one. That is the right unit for a restaurant, and the [unique versus total scans](/blog/unique-vs-total-qr-code-scans) post explains why it is done that way.

Tables that never scan are usually tables where the tent is missing, damaged, or under a spotlight. Walk the room with the dashboard open once a month.

## Frequently asked

**Does QRly do the ordering?**
No. QRly makes the QR code and the short link that opens your ordering platform's table URL. The menu, the basket, payment and the kitchen screen are the platform's. QRly's job is that the code on the table keeps working when the platform changes.

**Can I use one QR code for the whole restaurant?**
You can, pointing at a menu without table selection, and customers then type their table number. It works for takeaway counters and drinks-at-the-bar. For seated ordering, a code per table removes the typing and the mistyping, and gives you per-table scan data.

**Do customers need an app?**
Not for the QR part. A phone camera scans the code and opens the browser, which loads the ordering platform's web page. Whether the platform then requires an app or an account is the platform's decision, and worth checking before you commit: an "install our app" wall at the table loses orders.

**What happens if the platform changes its URL format?**
With a dynamic code, you edit the destinations in the dashboard and the printed tents carry on. With the static codes most platforms hand out, you reprint every tent. That single scenario is the reason to put your own short link in the code.

**Will the codes stop working if I stop using QRly for a while?**
No. There is no scan cap, no inactivity deactivation and no paid tier to lapse. Tents printed for the summer terrace scan the same the following summer.
