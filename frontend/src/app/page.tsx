import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Screen, Wordmark, GUTTER } from '@/components/chrome';
import { buttonClass, cn } from '@/components/ui';
import { HeroForm } from '@/components/landing/hero-form';
import { DEFAULT_STYLE, renderSvg } from '@/lib/qr';
import { REDIRECT_ORIGIN } from '@/lib/origins';
import { AUTHOR, REPO_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

const HERO_SLUG = 'aB3xK9p';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A real code for a real URL, rendered on the server. Drawing a decorative
  // fake here would be the one dishonest pixel on a page arguing for honesty.
  const heroSvg = renderSvg({
    value: `${REDIRECT_ORIGIN}/${HERO_SLUG}`,
    style: { ...DEFAULT_STYLE, margin: 1 },
    animate: true,
  });

  return (
    <Screen>
      {/*
        On a phone the header carries the brand, the source and one action. The
        two text links are hidden below `sm` rather than squeezed: with them, a
        375px viewport needs ~383px and the row either wraps or shoves the
        wordmark, and both pages are one thumb away in the footer anyway.
      */}
      <header
        className={`flex items-center justify-between gap-4 border-b border-[var(--rule-mid)] py-5 sm:py-6 ${GUTTER}`}
      >
        <Wordmark />
        <nav className="flex shrink-0 items-center gap-4 text-[14px] sm:gap-7">
          <NavItem href="/cost" phone="hidden">
            What it costs
          </NavItem>
          <NavItem href="/privacy" phone="hidden">
            Privacy
          </NavItem>
          <NavItem href="/blog" phone="hidden">
            Blog
          </NavItem>
          <GitHubLink />
          {user ? (
            <Link href="/links" className={buttonClass({ variant: 'primary', size: 'sm' })}>
              Dashboard
            </Link>
          ) : (
            <NavItem href="/login">Sign in</NavItem>
          )}
        </nav>
      </header>

      {/*
        The hero arrives in reading order rather than as one block: badge, then
        headline, then the sentence that qualifies it, then the field, and the
        code itself last. The code landing last is the point — it is the thing
        the page is promising, so it should appear as the promise finishes.
      */}
      <section
        className={`mx-auto grid max-w-[1440px] items-center gap-14 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-[72px] lg:py-24 ${GUTTER}`}
      >
        {/*
          `min-w-0` is load-bearing on a phone. A grid item's minimum width
          defaults to its min-content, and this column's min-content is the
          hero form's row: the input's intrinsic width from size="20" (~270px)
          plus the nowrap button (~183px). `min-w-0` on the input only lets it
          shrink in flex layout; intrinsic sizing ignores flex, so the grid
          still saw 455px, grew its only column to match, and everything in it
          ran off the right edge of a 400px screen. The `lg:` template guards
          the same thing with minmax(0, …); below `lg` the implicit column has
          no floor, so the item has to supply one.
        */}
        <div className="stagger min-w-0">
          <div
            className="mb-7 inline-flex items-center gap-2.5 border border-[var(--accent-line)] bg-[var(--accent-tint)] px-2.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] text-[var(--accent)]"
            style={{ ['--i' as string]: 0 }}
          >
            <span
              className="size-1.5 bg-[var(--accent)]"
              style={{ animation: 'blink 2s steps(1) infinite' }}
              aria-hidden
            />
            No account needed
          </div>

          <h1
            className="text-[46px] font-semibold leading-[0.95] tracking-[-0.035em] sm:text-[62px] lg:text-[78px]"
            style={{ ['--i' as string]: 1 }}
          >
            Paste a link.
            <br />
            Take the QR.
          </h1>

          <p
            className="mt-6 max-w-[44ch] text-[17px] leading-[1.5] text-[var(--text-muted)] sm:text-[19px]"
            style={{ ['--i' as string]: 2 }}
          >
            One field, one second, one file you can print. Change where it points afterwards, so
            the poster never has to change.
          </p>

          <div className="mt-10" style={{ ['--i' as string]: 3 }}>
            <HeroForm />
          </div>
        </div>

        <div className="stagger justify-self-center">
          <div
            className="group relative border border-[var(--rule-mid)] bg-[var(--bg)] p-7"
            style={{
              ['--i' as string]: 4,
              boxShadow: 'var(--shadow-block)',
            }}
          >
            <div
              className="qr-fit aspect-square w-[min(280px,60vw)]"
              // Generated in this file from a URL we control; there is no
              // user-authored markup anywhere in it.
              dangerouslySetInnerHTML={{ __html: heroSvg }}
            />
            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-[var(--rule-mid)] pt-4 font-mono text-[12px]">
              <span className="truncate">qrly.lol/{HERO_SLUG}</span>
              {/* Tabular so the label cannot shift the rule above it. */}
              <span className="tabular shrink-0 text-[var(--text-faint)]">302 · edge</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid border-t border-[var(--rule-mid)] sm:grid-cols-3">
        <Figure
          value="$0.00"
          body="Per month, at our volume. The cost page shows the invoices."
          href="/cost"
        />
        <Figure
          value="302"
          body="Never 301. A permanent redirect would cache forever and the destination could never change."
        />
        <Figure
          value="60s"
          body="Worst case for a new destination to reach every edge location. It is catching up, not broken."
          last
        />
      </section>

      {/*
        Two groups, not one wrapping row. A single flex-wrap put the sentence
        and three links into one pool, so on a phone the links broke wherever
        the sentence happened to end and the row read as a spill. The links are
        their own row now: on a phone they sit under the credit, left-aligned
        with it; from `sm` they take the right edge.
      */}
      <footer
        className={`flex flex-col gap-y-3 border-t border-[var(--rule-mid)] py-6 text-[12.5px] text-[var(--text-faint)] sm:flex-row sm:items-center sm:justify-between sm:gap-x-6 sm:py-7 ${GUTTER}`}
      >
        <span className="max-w-[52ch] leading-relaxed">
          A demonstration project. Built on Cloudflare Workers and Supabase. Developed by{' '}
          <a href={AUTHOR.url} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
            {AUTHOR.name}
          </a>
          .
        </span>
        <nav className="flex shrink-0 items-center gap-x-5 sm:gap-x-6" aria-label="Footer">
          <FooterLink href="/cost">What it costs</FooterLink>
          <FooterLink href="/privacy">Privacy</FooterLink>
          <FooterLink href="/blog">Blog</FooterLink>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
            Source
          </a>
        </nav>
      </footer>
    </Screen>
  );
}

