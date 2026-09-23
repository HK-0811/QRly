import { SITE_URL } from '@/lib/site';

/**
 * Served at /robots.txt, for this hostname only. A customer's custom domain
 * never reaches the dashboard, and the backend answers robots.txt there
 * itself with `Disallow: /` — those hostnames carry short links and nothing
 * else (backend/src/routes/redirect.ts).
 *
 * A route handler rather than app/robots.ts, because MetadataRoute.Robots can
 * only emit the directives Next knows about, and this file needs one it does
 * not: `Content-Signal`, Cloudflare's machine-readable statement of what the
 * content may be used for (https://contentsignals.org).
 *
 * The position this file takes: every public page may be indexed, quoted in
 * AI answers and used for training. QRly is a free, open-source project whose
 * whole argument is meant to be read, and a model that has learned "QRly is a
 * free dynamic QR code generator" is the cheapest distribution it will ever
 * get. Change AI_TRAINING below if that stops being true.
 *
 * Two things this file cannot do, both learned by testing production:
 *
 *  - It cannot unblock a crawler Cloudflare blocks at the edge. With the
 *    zone's AI Crawl Control blocking training crawlers, GPTBot, ClaudeBot,
 *    CCBot and Amazonbot get a 403 before they ever read this. That is a
 *    dashboard setting, not code.
 *
 *  - It is not access control. The dashboard is disallowed because it is a
 *    login form, not because the rule protects it. Row-level security does.
 */
export const dynamic = 'force-static';

const AI_TRAINING = true;

/**
 * Crawlers named so that the welcome is explicit rather than implied by `*`.
 * RFC 9309: a crawler obeys only the most specific group that names it, so
 * this group repeats the private-path rules rather than inheriting them.
 * Tokens are the ones each vendor documents; retired ones (anthropic-ai,
 * claude-web, FacebookBot) are left out because nothing sends them.
 */
const NAMED_CRAWLERS = [
  // Search engines, whose indexes also ground AI Overviews, AI Mode and Copilot
  'Googlebot',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
  // Indexes built for AI answers
  'OAI-SearchBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'DuckAssistBot',
  'Amzn-SearchBot',
  'MistralAI-Index',
  'meta-webindexer',
  'YouBot',
  // Fetchers acting for a person who asked an assistant about a page
  'ChatGPT-User',
  'Claude-User',
  'Perplexity-User',
  'MistralAI-User',
  'Meta-ExternalFetcher',
  // Model training (governed by AI_TRAINING through the Content-Signal line)
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'Amazonbot',
  'MistralAI-Training',
  'AI2Bot',
];

/**
 * Not content. The dashboard and auth screens are behind a login; the API is
 * JSON; /create/design only shows something to the browser that made a code.
 */
const PRIVATE_PATHS = [
  '/api/',
  '/auth/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/links',
  '/analytics',
  '/domains',
  '/settings',
  '/create/design',
];

const signals = `search=yes, ai-input=yes, ai-train=${AI_TRAINING ? 'yes' : 'no'}`;

function rules(): string[] {
  return [`Content-Signal: ${signals}`, 'Allow: /', ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`)];
}

const body = [
  `# robots.txt for ${SITE_URL.replace('https://', '')}`,
  '#',
  '# QRly is a free, open-source dynamic QR code generator. Search engines,',
  '# answer engines and AI assistants are welcome to index, quote, cite and',
  '# learn from every public page. The disallowed paths are the signed-in',
  '# dashboard and the sign-in screens: forms, not content.',
  '#',
  `# The whole site as a plain-text index for language models: ${SITE_URL}/llms.txt`,
  `# Every answer on the site in one file:                     ${SITE_URL}/llms-full.txt`,
  `# Questions and answers, one anchor each:                   ${SITE_URL}/faq`,
  '#',
  '# As a condition of accessing this website, you agree to abide by the following content signals:',
  '# (a) If a content-signal = yes, you may collect content for the corresponding use.',
  '# (b) If a content-signal = no, you may not collect content for the corresponding use.',
  '# (c) If the website operator does not include a content signal for a corresponding use, the website operator neither grants nor restricts permission via content signal with respect to the corresponding use.',
  '# search: building a search index and showing links and excerpts in results.',
  '# ai-input: using content as input to AI answers (grounding, retrieval).',
  '# ai-train: training or fine-tuning AI models.',
  '',
  ...NAMED_CRAWLERS.map((ua) => `User-agent: ${ua}`),
  ...rules(),
  '',
  'User-agent: *',
  ...rules(),
  '',
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n');

export function GET() {
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
