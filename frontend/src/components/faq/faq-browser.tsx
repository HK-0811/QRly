'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui';

export interface FaqBrowserItem {
  id: string;
  question: string;
  /** Rendered HTML, built from our own Markdown at build time. */
  html: string;
  more?: { href: string; title: string };
}

export interface FaqBrowserSection {
  id: string;
  title: string;
  items: FaqBrowserItem[];
}

/**
 * The questions, with a filter over them.
 *
 * Every question and answer is in the server HTML whatever the filter says:
 * this component renders the whole list on the server, and the query only
 * hides entries once JavaScript is running. That is deliberate. The readers
 * this page is most written for — search crawlers and the fetchers answer
 * engines send — do not run scripts, and a FAQ that only appeared after a
 * client-side fetch would be a FAQ none of them could quote.
 *
 * The query is read from `?q=` after mount, not through useSearchParams. On a
 * statically rendered page that hook suspends to the nearest boundary, and
 * the static HTML would then hold the fallback instead of the answers.
 */
export function FaqBrowser({ sections }: { sections: FaqBrowserSection[] }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setQuery(q);
  }, []);

  // Kept in the URL so a filtered view can be linked to, and replaced rather
  // than pushed so typing does not fill the back button with keystrokes.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set('q', query.trim());
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  }, [query]);

  const terms = useMemo(
    () =>
      query
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 1),
    [query],
  );

  // Derived here rather than sent as a prop: the answers are already in the
  // payload once as HTML, and a second plain-text copy of all of them made
  // the page a third larger for a lookup the browser can build in a moment.
  const haystacks = useMemo(
    () =>
      new Map(
        sections.flatMap((s) =>
          s.items.map((i) => [i.id, `${i.question} ${i.html.replace(/<[^>]+>/g, ' ')}`.toLowerCase()]),
        ),
      ),
    [sections],
  );

  const visible = useMemo(() => {
    if (terms.length === 0) return null;
    const ids = new Set<string>();
    for (const [id, text] of haystacks) {
      if (terms.every((t) => text.includes(t))) ids.add(id);
    }
    return ids;
  }, [haystacks, terms]);

  const total = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <>
      <div className="mt-8" role="search">
        <label htmlFor="faq-search" className="eyebrow">
          Search {total} questions
        </label>
        <Input
          id="faq-search"
          type="search"
          variant="ruled"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="expire, logo, size, GDPR, custom domain…"
          autoComplete="off"
          spellCheck={false}
          className="mt-1"
        />
        <p className="mt-2 min-h-[20px] text-[12.5px] text-[var(--text-faint)]" aria-live="polite">
          {visible &&
            (visible.size === 0
              ? 'No question matches that. Try fewer or different words.'
              : `${visible.size} of ${total} ${visible.size === 1 ? 'question' : 'questions'}`)}
        </p>
      </div>

      {!visible && (
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px]" aria-label="Topics">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[var(--text-soft)] underline decoration-[var(--rule-strong)] underline-offset-[3px] hover:text-[var(--text)] hover:decoration-[var(--accent)]"
            >
              {s.title} <span className="tabular text-[var(--text-faint)]">{s.items.length}</span>
            </a>
          ))}
        </nav>
      )}

      {sections.map((s) => {
        const items = visible ? s.items.filter((i) => visible.has(i.id)) : s.items;
        if (items.length === 0) return null;
        return (
          <section key={s.id} id={s.id} className="mt-12 scroll-mt-6" aria-labelledby={`${s.id}-title`}>
            <h2
              id={`${s.id}-title`}
              className="border-b border-[var(--rule-mid)] pb-3 text-[18px] font-semibold tracking-tight"
            >
              {s.title}
            </h2>
            <div className="divide-y divide-[var(--rule)]">
              {items.map((item) => (
                <article key={item.id} id={item.id} className="scroll-mt-6 py-6">
                  <h3 className="text-[16.5px] font-semibold leading-snug tracking-[-0.01em]">
                    <a href={`#${item.id}`} className="text-[var(--text)] hover:text-[var(--accent)]">
                      {item.question}
                    </a>
                  </h3>
                  {/* Our own Markdown, rendered at build time. No user content. */}
                  <div className="prose-qrly mt-2" dangerouslySetInnerHTML={{ __html: item.html }} />
                  {item.more && (
                    <p className="mt-3 text-[13px] text-[var(--text-faint)]">
                      In depth:{' '}
                      <Link
                        href={item.more.href}
                        className="text-[var(--text-soft)] underline decoration-[var(--rule-strong)] underline-offset-[3px] hover:text-[var(--text)] hover:decoration-[var(--accent)]"
                      >
                        {item.more.title}
                      </Link>
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
