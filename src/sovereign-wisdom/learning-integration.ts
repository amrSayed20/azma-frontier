/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM
 * The Constitutional Learning Integration Layer
 * Construction Phase IX
 *
 * Combines the Reflection Engine's own statistics with the Constitutional
 * Memory's Wisdom Archive (Phase VIII) into one read-only view. Per
 * Constitutional Decision Two ("No workaround. No synthetic population.
 * No artificial wisdom generation. An empty but constitutionally correct
 * Wisdom Archive is preferable to an artificial one"), this layer never
 * writes to the Wisdom Archive or invents an entry when none exists — it
 * only reads and reports, honestly, when the Archive is still empty.
 */

import { getWisdomForOrgan } from '../sovereign-memory';
import { reflectOnOrgan } from './reflection-engine';
import type { LearningIntegrationSummary } from './types';

export function integrateLearningForOrgan(organId: string): LearningIntegrationSummary {
  const reflection = reflectOnOrgan(organId);
  const wisdomEntryCount = getWisdomForOrgan(organId).length;

  return {
    organId,
    reflection,
    wisdomEntryCount,
    note:
      wisdomEntryCount === 0
        ? 'The Wisdom Archive holds no entries for this organ yet — left honestly empty per Constitutional Decision Two, never synthetically populated.'
        : `The Wisdom Archive holds ${wisdomEntryCount} preserved recommendation(s) for this organ.`,
  };
}
