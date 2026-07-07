/**
 * AZMA OS — Cinematic Direction Engine (ACDE) V1.0
 * The Constitutional Law of Experience
 *
 * ACDE directs moments, rhythm, emotional progression, cinematic language.
 * ACDE never controls AI, Agents, Models, Tasks, or Resources.
 * Those belong exclusively to AZMA Core.
 *
 * The engine communicates with the visual layer through:
 *   data-phase / data-mode / data-companion-state / data-director /
 *   data-journey-active / data-transition / data-transition-type
 *   --acde-var-* CSS custom properties for living variation
 *
 * Import from src/design-system/index.ts — never directly.
 * CSS: import '@/src/design-system/azma-direction.css'
 *
 * ARTICLE XII — The Core Remains Supreme
 * ACDE never touches: AI, Agents, Models, Tasks, Resources.
 * ACDE only directs experience. Never execution.
 */

// ── ARTICLE I — Every Chamber Is a Film ───────────────────────────────────
// Every visit has: Opening → Development → Tension → Resolution → Reflection → Departure.
// No Chamber may skip these phases.

export type CinematicPhase =
  | 'opening'      // the Chamber opens — emergence, orientation, first breath
  | 'development'  // the citizen engages — exploration, participation
  | 'tension'      // the stakes reveal — deliberation, investigation, weight
  | 'resolution'   // the conclusion arrives — verdict, completion, settlement
  | 'reflection'   // aftermath — the Chamber holds what happened
  | 'departure';   // the citizen leaves — graceful recession

export interface PhaseDefinition {
  phase:               CinematicPhase;
  constitutionalPurpose:string;
  minDurationMs:       number;       // minimum time before phase may advance
  companionState:      CompanionState;
  atmosphereHint:      string;       // recommended data-atmosphere value
  lightBehavior:       string;       // recommended light-* class
  movementAllowed:     boolean;      // Article XI — does this phase allow movement?
}

export const CINEMATIC_PHASES: Record<CinematicPhase, PhaseDefinition> = {
  opening: {
    phase:               'opening',
    constitutionalPurpose:
      'The Chamber opens — the citizen orients, the space reveals itself silently.',
    minDurationMs:        800,
    companionState:       'entering',
    atmosphereHint:       'calm',
    lightBehavior:        'resting',
    movementAllowed:      true,   // entrance movement is purposeful
  },
  development: {
    phase:               'development',
    constitutionalPurpose:
      'The citizen engages — exploration, participation, investment in the space.',
    minDurationMs:        0,      // development is citizen-paced, no minimum
    companionState:       'observing',
    atmosphereHint:       'curious',
    lightBehavior:        'guiding',
    movementAllowed:      true,
  },
  tension: {
    phase:               'tension',
    constitutionalPurpose:
      'The stakes reveal — deliberation, investigation, the weight of an approaching decision.',
    minDurationMs:        0,
    companionState:       'silence',  // silence serves tension
    atmosphereHint:       'investigating',
    lightBehavior:        'judgment',
    movementAllowed:      false,   // Article XI — tension requires stillness
  },
  resolution: {
    phase:               'resolution',
    constitutionalPurpose:
      'The conclusion arrives — verdict, completion, the empire acknowledges.',
    minDurationMs:        600,
    companionState:       'speaking',
    atmosphereHint:       'victorious',
    lightBehavior:        'legacy',
    movementAllowed:      true,
  },
  reflection: {
    phase:               'reflection',
    constitutionalPurpose:
      'Aftermath — the Chamber holds memory, the citizen rests in what was accomplished.',
    minDurationMs:        0,
    companionState:       'observing',
    atmosphereHint:       'reflective',
    lightBehavior:        'resting',
    movementAllowed:      false,   // reflection is still
  },
  departure: {
    phase:               'departure',
    constitutionalPurpose:
      'The citizen leaves — graceful recession, the Chamber remembers.',
    minDurationMs:        0,
    companionState:       'farewell',
    atmosphereHint:       'calm',
    lightBehavior:        'resting',
    movementAllowed:      true,   // departure movement is purposeful
  },
} as const;

