import { decideCinematicDirection, decideMultiNodeCinematicDirection } from '../automatic-director';
import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { AssetFamily } from '../../../vault/sovereign-vault-types';
import type { VaultAsset } from '../../../vault/sovereign-vault-types';
import { GoalStatus, GoalPriority, PacingPreference, TransitionPreference } from '../../makman-al-ghayah/goal-contracts';
import { DistributionTier } from '../../makman-al-ghayah/publication-contracts';
import type { GoalContract } from '../../../sovereign-entry';
import type { CompiledAssemblyGraph } from '../pre-publishing-boundary';

function makeAsset(overrides: Partial<VaultAsset> = {}): VaultAsset {
  return {
    assetId: 'asset-1',
    subscriberTenantId: 'tenant-1',
    originatingOperationId: 'op-1',
    capabilityTarget: CapabilityTarget.VISUAL,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: 'https://vault.example/asset-1',
    metadata: {},
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function makeGoal(overrides: Partial<GoalContract> = {}): GoalContract {
  return {
    goalId: 'goal-1',
    subscriberTenantId: 'tenant-1',
    title: 'A Compiled Work',
    description: 'the richer formal Goal description',
    priority: GoalPriority.MEDIUM,
    status: GoalStatus.CREATED,
    dependencies: [],
    metrics: [],
    createdAtMs: 0,
    updatedAtMs: 0,
    ...overrides,
  };
}

describe('The Automatic Director — decideCinematicDirection', () => {
  it('rejects an asset missing the identity or family required to place it on a canvas', () => {
    const decision = decideCinematicDirection(makeAsset({ assetId: '' }));
    expect(decision.included).toBe(false);
    expect(decision.rejectionReason).toBeTruthy();
    expect(decision.temporal).toBeUndefined();
  });

  it('decides real scene timing from the asset\'s own duration metadata when present', () => {
    const decision = decideCinematicDirection(makeAsset({ metadata: { durationSeconds: 12 } }));
    expect(decision.included).toBe(true);
    expect(decision.temporal).toEqual({ globalStartTimeSeconds: 0, playDurationSeconds: 12 });
    expect(decision.temporalBasis).toBe('real-evidence');
  });

  it('falls back to the platform\'s existing default duration when no real metadata exists — never fabricates a duration', () => {
    const decision = decideCinematicDirection(makeAsset({ metadata: {} }));
    expect(decision.temporal?.playDurationSeconds).toBe(5);
    expect(decision.temporalBasis).toBe('fallback-default');
  });

  it('decides a real narrative sequencing position within today\'s single-node scope', () => {
    const decision = decideCinematicDirection(makeAsset());
    expect(decision.structural).toEqual({ executionOrderIndex: 0 });
    expect(decision.singleNodeScope).toBe(true);
  });

  it('decides real audio placement only for an asset that actually originated from the AUDIO capability', () => {
    const audioDecision = decideCinematicDirection(makeAsset({ capabilityTarget: CapabilityTarget.AUDIO }));
    expect(audioDecision.audio).toEqual({ volumeDb: 0, panCenter: 0, isMuted: false });

    const visualDecision = decideCinematicDirection(makeAsset({ capabilityTarget: CapabilityTarget.VISUAL }));
    expect(visualDecision.audio).toBeUndefined();
  });

  it('never fabricates rhythm or transition strategy — both stay honestly null, not guessed', () => {
    const decision = decideCinematicDirection(makeAsset());
    expect(decision.rhythm).toBeNull();
    expect(decision.transitionStrategy).toBeNull();
    expect(decision.narrativeContinuity).toBe('not-applicable-single-node');
  });

  it('is pure — the same asset always produces an identical decision, and the input is never mutated', () => {
    const asset = makeAsset({ metadata: { durationSeconds: 9 } });
    const frozen = JSON.parse(JSON.stringify(asset));
    const first = decideCinematicDirection(asset);
    const second = decideCinematicDirection(asset);
    expect(first).toEqual(second);
    expect(asset).toEqual(frozen);
  });

  describe('Package VII — Creator Goal integration', () => {
    it('echoes the asset\'s own real generationPrompt verbatim, never interpreting it', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: { generationPrompt: 'a lone gate at dusk' } }));
      expect(decision.creatorGoal).toEqual({ stated: true, statedIntent: 'a lone gate at dusk', source: 'asset-prompt-echo' });
    });

    it('is honest that no Goal was stated when the asset carries no real prompt — never fabricates one', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: {} }));
      expect(decision.creatorGoal).toEqual({ stated: false, source: 'asset-prompt-echo' });
    });

    it('treats a blank or whitespace-only prompt as honestly unstated', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: { generationPrompt: '   ' } }));
      expect(decision.creatorGoal.stated).toBe(false);
    });

    it('reports creator-goal as the primary consideration when a real Goal is stated, per Article IX', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: { generationPrompt: 'the empire at dawn' } }));
      expect(decision.primaryConsideration).toBe('creator-goal');
    });

    it('reports constitutional-identity as the primary consideration when no real Goal is stated — never claims Goal-driven reasoning that did not happen', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: {} }));
      expect(decision.primaryConsideration).toBe('constitutional-identity');
    });

    it('still derives an honest creatorGoal even for a rejected asset', () => {
      const decision = decideCinematicDirection(makeAsset({ assetId: '', metadata: { generationPrompt: 'a rejected shot' } }));
      expect(decision.included).toBe(false);
      expect(decision.creatorGoal).toEqual({ stated: true, statedIntent: 'a rejected shot', source: 'asset-prompt-echo' });
    });
  });

  describe('Package IX — Formal Goal Contract Triad Closure', () => {
    it('prefers a genuinely supplied formal GoalContract over the asset\'s own prompt echo', () => {
      const decision = decideCinematicDirection(
        makeAsset({ metadata: { generationPrompt: 'the raw prompt' } }),
        makeGoal({ description: 'the richer formal Goal description' }),
      );
      expect(decision.creatorGoal).toEqual({
        stated: true,
        statedIntent: 'the richer formal Goal description',
        source: 'formal-goal-contract',
        title: 'A Compiled Work',
        priority: GoalPriority.MEDIUM,
      });
      expect(decision.primaryConsideration).toBe('creator-goal');
    });

    it('falls back to prompt-echo when no formal GoalContract is supplied — never fabricates one', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: { generationPrompt: 'the raw prompt' } }));
      expect(decision.creatorGoal.source).toBe('asset-prompt-echo');
    });

    it('does not require a real Vault duration/capability signal for the formal Goal to take precedence', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: {} }), makeGoal({ description: 'a formally declared Goal' }));
      expect(decision.creatorGoal).toEqual({
        stated: true,
        statedIntent: 'a formally declared Goal',
        source: 'formal-goal-contract',
        title: 'A Compiled Work',
        priority: GoalPriority.MEDIUM,
      });
    });
  });

  describe('Package X — Creator Goal Input Expansion', () => {
    it('carries the real title and priority through from a genuinely fetched formal GoalContract', () => {
      const decision = decideCinematicDirection(
        makeAsset(),
        makeGoal({ title: 'The Empire at Dawn', priority: GoalPriority.CRITICAL }),
      );
      expect(decision.creatorGoal.title).toBe('The Empire at Dawn');
      expect(decision.creatorGoal.priority).toBe(GoalPriority.CRITICAL);
    });

    it('never invents title or priority from prompt-echo alone', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: { generationPrompt: 'a raw prompt' } }));
      expect(decision.creatorGoal.title).toBeUndefined();
      expect(decision.creatorGoal.priority).toBeUndefined();
    });
  });

  describe('Package XI — Commercial Intent Durable Storage', () => {
    it('carries a scoped commercialIntent view through when the fetched formal GoalContract genuinely has one', () => {
      const decision = decideCinematicDirection(
        makeAsset(),
        makeGoal({
          commercialIntent: {
            publisherTenantId: 'tenant-1',
            compiledAssemblyGraph: {} as unknown as CompiledAssemblyGraph,
            accessPolicy: { distributionTier: DistributionTier.SUBSCRIPTION_ONLY, requiresAgeVerification: false },
            coverArtUri: 'https://vault.example/cover.png',
          },
        }),
      );
      expect(decision.creatorGoal.commercialIntent).toEqual({
        accessPolicy: { distributionTier: DistributionTier.SUBSCRIPTION_ONLY, requiresAgeVerification: false },
        coverArtUri: 'https://vault.example/cover.png',
      });
    });

    it('never invents commercialIntent when the formal GoalContract genuinely has none', () => {
      const decision = decideCinematicDirection(makeAsset(), makeGoal());
      expect(decision.creatorGoal.commercialIntent).toBeUndefined();
    });

    it('never invents commercialIntent from prompt-echo alone', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: { generationPrompt: 'a raw prompt' } }));
      expect(decision.creatorGoal.commercialIntent).toBeUndefined();
    });
  });

  describe('Package XV — Creator Pacing Preference Foundation', () => {
    it('echoes the Creator\'s own stated pacingPreference verbatim as rhythm', () => {
      const decision = decideCinematicDirection(makeAsset(), makeGoal({ pacingPreference: PacingPreference.ENERGETIC }));
      expect(decision.rhythm).toBe(PacingPreference.ENERGETIC);
    });

    it('is honestly null for rhythm when the formal Goal has no stated pacingPreference', () => {
      const decision = decideCinematicDirection(makeAsset(), makeGoal());
      expect(decision.rhythm).toBeNull();
    });

    it('never invents rhythm from prompt-echo alone', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: { generationPrompt: 'a raw prompt' } }));
      expect(decision.rhythm).toBeNull();
    });

    it('never fabricates transitionStrategy from pacingPreference alone — stays null unless a distinct transitionPreference is itself stated', () => {
      const decision = decideCinematicDirection(makeAsset(), makeGoal({ pacingPreference: PacingPreference.BALANCED }));
      expect(decision.transitionStrategy).toBeNull();
    });

    it('still reports honest rhythm for a rejected asset — a rejection does not suppress a real stated preference', () => {
      const decision = decideCinematicDirection(
        makeAsset({ assetId: '' }),
        makeGoal({ pacingPreference: PacingPreference.CONTEMPLATIVE }),
      );
      expect(decision.included).toBe(false);
      expect(decision.rhythm).toBe(PacingPreference.CONTEMPLATIVE);
    });
  });

  describe('Package XVI — Creator Transition Preference Foundation', () => {
    it('echoes the Creator\'s own stated transitionPreference verbatim as transitionStrategy', () => {
      const decision = decideCinematicDirection(makeAsset(), makeGoal({ transitionPreference: TransitionPreference.DIRECT }));
      expect(decision.transitionStrategy).toBe(TransitionPreference.DIRECT);
    });

    it('is honestly null for transitionStrategy when the formal Goal has no stated transitionPreference', () => {
      const decision = decideCinematicDirection(makeAsset(), makeGoal());
      expect(decision.transitionStrategy).toBeNull();
    });

    it('never invents transitionStrategy from prompt-echo alone', () => {
      const decision = decideCinematicDirection(makeAsset({ metadata: { generationPrompt: 'a raw prompt' } }));
      expect(decision.transitionStrategy).toBeNull();
    });

    it('carries rhythm and transitionStrategy independently — a Creator may state either, both, or neither', () => {
      const bothStated = decideCinematicDirection(
        makeAsset(),
        makeGoal({ pacingPreference: PacingPreference.ENERGETIC, transitionPreference: TransitionPreference.SOFT }),
      );
      expect(bothStated.rhythm).toBe(PacingPreference.ENERGETIC);
      expect(bothStated.transitionStrategy).toBe(TransitionPreference.SOFT);

      const onlyTransitionStated = decideCinematicDirection(
        makeAsset(),
        makeGoal({ transitionPreference: TransitionPreference.GRADUAL }),
      );
      expect(onlyTransitionStated.rhythm).toBeNull();
      expect(onlyTransitionStated.transitionStrategy).toBe(TransitionPreference.GRADUAL);
    });

    it('still reports honest transitionStrategy for a rejected asset — a rejection does not suppress a real stated preference', () => {
      const decision = decideCinematicDirection(
        makeAsset({ assetId: '' }),
        makeGoal({ transitionPreference: TransitionPreference.DECISIVE }),
      );
      expect(decision.included).toBe(false);
      expect(decision.transitionStrategy).toBe(TransitionPreference.DECISIVE);
    });
  });

  describe('Package XIII — Multi-Node Cinematic Direction', () => {
    it('defaults executionOrderIndex to 0 when no order is supplied — the honest single-node position', () => {
      const decision = decideCinematicDirection(makeAsset());
      expect(decision.structural?.executionOrderIndex).toBe(0);
    });

    it('reports the real, caller-supplied orderIndex instead of always 0', () => {
      const decision = decideCinematicDirection(makeAsset(), undefined, 3);
      expect(decision.structural?.executionOrderIndex).toBe(3);
    });

    it('defaults globalStartTimeSeconds to 0 when no start time is supplied — the honest single-node position', () => {
      const decision = decideCinematicDirection(makeAsset());
      expect(decision.temporal?.globalStartTimeSeconds).toBe(0);
    });

    it('reports the real, caller-supplied startTimeSeconds instead of always 0', () => {
      const decision = decideCinematicDirection(makeAsset(), undefined, 1, 17);
      expect(decision.temporal?.globalStartTimeSeconds).toBe(17);
    });
  });
});

