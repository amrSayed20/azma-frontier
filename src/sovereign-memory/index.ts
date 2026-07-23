/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY (THE LIVING MEMORY)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Phase VIII. See PHASE_VIII_ENGINEERING_REVIEW.ts for what
 * this phase built and deliberately did not build (most notably: the
 * Knowledge Repository's archival subscription is not auto-started
 * anywhere — the same discipline already applied to the Heart, the
 * Sovereign Core, and Consciousness before their own activation
 * Integration Packages).
 */

export type {
  MemoryTier,
  MemoryTierDescriptor,
  ArchivedAdvisory,
  ExperienceTimelineEntry,
  RelationshipMemoryRecord,
  CreatorJourneySnapshot,
  ConstitutionalMemoryCertification,
} from './types';

export { CONSTITUTIONAL_MEMORY_TIERS } from './memory-registry';

export {
  getFullHistory,
  getHistoryForOrgan,
  getHistoryWithinRange,
  verifyHistoryImmutable,
} from './history-archive';

export {
  beginConstitutionalRemembering,
  endConstitutionalRemembering,
  isRemembering,
  getKnowledgeHistoryForOrgan,
  getFullKnowledgeRepository,
  resetKnowledgeRepository,
} from './knowledge-repository';

export { getFullWisdomArchive, getWisdomForOrgan } from './wisdom-archive';
export type { WisdomRecord } from './wisdom-archive';

export { getExperienceTimeline } from './experience-timeline';
export { getCreatorJourney } from './creator-journey';
export { getRelationshipMemory } from './relationship-memory';

export {
  verifyHistoryRemainsImmutable,
  verifyDIKWDistinction,
  verifyIdentityPreservedAcrossHistory,
  verifyRelationshipsHistoricallyTraceable,
  verifyCreatorJourneysFaithfullyPreserved,
  verifyNoAuthorityExercised,
} from './certification';

export { getConstitutionalMemoryCertificationReport } from './queries';

/** Memory Awakening (Integration Campaign "The Living Body Integration") — brings Constitutional Memory into living operation. */
export { MemoryAwakening } from './MemoryAwakening';
