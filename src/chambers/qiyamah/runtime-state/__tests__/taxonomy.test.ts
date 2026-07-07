import {
  RUNTIME_STATE_CLASSIFICATION_TAXONOMY,
  RUNTIME_STATE_VISIBILITY_MODEL,
  RUNTIME_STATE_SYNCHRONIZATION_MODEL,
  RUNTIME_STATE_RESTORATION_MODEL,
} from '../taxonomy';

const ALL_FIFTEEN_STATE_NAMES = [
  'RuntimeContext', 'ChamberRuntimeState', 'RuntimeState', 'JourneyState', 'CreativeSessionState',
  'IdeaState', 'PromptState', 'DecisionState', 'DirectorState', 'GhostGuideState',
  'CompanionState', 'ReflectionState', 'RenderingState', 'CompletionState', 'ExitState',
].sort();

describe('Runtime State Classification Taxonomy', () => {
  it('classifies exactly the fifteen named runtime states, each exactly once', () => {
    const allMembers = Object.values(RUNTIME_STATE_CLASSIFICATION_TAXONOMY).flatMap((entry) => entry.members);
    expect(allMembers.sort()).toEqual(ALL_FIFTEEN_STATE_NAMES);
    expect(new Set(allMembers).size).toBe(15);
  });
});

describe('Runtime State Visibility Model', () => {
  it('classifies exactly the fifteen named runtime states, each exactly once', () => {
    const allMembers = [
      ...RUNTIME_STATE_VISIBILITY_MODEL.INTERNAL_ONLY.members,
      ...RUNTIME_STATE_VISIBILITY_MODEL.FELT_ONLY.members,
      ...RUNTIME_STATE_VISIBILITY_MODEL.NOT_APPLICABLE.members,
    ];
    expect(allMembers.sort()).toEqual(ALL_FIFTEEN_STATE_NAMES);
    expect(new Set(allMembers).size).toBe(15);
  });
});

describe('Runtime State Synchronization Model', () => {
  it('names at least one state in every synchronization rule', () => {
    for (const rule of Object.values(RUNTIME_STATE_SYNCHRONIZATION_MODEL)) {
      expect(rule.states.length).toBeGreaterThan(0);
      expect(rule.rule.length).toBeGreaterThan(0);
    }
  });
});

describe('Runtime State Restoration Model', () => {
  it('accounts for every act-scoped and session-scoped state', () => {
    const actScoped = RUNTIME_STATE_CLASSIFICATION_TAXONOMY.ACT_SCOPED.members;
    const sessionScoped = RUNTIME_STATE_CLASSIFICATION_TAXONOMY.SESSION_SCOPED.members;
    expect(RUNTIME_STATE_RESTORATION_MODEL.across_act_boundary.states.slice().sort()).toEqual([...actScoped].sort());
    expect(RUNTIME_STATE_RESTORATION_MODEL.across_session_boundary.states.slice().sort()).toEqual([...sessionScoped].sort());
  });
});
