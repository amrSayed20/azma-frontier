/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * ARRIVAL RUNTIME FOUNDATION — Package I, updated by Package II
 *
 * The Council named ten runtime systems that "must exist before any
 * visual redesign begins." Before writing new code, every existing
 * folder under src/ was audited for real functional overlap. The
 * result: seven of the ten already existed as real, tested, in some
 * cases explicitly-ratified infrastructure — just not yet consumed by
 * Arrival. Building ten new engines regardless would have duplicated
 * several things this platform has already protected from duplication
 * (most pointedly the Imperial Voice Layer, whose own types file
 * states it "must never be re-derived"). This is the resulting map:
 * what each requested name resolves to, real module and export names,
 * and — for the two genuinely missing pieces — what was built new.
 *
 * PACKAGE II (2026-07-21): ArrivalExperience.tsx now genuinely calls
 * into four of the previously-unused systems (Cinematic Timeline,
 * Emotional Transition Controller, Atmosphere Runtime, Living Motion
 * System) — see that file's own header for exactly what each call
 * does and, just as importantly, what it deliberately does not yet
 * drive visually ("do not attempt to complete the entire cinematic
 * journey within this package"). Statuses below updated accordingly.
 *
 * This is documentation as contract, not aspiration: every citation
 * below was read from the actual source before being written here.
 */

export interface ArrivalRuntimeMapping {
  readonly requestedName: string;
  readonly status: 'exists-unused' | 'exists-in-use' | 'built-new' | 'not-authorized';
  readonly realSystem: string;
  readonly note: string;
}

export const ARRIVAL_RUNTIME_FOUNDATION: readonly ArrivalRuntimeMapping[] = [
  {
    requestedName: 'Arrival Detection Engine',
    status: 'built-new',
    realSystem: 'src/visitor-presence/arrival-record.ts (recordArrival, getArrivalRecord)',
    note:
      'Session-based known/unknown-Creator detection already existed (app/page.tsx). Device-level ' +
      'visit history did not — design-system/direction.ts\'s getVariation(visitCount) has expected ' +
      'this signal since it was written, but nothing ever called it with a real value. PACKAGE II: ' +
      'ArrivalExperience.tsx now calls recordArrival() on mount and feeds arrivalCount into ' +
      'getVariation() for real, finally giving that long-dead function a real caller.',
  },
  {
    requestedName: 'Presence Engine',
    status: 'built-new',
    realSystem: 'src/visitor-presence/presence-tracker.ts (PresenceMachine, createPresenceTracker, useVisitorPresence)',
    note:
      'LivingCompanion, creator-presence/welcome-composer.ts, and imperial-presence/presence-registry.ts ' +
      'each cover a different, real, partial concern (presence-facing UI; one-shot data receipt; a static ' +
      'route catalog). None tracks whether a visitor is live/idle/away. PACKAGE II: ArrivalExperience.tsx ' +
      'now calls useVisitorPresence() for real and pauses ambient breathing while the tab is away.',
  },
  {
    requestedName: 'Environment Runtime',
    status: 'exists-in-use',
    realSystem: 'src/design-system/tokens.ts (ATMOSPHERES) + behaviors.ts (setAtmosphere, atmosphereCssVars)',
    note:
      'Seven named atmospheres (calm, curious, investigating, deliberating, creating, victorious, ' +
      'reflective) with real lighting/depth/material behavior already exist. PACKAGE II: ' +
      'ArrivalExperience.tsx now calls setAtmosphere(root, \'calm\') for real, deliberately without the ' +
      '.azma-chamber class (which would pull in the grid/depth visual layer — real redesign, not ' +
      'orchestration). The mood is now genuinely classified; the deeper visual layer is future work.',
  },
  {
    requestedName: 'Empire Awareness State Machine',
    status: 'exists-in-use',
    realSystem: "src/imperial-experience-engine/engine (ExperiencePhase: 'entering' | 'stable' | 'exiting')",
    note:
      'NAME COLLISION AVOIDED, not built: `EmpireAwarenessEngine` (src/core/strategic-intelligence/) already ' +
      'names a different, ratified, Founder-only strategic-observation class — explicitly disclosed as ' +
      '"different domain, unrenamed and untouched" (imperial-awareness-engine/CONSTITUTIONAL_CONTRACT.ts). ' +
      'A visitor-facing awareness machine for Arrival specifically already exists under IXE\'s own name: ' +
      'ExperiencePhase. The Storyboard\'s five pre-threshold beats (Awareness/Responsibility/Revelation/' +
      'Recognition/Invitation) are sub-states of the single \'entering\' phase, not a second machine.',
  },
  {
    requestedName: 'Cinematic Timeline Engine',
    status: 'exists-in-use',
    realSystem: 'src/design-system/direction.ts (ACDE — CinematicPhase, CinematicJourney, beginJourney/advanceJourney/endJourney)',
    note:
      'A real, substantial cinematic phase/journey system already ships and is consumed live by ' +
      'DirectorStage.tsx for cross-page transitions. Arrival still hardcodes its own beat delays ' +
      '(REVEAL_DURATION_MS and friends in arrival.css) — that stays, deliberately, this package. ' +
      'PACKAGE II: beginJourney/advanceJourney/endJourney are now genuinely called across the mount, ' +
      'entering→stable, and chosen-step lifecycle points; the resulting journey-depth attributes are not ' +
      'yet consumed by any CSS — establishing the connection, not completing the journey, per instruction.',
  },
  {
    requestedName: 'Emotional Transition Controller',
    status: 'exists-in-use',
    realSystem: 'src/design-system/direction.ts (EmotionalBeat, EMOTIONAL_ARCS, CitizenMode, markEffectivePause/markInterruption)',
    note:
      'Same file as the Cinematic Timeline Engine — already consumed live by DirectorStage.tsx ' +
      '(CITIZEN_MODES scales transition duration). PACKAGE II: ArrivalExperience.tsx now calls ' +
      'markInterruption(\'arrival\') or markEffectivePause(\'arrival\', elapsed) on the chosen step, ' +
      'persisting a real signal into ACDE\'s own DirectionMemory for future pacing decisions.',
  },
  {
    requestedName: 'Imperial Voice Layer',
    status: 'exists-in-use',
    realSystem: 'src/imperial-voice/ (composeImperialVoice) + src/core/tongue/voice.ts (TONE_PROFILES, buildStyleDirective, shapeResponse)',
    note:
      'Exists under this near-exact name already. Already wired into LivingCompanion.tsx (tone.sentenceRhythm ' +
      'drives TTS rate/pitch). Its own types.ts explicitly states this capability "must never be re-derived."',
  },
  {
    requestedName: 'Narrative Engine',
    status: 'not-authorized',
    realSystem: 'src/core/sovereign-journey/ (Sovereign Journey Engine, CANONICAL_CHAPTERS) — deliberately not bridged',
    note:
      'Real and substantial, but DirectorStage.tsx explicitly discloses: "No bridge exists. None is ' +
      'authorized" — connecting it would mean reviving a disconnected 14-step runtime kernel ' +
      '(src/core/azma-os-runtime/). This package does not change that ruling. Arrival\'s own within-page ' +
      'narrative sequencing (the Storyboard\'s 8 beats) is adequately served by ACDE\'s CinematicJourney/ ' +
      'EmotionalBeat primitives above, which is a different, smaller scope than a cross-app Narrative Engine.',
  },
  {
    requestedName: 'Living Motion System',
    status: 'exists-in-use',
    realSystem: "src/design-system/tokens.ts (MOTION) — consumed via the already-global CSS custom properties in azma-identity.css (--azma-breath, --azma-breath-accent, --azma-breath-echo)",
    note:
      'Real conventions and constants already ratified. PACKAGE II: arrival.css\'s three ambient breathing ' +
      'rules now reference these global tokens directly instead of locally-invented magic numbers — two ' +
      'were already numerically identical by coincidence (8s, 4.5s); the atmosphere breathe genuinely ' +
      'slows to the ratified 80s primary period ("silence is luxury"), a timing-only change to an ' +
      'already-subtle 6% brightness pulse, not a compositional redesign.',
  },
  {
    requestedName: 'Guided Transition Runtime',
    status: 'exists-in-use',
    realSystem: 'src/sovereign-identity/director-stage/DirectorStage.tsx',
    note:
      'Already mounted platform-wide (app/layout.tsx) and already drives cross-page scene transitions ' +
      'for the Gate route among others. IXE\'s own contract explicitly scopes around it as "left entirely ' +
      'unmodified" — this package does not touch it.',
  },
] as const;
