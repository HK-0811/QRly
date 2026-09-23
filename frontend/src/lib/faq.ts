/**
 * The site-wide FAQ, as data.
 *
 * One list feeds four readers: the /faq page, its FAQPage structured data,
 * /llms.txt and /llms-full.txt. They must say the same thing, and the only
 * dependable way to make four outputs agree is to write the words once.
 *
 * The questions are the ones people actually ask. They were collected in
 * September 2026 from Google Autocomplete, the FAQs of the generators people
 * compare us with, and the complaints on review sites, and phrased the way
 * people type them. Each answer puts its answer in the first sentence —
 * "Yes", "No", a number — because that sentence is the one that gets quoted,
 * and a quote that has to be read in context is a misquote waiting to happen.
 *
 * Rules for editing:
 *  - Every claim about QRly must be true of the code as deployed. Where the
 *    product has a limit (URL codes only, 30 days for unclaimed codes, no
 *    export), the answer says so. An answer engine will repeat an overclaim
 *    to thousands of people, and it will be us who was wrong.
 *  - Facts about QR codes in general cite where they come from.
 *  - Claims about other vendors say when they were read, and come from the
 *    vendor's own pages; prices move, and a dated claim stays true.
 *  - `id` is a URL fragment people link to. Do not rename one.
 *  - `more` is a blog slug; the build fails if the post does not exist.
 *
 * Bump FAQ_REVIEWED when the answers are re-checked, not when a comma moves.
 */
import { getPost, renderPassage } from './blog';
import { markdownToText } from './structured-data';

export const FAQ_REVIEWED = '2026-09-23';

/**
 * QRly in twelve lines. Printed at the top of /llms.txt and /llms-full.txt,
 * and each line is backed by an answer below.
 */
export const FACTS: Array<{ label: string; value: string }> = [
  { label: 'What it is', value: 'A free, open-source dynamic QR code generator with short links and scan analytics, at https://qrly.lol.' },
  { label: 'Price', value: 'Free. No paid plan, no trial, no watermark, and no ad or preview page before the redirect.' },
  { label: 'Account', value: 'Not needed to make and download a code. A free account (email and password) is needed to edit the destination, see scans, and keep the code: codes nobody claims are deleted after 30 days.' },
  { label: 'Expiry', value: 'Codes in an account have no expiry, no scan cap and no inactivity deletion. An expiry date is optional and set by the owner.' },
  { label: 'Editing', value: 'The destination can be changed at any time without reprinting; edits reach every edge location within about 60 seconds. The short link itself can never change.' },
  { label: 'Redirect', value: 'A 302 redirect served from Cloudflare\'s edge network, with no interstitial page.' },
  { label: 'Analytics', value: 'Country, region, city, local hour, device, operating system, browser, network provider, referrer and UTM parameters. Unique visitors are counted per day with a salted hash that rotates daily. No IP address is stored, and there are no cookies and no JavaScript on the scanner\'s phone.' },
  { label: 'Code types', value: 'Web links (URLs) only. No vCard, Wi-Fi or payment codes, no bulk creation, no public API, no data export yet.' },
  { label: 'Design', value: 'Colours, module and finder shapes, error correction (L, M, Q, H), quiet zone and an embedded logo. Downloads as SVG, or PNG at 512, 1024 or 2048 pixels.' },
  { label: 'Custom domains', value: 'A subdomain you own (such as qr.yourbrand.com) with one CNAME record; the certificate is issued automatically. Free, with an account.' },
  { label: 'Source', value: 'Open source under the MIT license: https://github.com/HK-0811/QRly. Built by Himanshu Kotkar.' },
  { label: 'Running cost', value: '$0 a month: the platform runs on the free tiers of Cloudflare Workers and Supabase. It is a demonstration project sized for one or two thousand users.' },
];

interface Entry {
  id: string;
  q: string;
  /** Markdown. The first sentence is the answer; the rest is why. */
  a: string;
  more?: string;
}

interface Group {
  id: string;
  title: string;
  entries: Entry[];
}