/**
 * A header or footer link. Written as a component rather than repeated inline
 * because these were the last places still carrying a bare `text-soft` with a
 * hover bolted on, and a 12.5px anchor with no padding is a 15px-tall target.
 * The vertical padding is what makes it clickable; the colour is what makes it
 * look like the rest of the product.
 */
/**
 * `phone="hidden"` is a prop rather than a className, because the obvious
 * version — appending `hidden sm:inline-flex` — never worked. This element sets
 * `inline-flex` itself, and `hidden` is another display utility at the same
 * specificity, so which one applies is decided by their order in Tailwind's
 * output, not by anything written here. It resolved in favour of `inline-flex`,
 * so the links meant to hide on a phone were visible on every phone, and the
 * header overflowed at 360px. Choosing the display utility in one place means
 * there is nothing to lose the argument to.
 */
function NavItem({
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
      className={cn(
        phone === 'hidden' ? 'hidden sm:inline-flex' : 'inline-flex',
        'min-h-[40px] items-center text-[var(--text-soft)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--text)]',
      )}
    >
      {children}
    </Link>
  );
}

/**
 * The repository, from the header.
 *
 * An icon rather than a word: the header already carries three words and a
 * button, and this is the one item on it that leaves the site. The mark is
 * GitHub's own (Octicons `mark-github`, MIT), which is what people scan a
 * header for when they want the source.
 *
 * This design draws structure with rules, not boxes, so the thing that sets it
 * apart from the in-site links is a hairline to its left from `sm` up — the
 * same weight as the header's own bottom rule. On a phone the text links are
 * gone and the rule would be dividing nothing, so it goes too. The hit area is
 * the same 40px as the text items, and the label is on the anchor so a screen
 * reader gets a destination rather than "link, image".
 */
function GitHubLink() {
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Source on GitHub"
      className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center text-[var(--text-soft)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--text)] sm:-ml-2 sm:border-l sm:border-[var(--rule-mid)] sm:pl-5"
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
      </svg>
    </a>
  );
}

/*
  Shared with the two external anchors in the footer, which cannot be a
  <FooterLink>: next/link is for routes this app owns, and an off-site
  destination wants target and rel that it has no reason to accept.
*/
const footerLinkClass =
  'inline-flex min-h-[32px] items-center text-[var(--text-faint)] underline decoration-[var(--rule-strong)] underline-offset-[3px] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--text)] hover:decoration-[var(--accent)]';

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={footerLinkClass}>
      {children}
    </Link>
  );
}

function Figure({
  value,
  body,
  href,
  last,
}: {
  value: string;
  body: string;
  href?: string;
  last?: boolean;
}) {
  const inner = (
    <>
      <div className="numeral text-[34px] transition-colors duration-[var(--dur)] ease-[var(--ease)] group-hover:text-[var(--accent)]">
        {value}
      </div>
      <div className="mt-2.5 max-w-[30ch] text-[14px] leading-relaxed text-[var(--text-soft)]">
        {body}
      </div>
    </>
  );

  const className = `px-6 py-10 sm:px-10 lg:px-12 ${
    last ? '' : 'border-b border-[var(--rule-mid)] sm:border-b-0 sm:border-r'
  }`;

  // One of these three is a link and the other two are not, and previously
  // nothing said which. A 2% wash on hover is not a signal anyone reads. The
  // accent rule pinned to the left edge is: it is the same mark the active nav
  // item wears, and it is visible before the pointer is anywhere near it.
  return href ? (
    <Link
      href={href}
      className={`${className} group relative block text-[var(--text)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:bg-[var(--accent-tint)]`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[2px] scale-y-0 bg-[var(--accent)] transition-transform duration-[var(--dur-slow)] ease-[var(--ease)] group-hover:scale-y-100"
        style={{ transformOrigin: 'top' }}
      />
      {inner}
      <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[12px] text-[var(--accent)]">
        See the invoices
        <span
          aria-hidden
          className="transition-transform duration-[var(--dur)] ease-[var(--ease)] group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
