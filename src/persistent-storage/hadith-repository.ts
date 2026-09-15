/**
 * AZMA OS — The Sunnah, held by the Empire.
 *
 * ─── WHY THE NARRATIONS LIVE HERE AND NOT IN MEMORY ─────────────────────────
 *
 *   The collections are published as single JSON documents of nine megabytes.
 *   The first shape of the Hadith provider retrieved and parsed them inside the
 *   server, and the production log recorded exactly what that cost: on every
 *   investigation, *every* Ministry exceeded its five-second deadline —
 *   including the four Ministries that have no providers attached and return an
 *   empty array immediately. An empty Ministry cannot take five seconds. They
 *   took five seconds because nothing was running at all. JSON.parse is
 *   synchronous, and while it ran the runtime was frozen for every Creator
 *   inside the Empire.
 *
 *   Moving that parse into the background would have moved the freeze, not
 *   ended it. So the parse happens once, in a separate process (see
 *   scripts/ingest-hadith.mjs), and the chamber reads rows.
 *
 *   A search is now an indexed SQL query over some forty thousand rows, and
 *   nothing is held in memory between requests.
 */

import { getDb } from './db';

export interface StoredGrade {
  readonly name: string;
  readonly grade: string;
}

export interface StoredNarration {
  readonly narrationId: string;
  readonly edition: string;
  readonly collectionAr: string;
  readonly narrationNumber: number;
  readonly textAr: string;
  /**
   * Every grading exactly as its source gave it, each with the scholar who
   * issued it. An empty array is a real answer — the sources stated no grade —
   * and is displayed as such rather than filled in from a collection's name.
   */
  readonly grades: readonly StoredGrade[];
}

interface Row {
  narration_id: string;
  edition: string;
  collection_ar: string;
  narration_number: number;
  text_ar: string;
  grades_json: string;
}

function toNarration(row: Row): StoredNarration {
  let grades: StoredGrade[] = [];
  try {
    const parsed = JSON.parse(row.grades_json) as unknown;
    if (Array.isArray(parsed)) {
      grades = parsed
        .filter((g): g is StoredGrade =>
          typeof g === 'object' && g !== null &&
          typeof (g as StoredGrade).name === 'string' &&
          typeof (g as StoredGrade).grade === 'string')
        .map((g) => ({ name: g.name, grade: g.grade }));
    }
  } catch {
    // A grading that cannot be read is not a grading. It is dropped rather than
    // guessed at, and the narration is then displayed as ungraded.
    grades = [];
  }

  return {
    narrationId: row.narration_id,
    edition: row.edition,
    collectionAr: row.collection_ar,
    narrationNumber: row.narration_number,
    textAr: row.text_ar,
    grades,
  };
}

/**
 * Narrations whose text contains every one of the given subject words.
 *
 * Words are matched against the normalised matn — what was narrated, with the
 * chain that carried it removed — so a question spelled without diacritics
 * finds a narration written with them, and a question about a person does not
 * find every narration transmitted by someone who shares that person's name.
 * Requiring all words rather than any keeps a two-word subject from returning
 * every narration that happens to contain its commonest half.
 */
export function searchNarrations(
  normalisedWords: readonly string[],
  limit: number,
): StoredNarration[] {
  if (normalisedWords.length === 0 || limit <= 0) return [];

  const db = getDb();
  // Searched in the matn — what was narrated — and not in the chain that
  // carried it. The chain is a roll of names, and searching it turned a
  // question about the Prophet Yunus into every narration with a transmitter
  // who shared his name. COALESCE keeps a store that has the column but has not
  // been re-ingested behaving exactly as it did before, rather than silently
  // finding nothing.
  const field = "COALESCE(NULLIF(normalised_matn, ''), normalised_text)";
  const conditions = normalisedWords.map(() => `${field} LIKE ?`).join(' AND ');
  const params = normalisedWords.map((w) => `%${w}%`);

  const rows = db
    .prepare(
      `SELECT narration_id, edition, collection_ar, narration_number, text_ar, grades_json
       FROM hadith_narrations
       WHERE ${conditions}
       ORDER BY LENGTH(text_ar) ASC
       LIMIT ?`,
    )
    .all(...params, limit) as unknown as Row[];

  return rows.map(toNarration);
}

/** Narrations containing at least one of the words, when all of them found none. */
export function searchNarrationsAny(
  normalisedWords: readonly string[],
  limit: number,
): StoredNarration[] {
  if (normalisedWords.length === 0 || limit <= 0) return [];

  const db = getDb();
  const field = "COALESCE(NULLIF(normalised_matn, ''), normalised_text)";
  const conditions = normalisedWords.map(() => `${field} LIKE ?`).join(' OR ');
  const params = normalisedWords.map((w) => `%${w}%`);

  const rows = db
    .prepare(
      `SELECT narration_id, edition, collection_ar, narration_number, text_ar, grades_json
       FROM hadith_narrations
       WHERE ${conditions}
       ORDER BY LENGTH(text_ar) ASC
       LIMIT ?`,
    )
    .all(...params, limit) as unknown as Row[];

  return rows.map(toNarration);
}

export function findNarration(edition: string, number: number): StoredNarration | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT narration_id, edition, collection_ar, narration_number, text_ar, grades_json
       FROM hadith_narrations
       WHERE edition = ? AND narration_number = ?
       LIMIT 1`,
    )
    .get(edition, number) as unknown as Row | undefined;

  return row ? toNarration(row) : null;
}

/**
 * What the Empire actually holds.
 *
 * The chamber reports an empty table as an empty table. A Creator asking for a
 * narration before ingestion has run is told the collections are not yet held,
 * rather than shown a silence they must interpret.
 */
export function narrationCounts(): { total: number; byCollection: Record<string, number> } {
  const db = getDb();
  const rows = db
    .prepare('SELECT collection_ar, COUNT(*) AS n FROM hadith_narrations GROUP BY collection_ar')
    .all() as unknown as { collection_ar: string; n: number }[];

  const byCollection: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    byCollection[r.collection_ar] = r.n;
    total += r.n;
  }
  return { total, byCollection };
}

export function hasNarrations(): boolean {
  const db = getDb();
  const row = db
    .prepare('SELECT 1 AS present FROM hadith_narrations LIMIT 1')
    .get() as unknown as { present: number } | undefined;
  return row !== undefined;
}

/** Used by ingestion only. Replaces one collection wholesale. */
export function replaceCollection(
  edition: string,
  collectionAr: string,
  narrations: readonly {
    number: number;
    text: string;
    normalised: string;
    /** The narration with its chain of transmission removed, normalised. */
    normalisedMatn: string;
    grades: readonly StoredGrade[];
  }[],
): number {
  const db = getDb();
  db.prepare('DELETE FROM hadith_narrations WHERE edition = ?').run(edition);

  const insert = db.prepare(
    `INSERT INTO hadith_narrations
       (narration_id, edition, collection_ar, narration_number, text_ar, normalised_text, normalised_matn, grades_json, ingested_at_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const now = Date.now();
  let written = 0;
  db.exec('BEGIN');
  try {
    for (const n of narrations) {
      insert.run(
        `${edition}-${n.number}`,
        edition,
        collectionAr,
        n.number,
        n.text,
        n.normalised,
        n.normalisedMatn,
        JSON.stringify(n.grades),
        now,
      );
      written += 1;
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return written;
}
