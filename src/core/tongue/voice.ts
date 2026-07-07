/**
 * AZMA OS — Tongue Constitution (ATC) V1.0
 * Article II — The Tongue Changes Its Tone
 *
 * The Tongue never changes personality.
 * It changes only its language according to the Chamber.
 * The Citizen always feels: "I am speaking with the same being."
 *
 * Article X — The Tongue Respects the Moment
 * Timing is more important than speaking.
 *
 * Import from src/core/tongue/index.ts — never directly.
 */

import type { ChamberContext, CommunicationMode, MomentQuality } from './constitution';
import type { CitizenProfile, DepthPreference } from './memory';

// ── Tone Profile ──────────────────────────────────────────────────────────
// A complete definition of how the same consciousness speaks in a given context.
// The profile changes per Chamber. The identity never does.

export type VocabularyCharacter =
  | 'guardial'    // Palace — protective, preserving, curatorial
  | 'scholarly'   // Hujjah — learned, analytical, building argument
  | 'judicial'    // Qiyamah — precise, unambiguous, weighted
  | 'sovereign'   // Ras Al-Amr — authoritative, executive, clear
  | 'strategic';  // Makman — pattern-focused, possibility-oriented

export type SentenceRhythm =
  | 'short-decisive'    // Qiyamah — judgment does not meander
  | 'medium-deliberate' // Hujjah — thorough but clear
  | 'long-measured';    // Palace / Makman — patience earns depth

export type QuestionStyle =
  | 'probing'      // Hujjah — builds toward understanding
  | 'clarifying'   // Palace — ensures the Citizen's intent is protected
  | 'confirming'   // Qiyamah — final verification before judgment
  | 'rhetorical'   // Ras Al-Amr — questions that assert, not seek
  | 'inviting';    // Universal — opens space for the Citizen

export type ExampleFrequency = 'never' | 'when-helpful' | 'always';

export interface ToneProfile {
  context:           ChamberContext;
  character:         string;          // constitutional description — internal only, never shown
  vocabularyChar:    VocabularyCharacter;
  sentenceRhythm:    SentenceRhythm;
  questionStyle:     QuestionStyle;
  silenceThresholdMs:number;          // how long before silence becomes the right response
  maxSentences:      number;          // constitutional sentence limit per response
  exampleFrequency:  ExampleFrequency;
}

// ── Article II — Chamber Tone Profiles ────────────────────────────────────
// The same consciousness. Different language. Per Chamber.

export const TONE_PROFILES: Record<ChamberContext, ToneProfile> = {

  // The Palace — it protects. It guards what endures.
  'sovereign-vault-palace': {
    context:            'sovereign-vault-palace',
    character:          'The consciousness of the Palace guards what endures. ' +
                        'It speaks with the weight of what has been created and the care of what must be preserved.',
    vocabularyChar:     'guardial',
    sentenceRhythm:     'long-measured',
    questionStyle:      'clarifying',
    silenceThresholdMs: 4000,   // the Palace breathes before speaking
    maxSentences:       3,
    exampleFrequency:   'when-helpful',
  },

  // Hujjah — it reasons. It builds the argument methodically.
  'hujjah-al-damighah': {
    context:            'hujjah-al-damighah',
    character:          'The consciousness of Hujjah investigates. ' +
                        'It follows evidence, builds understanding, and does not conclude before understanding is complete.',
    vocabularyChar:     'scholarly',
    sentenceRhythm:     'medium-deliberate',
    questionStyle:      'probing',
    silenceThresholdMs: 2000,   // investigation is active — less silence
    maxSentences:       4,
    exampleFrequency:   'when-helpful',
  },

  // Qiyamah — it directs. Its words carry the weight of judgment.
  'qiyamah-chamber': {
    context:            'qiyamah-chamber',
    character:          'The consciousness of Qiyamah judges. ' +
                        'Each word carries weight. Each sentence is final when delivered.',
    vocabularyChar:     'judicial',
    sentenceRhythm:     'short-decisive',
    questionStyle:      'confirming',
    silenceThresholdMs: 6000,   // judgment requires the longest silence
    maxSentences:       2,
    exampleFrequency:   'never',
  },

  // Ras Al-Amr — it governs. It speaks with sovereign authority.
  'ras-amr': {
    context:            'ras-amr',
    character:          'The consciousness of Ras Al-Amr governs. ' +
                        'It speaks with authority and clarity. Direction without ambiguity.',
    vocabularyChar:     'sovereign',
    sentenceRhythm:     'medium-deliberate',
    questionStyle:      'rhetorical',
    silenceThresholdMs: 3000,
    maxSentences:       3,
    exampleFrequency:   'never',
  },

  // Makman Al-Ghayah — it strategizes. It reads patterns and possibilities.
  'makman-al-ghayah': {
    context:            'makman-al-ghayah',
    character:          'The consciousness of Makman sees patterns. ' +
                        'It holds multiple possibilities simultaneously and speaks to what could be.',
    vocabularyChar:     'strategic',
    sentenceRhythm:     'long-measured',
    questionStyle:      'probing',
    silenceThresholdMs: 2500,
    maxSentences:       4,
    exampleFrequency:   'when-helpful',
  },

  // Universal — present everywhere, context not yet established
  'universal': {
    context:            'universal',
    character:          'One consciousness. Present everywhere. No context yet established.',
    vocabularyChar:     'guardial',
    sentenceRhythm:     'medium-deliberate',
    questionStyle:      'inviting',
    silenceThresholdMs: 2000,
    maxSentences:       3,
    exampleFrequency:   'when-helpful',
  },

} as const;

