/**
 * AZMA OS — THE SOVEREIGN CORE
 * The Constitutional Understanding Engine
 * Construction Phase V
 *
 * Transforms constitutional reality (Knowledge + Memory + Continuity)
 * into one organized ConstitutionalUnderstanding per organ. Organizes
 * only — this file contains no judgment, no threshold, no
 * recommendation. That work belongs to the Reasoning Layer, which
 * consumes this engine's output as one of its own inputs (Certification
 * Requirement 1: "constitutional understanding is derived only from
 * constitutional inputs" — every field below traces to the Skeleton, the
 * Nervous System, or the Heart, and nowhere else).
 */

import { getKnowledgeForOrgan } from './knowledge-registry';
import { getConstitutionalMemoryForOrgan } from './memory-integration';
import { getOrganContinuity, CONSTITUTIONAL_RHYTHM } from '../sovereign-heart';
import type { ConstitutionalUnderstanding } from './types';

/**
 * `now` defaults to the real clock but may be overridden — the same
 * determinism-for-testing pattern the Heart's own getOrganContinuity()
 * already established, threaded through rather than re-invented.
 */
export function deriveUnderstandingForOrgan(
  organId: string,
  now: number = Date.now(),
): ConstitutionalUnderstanding {
  const knowledge = getKnowledgeForOrgan(organId);
  const memory = getConstitutionalMemoryForOrgan(organId);
  const continuity = getOrganContinuity(organId, CONSTITUTIONAL_RHYTHM, now);
  const observedSignalTypes = Array.from(new Set(memory.map((signal) => signal.signalType)));
  return { organId, knowledge, continuity, memory, observedSignalTypes };
}
