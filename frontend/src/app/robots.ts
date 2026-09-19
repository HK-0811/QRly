import type { MetadataRoute } from 'next';

/**
 * Served at /robots.txt. The dashboard and auth pages are excluded because
 * they are not content; a crawler that reached them would see a login form.
 * Short links are not listed here at all — they live on the redirect engine,
 * and a crawler following one gets the same 302 a phone does.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/create', '/cost', '/privacy'],
        disallow: ['/links', '/analytics', '/domains', '/settings', '/auth/', '/login', '/signup'],
      },
    ],
    sitemap: 'https://qrly.lol/sitemap.xml',
  };
}
