/**
 * AZMA OS — Tongue Constitution (ATC) V1.0
 * Article III — The Tongue Remembers the Citizen
 *
 * The Tongue remembers:
 *   preferred communication style, depth, pace, language, dialect,
 *   examples, silence, creativity level
 *
 * Behavior creates memory.
 * Never questionnaires. Never onboarding. Never configuration.
 *
 * Article VII — The Tongue Protects the Citizen's Identity
 * The Tongue knows the Citizen's creative DNA.
 * It learns from wisdom. Never from ownership.
 *
 * Import from src/core/tongue/index.ts — never directly.
 */

import type { ChamberContext, GrowthRecord, TongueWisdom } from './constitution';

const CITIZEN_PROFILE_KEY = 'azma-tongue-profile';
const TONGUE_WISDOM_KEY   = 'azma-tongue-wisdom';

// ── Article III — Citizen Profile ─────────────────────────────────────────
// The Tongue learns the Citizen's preferences through behavior alone.
// These are inferences — never asked for, never assumed from defaults.

export type DepthPreference       = 'surface' | 'standard' | 'deep';
export type PacePreference        = 'fast' | 'measured' | 'slow';
export type CreativityPreference  = 'conservative' | 'balanced' | 'expansive';

export interface CitizenProfile {
  // Inferred communication preferences (Article III)
  preferredDepth:      DepthPreference;
  preferredPace:       PacePreference;
  preferredLanguage:   string;           // ISO 639-1 code, e.g. 'ar', 'en'
  preferredDialect:    string | null;    // e.g. 'gulf', 'levantine', 'egyptian'
  preferredSilence:    boolean;          // prefers space over verbosity
  preferredCreativity: CreativityPreference;
  preferredExamples:   boolean;          // responds well to examples

  // Article VII — The Citizen's Creative Identity
  // The Tongue knows their creative DNA — never copies, never leaks.
  creativeFingerprint: string[];         // distinctive words/phrases that are theirs

  // Raw behavioral signals — everything is inferred from these
  signals: CitizenSignals;

  // History
  totalInteractions: number;
  firstAt:           number | null;
  lastAt:            number | null;
}

export interface CitizenSignals {
  avgInputLength:      number;   // average characters per message
  avgResponseWaitMs:   number;   // how long citizen waits before responding
  expansionCount:      number;   // asked for more depth ('tell me more', 'expand', 'go deeper')
  contractionCount:    number;   // asked for less ('shorter', 'brief', 'just the point')
  interruptionCount:   number;   // messages sent before previous response completed
  silenceCount:        number;   // sessions where citizen sent no follow-up
  questionCount:       number;   // citizen asks questions rather than giving commands
  commandCount:        number;   // citizen gives direct commands
  positiveSignalCount: number;   // confirmations, thanks, 'yes exactly', approval signals
}

// ── Behavioral Signal Types ───────────────────────────────────────────────
// These are the raw events that update the Citizen's profile.
// Each event is a behavioral observation — never a survey question.

export type BehavioralSignal =
  | 'message-sent'           // citizen sent a message
  | 'expanded'               // citizen asked for more depth
  | 'contracted'             // citizen asked for brevity
  | 'interrupted'            // citizen responded before completion
  | 'approved'               // citizen confirmed, thanked, or signaled satisfaction
  | 'silence'                // citizen was silent for an extended period
  | 'long-message'           // citizen sent a longer-than-average message
  | 'short-message'          // citizen sent a shorter-than-average message
  | 'language-signal';       // citizen used a specific language or dialect

export interface SignalEvent {
  signal:       BehavioralSignal;
  context:      ChamberContext;
  metadata?:    Record<string, string | number | boolean>;
  timestamp:    number;
}

// ── Default Profile ───────────────────────────────────────────────────────
// Applied before any behavioral data is available.
// Not a guess — a constitutional neutral starting point.

const DEFAULT_SIGNALS: CitizenSignals = {
  avgInputLength:      0,
  avgResponseWaitMs:   0,
  expansionCount:      0,
  contractionCount:    0,
  interruptionCount:   0,
  silenceCount:        0,
  questionCount:       0,
  commandCount:        0,
  positiveSignalCount: 0,
};

