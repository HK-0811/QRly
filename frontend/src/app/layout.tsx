import type { Metadata, Viewport } from 'next';
import { Schibsted_Grotesk, Fragment_Mono } from 'next/font/google';
import './globals.css';

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
  title: {
    default: 'QRly — dynamic QR codes that cost nothing to run',
    template: '%s · QRly',
  },
  description:
    'Dynamic QR codes and short links with deep scan analytics, running entirely on free tiers. Print once, change the destination forever.',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${fragment.variable}`}>
      <body>{children}</body>
    </html>
  );
}
