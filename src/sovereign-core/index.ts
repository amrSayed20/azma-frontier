/**
 * AZMA OS — THE SOVEREIGN CORE (THE CONSTITUTIONAL MIND)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Phase V. See PHASE_V_ENGINEERING_REVIEW.ts for what this
 * phase built and deliberately did not build (most notably: the Core is
 * not wired to any chamber, API route, or Creator-facing surface — this
 * phase's own Out of Scope forbids "Creator-facing assistant behavior"
 * and "autonomous execution").
 */

export type {
  ConstitutionalUnderstanding,
  ConstitutionalClaimKind,
  ConstitutionalClaim,
  ConstitutionalPlanStep,
  ConstitutionalPlan,
  ConstitutionalAdvisory,
} from './types';

export { getConstitutionalKnowledgeBase, getKnowledgeForOrgan } from './knowledge-registry';
export { getConstitutionalMemoryForOrgan, getFullConstitutionalMemory } from './memory-integration';
export { deriveUnderstandingForOrgan } from './understanding-engine';
export { reasonAboutOrgan } from './reasoning-layer';
export { planForOrgan } from './planning-layer';
export { adviseOnOrgan } from './advisory-layer';
export { getConstitutionalMindSnapshot } from './queries';

/**
 * Live Perception Intake + Core Thought (Integration Package "The First
 * Constitutional Thought") — brings the Core into living operation. See
 * INTEGRATION_FIRST_THOUGHT_ENGINEERING_REVIEW.ts.
 */
export {
  beginConstitutionalThought,
  endConstitutionalThought,
  isThinking,
  getLatestAdvisoryForOrgan,
  getReceivedSignalCount,
  resetPerceptionIntake,
} from './perception-intake';

export { CoreThought } from './CoreThought';