const GROUPS: Group[] = [
  {
    id: 'about-qrly',
    title: 'About QRly',
    entries: [
      {
        id: 'what-is-qrly',
        q: 'What is QRly?',
        a: `QRly is a free, open-source dynamic QR code generator. Every code it makes points at a short link, such as qrly.lol/aB3xK9p, and you can change where that link sends people after the code is printed.

Alongside the codes it records privacy-respecting scan analytics — where, when and on what kind of device a code was scanned — and lets you serve your codes from your own domain. It runs at [qrly.lol](https://qrly.lol) and the source is on [GitHub](https://github.com/HK-0811/QRly).`,
      },
      {
        id: 'is-qrly-free',
        q: 'Is QRly really free? What is the catch?',
        a: `Yes, it is free, and there is no paid plan to upgrade to. There is no trial that ends, no scan cap, no watermark and no ad page before the redirect.

The one condition: a code made without an account is kept for 30 days. Claim it with a free account in that time and it is yours with no expiry. The honest limits are elsewhere — QRly makes web-link codes only, has no bulk creation or public API, and is a small project run by one developer rather than a company with a support desk.`,
        more: 'dynamic-qr-code-no-subscription',
      },
      {
        id: 'how-is-qrly-free',
        q: 'How can QRly be free when other generators charge a monthly fee?',
        a: `Because a dynamic QR code is cheap to run: it is a database lookup and a redirect. QRly runs entirely on the free tiers of Cloudflare Workers and Supabase, so its running cost is $0 a month at its intended size of one or two thousand users.

The [cost page](/cost) puts that next to the published prices of the paid services, with the date each price was read. Most of what a subscription buys is the belief that this is hard.`,
        more: 'why-dynamic-qr-codes-cost-money',
      },
      {
        id: 'who-runs-qrly',
        q: 'Who runs QRly?',
        a: `QRly was built and is run by [Himanshu Kotkar](https://github.com/HK-0811), as a demonstration that a complete QR code platform can run on free tiers. It is not a venture-funded company, and it does not sell data or advertising.

Because the source is public under the MIT license, anything this FAQ says about how QRly works can be checked in the [repository](https://github.com/HK-0811/QRly).`,
      },
      {
        id: 'do-i-need-an-account',
        q: 'Do I need an account to make a QR code?',
        a: `No. Paste a link at [qrly.lol](/) or on the [create page](/create) and you get a working code and short link, ready to download as SVG or PNG, without signing up.

An account is free and needs only an email and a password. You need one to change where the code points, to see its scans, and to keep it beyond 30 days.`,
        more: 'qr-code-generator-no-sign-up',
      },
      {
        id: 'code-without-account',
        q: 'What happens to a QR code I made without an account?',
        a: `It works straight away, and it is deleted after 30 days unless you claim it. Claiming means signing up for a free account, or signing in, from the same browser within those 30 days; the code, its design and any scans it has already collected move into the account and stop expiring.

The limit exists because anonymous creation needs no sign-in, and without an expiry anyone could fill the database with codes nobody owns. If you are printing something that must last, claim the code before you print it.`,
      },
      {
        id: 'limits',
        q: 'Are there limits on how many codes I can make or how often they are scanned?',
        a: `There is no cap on the number of codes in an account and no cap on scans. The only limits are flood protection: a single connection can create about 10 codes a minute without an account, and one device scanning the same code more than 120 times a minute is slowed down.

QRly is sized for one or two thousand users on free infrastructure. It is not built for campaigns with millions of scans a day.`,
      },
      {
        id: 'ads-before-redirect',
        q: 'Will people see an ad or a preview page before they reach my page?',
        a: `No. A scan of a QRly code is answered with a direct 302 redirect to your destination, with no interstitial, countdown, preview or advertising page, and no JavaScript on the scanner's phone.

The one exception is a safety one: if a destination is flagged as unsafe, the scan lands on a warning page instead of redirecting silently.`,
      },
      {
        id: 'what-codes-can-i-make',
        q: 'What kinds of QR codes can I make with QRly?',
        a: `Web-link codes only: a QR code that opens a URL. That covers websites, PDFs, Google Forms, review pages, maps, menus, videos, payment pages and anything else with a link.

QRly does not make vCard, Wi-Fi, SMS, email or calendar codes, which put their data directly in the pattern. Those are static by nature, and phones and many free tools already make them; the guides explain how for [Wi-Fi](/blog/qr-code-for-wifi) and [contact cards](/blog/qr-code-for-vcard-contact).`,
      },
      {
        id: 'bulk-and-api',
        q: 'Can I create QR codes in bulk or through an API?',
        a: `No, not today. QRly has no bulk import and no public API; codes are made one at a time in the browser.

If you need thousands of static codes, an open-source library and a short script will do it offline for free. The [QR code API guide](/blog/qr-code-api-and-automation) shows how, and when a managed service is actually worth paying for.`,
        more: 'qr-code-api-and-automation',
      },
      {
        id: 'if-qrly-shuts-down',
        q: 'What happens to my QR codes if QRly shuts down?',
        a: `Codes on the qrly.lol domain would stop redirecting, which is the risk with every dynamic QR code service. Google's goo.gl shortener is the best-known example of links dying when a service closes.

You can take that risk off the table in two ways. Put your codes on a [custom domain](#custom-domain) you own, so the printed URL is yours and can be pointed at another service later. Or run your own copy: QRly is MIT-licensed, and the [source](https://github.com/HK-0811/QRly) is the whole platform.`,
        more: 'custom-domain-qr-code',
      },
      {
        id: 'who-owns-data',
        q: 'Who owns my links and scan data? Can I delete them?',
        a: `You do. QRly does not sell, share or advertise against your links or your scan data, and there is no third-party script on any page.

Deleting a link deletes its scan history with it, and you choose how long scans are kept (one year by default). There is no one-click data export or account-deletion button yet; to delete an account, open an issue on [GitHub](https://github.com/HK-0811/QRly/issues).`,
      },
      {
        id: 'open-source',
        q: 'Is QRly open source? Can I run my own copy?',
        a: `Yes. The complete platform — redirect engine, API, dashboard, database migrations and tests — is on [GitHub](https://github.com/HK-0811/QRly) under the MIT license.

Running your own copy needs a free Cloudflare account and a free Supabase project. The README walks through it, including the parts that cost the original build a day each.`,
        more: 'self-hosted-qr-code-generator',
      },
      {
        id: 'commercial-use',
        q: 'Can I use QRly codes for my business?',
        a: `Yes. Codes from QRly can be printed on menus, packaging, signs, business cards and adverts, with no licence fee and no attribution required. The QR code format itself is free to use under its ISO standard.

For anything that will be in print for years, claim the code with an account and consider a [custom domain](#custom-domain), so the printed link belongs to your business.`,
        more: 'qr-codes-for-small-business',
      },
    ],
  },
  {
    id: 'expiry',
    title: 'Free codes and expiry',
    entries: [
      {
        id: 'do-qr-codes-expire',
        q: 'Do QR codes expire?',
        a: `A QR code itself never expires: it is a printed pattern with no date in it. What can stop is the service behind a dynamic code. If a generator switches off its redirect — at the end of a trial, on a scan cap, or after a period of no scans — the code lands on an error page.

Static codes, which contain the destination URL directly, cannot be switched off by anyone, but they also cannot be edited.`,
        more: 'free-qr-code-no-expiration',
      },
      {
        id: 'do-free-qr-codes-expire',
        q: 'Do free QR codes expire?',
        a: `Free static codes do not. Many "free" dynamic codes do: several popular generators give dynamic codes a 7- or 14-day trial and deactivate them unless you subscribe.

On QRly, codes in a free account do not expire and are not deactivated for inactivity or for scan volume. The only clock is on codes nobody claims, which are deleted after 30 days.`,
        more: 'free-qr-code-no-expiration',
      },
      {
        id: 'stopped-working-after-trial',
        q: 'Why did my QR code stop working after 7 or 14 days?',
        a: `Almost certainly because it was a dynamic code on a free trial. Its short link belonged to the generator, and the generator switched the redirect off when the trial ended. The printed pattern is fine; the service behind it said no.

Scan it and look at the page it lands on: the vendor's name will be there. Paying that vendor usually reactivates it. The alternative is to reprint with a service that has no trial, or with a static code.`,
        more: 'qr-code-not-working-how-to-fix',
      },
      {
        id: 'reactivate-expired-code',
        q: 'Can an expired or deactivated QR code be reactivated?',
        a: `Only by the company whose short link is inside the code, usually by paying for a plan. Nobody else can redirect it, because the printed pattern contains their domain.

If the vendor will not restore it, the code has to be reprinted. When you do, choose a code whose link you control, or a service with no trial, so it cannot happen twice.`,
        more: 'free-qr-code-no-expiration',
      },
      {
        id: 'deleted-if-not-scanned',
        q: 'Will my QR code be deleted if nobody scans it for a while?',
        a: `Not on QRly: a claimed code works whether it is scanned every minute or once in five years. Some generators do delete codes after a year without scans, which matters for anything printed in a book, on a plaque or on packaging with a long shelf life.`,
      },
      {
        id: 'scan-limit',
        q: 'Is there a limit on how many times a QR code can be scanned?',
        a: `A QR code has no scan limit of its own; a phone reading a pattern costs nobody anything. Limits come from dynamic-code services, some of which cap free plans at a few hundred scans and then stop redirecting mid-campaign.

QRly has no scan cap. It only slows down a single device that scans the same code more than 120 times in a minute, which is flood protection rather than a quota.`,
      },
      {
        id: 'set-an-expiry-date',
        q: 'Can I make a QR code expire on purpose?',
        a: `Yes. Every QRly link has an optional expiry date, off by default. After it, scans see a page saying the link has expired instead of reaching the destination.

It is meant for things that should end — a voucher, a registration form, a limited offer. Because you can also edit the destination, a code that has expired can be brought back by removing the date.`,
        more: 'qr-code-with-expiration-date',
      },
      {
        id: 'how-long-does-a-qr-code-last',
        q: 'How long does a QR code last?',
        a: `As long as the print survives and its destination answers. Static codes last indefinitely. Dynamic codes last as long as the service redirecting them keeps doing so; one generator's data from 40,000 live codes shows some still being scanned eight to ten years after they were made.

For anything meant to outlive a campaign, use a service with no expiry and, ideally, a domain you own.`,
        more: 'permanent-qr-code-free-forever',
      },
    ],
  },
  {
    id: 'dynamic',
    title: 'Dynamic and editable codes',
    entries: [
      {
        id: 'static-vs-dynamic',
        q: 'What is the difference between a static and a dynamic QR code?',
        a: `A static QR code contains the destination itself, so it can never change and works without any service. A dynamic QR code contains a short link, and the service behind that link decides where to send each scan — so the destination can be changed after printing, and scans can be counted.

| | Static | Dynamic |
|---|---|---|
| Destination can change | No | Yes |
| Scan analytics | No | Yes |
| Depends on a service | No | Yes |
| Pattern density | Grows with the URL | Always short |

Every QRly code is dynamic.`,
        more: 'static-vs-dynamic-qr-codes',
      },
      {
        id: 'change-link-after-printing',
        q: 'Can I change where a QR code goes after it has been printed?',
        a: `Yes, if it is a dynamic code. The printed pattern stays the same; you change the destination of the short link inside it, and every scan from then on goes to the new place.

On QRly you edit the destination from the dashboard. A static code cannot be changed after printing, because the URL is the pattern.`,
        more: 'how-to-change-a-qr-code-link-after-printing',
      },
      {
        id: 'does-the-image-change',
        q: 'If I change the link, does the QR code image change?',
        a: `No. The pattern encodes the short link, such as qrly.lol/aB3xK9p, and that never changes. Only the destination behind it does, so posters, packaging and business cards that are already printed keep working and start sending people to the new page.

QRly enforces this in the database: once created, a code's domain and short ending cannot be edited, because they are already on someone's poster.`,
        more: 'why-qr-code-short-links-must-be-immutable',
      },
      {
        id: 'how-fast-do-edits-apply',
        q: 'How quickly does a change of destination take effect?',
        a: `Within about 60 seconds everywhere. QRly serves redirects from Cloudflare's edge network, and a new destination takes up to a minute to reach every location. In that window some scans may still reach the old page; that is propagation catching up, not a fault.`,
        more: 'qr-code-caching-and-propagation',
      },
      {
        id: 'static-to-dynamic',
        q: 'Can I turn a static QR code into a dynamic one?',
        a: `No. A static code's destination is baked into its pattern, and no service sits between the phone and the page. To get editing and tracking you make a new dynamic code and replace the printed one.

When you do, it is worth replacing it with a code whose link you control, so this is the last reprint.`,
      },
      {
        id: 'edit-another-generators-code',
        q: 'Can I edit a QR code that was made with a different generator?',
        a: `Only through that generator. A dynamic code contains the other company's short link, so only their dashboard can change where it goes; QRly or anyone else cannot.

If that vendor has gone or wants a subscription, the choice is to pay them or reprint.`,
      },
      {
        id: 'turn-off-or-delete',
        q: 'Can I turn a QR code off, or delete it?',
        a: `Yes. In the dashboard every link can be turned off, which makes scans land on a page saying the code has been turned off until you turn it back on, or deleted, which removes it and its scan history permanently.

Turning off is the reversible option, for a promotion that has paused or a page that is being rebuilt.`,
      },
      {
        id: 'route-by-device-or-time',
        q: 'Can one QR code send people to different pages by device, language or time?',
        a: `Not on QRly. Each code has one destination at a time, which you can change whenever you like. Rules such as "iPhones to the App Store, Android to Google Play" are offered by some paid services; for an app download, a single landing page that links to both stores works everywhere.`,
        more: 'qr-code-for-app-download',
      },
      {
        id: 'change-design-later',
        q: 'Can I change the colours or design after downloading?',
        a: `Yes. The design is separate from the link, so you can restyle a code in the QR studio and download it again at any time, and it still points at the same short link.

A redesigned file is a new picture, though: codes already printed keep their old look.`,
      },
    ],
  },
  {
    id: 'tracking',
    title: 'Scan tracking and analytics',
    entries: [
      {
        id: 'how-to-track-scans',
        q: 'How do I track how many people scanned my QR code?',
        a: `Use a dynamic QR code: every scan passes through its short link, and the service counts it. On QRly, scans appear in the dashboard for each code within moments, with totals, unique visitors, a timeline, a map, and breakdowns by device, network and hour.

A static code cannot be tracked by itself, because nothing sits between the phone and the page. The closest alternative is adding UTM parameters and reading them in your website analytics.`,
        more: 'how-to-track-qr-code-scans',
      },
      {
        id: 'what-is-recorded',
        q: 'What information does QRly record when someone scans a code?',
        a: `Approximately where, when and on what: country, region, city and postal area; the local hour and weekday; device type, operating system and browser; the network provider and connection type; the language setting; the referrer if one was sent; and any UTM parameters in the link.

It does not record the IP address, any identity, or anything that needs JavaScript on the phone. The [privacy page](/privacy) lists every field, including those deliberately left out.`,
        more: 'qr-code-analytics-what-you-can-actually-know',
      },
      {
        id: 'see-who-scanned',
        q: 'Can I see who scanned my QR code?',
        a: `No, and no honest QR service can show you that. A scan is an anonymous web request: it tells the server roughly where it came from and what kind of phone made it, but not a name, an email address or a phone number.

To learn who someone is, they have to tell you — by filling in a form, signing in or buying something on the page the code opens.`,
        more: 'do-qr-codes-track-you',
      },
      {
        id: 'unique-vs-total-scans',
        q: 'What is the difference between total scans and unique scans?',
        a: `Total scans counts every scan; unique scans counts different visitors, so one person scanning three times is three total and one unique.

QRly counts a visitor as unique per day. It recognises repeat scans with a salted hash of the connection and device that is regenerated every 24 hours, so it can tell a repeat from a new visitor today, but cannot follow anyone across days — including by us.`,
        more: 'unique-vs-total-qr-code-scans',
      },
      {
        id: 'google-analytics-and-utm',
        q: 'Can I track QR code scans in Google Analytics or with UTM tags?',
        a: `Yes. Add UTM parameters such as \`utm_source=poster&utm_medium=qr\` to the destination URL, and your website analytics will attribute those visits to the QR code. QRly also records UTM parameters with each scan in its own analytics.

The two numbers will differ: QRly counts every scan, while website analytics only counts visitors whose browser loaded the page and allowed its script.`,
        more: 'qr-code-utm-parameters-google-analytics',
      },
      {
        id: 'track-static-or-canva-codes',
        q: 'Can I track a static QR code, or one made in Canva?',
        a: `Not directly. A static code, which is what most free design tools make, opens the URL with nothing in between to count it. Your options are UTM parameters read in your website analytics, or making the code in a dynamic generator and placing that image in your design instead.`,
        more: 'canva-qr-code-generator',
      },
      {
        id: 'is-analytics-free',
        q: 'Is QR code scan analytics free on QRly?',
        a: `Yes. Every claimed code gets full analytics with no plan to upgrade to, no cap on scans recorded and no shortened history window. You choose how long scans are kept, from one day to ten years, with one year as the default.`,
        more: 'free-qr-code-tracking',
      },
      {
        id: 'data-retention',
        q: 'How long is scan data kept?',
        a: `One year by default, and you can set it anywhere from 1 day to 3,650 days in settings. A job runs every night and permanently deletes scans older than your window. Deleting a link deletes its scan history immediately.`,
      },
      {
        id: 'bots-and-previews',
        q: 'Do link previews and bots count as scans?',
        a: `They are recorded but kept out of the headline numbers. When a link is pasted into WhatsApp, Slack or iMessage, those apps fetch it to draw a preview, and search crawlers follow links too. QRly tags those requests as bots, and the dashboard excludes them by default with a switch to include them.`,
      },
      {
        id: 'export-scan-data',
        q: 'Can I export my scan data?',
        a: `Not yet. The dashboard shows every breakdown with filters, but there is no CSV download. If you need the raw data in another tool, UTM parameters on the destination will put the visits in your website analytics as well.`,
      },
      {
        id: 'location-accuracy',
        q: 'How accurate is the scan location?',
        a: `City level at best, and sometimes wrong. Location comes from the scanner's IP address, which VPNs, mobile carriers and corporate networks often route through a different city or country. Map markers sit on a city's centre, not on a street, and QRly never has a GPS position.`,
        more: 'qr-code-location-tracking',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Privacy and safety',
    entries: [
      {
        id: 'are-qr-codes-safe',
        q: 'Are QR codes safe to scan?',
        a: `A QR code is only as safe as the link inside it. Scanning a code does nothing by itself on a modern phone; the risk is the page it opens, which can be a phishing site like any link in an email.

Check the address your camera shows before tapping it, be wary of codes stuck over other codes in public places, and never enter a password or card details on a page you reached from a code you did not expect.`,
        more: 'are-qr-codes-safe',
      },
      {
        id: 'qr-code-virus',
        q: 'Can a QR code hack my phone or give it a virus?',
        a: `Not by being scanned. A QR code is text; your phone reads it and shows you a link. Harm needs a second step — you opening a malicious page, entering details on a fake login, or installing an app it offers. Keeping your phone updated and not installing apps from links covers most of the remaining risk.`,
        more: 'qr-code-malware-myths',
      },
      {
        id: 'quishing',
        q: 'What is quishing, and how do I spot a fake QR code?',
        a: `Quishing is phishing with a QR code: a fake parking-meter sticker, a letter or an email with a code that leads to a page designed to steal logins or payments. It works because people check links in emails more carefully than codes.

Warning signs are a sticker placed over another code, urgency ("pay now to avoid a fine"), a domain that does not match the organisation, and any page asking for a password or card number straight away. The US Federal Trade Commission has [warned about exactly this](https://consumer.ftc.gov/consumer-alerts/2023/12/scammers-hide-harmful-links-qr-codes-steal-your-information).`,
        more: 'qr-code-phishing-quishing',
      },
      {
        id: 'check-before-opening',
        q: 'How can I check where a QR code goes before I open it?',
        a: `Read the address your camera shows before you tap it; both iPhone and Android display it. For a short link, the domain tells you which service made it, not where it ends up, so open it only if you trust the context the code was in.`,
        more: 'check-where-a-qr-code-goes-before-scanning',
      },
      {
        id: 'is-a-free-generator-safe',
        q: 'Is it safe to use a free QR code generator?',
        a: `It is safe for the people scanning; the risk is to you, the owner. With a dynamic code, the generator controls where your printed code goes, so the questions are whether they can switch it off, cap it, put an ad in front of it or change its terms.

QRly's answers are no, no, no and it is open source — but whichever generator you use, a custom domain you own is the strongest protection.`,
        more: 'free-vs-paid-qr-code-generator',
      },
      {
        id: 'gdpr-and-cookies',
        q: 'Is QRly scan tracking GDPR-compliant? Do I need a cookie banner?',
        a: `QRly sets no cookies and runs no script on the scanner's phone, so a scan involves nothing a cookie banner is for. The IP address, which EU law can treat as personal data, is used for a moment to work out approximate location and a daily visitor hash, and is then discarded without being stored or logged.

Browsers that send Global Privacy Control or Do Not Track are counted with even less. Whether your own privacy notice should mention QR analytics depends on your use; this is a description of how QRly works, not legal advice.`,
        more: 'gdpr-and-qr-code-tracking',
      },
      {
        id: 'phishing-through-qrly',
        q: 'Can someone use QRly to send people to a scam site?',
        a: `QRly refuses destinations on private and local networks, including the disguised spellings used to slip past naive checks, and it is built to screen destinations against Google Safe Browsing and re-check them weekly. A destination flagged as unsafe does not redirect silently: the scan lands on a warning page.

A link that has not been checked is recorded as unchecked, never as clean. If you find a QRly code being misused, report it through [GitHub](https://github.com/HK-0811/QRly/issues).`,
        more: 'safe-browsing-and-qr-codes',
      },
      {
        id: 'sticker-over-my-code',
        q: 'Can someone put a sticker over my QR code?',
        a: `Yes, and it is the most common QR scam: a printed sticker over a real code on a parking meter, poster or menu. No generator can prevent it. Put codes where they can be seen and checked, print your domain as text next to them so people can compare, and use a [custom domain](#custom-domain) so the address itself says who you are.`,
      },
      {
        id: 'can-qrly-change-my-destination',
        q: 'Could QRly change where my code points without asking me?',
        a: `No. Only the owner of a link can change its destination, and QRly never inserts ads or redirects of its own. The one intervention is safety: a destination flagged as malicious shows a warning page instead of redirecting.

A code made without an account is controlled by a claim token kept in the browser that created it, until it is claimed; nobody else can take it over.`,
      },
    ],
  },
  {
    id: 'design',
    title: 'Design, size and printing',
    entries: [
      {
        id: 'logo-in-qr-code',
        q: 'Can I put my logo in the middle of a QR code?',
        a: `Yes. A logo covers part of the pattern, and QR error correction rebuilds what is covered — up to about 30% of the code at level H. QRly's studio caps the logo size to what the chosen error-correction level can survive, and shows a scannability read-out when a design is pushing it.

Use level Q or H with a logo, keep the logo on a plain background, and test the printed result on more than one phone.`,
        more: 'qr-code-with-logo',
      },
      {
        id: 'qr-code-colours',
        q: 'Can QR codes be any colour, or do they have to be black and white?',
        a: `They can be any colour, as long as the modules are much darker than the background. Scanners look for contrast, so dark blue on white works, yellow on white does not, and a light pattern on a dark background fails on some older scanners.

QRly lets you choose both colours and warns when the contrast is too low to rely on.`,
        more: 'custom-qr-code-colours',
      },
      {
        id: 'inverted-qr-code',
        q: 'Can a QR code be white on a black background?',
        a: `It can, and modern iPhone and Android cameras read inverted codes, but some older scanner apps and point-of-sale readers do not. If the code must work for everyone, use dark modules on a light background; for a design where inverted matters, test it on several phones first.`,
        more: 'inverted-qr-code-white-on-black',
      },
      {
        id: 'print-size',
        q: 'What size should a QR code be when printed?',
        a: `At least a tenth of the distance it will be scanned from, and never less than about 2 cm (0.8 inches) across. A code read from 1 metre should be at least 10 cm wide; one on a poster read from 5 metres, at least 50 cm.

Short links help: they keep the pattern simple, so each square is larger at the same printed size.`,
        more: 'qr-code-size-guide',
      },
      {
        id: 'business-card-size',
        q: 'What is the smallest QR code that works on a business card?',
        a: `About 2 cm (0.8 inches) square, with a clear margin around it. That is enough for a phone held at arm's length, provided the code is a short link and printed as a vector. Denser codes with long URLs need to be larger.`,
        more: 'qr-code-for-business-card',
      },
      {
        id: 'svg-or-png',
        q: 'Should I download my QR code as SVG or PNG?',
        a: `SVG for anything printed or sent to a designer, because it is a vector and stays sharp at any size. PNG for screens, documents and places that do not accept SVG — QRly exports it at 512, 1024 or 2048 pixels. Never enlarge a small PNG; download a bigger one.`,
        more: 'qr-code-file-formats-svg-png',
      },
      {
        id: 'error-correction',
        q: 'What is QR code error correction, and which level should I choose?',
        a: `Error correction is redundancy that lets a damaged or partly covered code still scan. The four levels restore about 7% (L), 15% (M), 25% (Q) and 30% (H) of the code, according to the standard's owner, Denso Wave.

M is the usual choice. Use Q or H for a logo, rough surfaces or outdoor wear; higher levels make the pattern denser, so they need a slightly larger print.`,
        more: 'qr-code-error-correction-explained',
      },
      {
        id: 'quiet-zone',
        q: 'Why does a QR code need a white border?',
        a: `The border, called the quiet zone, is how a scanner finds where the code starts. The standard asks for four modules (squares) of empty space on every side. Cropping it off, or printing the code flush against other artwork, is one of the most common reasons a code will not scan.`,
        more: 'qr-code-quiet-zone',
      },
      {
        id: 'why-so-dense',
        q: 'Why does my QR code look so dense and busy?',
        a: `Because it holds a lot of data. The longer the text inside, the more squares the code needs — from 21×21 for very short content up to 177×177. A long URL makes a crowded pattern that is harder to scan when small.

A short link fixes this: every QRly code encodes a URL of about 25 characters, however long the destination is.`,
        more: 'why-short-urls-make-better-qr-codes',
      },
      {
        id: 'round-and-custom-shapes',
        q: 'Can QR codes be round or use dots and custom shapes?',
        a: `Yes, within limits. The squares can be dots or rounded, and the three corner markers can be restyled, as long as each module is still clearly light or dark. QRly offers several module and finder shapes and tests them through a real decoder. The overall code stays square; frames and circular crops around it are decoration.`,
        more: 'rounded-and-dot-qr-codes',
      },
      {
        id: 'transparent-background',
        q: 'Can a QR code have a transparent background?',
        a: `Yes, if whatever it is placed on is light and plain. A transparent code put on a photo or a dark colour loses its contrast and its quiet zone, and stops scanning. A solid light background is safer.`,
        more: 'transparent-background-qr-code',
      },
      {
        id: 'test-before-printing',
        q: 'How do I test a QR code before printing it?',
        a: `Print a proof at the real size and scan it with at least one iPhone and one Android phone, from the distance people will actually stand, in the light where it will hang. Check it opens the right page. Testing the file on your monitor proves much less than testing the paper.`,
        more: 'test-a-qr-code-before-printing',
      },
    ],
  },
  {
    id: 'scanning',
    title: 'Scanning and troubleshooting',
    entries: [
      {
        id: 'how-to-scan',
        q: 'How do I scan a QR code on an iPhone or Android phone?',
        a: `Open the camera and point it at the code; a link appears, and you tap it. iPhones have done this since iOS 11. Most Android phones do it in the camera app too, and every Android phone can use Google Lens or the QR scanner tile in quick settings.`,
        more: 'how-to-scan-a-qr-code',
      },
      {
        id: 'need-an-app',
        q: 'Do I need an app to scan a QR code?',
        a: `No, on any recent phone. The built-in camera on iPhone and on most Android phones reads QR codes, so no separate scanner app is needed — and many third-party scanner apps are loaded with ads.`,
        more: 'how-to-scan-a-qr-code',
      },
      {
        id: 'scan-code-on-own-screen',
        q: 'How do I scan a QR code that is on my own phone screen or in a screenshot?',
        a: `Use image recognition on the picture instead of the camera. On iPhone, open the screenshot in Photos and press on the code. On Android, open it with Google Lens from the Photos or Gallery app. Both read the code and offer the link.`,
      },
      {
        id: 'qr-code-not-scanning',
        q: 'Why is my QR code not scanning?',
        a: `Usually one of five things: it is printed too small for the distance, the contrast is too low, the white border has been cropped, a logo covers too much of it, or the surface is glossy, curved or damaged.

Try it larger, darker on a lighter background, with its quiet zone restored. If it scans but goes nowhere, the problem is the link, not the pattern.`,
        more: 'qr-code-not-working-how-to-fix',
      },
      {
        id: 'scans-but-page-wont-open',
        q: 'My QR code scans, but the page will not open. Why?',
        a: `The code is fine; the destination is the problem. Either the page it points to is down or has moved, the phone has no connection, or — for a dynamic code — the service behind it has deactivated or expired the link. Open the address on a computer to see which.`,
      },
      {
        id: 'deactivated-message',
        q: 'Why does my QR code say it has been deactivated or expired?',
        a: `That page comes from the dynamic QR service whose link is inside the code, not from the code. It usually means a free trial ended, a plan lapsed or a scan limit was reached. Only that service can switch it back on.

On QRly, a code only stops if its owner turns it off, deletes it, sets an expiry date, or never claims it within 30 days.`,
      },
      {
        id: 'scan-from-far-away',
        q: 'Will a QR code scan from far away, like on a billboard?',
        a: `Yes, if it is big enough: plan on about 10 cm of code width for every metre of distance. A billboard seen from 20 metres needs a code around 2 metres across, which is why codes on billboards are rare and codes on bus shelters are common.`,
        more: 'qr-code-print-size-and-resolution',
      },
      {
        id: 'works-offline',
        q: 'Does a QR code work without internet?',
        a: `The scan does; the destination might not. Any phone reads a QR code offline. A code containing text, Wi-Fi details or a contact card works entirely offline, but a code that opens a web page — including every dynamic code — needs a connection to load it.`,
      },
      {
        id: 'screens-slides-email',
        q: 'Do QR codes work on TV screens, slides and in emails?',
        a: `Yes. Codes scan from screens as well as paper, provided they are large enough for the viewing distance and not blurred by scaling. In an email, a QR code only helps someone reading on a computer; on a phone, a normal link is easier to tap.`,
      },
    ],
  },
  {
    id: 'links-and-domains',
    title: 'Short links and custom domains',
    entries: [
      {
        id: 'what-is-a-short-link',
        q: 'What is a short link, and why does my QR code use one?',
        a: `A short link is a brief URL, such as qrly.lol/aB3xK9p, that redirects to a longer one. A dynamic QR code encodes the short link rather than your page, which is what lets the destination change after printing, lets scans be counted, and keeps the pattern simple enough to print small.`,
        more: 'qr-code-redirect-explained',
      },
      {
        id: 'choose-short-link-ending',
        q: 'Can I choose the ending of my short link?',
        a: `Yes. When you create a code on QRly you can set a custom ending, such as qrly.lol/spring-menu, or leave it blank for a random one. Endings are letters, numbers, hyphens and underscores; common words like "login" or "pricing" are reserved. Once created, the ending cannot be changed, because it may already be printed.`,
        more: 'custom-short-link-qr-code',
      },
      {
        id: 'use-short-link-alone',
        q: 'Can I use the short link on its own, without the QR code?',
        a: `Yes. The short link works anywhere a URL does — in a bio, a text message, an email or on a slide — and its clicks appear in the same analytics as the code's scans, with the referrer telling you where they came from.`,
      },
      {
        id: 'custom-domain',
        q: 'Can I use my own domain for my QR codes?',
        a: `Yes. Add a subdomain you own, such as qr.yourbrand.com, and create one CNAME record at your DNS provider pointing to QRly. The HTTPS certificate is issued automatically, and QRly checks the record across two resolvers and tells you exactly what it found.

Your codes then read qr.yourbrand.com/offer, which looks like you, is more trustworthy to scan, and can be moved to another service later because the domain is yours.`,
        more: 'how-to-set-up-a-custom-domain-for-qr-codes',
      },
      {
        id: 'custom-domain-cost',
        q: 'Do custom domains cost extra on QRly?',
        a: `No. Custom domains are free with an account; you only pay your registrar for the domain you already own. Many paid QR services reserve custom domains for their higher plans.`,
        more: 'custom-domain-qr-code',
      },
      {
        id: 'move-to-another-provider',
        q: 'Can I move my QR codes to a different provider?',
        a: `Only if the printed link is on a domain you control. A code on a vendor's own domain (theirs.com/abc) can only ever be redirected by that vendor. A code on your own domain (qr.yourbrand.com/abc) can be moved: recreate the same endings on another service, or on your own copy of QRly, and point the domain there.`,
        more: 'custom-domain-qr-code',
      },
      {
        id: 'redirect-and-seo',
        q: 'Does a QR code redirect hurt my SEO? Why a 302 and not a 301?',
        a: `No. The redirect only affects people who scan or click the short link, not how search engines rank your page. QRly uses a 302 temporary redirect on purpose: browsers may cache a 301 permanently, and then a phone that scanned your code once would never see a new destination.`,
        more: 'qr-code-redirect-explained',
      },
    ],
  },
  {
    id: 'basics',
    title: 'QR code basics',
    entries: [
      {
        id: 'what-is-a-qr-code',
        q: 'What is a QR code, and how does it work?',
        a: `A QR code is a square two-dimensional barcode that stores text — usually a web address — in a grid of dark and light squares. A phone camera reads the three corner markers to find and straighten the grid, decodes the pattern, corrects any damage with built-in redundancy, and offers what it contains.

"QR" stands for Quick Response. The format is an international standard, ISO/IEC 18004.`,
        more: 'what-is-a-qr-code',
      },
      {
        id: 'do-qr-codes-cost-money',
        q: 'Do QR codes cost money to make?',
        a: `No. The QR code format is free to use, and a static code is just an image any free tool can draw. Paying only makes sense for a service — editing destinations and counting scans — and QRly provides that for free too.`,
        more: 'free-qr-code-generator',
      },
      {
        id: 'what-can-a-qr-code-link-to',
        q: 'What can a QR code link to?',
        a: `Anything with a URL: a website, a PDF, a Google Form, a Google Maps location, a review page, a YouTube video, a menu, a payment page or an app store listing. QR codes can also hold Wi-Fi details, contact cards and plain text directly, without a link.`,
        more: 'qr-code-for-a-link',
      },
      {
        id: 'who-invented-qr-codes',
        q: 'Who invented the QR code? Do I need a licence to use one?',
        a: `Masahiro Hara's team at Denso Wave, then part of the Toyota group supplier Denso, invented the QR code in 1994 to track car parts. Denso Wave kept its patent rights but has stated it will not exercise them, so anyone may make and use QR codes that follow the standard without a licence or fee.

"QR Code" is a registered trademark of Denso Wave Incorporated.`,
        more: 'history-of-the-qr-code',
      },
      {
        id: 'can-qr-codes-run-out',
        q: 'Can we run out of QR codes? Is every QR code unique?',
        a: `No, they cannot run out. A QR code is a picture of its content, so two codes are identical only if they contain the same text with the same settings. The number of possible codes is astronomically larger than the number that will ever be printed.

What must be unique is the short link inside a dynamic code, and the service guarantees that.`,
      },
      {
        id: 'qr-code-vs-barcode-vs-nfc',
        q: 'What is the difference between a QR code, a barcode and an NFC tag?',
        a: `A barcode stores a short number in one direction and needs a laser or dedicated scanner; a QR code stores hundreds of characters in two directions and any phone camera reads it. An NFC tag is a chip read by tapping the phone against it; it costs money per tag and does not work from a distance, but it cannot be covered by a fake sticker.`,
        more: 'qr-code-vs-barcode',
      },
      {
        id: 'how-much-data',
        q: 'How much data can a QR code hold?',
        a: `Up to 7,089 digits, 4,296 letters and numbers, or 2,953 bytes of any data in the largest version (40, 177×177 squares) at the lowest error correction. In practice, keep it far below that: a short URL makes a code that scans quickly at small sizes.`,
        more: 'qr-code-versions-and-capacity',
      },
    ],
  },
  {
    id: 'choosing',
    title: 'Choosing a generator',
    entries: [
      {
        id: 'canva-qr-codes',
        q: 'Do Canva QR codes expire, and can they be tracked?',
        a: `Codes from Canva's free QR generator are static, so they do not expire — and they cannot be edited or tracked, because the URL is in the pattern and nothing sits between the phone and the page.

To track a code in a Canva design, make a dynamic code elsewhere, download it as SVG and place it in the design.`,
        more: 'canva-qr-code-generator',
      },
      {
        id: 'qr-code-monkey',
        q: 'Is QR Code Monkey free forever?',
        a: `Its static codes are free and, being static, do not expire. Choosing a dynamic code there sends you to a paid service. So it is free for codes you never need to change or track, which is a fair deal for that use.`,
        more: 'qr-code-monkey-alternative',
      },
      {
        id: 'bitly-qr-codes',
        q: "Is Bitly's QR code free, and why does my Bitly link show an ad?",
        a: `Bitly's free plan, as published in August 2026, includes 5 links and 2 QR codes a month. Since early 2025 Bitly has shown a preview page with advertising before free links and QR codes redirect, removed only on a paid plan.

QRly has no link allowance and never puts a page in front of the redirect.`,
        more: 'bitly-qr-code-alternative',
      },
      {
        id: 'qr-code-generator-trial',
        q: 'Why did my code from a "free" QR generator stop after a trial?',
        a: `Because the "free" part was a trial of dynamic codes. Several large generators let you design and download a dynamic code for free, then deactivate its redirect after 7 or 14 days unless you subscribe; review sites are full of people who found out after printing.

Before you print, find out whether the generator's free tier has a time limit, a scan cap or an inactivity rule, and whose domain the code uses.`,
        more: 'free-vs-paid-qr-code-generator',
      },
      {
        id: 'how-much-should-it-cost',
        q: 'How much should a QR code generator cost?',
        a: `For static codes, nothing. For dynamic codes, the underlying cost is a fraction of a cent per thousand scans, so a monthly fee pays for support, features like bulk creation and team seats, and margin. QRly shows that the core — editable codes, analytics and custom domains — can run for $0.

The [cost page](/cost) lists what the paid services publish, with the date each price was read.`,
        more: 'qr-code-generator-pricing-explained',
      },
      {
        id: 'what-to-check-before-choosing',
        q: 'What should I check before choosing a QR code generator?',
        a: `Before printing anything, find out: does the code stop working if I stop paying; is there a trial, scan cap or inactivity rule; will scanners see an ad or preview page; whose domain is in the code, and can I use my own; can I change the destination and the design later; and what does the scan tracking record about the people scanning.

A generator that answers all of those clearly in writing is one you can print with.`,
        more: 'best-free-qr-code-generators',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Rendered forms
// ---------------------------------------------------------------------------

export interface FaqItem {
  id: string;
  question: string;
  /** Markdown, as written above. */
  answer: string;
  /** HTML for the page. */
  html: string;
  /** Plain text for structured data and search. */
  text: string;
  more?: { href: string; title: string };
}

export interface FaqSection {
  id: string;
  title: string;
  items: FaqItem[];
}

let rendered: FaqSection[] | null = null;

/**
 * Every section, rendered once per build. Throws on a duplicate id or a
 * `more` that names a post which does not exist, because either one ships a
 * link that goes nowhere and neither would show up in a review of the page.
 */
export function faqSections(): FaqSection[] {
  if (rendered) return rendered;
  // Section and question ids share the page's fragment namespace.
  const seen = new Set<string>();
  const claim = (id: string) => {
    if (seen.has(id)) throw new Error(`lib/faq.ts: duplicate id "${id}"`);
    seen.add(id);
  };
  const item = (e: Entry): FaqItem => {
    claim(e.id);
    let more: FaqItem['more'];
    if (e.more) {
      const post = getPost(e.more);
      if (!post) throw new Error(`lib/faq.ts: "${e.id}" links to a post "${e.more}" that does not exist`);
      more = { href: `/blog/${post.slug}`, title: post.title };
    }
    return {
      id: e.id,
      question: e.q,
      answer: e.a,
      html: renderPassage(e.a),
      text: markdownText(e.a),
      more,
    };
  };
  rendered = GROUPS.map((g) => {
    claim(g.id);
    return { id: g.id, title: g.title, items: g.entries.map(item) };
  });
  return rendered;
}

export function faqCount(): number {
  return faqSections().reduce((n, s) => n + s.items.length, 0);
}

/**
 * Markdown answer to plain text, keeping paragraphs and flattening tables
 * into sentences a parser can read without the grid.
 */
function markdownText(markdown: string): string {
  return markdown
    .split(/\n{2,}/)
    .map((block) => {
      if (!block.trim().startsWith('|')) return markdownToText(block);
      const rows = block
        .trim()
        .split('\n')
        .filter((r) => !/^\|[\s|:-]+\|$/.test(r.trim()))
        .map((r) =>
          r
            .trim()
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((c) => c.trim()),
        );
      const [head, ...body] = rows;
      return body
        .map((cells) => `${cells[0]}: ${cells.slice(1).map((c, i) => `${head[i + 1]} ${c}`).join(', ')}.`)
        .join(' ');
    })
    .join('\n\n');
}
