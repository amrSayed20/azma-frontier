/**
 * AZMA OS — Tongue Constitution (ATC) V2.0
 * The Final Constitutional Completion of the Imperial Consciousness
 *
 * Public barrel export — import from here, never directly.
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
