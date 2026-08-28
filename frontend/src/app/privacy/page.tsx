import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'Exactly what qrify records when a QR code is scanned, exactly what it does not, and why.',
};

/**
 * This page is the deliverable, not the disclaimer.
 *
 * The argument this project makes is that link analytics do not have to be
 * expensive. The corollary nobody in this market says out loud is that they also
 * do not have to be invasive — most of what makes them feel invasive is collected
 * because it can be, not because anyone reads it. So this page lists the fields
 * one by one, including the ones that were possible and were left out.
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-5">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            qrify
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Privacy</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
          What happens when somebody scans a QR code served by this service. Written for the
          person scanning, not for a compliance file.
        </p>

        <Section title="The short version">
          <p>
            A scan is recorded as one row: roughly where in the world it happened, what kind of
            device and network it came from, when it was, and which link it was. The IP address
            is used to work those out and is then discarded &mdash; it is never written to the
            database and never written to a log. There is no cookie, no tracking pixel, and no
            JavaScript running on the scanner&rsquo;s device, because a redirect never gets the
            chance to run any.
          </p>
        </Section>

        <Section title="What is recorded">
          <FieldGroup
            heading="Where"
            items={[
              ['Country, region, city, postal area', 'Derived from the IP address by Cloudflare. Approximate — see the accuracy note below.'],
              ['Latitude and longitude', 'The centroid of the city the IP database assigns. Not a position, and never precise enough to be one.'],
              ['Timezone', 'Used to record the local hour and weekday where the scan happened.'],
            ]}
          />
          <FieldGroup
            heading="Network"
            items={[
              ['Internet provider name', 'The autonomous-system organisation, e.g. "Reliance Jio Infocomm" or "Comcast Cable". The name of the network, not of anyone on it.'],
              ['Connection type', 'Mobile, broadband, corporate or datacentre, guessed from that name.'],
              ['Round-trip time, HTTP version, TLS version', 'Connection quality and protocol, measured at the edge.'],
            ]}
          />
          <FieldGroup
            heading="Device"
            items={[
              ['Device type, vendor, model', 'From the user-agent string the browser sends. Android usually reports a model; iOS reports only "iPhone".'],
              ['Operating system and browser, with versions', 'From the same string.'],
              ['Language preferences', 'From the Accept-Language header.'],
            ]}
          />
          <FieldGroup
            heading="The link"
            items={[
              ['Which short link, on which hostname', ''],
              ['Referrer, if the browser sent one', 'A camera app sends none, which is how a genuine scan is told apart from a forwarded link.'],
              ['Campaign parameters', 'utm_source and friends, if they were in the URL.'],
            ]}
          />
        </Section>

        <Section title="What is not recorded">
          <ul className="mt-2 space-y-2.5">
            <NotRecorded label="Your IP address">
              It reaches the server, is used to derive the fields above and to compute the daily
              hash described below, and is then gone. It is not stored in any table and not
              written to any log line.
            </NotRecorded>
            <NotRecorded label="Any identity">
              No name, no email, no account, no advertising ID. The service has no idea who you
              are and no way to find out.
            </NotRecorded>
            <NotRecorded label="Screen size, battery, hardware, fonts">
              All of it requires JavaScript. A redirect never runs any, and no interstitial page
              was added to collect it &mdash; that was a deliberate decision, not an oversight.
            </NotRecorded>
            <NotRecorded label="Anything across days">
              See below: the identifier that links two scans together expires every 24 hours by
              construction.
            </NotRecorded>
            <NotRecorded label="Anything across links">
              The identifier includes the link, so the same person scanning two different codes
              produces two unrelated values.
            </NotRecorded>
          </ul>
        </Section>

        <Section title="How &ldquo;unique visitors&rdquo; works, and why it expires">
          <p>
            To tell a repeat scan from a new one, each scan gets an identifier computed as:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] p-3 font-mono text-[12px]">
{`sha256( daily_salt + secret_pepper + ip + user_agent + link_id )`}
          </pre>
          <p className="mt-3">
            Only the first 128 bits are kept. The salt is regenerated every 24 hours, which means
            yesterday&rsquo;s identifiers cannot be matched against today&rsquo;s even with the
            same IP address and the same device &mdash; including by us.
          </p>
          <p className="mt-3">
            The honest consequence, which is stated on the dashboard too:{' '}
            <strong className="font-medium">
              &ldquo;unique visitors&rdquo; means unique per day
            </strong>
            . Anyone reporting a longer-lived unique count from IP data is either storing
            something reversible or overstating what they have.
          </p>
        </Section>

        <Section title="Global Privacy Control">
          <p>
            If your browser sends <span className="font-mono text-[13px]">Sec-GPC: 1</span> or{' '}
            <span className="font-mono text-[13px]">DNT: 1</span>, the scan is still counted, but
            recorded with nothing that could connect it to any other request:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>no visitor identifier, so no unique-visitor or repeat-visit attribution</li>
            <li>no postal code, latitude or longitude</li>
            <li>no raw user-agent string</li>
          </ul>
          <p className="mt-3">
            What remains is a count with a country and a device class, which is aggregate by
            construction. This makes the unique-visitor totals under-count, and the dashboard
            says so rather than quietly closing the gap.
          </p>
        </Section>

        <Section title="Accuracy">
          <p>
            IP geolocation is approximate and sometimes simply wrong. VPNs, proxies,
            carrier-grade NAT on mobile networks and corporate egress routinely resolve to the
            wrong city, occasionally the wrong country. Coordinates are a city centroid, so a map
            marker sits on a city, not on a street. The connection-type classification is a
            heuristic over the provider&rsquo;s name; anything unrecognised is reported as
            unknown rather than guessed at.
          </p>
        </Section>

        <Section title="How long it is kept">
          <p>
            Each account chooses its own retention window, one year by default. A scheduled job
            runs nightly and permanently deletes scan events older than that window. Deleting a
            link deletes its scan history with it; deleting an account deletes everything.
          </p>
        </Section>

        <Section title="Who else sees it">
          <p>
            Two providers, both because the service runs on them: Cloudflare handles the request
            at the edge and supplies the location and network fields; Supabase hosts the
            database. Nothing is sold, shared with advertisers, or sent to any analytics product.
            There is no third-party script on any page of this service.
          </p>
          <p className="mt-3">
            Destination URLs are checked against Google Safe Browsing so a short link cannot
            quietly become a phishing redirect. That check sends the destination URL, not
            anything about the person scanning it.
          </p>
        </Section>

        <footer className="mt-12 border-t border-[var(--border)] pt-6 text-[12.5px] text-[var(--text-faint)]">
          <Link href="/" className="underline underline-offset-2">
            Back to qrify
          </Link>
        </footer>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-[16px] font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-1 text-[14px] leading-relaxed text-[var(--text-muted)]">
        {children}
      </div>
    </section>
  );
}

function FieldGroup({ heading, items }: { heading: string; items: Array<[string, string]> }) {
  return (
    <div className="mt-4">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-faint)]">
        {heading}
      </h3>
      <dl className="mt-2 space-y-2">
        {items.map(([term, detail]) => (
          <div key={term}>
            <dt className="text-[13.5px] font-medium text-[var(--text)]">{term}</dt>
            {detail && <dd className="text-[13px] leading-relaxed">{detail}</dd>}
          </div>
        ))}
      </dl>
    </div>
  );
}

function NotRecorded({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-danger-500/70" aria-hidden />
      <span>
        <strong className="font-medium text-[var(--text)]">{label}.</strong> {children}
      </span>
    </li>
  );
}
