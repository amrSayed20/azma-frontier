import {
  PRIORITY_HIERARCHY,
  resolvePriorityConflict,
  validateNarrativeIntegrity,
  deriveCreatorGoalFromPrompt,
  deriveCreatorGoalFromFormalContract,
  determinePrimaryConsideration,
  determinePrimaryNode,
  FORMAL_GOAL_CONTRACT_READ_PATH,
  FULL_COMMERCIAL_INTENT_READ_DECISION,
  RHYTHM_TRANSITION_TIMING_BASIS,
} from '../automatic-director-constitution';
import { GoalPriority, PacingPreference, TransitionPreference } from '../../makman-al-ghayah/goal-contracts';
import { DistributionTier } from '../../makman-al-ghayah/publication-contracts';

describe('The Cinematic Judgment Constitution — Article IX, Priority Hierarchy', () => {
  it('fixes Creator Goal as the first priority and Cinematic Beauty as the last, per the ratified Charter', () => {
    expect(PRIORITY_HIERARCHY[0]).toBe('creator-goal');
    expect(PRIORITY_HIERARCHY[PRIORITY_HIERARCHY.length - 1]).toBe('cinematic-beauty');
    expect(PRIORITY_HIERARCHY).toEqual([
      'creator-goal',
      'constitutional-identity',
      'narrative-integrity',
      'emotional-continuity',
      'cinematic-beauty',
    ]);
  });

  it('resolves a conflict in favor of whichever consideration comes first in the hierarchy, regardless of argument order', () => {
    expect(resolvePriorityConflict('cinematic-beauty', 'creator-goal')).toBe('creator-goal');
    expect(resolvePriorityConflict('creator-goal', 'cinematic-beauty')).toBe('creator-goal');
    expect(resolvePriorityConflict('narrative-integrity', 'emotional-continuity')).toBe('narrative-integrity');
  });

  it('returns the same consideration when there is no real conflict', () => {
    expect(resolvePriorityConflict('narrative-integrity', 'narrative-integrity')).toBe('narrative-integrity');
  });
});

