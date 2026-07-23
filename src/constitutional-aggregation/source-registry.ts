/**
 * AZMA OS — THE CONSTITUTIONAL MANIFESTATION SYSTEM
 * The Constitutional Source Registry
 * Constitutional Package II
 *
 * A pure, declarative record of every registered Constitutional Source,
 * per the Constitutional Decision naming the initial two ("The Imperial
 * Tongue", "Constitutional Expression") and explicitly requiring the
 * architecture to "remain open for future constitutional sources"
 * (Constitutional Awareness, Constitutional Operations, Constitutional
 * Recommendations, Constitutional Opportunities, Constitutional Health,
 * and others not yet authorized). Adding a future source means adding
 * one adapter function (source-adapters.ts) and one entry here — never
 * modifying the Manifestation Composer's own logic.
 */

import type { ConstitutionalSourceDescriptor } from './types';

export const CONSTITUTIONAL_SOURCES: readonly ConstitutionalSourceDescriptor[] = [
  {
    sourceId: 'imperial-tongue',
    subjectKeyKind: 'ChamberContext (one of the 6 registered chamber contexts, including \'universal\')',
    evidenceQuery: 'src/core/tongue/ — getToneProfile(context)',
  },
  {
    sourceId: 'constitutional-expression',
    subjectKeyKind: 'organId (one of the 12 Skeleton-registered constitutional organs)',
    evidenceQuery: 'src/constitutional-expression/ — composeExpressionForOrgan(organId)',
  },
] as const;