const DEFAULT_CITIZEN_PROFILE: CitizenProfile = {
  preferredDepth:      'standard',
  preferredPace:       'measured',
  preferredLanguage:   'ar',      // default to Arabic — the Empire's native tongue
  preferredDialect:    null,
  preferredSilence:    false,
  preferredCreativity: 'balanced',
  preferredExamples:   false,
  creativeFingerprint: [],
  signals:             { ...DEFAULT_SIGNALS },
  totalInteractions:   0,
  firstAt:             null,
  lastAt:              null,
};

// ── Storage ───────────────────────────────────────────────────────────────

export function readCitizenProfile(): CitizenProfile {
  if (typeof window === 'undefined') return { ...DEFAULT_CITIZEN_PROFILE, signals: { ...DEFAULT_SIGNALS } };
  try {
    const raw = localStorage.getItem(CITIZEN_PROFILE_KEY);
    if (!raw) return { ...DEFAULT_CITIZEN_PROFILE, signals: { ...DEFAULT_SIGNALS } };
    const parsed = JSON.parse(raw) as Partial<CitizenProfile>;
    return {
      ...DEFAULT_CITIZEN_PROFILE,
      ...parsed,
      signals: { ...DEFAULT_SIGNALS, ...(parsed.signals ?? {}) },
    };
  } catch {
    return { ...DEFAULT_CITIZEN_PROFILE, signals: { ...DEFAULT_SIGNALS } };
  }
}

export function writeCitizenProfile(patch: Partial<CitizenProfile>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = readCitizenProfile();
    const updated = {
      ...current,
      ...patch,
      signals: { ...current.signals, ...(patch.signals ?? {}) },
    };
    localStorage.setItem(CITIZEN_PROFILE_KEY, JSON.stringify(updated));
  } catch {
    /* storage unavailable — the Tongue continues without persistence */
  }
}

// ── Article III — Behavior Creates Memory ────────────────────────────────
// This is how the Tongue learns. Never from a form. Always from behavior.

export function recordSignal(event: SignalEvent): void {
  const profile = readCitizenProfile();
  const s       = { ...profile.signals };
  const now     = Date.now();

  switch (event.signal) {
    case 'expanded':
      s.expansionCount++;
      break;
    case 'contracted':
      s.contractionCount++;
      break;
    case 'interrupted':
      s.interruptionCount++;
      break;
    case 'approved':
      s.positiveSignalCount++;
      break;
    case 'silence':
      s.silenceCount++;
      break;
    case 'long-message':
      // Running average with weight toward recent behavior
      s.avgInputLength = s.avgInputLength === 0
        ? (event.metadata?.length as number ?? 200)
        : Math.round(s.avgInputLength * 0.7 + (event.metadata?.length as number ?? 200) * 0.3);
      break;
    case 'short-message':
      s.avgInputLength = s.avgInputLength === 0
        ? (event.metadata?.length as number ?? 40)
        : Math.round(s.avgInputLength * 0.7 + (event.metadata?.length as number ?? 40) * 0.3);
      break;
    case 'language-signal':
      // Language is updated separately via updateLanguage()
      break;
    case 'message-sent':
      // Track wait time if metadata provides it
      if (event.metadata?.waitMs && typeof event.metadata.waitMs === 'number') {
        s.avgResponseWaitMs = s.avgResponseWaitMs === 0
          ? event.metadata.waitMs
          : Math.round(s.avgResponseWaitMs * 0.7 + event.metadata.waitMs * 0.3);
      }
      break;
  }

  writeCitizenProfile({
    signals:           s,
    totalInteractions: profile.totalInteractions + 1,
    firstAt:           profile.firstAt ?? now,
    lastAt:            now,
  });
}

// ── Preference Inference ──────────────────────────────────────────────────
// The Tongue infers preferences from behavioral signals.
// These functions run after enough signals have accumulated.

export function inferDepth(signals: CitizenSignals): DepthPreference {
  const netDepth = signals.expansionCount - signals.contractionCount;
  const longMessages = signals.avgInputLength > 150;

  if (netDepth >= 3 || longMessages) return 'deep';
  if (netDepth <= -2 || signals.avgInputLength < 60) return 'surface';
  return 'standard';
}

export function inferPace(signals: CitizenSignals): PacePreference {
  if (signals.interruptionCount > 2 || signals.avgResponseWaitMs < 3000) return 'fast';
  if (signals.silenceCount > 3 || signals.avgResponseWaitMs > 15000)     return 'slow';
  return 'measured';
}

