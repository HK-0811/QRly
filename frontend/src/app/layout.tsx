import type { Metadata, Viewport } from 'next';
import { Schibsted_Grotesk, Fragment_Mono } from 'next/font/google';
import './globals.css';
import { JsonLd } from '@/components/json-ld';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { author, graph, organization, website } from '@/lib/structured-data';

// next/font self-hosts these at build time, so there is no request to
// fonts.googleapis.com at runtime and no flash of fallback text. The variables
// are what globals.css reads for --font-sans and --font-mono.
const grotesk = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
});

const fragment = Fragment_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-fragment',
  display: 'swap',
});

export const metadata: Metadata = {
  // Resolves every relative canonical and Open Graph URL against production,
  // whichever host the page happened to be rendered on.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'QRly — dynamic QR codes that cost nothing to run',
    template: '%s · QRly',
  },
  description:
    'Dynamic QR codes and short links with deep scan analytics, running entirely on free tiers. Print once, change the destination forever.',
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, type: 'website', locale: 'en_GB' },
  // Answer engines and search snippets may quote as much as they like; the
  // point of the content is to be quoted. Images too — the QR previews are
  // ours to share.
  robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${fragment.variable}`}>
      <body>
        {/*
          Who publishes this site, stated once on every page. Pages that add
          their own nodes (the landing page's WebApplication, a post's
          BlogPosting) refer back to these by @id.
        */}
        <JsonLd data={graph(organization(), website(), author())} />
        {children}
      </body>
    </html>
  );
}
