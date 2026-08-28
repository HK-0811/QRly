// vitest-pool-workers types `env` from cloudflare:test as `Cloudflare.Env`, which
// wrangler normally generates into worker-configuration.d.ts. src/types.ts is the
// canonical source in this repo, so the global points at it rather than us
// maintaining a second generated copy that can drift.
import type { Env as WorkerEnv } from '../src/types';

declare global {
  namespace Cloudflare {
    interface Env extends WorkerEnv {}
  }
}

export {};
