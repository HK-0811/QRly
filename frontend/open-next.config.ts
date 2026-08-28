import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // No incremental cache configured: the dashboard is entirely dynamic and
  // per-user. Adding an R2/KV cache would add cost surface for nothing.
});
