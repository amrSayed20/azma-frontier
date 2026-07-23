/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY
 * The Constitutional Experience Timeline
 * Construction Phase VIII
 *
 * A merged, chronological view over the History Archive (raw signals)
 * and the Knowledge Repository (archived advisories) — what happened,
 * and what the Sovereign Core understood about it, interleaved by time.
 * Combines only; never re-derives either source, never adds
 * interpretation of its own.
 */

import { getFullHistory } from './history-archive';
import { getFullKnowledgeRepository } from './knowledge-repository';
import type { ExperienceTimelineEntry } from './types';

export function getExperienceTimeline(): readonly ExperienceTimelineEntry[] {
  const signalEntries: ExperienceTimelineEntry[] = getFullHistory().map((signal) => ({
    timestamp: signal.timestamp,
    kind: 'signal',
    organId: signal.origin,
    summary: `${signal.signalType} signal: ${signal.purpose}`,
  }));

  const advisoryEntries: ExperienceTimelineEntry[] = getFullKnowledgeRepository().map((entry) => ({
    timestamp: entry.archivedAt,
    kind: 'advisory',
    organId: entry.organId,
    summary: entry.advisory.summary,
  }));

  return [...signalEntries, ...advisoryEntries].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
}