// ── ARTICLE II — The Chamber Has a Rhythm ─────────────────────────────────
// Every Chamber owns an emotional rhythm. Not a timer. A rhythm.
// The engine defines: when silence exists, when movement begins,
// when light breathes, when the companion speaks, when nothing should happen.

export type EmotionalBeat =
  | 'arrival'       // citizen enters — silence, the space receives them
  | 'curiosity'     // citizen reaches outward — exploration begins
  | 'participation' // citizen acts — engagement, the citizen invests
  | 'confidence'    // citizen commands — decisive, sovereign action
  | 'reflection'    // citizen witnesses — aftermath, earned meaning
  | 'departure';    // citizen leaves — recession, the memory remains

export interface EmotionalCurve {
  chamberId:  string;
  beats:      EmotionalBeat[];
  beatMinMs:  Partial<Record<EmotionalBeat, number>>;  // minimum time at each beat
}

// ── ARTICLE IV — The Companion Is a Directed Character ────────────────────
// The Companion never speaks randomly. Every sentence belongs to a scene.

export type CompanionState =
  | 'entering'    // companion arrives from silence — not yet speaking
  | 'observing'   // companion is present, watching, not speaking
  | 'speaking'    // companion delivers a directed sentence
  | 'silence'     // companion consciously withholds — the scene requires quiet
  | 'farewell';   // companion begins recession — the session approaches its end

export interface CompanionDirection {
  entranceDelayMs:         number;  // silence before companion first speaks
  interruptionThresholdMs: number;  // citizen action that signals: companion, fall silent
  observationWindowMs:     number;  // how long companion observes before offering thought
  silenceMinDurationMs:    number;  // minimum silence after companion speaks (before next)
  farewellLeadMs:          number;  // how early companion signals farewell before departure
}

// ── ARTICLE V — The Invisible Director ────────────────────────────────────
// The Invisible Director is not an AI. Not an Agent. Not the Core.
// It appears only when the emotional arc requires it.
// Never before. Never after. Never unnecessarily.

export type DirectorPresence = 'present' | 'withdrawn';

export interface DirectorDefinition {
  presenceCondition:   string;
  withdrawCondition:   string;
  presenceDurationMs:  number;
}

export const INVISIBLE_DIRECTOR: DirectorDefinition = {
  presenceCondition:  'emotional arc requires intervention — the citizen is lost or a climactic moment arrives',
  withdrawCondition:  'arc is self-sustaining — citizen is engaged, pacing is correct',
  presenceDurationMs: 3200,
} as const;

// ── ARTICLE VI — Transitions Are Scene Changes ────────────────────────────
// Navigation never exists. Only scene transitions.
// Palace → Hujjah is not routing. It is a scene transition.

export type SceneTransitionType =
  | 'dissolve'    // scenes blend through shared void — same depth, different space
  | 'descend'     // moving deeper — light dims, weight increases
  | 'ascend'      // returning toward surface — warmth increases, breath opens
  | 'reveal'      // curtain parts — ceremony and anticipation
  | 'immediate';  // constitutional override — no animation possible

export interface SceneTransition {
  from:           string;
  to:             string;
  transitionType: SceneTransitionType;
  durationMs:     number;
  description:    string;
}

export const SCENE_TRANSITIONS: Record<string, SceneTransition> = {
  'palace-to-hujjah': {
    from:           'sovereign-vault-palace',
    to:             'hujjah-al-damighah',
    transitionType: 'descend',
    durationMs:     800,
    description:    'Treasure becomes subject of investigation — descend into scrutiny.',
  },
  'hujjah-to-palace': {
    from:           'hujjah-al-damighah',
    to:             'sovereign-vault-palace',
    transitionType: 'ascend',
    durationMs:     800,
    description:    'Investigation resolves — the artifact returns to the treasury.',
  },
  'hujjah-to-qiyamah': {
    from:           'hujjah-al-damighah',
    to:             'qiyamah-chamber',
    transitionType: 'descend',
    durationMs:     1200,
    description:    'Deliberation becomes judgment — the deepest descent.',
  },
  'qiyamah-to-hujjah': {
    from:           'qiyamah-chamber',
    to:             'hujjah-al-damighah',
    transitionType: 'ascend',
    durationMs:     1000,
    description:    'Judgment rendered — return to examination.',
  },
  'default-arrival': {
    from:           '*',
    to:             '*',
    transitionType: 'reveal',
    durationMs:     600,
    description:    'Fresh arrival — emergence from the void.',
  },
} as const;

