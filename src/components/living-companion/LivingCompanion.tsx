'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useVoiceMode } from './useVoiceMode';
import { getSovereignIdentity, type ChamberContext, type SentenceRhythm } from '@/src/sovereign-identity';

export type CompanionMode = 'silent' | 'text' | 'voice';

const STORAGE_KEY = 'azma.companion.mode';

function getInitialMode(): CompanionMode {
  if (typeof window === 'undefined') return 'text';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'silent' || stored === 'text' || stored === 'voice'
    ? (stored as CompanionMode)
    : 'text';
}

/**
 * Derives speech rate/pitch from the Tongue's sentenceRhythm — a
 * mechanical mapping of an already-constitutional value onto an
 * already-existing technical parameter, not a new creative decision.
 * 'medium-deliberate' intentionally reproduces the original 0.88/0.95
 * hardcoded defaults exactly, so chambers using that rhythm sound
 * unchanged from before this Orchestrator existed.
 */
function rateAndPitchForRhythm(rhythm: SentenceRhythm): { rate: number; pitch: number } {
  switch (rhythm) {
    case 'short-decisive':    return { rate: 0.95, pitch: 0.92 };
    case 'long-measured':     return { rate: 0.82, pitch: 0.98 };
    case 'medium-deliberate':
    default:                  return { rate: 0.88, pitch: 0.95 };
  }
}

interface Props {
  message:            string;
  visible:            boolean;
  textToSpeak?:       string;
  onVoiceTranscript?: (text: string) => void;
  /** Optional. When supplied, spoken output is voiced through that chamber's Sovereign Tongue rhythm instead of the fixed default. Omitting it preserves prior behavior exactly. */
  context?:           ChamberContext;
  /** Optional. BCP-47-mapped to the voice's recognition/synthesis language ('en' -> 'en-US'). Omitting it preserves the original 'ar-SA' default exactly — only pages already carrying a resolved Creator locale should pass this. */
  locale?:            'ar' | 'en';
}

export function LivingCompanion({ message, visible, textToSpeak, onVoiceTranscript, context, locale }: Props) {
  const [mode, setMode] = useState<CompanionMode>(getInitialMode);

  // Genuinely new companion text (Vault Palace and Hujjah already change
  // `message` over time as their own state advances, not just Arrival)
  // crossfades instead of snapping — "must never feel reactive or
  // mechanical" applies to a mid-conversation content swap as much as
  // to the first appearance. Detected during render (React's own
  // documented "adjusting state when a prop changes" pattern) rather
  // than in an effect, so there's no extra client-only render pass;
  // the actual timed swap still runs from an effect below, but only
  // inside a setTimeout callback, not synchronously in the effect body.
  const [displayedMessage, setDisplayedMessage] = useState(message);
  const [isSwapping, setIsSwapping] = useState(false);
  if (message !== displayedMessage && !isSwapping) {
    setIsSwapping(true);
  }

  useEffect(() => {
    if (!isSwapping) return;
    const timeout = setTimeout(() => {
      setDisplayedMessage(message);
      setIsSwapping(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [isSwapping, message]);

  const handleTranscript = useCallback((text: string) => {
    onVoiceTranscript?.(text);
  }, [onVoiceTranscript]);

  const voiceLang = locale === 'en' ? 'en-US' : 'ar-SA';
  const { isListening, isSupported, hasPermission, startListening, speak, stopSpeaking } =
    useVoiceMode(mode === 'voice', handleTranscript, voiceLang);

  const changeMode = useCallback((m: CompanionMode) => {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
    if (m !== 'voice') stopSpeaking();
  }, [stopSpeaking]);

  useEffect(() => {
    if (mode !== 'voice' || !textToSpeak) return;
    if (!context) { speak(textToSpeak); return; }
    const { tone } = getSovereignIdentity(context);
    const { rate, pitch } = rateAndPitchForRhythm(tone.sentenceRhythm);
    speak(textToSpeak, rate, pitch);
  }, [textToSpeak, mode, speak, context]);

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
        {showMessage && displayedMessage && (
          <>
            <span className="companion-sigil" aria-hidden="true">✦</span>
            <span className={`companion-text ${isSwapping ? 'is-swapping' : ''}`}>{displayedMessage}</span>
          </>
        )}
      </div>
    </>
  );
}
