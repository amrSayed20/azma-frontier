/**
 * AZMA OS — THE IMPERIAL TONGUE (formerly "Tongue Constitution ATC V2.0")
 * Constitutional Package I — The Imperial Tongue Constitutional Refoundation
 *
 * Public barrel export — import from here, never directly.
 *
 * REFOUNDATION DISCLOSURE: this organ's constitutional identity is now
 * the Imperial Tongue, per the completed Constitutional Deliberation
 * (Engineering Review, Constitutional Clarification Report — both
 * certified). See constitutional-classification.ts for the full,
 * cited Permanent/Transitional classification of every file below.
 * Nothing was removed, relocated, renamed, or rewritten by this
 * Refoundation — every export that existed before still exists,
 * unchanged, at this same path. voice.ts, this file's own
 * ChamberContext/CONTEXT_ROLES/IMPERIAL_CONSCIOUSNESS vocabulary, and
 * (per a post-Certification Council correction) memory.ts's Citizen
 * Memory are classified Permanent — the Imperial Tongue's own faithful
 * expression capability, memory.ts having been found to represent
 * Citizen Memory rather than the Charter's own Constitutional Memory.
 * Every other file remains Transitional — preserved exactly in place
 * until its own rightful Constitutional Home is born.
 * The organ's registered id (`sovereign-tongue`) is deliberately
 * unchanged: no Constitutional Decision has yet certified renaming it,
 * and DirectorStage.tsx's own circulation calls still report under that
 * exact origin id.
 *
 * The Tongue gives the Empire its voice.
 * The Core operates the Empire.
 * The Chambers give the Empire their purpose.
 * Together they become AZMA OS.
 *
 * Usage:
 *   import { IMPERIAL_CONSCIOUSNESS, assessUnderstanding, validateResponse } from '@/src/core/tongue';
 */

// ── Constitution — Identity, Modes, Validation ────────────────────────────
export {
  IMPERIAL_CONSCIOUSNESS,
  CONTEXT_ROLES,
  assessUnderstanding,
  validateResponse,
  selectMode,
} from './constitution';

export type {
  ChamberContext,
  CommunicationMode,
  InputMethod,
  MomentQuality,
  UnderstandingAssessment,
  TongueIntent,
  ViolationSeverity,
  ImperialViolation,
  ImperialValidation,
  GrowthRecord,
  TongueWisdom,
} from './constitution';

// ── Memory — Citizen Profile and Behavioral Learning ──────────────────────
export {
  readCitizenProfile,
  writeCitizenProfile,
  recordSignal,
  derivePreferences,
  inferDepth,
  inferPace,
  inferSilencePreference,
  inferCreativity,
  inferExamplesPreference,
  addToFingerprint,
  isInFingerprint,
  readWisdom,
  recordGrowth,
  updateLanguage,
} from './memory';

export type {
  CitizenProfile,
  CitizenSignals,
  BehavioralSignal,
  SignalEvent,
  DepthPreference,
  PacePreference,
  CreativityPreference,
} from './memory';

// ── V1.1 — Continuity (Article XVII) ──────────────────────────────────────
export {
  getThread,
  updateThread,
  clearThread,
  recordChamberTransition,
  getContinuityContext,
  recordTurn,
  addMomentumToThread,
  consumeMomentum,
  getActiveMomentumForContext,
} from './continuity';

export type {
  MomentumType,
  MomentumPoint,
  ChamberVisit,
  ConversationThread,
} from './continuity';

// ── V1.1 — Intention (Articles XIV + XVI) ─────────────────────────────────
export {
  determineIntention,
  assessOutcome,
  updateIntentionFromOutcome,
} from './intention';

export type {
  CitizenOutcomeType,
  TongueIntention,
  OutcomeSignal,
  OutcomeAssessment,
} from './intention';

// ── V1.1 — Guardian (Articles XV, XVIII, XIX) ─────────────────────────────
export {
  assessQuality,
  identifyOpportunity,
  citizenIsOnTrack,
  guardianApproach,
} from './guardian';

export type {
  QualityDimension,
  GuardianApproach,
  QualityOpportunity,
  QualityAssessment,
} from './guardian';

// ── V1.1 — Momentum (Article XX) ──────────────────────────────────────────
export {
  generateMomentum,
  hasPendingMomentum,
  getRelevantMomentum,
  consumeMomentumPoint,
  readMomentumIntent,
} from './momentum';

// ── V2.0 — Creator (Articles XVIII, XIX, XX) ──────────────────────────────
export {
  inferCreatorProfile,
  measureFlowState,
  shouldInterventionWait,
  assessCapabilityTrend,
  responseBuildsCapability,
} from './creator';

export type {
  CreatorRhythm,
  CreatorConfidence,
  CreatorAmbition,
  CreatorPatience,
  CreatorStandards,
  CreatorCollaboration,
  CreatorAutonomy,
  CreativeDimension,
  CreatorProfile,
  FlowDepth,
  InterruptionRisk,
  FlowState,
  CapabilityTrend,
} from './creator';

// ── V2.0 — Conscience (Articles XXII, XXIV, XXV + Article XVII extension) ─
export {
  validateDignity,
  CONSTITUTIONAL_PERMANENCE,
  imperialConscience,
  selectExtendedMode,
} from './conscience';

export type {
  DignityGate,
  ConscienceSeverity,
  ConscienceIntervention,
  ConscienceSignal,
} from './conscience';

// ── Voice — Chamber Tones and Style Calibration ───────────────────────────
export {
  TONE_PROFILES,
  getToneProfile,
  buildStyleDirective,
  selectCommunicationMode,
  modeToCompanionState,
  shapeResponse,
} from './voice';

export type {
  VocabularyCharacter,
  SentenceRhythm,
  QuestionStyle,
  ExampleFrequency,
  ToneProfile,
  StyleDirective,
  ModeContext,
  TongueCompanionState,
  TongueResponseShape,
} from './voice';

// ── Constitutional Classification (Package I — The Imperial Tongue
// Constitutional Refoundation) — declarative only, added by this
// Refoundation; removes, renames, and rewrites nothing above. ─────────────
export {
  IMPERIAL_TONGUE_RESPONSIBILITIES,
  listPermanentResponsibilities,
  listTransitionalResponsibilities,
} from './constitutional-classification';

export type {
  ImperialTongueResponsibilityClass,
  ImperialTongueResponsibilityRecord,
} from './constitutional-classification';
