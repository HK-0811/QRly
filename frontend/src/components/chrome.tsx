import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/components/ui';

/**
 * The mark: three quarters of a QR finder pattern, with the fourth corner offset
 * in the accent. Built from box-shadow rather than paths so it stays crisp at any
 * size and needs no viewBox maths.
 */
export function Mark({ size = 16 }: { size?: number }) {
  const offset = Math.round(size * 0.375);
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        background: 'var(--rule-ink)',
        boxShadow: `${offset}px 0 0 var(--accent), 0 ${offset}px 0 var(--rule-ink)`,
      }}
    />
  );
}

export function Wordmark({ size = 15, href = '/' }: { size?: number; href?: string | null }) {
  const inner = (
    <>
      <Mark size={size > 14 ? 16 : 14} />
      <span
        className="font-mono tracking-[0.14em]"
        style={{ fontSize: size, paddingLeft: 8 }}
      >
        QRLY
      </span>
    </>
  );

  if (!href) return <div className="flex items-center gap-2.5">{inner}</div>;

  return (
    <Link
      href={href}
      className="inline-flex min-h-[40px] items-center gap-2.5 text-[var(--text)] transition-opacity duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--text)] hover:opacity-70"
    >
      {inner}
    </Link>
  );
}

/**
 * The ruled ground the whole product sits on.
 *
 * Two layers: a static 44px grid at low contrast, and an accent grid that is
 * revealed only under the cursor by a radial mask. The second layer is the reason
 * the page feels like a drawing surface rather than a document — but it is
 * pointer-driven decoration, so it is skipped entirely for touch and for anyone
 * who asked for reduced motion.
 */
export function GridGround() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(10,10,10,0.055) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(10,10,10,0.055) 1px, transparent 1px)',
          backgroundSize: 'var(--grid-size) var(--grid-size)',
        }}
      />
      <CursorGrid />
    </>
  );
}

function CursorGrid() {
  return (
    <>
      <div
        id="qrly-cursor-grid"
        aria-hidden
        // The script below writes to this node's style attribute as soon as the
        // pointer moves, which is usually before React hydrates. React then
        // compares the server's style attribute to the live one, finds a mask
        // and an opacity it did not render, and logs a hydration mismatch on
        // every page load. The mutation is deliberate and unmanaged, so the
        // right answer is to tell React not to diff this node's attributes
        // rather than to move a decorative mask into component state.
        suppressHydrationWarning
        className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-500"
        style={{
          backgroundImage:
            'linear-gradient(to right, oklch(0.58 0.215 32 / 0.45) 1px, transparent 1px),' +
            'linear-gradient(to bottom, oklch(0.58 0.215 32 / 0.45) 1px, transparent 1px)',
          backgroundSize: 'var(--grid-size) var(--grid-size)',
        }}
      />
      {/*
        Inline and dependency-free because this is pure decoration on a
        server-rendered page: making the landing page a client component to move a
        mask would ship React state for something that must never block paint.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
  var el = document.getElementById('qrly-cursor-grid');
  if (!el) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var raf = 0, x = 0, y = 0;
  function paint(){
    raf = 0;
    var m = 'radial-gradient(200px 200px at ' + x + 'px ' + y + 'px, #000 0%, rgba(0,0,0,0.3) 45%, transparent 72%)';
    el.style.webkitMaskImage = m;
    el.style.maskImage = m;
    el.style.opacity = '1';
  }
  window.addEventListener('mousemove', function(e){
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });
  window.addEventListener('mouseout', function(e){
    if (!e.relatedTarget) el.style.opacity = '0';
  });
})();`,
        }}
      />
    </>
  );
}

/** Page shell. Everything sits above the grid, hence the z-index. */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[var(--bg)]">
      <GridGround />
      <div className={cn('relative z-[1]', className)}>{children}</div>
    </div>
  );
}

/** Horizontal padding used by every header and page body, so they line up. */
export const GUTTER = 'px-6 sm:px-10 lg:px-12';
