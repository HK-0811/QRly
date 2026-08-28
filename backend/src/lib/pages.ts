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
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 24px;
    font: 15px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: #fff; color: #16191d;
    -webkit-font-smoothing: antialiased;
  }
  main { max-width: 30rem; width: 100%; }
  .mark { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; opacity: .65; }
  .mark svg { width: 20px; height: 20px; }
  .mark span { font-size: 14px; font-weight: 600; letter-spacing: -0.01em; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: ${opts.accent}; display: inline-block; margin-right: 8px; vertical-align: 1px; }
  h1 { margin: 0 0 10px; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
  p { margin: 0 0 12px; color: #5b6470; }
  .url { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 13px;
         word-break: break-all; background: #f4f5f7; border: 1px solid #e4e7eb;
         border-radius: 6px; padding: 8px 10px; color: #16191d; }
  .btn { display: inline-block; margin-top: 18px; padding: 9px 14px; border-radius: 6px;
         font-size: 14px; font-weight: 500; text-decoration: none;
         border: 1px solid #d0d5dc; color: #16191d; }
  .btn-danger { border-color: #f0a6a6; color: #b02a2a; }
  footer { margin-top: 36px; font-size: 12px; color: #949cab; }
  @media (prefers-color-scheme: dark) {
    body { background: #0d0f12; color: #e8eaed; }
    p { color: #8b95a1; }
    .url { background: #16191e; border-color: #262b32; color: #e8eaed; }
    .btn { border-color: #343a43; color: #e8eaed; }
    .btn-danger { border-color: #6b2d2d; color: #f08c8c; }
    footer { color: #5a6270; }
  }
</style>
</head>
<body>
<main>
  <div class="mark">
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="2"/>
      <rect x="14" y="1" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="2"/>
      <rect x="1" y="14" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="2"/>
      <rect x="14.5" y="14.5" width="3.5" height="3.5" fill="currentColor"/>
      <rect x="19.5" y="19.5" width="3.5" height="3.5" fill="currentColor"/>
    </svg>
    <span>qrify</span>
  </div>
  <h1><span class="dot"></span>${opts.heading}</h1>
  ${opts.body}
  ${opts.extra ?? ''}
  <footer>This short link is served by qrify.</footer>
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
      heading: 'This code does not point anywhere',
      accent: '#8b95a1',
      body:
        `<p>There is no link at this address. The code may have been mistyped, or it may ` +
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
      heading: 'This code has been turned off',
      accent: '#f5b544',
      body:
        `<p>The person who created this link has disabled it for now. The code itself is ` +
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
      heading: 'This code has expired',
      accent: '#f5b544',
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
      accent: '#dc2626',
      body:
        `<p>Google Safe Browsing reports the page behind this code as dangerous &mdash; ` +
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
      accent: '#f5b544',
      body:
        `<p>We could not look up where this code goes. This is a problem on our side, not ` +
        `with the code you scanned. Try again in a moment.</p>`,
    }),
    { status: 503, headers: { ...NO_STORE, 'Retry-After': '30' } },
  );
}

/** The bare hostname of a redirect domain, which resolves to no link at all. */
export function rootPage(dashboardOrigin: string): Response {
  return new Response(
    SHELL({
      title: 'qrify',
      heading: 'Nothing to redirect to',
      accent: '#16b877',
      body:
        `<p>This address serves short links. There is no link at the root &mdash; scan a ` +
        `code or follow a full short URL.</p>`,
      extra: `<a class="btn" href="${esc(dashboardOrigin)}">Go to the dashboard</a>`,
    }),
    { status: 404, headers: HTML },
  );
}
