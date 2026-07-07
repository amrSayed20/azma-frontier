/**
 * AZMA OS — Imperial Interaction Engine (AIIE) V1.0
 * The Constitutional Language of Interaction
 *
 * Articles I–XIII
 *
 * This is NOT a button system. This is NOT a component library.
 * This is the constitutional interaction language of AZMA OS.
 * Every touch must feel like touching the Empire itself.
 *
 * Import from src/design-system/index.ts — never directly.
 */

// ── Article II — Interaction Intentions ──────────────────────────────────
// Before any interaction begins, the Engine must determine:
// "What does this interaction represent?"
// The behavior follows the meaning. Never the appearance.

export type InteractionIntent =
  | 'authority'     // sovereign command — the citizen directs the Empire
  | 'decision'      // choosing between paths — a meaningful crossroads
  | 'confirmation'  // affirming what has already been chosen
  | 'discovery'     // finding something not yet known — exploratory trust
  | 'exploration'   // browsing possibilities without yet committing
  | 'protection'    // guarding what matters — a defensive, considered gesture
  | 'creation'      // bringing something into existence — generative
  | 'reflection';   // reviewing what has been — contemplative weight

// ── Article IV — Physical Weight ─────────────────────────────────────────
// Interactions must feel physical. Not pixels. Material.

export type InteractionWeight =
  | 'sovereign'    // heaviest — final, binding, carries the most consequence
  | 'decisive'     // heavy — significant, a choice that matters
  | 'standard'     // balanced — normal, the constitutional default
  | 'exploratory'  // light — browsing, non-committal
  | 'ambient';     // lightest — incidental, atmospheric, nearly imperceptible

// ── Article V — Rhythm Phases ─────────────────────────────────────────────
// Every interaction has five phases.
// Together they form a complete conversation.

export type RhythmPhase =
  | 'recognition'   // the Empire feels the touch immediately
  | 'acceptance'    // the action is received and understood
  | 'execution'     // the action is being carried out
  | 'completion'    // the action is complete — settles into place
  | 'silence';      // the Empire rests — the conversation has a natural pause

// ── Article VI — Interaction States (the Handshake) ──────────────────────

export type InteractionState =
  | 'resting'     // idle — ready for the Citizen
  | 'touched'     // recognition — immediate acknowledgment of contact
  | 'active'      // acceptance + execution — action is in progress
  | 'completing'  // completion — settling into the result
  | 'complete'    // done — resting after success
  | 'failed'      // Article VIII — could not complete, with dignity
  | 'restricted'; // Article VIII — available but requires a different path

// ── Constitutional Rhythm Timing ──────────────────────────────────────────

export interface RhythmTiming {
  recognitionMs:  number;  // time from touch to first acknowledgment (must be immediate)
  acceptanceMs:   number;  // time from recognition to "received" visual state
  executionMs:    number;  // duration of the execution phase
  completionMs:   number;  // time for the completion settle
  silenceMs:      number;  // rest period after completion
}

// ── Article VII — Feedback Character ─────────────────────────────────────
// The Empire never shouts. Confidence is quiet.

export interface FeedbackCharacter {
  visual:   'none' | 'subtle' | 'clear' | 'prominent';
  haptic:   'none' | 'light' | 'medium' | 'firm';
  auditory: 'none' | 'ambient' | 'present';
  scale:    number;   // CSS scale on press (0.970–0.997)
  lift:     string;   // CSS translateY — negative = up, positive = down (sovereign grounds)
}

// ── Full Intent Constitution ──────────────────────────────────────────────

export interface IntentConstitution {
  intent:     InteractionIntent;
  weight:     InteractionWeight;
  rhythm:     RhythmTiming;
  feedback:   FeedbackCharacter;
  reversible: boolean;   // false = irreversible — heavier visual treatment
}

// ── Article IX — Interaction Memory ──────────────────────────────────────
// Behavior teaches. Configuration never does.

export interface InteractionSignals {
  avgDecisionTimeMs:    number;   // weighted average: how long before acting
  confirmationRequests: number;   // how often the citizen pauses before sovereign actions
  explorationRatio:     number;   // 0–1: browsing vs. directed navigation
  undoCount:            number;   // how often the citizen reverses an action
  sovereignHesitationMs: number;  // specifically for authority-intent interactions
}

