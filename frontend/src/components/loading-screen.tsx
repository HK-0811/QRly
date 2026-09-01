import { QrLoader } from '@/components/ui';

/**
 * The fallback every dashboard route suspends into.
 *
 * Lives here rather than in a single `loading.tsx` because of how the App
 * Router picks a boundary: `loading.tsx` suspends the segment it sits in, and a
 * segment that does not change on a navigation keeps its already-resolved
 * boundary. One file at the `(dashboard)` level therefore covers a cold load
 * into the dashboard and nothing else — going from /links to /links/[id] never
 * re-suspends it, which was measured, not assumed. The boundary has to sit on
 * the segment that actually changes, so each route re-exports this.
 *
 * The header and nav belong to the layout and stay mounted throughout, so only
 * this content area swaps. `min-h` holds the fold open so the loader lands where
 * content will be instead of jumping up under the nav.
 */
export function LoadingScreen() {
  return (
    <div className="flex min-h-[52dvh] items-center justify-center">
      <QrLoader />
    </div>
  );
}