// ── ARTICLE VII — Emotional Curves ────────────────────────────────────────
// Every Chamber defines its emotional curve.
// The Direction Engine manages pacing. The Chamber only defines its curve.

export const EMOTIONAL_ARCS: Record<string, EmotionalCurve> = {
  standard: {
    chamberId: 'standard',
    beats:     ['arrival', 'curiosity', 'participation', 'confidence', 'reflection', 'departure'],
    beatMinMs: { arrival: 800, reflection: 1200 },
  },
  investigative: {
    chamberId: 'investigative',
    beats:     ['arrival', 'curiosity', 'participation', 'reflection', 'confidence', 'departure'],
    beatMinMs: { arrival: 600, confidence: 1600 },
  },
  ceremonial: {
    chamberId: 'ceremonial',
    beats:     ['arrival', 'participation', 'confidence', 'reflection', 'departure'],
    beatMinMs: { arrival: 1600, confidence: 2400, reflection: 1200 },
  },
  archival: {
    chamberId: 'archival',
    beats:     ['arrival', 'curiosity', 'reflection', 'departure'],
    beatMinMs: { arrival: 400 },
  },
} as const;

// ── ARTICLE VIII — The Citizen Controls the Film ──────────────────────────
// Three constitutional modes. Changing the mode immediately changes pacing.

export type CitizenMode =
  | 'citizen-leads'     // citizen sets the pace — chamber responds immediately
  | 'shared-direction'  // balanced — citizen and chamber share rhythm
  | 'chamber-leads';    // chamber sets the pace — longer silences, more dramatic pacing

export interface ModeProfile {
  mode:                CitizenMode;
  description:         string;
  companionResponseMs: number;   // how quickly companion reacts
  pauseMultiplier:     number;   // scale on constitutional pause timings
  atmosphereIntensity: number;   // scale on atmosphere expression
}

export const CITIZEN_MODES: Record<CitizenMode, ModeProfile> = {
  'citizen-leads': {
    mode:                'citizen-leads',
    description:         'Citizen sets the pace — the chamber responds immediately, companion waits.',
    companionResponseMs: 200,
    pauseMultiplier:     0.65,
    atmosphereIntensity: 0.75,
  },
  'shared-direction': {
    mode:                'shared-direction',
    description:         'Balanced rhythm — citizen and chamber share the pacing.',
    companionResponseMs: 800,
    pauseMultiplier:     1.00,
    atmosphereIntensity: 1.00,
  },
  'chamber-leads': {
    mode:                'chamber-leads',
    description:         'Chamber sets the pace — longer silences, more dramatic pacing.',
    companionResponseMs: 2400,
    pauseMultiplier:     1.40,
    atmosphereIntensity: 1.30,
  },
} as const;

// ── ARTICLE IX — The Empire Never Repeats Itself ──────────────────────────
// Not randomness. Living variation.
// Deterministic — seeded by visit count and hour. Same visit = same experience.

export interface VariationProfile {
  pauseScale:     number;   // 0.82–1.18 — breathing room in pauses
  lightScale:     number;   // 0.88–1.12 — light animation timing
  companionScale: number;   // 0.75–1.25 — companion timing
  breathScale:    number;   // 0.92–1.08 — ambient breath rhythm
}

function deterministicUnit(seed: number): number {
  // Maps any integer to [0, 1] without true randomness
  return ((seed * 31 + new Date().getHours() * 7) % 97) / 97;
}

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t;
}

export function getVariation(visitCount: number): VariationProfile {
  return {
    pauseScale:     lerp(0.82, 1.18, deterministicUnit(visitCount)),
    lightScale:     lerp(0.88, 1.12, deterministicUnit(visitCount + 17)),
    companionScale: lerp(0.75, 1.25, deterministicUnit(visitCount + 37)),
    breathScale:    lerp(0.92, 1.08, deterministicUnit(visitCount + 53)),
  };
}

