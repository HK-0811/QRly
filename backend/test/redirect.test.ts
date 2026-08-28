import { describe, it, expect } from 'vitest';
import { evaluate } from '../src/routes/redirect';
import type { CachedLink } from '../src/types';

const base: CachedLink = {
  id: 'l1',
  user_id: 'u1',
  domain_id: 'd1',
  qr_id: null,
  destination_url: 'https://example.com/menu',
  is_active: true,
  expires_at: null,
  safe_browsing_status: 'clean',
  domain_active: true,
};

const NOW = Date.parse('2026-06-01T12:00:00Z');

describe('redirect validation chain', () => {
  it('redirects a healthy link', () => {
    expect(evaluate(base, NOW)).toEqual({
      kind: 'redirect',
      destination: 'https://example.com/menu',
    });
  });

  it('treats an unresolved slug as not found', () => {
    expect(evaluate(null, NOW)).toEqual({ kind: 'not_found' });
  });

  it('refuses a link whose domain was deactivated after caching', () => {
    // The domain's state is denormalised into the cached record, so a domain that
    // is switched off must stop serving even from a warm cache.
    expect(evaluate({ ...base, domain_active: false }, NOW)).toEqual({ kind: 'not_found' });
  });

  it('shows the disabled page for a switched-off link', () => {
    expect(evaluate({ ...base, is_active: false }, NOW)).toEqual({ kind: 'disabled' });
  });

  it('shows the expired page once the expiry has passed', () => {
    const at = '2026-05-01T00:00:00.000Z';
    expect(evaluate({ ...base, expires_at: at }, NOW)).toEqual({ kind: 'expired', at });
  });

  it('still redirects up to the moment of expiry', () => {
    expect(evaluate({ ...base, expires_at: '2026-06-02T00:00:00.000Z' }, NOW).kind).toBe('redirect');
  });

  it('ignores an unparseable expiry rather than bricking the link', () => {
    // A bad timestamp is a data bug. Failing closed here would break a printed
    // code over a formatting mistake.
    expect(evaluate({ ...base, expires_at: 'not-a-date' }, NOW).kind).toBe('redirect');
  });

  it('serves the warning page for a flagged link instead of a 404', () => {
    // The printed code cannot be recalled, so it has to keep resolving to
    // something that explains itself.
    expect(evaluate({ ...base, safe_browsing_status: 'flagged' }, NOW)).toEqual({
      kind: 'flagged',
      destination: 'https://example.com/menu',
    });
  });

  it('redirects a link that has not been checked yet', () => {
    // Safe Browsing is best-effort and network-dependent. Blocking every
    // unchecked link would mean every new link is dead until a cron runs.
    expect(evaluate({ ...base, safe_browsing_status: 'unchecked' }, NOW).kind).toBe('redirect');
  });

  it('checks disabled before expired before flagged', () => {
    // Order matters for the message the person reads. A link that is off, expired
    // AND flagged should say "off" — that is the state the owner controls.
    const worst: CachedLink = {
      ...base,
      is_active: false,
      expires_at: '2020-01-01T00:00:00.000Z',
      safe_browsing_status: 'flagged',
    };
    expect(evaluate(worst, NOW).kind).toBe('disabled');

    expect(
      evaluate({ ...worst, is_active: true }, NOW).kind,
    ).toBe('expired');
  });
});
