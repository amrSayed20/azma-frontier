import {
  RUNTIME_LIFECYCLE_STAGES,
  RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS,
  RUNTIME_LIFECYCLE_RENEWAL_TRANSITIONS,
  RUNTIME_LIFECYCLE_TRANSITION_OWNERSHIP,
  RUNTIME_LIFECYCLE_TRACEABILITY,
  isForwardTransition,
  isRenewalTransition,
  isSelfLoop,
  isPermittedLifecycleTransition,
  isTerminalStage,
  resolveLifecycleEvent,
  type RuntimeLifecycleStage,
} from '../lifecycle';

describe('Runtime Lifecycle', () => {
  it('declares exactly the eleven stages in constitutional order', () => {
    expect(RUNTIME_LIFECYCLE_STAGES).toEqual([
      'Beginning', 'Listening', 'Understanding', 'Clarifying', 'Preparing',
      'Creating', 'Directing', 'Rendering', 'Reflecting', 'Completing', 'Leaving',
    ]);
    expect(RUNTIME_LIFECYCLE_STAGES).toHaveLength(11);
  });

  it('every stage except Leaving has a forward transition, and Leaving is terminal', () => {
    for (const stage of RUNTIME_LIFECYCLE_STAGES) {
      if (stage === 'Leaving') {
        expect(RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS[stage]).toBeNull();
        expect(isTerminalStage(stage)).toBe(true);
      } else {
        expect(RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS[stage]).not.toBeNull();
        expect(isTerminalStage(stage)).toBe(false);
      }
    }
  });

  it('has exactly one renewal edge: Directing -> Creating', () => {
    expect(RUNTIME_LIFECYCLE_RENEWAL_TRANSITIONS).toEqual({ Directing: 'Creating' });
  });

  it('permits every declared forward transition', () => {
    for (const [from, to] of Object.entries(RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS)) {
      if (to === null) continue;
      expect(isForwardTransition(from as RuntimeLifecycleStage, to)).toBe(true);
      expect(isPermittedLifecycleTransition(from as RuntimeLifecycleStage, to)).toBe(true);
    }
  });

  it('permits the renewal transition and rejects its reverse as a forward transition', () => {
    expect(isRenewalTransition('Directing', 'Creating')).toBe(true);
    expect(isPermittedLifecycleTransition('Directing', 'Creating')).toBe(true);
    expect(isForwardTransition('Directing', 'Creating')).toBe(false);
  });

  it('permits the Clarifying self-loop and no other self-loop', () => {
    expect(isSelfLoop('Clarifying', 'Clarifying')).toBe(true);
    expect(isPermittedLifecycleTransition('Clarifying', 'Clarifying')).toBe(true);
    expect(isSelfLoop('Beginning', 'Beginning')).toBe(false);
  });

  it('rejects skipped and reversed transitions', () => {
    expect(isPermittedLifecycleTransition('Beginning', 'Creating')).toBe(false);
    expect(isPermittedLifecycleTransition('Rendering', 'Beginning')).toBe(false);
    expect(isPermittedLifecycleTransition('Leaving', 'Beginning')).toBe(false);
  });

  it('resolves the correct lifecycle event for each transition class', () => {
    expect(resolveLifecycleEvent('Beginning', 'Listening')).toEqual({ kind: 'StageEntered', stage: 'Listening' });
    expect(resolveLifecycleEvent('Directing', 'Creating')).toEqual({ kind: 'StageRenewed', from: 'Directing', to: 'Creating' });
    expect(resolveLifecycleEvent('Clarifying', 'Clarifying')).toEqual({ kind: 'StageRepeated', stage: 'Clarifying' });
    expect(resolveLifecycleEvent('Beginning', 'Creating')).toBeNull();
  });

  it('gives every stage a transition owner and a traceability entry', () => {
    for (const stage of RUNTIME_LIFECYCLE_STAGES) {
      expect(RUNTIME_LIFECYCLE_TRANSITION_OWNERSHIP[stage]).toBeTruthy();
      expect(RUNTIME_LIFECYCLE_TRACEABILITY[stage]).toBeTruthy();
      expect(RUNTIME_LIFECYCLE_TRACEABILITY[stage].primaryEntities.length).toBeGreaterThan(0);
      expect(RUNTIME_LIFECYCLE_TRACEABILITY[stage].source.length).toBeGreaterThan(0);
    }
  });
});