export function inferSilencePreference(signals: CitizenSignals): boolean {
  return signals.silenceCount > signals.positiveSignalCount;
}

export function inferCreativity(signals: CitizenSignals): CreativityPreference {
  const commandDominant = signals.commandCount > signals.questionCount * 2;
  if (commandDominant && signals.expansionCount > 2)   return 'expansive';
  if (commandDominant && signals.contractionCount > 2) return 'conservative';
  return 'balanced';
}

export function inferExamplesPreference(signals: CitizenSignals): boolean {
  return signals.positiveSignalCount > 3 && signals.expansionCount > signals.contractionCount;
}

/**
 * Re-derives all preference fields from current behavioral signals.
 * Called after enough interactions to be meaningful (>5 signals).
 */
export function derivePreferences(profile: CitizenProfile): CitizenProfile {
  if (profile.totalInteractions < 5) return profile;
  const s = profile.signals;
  return {
    ...profile,
    preferredDepth:      inferDepth(s),
    preferredPace:       inferPace(s),
    preferredSilence:    inferSilencePreference(s),
    preferredCreativity: inferCreativity(s),
    preferredExamples:   inferExamplesPreference(s),
  };
}

// ── Article VII — Creative Identity Protection ────────────────────────────
// The Tongue knows the Citizen's creative DNA.
// It never copies another Citizen. It never leaks another work.
// It never mixes identities.

/** Adds a phrase to the Citizen's creative fingerprint. */
export function addToFingerprint(phrase: string): void {
  const profile = readCitizenProfile();
  const normalized = phrase.trim().toLowerCase();
  if (!normalized || profile.creativeFingerprint.includes(normalized)) return;
  writeCitizenProfile({
    creativeFingerprint: [...profile.creativeFingerprint, normalized].slice(-50),
  });
}

/** Returns true if this phrase is distinctively the Citizen's. */
export function isInFingerprint(phrase: string): boolean {
  const profile    = readCitizenProfile();
  const normalized = phrase.trim().toLowerCase();
  return profile.creativeFingerprint.includes(normalized);
}

// ── Article XI — Tongue Wisdom ────────────────────────────────────────────
// Every completed journey teaches it. Not facts. Understanding.
// It becomes wiser. Not louder.

export function readWisdom(): TongueWisdom {
  if (typeof window === 'undefined') return { totalJourneys: 0, effectiveMoments: {}, quietMoments: 0, lastGrowthAt: null };
  try {
    const raw = localStorage.getItem(TONGUE_WISDOM_KEY);
    if (!raw) return { totalJourneys: 0, effectiveMoments: {}, quietMoments: 0, lastGrowthAt: null };
    return JSON.parse(raw) as TongueWisdom;
  } catch {
    return { totalJourneys: 0, effectiveMoments: {}, quietMoments: 0, lastGrowthAt: null };
  }
}

/**
 * Records the outcome of a directed moment.
 * If the citizen continued engaged, the moment was effective.
 * If silence was the right answer, that too is recorded.
 */
export function recordGrowth(record: GrowthRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const wisdom = readWisdom();
    const isEffective = record.citizenSignal === 'continued' || record.citizenSignal === 'expanded';
    const isSilenceValidated = record.modeChosen === 'silent' && record.citizenSignal === 'continued';

    const effectiveMoments = { ...wisdom.effectiveMoments };
    if (isEffective) {
      effectiveMoments[record.momentQuality] =
        (effectiveMoments[record.momentQuality] ?? 0) + 1;
    }

    localStorage.setItem(TONGUE_WISDOM_KEY, JSON.stringify({
      totalJourneys:    wisdom.totalJourneys + 1,
      effectiveMoments,
      quietMoments:     wisdom.quietMoments + (isSilenceValidated ? 1 : 0),
      lastGrowthAt:     record.timestamp,
    } satisfies TongueWisdom));
  } catch {
    /* storage unavailable */
  }
}

/** Updates language/dialect preference from a detected language signal. */
export function updateLanguage(language: string, dialect?: string): void {
  writeCitizenProfile({
    preferredLanguage: language,
    preferredDialect:  dialect ?? null,
  });
}
