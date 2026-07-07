import { RUNTIME_READINESS_CHECKPOINTS, RUNTIME_READINESS_GATES, RUNTIME_READINESS_INVARIANTS } from '../checkpoints-and-gates';

describe('Runtime Readiness Checkpoints', () => {
  it('covers stages 5 through 12 in order, exactly once each', () => {
    expect(RUNTIME_READINESS_CHECKPOINTS.map((c) => c.stage)).toEqual([5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('marks every checkpoint through stage 11 as PASS, and stage 12 as in progress', () => {
    for (const checkpoint of RUNTIME_READINESS_CHECKPOINTS) {
      if (checkpoint.stage < 12) {
        expect(checkpoint.status).toBe('PASS');
      } else {
        expect(checkpoint.status).toContain('IN PROGRESS');
      }
    }
  });
});

describe('Runtime Readiness Gates', () => {
  it('requires the Chief Architect for every gate\'s approval', () => {
    const gates = [
      RUNTIME_READINESS_GATES.gate_1_completeness_sign_off,
      RUNTIME_READINESS_GATES.gate_2_dependency_sign_off,
      RUNTIME_READINESS_GATES.gate_3_traceability_sign_off,
      RUNTIME_READINESS_GATES.gate_4_integration_sign_off,
      RUNTIME_READINESS_GATES.gate_5_validation_sign_off,
      RUNTIME_READINESS_GATES.gate_6_final_readiness_declaration,
    ];
    for (const gate of gates) {
      expect(gate.approver).toContain('Chief Architect');
    }
  });

  it('never self-grants Gate 6', () => {
    expect(RUNTIME_READINESS_GATES.currentStatus).toContain('reserved for the Chief Architect');
  });
});

describe('Runtime Readiness Invariants', () => {
  it('is non-empty and every entry is traceable', () => {
    expect(RUNTIME_READINESS_INVARIANTS.length).toBeGreaterThan(0);
    for (const invariant of RUNTIME_READINESS_INVARIANTS) {
      expect(invariant.invariant.length).toBeGreaterThan(0);
      expect(invariant.source.length).toBeGreaterThan(0);
    }
  });
});