describe('The Cinematic Judgment Constitution — Article III/IV, Narrative Integrity', () => {
  it('is valid for an empty or well-formed canvas', () => {
    expect(validateNarrativeIntegrity([]).valid).toBe(true);
    expect(
      validateNarrativeIntegrity([
        { nodeId: 'n1', assetId: 'a1', temporal: { globalStartTimeSeconds: 0, playDurationSeconds: 5 } },
        { nodeId: 'n2', assetId: 'a2' },
      ]).valid,
    ).toBe(true);
  });

  it('rejects the same asset occupying more than one node', () => {
    const result = validateNarrativeIntegrity([
      { nodeId: 'n1', assetId: 'a1' },
      { nodeId: 'n2', assetId: 'a1' },
    ]);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toMatch(/appears in more than one node/);
  });

  it('rejects a negative start time', () => {
    const result = validateNarrativeIntegrity([
      { nodeId: 'n1', assetId: 'a1', temporal: { globalStartTimeSeconds: -5, playDurationSeconds: 3 } },
    ]);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toMatch(/negative start time/);
  });

  it('rejects a non-positive duration', () => {
    const result = validateNarrativeIntegrity([
      { nodeId: 'n1', assetId: 'a1', temporal: { globalStartTimeSeconds: 0, playDurationSeconds: 0 } },
    ]);
    expect(result.valid).toBe(false);
    expect(result.violations[0]).toMatch(/non-positive duration/);
  });

  it('reports every real violation at once, not just the first', () => {
    const result = validateNarrativeIntegrity([
      { nodeId: 'n1', assetId: 'a1', temporal: { globalStartTimeSeconds: -1, playDurationSeconds: 0 } },
      { nodeId: 'n2', assetId: 'a1' },
    ]);
    expect(result.violations.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Package VII — Creator Goal Input', () => {
  it('recognizes a real, non-empty generationPrompt as a stated Goal, echoed verbatim', () => {
    expect(deriveCreatorGoalFromPrompt('the empire at dawn')).toEqual({
      stated: true,
      statedIntent: 'the empire at dawn',
      source: 'asset-prompt-echo',
    });
  });

  it('is honest that no Goal was stated for undefined, null, empty, or non-string values — never fabricates one', () => {
    expect(deriveCreatorGoalFromPrompt(undefined)).toEqual({ stated: false, source: 'asset-prompt-echo' });
    expect(deriveCreatorGoalFromPrompt(null)).toEqual({ stated: false, source: 'asset-prompt-echo' });
    expect(deriveCreatorGoalFromPrompt('')).toEqual({ stated: false, source: 'asset-prompt-echo' });
    expect(deriveCreatorGoalFromPrompt('   ')).toEqual({ stated: false, source: 'asset-prompt-echo' });
    expect(deriveCreatorGoalFromPrompt(42)).toEqual({ stated: false, source: 'asset-prompt-echo' });
  });

  it('resolves creator-goal as primary when a real Goal is stated, per the fixed hierarchy order', () => {
    expect(determinePrimaryConsideration({ stated: true, statedIntent: 'x', source: 'asset-prompt-echo' })).toBe('creator-goal');
  });

  it('resolves constitutional-identity as primary when no real Goal is stated, rather than claiming Goal-driven reasoning that did not happen', () => {
    expect(determinePrimaryConsideration({ stated: false, source: 'asset-prompt-echo' })).toBe('constitutional-identity');
  });
});

describe('Package VIII — Honest Creator Goal Source Integration (superseded finding, kept as history)', () => {
  it('never lets deriveCreatorGoalFromPrompt claim a source other than asset-prompt-echo', () => {
    expect(deriveCreatorGoalFromPrompt('anything').source).toBe('asset-prompt-echo');
    expect(deriveCreatorGoalFromPrompt(undefined).source).toBe('asset-prompt-echo');
  });
});

describe('Package IX — Formal Goal Contract Triad Closure', () => {
  it('records, as real tested data, that the formal GoalContract read path is now honestly available', () => {
    expect(FORMAL_GOAL_CONTRACT_READ_PATH.available).toBe(true);
    expect(FORMAL_GOAL_CONTRACT_READ_PATH.reason.length).toBeGreaterThan(0);
  });

  it('echoes a genuinely fetched GoalContract\'s own description verbatim, tagged with the richer source', () => {
    expect(
      deriveCreatorGoalFromFormalContract({
        description: 'a promotional film for the launch',
        title: 'Launch Film',
        priority: GoalPriority.HIGH,
      }),
    ).toEqual({
      stated: true,
      statedIntent: 'a promotional film for the launch',
      source: 'formal-goal-contract',
      title: 'Launch Film',
      priority: GoalPriority.HIGH,
    });
  });
});

describe('Package X — Creator Goal Input Expansion', () => {
  it('carries the real GoalContract title and priority when the formal source is used', () => {
    const goal = deriveCreatorGoalFromFormalContract({
      description: 'x',
      title: 'The Empire at Dawn',
      priority: GoalPriority.CRITICAL,
    });
    expect(goal.title).toBe('The Empire at Dawn');
    expect(goal.priority).toBe(GoalPriority.CRITICAL);
  });

  it('never invents title or priority for prompt-echo — both stay undefined, never guessed', () => {
    const goal = deriveCreatorGoalFromPrompt('a raw prompt');
    expect(goal.title).toBeUndefined();
    expect(goal.priority).toBeUndefined();
  });
});

describe('Package XI — Commercial Intent Durable Storage', () => {
  it('echoes a scoped view of a genuinely present commercialIntent — accessPolicy and coverArtUri only', () => {
    const goal = deriveCreatorGoalFromFormalContract({
      description: 'x',
      title: 'The Empire at Dawn',
      priority: GoalPriority.CRITICAL,
      commercialIntent: {
        accessPolicy: { distributionTier: DistributionTier.COMMERCIAL_PURCHASE, requiresAgeVerification: true },
        coverArtUri: 'https://vault.example/cover.png',
      },
    });
    expect(goal.commercialIntent).toEqual({
      accessPolicy: { distributionTier: DistributionTier.COMMERCIAL_PURCHASE, requiresAgeVerification: true },
      coverArtUri: 'https://vault.example/cover.png',
    });
  });

  it('never invents commercialIntent when the fetched GoalContract genuinely has none', () => {
    const goal = deriveCreatorGoalFromFormalContract({
      description: 'x',
      title: 'A Compiled Work',
      priority: GoalPriority.MEDIUM,
    });
    expect(goal.commercialIntent).toBeUndefined();
  });

  it('never invents commercialIntent for prompt-echo — stays undefined, never guessed', () => {
    const goal = deriveCreatorGoalFromPrompt('a raw prompt');
    expect(goal.commercialIntent).toBeUndefined();
  });
});

describe('Package XII — Full Makman Commercial Intent Read Decision', () => {
  it('records, as real tested data, that no consumer is entitled to the full MakmanCommercialIntent — the scoped view remains the sole access path', () => {
    expect(FULL_COMMERCIAL_INTENT_READ_DECISION.entitled).toBe(false);
    expect(FULL_COMMERCIAL_INTENT_READ_DECISION.soleAccessPath).toBe('scoped-creator-goal-input-view');
    expect(FULL_COMMERCIAL_INTENT_READ_DECISION.reason.length).toBeGreaterThan(0);
  });

  it('still accepts a full GoalContract-shaped object for deriveCreatorGoalFromFormalContract — the narrower FormalGoalContractView type is a subset, not a replacement', () => {
    const goal = deriveCreatorGoalFromFormalContract({
      description: 'x',
      title: 'A Compiled Work',
      priority: GoalPriority.MEDIUM,
      commercialIntent: { accessPolicy: { distributionTier: DistributionTier.PUBLIC_FREE, requiresAgeVerification: false } },
    });
    expect(goal.commercialIntent).toEqual({
      accessPolicy: { distributionTier: DistributionTier.PUBLIC_FREE, requiresAgeVerification: false },
      coverArtUri: undefined,
    });
  });
});

describe('Package XIII — Multi-Node Cinematic Direction: determinePrimaryNode', () => {
  it('identifies the sole node genuinely carrying a stated Creator Goal as the primary node', () => {
    expect(
      determinePrimaryNode([
        { nodeId: 'n1', creatorGoal: { stated: false, source: 'asset-prompt-echo' } },
        { nodeId: 'n2', creatorGoal: { stated: true, statedIntent: 'the empire at dawn', source: 'asset-prompt-echo' } },
        { nodeId: 'n3', creatorGoal: { stated: false, source: 'asset-prompt-echo' } },
      ]),
    ).toBe('n2');
  });

  it('is honestly null when no node carries a stated Goal — never guesses from array position', () => {
    expect(
      determinePrimaryNode([
        { nodeId: 'n1', creatorGoal: { stated: false, source: 'asset-prompt-echo' } },
        { nodeId: 'n2', creatorGoal: { stated: false, source: 'asset-prompt-echo' } },
      ]),
    ).toBeNull();
  });

  it('is honestly null when more than one node carries a stated Goal — declines to break a real conflict by guessing', () => {
    expect(
      determinePrimaryNode([
        { nodeId: 'n1', creatorGoal: { stated: true, statedIntent: 'a', source: 'asset-prompt-echo' } },
        { nodeId: 'n2', creatorGoal: { stated: true, statedIntent: 'b', source: 'asset-prompt-echo' } },
      ]),
    ).toBeNull();
  });

  it('is honestly null for an empty node set', () => {
    expect(determinePrimaryNode([])).toBeNull();
  });
});

describe('Package XIV — Timing Signal Foundation (superseded finding, kept as history)', () => {
  it('records, as real tested data, that a real sequential timing basis exists', () => {
    expect(RHYTHM_TRANSITION_TIMING_BASIS.sequentialTimingAvailable).toBe(true);
  });
});

describe('Package XV — Creator Pacing Preference Foundation (rhythmAvailable finding superseded by Package XVI, kept as history)', () => {
  it('records, as real tested data, that rhythm is now available (a real Creator-stated preference can inform it)', () => {
    expect(RHYTHM_TRANSITION_TIMING_BASIS.rhythmAvailable).toBe(true);
    expect(RHYTHM_TRANSITION_TIMING_BASIS.reason.length).toBeGreaterThan(0);
  });

  it('echoes a genuinely stated pacingPreference verbatim into CreatorGoalInput', () => {
    const goal = deriveCreatorGoalFromFormalContract({
      description: 'x',
      title: 'A Compiled Work',
      priority: GoalPriority.MEDIUM,
      pacingPreference: PacingPreference.CONTEMPLATIVE,
    });
    expect(goal.pacingPreference).toBe(PacingPreference.CONTEMPLATIVE);
  });

  it('never invents pacingPreference when the fetched GoalContract genuinely has none', () => {
    const goal = deriveCreatorGoalFromFormalContract({
      description: 'x',
      title: 'A Compiled Work',
      priority: GoalPriority.MEDIUM,
    });
    expect(goal.pacingPreference).toBeUndefined();
  });

  it('never invents pacingPreference for prompt-echo — stays undefined, never guessed', () => {
    const goal = deriveCreatorGoalFromPrompt('a raw prompt');
    expect(goal.pacingPreference).toBeUndefined();
  });
});

describe('Package XVI — Creator Transition Preference Foundation', () => {
  it('records, as real tested data, that transitionStrategy is now also available, independent of rhythm', () => {
    expect(RHYTHM_TRANSITION_TIMING_BASIS.transitionStrategyAvailable).toBe(true);
    expect(RHYTHM_TRANSITION_TIMING_BASIS.rhythmAvailable).toBe(true);
    expect(RHYTHM_TRANSITION_TIMING_BASIS.reason.length).toBeGreaterThan(0);
  });

  it('echoes a genuinely stated transitionPreference verbatim into CreatorGoalInput, independent of pacingPreference', () => {
    const goal = deriveCreatorGoalFromFormalContract({
      description: 'x',
      title: 'A Compiled Work',
      priority: GoalPriority.MEDIUM,
      pacingPreference: PacingPreference.ENERGETIC,
      transitionPreference: TransitionPreference.DECISIVE,
    });
    expect(goal.transitionPreference).toBe(TransitionPreference.DECISIVE);
    expect(goal.pacingPreference).toBe(PacingPreference.ENERGETIC);
  });

  it('never invents transitionPreference when the fetched GoalContract genuinely has none, even when pacingPreference was stated', () => {
    const goal = deriveCreatorGoalFromFormalContract({
      description: 'x',
      title: 'A Compiled Work',
      priority: GoalPriority.MEDIUM,
      pacingPreference: PacingPreference.ENERGETIC,
    });
    expect(goal.transitionPreference).toBeUndefined();
  });

  it('never invents transitionPreference for prompt-echo — stays undefined, never guessed', () => {
    const goal = deriveCreatorGoalFromPrompt('a raw prompt');
    expect(goal.transitionPreference).toBeUndefined();
  });
});