export interface InteractionProfile {
  preferredSpeed:        'immediate' | 'measured' | 'deliberate';
  preferredPrecision:    'broad' | 'targeted' | 'exact';
  preferredConfirmation: 'never' | 'significant' | 'always';
  preferredNavStyle:     'direct' | 'exploratory' | 'guided';
  preferredDepth:        'surface' | 'standard' | 'deep';
  signals:               InteractionSignals;
  totalInteractions:     number;
}

// ── Article IX — Signal Events ────────────────────────────────────────────

export type InteractionSignalType =
  | 'decision-complete'   // citizen completed a directed interaction
  | 'sovereign-complete'  // citizen completed an authority-intent interaction
  | 'undo'                // citizen reversed an action
  | 'exploration'         // citizen browsed without committing
  | 'abandonment';        // citizen began an interaction but withdrew

export interface InteractionSignalEvent {
  type:       InteractionSignalType;
  intent:     InteractionIntent;
  durationMs: number;
}

// ── Article II — Intent Registry ─────────────────────────────────────────
// The constitutional properties of every possible interaction.
// The behavior follows the meaning. Never the appearance.

export const INTENT_REGISTRY: Record<InteractionIntent, IntentConstitution> = {
  authority: {
    intent: 'authority',
    weight: 'sovereign',
    rhythm: {
      recognitionMs: 60,
      acceptanceMs:  140,
      executionMs:   300,
      completionMs:  500,
      silenceMs:     320,
    },
    feedback: {
      visual:   'prominent',
      haptic:   'firm',
      auditory: 'none',
      scale:    0.970,
      lift:     '1px',    // authority grounds — presses DOWN, not up
    },
    reversible: false,
  },

  decision: {
    intent: 'decision',
    weight: 'decisive',
    rhythm: {
      recognitionMs: 60,
      acceptanceMs:  120,
      executionMs:   240,
      completionMs:  400,
      silenceMs:     200,
    },
    feedback: {
      visual:   'clear',
      haptic:   'medium',
      auditory: 'none',
      scale:    0.978,
      lift:     '-1px',
    },
    reversible: true,
  },

  confirmation: {
    intent: 'confirmation',
    weight: 'decisive',
    rhythm: {
      recognitionMs: 50,
      acceptanceMs:  100,
      executionMs:   180,
      completionMs:  320,
      silenceMs:     160,
    },
    feedback: {
      visual:   'clear',
      haptic:   'medium',
      auditory: 'none',
      scale:    0.980,
      lift:     '-1px',
    },
    reversible: false,
  },

  protection: {
    intent: 'protection',
    weight: 'decisive',
    rhythm: {
      recognitionMs: 70,
      acceptanceMs:  160,
      executionMs:   320,
      completionMs:  480,
      silenceMs:     280,
    },
    feedback: {
      visual:   'prominent',
      haptic:   'firm',
      auditory: 'none',
      scale:    0.975,
      lift:     '0px',    // protection holds its ground — no movement
    },
    reversible: false,
  },

  creation: {
    intent: 'creation',
    weight: 'standard',
    rhythm: {
      recognitionMs: 50,
      acceptanceMs:  100,
      executionMs:   200,
      completionMs:  360,
      silenceMs:     160,
    },
    feedback: {
      visual:   'clear',
      haptic:   'light',
      auditory: 'none',
      scale:    0.985,
      lift:     '-2px',
    },
    reversible: true,
  },

  reflection: {
    intent: 'reflection',
    weight: 'standard',
    rhythm: {
      recognitionMs: 80,
      acceptanceMs:  160,
      executionMs:   280,
      completionMs:  440,
      silenceMs:     240,
    },
    feedback: {
      visual:   'subtle',
      haptic:   'light',
      auditory: 'none',
      scale:    0.988,
      lift:     '-1px',
    },
    reversible: true,
  },

  exploration: {
    intent: 'exploration',
    weight: 'exploratory',
    rhythm: {
      recognitionMs: 40,
      acceptanceMs:  80,
      executionMs:   160,
      completionMs:  240,
      silenceMs:     80,
    },
    feedback: {
      visual:   'subtle',
      haptic:   'light',
      auditory: 'none',
      scale:    0.992,
      lift:     '-2px',
    },
    reversible: true,
  },

  discovery: {
    intent: 'discovery',
    weight: 'exploratory',
    rhythm: {
      recognitionMs: 40,
      acceptanceMs:  90,
      executionMs:   180,
      completionMs:  280,
      silenceMs:     120,
    },
    feedback: {
      visual:   'subtle',
      haptic:   'light',
      auditory: 'none',
      scale:    0.992,
      lift:     '-2px',
    },
    reversible: true,
  },
} as const;

