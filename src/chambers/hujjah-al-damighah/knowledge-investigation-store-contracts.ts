/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE INVESTIGATION PERSISTENCE — Final Launch Foundation
 *
 * The constitutional store contract for completed Sovereign Investigations.
 *
 * ─── WHAT THIS CONTRACT DECLARES ─────────────────────────────────────────────
 *
 *   A completed Sovereign Investigation is a permanent Imperial fact.
 *   The Empire shall remember what it has already investigated.
 *   Investigation history belongs to the Creator.
 *   Makman may later reference it.
 *   The Empire may later learn from it.
 *
 * ─── WHAT IS PERSISTED ───────────────────────────────────────────────────────
 *
 *   Only constitutional investigation outputs: KnowledgeExportRecord[].
 *   These are the sealed outputs of the full constitutional chain
 *   (Reception → Understanding → Investigation → Evidence → Knowledge
 *    → Response → Export). The chain already guarantees that no provider
 *   identity, provider URL, repository ID, or external service name
 *   appears in a KnowledgeExportRecord. Persisting them is safe.
 *
 * ─── WHAT IS NOT PERSISTED ───────────────────────────────────────────────────
 *
 *   Provider identities        — never (stripped by the constitutional chain)
 *   External provider URLs     — never (stripped by the constitutional chain)
 *   Internal chain routing IDs — never (receptionId, intentId, collectionId,
 *                                 investigationResultId are constitutional plumbing)
 *   Evidence items             — never (Evidence is an intermediate stage)
 *   Knowledge declarations     — never (already distilled into the Response)
 *
 * ─── CONSTITUTIONAL DISTINCTION ──────────────────────────────────────────────
 *
 *   This store is NOT a cache.
 *   This store is NOT HTTP optimization.
 *   This store is NOT provider-response memoization.
 *
 *   It is the permanent constitutional memory of the Empire's investigations:
 *   what was asked, what the Empire found, and when it concluded.
 *
 * ─── SUPPORTED USE CASES ─────────────────────────────────────────────────────
 *
 *   Creator investigation history    — list all investigations for a Goal
 *   Restart durability               — survive process restarts
 *   Future Makman lookup             — retrieve prior investigation conclusions
 *   Future Imperial learning         — learn from investigation patterns over time
 *   Future investigation lineage     — trace how conclusions evolved
 */

import type { KnowledgeExportRecord } from './knowledge-export-contracts';

/**
 * An Imperial Knowledge Investigation Record.
 *
 * The permanent constitutional fact that a Sovereign Investigation was
 * conducted for a Milestone Goal, producing the recorded KnowledgeExportRecords.
 *
 * `investigationId`  — unique identity for this investigation event. Two
 *                      investigations of the same Goal produce different IDs.
 *
 * `goalId`           — the Milestone Goal that triggered this investigation.
 *
 * `creatorId`        — the Creator who owns this Goal. Stored for tenant-
 *                      isolated reads — no join required.
 *
 * `records`          — the sealed KnowledgeExportRecord[] produced by the
 *                      constitutional chain for this investigation. Carried
 *                      unchanged. An empty array is an honest constitutional
 *                      outcome: no active gaps required investigation, or
 *                      all investigations failed gracefully. The Empire does
 *                      not manufacture knowledge.
 *
 * `recordCount`      — the number of KnowledgeExportRecords produced.
 *                      Denormalized from records.length for fast queries.
 *
 * `investigatedAtMs` — epoch milliseconds when this investigation concluded.
 */
export interface KnowledgeInvestigationRecord {
  readonly investigationId: string;
  readonly goalId: string;
  readonly creatorId: string;
  readonly records: readonly KnowledgeExportRecord[];
  readonly recordCount: number;
  readonly investigatedAtMs: number;
}

/**
 * The constitutional store interface for Sovereign Investigation persistence.
 *
 * `save()`              — persists a completed investigation. Every completed
 *                         investigation — including those that produced zero
 *                         records — is a constitutional fact worth recording.
 *
 * `listForGoal()`       — returns all investigations for a Milestone Goal owned
 *                         by a Creator, most recent first. Returns an empty array
 *                         when no investigations have been conducted yet.
 *
 * `findLatestForGoal()` — returns the most recent investigation for a Milestone
 *                         Goal, or null if none exists. Used by Makman for future
 *                         lookup of the last known investigation conclusion.
 */
export interface IKnowledgeInvestigationStore {
  save(record: KnowledgeInvestigationRecord): void;
  listForGoal(goalId: string, creatorId: string): readonly KnowledgeInvestigationRecord[];
  findLatestForGoal(goalId: string, creatorId: string): KnowledgeInvestigationRecord | null;
}
