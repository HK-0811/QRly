import { llmsTxt } from '@/lib/llms';

/**
 * Served at /llms.txt: the site as a Markdown index for language models. See
 * lib/llms.ts for the format and for what it does and does not promise.
 *
 * Static, like the sitemap: built once from the post files and the FAQ, and
 * served from the Worker's assets, which have the files the Worker does not.
 */
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