// ── Article XI — ACLE Family to Intent Bridge ─────────────────────────────
// Every ACLE element family has a constitutional interaction intent.
// This is the bridge between the architectural language and the interaction language.

const ACLE_TO_INTENT: Record<string, InteractionIntent> = {
  'sovereign-action': 'authority',
  'verdict':          'decision',
  'seal':             'protection',
  'portal':           'exploration',
  'path':             'exploration',
  'guide':            'discovery',
  'vessel':           'creation',
  'record':           'reflection',
  'declaration':      'confirmation',
  'indicator':        'reflection',
} as const;

export function getIntentForACLEFamily(family: string): InteractionIntent {
  return ACLE_TO_INTENT[family] ?? 'exploration';
}

// ── Article II — Constitutional Registry Accessor ─────────────────────────

export function getIntentConstitution(intent: InteractionIntent): IntentConstitution {
  return INTENT_REGISTRY[intent];
}

// ── Article IX — Interaction Profile Storage ──────────────────────────────

const PROFILE_KEY = 'azma-interaction-profile';

function defaultProfile(): InteractionProfile {
  return {
    preferredSpeed:        'measured',
    preferredPrecision:    'targeted',
    preferredConfirmation: 'significant',
    preferredNavStyle:     'direct',
    preferredDepth:        'standard',
    signals: {
      avgDecisionTimeMs:    0,
      confirmationRequests: 0,
      explorationRatio:     0.5,
      undoCount:            0,
      sovereignHesitationMs: 0,
    },
    totalInteractions: 0,
  };
}

export function readInteractionProfile(): InteractionProfile {
  if (typeof window === 'undefined') return defaultProfile();
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as InteractionProfile) : defaultProfile();
  } catch {
    return defaultProfile();
  }
}

export function writeInteractionProfile(profile: InteractionProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* localStorage unavailable — interaction memory continues without persistence */
  }
}

// ── Article IX — Signal Recording ────────────────────────────────────────
// Behavior teaches. The Engine learns quietly.

function weighted(current: number, next: number): number {
  if (current === 0) return next;
  return current * 0.70 + next * 0.30;
}

export function recordInteractionSignal(event: InteractionSignalEvent): void {
  const profile  = readInteractionProfile();
  const { signals } = profile;

  switch (event.type) {
    case 'decision-complete':
      signals.avgDecisionTimeMs = weighted(signals.avgDecisionTimeMs, event.durationMs);
      signals.explorationRatio  = weighted(signals.explorationRatio, 0);
      break;
    case 'sovereign-complete':
      signals.sovereignHesitationMs = weighted(signals.sovereignHesitationMs, event.durationMs);
      signals.avgDecisionTimeMs     = weighted(signals.avgDecisionTimeMs, event.durationMs);
      signals.explorationRatio      = weighted(signals.explorationRatio, 0);
      break;
    case 'undo':
      signals.undoCount++;
      break;
    case 'exploration':
      signals.explorationRatio = weighted(signals.explorationRatio, 1);
      break;
    case 'abandonment':
      signals.explorationRatio = weighted(signals.explorationRatio, 0.5);
      break;
  }

  profile.totalInteractions++;
  writeInteractionProfile(profile);
}

// ── Article X — Preference Derivation ────────────────────────────────────
// After sufficient interactions, the Engine infers the citizen's preferences.

export function deriveInteractionPreferences(profile: InteractionProfile): Partial<InteractionProfile> {
  const { signals, totalInteractions } = profile;
  if (totalInteractions < 5) return {};

  const preferredSpeed: InteractionProfile['preferredSpeed'] =
    signals.avgDecisionTimeMs < 300  ? 'immediate'  :
    signals.avgDecisionTimeMs > 1500 ? 'deliberate' :
    'measured';

  const preferredConfirmation: InteractionProfile['preferredConfirmation'] =
    (signals.undoCount / totalInteractions) > 0.20 ? 'always'      :
    signals.sovereignHesitationMs > 2000            ? 'significant' :
    'never';

  const preferredNavStyle: InteractionProfile['preferredNavStyle'] =
    signals.explorationRatio > 0.65 ? 'exploratory' :
    signals.explorationRatio < 0.30 ? 'direct'      :
    'guided';

  return { preferredSpeed, preferredConfirmation, preferredNavStyle };
}

