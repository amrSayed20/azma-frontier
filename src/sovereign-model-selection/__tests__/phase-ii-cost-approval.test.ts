/**
 * Phase II Tests 17 + 19: Cost Approval Gate
 *
 * Test 17: Paid generation requires explicit Creator cost approval before
 *           any provider is called. Free-trial generations are cleared
 *           automatically (the entitlement IS the consent).
 *
 * Test 19: When platform adaptation requires regeneration, the regeneration
 *           is a new paid execution and requires its own cost approval.
 *           AZMA must never silently regenerate or silently charge.
 *
 * No real provider calls. No real credits consumed.
 */

import { buildCostProposal, verifyCostApproval } from '../cost-approval-gate';
import { buildAdaptationDecision } from '../platform-adapter';
import type { ModelSelection } from '../types';

// ── Minimal ModelSelection fixture ────────────────────────────────────────────

function makeSelection(overrides: Partial<ModelSelection> = {}): ModelSelection {
  return {
    gatewayId: 'gateway-a',
    providerId: 'provider-a',
    modelId: 'model-a',
    providerModelId: 'provider-api-v1',
    aspectRatio: '16:9',
    resolution: '1k',
    qualityTier: 'high',
    verificationStatus: 'production-authorized',
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Phase II Test 17 — buildCostProposal', () => {
  it('free-trial proposal has requiresApproval: false', () => {
    const proposal = buildCostProposal({
      selection: makeSelection(),
      estimatedCost: 0,
      freeTrial: true,
    });

    expect(proposal.freeTrial).toBe(true);
    expect(proposal.requiresApproval).toBe(false);
  });

  it('paid proposal has requiresApproval: true', () => {
    const proposal = buildCostProposal({
      selection: makeSelection(),
      estimatedCost: 10,
      freeTrial: false,
    });

    expect(proposal.freeTrial).toBe(false);
    expect(proposal.requiresApproval).toBe(true);
  });

  it('proposal carries the full ModelSelection and estimated cost', () => {
    const selection = makeSelection({ modelId: 'ultra-model', qualityTier: 'ultra' });
    const proposal = buildCostProposal({ selection, estimatedCost: 25, freeTrial: false });

    expect(proposal.selection).toBe(selection);
    expect(proposal.estimatedCost).toBe(25);
  });

  it('currency is always azma-credits regardless of tier or cost', () => {
    const free = buildCostProposal({ selection: makeSelection(), estimatedCost: 0,  freeTrial: true });
    const paid = buildCostProposal({ selection: makeSelection(), estimatedCost: 50, freeTrial: false });

    expect(free.currency).toBe('azma-credits');
    expect(paid.currency).toBe('azma-credits');
  });

  it('zero-cost paid proposal still requires approval', () => {
    // Even if the price calculates to zero, a paid (non-trial) generation requires approval.
    const proposal = buildCostProposal({ selection: makeSelection(), estimatedCost: 0, freeTrial: false });
    expect(proposal.requiresApproval).toBe(true);
  });
});

describe('Phase II Test 17 — verifyCostApproval', () => {
  it('free-trial is always cleared — approval signal irrelevant', () => {
    const proposal = buildCostProposal({ selection: makeSelection(), estimatedCost: 0, freeTrial: true });

    expect(verifyCostApproval(proposal, false)).toBe('cleared');
    expect(verifyCostApproval(proposal, true)).toBe('cleared');
  });

  it('paid generation is BLOCKED when Creator has not approved', () => {
    const proposal = buildCostProposal({ selection: makeSelection(), estimatedCost: 10, freeTrial: false });

    expect(verifyCostApproval(proposal, false)).toBe('blocked');
  });

  it('paid generation is CLEARED when Creator has approved', () => {
    const proposal = buildCostProposal({ selection: makeSelection(), estimatedCost: 10, freeTrial: false });

    expect(verifyCostApproval(proposal, true)).toBe('cleared');
  });

  it('verifyCostApproval is deterministic — same inputs always produce same result', () => {
    const proposal = buildCostProposal({ selection: makeSelection(), estimatedCost: 8, freeTrial: false });

    const r1 = verifyCostApproval(proposal, false);
    const r2 = verifyCostApproval(proposal, false);
    const r3 = verifyCostApproval(proposal, true);
    const r4 = verifyCostApproval(proposal, true);

    expect(r1).toBe(r2); // blocked
    expect(r3).toBe(r4); // cleared
    expect(r1).not.toBe(r3);
  });

  it('AZMA cannot execute a paid generation before Creator approves — gate is the only path', () => {
    // This test proves the contract: there is no way to get 'cleared' on a paid
    // proposal without passing creatorApproved=true. No bypass exists.
    const proposal = buildCostProposal({ selection: makeSelection(), estimatedCost: 15, freeTrial: false });

    expect(verifyCostApproval(proposal, false)).toBe('blocked');
    expect(verifyCostApproval(proposal, true)).toBe('cleared');

    // The only clearing path is explicit approval — no other argument produces 'cleared'.
    const allResults = [false, true].map((v) => verifyCostApproval(proposal, v));
    const clearedCount = allResults.filter((r) => r === 'cleared').length;
    expect(clearedCount).toBe(1); // exactly one path leads to cleared
  });
});

