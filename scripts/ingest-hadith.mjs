#!/usr/bin/env node
/**
 * AZMA OS — Ingest the collections of the Sunnah into the Empire's own store.
 *
 * ─── WHY THIS IS A SEPARATE PROCESS ─────────────────────────────────────────
 *
 *   Each collection is published as a single JSON document of about nine
 *   megabytes. JSON.parse is synchronous, so parsing one inside the server
 *   freezes the runtime for its duration — and the production log recorded
 *   exactly what that cost when the Hadith provider used to do it at search
 *   time: on every investigation *every* Ministry exceeded its five-second
 *   deadline, including the four Ministries that have no providers attached and
 *   return an empty array immediately. An empty Ministry cannot take five
 *   seconds. They took five seconds because nothing was running at all.
 *
 *   This script does that parsing once, here, in a process of its own, where
 *   the only thing it can freeze is itself. The chamber then reads rows.
 *
 * ─── WHAT IT WILL NOT DO ────────────────────────────────────────────────────
 *
 *   It does not grade a narration. Gradings are copied exactly as the source
 *   gave them, each with the name of the scholar who issued it, and a narration
 *   the sources did not grade is stored with an empty list — which the chamber
 *   displays as «درجة الحديث: غير متوفرة من المصدر». Nothing here infers a
 *   grade from the name of a collection.
 *
 * ─── USAGE ──────────────────────────────────────────────────────────────────
 *
 *   node scripts/ingest-hadith.mjs               ingest every collection
 *   node scripts/ingest-hadith.mjs ara-bukhari   ingest one
 *   AZMA_DB_PATH=/root/azma-os/data/azma-os.db node scripts/ingest-hadith.mjs
 *
 *   Re-running replaces a collection wholesale rather than appending, so it is
 *   safe to run as often as needed.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const EDITION_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

const COLLECTIONS = [
  { edition: 'ara-bukhari', titleAr: 'صحيح البخاري' },
  { edition: 'ara-muslim', titleAr: 'صحيح مسلم' },
  { edition: 'ara-abudawud', titleAr: 'سنن أبي داود' },
  { edition: 'ara-tirmidhi', titleAr: 'جامع الترمذي' },
  { edition: 'ara-nasai', titleAr: 'سنن النسائي' },
  { edition: 'ara-ibnmajah', titleAr: 'سنن ابن ماجه' },
  { edition: 'ara-malik', titleAr: 'موطأ الإمام مالك' },
  { edition: 'ara-nawawi', titleAr: 'الأربعون النووية' },
  { edition: 'ara-qudsi', titleAr: 'الأربعون القدسية' },
];

/**
 * The formulae that hand over from the chain of transmission to what was said.
 * Kept in step with providers/isnad.ts — a script cannot import the chamber's
 * TypeScript, so the list is repeated here and the two must be changed together.
 */
const HANDOVER_MARKERS = [
  'قال رسول الله صلى الله عليه وسلم',
  'قال النبي صلى الله عليه وسلم',
  'أن رسول الله صلى الله عليه وسلم',
  'ان رسول الله صلى الله عليه وسلم',
  'عن رسول الله صلى الله عليه وسلم',
  'عن النبي صلى الله عليه وسلم',
  'سمعت رسول الله صلى الله عليه وسلم',
  'أن النبي صلى الله عليه وسلم',
  'ان النبي صلى الله عليه وسلم',
  'رسول الله صلى الله عليه وسلم',
  'النبي صلى الله عليه وسلم',
];

/**
 * What was narrated, with the chain that carried it removed.
 *
 * The isnad is a roll of names and is often longer than the matn, so searching
 * a narration whole searches the names of its transmitters. Asked for the story
 * of Yunus, the chamber returned every narration carrying a transmitter named
 * Yunus. Returns the whole text when no handover can be found: searching too
 * much finds extra narrations, while cutting wrongly loses real ones.
 */
function extractMatn(narration) {
  const text = narration.trim();
  if (text.length === 0) return text;
  for (const marker of HANDOVER_MARKERS) {
    const at = text.lastIndexOf(marker);
    if (at === -1) continue;
    const matn = text.slice(at + marker.length).trim();
    if (matn.length >= 12) return matn;
  }
  return text;
}

