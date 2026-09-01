import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Screen, Wordmark, GUTTER } from '@/components/chrome';
import { buttonClass } from '@/components/ui';
import { HeroForm } from '@/components/landing/hero-form';
import { DEFAULT_STYLE, renderSvg } from '@/lib/qr';
import { REDIRECT_ORIGIN } from '@/lib/origins';

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
      <header
        className={`flex items-center justify-between border-b border-[var(--rule-mid)] py-6 ${GUTTER}`}
      >
        <Wordmark />
        <nav className="flex items-center gap-5 text-[14px] sm:gap-7">
          <NavItem href="/cost">What it costs</NavItem>
          <NavItem href="/privacy" className="hidden sm:inline-flex">
            Privacy
          </NavItem>
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
        <div className="stagger">
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

      <footer
        className={`flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-[var(--rule-mid)] py-7 text-[12.5px] text-[var(--text-faint)] ${GUTTER}`}
      >
        <span className="py-1.5">A demonstration project. Built on Cloudflare Workers and Supabase.</span>
        <FooterLink href="/cost">What it costs</FooterLink>
        <FooterLink href="/privacy">Privacy</FooterLink>
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
function NavItem({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[40px] items-center text-[var(--text-soft)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--text)] ${className ?? ''}`}
    >
      {children}
    </Link>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[32px] items-center text-[var(--text-faint)] underline decoration-[var(--rule-strong)] underline-offset-[3px] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--text)] hover:decoration-[var(--accent)]"
    >
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
