import * as facade from '../facade';

// The exact set of runtime (value-level) names the facade must expose — types
// are erased at runtime and are instead checked by `tsc` via direct usage in
// this repo's other test files.
const EXPECTED_VALUE_EXPORTS = [
  // lifecycle
  'RUNTIME_LIFECYCLE_STAGES', 'isForwardTransition', 'isRenewalTransition',
  'isSelfLoop', 'isPermittedLifecycleTransition', 'isTerminalStage', 'resolveLifecycleEvent',
  // states
  'STORY_BEATS', 'PARTNERSHIP_PHASES', 'TRUST_STATES', 'CITIZEN_EXPRESSION_STATES',
  'INVISIBLE_DIRECTOR_MODES', 'GHOST_GUIDE_MODES', 'CHAMBER_RELATIONSHIP_MODES',
  'CROSSING_STATES', 'PRESENTATION_STATES',
  // signals
  'RUNTIME_SIGNAL_KINDS', 'isPermittedEmitter', 'visibilityOf', 'isCitizenVisibleEffect',
  // contracts
  'mayGhostGuideIntervene', 'mayCompanionSpeak', 'mayInvisibleDirectorChangeRhythm',
  'isChamberSilent', 'RUNTIME_INVARIANTS',
  // facade-native guarded accessors
  'stateMetadataOf', 'stateVisibilityOf',
].sort();

// Value-level names declared INTERNAL in boundary.ts — must never appear here.
const FORBIDDEN_INTERNAL_LEAKS = [
  'RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS',
  'RUNTIME_LIFECYCLE_RENEWAL_TRANSITIONS',
  'RUNTIME_LIFECYCLE_SELF_LOOPS',
  'RUNTIME_LIFECYCLE_TRANSITION_OWNERSHIP',
  'RUNTIME_LIFECYCLE_TRACEABILITY',
  'RUNTIME_STATE_METADATA',
  'RUNTIME_SIGNAL_EMITTERS',
  'RUNTIME_SIGNAL_VISIBILITY',
];

describe('Runtime Interfaces Facade', () => {
  it('exposes exactly the expected value-level public surface, no more, no less', () => {
    expect(Object.keys(facade).sort()).toEqual(EXPECTED_VALUE_EXPORTS);
  });

  it('never leaks a Foundation-internal raw table', () => {
    for (const forbidden of FORBIDDEN_INTERNAL_LEAKS) {
      expect(Object.prototype.hasOwnProperty.call(facade, forbidden)).toBe(false);
    }
  });

  it('stateMetadataOf resolves a known state and returns undefined for an unknown one', () => {
    const entry = facade.stateMetadataOf('CompanionState');
    expect(entry).toBeDefined();
    expect(entry?.ownerEntity).toBe('ParticipantOrchestrator');
    expect(facade.stateMetadataOf('NotARealState')).toBeUndefined();
  });

  it('stateVisibilityOf resolves the same visibility as stateMetadataOf', () => {
    expect(facade.stateVisibilityOf('RenderingState')).toBe('FELT_ONLY');
    expect(facade.stateVisibilityOf('TrustRegisterDoesNotExistHere')).toBeUndefined();
  });

  it('re-exports functioning guard behavior identical to the Foundation', () => {
    expect(facade.isPermittedLifecycleTransition('Beginning', 'Listening')).toBe(true);
    expect(facade.isPermittedEmitter('CitizenExpression', 'Citizen')).toBe(true);
  });
});