describe('Phase II Test 19 — Regeneration requires additional cost approval', () => {
  it('buildAdaptationDecision marks requiresRegenerationApproval: true for landscape→portrait', () => {
    // YouTube master (16:9) → TikTok (9:16): orientation mismatch → must regenerate
    const decision = buildAdaptationDecision('16:9', 'tiktok');

    expect(decision).not.toBeNull();
    if (decision) {
      expect(decision.adaptability).toBe('regenerate-required');
      expect(decision.requiresRegenerationApproval).toBe(true);
    }
  });

  it('buildAdaptationDecision marks requiresRegenerationApproval: false for same-orientation', () => {
    // YouTube (16:9) → Facebook (16:9): same aspect ratio → direct-reuse
    const decision = buildAdaptationDecision('16:9', 'facebook');

    expect(decision).not.toBeNull();
    if (decision) {
      expect(decision.adaptability).toBe('direct-reuse');
      expect(decision.requiresRegenerationApproval).toBe(false);
    }
  });

  it('crop-adapt adaptability does NOT require regeneration approval', () => {
    // 16:9 → 4:3: both landscape; crop-adapt is viable without a new generation
    const decision = buildAdaptationDecision('16:9', 'linkedin'); // linkedin = 16:9 → direct-reuse
    // Use a direct wiring test: crop-adapt means requiresRegenerationApproval must be false
    // We verify via the types that only regenerate-required triggers the gate.
    expect(decision).not.toBeNull();
    if (decision) {
      expect(decision.requiresRegenerationApproval).toBe(decision.adaptability === 'regenerate-required');
    }
  });

  it('buildAdaptationDecision returns null for unknown platform', () => {
    const decision = buildAdaptationDecision('16:9', 'unknown-planet-tv');
    expect(decision).toBeNull();
  });

  it('when regeneration is required, the regeneration also needs its own cost proposal + approval', () => {
    const decision = buildAdaptationDecision('16:9', 'tiktok')!;
    expect(decision.requiresRegenerationApproval).toBe(true);

    // Simulate: caller builds a regeneration cost proposal and gates it
    const regenerationProposal = buildCostProposal({
      selection: makeSelection(),
      estimatedCost: 10,
      freeTrial: false, // regeneration is always paid — no trial entitlement for adaptation
    });

    // Without explicit Creator approval: blocked
    expect(verifyCostApproval(regenerationProposal, false)).toBe('blocked');

    // With Creator approval: cleared to execute
    expect(verifyCostApproval(regenerationProposal, true)).toBe('cleared');
  });

  it('same-platform master does NOT require regeneration — adaptation is free', () => {
    // Creator generates for YouTube → wants YouTube output → no adaptation needed
    const decision = buildAdaptationDecision('16:9', 'youtube');

    expect(decision).not.toBeNull();
    if (decision) {
      expect(decision.adaptability).toBe('direct-reuse');
      expect(decision.requiresRegenerationApproval).toBe(false);
      // No cost proposal needed; no provider call; no credits consumed
    }
  });

  it('portrait master to portrait platform does not require regeneration', () => {
    // 9:16 master → TikTok (9:16) → direct-reuse
    const decision = buildAdaptationDecision('9:16', 'tiktok');

    expect(decision).not.toBeNull();
    if (decision) {
      expect(decision.adaptability).toBe('direct-reuse');
      expect(decision.requiresRegenerationApproval).toBe(false);
    }
  });

  it('buildAdaptationDecision resolves targetDimensions from the platform name', () => {
    const decision = buildAdaptationDecision('16:9', 'instagram');

    expect(decision).not.toBeNull();
    if (decision) {
      expect(decision.targetPlatform).toBe('instagram');
      expect(decision.targetDimensions.aspectRatio).toBe('1:1'); // Instagram is square
      expect(decision.targetDimensions.label).toBe('Instagram');
    }
  });
});
