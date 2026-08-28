import type { Env } from '../src/types';

declare module 'cloudflare:test' {
  // Makes `env` from cloudflare:test strongly typed against the Worker's own Env.
  interface ProvidedEnv extends Env {}
}