describe('decideMultiNodeCinematicDirection', () => {
  it('decides each node in its own real array order, reporting that order as executionOrderIndex', () => {
    const result = decideMultiNodeCinematicDirection([
      { nodeId: 'n1', asset: makeAsset({ assetId: 'a1' }) },
      { nodeId: 'n2', asset: makeAsset({ assetId: 'a2' }) },
      { nodeId: 'n3', asset: makeAsset({ assetId: 'a3' }) },
    ]);

    expect(result.nodeDecisions.map((nd) => nd.decision.structural?.executionOrderIndex)).toEqual([0, 1, 2]);
    expect(result.nodeDecisions.map((nd) => nd.nodeId)).toEqual(['n1', 'n2', 'n3']);
  });

  it('identifies the primary node from a genuinely stated Creator Goal on exactly one node', () => {
    const result = decideMultiNodeCinematicDirection([
      { nodeId: 'n1', asset: makeAsset({ assetId: 'a1', metadata: {} }) },
      { nodeId: 'n2', asset: makeAsset({ assetId: 'a2', metadata: { generationPrompt: 'the empire at dawn' } }) },
    ]);

    expect(result.primaryNodeId).toBe('n2');
  });

  it('is honestly null for primaryNodeId when no node has a stated Goal', () => {
    const result = decideMultiNodeCinematicDirection([
      { nodeId: 'n1', asset: makeAsset({ assetId: 'a1', metadata: {} }) },
      { nodeId: 'n2', asset: makeAsset({ assetId: 'a2', metadata: {} }) },
    ]);

    expect(result.primaryNodeId).toBeNull();
  });

  it('reuses validateNarrativeIntegrity to flag the same asset appearing in more than one node', () => {
    const result = decideMultiNodeCinematicDirection([
      { nodeId: 'n1', asset: makeAsset({ assetId: 'shared-asset' }) },
      { nodeId: 'n2', asset: makeAsset({ assetId: 'shared-asset' }) },
    ]);

    expect(result.narrativeIntegrity.valid).toBe(false);
    expect(result.narrativeIntegrity.violations[0]).toMatch(/more than one node/);
  });

  it('reports valid narrative integrity for a genuinely well-formed multi-node set', () => {
    const result = decideMultiNodeCinematicDirection([
      { nodeId: 'n1', asset: makeAsset({ assetId: 'a1' }) },
      { nodeId: 'n2', asset: makeAsset({ assetId: 'a2' }) },
    ]);

    expect(result.narrativeIntegrity.valid).toBe(true);
  });

  it('is honest and empty for an empty node set — never fabricates a decision', () => {
    const result = decideMultiNodeCinematicDirection([]);
    expect(result.nodeDecisions).toEqual([]);
    expect(result.primaryNodeId).toBeNull();
    expect(result.narrativeIntegrity.valid).toBe(true);
  });

  describe('Package XIV — Timing Signal Foundation', () => {
    it('starts the first node at 0 and accumulates each real duration into the next node\'s real start time', () => {
      const result = decideMultiNodeCinematicDirection([
        { nodeId: 'n1', asset: makeAsset({ assetId: 'a1', metadata: { durationSeconds: 12 } }) },
        { nodeId: 'n2', asset: makeAsset({ assetId: 'a2', metadata: { durationSeconds: 8 } }) },
        { nodeId: 'n3', asset: makeAsset({ assetId: 'a3', metadata: { durationSeconds: 5 } }) },
      ]);

      expect(result.nodeDecisions.map((nd) => nd.decision.temporal?.globalStartTimeSeconds)).toEqual([0, 12, 20]);
    });

    it('accumulates the honest fallback duration when an asset has no real duration metadata, never skipping it', () => {
      const result = decideMultiNodeCinematicDirection([
        { nodeId: 'n1', asset: makeAsset({ assetId: 'a1', metadata: {} }) },
        { nodeId: 'n2', asset: makeAsset({ assetId: 'a2', metadata: { durationSeconds: 3 } }) },
      ]);

      expect(result.nodeDecisions[0].decision.temporal?.playDurationSeconds).toBe(5);
      expect(result.nodeDecisions[1].decision.temporal?.globalStartTimeSeconds).toBe(5);
    });

    it('does not advance the running start time for a rejected node — it occupies no real time', () => {
      const result = decideMultiNodeCinematicDirection([
        { nodeId: 'n1', asset: makeAsset({ assetId: '', metadata: { durationSeconds: 99 } }) },
        { nodeId: 'n2', asset: makeAsset({ assetId: 'a2', metadata: { durationSeconds: 4 } }) },
      ]);

      expect(result.nodeDecisions[0].decision.included).toBe(false);
      expect(result.nodeDecisions[1].decision.temporal?.globalStartTimeSeconds).toBe(0);
    });

    it('never fabricates rhythm or transitionStrategy across a multi-node set — both stay honestly null', () => {
      const result = decideMultiNodeCinematicDirection([
        { nodeId: 'n1', asset: makeAsset({ assetId: 'a1' }) },
        { nodeId: 'n2', asset: makeAsset({ assetId: 'a2' }) },
      ]);

      for (const nd of result.nodeDecisions) {
        expect(nd.decision.rhythm).toBeNull();
        expect(nd.decision.transitionStrategy).toBeNull();
      }
    });
  });
});
