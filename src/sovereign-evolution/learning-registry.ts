/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION
 * The Constitutional Learning Registry
 * Construction Phase X
 *
 * DISCLOSURE: this objective already exists. The Constitutional Wisdom's
 * own Reflection Engine (Phase IX, reflectOnOrgan) already computes
 * exactly "what has been learned" — accumulated claim-kind counts per
 * organ over time. This file is an Evolution-scoped entry point onto
 * that same computation, not a second one.
 */

import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';
import { reflectOnOrgan } from '../sovereign-wisdom';
import type { ReflectionSummary } from '../sovereign-wisdom';

export function getConstitutionalLearningForOrgan(organId: string): ReflectionSummary {
  return reflectOnOrgan(organId);
}

/** Every Skeleton-registered organ's accumulated learning, none silently omitted. */
export function listConstitutionalLearningForBody(): readonly ReflectionSummary[] {
  return CONSTITUTIONAL_ORGANS.map((organ) => reflectOnOrgan(organ.id));
}
