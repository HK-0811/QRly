import Link from 'next/link';
import type { Metadata } from 'next';
import { BlogShell, MakeACodeCta } from '@/components/blog/blog-shell';
import { FaqBrowser } from '@/components/faq/faq-browser';
import { JsonLd } from '@/components/json-ld';
import { formatDate } from '@/lib/blog';
import { FAQ_REVIEWED, faqSections, faqCount } from '@/lib/faq';
import { REPO_URL, SITE_NAME, SITE_URL } from '@/lib/site';
import { WEBSITE_ID, breadcrumbs, faqPage, graph } from '@/lib/structured-data';

const URL = `${SITE_URL}/faq`;

export const metadata: Metadata = {
  title: 'FAQ — free and dynamic QR codes, answered',
  description:
    'Straight answers about QR codes and QRly: do free QR codes expire, how dynamic codes work, what scan tracking records, sizes, logos, printing, custom domains and privacy.',
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    url: URL,
    siteName: SITE_NAME,
    title: 'QR codes, answered — the QRly FAQ',
    description:
      'Do free QR codes expire? Can you change a QR code after printing? What does scan tracking record? Straight answers.',
  },
};

/**
 * One page that answers the questions people actually ask, each under its own
 * heading and anchor, so a person can link to one answer and an answer engine
 * can quote one without the rest.
 *
 * The questions live in lib/faq.ts, which also feeds /llms.txt and
 * /llms-full.txt. The page, the structured data and the plain-text copies are
 * therefore the same words, which is both the rule for FAQPage markup and the
 * only way the three stay in agreement.
 */
export default function FaqPage() {
  const sections = faqSections();
  const count = faqCount();

  const jsonLd = graph(
    {
      '@type': 'WebPage',
      '@id': URL,
      url: URL,
      name: 'QRly FAQ',
      isPartOf: { '@id': WEBSITE_ID },
      dateModified: FAQ_REVIEWED,
      inLanguage: 'en',
    },
    faqPage(
      URL,
      sections.flatMap((s) =>
        s.items.map((i) => ({ question: i.question, answer: i.text, url: `${URL}#${i.id}` })),
      ),
      'Frequently asked questions about QR codes and QRly',
    ),
    breadcrumbs([
      { name: SITE_NAME, url: `${SITE_URL}/` },
      { name: 'FAQ', url: URL },
    ]),
  );

  return (
    <BlogShell>
      <JsonLd data={jsonLd} />

      <p className="eyebrow">FAQ</p>
      <h1 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[38px]">
        QR codes, answered
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-[var(--text-muted)]">
        {count} questions people ask about free and dynamic QR codes, scan tracking, printing and
        privacy — and about QRly itself. Each answer comes first and the detail after, and where a
        guide covers it at length, the answer links to it.
      </p>
      <p className="tabular mt-4 font-mono text-[11.5px] uppercase tracking-[0.08em] text-[var(--text-faint)]">
        Reviewed <time dateTime={FAQ_REVIEWED}>{formatDate(FAQ_REVIEWED)}</time>
      </p>

      <FaqBrowser
        sections={sections.map((s) => ({
          id: s.id,
          title: s.title,
          items: s.items.map((i) => ({
            id: i.id,
            question: i.question,
            html: i.html,
            more: i.more,
          })),
        }))}
      />

      <section className="mt-14 border-t border-[var(--rule-mid)] pt-6 text-[14px] leading-relaxed text-[var(--text-muted)]">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
          Not answered here?
        </h2>
        <p className="mt-2">
          The <Link href="/blog">guides</Link> go deeper on every topic above. For something about
          how QRly itself works, the source is public: read it, or open an issue, on{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </section>

      <MakeACodeCta />

      <p className="mt-10 text-[12px] text-[var(--text-faint)]">
        QR Code is a registered trademark of DENSO WAVE INCORPORATED.
      </p>
    </BlogShell>
  );
}
