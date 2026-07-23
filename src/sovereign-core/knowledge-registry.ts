/**
 * AZMA OS — THE SOVEREIGN CORE
 * The Constitutional Knowledge Registry
 * Construction Phase V
 *
 * The Core's knowledge of "what organs exist and what they are" is never
 * a second organ list — it reads the Skeleton's own Organ Registry
 * (Phase I) directly. This file gives that read a Sovereign Core-scoped
 * entry point; it does not duplicate the data.
 */

import { CONSTITUTIONAL_ORGANS, getOrganById } from '../sovereign-body';
import type { ConstitutionalOrgan } from '../sovereign-body';

/** Everything the Core currently knows to exist in the Sovereign Body — the Skeleton's Organ Registry, read directly. */
export function getConstitutionalKnowledgeBase(): readonly ConstitutionalOrgan[] {
  return CONSTITUTIONAL_ORGANS;
}

/** What the Core knows about one organ, or null if no constitutional home exists for that id. */
export function getKnowledgeForOrgan(organId: string): ConstitutionalOrgan | null {
  return getOrganById(organId);
}
