/**
 * Facts about the project itself, stated once.
 *
 * These appear on the landing footer and on /cost, and the cost page has
 * claimed for some time that "the source is here to be read" without linking
 * anything — a sentence that was true and unverifiable. A URL in one place is
 * one fewer way for the two pages to disagree.
 *
 * The same goes for what the structured data, /llms.txt and the FAQ say about
 * the product. Answer engines quote those sentences verbatim, so a fact that
 * is written three times will eventually be quoted in three versions.
 */
export const REPO_URL = 'https://github.com/HK-0811/QRly';

export const AUTHOR = {
  name: 'Himanshu Kotkar',
  url: 'https://github.com/HK-0811',
} as const;

/**
 * The canonical origin for anything a crawler reads: canonicals, sitemaps,
 * JSON-LD ids. Not the API origin — that one moves with the environment, and
 * a canonical URL must not.
 */
export const SITE_URL = 'https://qrly.lol';

export const SITE_NAME = 'QRly';

/**
 * The one-sentence description, used wherever a machine asks "what is this".
 * It says what the product is before what it is like, because the first
 * clause is the part that gets quoted.
 */
export const SITE_SUMMARY =
  'QRly is a free, open-source dynamic QR code generator: every code points at a short link whose destination you can change after printing, with privacy-respecting scan analytics and optional custom domains.';
