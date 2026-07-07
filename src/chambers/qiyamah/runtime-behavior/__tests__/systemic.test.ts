import {
  RUNTIME_INTERACTION_SEQUENCING,
  RUNTIME_SYSTEMIC_SIGNAL_PROPAGATION,
  RUNTIME_SYSTEMIC_SYNCHRONIZATION,
  RUNTIME_SYSTEMIC_INVARIANTS,
  RUNTIME_BEHAVIORAL_VALIDATION_ROLLUP,
} from '../systemic';
import { RUNTIME_LIFECYCLE_STAGES } from '../../runtime/lifecycle';

describe('Runtime Interaction Sequencing', () => {
  it('covers all eleven lifecycle stages, in order, exactly once each', () => {
    const stages = RUNTIME_INTERACTION_SEQUENCING.steps.map((step) => step.stage);
    expect(stages).toEqual([...RUNTIME_LIFECYCLE_STAGES]);
  });

  it('names a contract and a behavior for every step', () => {
    for (const step of RUNTIME_INTERACTION_SEQUENCING.steps) {
      expect(step.contract.length).toBeGreaterThan(0);
      expect(step.behavior.length).toBeGreaterThan(0);
    }
  });
});

describe('Runtime Systemic Signal Propagation', () => {
  it('classifies citizen-originated, felt-effect, and internal-only signals distinctly', () => {
    expect(RUNTIME_SYSTEMIC_SIGNAL_PROPAGATION.citizen_originated).toContain('CitizenExpression');
    expect(RUNTIME_SYSTEMIC_SIGNAL_PROPAGATION.felt_effect_signals).toContain('StoryBeatDeclaration');
    expect(RUNTIME_SYSTEMIC_SIGNAL_PROPAGATION.internal_only_signals).toContain('RelationalCrossingUpdate');
  });
});

describe('Runtime Systemic Synchronization', () => {
  it('states the single-timing-context rule and the rendering-silence rule', () => {
    expect(RUNTIME_SYSTEMIC_SYNCHRONIZATION.single_timing_context_rule.length).toBeGreaterThan(0);
    expect(RUNTIME_SYSTEMIC_SYNCHRONIZATION.rendering_silence_rule.length).toBeGreaterThan(0);
  });
});

describe('Runtime Systemic Invariants', () => {
  it('is non-empty and every entry is fully traceable', () => {
    expect(RUNTIME_SYSTEMIC_INVARIANTS.length).toBeGreaterThan(0);
    for (const invariant of RUNTIME_SYSTEMIC_INVARIANTS) {
      expect(invariant.id).toBeTruthy();
      expect(invariant.rule).toBeTruthy();
      expect(invariant.source).toBeTruthy();
    }
  });
});

describe('Runtime Behavioral Validation Rollup', () => {
  it('names all six constitutional validation points, including the empty one', () => {
    const keys = Object.keys(RUNTIME_BEHAVIORAL_VALIDATION_ROLLUP).filter((k) => k !== 'note' && k !== 'traceability');
    expect(keys.sort()).toEqual([
      'validation_1_imagination_reception',
      'validation_2_relationship_mode',
      'validation_3_pre_presentation_markers',
      'validation_4_revelation_presentation',
      'validation_5_memory_update',
      'validation_6_experience_layer_compliance',
    ].sort());
  });

  it('explains why validation_5_memory_update has no direct Runtime Interface contract', () => {
    expect(RUNTIME_BEHAVIORAL_VALIDATION_ROLLUP.validation_5_memory_update).toEqual([]);
    expect(RUNTIME_BEHAVIORAL_VALIDATION_ROLLUP.note.length).toBeGreaterThan(0);
  });
});
