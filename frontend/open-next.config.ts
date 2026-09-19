import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

export default defineCloudflareConfig({
  /*
    Read-only, served from the Worker's own static assets. No R2, no KV.

    This exists because of what happens without it. OpenNext puts every page
    `next build` prerendered — /blog, each post, /cost, /privacy, the sitemap
    — into an "incremental cache", and with no cache configured it simply
    renders them again on every request. For /cost that was invisible. For
    the blog it was fatal: the posts are read from content/blog at build
    time, the Worker has no filesystem, and so production served an index of
    zero posts and a 404 for every article while the local build was perfect.

    Nothing here revalidates, so the read-only cache is the right one. An
    R2/KV cache would add a paid surface for ISR this app does not use.
  */
  incrementalCache: staticAssetsIncrementalCache,
});
