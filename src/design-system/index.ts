/**
 * AZMA OS — Visual Identity Engine
 * Public API — V1.1
 *
 * Import from here — never directly from tokens.ts or behaviors.ts.
 *
 * CSS must be imported separately in app/layout.tsx:
 *   import '@/src/design-system/azma-identity.css'    ← V1.0 foundation
 *   import '@/src/design-system/azma-behaviors.css'   ← V1.1 behaviors
 */

// ── V1.0 — Constitutional Tokens ──────────────────────────────────────────
export {
  MATERIALS,
  PALETTE,
  ILLUMINATION,
  ELEVATION,
  SHADOWS,
  SURFACES,
  TYPOGRAPHY,
  SPACING,
  MOTION,
  ACCESSIBILITY,
  EXTENSION,
  goldGlow,
  goldAt,
  shadow,
  transition,
  zLayer,
} from './tokens';

export type { MaterialName } from './tokens';

// ── V1.1 — Behavioral Layer ────────────────────────────────────────────────
export {
  MATERIAL_BEHAVIORS,
  LIGHT_BEHAVIORS,
  VISUAL_ROLES,
  ATMOSPHERES,
  VISUAL_GRAMMAR,
  setAtmosphere,
  clearAtmosphere,
  setMaterialState,
  roleClass,
  atmosphereCssVars,
  getMaterialBehavior,
} from './behaviors';

export type {
  MaterialState,
  MaterialBehavior,
  LightBehaviorName,
  LightBehavior,
  VisualRole,
  RoleBehavior,
  AtmosphereName,
  AtmosphericProfile,
} from './behaviors';

// ── V1.0 ACLE — Component Language Engine ─────────────────────────────────
export {
  IMPERIAL_LIBRARY,
  IMPERIAL_LIFECYCLES,
  IMPERIAL_RELATIONSHIPS,
  SEMANTIC_IDENTITIES,
  ELEMENT_PORTAL,
  ELEMENT_RECORD,
  ELEMENT_VERDICT,
  ELEMENT_SOVEREIGN_ACTION,
  ELEMENT_GUIDE,
  ELEMENT_INDICATOR,
  ELEMENT_SEAL,
  ELEMENT_VESSEL,
  ELEMENT_PATH,
  ELEMENT_DECLARATION,
  LIFECYCLE_PORTAL,
  LIFECYCLE_RECORD,
  LIFECYCLE_VERDICT,
  LIFECYCLE_SOVEREIGN_ACTION,
  LIFECYCLE_GUIDE,
  LIFECYCLE_INDICATOR,
  LIFECYCLE_SEAL,
  RELATIONSHIP_PORTAL,
  RELATIONSHIP_RECORD,
  RELATIONSHIP_VERDICT,
  RELATIONSHIP_SOVEREIGN_ACTION,
  RELATIONSHIP_GUIDE,
  validateSovereignAction,
  validateVerdict,
  hasConstitutionalIdentity,
  getElementFamily,
  getElementByClass,
} from './elements';

export type {
  ElementFamily,
  AuthorityLevel,
  AppearanceCharacter,
  ElementConstitution,
  LifecyclePhase,
  ElementLifecycle,
  ElementRelationship,
  SemanticIdentity,
} from './elements';

// ── ACDE V1.0 — Cinematic Direction Engine ────────────────────────────────
export {
  CINEMATIC_PHASES,
  INVISIBLE_DIRECTOR,
  SCENE_TRANSITIONS,
  EMOTIONAL_ARCS,
  CITIZEN_MODES,
  CHAMBER_SCORES,
  getVariation,
  readDirectionMemory,
  writeDirectionMemory,
  markEffectivePause,
  markInterruption,
  setMode,
  getMode,
  setPhase,
  getPhase,
  advancePhase,
  setCompanionState,
  companionShouldSpeak,
  applyVariation,
  resolveTransition,
  beginTransition,
  transitionArrive,
  transitionComplete,
  beginJourney,
  advanceJourney,
  endJourney,
  summonDirector,
  withdrawDirector,
  createChamberScore,
} from './direction';

// ── AIIE V1.0 — Imperial Interaction Engine ───────────────────────────────
export {
  INTENT_REGISTRY,
  getIntentConstitution,
  getIntentForACLEFamily,
  readInteractionProfile,
  writeInteractionProfile,
  recordInteractionSignal,
  deriveInteractionPreferences,
  applyAdaptation,
  initializeInteraction,
  setInteractionState,
  getElementWeight,
} from './interaction';

export type {
  InteractionIntent,
  InteractionWeight,
  InteractionState,
  RhythmPhase,
  RhythmTiming,
  FeedbackCharacter,
  IntentConstitution,
  InteractionSignals,
  InteractionProfile,
  InteractionSignalType,
  InteractionSignalEvent,
} from './interaction';

export type {
  CinematicPhase,
  PhaseDefinition,
  EmotionalBeat,
  EmotionalCurve,
  CompanionState,
  CompanionDirection,
  DirectorPresence,
  DirectorDefinition,
  SceneTransitionType,
  SceneTransition,
  CitizenMode,
  ModeProfile,
  VariationProfile,
  DirectionMemory,
  JourneyDepth,
  CinematicJourney,
  ChamberScore,
} from './direction';