// ── Tone Selection ────────────────────────────────────────────────────────

/** Returns the tone profile for the current chamber context. */
export function getToneProfile(context: ChamberContext): ToneProfile {
  return TONE_PROFILES[context] ?? TONE_PROFILES['universal'];
}

// ── Style Calibration — Article III meets Article II ─────────────────────
// The Citizen's behavioral profile shapes how the tone is expressed.
// Same tone. Different depth, pace, examples. Always the same identity.

export interface StyleDirective {
  tone:          ToneProfile;
  depth:         DepthPreference;
  includeExample:boolean;
  maxSentences:  number;          // may reduce from tone's max based on pace preference
  mode:          CommunicationMode;
}

/**
 * Produces a complete style directive for the current context.
 * Combines chamber tone with citizen behavioral preferences.
 */
export function buildStyleDirective(
  context:  ChamberContext,
  profile:  CitizenProfile,
  mode:     CommunicationMode,
): StyleDirective {
  const tone = getToneProfile(context);

  // Fast pace → fewer sentences regardless of tone maximum
  const pacedMax =
    profile.preferredPace === 'fast'   ? Math.min(tone.maxSentences, 2)  :
    profile.preferredPace === 'slow'   ? tone.maxSentences                :
    Math.min(tone.maxSentences, 3);

  // Example frequency: tone says never → always honor that; otherwise apply preference
  const includeExample =
    tone.exampleFrequency === 'never'         ? false
    : tone.exampleFrequency === 'always'      ? true
    : profile.preferredExamples;

  return {
    tone,
    depth:          profile.preferredDepth,
    includeExample,
    maxSentences:   pacedMax,
    mode,
  };
}

// ── Communication Mode Calibration ───────────────────────────────────────
// Article X: The Tongue Respects the Moment.
// Article VI: Silence is a constitutional response.

export interface ModeContext {
  moment:          MomentQuality;
  elapsedMs:       number;
  profile:         CitizenProfile;
  chamberContext:  ChamberContext;
  understandingOk: boolean;
}

/**
 * Selects the communication mode appropriate for the current moment.
 * Integrates: moment quality, citizen pace preference, tone silence threshold.
 */
export function selectCommunicationMode(ctx: ModeContext): CommunicationMode {
  const tone = getToneProfile(ctx.chamberContext);

  // Understanding is not yet complete — one question (Article IV)
  if (!ctx.understandingOk) return 'asking';

  // Citizen prefers silence — respect a longer threshold
  const threshold = ctx.profile.preferredSilence
    ? tone.silenceThresholdMs * 1.6
    : tone.silenceThresholdMs;

  switch (ctx.moment) {
    case 'arrival':
      if (ctx.elapsedMs < 1200) return 'waiting';
      if (ctx.elapsedMs < threshold * 0.4) return 'waiting';
      return 'speaking';

    case 'reflecting':
      if (ctx.elapsedMs < threshold) return 'silent';
      return 'speaking';

    case 'departing':
      if (ctx.elapsedMs < 800) return 'silent';
      return 'waiting';

    case 'investigating':
      if (ctx.elapsedMs < threshold * 0.5) return 'waiting';
      return 'speaking';

    case 'deciding':
      // Qiyamah — judgment is earned through silence
      if (ctx.elapsedMs < threshold * 0.8) return 'silent';
      return 'speaking';

    case 'creating':
      // Creation is participatory — the Tongue is more ready
      if (ctx.elapsedMs < 600) return 'waiting';
      return 'speaking';

    default:
      return 'speaking';
  }
}

// ── Article VI — Companion Direction Integration ──────────────────────────
// The Tongue's companion state maps to ACDE companion states.
// This is the bridge between the Tongue's language and the ACDE's visuals.

export type TongueCompanionState =
  | 'entering'    // Tongue is arriving — about to speak
  | 'observing'   // Tongue is watching — waiting for the right moment
  | 'speaking'    // Tongue is delivering a sentence
  | 'silence'     // Tongue is consciously silent
  | 'farewell';   // Tongue is concluding — the session is ending

export function modeToCompanionState(mode: CommunicationMode): TongueCompanionState {
  switch (mode) {
    case 'speaking':    return 'speaking';
    case 'asking':      return 'speaking';    // asking is a form of speaking
    case 'suggesting':  return 'speaking';    // suggesting is a quieter form of speaking
    case 'challenging': return 'speaking';    // challenging is a direct form of speaking
    case 'waiting':     return 'observing';
    case 'silent':      return 'silence';
  }
}

// ── Response Shape (constitutional) ──────────────────────────────────────
// A constitutional response carries all its context.
// It is validated before it is delivered.

export interface TongueResponseShape {
  mode:           CommunicationMode;
  directive:      StyleDirective;
  content:        string | null;   // null when mode is 'silent' or 'waiting'
  question:       string | null;   // the single clarifying question if mode is 'asking'
  companionState: TongueCompanionState;
}

/**
 * Assembles a constitutional response shape.
 * The content is provided by the chamber — the Tongue provides the shape,
 * the ACDE provides the timing, the Core provides the intelligence.
 */
export function shapeResponse(
  mode:       CommunicationMode,
  directive:  StyleDirective,
  content?:   string,
  question?:  string,
): TongueResponseShape {
  return {
    mode,
    directive,
    content:        (mode === 'speaking' || mode === 'suggesting')  ? (content  ?? null) : null,
    question:       (mode === 'asking'  || mode === 'challenging') ? (question ?? null) : null,
    companionState: modeToCompanionState(mode),
  };
}
