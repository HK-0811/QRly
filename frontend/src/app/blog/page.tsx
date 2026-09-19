import Link from 'next/link';
import type { Metadata } from 'next';
import { BlogShell } from '@/components/blog/blog-shell';
import { CATEGORIES, formatDate, getAllPosts, type Category } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — QR codes, explained plainly',
  description:
    'Guides to free QR codes, dynamic QR codes, scan tracking, printing, custom domains and the things vendors would rather you did not know.',
  alternates: { canonical: 'https://qrly.lol/blog' },
};

/**
 * The index is grouped by category rather than listed by date, because
 * nobody arrives here wanting "the newest post". They arrive from a search
 * for one specific thing, and the grouping is what lets them find the next
 * thing without going back to the search engine.
 */
export default function BlogIndex() {
  const posts = getAllPosts();
  const groups = (Object.keys(CATEGORIES) as Category[])
    .map((key) => ({ key, label: CATEGORIES[key], posts: posts.filter((p) => p.category === key) }))
    .filter((g) => g.posts.length > 0);

  return (
    <BlogShell width="index">
      <p className="eyebrow">Blog</p>
      <h1 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[38px]">
        QR codes, explained plainly
      </h1>
      <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-[var(--text-muted)]">
        {posts.length} guides on making, printing and tracking QR codes — written by the people
        running a free QR code platform, and honest about where the limits are.
      </p>

      <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[13px]" aria-label="Categories">
        {groups.map((g) => (
          <a
            key={g.key}
            href={`#${g.key}`}
            className="text-[var(--text-soft)] underline decoration-[var(--rule-strong)] underline-offset-[3px] hover:text-[var(--text)] hover:decoration-[var(--accent)]"
          >
            {g.label} <span className="tabular text-[var(--text-faint)]">{g.posts.length}</span>
          </a>
        ))}
      </nav>

      {groups.map((g) => (
        <section key={g.key} id={g.key} className="mt-12 scroll-mt-6">
          <h2 className="border-b border-[var(--rule-mid)] pb-3 text-[16px] font-semibold tracking-tight">
            {g.label}
          </h2>
          <ul className="divide-y divide-[var(--rule)]">
            {g.posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group grid gap-1 py-4 text-[var(--text)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--text)] sm:grid-cols-[1fr_auto] sm:gap-6"
                >
                  <span>
                    <span className="block text-[15.5px] font-medium tracking-tight group-hover:text-[var(--accent)]">
                      {p.title}
                    </span>
                    <span className="mt-1 block text-[13.5px] leading-relaxed text-[var(--text-soft)]">
                      {p.description}
                    </span>
                  </span>
                  <span className="tabular shrink-0 self-start font-mono text-[11.5px] text-[var(--text-faint)] sm:pt-1">
                    {p.minutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-12 text-[12.5px] text-[var(--text-faint)]">
        Newest post: {posts[0] ? formatDate(posts[0].date) : '—'}.
      </p>
    </BlogShell>
  );
}
