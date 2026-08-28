import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ' +
  'transition-[background-color,border-color,color,opacity] duration-150 ' +
  'disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-700 shadow-sm border border-accent-700/40',
  secondary:
    'border bg-[var(--bg-raised)] text-[var(--text)] hover:bg-[var(--bg-subtle)] ' +
    'border-[var(--border-strong)]',
  ghost: 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]',
  danger: 'bg-danger-600 text-white hover:bg-danger-500 border border-danger-600',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  loading,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        BUTTON_BASE,
        BUTTON_VARIANTS[variant],
        size === 'sm' ? 'h-8 px-2.5' : 'h-9 px-3.5',
        className,
      )}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="size-3.5 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Form fields
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
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-[var(--text)]"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12.5px] text-danger-500">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] leading-relaxed text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full rounded-md border bg-[var(--bg-raised)] px-3 py-2 text-sm text-[var(--text)]',
        'placeholder:text-[var(--text-faint)] transition-colors',
        invalid ? 'border-danger-500' : 'border-[var(--border-strong)]',
        className,
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border)] bg-[var(--bg-raised)]',
        'shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
  children: ReactNode;
}) {
  const tones = {
    neutral: 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border)]',
    good: 'bg-accent-500/10 text-accent-600 dark:text-accent-400 border-accent-500/25',
    warn: 'bg-warn-400/12 text-warn-600 dark:text-warn-400 border-warn-400/30',
    bad: 'bg-danger-500/10 text-danger-600 dark:text-danger-400 border-danger-500/25',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5',
        'text-[11px] font-medium leading-none',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/**
 * Callout for the things this project promises to be honest about: the KV
 * propagation window, geo approximation, domain locking. These are documented
 * trade-offs, not warnings — the tone should read as a note, not an alarm.
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
    <div
      className={cn(
        'rounded-md border px-3 py-2.5 text-[12.5px] leading-relaxed',
        tone === 'warn'
          ? 'border-warn-400/35 bg-warn-400/8 text-[var(--text)]'
          : 'border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)]',
      )}
    >
      {title && <p className="mb-0.5 font-medium text-[var(--text)]">{title}</p>}
      {children}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-danger-500/30 bg-danger-500/8 px-3 py-2 text-[13px] text-danger-600 dark:text-danger-400"
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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-strong)] px-6 py-14 text-center">
      <p className="text-sm font-medium text-[var(--text)]">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-[var(--text-muted)]">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
