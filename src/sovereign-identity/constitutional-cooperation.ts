/**
 * AZMA OS — Sovereign Identity Orchestrator
 * CONSTITUTIONAL COOPERATION FRAMEWORK (Construction ID SIO-009)
 * Restoration Package IV — Constitutional Restoration Campaign
 *
 * Authority: "The Sovereign Identity Layer — Constitutional Dossier,"
 * Chapter VI ("The Constitutional Runtime of Identity") and Chapter VIII
 * Article VI ("Phase IV — Constitutional Synchronization: reconnect
 * constitutional systems... the constitutional organs cooperate as one
 * living system").
 *
 * SCOPE, deliberately minimal — read this before assuming more exists.
 * This file is a pure, declarative VOCABULARY and REGISTRY: the named
 * Constitutional Events (Chapter VI Article II), which organ reacts to
 * events in which mode (Article III), and the priority ordering between
 * organs when several would respond at once (Article VI). It contains NO
 * event emitter, NO dispatch function, NO subscription mechanism, and is
 * wired into NOTHING — no chamber, no component, no runtime calls this
 * file. That is intentional, not an omission.
 *
 * WHY IT STOPS HERE: Chapter VI's remaining Articles (IV Silence, V
 * Synchronization, VII Failure/graceful-degradation, VIII Restoration,
 * IX Constitutional Memory, X Rhythm, XI Invisibility, XIII the
 * Execution Model) describe RUNTIME BEHAVIOR — an actual live event bus
 * that organs subscribe to and react through. Building that would mean
 * (a) inventing a genuinely new piece of business/Runtime-shaped
 * infrastructure, which Chapter VIII Article XI and this Package's own
 * Constitutional Boundaries forbid ("no Runtime modification... no
 * business orchestration"), and (b) wiring it into real organs/chambers
 * with behavior this environment cannot visually verify — the same
 * caution SIO-005 applied to ACDE before the Director Stage received its
 * own dedicated authorization. Those Articles are therefore captured
 * below as a documented CONTRACT a future live Runtime package would need
 * to satisfy, not as executable logic.
 */

// ── Chapter VI, Article II — The Constitutional Event Vocabulary ─────────
// The exact 8 events named in the Dossier. None invented, none omitted,
// none renamed. This package does not add a ninth.

export type ConstitutionalEvent =
  | 'Creator Arrived'
  | 'Creator Verified'
  | 'Creator Authenticated'
  | 'Creator Entered Chamber'
  | 'Creator Completed Goal'
  | 'Creator Waiting'
  | 'Creator Publishing'
  | 'Creator Leaving';

export const CONSTITUTIONAL_EVENTS: readonly ConstitutionalEvent[] = [
  'Creator Arrived',
  'Creator Verified',
  'Creator Authenticated',
  'Creator Entered Chamber',
  'Creator Completed Goal',
  'Creator Waiting',
  'Creator Publishing',
  'Creator Leaving',
] as const;

// ── Chapter VIII, Article VI — The Constitutional Organs ─────────────────
// The exact 10 organs named as the ones to become "one coordinated
// layer." Not every organ named here has a real, existing repository
// artifact yet — see CONSTITUTIONAL_ORGAN_STATUS below.

export type ConstitutionalOrgan =
  | 'Language'
  | 'Typography'
  | 'Lighting'
  | 'Color'
  | 'Motion'
  | 'Interaction'
  | 'Transitions'
  | 'Experience'
  | 'Cinematic Direction'
  | 'Global UI Runtime';

export const CONSTITUTIONAL_ORGANS: readonly ConstitutionalOrgan[] = [
  'Language',
  'Typography',
  'Lighting',
  'Color',
  'Motion',
  'Interaction',
  'Transitions',
  'Experience',
  'Cinematic Direction',
  'Global UI Runtime',
] as const;

// ── Chapter VI, Article III — Reaction Mode ───────────────────────────────
// "Every constitutional organ shall respond only to events relevant to
// its authority." Only 7 of the 10 organs are given an explicit reaction
// mode in the Dossier's own text (Article III's named examples). Color,
// Transitions, and Global UI Runtime are deliberately left absent below
// rather than assigned a guessed mode — Constitutionally Undefined, not
// an oversight, per the same discipline applied to CHAMBER_SCORES in
// SIO-001.

export const ORGAN_REACTION_MODE: Partial<Record<ConstitutionalOrgan, string>> = {
  Lighting:              'responds by atmosphere',
  Language:              'responds by communication',
  Motion:                'responds by movement',
  Typography:            'responds by presentation',
  'Cinematic Direction': 'responds by orchestration',
  Experience:            'responds by continuity',
  Interaction:           'responds by behavior',
} as const;

// ── Repository Evidence — which organ already has a real, certified
// artifact reachable through the Sovereign Identity Orchestrator, and
// which remains Constitutionally Undefined (named in the Dossier, but no
// corresponding module exists anywhere in the repository). Verified
// against getSovereignIdentity()'s SovereignConstitutionalConstants
// (orchestrator.ts) and DirectorSession (director-session.ts) before
// writing this file.

export interface OrganStatus {
  organ:               ConstitutionalOrgan;
  existingArtifact:     string | null;
  reachableThroughOrchestrator: boolean;
}

