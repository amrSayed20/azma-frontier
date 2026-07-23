/**
 * AZMA OS — THE CONSTITUTIONAL DECISION
 * The Constitutional Judgment Registry
 * Construction Campaign
 *
 * A pure, declarative record of the fixed-priority decision tree
 * decision-evaluator.ts implements — documentation-as-code, so the
 * judgment logic's own reasoning is discoverable independent of reading
 * the implementation.
 */

export const CONSTITUTIONAL_JUDGMENT_TREE = [
  {
    priority: 1,
    consultation: 'Constitutional Law (the Skeleton)',
    condition: "The organ's constitutional home (region, system, boundary, authority) is incomplete.",
    verdict: 'rejected',
    rationale: 'An Intention for an organ whose own constitutional identity is incomplete cannot be approved — Law is the hardest boundary and is checked first.',
  },
  {
    priority: 2,
    consultation: 'Constitutional Wisdom',
    condition: "The organ's most recently archived Advisory contains a claim Wisdom's own Judgment Layer found unfaithful or insufficiently evidenced.",
    verdict: 'escalated',
    rationale: 'A structural faithfulness concern is neither a clean approval nor an outright rejection — it is raised for further Council-level attention.',
  },
  {
    priority: 3,
    consultation: 'Constitutional Memory and Constitutional Awareness',
    condition: 'The organ has no archived history in Memory, or Consciousness has never observed its presence.',
    verdict: 'deferred',
    rationale: 'Insufficient grounding to approve outright, but nothing disqualifying either — deferred pending more evidence, never fabricated.',
  },
  {
    priority: 4,
    consultation: '(all four consultations pass)',
    condition: 'Constitutional Law is complete, Wisdom finds the organ faithful, and both Memory and Awareness have real evidence.',
    verdict: 'approved',
    rationale: 'Every consultation independently supports the Intention — approval is the default only when nothing else applies.',
  },
] as const;