// ── ARTICLE X — Cinematic Memory ─────────────────────────────────────────
// The Direction Engine remembers: effective pauses, interruptions,
// preferred pacing, preferred silence.
// It never changes the Chamber. It changes direction.

const DIRECTION_MEMORY_KEY = 'azma-direction-memory';
const DIRECTION_MODE_KEY   = 'azma-direction-mode';

export interface DirectionMemory {
  preferredMode:    CitizenMode | null;
  effectivePauses:  Partial<Record<EmotionalBeat, number>>;  // ms where pauses landed well
  interruptedBeats: EmotionalBeat[];                          // beats where citizen pushed through
  preferredSilence: boolean;                                  // citizen consistently chose silence
  lastDirectedAt:   number | null;
  totalDirections:  number;
}

const DEFAULT_DIRECTION_MEMORY: DirectionMemory = {
  preferredMode:    null,
  effectivePauses:  {},
  interruptedBeats: [],
  preferredSilence: false,
  lastDirectedAt:   null,
  totalDirections:  0,
};

export function readDirectionMemory(): DirectionMemory {
  if (typeof window === 'undefined') return { ...DEFAULT_DIRECTION_MEMORY };
  try {
    const raw = localStorage.getItem(DIRECTION_MEMORY_KEY);
    if (!raw) return { ...DEFAULT_DIRECTION_MEMORY };
    return { ...DEFAULT_DIRECTION_MEMORY, ...(JSON.parse(raw) as Partial<DirectionMemory>) };
  } catch {
    return { ...DEFAULT_DIRECTION_MEMORY };
  }
}

export function writeDirectionMemory(patch: Partial<DirectionMemory>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = readDirectionMemory();
    localStorage.setItem(DIRECTION_MEMORY_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    /* storage unavailable — direction continues without persistence */
  }
}

/** Records that a pause at this beat was effective (citizen didn't interrupt). */
export function markEffectivePause(beat: EmotionalBeat, durationMs: number): void {
  const mem = readDirectionMemory();
  writeDirectionMemory({
    effectivePauses: { ...mem.effectivePauses, [beat]: durationMs },
  });
}

/** Records a citizen interruption — future pacing shortens at this beat. */
export function markInterruption(beat: EmotionalBeat): void {
  const mem = readDirectionMemory();
  if (!mem.interruptedBeats.includes(beat)) {
    writeDirectionMemory({ interruptedBeats: [...mem.interruptedBeats, beat] });
  }
}

// ── Citizen Mode Management ───────────────────────────────────────────────

export function setMode(mode: CitizenMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DIRECTION_MODE_KEY, mode);
    writeDirectionMemory({ preferredMode: mode });
  } catch {
    /* storage unavailable */
  }
}

export function getMode(): CitizenMode {
  if (typeof window === 'undefined') return 'shared-direction';
  try {
    const stored = localStorage.getItem(DIRECTION_MODE_KEY) as CitizenMode | null;
    if (stored && stored in CITIZEN_MODES) return stored;
    // Fall back to memory preference
    return readDirectionMemory().preferredMode ?? 'shared-direction';
  } catch {
    return 'shared-direction';
  }
}

// ── Phase Management ─────────────────────────────────────────────────────

/** Sets the cinematic phase on a chamber element. */
export function setPhase(element: HTMLElement | null, phase: CinematicPhase): void {
  if (!element) return;
  element.dataset.phase = phase;
}

/** Reads the current cinematic phase from a chamber element. */
export function getPhase(element: HTMLElement | null): CinematicPhase | null {
  if (!element) return null;
  return (element.dataset.phase as CinematicPhase) ?? null;
}

/**
 * Advances to the next phase in the constitutional sequence.
 * Respects minDurationMs — will not advance if insufficient time has passed.
 * Returns the new phase, or null if phase cannot advance yet.
 */
export function advancePhase(
  element:     HTMLElement | null,
  enteredAt:   number,
): CinematicPhase | null {
  const current = getPhase(element);
  if (!current) return null;

  const sequence: CinematicPhase[] = [
    'opening', 'development', 'tension', 'resolution', 'reflection', 'departure',
  ];
  const currentIndex = sequence.indexOf(current);
  if (currentIndex === -1 || currentIndex === sequence.length - 1) return null;

  const def       = CINEMATIC_PHASES[current];
  const elapsed   = Date.now() - enteredAt;
  if (elapsed < def.minDurationMs) return null;

  const next = sequence[currentIndex + 1];
  setPhase(element, next);
  return next;
}

