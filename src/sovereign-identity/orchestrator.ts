/**
 * AZMA OS — Sovereign Identity Orchestrator (SIO) V1.0
 * Construction ID: SIO-001, extended SIO-004
 *
 * Coordinates and presents, as one coherent bundle, the Sovereign Identity
 * systems recovered by Repository Excavation. This IS the "single
 * constitutional coordination layer" SIO-004 asked for — it is extended
 * here, not duplicated by a second orchestrator, per "Do not duplicate
 * existing systems."
 *
 * Every named system in SIO-004's directive collapses onto exactly two
 * real artifacts (confirmed again before this extension, unchanged since
 * SIO-001/003):
 *   — the Visual Identity Engine (src/design-system), which itself
 *     internally covers Design System / Design Tokens / Color Engine /
 *     Lighting Engine / Typography Engine / Motion System / Animation
 *     System / the "UI Engine" (ACLE's element registry) / the
 *     Transition-Director-Cinematic-Experience Engine (ACDE) / the
 *     Interaction Engine (AIIE).
 *   — the Sovereign Tongue (src/core/tongue): per-chamber ToneProfile.
 * No third system was found. No system was invented.
 *
 * This is NOT Al-Wateen, not an early implementation of Al-Wateen, not a
 * Runtime, not a business orchestrator, not an AI orchestrator. It holds
 * no state, no lifecycle, and no execution authority. Every value
 * returned here is read, unmodified, from an already-constitutional
 * source — its only logic is resolving one chamber identifier against
 * two independently-authored systems and returning the result together.
 * It does not merge the engines into one implementation — each field
 * below is a direct, unmodified re-export of one engine's own constant;
 * the engines remain independently defined in their own files.
 *
 * VERIFIED before writing: CHAMBER_SCORES (design-system/direction.ts) and
 * TONE_PROFILES (core/tongue/voice.ts) use the exact same chamber-id
 * strings (ChamberContext) — no key normalization was required.
 *
 * CONSTITUTIONALLY UNDEFINED, not filled in and not permanent: CHAMBER_SCORES
 * only defines entries for 'sovereign-vault-palace', 'hujjah-al-damighah',
 * and 'qiyamah-chamber'. 'ras-amr', 'makman-al-ghayah', and 'universal'
 * have no ACDE pacing score anywhere in the repository. Per Constitutional
 * ruling (2026-07-11): this is Constitutionally Undefined, not a gap this
 * or any engineering package may close by authoring, estimating, or
 * deriving a value — only a future, separately-authorized Constitutional
 * Identity process may define them. `chamberPacing` is therefore honestly
 * typed as nullable. See SIO_ENGINEERING_REVIEW.ts / SIO_004_ENGINEERING_REVIEW.ts.
 *
 * SIO-004 EXTENSION: the original bundle (SIO-001) covered Color/Materials/
 * Lighting/Typography/Spacing/Surfaces/Elements/Interactions but omitted
 * Motion (tokens.ts's MOTION), the Lighting/Animation behavior tables
 * (behaviors.ts), ACLE's lifecycle/relationship/semantic registries
 * (elements.ts), and ACDE's universal (non-per-chamber) cinematic
 * vocabulary (direction.ts) — a real, evidence-based gap against
 * SIO-004's explicit system list, closed below. Nothing new was invented;
 * every added field is an already-exported, already-certified constant.
 */

import {
  PALETTE,
  MATERIALS,
  ILLUMINATION,
  ELEVATION,
  SHADOWS,
  TYPOGRAPHY,
  SPACING,
  SURFACES,
  MOTION,
  ACCESSIBILITY,
  MATERIAL_BEHAVIORS,
  LIGHT_BEHAVIORS,
  VISUAL_ROLES,
  ATMOSPHERES,
  VISUAL_GRAMMAR,
  IMPERIAL_LIBRARY,
  IMPERIAL_LIFECYCLES,
  IMPERIAL_RELATIONSHIPS,
  SEMANTIC_IDENTITIES,
  INTENT_REGISTRY,
  CINEMATIC_PHASES,
  SCENE_TRANSITIONS,
  EMOTIONAL_ARCS,
  CITIZEN_MODES,
  INVISIBLE_DIRECTOR,
  CHAMBER_SCORES,
} from '../design-system';
import type { ChamberScore } from '../design-system';
import { getToneProfile } from '../core/tongue';
import type { ChamberContext, ToneProfile, SentenceRhythm } from '../core/tongue';

export type { ChamberContext, ToneProfile, ChamberScore, SentenceRhythm };

