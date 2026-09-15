#!/usr/bin/env node
/**
 * AZMA OS — Ingest the library's whole catalogue into the Empire's own store.
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 *
 *   The library was treated as a weak source for weeks. It was not: its index —
 *   a third-party service — answers 403 to this host, and I mistook a blocked
 *   route for a poor library.
 *
 *   The Founder said it plainly: «لديك كنوز في هذه المكتبة فاقتنص منها قدر
 *   استطاعتك... لماذا تبحث عن مصادر خارجية فقط؟ أين تنوّع الآراء؟ أين
 *   التعدّدية، الرأي والرأي الآخر؟»
 *
 *   Measured over the catalogue: 11,877 volumes matching history, 11,988
 *   matching philosophy and literature, 675 matching medicine, 1,087 the
 *   natural sciences, 146 touching Islam and the orientalists who wrote about
 *   it, and 163 by authors of antiquity — Plato, Plutarch, Hippocrates, Galen,
 *   Ibn Sina. Seventy-nine thousand volumes the chamber was barely asking.
 *
 *   The catalogue itself downloads in 1.6 seconds and the book texts retrieve
 *   fine. Only the *index service* was blocked. So the Empire holds its own
 *   index now and asks nobody.
 *
 * ─── WHAT IT DOES NOT CLAIM ─────────────────────────────────────────────────
 *
 *   A row here is a work the library holds. It is not a judgement that the work
 *   is right, and several rows on one subject by authors who disagree is the
 *   point rather than a flaw — «الرأي والرأي الآخر». The chamber shows who
 *   wrote each one and when, and lets a Creator weigh them.
 *
 * ─── USAGE ──────────────────────────────────────────────────────────────────
 *
 *   AZMA_DB_PATH=/root/azma-os/data/azma-os.db node scripts/ingest-library.mjs
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const CATALOGUE = 'https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv';

const SCHEMA = `CREATE TABLE IF NOT EXISTS library_works (
  work_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT,
  subjects TEXT,
  language TEXT NOT NULL,
  issued TEXT,
  searchable TEXT NOT NULL,
  ingested_at_ms INTEGER NOT NULL
)`;
const INDEX_LANG = 'CREATE INDEX IF NOT EXISTS idx_library_language ON library_works(language)';

function resolveDbPath() {
  if (process.env.AZMA_DB_PATH) return process.env.AZMA_DB_PATH;
  const candidates = [
    path.join(process.cwd(), 'data', 'azma-os.db'),
    path.join(process.cwd(), 'azma-os.db'),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return candidates[0];
}

/** A minimal CSV reader — the catalogue quotes fields that contain commas. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; }
        else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    if (c === '\r') continue;
    field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

async function main() {
  const dbPath = resolveDbPath();
  console.log('\n== استيعاب فهرس المكتبة ==');
  console.log(`   المخزن: ${dbPath}\n`);

  const started = Date.now();
  const response = await fetch(CATALOGUE);
  if (!response.ok) {
    console.log(`  FAILED — الفهرس ردّ HTTP ${response.status}`);
    process.exit(1);
  }
  const csv = await response.text();
  console.log(`  نُزّل الفهرس: ${(csv.length / 1048576).toFixed(1)} ميجابايت في ${((Date.now() - started) / 1000).toFixed(1)}s`);

  const rows = parseCsv(csv);
  const header = rows[0].map((h) => h.trim());
  const col = (name) => header.indexOf(name);
  const iId = col('Text#');
  const iTitle = col('Title');
  const iLang = col('Language');
  const iAuthors = col('Authors');
  const iSubjects = col('Subjects');
  const iIssued = col('Issued');
  const iType = col('Type');

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(SCHEMA);
  db.exec(INDEX_LANG);
  db.exec('DELETE FROM library_works');

  const insert = db.prepare(
    `INSERT OR REPLACE INTO library_works
       (work_id, title, authors, subjects, language, issued, searchable, ingested_at_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const now = Date.now();
  let written = 0;
  const byLanguage = {};

  db.exec('BEGIN');
  try {
    for (let i = 1; i < rows.length; i += 1) {
      const r = rows[i];
      if (r.length <= iSubjects) continue;
      const id = (r[iId] ?? '').trim();
      const title = (r[iTitle] ?? '').replace(/\s+/g, ' ').trim();
      // Text only. The catalogue also lists sound recordings, which have no
      // passages to offer as evidence.
      if (!id || !title || (r[iType] ?? '').trim() !== 'Text') continue;

      const authors = (r[iAuthors] ?? '').replace(/\s+/g, ' ').trim();
      const subjects = (r[iSubjects] ?? '').replace(/\s+/g, ' ').trim();
      const language = (r[iLang] ?? '').trim() || 'und';

      insert.run(
        id, title, authors || null, subjects || null, language,
        (r[iIssued] ?? '').trim() || null,
        `${title} ${authors} ${subjects}`.toLowerCase(),
        now,
      );
      written += 1;
      byLanguage[language] = (byLanguage[language] ?? 0) + 1;
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const top = Object.entries(byLanguage).sort((a, b) => b[1] - a[1]).slice(0, 6);
  db.close();

  console.log(`  المحفوظ: ${written} كتاباً`);
  console.log(`  اللغات : ${top.map(([l, n]) => `${l}=${n}`).join(' · ')}`);
  console.log('  (الفهرس الآن للإمبراطورية نفسها — لا تسأل خدمةً خارجية عن ما تملكه.)\n');

  process.exit(written > 0 ? 0 : 1);
}

await main();
