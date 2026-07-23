/**
 * AZMA OS — THE CONSTITUTIONAL EXPRESSION
 * The Constitutional Expression Registry
 * Construction Campaign
 *
 * A pure, declarative registry naming the 5 organs the Council ruled
 * shall never expose output directly, each mapped to the real,
 * already-certified query this module reads from — and the priority
 * order the Composer uses to merge them. The order reflects how refined/
 * synthesized each source's own contribution already is: the Sovereign
 * Core's reasoned Advisory outranks Constitutional Memory's raw archive
 * of those same Advisories, which outranks Constitutional Consciousness's
 * structural condition, which outranks Al-Wateen's raw presence signal,
 * with Constitutional Evolution's meta-tracking of all of the above
 * last. Not a re-derivation of Memory's own Data/Information/Knowledge/
 * Wisdom hierarchy (Phase VIII) — that hierarchy classifies TYPES of
 * information; this one orders SOURCE ORGANS for composition, a
 * different, disclosed axis.
 */

import type { ExpressionSourceOrgan } from './types';

export const EXPRESSION_SOURCE_REGISTRY: readonly { readonly sourceOrgan: ExpressionSourceOrgan; readonly evidenceQuery: string }[] = [
  { sourceOrgan: 'al-wateen', evidenceQuery: 'src/sovereign-heart/ — getOrganContinuity()' },
  { sourceOrgan: 'sovereign-core', evidenceQuery: 'src/sovereign-core/ — getLatestAdvisoryForOrgan()' },
  { sourceOrgan: 'constitutional-consciousness', evidenceQuery: 'src/sovereign-consciousness/ — getConditionForOrgan()' },
  { sourceOrgan: 'constitutional-memory', evidenceQuery: 'src/sovereign-memory/ — getKnowledgeHistoryForOrgan()' },
  { sourceOrgan: 'constitutional-evolution', evidenceQuery: 'src/sovereign-evolution/ — getMaturitySnapshotsForOrgan()' },
] as const;

export const EXPRESSION_SOURCE_PRIORITY_ORDER: readonly ExpressionSourceOrgan[] = [
  'sovereign-core',
  'constitutional-memory',
  'constitutional-consciousness',
  'al-wateen',
  'constitutional-evolution',
] as const;
