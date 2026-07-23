'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LOCALES } from './locale-registry';
import type { Locale } from './types';

interface Props {
  readonly currentLocale: Locale;
  /** Visible trigger text — the Council's ruling fixes this at "اللغة", one control only. */
  readonly triggerLabel: string;
  readonly menuLabel: string;
}

/**
 * The one selection point for the platform's language, per the
 * Council's own ruling — mounted only at the Imperial Gate, and
 * IMPERIAL DIRECTIVE (2026-07-20): a single control, not one button per
 * locale. Activating the trigger opens a small menu of every supported
 * language; choosing one sets the cookie and calls router.refresh() to
 * re-run every Server Component (the Gate, the root layout) against the
 * new locale immediately — no hard reload, no client-side language
 * state duplicated anywhere else.
 */
export function LocaleSwitcher({ currentLocale, triggerLabel, menuLabel }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<Locale | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const chooseLocale = async (locale: Locale) => {
    setOpen(false);
    if (locale === currentLocale || pending) return;
    setPending(locale);
    try {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="language-control" ref={rootRef}>
      <button
        type="button"
        className="language-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="language-menu" role="menu" aria-label={menuLabel}>
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale.id}
              type="button"
              role="menuitemradio"
              aria-checked={currentLocale === locale.id}
              className={`language-menu-item ${currentLocale === locale.id ? 'language-menu-item-active' : ''}`}
              onClick={() => chooseLocale(locale.id)}
              disabled={pending !== null}
            >
              {locale.nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
