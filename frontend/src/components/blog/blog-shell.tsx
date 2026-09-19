import Link from 'next/link';
import { Wordmark } from '@/components/chrome';
import { AUTHOR, REPO_URL } from '@/lib/site';

/**
 * The frame every blog page sits in: the same header rule and footer as the
 * privacy and cost pages, so the blog reads as part of the product rather
 * than a marketing site bolted onto it.
 *
 * `width` picks the column. An index of many entries wants the wider measure;
 * a single article wants the narrower one, because a 15px paragraph at 4xl is
 * over 100 characters a line and nobody reads that to the end.
 */
export function BlogShell({
  children,
  width = 'article',
}: {
  children: React.ReactNode;
  width?: 'article' | 'index';
}) {
  const measure = width === 'index' ? 'max-w-4xl' : 'max-w-3xl';
  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--rule-mid)]">
        <div className={`mx-auto flex h-16 ${measure} items-center gap-6 px-6`}>
          <Wordmark />
          <nav className="ml-auto flex items-center gap-5 text-[13px]" aria-label="Blog">
            <HeaderLink href="/blog">Blog</HeaderLink>
            <HeaderLink href="/cost" phone="hidden">
              What it costs
            </HeaderLink>
            <HeaderLink href="/create">Make a code</HeaderLink>
          </nav>
        </div>
      </header>

      <main className={`mx-auto ${measure} px-5 py-12`}>{children}</main>

      <footer className={`mx-auto ${measure} px-5 pb-10`}>
        <div className="flex flex-col gap-y-3 border-t border-[var(--rule-mid)] pt-6 text-[12.5px] text-[var(--text-faint)] sm:flex-row sm:items-center sm:justify-between sm:gap-x-6">
          <span className="max-w-[52ch] leading-relaxed">
            QRly is free, open source, and runs on $0/month. Developed by{' '}
            <a href={AUTHOR.url} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
              {AUTHOR.name}
            </a>
            .
          </span>
          <nav className="flex shrink-0 items-center gap-x-5" aria-label="Footer">
            <Link href="/" className={footerLinkClass}>
              Home
            </Link>
            <Link href="/cost" className={footerLinkClass}>
              What it costs
            </Link>
            <Link href="/privacy" className={footerLinkClass}>
              Privacy
            </Link>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
              Source
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function HeaderLink({
  href,
  children,
  phone,
}: {
  href: string;
  children: React.ReactNode;
  phone?: 'hidden';
}) {
  return (
    <Link
      href={href}
      className={`${phone === 'hidden' ? 'hidden sm:inline-flex' : 'inline-flex'} min-h-[40px] items-center text-[var(--text-muted)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--text)]`}
    >
      {children}
    </Link>
  );
}

const footerLinkClass =
  'inline-flex min-h-[32px] items-center text-[var(--text-faint)] underline decoration-[var(--rule-strong)] underline-offset-[3px] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--text)] hover:decoration-[var(--accent)]';

/**
 * The one call to action a post carries, at the end. It is the product's
 * actual entry point — the same field as the landing page — not a signup form.
 */
export function MakeACodeCta() {
  return (
    <aside className="mt-12 border border-[var(--rule-mid)] p-6" style={{ boxShadow: 'var(--shadow-block-sm)' }}>
      <p className="eyebrow">Try it</p>
      <p className="mt-2 text-[17px] font-semibold tracking-tight">
        Make a dynamic QR code now. No account, no watermark, no expiry.
      </p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--text-muted)]">
        Paste a link, download an SVG or PNG, and change where it points later without reprinting.
      </p>
      <Link
        href="/create"
        className="mt-4 inline-flex min-h-[40px] items-center bg-[var(--rule-ink)] px-4 text-[14px] font-medium text-white transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:bg-[var(--accent)] hover:text-white"
      >
        Make a QR code →
      </Link>
    </aside>
  );
}
