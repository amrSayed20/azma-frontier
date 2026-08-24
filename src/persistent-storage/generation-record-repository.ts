/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Qiyamah Generation Records
 *
 * A durable history of what was generated, by whom (when known), and
 * where the asset lives — replacing the prior disclosed gap where a
 * generation's own record existed only in its HTTP response, never
 * durably. creatorId is nullable: no real Authentication exists yet
 * (out of this Package's Boundaries), so today's records are honestly
 * anonymous until a future Authentication Package supplies a real id.
 */

import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';

export interface GenerationRecord {
  readonly recordId: string;
  readonly creatorId: string | null;
  readonly prompt: string;
  readonly style: string | null;
  readonly assetUrl: string;
  readonly generatedAt: number;
  /** The Creator's verbatim idea as entered. Null for records created before this column was added. */
  readonly originalIdea: string | null;
}

export interface NewGenerationRecord {
  readonly creatorId: string | null;
  readonly prompt: string;
  readonly style: string | null;
  readonly assetUrl: string;
  /** The Creator's verbatim idea before Qiyamah transforms it into the production prompt. */
  readonly originalIdea?: string | null;
}

export function recordGeneration(db: DatabaseSync, record: NewGenerationRecord): GenerationRecord {
  const recordId = randomUUID();
  const generatedAt = Date.now();
  const originalIdea = record.originalIdea ?? null;
  db.prepare(
    'INSERT INTO generation_records (record_id, creator_id, prompt, style, asset_url, generated_at, original_idea) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(recordId, record.creatorId, record.prompt, record.style, record.assetUrl, generatedAt, originalIdea);
  return { recordId, creatorId: record.creatorId, prompt: record.prompt, style: record.style, assetUrl: record.assetUrl, generatedAt, originalIdea };
}

export function listGenerationsForCreator(db: DatabaseSync, creatorId: string): readonly GenerationRecord[] {
  // Ordered by rowid as a tiebreaker: two records inserted within the same
  // millisecond would otherwise have no deterministic order.
  const rows = db
    .prepare('SELECT record_id, creator_id, prompt, style, asset_url, generated_at, original_idea FROM generation_records WHERE creator_id = ? ORDER BY generated_at DESC, rowid DESC')
    .all(creatorId);
  return rows.map((row) => ({
    recordId: row.record_id as string,
    creatorId: row.creator_id as string | null,
    prompt: row.prompt as string,
    style: (row.style as string | null) ?? null,
    assetUrl: row.asset_url as string,
    generatedAt: row.generated_at as number,
    originalIdea: (row.original_idea as string | null) ?? null,
  }));
}
