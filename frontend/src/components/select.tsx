'use client';

import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/components/ui';

/**
 * A select whose open list belongs to this product.
 *
 * A native `<select>` can be styled down to the last pixel and it will still
 * drop an operating-system menu — white background, blue highlight, system font,
 * square corners on Windows and rounded ones on macOS. Nothing about that list
 * is reachable from CSS. On a screen built out of hairlines and one vermilion
 * accent it reads as a piece of another application.
 *
 * So the list is ours: a button that owns the closed state and a listbox that
 * replaces the menu. That means re-implementing what the native control gave
 * away for free, which is the actual cost of this file — keyboard access,
 * focus handling and the ARIA that makes it a combobox to a screen reader.
 *
 * The API is deliberately the same as the element it replaces: pass `<option>`
 * children and a `value`/`onChange`. Labels are read out of those options, so
 * the five call sites in the analytics filter bar did not have to change, and a
 * future one can be written the way anyone would expect.
 */
export function Select({
  value,
  onChange,
  children,
  className,
  disabled,
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}) {
  const options = useMemo(() => optionsFrom(children), [children]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const baseId = useId();

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const selected = options[selectedIndex];

  /* Close on a press anywhere else. `pointerdown` rather than `click` so the
     list is gone before the thing underneath reacts. */
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  /* Keep the highlighted row on screen — the country list is long enough to
     scroll, and arrowing into an option you cannot see is the same as it not
     being selected. */
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  function openAt(i: number) {
    setActive(i);
    setOpen(true);
  }

  function commit(i: number) {
    const o = options[i];
    if (o) onChange(o.value);
    setOpen(false);
    // Focus belongs back on the trigger, or a keyboard reader is left nowhere.
    triggerRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAt(selectedIndex);
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(active);
        break;
      case 'Tab':
        // Let focus leave, but do not leave a menu hanging over the page.
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${baseId}-list`}
        aria-activedescendant={open ? `${baseId}-opt-${active}` : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openAt(selectedIndex))}
        onKeyDown={onKeyDown}
        className={cn(
          'flex h-8 w-full items-center justify-between gap-2 border-b bg-transparent px-1',
          'text-left text-[12.5px] transition-colors duration-[var(--dur)] ease-[var(--ease)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          open
            ? 'border-[var(--rule-ink)] text-[var(--text)]'
            : 'border-[var(--rule-strong)] text-[var(--text-muted)] hover:border-[var(--rule-ink)] hover:text-[var(--text)]',
        )}
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <svg
          width="9"
          height="6"
          viewBox="0 0 9 6"
          aria-hidden
          className="shrink-0 transition-transform duration-[var(--dur)] ease-[var(--ease)]"
          style={{ rotate: open ? '180deg' : '0deg' }}
        >
          <path d="M0.5 1L4.5 5L8.5 1" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      {open && (
        /* Two elements, not one. The scroll lives on the inner list and the
           shadow on the outer frame, because `overflow` on either axis makes an
           element a clipping box and `box-shadow` is ink overflow — put both on
           the same node and the float shadow gets sliced off. */
        <div
          className="dropdown-panel absolute left-0 top-[calc(100%+5px)] z-30 w-max min-w-full max-w-[280px] border border-[var(--rule-mid)] bg-[var(--bg)]"
          style={{ boxShadow: 'var(--shadow-float)' }}
        >
          <ul
            ref={listRef}
            id={`${baseId}-list`}
            role="listbox"
            aria-label={ariaLabel}
            tabIndex={-1}
            className="max-h-[min(320px,58dvh)] overflow-y-auto py-1"
          >
            {options.map((o, i) => {
              const isSelected = o.value === value;
              return (
                <li
                  key={`${o.value}-${i}`}
                  id={`${baseId}-opt-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  /* `pointerdown` with the default prevented: the trigger's
                     blur must not fire before the choice is recorded. */
                  onPointerDown={(e) => {
                    e.preventDefault();
                    commit(i);
                  }}
                  onPointerEnter={() => setActive(i)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-[12.5px]',
                    i === active ? 'bg-[var(--surface-hover)]' : '',
                    isSelected ? 'text-[var(--text)]' : 'text-[var(--text-muted)]',
                  )}
                >
                  {/* A square, not a tick: the accent marks the current choice
                      the same way it marks everything else in the product. */}
                  <span
                    aria-hidden
                    className={cn(
                      'size-1.5 shrink-0',
                      isSelected ? 'bg-[var(--accent)]' : 'bg-transparent',
                    )}
                  />
                  <span className="truncate">{o.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Read `{ value, label }` off `<option>` children so the call sites keep the native shape. */
function optionsFrom(children: ReactNode): Array<{ value: string; label: string }> {
  const out: Array<{ value: string; label: string }> = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as { value?: string | number; children?: ReactNode };
    out.push({ value: String(props.value ?? ''), label: textOf(props.children) });
  });
  return out;
}

/**
 * Flatten an option's children to a string.
 *
 * Labels here are not always plain text — the link filter builds one out of a
 * slug and a title, which arrives as an array — so this walks the tree rather
 * than assuming a single string.
 */
function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return '';
}
