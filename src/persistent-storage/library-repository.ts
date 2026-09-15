/**
 * AZMA OS — The library's catalogue, held by the Empire.
 *
 * 78,130 works, ingested once by scripts/ingest-library.mjs.
 *
 * The library was treated as a weak source for weeks. It was not: its index is
 * a third-party service that answers 403 to this host, and a blocked route was
 * mistaken for a poor library. Measured over the catalogue — 11,877 works
 * touching history, 11,988 philosophy and literature, 675 medicine, 163 by
 * authors of antiquity. The Empire indexes them itself now and asks nobody.
 */

import { getDb } from './db';

export interface StoredWork {
  readonly workId: string;
  readonly title: string;
  readonly authors: string | null;
  readonly subjects: string | null;
  readonly language: string;
  readonly issued: string | null;
}

interface Row {
  work_id: string;
  title: string;
  authors: string | null;
  subjects: string | null;
  language: string;
  issued: string | null;
}

const COLUMNS = 'work_id, title, authors, subjects, language, issued';

function toWork(row: Row): StoredWork {
  return {
    workId: row.work_id,
    title: row.title,
    authors: row.authors,
    subjects: row.subjects,
    language: row.language,
    issued: row.issued,
  };
}

/**
 * Works matching every one of the given words, across title, author and
 * subject.
 *
 * `preferLanguages` brings a Creator's own tongue first where the library holds
 * it — it holds one Arabic work out of 78,130, so in practice this orders
 * English above the rest of Europe rather than delivering Arabic.
 *
 * `spread` is the reason this function exists in this shape: at most two works
 * per author, so ten results are ten voices rather than one author's collected
 * editions. «أين تنوّع الآراء؟ أين التعدّدية، الرأي والرأي الآخر؟»
 */
export function searchWorks(
  words: readonly string[],
  limit: number,
  preferLanguages: readonly string[] = ['en'],
): StoredWork[] {
  if (words.length === 0 || limit <= 0) return [];

  const db = getDb();
  const conditions = words.map(() => 'searchable LIKE ?').join(' AND ');
  const params = words.map((w) => `%${w.toLowerCase()}%`);

  // Over-fetch, then thin by author, so the spread is real rather than whatever
  // the first N rows happened to be.
  const rows = db
    .prepare(
      `SELECT ${COLUMNS} FROM library_works
       WHERE ${conditions}
       ORDER BY
         CASE language ${preferLanguages.map((l, i) => `WHEN '${l}' THEN ${i}`).join(' ')} ELSE 99 END,
         LENGTH(title) ASC
       LIMIT ?`,
    )
    .all(...params, Math.max(limit * 6, 30)) as unknown as Row[];

  const perAuthor = new Map<string, number>();
  const chosen: StoredWork[] = [];
  for (const row of rows) {
    const author = (row.authors ?? 'unknown').split(';')[0]!.trim();
    const seen = perAuthor.get(author) ?? 0;
    if (seen >= 2) continue;
    perAuthor.set(author, seen + 1);
    chosen.push(toWork(row));
    if (chosen.length >= limit) break;
  }
  return chosen;
}

export function findWork(workId: string): StoredWork | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT ${COLUMNS} FROM library_works WHERE work_id = ? LIMIT 1`)
    .get(workId) as unknown as Row | undefined;
  return row ? toWork(row) : null;
}

export function hasWorks(): boolean {
  const db = getDb();
  const row = db
    .prepare('SELECT 1 AS present FROM library_works LIMIT 1')
    .get() as unknown as { present: number } | undefined;
  return row !== undefined;
}

export function libraryCounts(): { total: number; byLanguage: Record<string, number> } {
  const db = getDb();
  const rows = db
    .prepare('SELECT language, COUNT(*) AS n FROM library_works GROUP BY language ORDER BY n DESC LIMIT 8')
    .all() as unknown as { language: string; n: number }[];
  const total = db.prepare('SELECT COUNT(*) AS n FROM library_works').get() as unknown as { n: number };

  const byLanguage: Record<string, number> = {};
  for (const r of rows) byLanguage[r.language] = r.n;
  return { total: total.n, byLanguage };
}