export const CONSTITUTIONAL_ORGAN_STATUS: readonly OrganStatus[] = [
  { organ: 'Language',              existingArtifact: 'Sovereign Tongue (src/core/tongue) — tone field', reachableThroughOrchestrator: true },
  { organ: 'Typography',            existingArtifact: 'TYPOGRAPHY (tokens.ts) — constitutional.typography field', reachableThroughOrchestrator: true },
  { organ: 'Lighting',              existingArtifact: 'ILLUMINATION / LIGHT_BEHAVIORS / ATMOSPHERES — constitutional.illumination/lightBehaviors/atmospheres fields', reachableThroughOrchestrator: true },
  { organ: 'Color',                 existingArtifact: 'PALETTE / MATERIALS — constitutional.palette/materials fields', reachableThroughOrchestrator: true },
  { organ: 'Motion',                existingArtifact: 'MOTION (tokens.ts) — constitutional.motion field', reachableThroughOrchestrator: true },
  { organ: 'Interaction',           existingArtifact: 'AIIE / INTENT_REGISTRY (interaction.ts) — constitutional.interactions field; the JS behavioral state machine itself remains dormant (SIO-008)', reachableThroughOrchestrator: true },
  { organ: 'Transitions',           existingArtifact: 'ACDE SCENE_TRANSITIONS — constitutional.sceneTransitions field; live-expressed via DirectorSession/DirectorStage (SIO-005B)', reachableThroughOrchestrator: true },
  { organ: 'Experience',            existingArtifact: 'No independent module found — per the original Repository Excavation and SIO-001/005, this label has never mapped to a distinct system; ACDE\'s CINEMATIC_PHASES is the closest existing analogue (continuity of phase), already reachable as constitutional.cinematicPhases', reachableThroughOrchestrator: true },
  { organ: 'Cinematic Direction',   existingArtifact: 'ACDE (direction.ts) — constitutional.cinematicPhases/emotionalArcs/citizenModes/invisibleDirector fields; live-expressed via DirectorSession/DirectorStage', reachableThroughOrchestrator: true },
  { organ: 'Global UI Runtime',     existingArtifact: null, reachableThroughOrchestrator: false },
] as const;

// ── Chapter VI, Article VI — Priority ─────────────────────────────────────
// "Meaning precedes presentation. Presentation precedes decoration.
// Experience precedes effects." Encoded as declarative data describing
// the ranking, not as executable conflict-resolution logic (no organ
// currently emits or reacts to any of these events, so there is nothing
// to actually arbitrate yet).

export const CONSTITUTIONAL_PRIORITY_ORDER: readonly ConstitutionalOrgan[] = [
  'Language',       // meaning
  'Experience',     // continuity of meaning
  'Interaction',    // behavior in service of meaning
  'Typography',     // presentation
  'Lighting',
  'Color',
  'Motion',
  'Cinematic Direction', // orchestrates the above, does not outrank meaning
  'Transitions',
  'Global UI Runtime',
] as const;

export const CONSTITUTIONAL_PRIORITY_EXAMPLES = [
  'Language may delay Motion.',
  'Safety may suppress animation.',
  'Accessibility may override Cinematic Direction.',
  'Meaning always wins.',
] as const;

// ── Documented Contract for a Future Live Runtime ─────────────────────────
// Chapter VI Articles IV, V, VII, VIII, IX, X, XI, XIII describe RUNTIME
// BEHAVIOR, not vocabulary. This package does not implement them — no
// event bus, no subscription, no dispatch exists in this repository.
// They are recorded here as a specification a future, separately
// authorized live-Runtime package must satisfy, so that package does not
// need to re-derive them from the Dossier text from scratch.

export const FUTURE_RUNTIME_CONTRACT = {
  constitutionalSilence:
    'Not every event requires every organ to react. An organ choosing no response is itself a valid, dignified response (Article IV) — a future Runtime must not force every organ to emit something on every event.',
  synchronization:
    'When multiple organs do participate in the same event, they must present as one constitutional performance, never as visibly independent systems (Article V).',
  gracefulFailure:
    'If one organ becomes unavailable, the remaining organs continue operating — identity degrades gracefully, never collapses (Article VII).',
  invisibleRestoration:
    'When a recovered organ rejoins, there must be no abrupt visual reset and no duplicated initialization (Article VIII).',
  constitutionalMemory:
    'A future Runtime remembers WHAT experience is currently being lived, never why, who decided, or business outcomes (Article IX) — it must not become a business-state store.',
  sharedRhythm:
    'Every organ follows one shared tempo; no organ may establish its own independent timing scale once live (Article X).',
  runtimeInvisibility:
    'The Runtime itself must never be exposed to the Creator — no organ name, no coordination mechanism, no synchronization event should ever become visible or attributable (Article XI).',
  executionSequence: [
    'A constitutional event occurs.',
    'The Constitutional Runtime recognizes the event.',
    'Only relevant constitutional organs become aware.',
    'Each organ performs only its own constitutional responsibility.',
    'The Cinematic Engine synchronizes the presentation.',
    'The Creator experiences one seamless moment.',
    'The constitutional runtime returns to quiet readiness.',
  ],
} as const;