/**
 * The universal, chamber-invariant constitutional constants — identical
 * for every chamber, per tokens.ts's own law ("No chamber-specific values
 * belong here"). Grouped by the engine each field belongs to; each field
 * is an unmodified reference to that engine's own certified export.
 */
export interface SovereignConstitutionalConstants {
  // Color Engine
  readonly palette: typeof PALETTE;
  readonly materials: typeof MATERIALS;
  // Lighting Engine
  readonly illumination: typeof ILLUMINATION;
  readonly materialBehaviors: typeof MATERIAL_BEHAVIORS;
  readonly lightBehaviors: typeof LIGHT_BEHAVIORS;
  readonly atmospheres: typeof ATMOSPHERES;
  readonly visualGrammar: typeof VISUAL_GRAMMAR;
  // Typography Engine
  readonly typography: typeof TYPOGRAPHY;
  // Design Tokens (spatial / depth / accessibility)
  readonly spacing: typeof SPACING;
  readonly elevation: typeof ELEVATION;
  readonly shadows: typeof SHADOWS;
  readonly accessibility: typeof ACCESSIBILITY;
  readonly surfaces: typeof SURFACES;
  // Motion System
  readonly motion: typeof MOTION;
  // UI Engine / Component Language Engine (ACLE)
  readonly elements: typeof IMPERIAL_LIBRARY;
  readonly elementLifecycles: typeof IMPERIAL_LIFECYCLES;
  readonly elementRelationships: typeof IMPERIAL_RELATIONSHIPS;
  readonly semanticIdentities: typeof SEMANTIC_IDENTITIES;
  readonly visualRoles: typeof VISUAL_ROLES;
  // Interaction Engine (AIIE)
  readonly interactions: typeof INTENT_REGISTRY;
  // Transition / Director / Cinematic / Experience Engine (ACDE) — universal vocabulary
  readonly cinematicPhases: typeof CINEMATIC_PHASES;
  readonly sceneTransitions: typeof SCENE_TRANSITIONS;
  readonly emotionalArcs: typeof EMOTIONAL_ARCS;
  readonly citizenModes: typeof CITIZEN_MODES;
  readonly invisibleDirector: typeof INVISIBLE_DIRECTOR;
}

export interface SovereignIdentityBundle {
  readonly context: ChamberContext;
  readonly constitutional: SovereignConstitutionalConstants;
  /** ACDE's per-chamber emotional pacing score — null where none is defined (Constitutionally Undefined, see header). */
  readonly chamberPacing: ChamberScore | null;
  /** The Tongue's per-chamber tone profile — always present; getToneProfile() itself falls back to 'universal'. */
  readonly tone: ToneProfile;
}

const CONSTITUTIONAL_CONSTANTS: SovereignConstitutionalConstants = {
  palette: PALETTE,
  materials: MATERIALS,
  illumination: ILLUMINATION,
  materialBehaviors: MATERIAL_BEHAVIORS,
  lightBehaviors: LIGHT_BEHAVIORS,
  atmospheres: ATMOSPHERES,
  visualGrammar: VISUAL_GRAMMAR,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  elevation: ELEVATION,
  shadows: SHADOWS,
  accessibility: ACCESSIBILITY,
  surfaces: SURFACES,
  motion: MOTION,
  elements: IMPERIAL_LIBRARY,
  elementLifecycles: IMPERIAL_LIFECYCLES,
  elementRelationships: IMPERIAL_RELATIONSHIPS,
  semanticIdentities: SEMANTIC_IDENTITIES,
  visualRoles: VISUAL_ROLES,
  interactions: INTENT_REGISTRY,
  cinematicPhases: CINEMATIC_PHASES,
  sceneTransitions: SCENE_TRANSITIONS,
  emotionalArcs: EMOTIONAL_ARCS,
  citizenModes: CITIZEN_MODES,
  invisibleDirector: INVISIBLE_DIRECTOR,
};

/**
 * Resolves one chamber's complete Sovereign Identity: the universal
 * constitutional constants (every engine SIO-004 named), plus that
 * chamber's own ACDE pacing score (when one exists) and Tongue tone
 * profile. Read-only; decides nothing; originates nothing.
 */
export function getSovereignIdentity(context: ChamberContext): SovereignIdentityBundle {
  return {
    context,
    constitutional: CONSTITUTIONAL_CONSTANTS,
    chamberPacing: CHAMBER_SCORES[context] ?? null,
    tone: getToneProfile(context),
  };
}
