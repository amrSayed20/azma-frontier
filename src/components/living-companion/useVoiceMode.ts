import { useEffect, useRef, useCallback, useState } from 'react';

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror:  ((e: Event) => void) | null;
  onend:    (() => void) | null;
  start(): void;
  stop():  void;
  abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface VoiceModeControls {
  isListening:    boolean;
  isSupported:    boolean;
  hasPermission:  boolean | null;
  startListening: () => void;
  /** rate/pitch are optional — omitting them preserves the original 0.88/0.95 defaults exactly. */
  speak:          (text: string, rate?: number, pitch?: number) => void;
  stopSpeaking:   () => void;
}

export function useVoiceMode(
  enabled: boolean,
  onTranscript: (text: string) => void,
  /** BCP-47 tag for both recognition and synthesis. Omitting it preserves the original 'ar-SA' default exactly. */
  lang = 'ar-SA',
): VoiceModeControls {
  // Lazy initializer avoids setState-in-effect
  const [isSupported]   = useState(() => getSpeechRecognitionCtor() !== null);
  const [isListening,   setIsListening]   = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recRef = useRef<SpeechRecognitionInstance | null>(null);

  // Abort recognition when disabled; onend callback handles setIsListening(false)
  useEffect(() => {
    if (!enabled && recRef.current) {
      recRef.current.abort();
    }
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { recRef.current?.abort(); };
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const initRec = () => {
      const rec = new Ctor();
      rec.continuous     = false;
      rec.interimResults = false;
      rec.lang           = lang;

      rec.onresult = (e: SpeechRecognitionEvent) => {
        const result = e.results[0];
        if (result?.[0]) onTranscript(result[0].transcript);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend   = () => setIsListening(false);

      recRef.current = rec;
      rec.start();
      setIsListening(true);
    };

    if (hasPermission === true) { initRec(); return; }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => { setHasPermission(true); initRec(); })
      .catch(() => { setHasPermission(false); });
  }, [hasPermission, onTranscript, lang]);

  const speak = useCallback((text: string, rate = 0.88, pitch = 0.95) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;

    const utter = () => {
      synth.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang  = lang;
      utt.rate  = rate;
      utt.pitch = pitch;
      const voice = synth.getVoices().find((v) => v.lang === lang) ?? synth.getVoices().find((v) => v.lang.startsWith(lang.split('-')[0]));
      if (voice) utt.voice = voice;
      synth.speak(utt);
    };

    // Chrome loads its voice list asynchronously — calling speak() before it
    // has loaded can silently produce no audible output at all, with no
    // error thrown. If the list is still empty, wait for it once rather
    // than speaking into a voice-less void.
    if (synth.getVoices().length === 0) {
      const onVoicesChanged = () => {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        utter();
      };
      synth.addEventListener('voiceschanged', onVoicesChanged);
      return;
    }

    utter();
  }, [lang]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
  }, []);

  return { isListening, isSupported, hasPermission, startListening, speak, stopSpeaking };
}
