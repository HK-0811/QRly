#!/usr/bin/env node
/**
 * Tell the IndexNow search engines that pages changed, instead of waiting for
 * them to recrawl.
 *
 * One POST reaches every engine in the protocol — Bing, Yandex, Naver, Seznam,
 * Yep — and Bing is what matters here: Copilot answers from Bing's index, and
 * ChatGPT search draws on third-party search providers that include it.
 * Google does not take part and reads /sitemap.xml on its own schedule.
 *
 * The engines check that the submitter controls the host by fetching the key
 * file at the site root: frontend/public/<key>.txt, forwarded by the backend
 * like any other root file (backend/src/lib/dashboard.ts). The key is public
 * by design; it proves ownership only because it is served from the domain.
 *
 * Run it after a deploy that adds or changes public pages:
 *
 *   node tools/indexnow.mjs            submit every URL in the live sitemap
 *   node tools/indexnow.mjs --dry-run  list what would be submitted
 *   node tools/indexnow.mjs /faq /blog/what-is-a-qr-code   submit just these
 *
 * It reads the live sitemap, not the build, so it can only submit what is
 * actually deployed. Resubmitting unchanged URLs is harmless but pointless;
 * engines may slow down for a host that does it on every run.
 */
import { readdirSync } from 'node:fs';

const SITE = 'https://qrly.lol';
const HOST = new URL(SITE).host;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const key = readdirSync('frontend/public')
  .map((f) => /^([0-9a-f]{32})\.txt$/.exec(f)?.[1])
  .find(Boolean);
if (!key) {
  console.error('No IndexNow key file (32 hex characters + .txt) in frontend/public.');
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const paths = args.filter((a) => a.startsWith('/'));

// The key must be live before any engine is asked to trust it; a submission
// whose key file 404s is rejected, and repeated rejections are not free.
const keyFile = await fetch(`${SITE}/${key}.txt`);
const served = keyFile.ok ? (await keyFile.text()).trim() : '';
if (served !== key) {
  console.error(`${SITE}/${key}.txt is not serving the key (HTTP ${keyFile.status}). Deploy first.`);
  process.exit(1);
}

let urls;
if (paths.length > 0) {
  urls = paths.map((p) => `${SITE}${p}`);
} else {
  const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}
urls = urls.filter((u) => new URL(u).host === HOST);

console.log(`${urls.length} URL(s) for ${HOST}`);
if (dryRun) {
  for (const u of urls) console.log(`  ${u}`);
  process.exit(0);
}

// The protocol accepts up to 10,000 URLs per request.
for (let i = 0; i < urls.length; i += 10_000) {
  const batch = urls.slice(i, i + 10_000);
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${key}.txt`, urlList: batch }),
  });
  // 200 = accepted, 202 = accepted and key validation pending. Anything else
  // is a refusal worth reading: 403 key mismatch, 422 URL not on the host,
  // 429 too many requests.
  const detail = res.ok ? '' : ` — ${(await res.text()).slice(0, 300)}`;
  console.log(`  submitted ${batch.length}: HTTP ${res.status}${detail}`);
  if (!res.ok) process.exit(1);
}
