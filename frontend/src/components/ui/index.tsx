import NextLink from 'next/link';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Button
//
// Square, no radius, no shadow. The primary is a solid ink block that turns
// vermilion on hover — the accent arrives as a surface, not as a tint, which is
// the one moment of colour most screens get.
//
// That hover used to be `--accent-dim` (the accent at 60% alpha) with the label
// switched to near-black. Over white that resolves to a washed salmon, so the
// most important control on the landing page went from a confident black block
// to a pale peach one on hover, and the label it carried sat at 2.7:1. Two
// separate mistakes reinforcing each other: the surface lost its authority and
// the type lost its contrast, at the exact moment the pointer said the person
// was about to click it.
//
// Now: ink -> full-strength accent -> the darker accent on press. The label
// stays white the whole way through, so nothing about the button re-renders
// except its ground. Contrast on the hover surface is 4.8:1.
//
// `buttonClass` is exported because four screens hand-rolled this recipe onto
// `<Link>` and bare `<button type="submit">` elements, and each copy had drifted.
// A recipe an anchor can wear is the only way one definition covers all of them.
// ---------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ghost-danger';
export type ButtonSize = keyof typeof BUTTON_SIZES;

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2.5 font-medium select-none whitespace-nowrap ' +
  // Never `transition-all`: these sit next to a hard offset shadow and inside
  // grids, and animating layout properties by accident is how a button starts
  // dragging its neighbours around on hover.
  'transition-[background-color,border-color,color,scale] duration-[var(--dur)] ease-[var(--ease)] ' +
  'active:scale-[0.96] ' +
  'disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 ' +
  'motion-reduce:active:scale-100';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--rule-ink)] text-white ' +
    'hover:bg-[var(--accent)] active:bg-[var(--accent-strong)]',
  secondary:
    'border-[1.5px] border-[var(--rule-ink)] bg-[var(--bg)] text-[var(--text)] ' +
    'hover:bg-[var(--surface-hover)] active:bg-[var(--surface-press)]',
  ghost:
    'border-[1.5px] border-[var(--rule-strong)] bg-[var(--bg)] text-[var(--text-muted)] ' +
    'hover:border-[var(--rule-ink)] hover:text-[var(--text)] active:bg-[var(--surface-hover)]',
  danger:
    'border-[1.5px] border-[rgba(176,48,48,0.4)] bg-[var(--bg)] text-[var(--color-danger-500)] ' +
    'hover:bg-[var(--color-danger-500)] hover:text-white hover:border-[var(--color-danger-500)]',
  // Neutral at rest, destructive on approach. For a Remove sitting in a row of
  // ordinary actions, where colouring it red before anyone has reached for it
  // just makes the row look alarmed. This existed as two `!important` overrides
  // bolted onto `ghost` at one call site; naming it is what stops the next one
  // from writing a third.
  'ghost-danger':
    'border-[1.5px] border-[var(--rule-strong)] bg-[var(--bg)] text-[var(--text-muted)] ' +
    'hover:border-[var(--color-danger-500)] hover:text-[var(--color-danger-500)] ' +
    'hover:bg-[rgba(176,48,48,0.05)]',
};

/**
 * A segmented control's button — the range pickers on analytics and on a link's
 * scans tab, and the PNG size strip in the studio. Three copies of the same
 * eight classes, each slightly different, none of them handling the seam.
 *
 * `index` is what fixes the seam: these buttons abut, so every internal border
 * was being drawn twice and the strip came out with 2px rules between segments
 * and 1px rules at its ends. Pulling each button a pixel left collapses the
 * pair, and lifting the selected one puts its ink border over its neighbours'
 * grey ones instead of half under them.
 */
export function segmentClass(selected: boolean, index = 0) {
  return cn(
    'relative inline-flex min-h-[40px] items-center justify-center border px-3',
    'transition-[background-color,border-color,color] duration-[var(--dur)] ease-[var(--ease)]',
    index > 0 && '-ml-px',
    selected
      ? 'z-[1] border-[var(--rule-ink)] bg-[var(--surface-hover)] text-[var(--text)]'
      : 'border-[var(--rule-strong)] text-[var(--text-faint)] hover:z-[1] hover:border-[var(--rule-ink)] hover:text-[var(--text)]',
  );
}

/**
 * The selected-state chip shared by the QR studio's option rows and the
 * retention presets. Both had grown their own copy of the same six classes.
 */
export function chipClass(selected: boolean, className?: string) {
  return cn(
    'inline-flex min-h-[40px] items-center justify-center border px-3.5 text-[13px]',
    'transition-[background-color,border-color,color,scale] duration-[var(--dur)] ease-[var(--ease)]',
    'active:scale-[0.96] motion-reduce:active:scale-100',
    selected
      ? 'border-[var(--rule-ink)] bg-[var(--rule-ink)] text-white'
      : 'border-[var(--rule-strong)] text-[var(--text-soft)] hover:border-[var(--rule-ink)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]',
    className,
  );
}

