/**
 * AZMA OS — The transmitted corpus: what «الإسرائيليات» was drawn from.
 *
 * Seven public-domain volumes of Jewish traditional narrative, ingested once by
 * scripts/ingest-transmitted.mjs. 5,435 passages, every one of them
 * UNCLASSIFIED — not as a default, but because it was searched for and no
 * source in the Empire issues the ruling that makes a report «موافق» or
 * «مخالف». The chamber says so rather than inferring one.
 *
 * Read as rows, never parsed in the server, for the same reason the Sunnah is:
 * synchronous work over megabytes inside the runtime freezes it for everyone.
 */

import { getDb } from './db';

export interface StoredTransmittedReport {
  readonly reportId: string;
  readonly workId: string;
  readonly workTitle: string;
  readonly compiler: string | null;
  readonly location: string;
  readonly textEn: string;
  readonly provenanceAr: string;
  readonly status: string;
  readonly scholarlyNoteAr: string | null;
}

interface Row {
  report_id: string;
  work_id: string;
  work_title: string;
  compiler: string | null;
  location: string;
  text_en: string;
  provenance_ar: string;
  status: string;
  scholarly_note_ar: string | null;
}

function toReport(row: Row): StoredTransmittedReport {
  return {
    reportId: row.report_id,
    workId: row.work_id,
    workTitle: row.work_title,
    compiler: row.compiler,
    location: row.location,
    textEn: row.text_en,
    provenanceAr: row.provenance_ar,
    status: row.status,
    scholarlyNoteAr: row.scholarly_note_ar,
  };
}

const COLUMNS =
  'report_id, work_id, work_title, compiler, location, text_en, provenance_ar, status, scholarly_note_ar';

/**
 * Passages carrying every one of the given words.
 *
 * These works are in English, so the words handed here are the rendering the
 * language bridge made — the corpus holds no Arabic at all. What reaches the
 * Creator crosses back through translation before it is displayed or spoken.
 */
export function searchTransmitted(words: readonly string[], limit: number): StoredTransmittedReport[] {
  if (words.length === 0 || limit <= 0) return [];

  const db = getDb();
  const conditions = words.map(() => 'searchable_text LIKE ?').join(' AND ');
  const params = words.map((w) => `%${w.toLowerCase()}%`);

  const rows = db
    .prepare(
      `SELECT ${COLUMNS} FROM transmitted_reports
       WHERE ${conditions}
       ORDER BY LENGTH(text_en) ASC
       LIMIT ?`,
    )
    .all(...params, limit) as unknown as Row[];

  return rows.map(toReport);
}

export function findTransmitted(reportId: string): StoredTransmittedReport | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT ${COLUMNS} FROM transmitted_reports WHERE report_id = ? LIMIT 1`)
    .get(reportId) as unknown as Row | undefined;
  return row ? toReport(row) : null;
}

export function hasTransmitted(): boolean {
  const db = getDb();
  const row = db
    .prepare('SELECT 1 AS present FROM transmitted_reports LIMIT 1')
    .get() as unknown as { present: number } | undefined;
  return row !== undefined;
}

/**
 * What the Empire holds, and how much of it carries a scholarly ruling.
 *
 * `classified` is the number the Founder's rule turns on. It is zero, and the
 * chamber reports zero rather than letting an empty column read as an oversight.
 */
export function transmittedCounts(): { total: number; classified: number; byWork: Record<string, number> } {
  const db = getDb();
  const rows = db
    .prepare('SELECT work_title, COUNT(*) AS n FROM transmitted_reports GROUP BY work_title')
    .all() as unknown as { work_title: string; n: number }[];

  const classified = db
    .prepare("SELECT COUNT(*) AS n FROM transmitted_reports WHERE status <> 'UNCLASSIFIED'")
    .get() as unknown as { n: number };

  const byWork: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    byWork[r.work_title] = r.n;
    total += r.n;
  }
  return { total, classified: classified.n, byWork };
}