/** Must match normaliseArabic in the provider, or the two sides never meet. */
function normaliseArabic(text) {
  return text
    .replace(/[ً-ْٰٖ-ٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveDbPath() {
  if (process.env.AZMA_DB_PATH) return process.env.AZMA_DB_PATH;
  const candidates = [
    path.join(process.cwd(), 'data', 'azma-os.db'),
    path.join(process.cwd(), '.data', 'azma-os.db'),
    path.join(process.cwd(), 'azma-os.db'),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return candidates[0];
}

const SCHEMA = `CREATE TABLE IF NOT EXISTS hadith_narrations (
  narration_id TEXT PRIMARY KEY,
  edition TEXT NOT NULL,
  collection_ar TEXT NOT NULL,
  narration_number INTEGER NOT NULL,
  text_ar TEXT NOT NULL,
  normalised_text TEXT NOT NULL,
  normalised_matn TEXT NOT NULL DEFAULT '',
  grades_json TEXT NOT NULL,
  ingested_at_ms INTEGER NOT NULL
)`;

/** For a store that already holds narrations from before the matn existed. */
const MIGRATION = "ALTER TABLE hadith_narrations ADD COLUMN normalised_matn TEXT NOT NULL DEFAULT ''";

const INDEX = 'CREATE INDEX IF NOT EXISTS idx_hadith_edition_number ON hadith_narrations(edition, narration_number)';

async function ingestOne(db, collection) {
  const url = `${EDITION_BASE}/${collection.edition}.min.json`;
  const started = Date.now();

  const response = await fetch(url);
  if (!response.ok) {
    console.log(`  BLOCKED  ${collection.titleAr.padEnd(22)} HTTP ${response.status}`);
    return { edition: collection.edition, written: 0, blocked: true };
  }

  const payload = await response.json();
  const raw = Array.isArray(payload?.hadiths) ? payload.hadiths : [];

  const rows = [];
  for (const h of raw) {
    if (typeof h?.text !== 'string' || h.text.length === 0) continue;
    const number = h.hadithnumber ?? h.arabicnumber;
    if (typeof number !== 'number' || !Number.isFinite(number)) continue;

    // Copied exactly. A grading with no scholar attached is not a grading, and
    // is dropped rather than attributed to nobody.
    const grades = Array.isArray(h.grades)
      ? h.grades
          .filter((g) => typeof g?.name === 'string' && typeof g?.grade === 'string')
          .map((g) => ({ name: g.name, grade: g.grade }))
      : [];

    rows.push({
      id: `${collection.edition}-${number}`,
      number,
      text: h.text,
      normalised: normaliseArabic(h.text),
      normalisedMatn: normaliseArabic(extractMatn(h.text)),
      grades,
    });
  }

  db.prepare('DELETE FROM hadith_narrations WHERE edition = ?').run(collection.edition);

  const insert = db.prepare(
    `INSERT OR REPLACE INTO hadith_narrations
       (narration_id, edition, collection_ar, narration_number, text_ar, normalised_text, normalised_matn, grades_json, ingested_at_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const now = Date.now();
  db.exec('BEGIN');
  try {
    for (const r of rows) {
      insert.run(r.id, collection.edition, collection.titleAr, r.number, r.text,
                 r.normalised, r.normalisedMatn, JSON.stringify(r.grades), now);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const graded = rows.filter((r) => r.grades.length > 0).length;
  const separated = rows.filter((r) => r.normalisedMatn !== r.normalised).length;
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `  ok       ${collection.titleAr.padEnd(22)} ${String(rows.length).padStart(5)} حديثاً` +
    `  · بدرجة منسوبة ${String(graded).padStart(5)}` +
    `  · فُصل سندها ${String(separated).padStart(5)}  · ${seconds}s`,
  );
  return { edition: collection.edition, written: rows.length, graded, blocked: false };
}

async function main() {
  const only = process.argv[2];
  const wanted = only ? COLLECTIONS.filter((c) => c.edition === only) : COLLECTIONS;
  if (wanted.length === 0) {
    console.error(`لا توجد مجموعة باسم '${only}'`);
    process.exit(2);
  }

  const dbPath = resolveDbPath();
  console.log(`\n== استيعاب كتب السنّة ==`);
  console.log(`   المخزن: ${dbPath}\n`);

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(SCHEMA);
  try { db.exec(MIGRATION); } catch { /* the column is already there */ }
  db.exec(INDEX);

  let total = 0;
  let graded = 0;
  let blocked = 0;
  for (const c of wanted) {
    try {
      const r = await ingestOne(db, c);
      total += r.written;
      graded += r.graded ?? 0;
      if (r.blocked) blocked += 1;
    } catch (err) {
      console.log(`  FAILED   ${c.titleAr.padEnd(22)} ${String(err).slice(0, 80)}`);
      blocked += 1;
    }
  }

  const held = db.prepare('SELECT COUNT(*) AS n FROM hadith_narrations').get();
  db.close();

  console.log(`\n   المحفوظ الآن: ${held.n} حديثاً`);
  console.log(`   منها بدرجة منسوبة إلى عالِم: ${graded}`);
  console.log(`   مجموعات لم تُستوعَب: ${blocked}\n`);

  // A run that stored nothing is a failed run, and says so in its exit code.
  process.exit(total > 0 ? 0 : 1);
}

await main();
