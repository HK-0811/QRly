import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
        miniflare: {
          bindings: {
            ENVIRONMENT: 'test',
            PLATFORM_HOSTNAME: 'qrify.test',
            DASHBOARD_ORIGIN: 'http://localhost:3000',
            SUPABASE_URL: 'https://test.supabase.co',
            SUPABASE_SERVICE_KEY: 'test-service-key',
            SUPABASE_ANON_KEY: 'test-anon-key',
            SUPABASE_JWKS_URL: 'https://test.supabase.co/auth/v1/.well-known/jwks.json',
            VISITOR_HASH_PEPPER: 'test-pepper-value-for-unit-tests-only',
          },
          kvNamespaces: ['LINKS_KV'],
        },
      },
    },
  },
});
