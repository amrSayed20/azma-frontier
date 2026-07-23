/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM
 * The Constitutional Decision Principles
 * Construction Phase IX
 *
 * A pure, declarative registry of the rules this phase's own Judgment
 * and Learning Integration layers follow — metadata about how Wisdom
 * works, not itself an executable decision engine.
 */

import type { DecisionPrinciple } from './types';

export const CONSTITUTIONAL_DECISION_PRINCIPLES: readonly DecisionPrinciple[] = [
  {
    principle: "A Judgment never re-derives or second-guesses a Claim's own conclusion.",
    rationale:
      'Re-deriving conclusions would mean reasoning independently of the Sovereign Core, which this phase\'s own Constitutional Limits forbid ("shall never replace the Sovereign Core").',
  },
  {
    principle: 'Absence of Memory produces insufficient-evidence, never a fabricated Judgment.',
    rationale: 'Constitutional Decision Two: "No synthetic population. No artificial wisdom generation."',
  },
  {
    principle: 'Maturity is measured, never claimed.',
    rationale: 'A monotonically non-decreasing count of accumulated experience is verifiable; a qualitative claim of "wisdom" would not be.',
  },
  {
    principle: 'Wisdom never executes what it judges.',
    rationale: 'This phase\'s Constitutional Limits: "shall never execute... shall never override the Creator, the Heart, or the Sovereign Core."',
  },
] as const;
