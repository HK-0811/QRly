/**
 * Where an anonymous code's claim token lives until someone signs in.
 *
 * This is the browser's only copy of a credential the server will never reissue.
 * If it is lost, the code keeps redirecting forever and nobody can ever edit it
 * or read its scans — so every read and write here is defensive, and the UI that
 * calls it always shows the short URL alongside, because that is the part the
 * person can write down.
 *
 * localStorage rather than a cookie: it never needs to reach the server (the
 * claim is an explicit API call with the token in the body), and keeping it out
 * of every request header means it cannot leak into logs.
 *
 * The consequence, which the claim screen states plainly: this is per-browser.
 * Make a code on a phone, sign up on a laptop, and the laptop has nothing to
 * claim.
 */

const KEY = 'qrly.unclaimed.v1';
const MAX = 20;

export interface PendingLink {
  claimToken: string;
  slug: string;
  shortUrl: string;
  destination: string;
  createdAt: string;
}

function read(): PendingLink[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Anything malformed is dropped rather than thrown: a corrupted entry must
    // not be able to break the dashboard for the codes that are still fine.
    return parsed.filter(
      (v): v is PendingLink =>
        !!v &&
        typeof v === 'object' &&
        typeof (v as PendingLink).claimToken === 'string' &&
        typeof (v as PendingLink).slug === 'string',
    );
  } catch {
    return [];
  }
}

function write(list: PendingLink[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
  } catch {
    // Private mode, or a full quota. Nothing to do — the caller already has the
    // token on screen, and failing the creation over storage would be worse.
  }
}

export function pendingLinks(): PendingLink[] {
  return read();
}

export function remember(link: PendingLink): void {
  const list = read().filter((l) => l.claimToken !== link.claimToken);
  list.push(link);
  write(list);
}

/** Called once a token has been redeemed, or once the server says it never can be. */
export function forget(claimToken: string): void {
  write(read().filter((l) => l.claimToken !== claimToken));
}

export function forgetAll(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* see write() */
  }
}
