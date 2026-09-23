/**
 * The blog, as data.
 *
 * Posts are Markdown files in frontend/content/blog, one per URL. Everything
 * here runs at build time: the two blog routes are statically generated, so
 * the Worker that serves qrly.lol never opens a file and never runs a Markdown
 * parser. That matters because the dashboard Worker has no filesystem — a post
 * that leaked into a request path would 500 in production and work on every
 * developer's machine.
 *
 * The front matter is a flat `key: value` block rather than YAML, parsed here
 * in a dozen lines. The fields are few and fixed, and a YAML dependency would
 * be a second grammar for a header that is already simple.
 *
 *   ---
 *   title: Free QR code generator with no sign-up
 *   description: One sentence, used as the meta description and in the index.
 *   date: 2026-09-19
 *   category: basics
 *   keywords: free qr code generator, qr code no sign up
 *   ---
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

export const CATEGORIES = {
  basics: 'The basics',
  'use-cases': 'Use cases',
  dynamic: 'Dynamic codes',
  design: 'Design and print',
  analytics: 'Tracking and analytics',
  business: 'For business',
  comparisons: 'Comparisons and alternatives',
  'how-to': 'How-to',
  privacy: 'Privacy and safety',
  advanced: 'Advanced',
} as const;

export type Category = keyof typeof CATEGORIES;

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  /** ISO date, set only when a post has been materially revised. */
  updated?: string;
  category: Category;
  keywords: string[];
  /** Estimated reading time in minutes, from the word count. */
  minutes: number;
}

export interface Post extends PostMeta {
  /** The Markdown body as written, for the plain-text copies in /llms-full.txt. */
  markdown: string;
  /** Rendered HTML for the body. Authored by us, never by a user. */
  html: string;
  /** The h2 headings, for the on-page table of contents. */
  headings: Array<{ id: string; text: string }>;
  /** The questions in the post's "Frequently asked" section, for FAQPage markup. */
  faqs: PostFaq[];
}

export interface PostFaq {
  question: string;
  /** Markdown, exactly as in the post. */
  answer: string;
}

const CONTENT_DIR = join(process.cwd(), 'content', 'blog');

// ---------------------------------------------------------------------------
// Front matter
// ---------------------------------------------------------------------------

function parseFrontMatter(raw: string, slug: string): { meta: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) throw new Error(`content/blog/${slug}.md has no front matter block`);
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    // Quotes are optional and stripped so a title may contain a colon.
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body: match[2] };
}

function required(meta: Record<string, string>, key: string, slug: string): string {
  const v = meta[key];
  if (!v) throw new Error(`content/blog/${slug}.md is missing "${key}" in its front matter`);
  return v;
}

function category(value: string, slug: string): Category {
  if (value in CATEGORIES) return value as Category;
  throw new Error(
    `content/blog/${slug}.md has category "${value}"; expected one of ${Object.keys(CATEGORIES).join(', ')}`,
  );
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

/** A URL-safe id for a heading, the way GitHub would make one. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&[a-z]+;|&#\d+;/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function render(markdown: string): { html: string; headings: Post['headings'] } {
  const headings: Post['headings'] = [];
  const seen = new Map<string, number>();

  const renderer = new marked.Renderer();
  renderer.heading = ({ depth, tokens }) => {
    const plain = renderer.parser.parseInline(tokens).replace(/<[^>]+>/g, '');
    let id = slugify(plain) || `section-${headings.length + 1}`;
    // Two headings with the same text would otherwise share an id and the
    // table of contents would only ever reach the first.
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n + 1}`;
    if (depth === 2) headings.push({ id, text: plain });
    return `<h${depth} id="${id}">${renderer.parser.parseInline(tokens)}</h${depth}>\n`;
  };
  // Off-site links open elsewhere; ours stay in the tab. `text` here is the
  // already-rendered inner HTML, so nothing is re-escaped.
  renderer.link = ({ href, title, tokens }) => {
    const inner = renderer.parser.parseInline(tokens);
    const external = /^https?:\/\//.test(href) && !href.startsWith('https://qrly.lol');
    const attrs = [
      `href="${href}"`,
      title ? `title="${title}"` : '',
      external ? 'target="_blank" rel="noopener noreferrer"' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return `<a ${attrs}>${inner}</a>`;
  };

  const html = marked.parse(markdown, { renderer, gfm: true, breaks: false }) as string;
  return { html, headings };
}

/**
 * Markdown that is not a post — a FAQ answer — to HTML, with the same link
 * rules as a post so an off-site link behaves the same wherever it appears.
 */
export function renderPassage(markdown: string): string {
  return render(markdown).html;
}

// ---------------------------------------------------------------------------
// Frequently asked
// ---------------------------------------------------------------------------

/**
 * The question-and-answer pairs at the end of a post, read from the Markdown
 * rather than the HTML because the Markdown has a shape and the HTML does not.
 *
 * Every post closes with a `## Frequently asked` section in which each
 * question is a line in bold and its answer is the lines after it:
 *
 *   **Do QR codes expire?**
 *   The code does not; it is a pattern with no date in it.
 *
 * That section becomes FAQPage structured data on the post. The same text is
 * on the page, which is the condition for the markup being honest at all.
 * tools/check-blog.mjs fails a post whose section yields fewer than three.
 */
export function extractFaqs(markdown: string): PostFaq[] {
  const pairs: Array<{ question: string; lines: string[] }> = [];
  let inSection = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith('## ')) {
      inSection = /^## Frequently asked/i.test(line);
      continue;
    }
    if (!inSection) continue;
    const question = /^\*\*(.+?)\*\*\s*$/.exec(line);
    if (question) pairs.push({ question: question[1].trim(), lines: [] });
    else if (line.trim() && pairs.length > 0) pairs[pairs.length - 1].lines.push(line.trim());
  }

  // A bold line with nothing under it is emphasis, not a question.
  return pairs
    .filter((p) => p.lines.length > 0)
    .map((p) => ({ question: p.question, answer: p.lines.join(' ') }));
}

// ---------------------------------------------------------------------------
// The index
// ---------------------------------------------------------------------------

function readPost(slug: string): Post {
  const raw = readFileSync(join(CONTENT_DIR, `${slug}.md`), 'utf8');
  const { meta, body } = parseFrontMatter(raw, slug);
  const words = body.split(/\s+/).filter(Boolean).length;
  const { html, headings } = render(body);
  return {
    slug,
    title: required(meta, 'title', slug),
    description: required(meta, 'description', slug),
    date: required(meta, 'date', slug),
    updated: meta.updated || undefined,
    category: category(required(meta, 'category', slug), slug),
    keywords: (meta.keywords ?? '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
    minutes: Math.max(1, Math.round(words / 230)),
    markdown: body,
    html,
    headings,
    faqs: extractFaqs(body),
  };
}

let cache: Post[] | null = null;

/** Every post, newest first. Read once per build. */
export function getAllPosts(): Post[] {
  if (cache) return cache;
  if (!existsSync(CONTENT_DIR)) return (cache = []);
  cache = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => readPost(f.replace(/\.md$/, '')))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
  return cache;
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** Up to `n` other posts, same category first, then anything recent. */
export function relatedPosts(post: Post, n = 4): PostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const same = all.filter((p) => p.category === post.category);
  const rest = all.filter((p) => p.category !== post.category);
  return [...same, ...rest].slice(0, n);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
