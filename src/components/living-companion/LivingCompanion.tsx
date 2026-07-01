'use client';

import React, { useState, useCallback } from 'react';

export type CompanionMode = 'silent' | 'text' | 'voice';

const STORAGE_KEY = 'azma.companion.mode';

function getInitialMode(): CompanionMode {
  if (typeof window === 'undefined') return 'text';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'silent' || stored === 'text' || stored === 'voice'
    ? (stored as CompanionMode)
    : 'text';
}

interface Props {
  message: string;
  visible: boolean;
}

export function LivingCompanion({ message, visible }: Props) {
  const [mode, setMode] = useState<CompanionMode>(getInitialMode);

  const changeMode = useCallback((m: CompanionMode) => {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  const showMessage = mode !== 'silent';

  return (
    <>
      <div className="companion-mode-cluster" role="group" aria-label="وضع المرافق">
        {(['silent', 'text', 'voice'] as CompanionMode[]).map((m) => (
          <button
            key={m}
            className={`companion-mode-btn ${mode === m ? 'mode-active' : ''}`}
            onClick={() => changeMode(m)}
            title={m === 'silent' ? 'صامت' : m === 'text' ? 'نصّي' : 'صوتي'}
            aria-pressed={mode === m}
          >
            {m === 'silent' ? '○' : m === 'text' ? '◉' : '◎'}
          </button>
        ))}
      </div>

      <div
        className={`companion-message-zone ${showMessage && visible && message ? 'companion-visible' : 'companion-hidden'}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {showMessage && message && (
          <>
            <span className="companion-sigil" aria-hidden="true">✦</span>
            <span className="companion-text">{message}</span>
          </>
        )}
      </div>
    </>
  );
}
