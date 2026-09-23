/**
 * The site in plain text, for language models: /llms.txt and /llms-full.txt.
 *
 * /llms.txt follows the proposal at https://llmstxt.org — an H1 with the
 * name, a blockquote with the one-paragraph summary, some prose, then
 * sections of `- [title](url): note` links, with an "Optional" section a
 * model may skip when its context is short. Whether any given engine reads
 * the file is not something anyone can promise; it costs one build-time
 * string and answers the question "what is this site" in the format a model
 * reads best.
 *
 * /llms-full.txt is the same index with the answers inlined: the key facts,
 * every FAQ answer, and every guide's summary and question-and-answer pairs.
 * Not the guides' full bodies — 129 of those is some 300k tokens, which is
 * more than most models will take in one fetch, and the pages are one link
 * away.
 *
 * Both are generated from the same modules that render the pages, at build
 * time, so the text a model reads and the text a person reads cannot drift.
 */
import { CATEGORIES, getAllPosts, type Category } from './blog';
import { FACTS, FAQ_REVIEWED, faqSections } from './faq';
import { REPO_URL, SITE_NAME, SITE_SUMMARY, SITE_URL } from './site';

const PAGES: Array<{ title: string; path: string; note: string }> = [
  { title: 'Make a QR code', path: '/create', note: 'Paste a URL and download a dynamic QR code as SVG or PNG. No account needed.' },
  { title: 'FAQ', path: '/faq', note: 'Direct answers to common questions about QR codes and about QRly.' },
  { title: 'What it costs', path: '/cost', note: "QRly's running cost next to competitors' published prices, with sources and dates." },
  { title: 'Privacy', path: '/privacy', note: 'Every field recorded when a code is scanned, what is deliberately not recorded, and retention.' },
  { title: 'Guides', path: '/blog', note: 'Guides on making, printing, tracking and choosing QR codes, grouped by topic.' },
];

function header(): string[] {
  return [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_SUMMARY}`,
    '',
    ...FACTS.map((f) => `- ${f.label}: ${f.value}`),
    '',
    `Canonical site: ${SITE_URL}. Source code: ${REPO_URL}. Facts reviewed ${FAQ_REVIEWED}.`,
    '',
  ];
}

function postsByCategory() {
  const posts = getAllPosts();
  return (Object.keys(CATEGORIES) as Category[])
    .map((key) => ({ label: CATEGORIES[key], posts: posts.filter((p) => p.category === key) }))
    .filter((g) => g.posts.length > 0);
}

export function llmsTxt(): string {
  const lines = header();

  lines.push('## Product', '');
  for (const p of PAGES) lines.push(`- [${p.title}](${SITE_URL}${p.path}): ${p.note}`);
  lines.push(`- [Source code](${REPO_URL}): The complete platform, MIT licensed.`, '');

  lines.push('## FAQ', '');
  for (const s of faqSections()) {
    for (const i of s.items) lines.push(`- [${i.question}](${SITE_URL}/faq#${i.id})`);
  }
  lines.push('');

  for (const g of postsByCategory()) {
    lines.push(`## Guides: ${g.label}`, '');
    for (const p of g.posts) lines.push(`- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`);
    lines.push('');
  }

  lines.push('## Optional', '');
  lines.push(
    `- [llms-full.txt](${SITE_URL}/llms-full.txt): This index with every FAQ answer and every guide's questions and answers inlined.`,
    `- [Sitemap](${SITE_URL}/sitemap.xml): Every public URL.`,
    '',
  );

  return lines.join('\n');
}

export function llmsFullTxt(): string {
  const lines = header();

  lines.push('## Frequently asked questions', '');
  lines.push(`Source: ${SITE_URL}/faq`, '');
  for (const s of faqSections()) {
    lines.push(`### ${s.title}`, '');
    for (const i of s.items) {
      lines.push(`#### ${i.question}`, '', absolutise(i.answer.trim()), '', `(${SITE_URL}/faq#${i.id})`, '');
    }
  }

  lines.push('## Guides', '');
  for (const g of postsByCategory()) {
    lines.push(`### ${g.label}`, '');
    for (const p of g.posts) {
      lines.push(
        `#### ${p.title}`,
        '',
        `URL: ${SITE_URL}/blog/${p.slug}`,
        `Published: ${p.date}${p.updated ? ` · Updated: ${p.updated}` : ''}`,
        '',
        p.description,
        '',
      );
      for (const f of p.faqs) lines.push(`Q: ${f.question}`, `A: ${absolutise(f.answer)}`, '');
    }
  }

  return lines.join('\n');
}

/** Site-relative Markdown links become absolute, because this file is read out of context. */
export function absolutise(markdown: string): string {
  return markdown.replace(/\]\((\/[^)\s]*)\)/g, `](${SITE_URL}$1)`);
}
