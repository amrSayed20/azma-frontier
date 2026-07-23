/**
 * AZMA OS — THE SOVEREIGN CORE
 * The Constitutional Advisory Layer
 * Construction Phase V
 *
 * Synthesizes one organ's Understanding, Claims, and Plan into a single
 * ConstitutionalAdvisory — the Core's complete, final output for that
 * organ. Advisory means exactly that: this function returns data to its
 * caller and does nothing else. It never calls circulateFromClient,
 * emitSignal, awaken/rest, or any other organ's mutating function —
 * confirmed by inspection and by this module's own tests (Certification
 * Requirement 5: "the Core remains advisory rather than authoritative").
 */

import { deriveUnderstandingForOrgan } from './understanding-engine';
import { reasonAboutOrgan } from './reasoning-layer';
import { planForOrgan } from './planning-layer';
import type { ConstitutionalAdvisory } from './types';

export function adviseOnOrgan(organId: string): ConstitutionalAdvisory {
  const understanding = deriveUnderstandingForOrgan(organId);
  const claims = reasonAboutOrgan(understanding);
  const plan = planForOrgan(organId, claims);
  const summary = understanding.knowledge
    ? `${understanding.knowledge.name}: ${claims.length} claim(s) recorded (${plan.steps.length} advisory recommendation(s)). Continuity: ${understanding.continuity.status}.`
    : `No constitutional knowledge exists for organ id "${organId}".`;
  return { organId, summary, understanding, claims, plan };
}
