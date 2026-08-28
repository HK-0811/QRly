import { describe, it, expect } from 'vitest';
import {
  generateSlug,
  validateCustomSlug,
  isReserved,
  DEFAULT_SLUG_LENGTH,
  MAX_SLUG_LENGTH,
} from '../src/lib/slug';

describe('slug generation', () => {
  it('produces the requested length', () => {
    expect(generateSlug()).toHaveLength(DEFAULT_SLUG_LENGTH);
    expect(generateSlug(12)).toHaveLength(12);
  });

  it('never emits a glyph that is ambiguous when read off a printed poster', () => {
    // 0/O and 1/l/I are the pairs that turn "type this code" into a support ticket.
    const sample = Array.from({ length: 500 }, () => generateSlug(16)).join('');
    expect(sample).not.toMatch(/[0O1lI]/);
  });

  it('only emits characters the database CHECK constraint accepts', () => {
    const sample = Array.from({ length: 200 }, () => generateSlug()).join('');
    expect(sample).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('does not repeat across a large sample', () => {
    const seen = new Set(Array.from({ length: 5000 }, () => generateSlug()));
    expect(seen.size).toBe(5000);
  });
});

describe('custom slug validation', () => {
  it('accepts ordinary codes', () => {
    for (const s of ['launch', 'spring-2026', 'menu_v2', 'AbC123']) {
      expect(validateCustomSlug(s), s).toMatchObject({ ok: true, slug: s });
    }
  });

  it('trims surrounding whitespace rather than rejecting a pasted value', () => {
    expect(validateCustomSlug('  promo  ')).toMatchObject({ ok: true, slug: 'promo' });
  });

  it('rejects lengths outside the stored range', () => {
    expect(validateCustomSlug('ab')).toMatchObject({ ok: false, reason: 'too_short' });
    expect(validateCustomSlug('a'.repeat(MAX_SLUG_LENGTH + 1))).toMatchObject({
      ok: false,
      reason: 'too_long',
    });
  });

  it('rejects characters that would need URL-encoding in print', () => {
    for (const s of ['hello world', 'a/b', 'café', 'a.b', 'a+b', 'a%20b', '<script>']) {
      expect(validateCustomSlug(s), s).toMatchObject({ ok: false, reason: 'invalid_characters' });
    }
  });

  it('rejects punctuation-only codes that resolve but look broken', () => {
    expect(validateCustomSlug('---')).toMatchObject({ ok: false, reason: 'invalid_characters' });
  });

  it('rejects reserved words, case-insensitively', () => {
    for (const s of ['api', 'API', 'Login', 'privacy', 'health', 'admin']) {
      expect(validateCustomSlug(s), s).toMatchObject({ ok: false, reason: 'reserved' });
    }
  });

  it('reserves the paths the Worker itself serves', () => {
    // If any of these stopped being reserved, a user could claim a slug that
    // shadows a real route and the collision would only surface in production.
    expect(isReserved('api')).toBe(true);
    expect(isReserved('health')).toBe(true);
    expect(isReserved('robots.txt')).toBe(true);
    expect(isReserved('cdn-cgi')).toBe(true);
  });

  it('rejects non-strings', () => {
    expect(validateCustomSlug(null).ok).toBe(false);
    expect(validateCustomSlug(123 as unknown as string).ok).toBe(false);
  });

  it('always explains itself in words a user can act on', () => {
    for (const bad of ['ab', 'api', 'hello world', '---']) {
      const r = validateCustomSlug(bad);
      expect(r.ok).toBe(false);
      expect(r.message?.length ?? 0).toBeGreaterThan(10);
    }
  });
});
