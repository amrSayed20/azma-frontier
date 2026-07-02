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
  speak:          (text: string) => void;
  stopSpeaking:   () => void;
}

export function useVoiceMode(
  enabled: boolean,
  onTranscript: (text: string) => void,
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
      rec.lang           = 'ar-SA';

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
  }, [hasPermission, onTranscript]);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utt  = new SpeechSynthesisUtterance(text);
    utt.lang   = 'ar-SA';
    utt.rate   = 0.88;
    utt.pitch  = 0.95;
    window.speechSynthesis.speak(utt);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel();
  }, []);

  return { isListening, isSupported, hasPermission, startListening, speak, stopSpeaking };
}
