/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME FOUNDATION — Runtime Signals
 * Construction Package: Living Runtime — Stage 5 of 13
 *
 * Gives a typed, structural form to the sixteen named events already approved in
 * events.ts (twelve cataloged signals + four local signals). Every member below is
 * a payload SHAPE only — abstract enums and booleans, never free-text content — so
 * that no constitutionally-forbidden content (raw Citizen expression text, stored
 * memory content, mechanism detail) can ever be carried on a typed signal.
 *
 * Also defines: Runtime Permissions (who may emit each signal), Runtime Visibility
 * (reusing SYSTEMIC_EVENT_VISIBILITY, events.ts), and the guard functions that
 * mechanically check both.
 */

import type { StoryBeat, CrossingStateValue, PartnershipPhase, TrustState } from './states';

// ═══════════════════════════════════════════════════════════════════════════
// THE SIXTEEN RUNTIME SIGNALS
// ═══════════════════════════════════════════════════════════════════════════

export type CreativeActState = 'idle' | 'pursuit-underway' | 'markers-evaluating' | 'revelation-imminent' | 'complete';
export type CitizenExpressionForm = 'certainty' | 'partial' | 'confusion' | 'conviction';

export type RuntimeSignal =
  | { readonly kind: 'ConstitutionalComplianceRequirement' }
  | { readonly kind: 'PartnershipDepthSignal'; readonly phase: PartnershipPhase }
  | { readonly kind: 'UnderstandingPrecisionSignal'; readonly precision: number }
  | { readonly kind: 'TrustDepthSignal'; readonly trustState: TrustState; readonly vulnerabilityDepth: number }
  | { readonly kind: 'StoryBeatDeclaration'; readonly beat: StoryBeat }
  | { readonly kind: 'NarrativeContextSignal'; readonly beat: StoryBeat; readonly turningPointWeight: number }
  | { readonly kind: 'EnvironmentalQualitySignal'; readonly presenceQuality: string; readonly temporalQuality: string; readonly spatialQuality: string }
  | { readonly kind: 'MarkerConfirmationSignal'; readonly allMarkersPass: true }
  | { readonly kind: 'AfterCompletionSignal'; readonly inwardCrossingConfirmed: true }
  | { readonly kind: 'PresentationAuthorization'; readonly authorized: true }
  | { readonly kind: 'GenuineConfirmation'; readonly genuine: true }
  | { readonly kind: 'CitizenEncounterConfirmation'; readonly encounterComplete: true }
  | { readonly kind: 'RelationalCrossingUpdate'; readonly domainCheckPassed: true }
  | { readonly kind: 'CreativeActStateSignal'; readonly actState: CreativeActState }
  | { readonly kind: 'CitizenExpression'; readonly form: CitizenExpressionForm }
  | { readonly kind: 'CrossingState'; readonly crossing: CrossingStateValue };

export type RuntimeSignalKind = RuntimeSignal['kind'];

export const RUNTIME_SIGNAL_KINDS: readonly RuntimeSignalKind[] = [
  'ConstitutionalComplianceRequirement',
  'PartnershipDepthSignal',
  'UnderstandingPrecisionSignal',
  'TrustDepthSignal',
  'StoryBeatDeclaration',
  'NarrativeContextSignal',
  'EnvironmentalQualitySignal',
  'MarkerConfirmationSignal',
  'AfterCompletionSignal',
  'PresentationAuthorization',
  'GenuineConfirmation',
  'CitizenEncounterConfirmation',
  'RelationalCrossingUpdate',
  'CreativeActStateSignal',
  'CitizenExpression',
  'CrossingState',
];

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME PERMISSIONS
// Who may emit each signal. Copied forward from SIGNAL_INTERFACE_CONTRACTS and
// LOCAL_SIGNAL_INTERFACE_CONTRACTS (interfaces.ts).
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_SIGNAL_EMITTERS: Readonly<Record<RuntimeSignalKind, readonly string[]>> = {
  ConstitutionalComplianceRequirement: ['PurposeAuthority', 'CharacterAuthority'],
  PartnershipDepthSignal:              ['TrustRegister', 'CreativeProfile', 'PartnershipChronology'],
  UnderstandingPrecisionSignal:        ['CreativeProfile'],
  TrustDepthSignal:                    ['TrustRegister'],
  StoryBeatDeclaration:                ['NarrativeClock'],
  NarrativeContextSignal:              ['NarrativeClock', 'StoryCoherence'],
  EnvironmentalQualitySignal:          ['PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor'],
  MarkerConfirmationSignal:            ['PursuitEngine'],
  AfterCompletionSignal:               ['CrossingTracker'],
  PresentationAuthorization:           ['PursuitEngine'],
  GenuineConfirmation:                 ['PursuitEngine'],
  CitizenEncounterConfirmation:        ['RevealCoordinator'],
  RelationalCrossingUpdate:            ['CrossingTracker'],
  CreativeActStateSignal:              ['PursuitEngine', 'RevealCoordinator'],
  CitizenExpression:                   ['Citizen'],
  CrossingState:                       ['CrossingTracker'],
};

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME VISIBILITY
// Reuses SYSTEMIC_EVENT_VISIBILITY (events.ts) verbatim.
// ═══════════════════════════════════════════════════════════════════════════

export type RuntimeSignalVisibility = 'INTERNAL_ONLY' | 'FELT_EFFECT_ONLY' | 'CITIZEN_ORIGINATED' | 'NOT_APPLICABLE';

export const RUNTIME_SIGNAL_VISIBILITY: Readonly<Record<RuntimeSignalKind, RuntimeSignalVisibility>> = {
  ConstitutionalComplianceRequirement: 'NOT_APPLICABLE',
  PartnershipDepthSignal:              'INTERNAL_ONLY',
  UnderstandingPrecisionSignal:        'INTERNAL_ONLY',
  TrustDepthSignal:                    'INTERNAL_ONLY',
  StoryBeatDeclaration:                'FELT_EFFECT_ONLY',
  NarrativeContextSignal:              'INTERNAL_ONLY',
  EnvironmentalQualitySignal:          'FELT_EFFECT_ONLY',
  MarkerConfirmationSignal:            'FELT_EFFECT_ONLY',
  AfterCompletionSignal:               'FELT_EFFECT_ONLY',
  PresentationAuthorization:           'INTERNAL_ONLY',
  GenuineConfirmation:                 'INTERNAL_ONLY',
  CitizenEncounterConfirmation:        'INTERNAL_ONLY',
  RelationalCrossingUpdate:            'INTERNAL_ONLY',
  CreativeActStateSignal:              'FELT_EFFECT_ONLY',
  CitizenExpression:                   'CITIZEN_ORIGINATED',
  CrossingState:                       'INTERNAL_ONLY',
};

// ═══════════════════════════════════════════════════════════════════════════
// GUARDS
// Pure, table-driven — mechanically executes already-approved permission and
// visibility rules; invents nothing.
// ═══════════════════════════════════════════════════════════════════════════

export function isPermittedEmitter(kind: RuntimeSignalKind, entity: string): boolean {
  return RUNTIME_SIGNAL_EMITTERS[kind].includes(entity);
}

export function visibilityOf(kind: RuntimeSignalKind): RuntimeSignalVisibility {
  return RUNTIME_SIGNAL_VISIBILITY[kind];
}

export function isCitizenVisibleEffect(kind: RuntimeSignalKind): boolean {
  const visibility = visibilityOf(kind);
  return visibility === 'FELT_EFFECT_ONLY' || visibility === 'CITIZEN_ORIGINATED';
}
