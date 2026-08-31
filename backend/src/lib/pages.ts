/**
 * Branded pages for every way a scan can fail to redirect.
 *
 * A printed QR code has no back button and no context. Whoever scanned it is
 * standing in front of a poster holding a phone, and a raw "404 Not Found" tells
 * them nothing about whether the code is broken, expired, or was never real. Each
 * of these says which one it is.
 *
 * Self-contained HTML with inline styles: no external stylesheet, no font request,
 * no JavaScript. One round trip, and it renders on a bad mobile connection.
 */

const SHELL = (opts: {
  title: string;
  heading: string;
  body: string;
  accent: string;
  extra?: string;
}) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${opts.title}</title>
<style>
  /*
    Matched to the dashboard's language — hairline rules, no radius, mono for the
    address — but this file keeps its own dark palette while the app is light
    only. The app is a tool someone chose to open at a desk; this renders on a
    stranger's phone, held up to a poster, possibly at night. Respecting their
    phone's setting costs one media query and is the difference between a
    readable answer and a white flash in a dark room.

    Still self-contained: no stylesheet, no font request, no JavaScript. One
    round trip, and it renders on a bad mobile connection.
  */
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 24px;
    font: 15px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: #fff; color: #0A0A0A;
    -webkit-font-smoothing: antialiased;
  }
  main { max-width: 30rem; width: 100%; }
  .mark { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; }
  .glyph { width: 14px; height: 14px; background: #0A0A0A;
           box-shadow: 5px 0 0 ${opts.accent}, 0 5px 0 #0A0A0A; }
  .mark span { font-family: ui-monospace, "SF Mono", Menlo, monospace;
               font-size: 13px; letter-spacing: 0.14em; padding-left: 8px; }
  .eyebrow { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 11px;
             letter-spacing: 0.1em; text-transform: uppercase; color: ${opts.accent};
             margin: 0 0 14px; }
  h1 { margin: 0 0 14px; font-size: 26px; font-weight: 600; letter-spacing: -0.03em;
       line-height: 1.15; }
  p { margin: 0 0 12px; color: #565656; }
  .url { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 13px;
         word-break: break-all; border: 1px solid rgba(10,10,10,0.12);
         padding: 10px 12px; color: #0A0A0A; margin-top: 18px; }
  .btn { display: inline-block; margin-top: 20px; padding: 13px 20px;
         font-size: 14px; font-weight: 500; text-decoration: none;
         border: 1.5px solid rgba(10,10,10,0.2); color: #0A0A0A; }
  .btn-danger { border-color: rgba(176,48,48,0.4); color: #B03030; }
  footer { margin-top: 40px; padding-top: 18px; border-top: 1px solid rgba(10,10,10,0.08);
           font-size: 12px; color: #9A9A9A; }
  @media (prefers-color-scheme: dark) {
    body { background: #0D0D0D; color: #F0F0F0; }
    .glyph { background: #F0F0F0; box-shadow: 5px 0 0 ${opts.accent}, 0 5px 0 #F0F0F0; }
    p { color: #9A9A9A; }
    .url { border-color: rgba(255,255,255,0.14); color: #F0F0F0; }
    .btn { border-color: rgba(255,255,255,0.22); color: #F0F0F0; }
    .btn-danger { border-color: rgba(240,120,120,0.45); color: #F08C8C; }
    footer { border-top-color: rgba(255,255,255,0.1); color: #6B6B6B; }
  }
</style>
</head>
<body>
<main>
  <div class="mark"><span class="glyph"></span><span>QRLY</span></div>
  <p class="eyebrow">${opts.title}</p>
  <h1>${opts.heading}</h1>
  ${opts.body}
  ${opts.extra ?? ''}
  <footer>This short link is served by QRly.</footer>
</main>
</body>
</html>`;

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const HTML = { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' };

/** Cache-Control for pages whose state can change: the link may be re-enabled. */
const NO_STORE = { ...HTML, 'Cache-Control': 'no-store' };

export function notFoundPage(hostname: string, slug: string): Response {
  return new Response(
    SHELL({
      title: 'Link not found',
      heading: 'This QR code does not point anywhere',
      accent: '#9A9A9A',
      body:
        `<p>There is no link at this address. The QR code may have been mistyped, or it may ` +
        `never have existed.</p>` +
        `<div class="url">${esc(hostname)}/${esc(slug)}</div>`,
    }),
    { status: 404, headers: NO_STORE },
  );
}

export function disabledPage(hostname: string, slug: string): Response {
  return new Response(
    SHELL({
      title: 'Link turned off',
      heading: 'This QR code has been turned off',
      accent: 'oklch(0.58 0.215 32)',
      body:
        `<p>The person who created this link has disabled it for now. The QR code itself is ` +
        `still valid &mdash; if they turn it back on, scanning again will work.</p>` +
        `<div class="url">${esc(hostname)}/${esc(slug)}</div>`,
    }),
    // 410 would tell a crawler this is permanently gone, which is wrong: the
    // owner can re-enable it at any moment.
    { status: 404, headers: NO_STORE },
  );
}

export function expiredPage(hostname: string, slug: string, expiredAt: string): Response {
  const when = new Date(expiredAt);
  const formatted = Number.isNaN(when.getTime())
    ? ''
    : `<p>It stopped working on ${esc(
        when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      )}.</p>`;

  return new Response(
    SHELL({
      title: 'Link expired',
      heading: 'This QR code has expired',
      accent: 'oklch(0.58 0.215 32)',
      body:
        `<p>The person who created this link set it to stop working after a date that has ` +
        `now passed.</p>${formatted}` +
        `<div class="url">${esc(hostname)}/${esc(slug)}</div>`,
    }),
    { status: 410, headers: NO_STORE },
  );
}

/**
 * A flagged link keeps resolving to this page rather than 404ing, because the
 * printed code cannot be recalled. The destination is shown but not followed
 * automatically, and continuing takes a deliberate second action.
 */
export function flaggedPage(hostname: string, slug: string, destination: string): Response {
  let host = destination;
  try {
    host = new URL(destination).hostname;
  } catch {
    /* keep the raw string */
  }

  return new Response(
    SHELL({
      title: 'Warning — unsafe destination',
      heading: 'This link was flagged as unsafe',
      accent: '#B03030',
      body:
        `<p>Google Safe Browsing reports the page behind this QR code as dangerous &mdash; ` +
        `usually phishing or malware. We have stopped the redirect.</p>` +
        `<p>It was going to send you to:</p>` +
        `<div class="url">${esc(host)}</div>`,
      extra:
        `<a class="btn btn-danger" href="${esc(destination)}" rel="nofollow noreferrer noopener">` +
        `Continue anyway</a>`,
    }),
    { status: 200, headers: NO_STORE },
  );
}

/**
 * Postgres is unreachable and the cache is cold. Deliberately a 503 with a
 * Retry-After, not a 404: a 404 would tell a crawler the code is dead, and tell
 * the person holding the phone that their poster is wrong.
 */
export function unavailablePage(): Response {
  return new Response(
    SHELL({
      title: 'Temporarily unavailable',
      heading: 'This is temporarily unavailable',
      accent: 'oklch(0.58 0.215 32)',
      body:
        `<p>We could not look up where this QR code goes. This is a problem on our side, not ` +
        `with the QR code you scanned. Try again in a moment.</p>`,
    }),
    { status: 503, headers: { ...NO_STORE, 'Retry-After': '30' } },
  );
}

/**
 * An unhandled failure. Carries a short id that also appears in the log line, so
 * "I got error a3f9c2" is a findable report rather than a shrug.
 *
 * No stack trace, no exception message: whoever scanned the code cannot act on
 * either, and both leak implementation detail to whoever else scans it.
 */
export function errorPage(id: string): Response {
  return new Response(
    SHELL({
      title: 'Something went wrong',
      heading: 'Something went wrong on our side',
      accent: '#B03030',
      body:
        `<p>This is not a problem with the QR code you scanned. Trying again usually works.</p>` +
        `<p>If it keeps happening, this reference identifies what failed:</p>` +
        `<div class="url">${esc(id)}</div>`,
    }),
    { status: 500, headers: NO_STORE },
  );
}

/** The bare hostname of a redirect domain, which resolves to no link at all. */
export function rootPage(dashboardOrigin: string): Response {
  return new Response(
    SHELL({
      title: 'QRly',
      heading: 'Nothing to redirect to',
      accent: 'oklch(0.58 0.215 32)',
      body:
        `<p>This address serves short links. There is no link at the root &mdash; scan a ` +
        `QR code or follow a full short link.</p>`,
      extra: `<a class="btn" href="${esc(dashboardOrigin)}">Go to the dashboard</a>`,
    }),
    { status: 404, headers: HTML },
  );
}
