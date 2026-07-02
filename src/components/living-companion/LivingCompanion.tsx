'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useVoiceMode } from './useVoiceMode';

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
  message:            string;
  visible:            boolean;
  textToSpeak?:       string;
  onVoiceTranscript?: (text: string) => void;
}

export function LivingCompanion({ message, visible, textToSpeak, onVoiceTranscript }: Props) {
  const [mode, setMode] = useState<CompanionMode>(getInitialMode);

  const handleTranscript = useCallback((text: string) => {
    onVoiceTranscript?.(text);
  }, [onVoiceTranscript]);

  const { isListening, isSupported, hasPermission, startListening, speak, stopSpeaking } =
    useVoiceMode(mode === 'voice', handleTranscript);

  const changeMode = useCallback((m: CompanionMode) => {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
    if (m !== 'voice') stopSpeaking();
  }, [stopSpeaking]);

  useEffect(() => {
    if (mode === 'voice' && textToSpeak) speak(textToSpeak);
  }, [textToSpeak, mode, speak]);

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

      {mode === 'voice' && (
        <div className="companion-voice-zone">
          {hasPermission === false && (
            <span className="voice-permission-denied">يلزم الإذن بالميكروفون</span>
          )}
          {hasPermission !== false && !isListening && (
            <button
              className="voice-listen-btn"
              onClick={startListening}
              title="ابدأ الاستماع"
              aria-label="تفعيل الاستماع الصوتي"
              disabled={!isSupported}
            >
              ⬤ استمع
            </button>
          )}
          {isListening && (
            <span className="voice-listening-indicator" aria-live="polite">
              <span className="voice-pulse" aria-hidden="true" />
              يستمع…
            </span>
          )}
        </div>
      )}

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
