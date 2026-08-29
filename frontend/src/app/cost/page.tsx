import Link from 'next/link';
import type { Metadata } from 'next';
import pricing from '@/data/competitor-pricing.json';

export const metadata: Metadata = {
  title: 'What this costs',
  description:
    'The running cost of this platform against what the incumbents publish, with sources and the date they were read.',
};

/**
 * The showcase piece.
 *
 * Every competitor figure on this page was read off that vendor's own published
 * pricing page on a recorded date, and the source URL is printed next to it.
 * Numbers quoted from memory are worth nothing in an argument about price, which
 * is the entire argument this project is making.
 *
 * Values a vendor's page did not state are shown as an em dash rather than
 * estimated. That makes the table less tidy and more true, and this page cannot
 * afford to be the one part of the project that overclaims.
 */
export default function CostPage() {
  const fetched = new Date(pricing.fetched_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const priceOf = (p: { monthly_billed_annually?: number | null; monthly_billed_monthly?: number | null }) =>
    p.monthly_billed_annually ?? p.monthly_billed_monthly ?? null;

  /**
   * The cheapest plan at each vendor that includes at least one custom domain,
   * **free plans included**.
   *
   * An earlier version of this table filtered out the $0 tiers, which made
   * Rebrandly and Short.io look more expensive than they are — both give you a
   * custom domain for nothing. Getting that wrong on the one page whose whole
   * purpose is honesty about price would discredit the rest of it. The free tiers
   * are in the table, with the limit that actually bites printed next to them.
   */
  const cheapestWithDomain = pricing.vendors
    .map((v) => {
      const plan = v.plans.find(
        (p) => typeof p.custom_domains === 'number' && p.custom_domains >= 1,
      );
      return {
        vendor: v.name,
        plan: plan?.name ?? null,
        monthly: plan ? priceOf(plan) : null,
        domains: plan?.custom_domains ?? null,
        cap: plan ? capOf(plan) : null,
      };
    })
    .filter((r) => r.monthly !== null)
    .sort((a, b) => (a.monthly ?? 0) - (b.monthly ?? 0));

  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-5">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            QRly
          </Link>
          <Link
            href="/privacy"
            className="ml-auto text-[13px] text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Privacy
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent-600 dark:text-accent-400">
          $0.00 / month
        </p>
        <h1 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[38px]">
          What this actually costs to run
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--text-muted)]">
          Dynamic QR codes, edge redirects, Postgres with row-level security, auth, automatic
          SSL, custom domains, and per-scan analytics down to the carrier name. The bill for all
          of it is nothing, and the ceilings below are the honest limits of that.
        </p>

        {/* ------------------------------------------------------------ */}
        <Section
          title="The cheapest plan at each vendor that includes a custom domain"
          subtitle="A custom domain is the line between a toy and something you would print on a poster. Free tiers are included here — two vendors give you one for nothing, and the cap that bites is printed alongside."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13.5px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11.5px] uppercase tracking-[0.06em] text-[var(--text-faint)]">
                  <th className="pb-2 font-medium">Vendor</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 text-right font-medium">Per month</th>
                  <th className="pb-2 text-right font-medium">Per year</th>
                  <th className="pb-2 pl-6 font-medium">What caps it</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                <tr className="bg-accent-500/[0.06]">
                  <td className="py-2.5 font-medium">QRly</td>
                  <td className="py-2.5 text-[var(--text-muted)]">this</td>
                  <td className="tabular py-2.5 text-right font-semibold text-accent-600 dark:text-accent-400">
                    $0
                  </td>
                  <td className="tabular py-2.5 text-right font-semibold text-accent-600 dark:text-accent-400">
                    $0
                  </td>
                  <td className="py-2.5 pl-6 text-[12.5px] text-[var(--text-muted)]">
                    100,000 scans/day, 100 domains
                  </td>
                </tr>
                {cheapestWithDomain.map((r) => (
                  <tr key={r.vendor}>
                    <td className="py-2.5 font-medium">{r.vendor}</td>
                    <td className="py-2.5 text-[var(--text-muted)]">{r.plan}</td>
                    <td className="tabular py-2.5 text-right">${r.monthly}</td>
                    <td className="tabular py-2.5 text-right">
                      ${((r.monthly ?? 0) * 12).toLocaleString('en-US')}
                    </td>
                    <td className="py-2.5 pl-6 text-[12.5px] text-[var(--text-muted)]">
                      {r.cap ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-[var(--text-faint)]">
            Annual-billing price where the vendor prints one, otherwise the monthly price. Yearly
            figures are the monthly price times twelve, not a separately advertised number.
            &ldquo;What caps it&rdquo; is the tightest published limit on that plan &mdash; for
            the free tiers, the number you hit first.
          </p>
        </Section>

        {/* ------------------------------------------------------------ */}
        <Section
          title="Full published pricing"
          subtitle={`Read from each vendor's own pricing page on ${fetched}. A dash means the page did not state it.`}
        >
          <div className="space-y-8">
            {pricing.vendors.map((vendor) => (
              <div key={vendor.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-[15px] font-semibold tracking-tight">{vendor.name}</h3>
                  <a
                    href={vendor.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11.5px] text-[var(--text-faint)] underline underline-offset-2 hover:text-[var(--text-muted)]"
                  >
                    {vendor.source.replace(/^https?:\/\//, '')}
                  </a>
                </div>

                {'annual_note' in vendor && vendor.annual_note && (
                  <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-faint)]">
                    {vendor.annual_note}
                  </p>
                )}

                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-[13px]">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-left text-[11px] uppercase tracking-[0.06em] text-[var(--text-faint)]">
                        <th className="pb-1.5 font-medium">Plan</th>
                        <th className="pb-1.5 text-right font-medium">Annual&nbsp;/mo</th>
                        <th className="pb-1.5 text-right font-medium">Monthly</th>
                        <th className="pb-1.5 text-right font-medium">Domains</th>
                        <th className="pb-1.5 text-right font-medium">Seats</th>
                        <th className="pb-1.5 text-right font-medium">Retention</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {vendor.plans.map((plan) => (
                        <tr key={plan.name}>
                          <td className="py-2">{plan.name}</td>
                          <td className="tabular py-2 text-right">{money(plan.monthly_billed_annually)}</td>
                          <td className="tabular py-2 text-right">{money(plan.monthly_billed_monthly)}</td>
                          <td className="tabular py-2 text-right">{num(plan.custom_domains)}</td>
                          <td className="tabular py-2 text-right">{num(plan.seats)}</td>
                          <td className="py-2 text-right text-[12.5px] text-[var(--text-muted)]">
                            {plan.analytics_retention ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ------------------------------------------------------------ */}
        <Section
          title="Where the $0 comes from"
          subtitle="Every service this runs on, its free ceiling, and what that ceiling means here."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] uppercase tracking-[0.06em] text-[var(--text-faint)]">
                  <th className="pb-1.5 font-medium">Service</th>
                  <th className="pb-1.5 font-medium">Free ceiling</th>
                  <th className="pb-1.5 font-medium">What that means</th>
                  <th className="pb-1.5 text-right font-medium">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {pricing.qrly_ceilings.map((row) => (
                  <tr key={row.service}>
                    <td className="py-2 font-medium">{row.service}</td>
                    <td className="py-2 text-[var(--text-muted)]">{row.free_limit}</td>
                    <td className="py-2 text-[12.5px] text-[var(--text-muted)]">{row.means}</td>
                    <td className="tabular py-2 text-right text-accent-600 dark:text-accent-400">$0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ------------------------------------------------------------ */}
        <Section title="What the comparison is not">
          <ul className="space-y-3 text-[14px] leading-relaxed text-[var(--text-muted)]">
            <Caveat label="Some of them have real free tiers">
              Rebrandly and Short.io both include a custom domain at $0, and Short.io&rsquo;s free
              plan is genuinely generous. The table above says so rather than hiding it. What the
              free tiers cap is volume and retention; what this project caps is volume alone,
              because the retention window is yours to set.
            </Caveat>
            <Caveat label="This is not a like-for-like product">
              The vendors above sell teams, roles, SSO, bulk import, link-in-bio pages, A/B
              testing and support contracts. This project has none of that, by decision. What it
              does have is the part those plans are mostly gated on: dynamic QR codes, custom
              domains with automatic SSL, and per-scan analytics &mdash; including the ISP and
              carrier name, which none of the plans above expose at any price.
            </Caveat>
            <Caveat label="It is not free at every scale">
              The ceilings above are real. Past roughly 100,000 scans a day, or a million stored
              events, this needs paid tiers like anything else. It was built for 1,000&ndash;2,000
              users and is not designed beyond that.
            </Caveat>
            <Caveat label="Someone has to run it">
              &ldquo;$0/month&rdquo; is the infrastructure bill, not the total cost of ownership.
              A hosted product includes somebody being paged at 3&nbsp;a.m.; this does not.
            </Caveat>
            <Caveat label="A domain still costs money">
              Around $10&ndash;15 a year at a registrar. It is the one line item that is not zero,
              and it is the same line item on every plan above.
            </Caveat>
            <Caveat label="Prices change">
              Everything here was read on {fetched}. Each source is linked so it can be checked
              rather than believed.
            </Caveat>
          </ul>
        </Section>

        <Section title="The point">
          <p className="text-[15px] leading-relaxed">
            None of this is technically difficult, and none of it is expensive to operate. A QR
            code redirect is a database lookup and a 302. The analytics are fields the edge
            already computed and handed over for free. What the pricing above is really selling
            is the belief that this is hard.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            The code is here to be read. If it is useful, run your own copy.
          </p>
        </Section>

        <footer className="mt-12 border-t border-[var(--border)] py-8 text-[12.5px] text-[var(--text-faint)]">
          <Link href="/" className="underline underline-offset-2">
            Back to QRly
          </Link>
        </footer>
      </main>
    </div>
  );
}

/** The tightest published limit on a plan — the number you actually hit first. */
function capOf(plan: Record<string, unknown>): string | null {
  const parts: string[] = [];
  // Locale pinned: the default picks up the host's, and an Indian-locale build
  // rendered 250,000 as "2,50,000" on a page whose whole job is legible numbers.
  const n = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('en-US') : null);

  const links = n(plan.links_per_month);
  if (links) parts.push(`${links} links/mo`);
  const total = n(plan.links_total);
  if (total) parts.push(`${total} links`);
  const clicks = n(plan.tracked_clicks_per_month);
  if (clicks) parts.push(`${clicks} clicks/mo`);
  const events = n(plan.tracked_events_per_month);
  if (events) parts.push(`${events} events/mo`);
  const qr = n(plan.qr_codes_per_month);
  if (qr) parts.push(`${qr} QR/mo`);

  return parts.length ? parts.slice(0, 2).join(', ') : null;
}

function money(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return v === 0 ? '$0' : `$${v}`;
}

function num(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return v === 0 ? 'none' : String(v);
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-[18px] font-semibold tracking-tight">{title}</h2>
      {subtitle && (
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[var(--text-muted)]">
          {subtitle}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Caveat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-warn-400" aria-hidden />
      <span>
        <strong className="font-medium text-[var(--text)]">{label}.</strong> {children}
      </span>
    </li>
  );
}