// Heights are pinned, not left to line-height plus padding. `sm` was landing at
// 33px, which is under the 40px floor a dense pointer UI should keep and well
// under the 44px a thumb needs. Pinning also means a button with a spinner in it
// is exactly as tall as the one beside it without one.
const BUTTON_SIZES = {
  sm: 'min-h-[40px] px-3.5 py-2 text-[13px]',
  md: 'min-h-[44px] px-5 py-3 text-[14px]',
  lg: 'min-h-[52px] px-6 py-4 text-[15px]',
} as const;

/**
 * The button recipe as a class string, for the elements that cannot be a
 * `<Button>` — `next/link` anchors and submit buttons that own their own layout.
 */
export function buttonClass({
  variant = 'secondary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className);
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  loading,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      // A button whose label is being replaced by a spinner has to keep
      // announcing that it is working, or a screen reader hears the label
      // vanish and nothing take its place.
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, className })}
    >
      {loading && <Spinner tone={variant === 'primary' ? 'inverted' : 'accent'} />}
      {children}
    </button>
  );
}

/**
 * The dashed-arc spinner from the DNS waiting state, reused wherever we wait.
 *
 * `inverted` exists because the primary button's ground moves from ink to
 * vermilion on hover, and an accent-coloured arc is invisible against the
 * second of those. White reads on both.
 */
export function Spinner({
  size = 14,
  tone = 'accent',
}: {
  size?: number;
  tone?: 'accent' | 'inverted';
}) {
  const inverted = tone === 'inverted';
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" className="shrink-0" aria-hidden>
      <circle
        cx="17"
        cy="17"
        r="14"
        fill="none"
        stroke={inverted ? 'rgba(255,255,255,0.3)' : 'rgba(10,10,10,0.12)'}
        strokeWidth="3"
      />
      <circle
        cx="17"
        cy="17"
        r="14"
        fill="none"
        stroke={inverted ? '#fff' : 'var(--accent)'}
        strokeWidth="3"
        strokeDasharray="16 48"
        strokeLinecap="square"
        style={{ animation: 'spinDash 1.2s linear infinite' }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Form fields
//
// Two input shapes. Boxed for standalone fields, ruled for fields inside a panel
// where a full border would add a second rule next to the panel's own.
// ---------------------------------------------------------------------------

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="eyebrow mb-2 block">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-[12px] text-[var(--color-danger-500)]">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-faint)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  invalid,
  variant = 'boxed',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  variant?: 'boxed' | 'ruled';
}) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full bg-transparent text-[var(--text)] placeholder:text-[var(--text-ghost)]',
        'transition-[border-color,background-color] duration-[var(--dur)] ease-[var(--ease)]',
        // 44px minimum on both shapes. The ruled variant was 34px tall, which is
        // a fine target for a mouse and a poor one for a thumb, and these forms
        // are the ones people fill in on a phone.
        variant === 'boxed'
          ? 'min-h-[46px] border-[1.5px] px-4 py-3 text-[15px]'
          : 'min-h-[44px] border-0 border-b px-0 py-2 text-[15px]',
        invalid
          ? 'border-[var(--color-danger-500)]'
          : variant === 'boxed'
            ? 'border-[var(--rule-ink)]'
            : // The resting rule is quiet and the focused one is ink, so moving
              // between fields is legible without a ring having to carry it.
              'border-[var(--rule-strong)] hover:border-[var(--rule-ink)] focus:border-[var(--rule-ink)]',
        className,
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

/**
 * A single ruled panel. Note there is no shadow and no radius — depth in this
 * design comes only from the offset block below, and only on things the user
 * just made.
 */
