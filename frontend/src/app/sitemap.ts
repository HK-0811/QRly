import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { FAQ_REVIEWED } from '@/lib/faq';
import { SITE_URL as SITE } from '@/lib/site';

/**
 * Served at /sitemap.xml. Static: it is built once from the post files, so
 * the Worker never computes it. Only pages a search engine should index are
 * listed — the dashboard is behind a login and the auth pages are not content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newest = posts[0]?.date ?? '2026-09-19';

  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE}/create`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/faq`, lastModified: FAQ_REVIEWED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/blog`, lastModified: newest, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/cost`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/privacy`, changeFrequency: 'yearly', priority: 0.4 },
  ];

  return [
    ...pages,
    ...posts.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified: p.updated ?? p.date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
