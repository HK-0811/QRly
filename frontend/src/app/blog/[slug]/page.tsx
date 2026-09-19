import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BlogShell, MakeACodeCta } from '@/components/blog/blog-shell';
import { CATEGORIES, formatDate, getAllPosts, getPost, relatedPosts } from '@/lib/blog';
import { AUTHOR } from '@/lib/site';

const SITE = 'https://qrly.lol';

/**
 * Every post is generated at build time and nothing else is routable here.
 * `dynamicParams = false` is what turns an unknown slug into a 404 instead of
 * an attempt to read a file on a Worker that has no files.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `${SITE}/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${SITE}/blog/${post.slug}`,
      siteName: 'QRly',
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [AUTHOR.name],
    },
    twitter: { card: 'summary', title: post.title, description: post.description },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = relatedPosts(post);

  // Structured data, so a search engine reads this as an article with a date
  // and an author rather than as a page with some text on it.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    publisher: { '@type': 'Organization', name: 'QRly', url: SITE },
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
    keywords: post.keywords.join(', '),
  };

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-[12.5px] text-[var(--text-faint)]" aria-label="Breadcrumb">
        <Link href="/blog" className="text-[var(--text-faint)] hover:text-[var(--text)]">
          Blog
        </Link>
        <span aria-hidden className="mx-2 text-[var(--text-ghost)]">
          /
        </span>
        <span>{CATEGORIES[post.category]}</span>
      </nav>

      <h1 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[38px]">
        {post.title}
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-[var(--text-muted)]">{post.description}</p>
      <p className="tabular mt-4 font-mono text-[11.5px] uppercase tracking-[0.08em] text-[var(--text-faint)]">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.updated && (
          <>
            {' · updated '}
            <time dateTime={post.updated}>{formatDate(post.updated)}</time>
          </>
        )}
        {' · '}
        {post.minutes} min read
      </p>

      {post.headings.length >= 3 && (
        <nav
          className="mt-8 border-y border-[var(--rule-mid)] py-4 text-[13.5px]"
          aria-label="On this page"
        >
          <p className="eyebrow mb-2">On this page</p>
          <ol className="space-y-1">
            {post.headings.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`} className="text-[var(--text-muted)] hover:text-[var(--accent)]">
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/*
        The body is our own Markdown, rendered at build time from files in this
        repository. There is no user-authored content anywhere in it.
      */}
      <article className="prose-qrly mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />

      <MakeACodeCta />

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="border-b border-[var(--rule-mid)] pb-3 text-[14px] font-semibold tracking-tight">
            Keep reading
          </h2>
          <ul className="divide-y divide-[var(--rule)]">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/blog/${r.slug}`}
                  className="group block py-3.5 text-[var(--text)] hover:text-[var(--text)]"
                >
                  <span className="block text-[14.5px] font-medium tracking-tight group-hover:text-[var(--accent)]">
                    {r.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-[var(--text-soft)]">
                    {r.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </BlogShell>
  );
}
