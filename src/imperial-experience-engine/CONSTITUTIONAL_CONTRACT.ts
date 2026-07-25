/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * CONSTITUTIONAL ARCHITECTURAL CONTRACT
 *
 * Ratified 2026-07-18 (Architectural Certification Package). This is the
 * permanent architectural reference for IXE — any future IXE mission
 * must be measured against this contract before implementation begins;
 * changing this contract is itself a constitutional act, not a
 * refactor detail.
 */

// ── Constitutional Purpose ──────────────────────────────────────────────

export const IXE_CONSTITUTIONAL_PURPOSE =
  'IXE is the constitutional engine responsible for orchestrating named, discrete Imperial Experiences ' +
  'across AZMA OS — sequencing each Experience\'s lifecycle, presenting its environment, and choreographing ' +
  'its handoff into the operating system — by consuming, never owning, the systems that already define ' +
  'color, tone, copy, and available action.';

// ── Responsibilities ─────────────────────────────────────────────────────

export const IXE_RESPONSIBILITIES = [
  'Defining the generic Experience lifecycle (entering -> stable -> exiting) shared by every registered Experience.',
  'Hosting a registry of named Experience Pipelines (see engine/experience-registry.ts).',
  'Sequencing an Experience\'s ceremonial reveal on entry.',
  'Choreographing an Experience\'s ceremonial handoff into the operating system before navigation occurs.',
  'Presenting each Experience\'s own environmental atmosphere: layered composition, light, depth, and restrained motion.',
] as const;

// ── Non-Responsibilities — explicit, not left to inference ──────────────

export const IXE_NON_RESPONSIBILITIES = [
  'Design tokens, color, typography, spacing, or component styling — owned by the Design System (src/design-system/).',
  'Tone, personality, and cinematic chamber-to-chamber scene transitions — owned by Sovereign Identity (src/sovereign-identity/).',
  'Deciding which constitutional capabilities are available in a given context — owned by the Imperial Awareness Engine (src/imperial-awareness-engine/); shaped for presentation by the Imperial Manifestation Engine (src/imperial-manifestation-engine/) and consumed here only via the Button Engine (src/button-engine/).',
  'What anything says, in which language — owned by the Creator Language Experience (src/creator-language/).',
  'Aggregating or exposing constitutional self-description data — owned by Constitutional Aggregation (src/constitutional-aggregation/), formerly named "the Manifestation Engine" before that name was reassigned to the Imperial Manifestation Engine (Awareness & Manifestation Final Architectural Ruling, Article II).',
  'Deciding UI visibility, filtering, or prioritization of any kind beyond an Experience\'s own lifecycle phase.',
  'Persisting any Experience\'s environment beyond its own registered scope (e.g., the Arrival Experience\'s Palace must never render outside Arrival).',
] as const;

// ── Lifecycle ─────────────────────────────────────────────────────────────

export const IXE_LIFECYCLE_DESCRIPTION =
  'Every Experience Pipeline moves through exactly three phases, owned by engine/use-experience-lifecycle.ts: ' +
  '"entering" (the ceremonial reveal plays), "stable" (the Experience rests, awaiting a Creator\'s action), and ' +
  '"exiting" (a chosen action triggers the ceremonial handoff before the actual navigation occurs). No Experience ' +
  'may define a fourth phase or bypass this sequence; a new Experience with different pacing needs supplies its ' +
  'own reveal/handoff durations to the shared hook, not a new lifecycle.';

// ── Public Interfaces — the stable surface other code may depend on ─────

export const IXE_PUBLIC_INTERFACES = [
  'engine: ExperiencePhase (type), ExperienceId (type), ExperienceDefinition (type), EXPERIENCE_REGISTRY (data), useExperienceLifecycle (hook)',
  'experiences/arrival: ArrivalExperience (the mounted Pipeline component), ArrivalScene (presentational only, not meant for reuse outside Arrival)',
  'Top-level barrel (index.ts) re-exports both layers — a consumer imports from "@/src/imperial-experience-engine", never from engine/ or experiences/ directly.',
] as const;

// ── Integration Boundaries ───────────────────────────────────────────────

export const IXE_INTEGRATION_BOUNDARIES = {
  consumes: [
    'src/design-system — every color/glow/shadow value in any Experience\'s presentation.',
    'src/creator-language — all copy, via the dictionary and t().',
    'src/button-engine — which actions exist in a given context; IXE only wraps their click to run the handoff sequence.',
    'src/components/living-companion — presence, where an Experience chooses to include it.',
    'src/install-experience — the install invitation hook, where an Experience chooses to offer it.',
  ],
  consumedBy: [
    'app/page.tsx (the Imperial Gate / Arrival route).',
    'app/signup/page.tsx, app/login/page.tsx (Registration and Recognition Gateways, 2026-07-23).',
    'app/qiyamah-chamber/page.tsx, app/ras-amr/page.tsx, app/makman-al-ghayah/page.tsx (Chambers, not Gates, ' +
      'joining IXE via the Imperial Chamber Unification Program, 2026-07-23/25).',
  ],
  explicitlyNotIntegrated: [
    'src/sovereign-identity\'s getSovereignIdentity() tone orchestrator — scoped to named ChamberContexts only; the Gate is not one, and extending that scope is not authorized by this contract.',
    'DirectorStage\'s cross-page scene transition — left entirely unmodified; IXE\'s own handoff dissolve is local and precedes navigation, DirectorStage\'s transition follows it, sequentially and independently.',
  ],
} as const;

// ── Future Extension Rules ───────────────────────────────────────────────

export const IXE_EXTENSION_RULES = [
  'A new Experience is added by: (1) registering it in engine/experience-registry.ts, (2) building its own Scene/Pipeline under experiences/<name>/, (3) calling the existing useExperienceLifecycle hook — never a new lifecycle model.',
  'A new Experience must declare its own mount scope (which route(s) it is exclusive to) and must not leak its environment outside that scope, mirroring the Arrival Experience\'s own Palace-is-Arrival-only boundary.',
  'A new Experience must consume the Design System, Creator Language Experience, and Button Engine exactly as Arrival does — it may not hardcode copy, colors, or action logic of its own.',
  'This contract\'s Non-Responsibilities list is not amendable by an implementation mission — only by a future constitutional correction at the level this contract itself was ratified.',
] as const;