// ── Companion Direction ───────────────────────────────────────────────────

/** Sets the companion state on a companion element (typically .azma-el-guide). */
export function setCompanionState(element: HTMLElement | null, state: CompanionState): void {
  if (!element) return;
  element.dataset.companionState = state;
}

/**
 * Determines if the companion should speak at this moment.
 * Applies cinematic memory: interrupted beats and silence preference.
 */
export function companionShouldSpeak(beat: EmotionalBeat, elapsedMs: number): boolean {
  const mem     = readDirectionMemory();
  const mode    = getMode();
  const profile = CITIZEN_MODES[mode];

  if (mem.preferredSilence)                    return false;
  if (mem.interruptedBeats.includes(beat))     return false;
  return elapsedMs >= profile.companionResponseMs;
}

// ── Living Variation Application ─────────────────────────────────────────

/**
 * Applies living variation CSS custom properties to a chamber root.
 * The CSS layer reads --acde-var-* to introduce subtle timing differences per visit.
 */
export function applyVariation(element: HTMLElement | null, visitCount: number): void {
  if (!element) return;
  const v = getVariation(visitCount);
  element.style.setProperty('--acde-var-pause',     v.pauseScale.toFixed(3));
  element.style.setProperty('--acde-var-light',     v.lightScale.toFixed(3));
  element.style.setProperty('--acde-var-companion', v.companionScale.toFixed(3));
  element.style.setProperty('--acde-var-breath',    v.breathScale.toFixed(3));
}

// ── Scene Transition Management ───────────────────────────────────────────

/** Returns the transition definition for a chamber pair. */
export function resolveTransition(fromId: string, toId: string): SceneTransition {
  return SCENE_TRANSITIONS[`${fromId}-to-${toId}`] ?? SCENE_TRANSITIONS['default-arrival'];
}

/**
 * Begins a scene transition on a container element.
 * Sets data-transition="dissolving" and data-transition-type for CSS.
 */
export function beginTransition(
  container:  HTMLElement | null,
  fromId:     string,
  toId:       string,
): SceneTransition {
  const transition = resolveTransition(fromId, toId);
  if (container) {
    container.dataset.transition     = 'dissolving';
    container.dataset.transitionType = transition.transitionType;
  }
  return transition;
}

/** Marks the new scene as arrived. */
export function transitionArrive(container: HTMLElement | null): void {
  if (!container) return;
  container.dataset.transition = 'arriving';
}

/** Marks the transition as complete — the scene is stable. */
export function transitionComplete(container: HTMLElement | null): void {
  if (!container) return;
  container.dataset.transition = 'stable';
  delete container.dataset.transitionType;
}

// ── ARTICLE III — Time Is Invisible (Journey Management) ─────────────────
// Long operations become cinematic journeys.
// The Empire never waits. The Empire evolves.
// The citizen never sees: loading, rendering, processing, waiting.

export type JourneyDepth = 0 | 1 | 2 | 3 | 4;

export interface CinematicJourney {
  readonly label:     string;     // internal only — never shown to citizen
  readonly depth:     JourneyDepth;
  readonly startedAt: number;
}

/** Begins a cinematic journey — the chamber enters journey mode. */
export function beginJourney(element: HTMLElement | null, label: string): CinematicJourney {
  const journey: CinematicJourney = { label, depth: 0, startedAt: Date.now() };
  if (element) {
    element.dataset.journeyActive = 'true';
    element.dataset.journeyDepth  = '0';
    element.style.setProperty('--acde-journey-depth', '0');
  }
  return journey;
}

/** Advances journey depth — the experience deepens. Returns the updated journey. */
export function advanceJourney(
  element: HTMLElement | null,
  journey: CinematicJourney,
): CinematicJourney {
  const nextDepth = Math.min(journey.depth + 1, 4) as JourneyDepth;
  const updated   = { ...journey, depth: nextDepth };
  if (element) {
    element.dataset.journeyDepth = String(nextDepth);
    element.style.setProperty('--acde-journey-depth', String(nextDepth));
  }
  return updated;
}

