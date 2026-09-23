/**
 * Schema.org descriptions of the site, for search engines and answer engines.
 *
 * Every node that is referenced from more than one page carries an `@id`, so
 * the Organization on the landing page and the publisher of a blog post are
 * the same entity to a parser rather than two things that share a name. That
 * is most of what "entity consistency" means in practice: one id, one name,
 * one set of `sameAs` links, everywhere.
 *
 * Nothing here is visible. The rule that keeps it honest is that every fact
 * in these objects is also on a page a person can read — a FAQ answer marked
 * up here and absent from the page is the pattern search engines penalise.
 */
import { AUTHOR, REPO_URL, SITE_NAME, SITE_SUMMARY, SITE_URL } from './site';

export type JsonLdNode = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const APP_ID = `${SITE_URL}/#app`;
export const AUTHOR_ID = `${SITE_URL}/#author`;

export function organization(): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: SITE_SUMMARY,
    sameAs: [REPO_URL],
    founder: { '@id': AUTHOR_ID },
  };
}

export function author(): JsonLdNode {
  return {
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: AUTHOR.name,
    url: AUTHOR.url,
    sameAs: [AUTHOR.url],
  };
}

export function website(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    alternateName: ['qrly.lol', 'QRLY'],
    url: SITE_URL,
    description: SITE_SUMMARY,
    inLanguage: 'en',
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/**
 * The product, as software. `offers` at a price of zero is what lets an
 * answer engine state "free" as a fact about the entity rather than infer it
 * from marketing copy.
 */
export function webApplication(): JsonLdNode {
  return {
    '@type': 'WebApplication',
    '@id': APP_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_SUMMARY,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'QR code generator',
    operatingSystem: 'Any (runs in a web browser)',
    browserRequirements: 'Requires a modern web browser. Scanning needs only a phone camera.',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Dynamic QR codes whose destination can be changed after printing',
      'Short links on qrly.lol or on your own custom domain',
      'Scan analytics: country, city, device, operating system, network and local hour',
      'No cookies, tracking pixels or JavaScript on the scanning phone',
      'QR design: colours, module and finder shapes, error correction, embedded logo',
      'SVG and PNG export at 512, 1024 or 2048 pixels',
      'No account needed to create and download a code',
      'Open source under the MIT license',
    ],
    publisher: { '@id': ORGANIZATION_ID },
    sameAs: [REPO_URL],
  };
}

export interface QA {
  question: string;
  /** Plain text. Structured data is read by parsers, not rendered. */
  answer: string;
  /** Absolute URL of the place on a page where this answer is shown. */
  url?: string;
}

export function faqPage(url: string, items: QA[], name?: string): JsonLdNode {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    ...(name ? { name } : {}),
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: items.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      ...(qa.url ? { url: qa.url } : {}),
      acceptedAnswer: { '@type': 'Answer', text: qa.answer },
    })),
  };
}

export function breadcrumbs(trail: Array<{ name: string; url: string }>): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/** One document with several top-level nodes, which is how Google prefers them. */
export function graph(...nodes: JsonLdNode[]): JsonLdNode {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

/**
 * Serialise for a `<script type="application/ld+json">`. A `<` is escaped
 * because the payload sits inside HTML, and a string containing `</script>`
 * would otherwise end the element early. None of our strings do today; the
 * FAQ is edited by hand and one day one will.
 */
export function serialize(data: JsonLdNode): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Markdown inline syntax to plain text: links keep their words, emphasis goes. */
export function markdownToText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}
