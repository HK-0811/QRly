#!/usr/bin/env node
/**
 * The blog is many files written by many hands, and the things that go wrong
 * with it are all quiet: a link to a post that was renamed, a category that
 * is not one of the ten, a post that stops mid-sentence. None of them fail
 * the build — Next renders whatever the Markdown says. This does fail.
 *
 *   node tools/check-blog.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'frontend/content/blog';
const CATEGORIES = new Set([
  'basics', 'use-cases', 'dynamic', 'design', 'analytics',
  'business', 'comparisons', 'how-to', 'privacy', 'advanced',
]);
const SITE_PATHS = new Set(['/', '/create', '/cost', '/privacy', '/blog', '/faq', '/login', '/signup']);
const MIN_WORDS = 700;

const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));
const slugs = new Set(files.map((f) => f.replace(/\.md$/, '')));

let failures = 0;
const bad = (slug, msg) => {
  failures++;
  console.log(`  FAIL  ${slug} — ${msg}`);
};

const seenTitles = new Map();
let totalWords = 0;

for (const file of files.sort()) {
  const slug = file.replace(/\.md$/, '');
  const raw = readFileSync(join(DIR, file), 'utf8');
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) {
    bad(slug, 'no front matter');
    continue;
  }
  const meta = Object.fromEntries(
    m[1]
      .split(/\r?\n/)
      .filter((l) => l.includes(':'))
      .map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]),
  );
  const body = m[2];

  for (const k of ['title', 'description', 'date', 'category', 'keywords']) {
    if (!meta[k]) bad(slug, `missing ${k}`);
  }
  if (meta.category && !CATEGORIES.has(meta.category)) bad(slug, `bad category "${meta.category}"`);
  if (meta.date && !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) bad(slug, `bad date "${meta.date}"`);
  if (meta.title && meta.title.length > 90) bad(slug, `title is ${meta.title.length} chars`);
  if (meta.description && meta.description.length > 200) bad(slug, `description is ${meta.description.length} chars`);
  if (meta.title) {
    const key = meta.title.toLowerCase();
    if (seenTitles.has(key)) bad(slug, `duplicate title of ${seenTitles.get(key)}`);
    seenTitles.set(key, slug);
  }

  const words = body.split(/\s+/).filter(Boolean).length;
  totalWords += words;
  if (words < MIN_WORDS) bad(slug, `only ${words} words`);
  if (/^# /m.test(body)) bad(slug, 'has an H1 in the body');
  if ((body.match(/^## /gm) ?? []).length < 3) bad(slug, 'fewer than three H2 sections');
  if (!/^## Frequently asked/m.test(body)) bad(slug, 'no "Frequently asked" section');
  else {
    // The same reading frontend/src/lib/blog.ts does to build the post's
    // FAQPage markup: a bold line is a question, the lines under it its answer.
    // A section written some other way renders fine and produces no markup,
    // which nobody would notice from the page.
    const section = body.split(/^## Frequently asked.*$/m)[1].split(/^## /m)[0];
    const pairs = section.split(/^\*\*(.+?)\*\*\s*$/m).slice(1);
    let answered = 0;
    for (let i = 0; i < pairs.length; i += 2) if (pairs[i + 1]?.trim()) answered++;
    if (answered < 3) bad(slug, `"Frequently asked" yields ${answered} question(s); write each as a bold line with its answer below`);
  }
  if (/\b(TODO|TBD|lorem ipsum)\b/i.test(body)) bad(slug, 'contains a placeholder');
  if (/<[a-z]+[^>]*>/i.test(body.replace(/`[^`]*`/g, ''))) bad(slug, 'contains raw HTML');

  for (const link of body.matchAll(/\]\(([^)\s]+)(?:\s[^)]*)?\)/g)) {
    const href = link[1];
    if (href.startsWith('#')) continue;
    if (/^https?:\/\//.test(href)) continue;
    if (href.startsWith('/blog/')) {
      const target = href.slice('/blog/'.length).replace(/#.*$/, '');
      if (!slugs.has(target)) bad(slug, `links to /blog/${target}, which does not exist`);
    } else if (!SITE_PATHS.has(href.replace(/#.*$/, ''))) {
      bad(slug, `links to unknown path ${href}`);
    }
  }
}

// The site FAQ links into the blog from its answers. A `more:` slug that does
// not exist fails the build on its own; an inline Markdown link does not, so
// both are checked here, along with the fragment links between answers.
const faq = readFileSync('frontend/src/lib/faq.ts', 'utf8');
const faqIds = new Set([...faq.matchAll(/^\s+id: '([^']+)'/gm)].map((m) => m[1]));
let faqLinks = 0;
for (const m of faq.matchAll(/more: '([^']+)'/g)) {
  faqLinks++;
  if (!slugs.has(m[1])) bad('faq', `"more" names /blog/${m[1]}, which does not exist`);
}
for (const m of faq.matchAll(/\]\((\/[^)\s]*|#[^)\s]+)\)/g)) {
  faqLinks++;
  const href = m[1];
  if (href.startsWith('#')) {
    if (!faqIds.has(href.slice(1))) bad('faq', `links to ${href}, which is not a question or section id`);
  } else if (href.startsWith('/blog/')) {
    const target = href.slice('/blog/'.length).replace(/#.*$/, '');
    if (!slugs.has(target)) bad('faq', `links to /blog/${target}, which does not exist`);
  } else if (!SITE_PATHS.has(href.replace(/#.*$/, ''))) {
    bad('faq', `links to unknown path ${href}`);
  }
}

console.log(`\n${files.length} posts, ${totalWords.toLocaleString()} words`);
console.log(`faq: ${faqIds.size} ids, ${faqLinks} internal links`);
console.log(failures === 0 ? 'all checks passed' : `${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