/** Ends the journey — the chamber returns to its phase. */
export function endJourney(element: HTMLElement | null): void {
  if (!element) return;
  delete element.dataset.journeyActive;
  delete element.dataset.journeyDepth;
  element.style.removeProperty('--acde-journey-depth');
}

// ── The Invisible Director ────────────────────────────────────────────────
// Appears only when the emotional arc requires it.
// Withdraws automatically — it was never meant to stay.

/** Summons the Invisible Director for the defined presence duration. */
export function summonDirector(element: HTMLElement | null): void {
  if (!element) return;
  element.dataset.director = 'present';
  setTimeout(() => withdrawDirector(element), INVISIBLE_DIRECTOR.presenceDurationMs);
}

/** Withdraws the Director — the arc is self-sustaining again. */
export function withdrawDirector(element: HTMLElement | null): void {
  if (!element) return;
  element.dataset.director = 'withdrawn';
}

// ── Chamber Score — Complete Cinematic Definition ─────────────────────────

export interface ChamberScore {
  chamberId:           string;
  arc:                 EmotionalCurve;
  companionDirection:  CompanionDirection;
  defaultMode:         CitizenMode;
  transitionIn:        SceneTransitionType;
  transitionOut:       SceneTransitionType;
}

const DEFAULT_COMPANION_DIRECTION: CompanionDirection = {
  entranceDelayMs:         1200,
  interruptionThresholdMs: 400,
  observationWindowMs:     3000,
  silenceMinDurationMs:    2000,
  farewellLeadMs:          800,
};

export function createChamberScore(
  chamberId:  string,
  arc:        EmotionalCurve,
  overrides?: Partial<Omit<ChamberScore, 'chamberId' | 'arc'>>,
): ChamberScore {
  return {
    chamberId,
    arc,
    companionDirection: DEFAULT_COMPANION_DIRECTION,
    defaultMode:        'shared-direction',
    transitionIn:       'dissolve',
    transitionOut:      'dissolve',
    ...overrides,
  };
}

// ── Predefined Chamber Scores ─────────────────────────────────────────────
// Each existing chamber has its complete cinematic definition here.
// Future chambers add to this map — they do not invent their own rhythm.

export const CHAMBER_SCORES: Record<string, ChamberScore> = {
  'sovereign-vault-palace': createChamberScore(
    'sovereign-vault-palace',
    EMOTIONAL_ARCS['archival'],
    {
      companionDirection: {
        entranceDelayMs:         1600,  // the Palace breathes before the companion speaks
        interruptionThresholdMs: 600,
        observationWindowMs:     4000,  // artifacts demand patience before interpretation
        silenceMinDurationMs:    3200,
        farewellLeadMs:          600,
      },
      defaultMode:  'shared-direction',
      transitionIn: 'reveal',          // the Palace reveals itself
      transitionOut:'dissolve',
    },
  ),

  'hujjah-al-damighah': createChamberScore(
    'hujjah-al-damighah',
    EMOTIONAL_ARCS['investigative'],
    {
      companionDirection: {
        entranceDelayMs:         800,   // Hujjah is active — companion enters sooner
        interruptionThresholdMs: 300,   // investigation is delicate
        observationWindowMs:     2000,
        silenceMinDurationMs:    1600,
        farewellLeadMs:          1000,
      },
      defaultMode:  'shared-direction',
      transitionIn: 'descend',
      transitionOut:'descend',
    },
  ),

  'qiyamah-chamber': createChamberScore(
    'qiyamah-chamber',
    EMOTIONAL_ARCS['ceremonial'],
    {
      companionDirection: {
        entranceDelayMs:         2400,  // judgment chamber — long silence before companion
        interruptionThresholdMs: 800,
        observationWindowMs:     5000,
        silenceMinDurationMs:    4000,
        farewellLeadMs:          1600,
      },
      defaultMode:  'chamber-leads',   // judgment is not citizen-led
      transitionIn: 'descend',
      transitionOut:'ascend',
    },
  ),
} as const;