export function Panel({
  className,
  children,
  block,
}: {
  className?: string;
  children: ReactNode;
  /** The hard offset shadow. Reserve it for the QR itself. */
  block?: boolean;
}) {
  return (
    <div
      className={cn('border border-[var(--rule-mid)] bg-[var(--bg)]', className)}
      style={block ? { boxShadow: 'var(--shadow-block)' } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Cells on a ruled ground. Pass the column template; the 1px gap is the rule.
 * See the `.hairline` comment in globals.css for why this beats bordered cards.
 */
export function Hairline({
  cols,
  className,
  children,
  style,
}: {
  cols?: string;
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn('hairline', className)}
      style={{ gridTemplateColumns: cols, ...style }}
    >
      {children}
    </div>
  );
}

/**
 * The mono uppercase status chip. Outlined, never filled — a filled badge would
 * compete with the buttons, which are the only solid blocks on most screens.
 */
export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'live' | 'bad';
  children: ReactNode;
}) {
  const tones = {
    neutral: 'border-[var(--rule-strong)] text-[var(--text-faint)]',
    live: 'border-[var(--accent-line)] text-[var(--accent)]',
    bad: 'border-[rgba(176,48,48,0.35)] text-[var(--color-danger-500)]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2 py-[3px] font-mono text-[11px] leading-none',
        'uppercase tracking-[0.06em]',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/**
 * Callout for the things this project promises to be honest about: the KV
 * propagation window, geo approximation, domain locking, retention deletion.
 *
 * Set as a marginal note rather than a boxed alert — a hanging glyph and quiet
 * text. These are documented trade-offs the reader should absorb, not warnings
 * they should dismiss, and an alarm-coloured box teaches people to skip them.
 */
export function Note({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warn';
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3.5 border-t border-[var(--rule)] pt-4">
      <span
        className={cn(
          'font-mono text-[13px] leading-[1.5]',
          tone === 'warn' ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]',
        )}
        aria-hidden
      >
        {tone === 'warn' ? '!' : 'i'}
      </span>
      <div className="max-w-[66ch] text-[13px] leading-relaxed text-[var(--text-muted)]">
        {title && <p className="mb-1 font-medium text-[var(--text)]">{title}</p>}
        {children}
      </div>
    </div>
  );
}

/**
 * An inline link inside a sentence, for the ones that are not the accent.
 *
 * The four auth screens each wrote `text-[var(--text)] hover:underline`, which
 * is a link that does not look like a link until the pointer is already on it —
 * in a sentence reading "No account? Create one", the only thing marking the
 * target was its weight. The rule is drawn at rest in a quiet grey and turns
 * accent on hover, so the affordance is there before anyone goes looking.
 */
export function InlineLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <NextLink
      href={href}
      className={cn(
        'font-medium text-[var(--text)] underline decoration-[var(--rule-strong)] underline-offset-[3px]',
        'transition-[color,text-decoration-color] duration-[var(--dur)] ease-[var(--ease)]',
        'hover:text-[var(--accent)] hover:decoration-[var(--accent)]',
        className,
      )}
    >
      {children}
    </NextLink>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="border-l-2 border-[var(--color-danger-500)] bg-[rgba(176,48,48,0.05)] py-2.5 pl-3.5 pr-3 text-[13px] leading-relaxed text-[var(--color-danger-500)]"
    >
      {children}
    </p>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-[var(--rule-strong)] px-8 py-20 text-center">
      <p className="text-[17px] font-semibold tracking-[-0.02em]">{title}</p>
      <p className="mx-auto mt-2.5 max-w-[46ch] text-[14px] leading-relaxed text-[var(--text-muted)]">
        {description}
      </p>
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data display
// ---------------------------------------------------------------------------

/**
 * A headline number with its qualification underneath.
 *
 * The caption is not optional decoration — it is where "unique per day" and
 * "bots excluded" live. A number this large without its qualifier is a small lie,
 * so the component makes room for one by default.
 */
export function StatTile({
  label,
  value,
  caption,
  size = 'md',
  loading,
}: {
  label: string;
  value: ReactNode;
  caption?: ReactNode;
  size?: 'md' | 'lg';
  loading?: boolean;
}) {
  return (
    <div className={size === 'lg' ? 'p-8' : 'p-7'}>
      <p className="text-[13px] text-[var(--text-soft)]">{label}</p>
      {loading ? (
        // Matched to the rendered numeral's box, not eyeballed: a skeleton that
        // is shorter than the thing it stands in for makes the whole tile jump
        // when the request lands.
        <div
          className={cn('skeleton mt-2.5', size === 'lg' ? 'h-[59px] w-36' : 'h-[42px] w-24')}
          aria-hidden
        />
      ) : (
        <p className={cn('numeral mt-2.5', size === 'lg' ? 'text-[56px]' : 'text-[40px]')}>
          {value}
        </p>
      )}
      {caption && (
        <p className="mt-2 max-w-[34ch] text-[12px] leading-snug text-[var(--text-faint)]">
          {caption}
        </p>
      )}
    </div>
  );
}

/**
 * Bare bars, no axis. Used in a table row where a labelled chart would not fit.
 *
 * The accent is spent here on purpose and it is the only chart in the product
 * where that is true: a sparkline has exactly one series, so the accent is not
 * standing in for a category it would have to keep meaning elsewhere. The
 * breakdown charts, which do have categories, use the validated viz palette.
 */
export function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className={cn('group/spark flex h-[30px] items-end gap-[2px]', className)} aria-hidden>
      {values.map((v, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 bg-[var(--accent-fill)]',
            // The row this sits in is itself hoverable, so the bars answer the
            // row rather than each having their own target.
            'transition-colors duration-[var(--dur)] ease-[var(--ease)]',
            'group-hover/spark:bg-[var(--accent)]',
          )}
          // A zero-scan day must still draw something, or a flat run reads as
          // missing data rather than as no scans.
          style={{ height: `${Math.max(4, Math.round((v / max) * 100))}%` }}
        />
      ))}
    </div>
  );
}

/** The section rule that titles a block of content. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="eyebrow mb-5">{children}</div>;
}