// ── Article X — CSS Adaptation ────────────────────────────────────────────
// Frequently repeated interactions become smoother.
// Frequently ignored interactions become quieter.
// The Citizen does not configure this. The Empire learns.

export function applyAdaptation(profile: InteractionProfile): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Speed: faster citizens get faster recognition; deliberate citizens get more time
  const speedMult =
    profile.preferredSpeed === 'immediate'  ? 0.72 :
    profile.preferredSpeed === 'deliberate' ? 1.40 :
    1.00;
  root.style.setProperty('--aiie-speed-mult', String(speedMult));

  // Confirmation: citizens who reverse frequently get a sovereign pause
  const sovereignPause =
    profile.preferredConfirmation === 'always'      ? '600ms' :
    profile.preferredConfirmation === 'significant' ? '200ms' :
    '0ms';
  root.style.setProperty('--aiie-sovereign-pause', sovereignPause);

  // Feedback intensity: explorers see more feedback; directed citizens see less noise
  const feedbackIntensity =
    profile.preferredNavStyle === 'exploratory' ? 1.3 :
    profile.preferredNavStyle === 'direct'      ? 0.7 :
    1.0;
  root.style.setProperty('--aiie-feedback-intensity', String(feedbackIntensity));
}

// ── Article VI + III — Interaction State Machine ──────────────────────────
// The Citizen never wonders: "Did the system receive my action?"
// Every interaction must acknowledge receipt immediately.

const VALID_TRANSITIONS: Record<InteractionState, readonly InteractionState[]> = {
  resting:    ['touched', 'restricted'],
  touched:    ['active', 'resting'],    // 'resting' = cancel before executing
  active:     ['completing', 'failed'],
  completing: ['complete'],
  complete:   ['resting'],
  failed:     ['resting'],
  restricted: ['resting'],
} as const;

function getCurrentState(el: HTMLElement): InteractionState {
  return (el.getAttribute('data-interaction-state') as InteractionState | null) ?? 'resting';
}

export function setInteractionState(el: HTMLElement, state: InteractionState): void {
  const current = getCurrentState(el);
  if (!(VALID_TRANSITIONS[current] as readonly string[]).includes(state)) return;

  el.setAttribute('data-interaction-state', state);

  if (typeof window === 'undefined') return;

  // Auto-advance: completing → complete → resting
  if (state === 'completing') {
    const intent  = el.getAttribute('data-intent') as InteractionIntent | null;
    const timing  = intent ? INTENT_REGISTRY[intent].rhythm : INTENT_REGISTRY.exploration.rhythm;

    window.setTimeout(() => {
      if (getCurrentState(el) === 'completing') {
        setInteractionState(el, 'complete');
        window.setTimeout(() => {
          if (getCurrentState(el) === 'complete') {
            setInteractionState(el, 'resting');
          }
        }, timing.silenceMs);
      }
    }, timing.completionMs);
  }

  // Auto-recover from failure: failed → resting after execution timing
  if (state === 'failed') {
    const intent  = el.getAttribute('data-intent') as InteractionIntent | null;
    const timing  = intent ? INTENT_REGISTRY[intent].rhythm.executionMs : 280;
    window.setTimeout(() => {
      if (getCurrentState(el) === 'failed') {
        setInteractionState(el, 'resting');
      }
    }, timing);
  }

  // Restricted clears itself quickly
  if (state === 'restricted') {
    window.setTimeout(() => {
      if (getCurrentState(el) === 'restricted') {
        setInteractionState(el, 'resting');
      }
    }, 600);
  }
}

// ── Article II — Element Initialization ──────────────────────────────────
// Wire an element into the constitutional interaction language.

export function initializeInteraction(
  el:     HTMLElement,
  intent: InteractionIntent,
): void {
  const constitution = INTENT_REGISTRY[intent];
  el.setAttribute('data-intent',                intent);
  el.setAttribute('data-weight',                constitution.weight);
  el.setAttribute('data-interaction-reversible', String(constitution.reversible));
  el.setAttribute('data-interaction-state',      'resting');
}

// ── Article XIII — Weight Query ───────────────────────────────────────────
// Returns the constitutional weight of an element by its current intent.

export function getElementWeight(el: HTMLElement): InteractionWeight | null {
  const intent = el.getAttribute('data-intent') as InteractionIntent | null;
  if (!intent || !(intent in INTENT_REGISTRY)) return null;
  return INTENT_REGISTRY[intent].weight;
}
