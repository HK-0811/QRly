import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The repo root has its own package-lock.json for tooling; without this Next
  // infers the wrong workspace root and traces the whole repo.
  outputFileTracingRoot: __dirname,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;

// Lets `next dev` see Cloudflare bindings declared in wrangler.jsonc.
// Guarded so it is a no-op during production builds.
if (process.env.NODE_ENV === 'development') {
  void import('@opennextjs/cloudflare').then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}
