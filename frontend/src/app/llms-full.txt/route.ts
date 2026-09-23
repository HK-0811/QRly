import { llmsFullTxt } from '@/lib/llms';

/** Served at /llms-full.txt: /llms.txt with every answer inlined. See lib/llms.ts. */
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsFullTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
