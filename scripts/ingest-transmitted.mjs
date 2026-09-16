#!/usr/bin/env node
/**
 * AZMA OS — Ingest the transmitted corpus: what «الإسرائيليات» was drawn from.
 *
 * ─── WHAT WAS MEASURED BEFORE THIS SCRIPT WAS WRITTEN ───────────────────────
 *
 *   The Founder ordered that the Isra'iliyyat category be populated only from
 *   explicitly identified and verifiable sources, and that if none exist it stay
 *   empty with the classification declared unavailable.
 *
 *   It was searched for twice.
 *
 *   In the tafsirs: «الإسرائيليات» appears in ZERO of 507 verses of al-Qurtubi
 *   and al-Baghawi across al-Baqara, al-Kahf and Yusuf.
 *
 *   In the library: ZERO of 79,381 volumes are titled or subjected
 *   «إسرائيليات» or "Israiliyyat". But the library does hold the corpus those
 *   reports were drawn FROM, and the Founder asked for it by name: search the
 *   library and add it.
 *
 * ─── WHAT THIS INGESTS, AND WHAT IT REFUSES TO CLAIM ────────────────────────
 *
 *   Seven public-domain volumes of Jewish traditional narrative — Ginzberg's
 *   Legends of the Jews and its companions. They carry the MATERIAL. They do
 *   not carry the CLASSIFICATION: «موافق», «مخالف» and «يُتوقَّف فيه» are
 *   rulings Muslim scholars make about reports that entered Islamic exegesis,
 *   and Ginzberg was compiling Jewish tradition, not classifying what crossed
 *   over.
 *
 *   So every row is stored UNCLASSIFIED. That is a measurement, not a default,
 *   and the chamber tells the Creator so in those words. Inferring a ruling by
 *   reading would be this Empire issuing a religious judgement, which it is
 *   forbidden and unfit to do.
 *
 * ─── USAGE ──────────────────────────────────────────────────────────────────
 *
 *   AZMA_DB_PATH=/root/azma-os/data/azma-os.db node scripts/ingest-transmitted.mjs
 *
 *   Re-running replaces a work wholesale. The parse happens here, in a process
 *   of its own, for the same reason the Sunnah's does: synchronous work over
 *   megabytes must never happen inside the server.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const CACHE = 'https://www.gutenberg.org/cache/epub';

/**
 * The works, and what each one honestly is.
 *
 * `provenanceAr` is what the chamber will say about the source. None of them
 * says «إسرائيليات», because none of them does.
 */
const WORKS = [
  { id: '1493', title: 'The Legends of the Jews — Volume 1', compiler: 'Louis Ginzberg',
    provenanceAr: 'مجموعة من التراث اليهودي المنقول، جمعها لويس غينزبرغ' },
  { id: '1494', title: 'The Legends of the Jews — Volume 2', compiler: 'Louis Ginzberg',
    provenanceAr: 'مجموعة من التراث اليهودي المنقول، جمعها لويس غينزبرغ' },
  { id: '2881', title: 'The Legends of the Jews — Volume 3', compiler: 'Louis Ginzberg',
    provenanceAr: 'مجموعة من التراث اليهودي المنقول، جمعها لويس غينزبرغ' },
  { id: '2882', title: 'The Legends of the Jews — Volume 4', compiler: 'Louis Ginzberg',
    provenanceAr: 'مجموعة من التراث اليهودي المنقول، جمعها لويس غينزبرغ' },
  { id: '72268', title: 'Legends of Old Testament Characters, from the Talmud and Other Sources',
    compiler: 'Sabine Baring-Gould',
    provenanceAr: 'أخبار عن شخصيات العهد القديم، منقولة عن التلمود ومصادر أخرى' },
  { id: '15874', title: 'Old Testament Legends', compiler: 'M. R. James',
    provenanceAr: 'أخبار من تراث العهد القديم' },
  { id: '14368', title: 'Hebraic Literature: Translations from the Talmud, Midrashim and Kabbala',
    compiler: null,
    provenanceAr: 'ترجمات من التلمود والمدراش والقبالة' },
];

/** Every row carries this. See the note at the head of this file. */
const STATUS_UNCLASSIFIED = 'UNCLASSIFIED';

const SCHEMA = `CREATE TABLE IF NOT EXISTS transmitted_reports (
  report_id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  work_title TEXT NOT NULL,
  compiler TEXT,
  location TEXT NOT NULL,
  text_en TEXT NOT NULL,
  searchable_text TEXT NOT NULL,
  provenance_ar TEXT NOT NULL,
  status TEXT NOT NULL,
  scholarly_note_ar TEXT,
  ingested_at_ms INTEGER NOT NULL
)`;
const INDEX = 'CREATE INDEX IF NOT EXISTS idx_transmitted_work ON transmitted_reports(work_id)';

/** Gutenberg wraps every text in a licence header and footer. */
function stripBoilerplate(raw) {
  const start = raw.indexOf('START OF THE PROJECT GUTENBERG');
  const end = raw.indexOf('END OF THE PROJECT GUTENBERG');
  const from = start === -1 ? 0 : raw.indexOf('\n', start) + 1;
  const to = end === -1 ? raw.length : end;
  return raw.slice(from, to);
}

/**
 * Whether a passage is the furniture of a book rather than a report from it.
 *
 * Measured: the first three passages ingested from Ginzberg's first volume were
 * its title page and two stretches of its table of contents, and the chamber
 * translated them faithfully into «المقدمة، أولاً: خلق العالم، اليوم الأول،
 * اليوم الثاني...» and offered that to a Creator asking about the creation. A
 * contents page is a map of a book, not evidence from it.
 *
 * A list is recognised by what it lacks: prose of this length ends sentences,
 * and a run of chapter titles almost never does. Capitalised fragments are the
 * second tell — «The First Things Created The Alphabet The First Day».
 */
function isBookFurniture(text) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 40) return false;

  const sentenceEnds = (text.match(/[.!?](?:\s|$)/g) ?? []).length;
  const capitalised = words.filter((w) => /^[A-Z][a-z]/.test(w)).length;

  // Fewer than one sentence ending per hundred words, or more than a third of
  // the words starting with a capital: a title list, not a paragraph.
  return sentenceEnds < words.length / 100 || capitalised > words.length / 3;
}

/**
 * Cut into passages a Creator could actually read and cite.
 *
 * Paragraph boundaries, then merged until each passage is substantial enough to
 * stand on its own — a single line of dialogue is not a report, and a whole
 * chapter is not a citation.
 */
function toPassages(body) {
  const MIN = 400;
  const MAX = 1600;
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);

  const passages = [];
  let buffer = '';
  let dropped = 0;
  for (const p of paragraphs) {
    buffer = buffer ? `${buffer} ${p}` : p;
    if (buffer.length >= MIN) {
      const passage = buffer.slice(0, MAX);
      // A contents page is a map of a book, not a report from it.
      if (isBookFurniture(passage)) dropped += 1;
      else passages.push(passage);
      buffer = '';
    }
  }
  if (buffer.length >= MIN) {
    const tail = buffer.slice(0, MAX);
    if (isBookFurniture(tail)) dropped += 1;
    else passages.push(tail);
  }
  return { passages, dropped };
}

function resolveDbPath() {
  if (process.env.AZMA_DB_PATH) return process.env.AZMA_DB_PATH;
  const candidates = [
    path.join(process.cwd(), 'data', 'azma-os.db'),
    path.join(process.cwd(), 'azma-os.db'),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return candidates[0];
}

async function ingestOne(db, work) {
  const started = Date.now();
  const response = await fetch(`${CACHE}/${work.id}/pg${work.id}.txt`);
  if (!response.ok) {
    console.log(`  BLOCKED  ${work.title.slice(0, 46).padEnd(48)} HTTP ${response.status}`);
    return 0;
  }

  const { passages, dropped } = toPassages(stripBoilerplate(await response.text()));
  db.prepare('DELETE FROM transmitted_reports WHERE work_id = ?').run(work.id);

  const insert = db.prepare(
    `INSERT OR REPLACE INTO transmitted_reports
       (report_id, work_id, work_title, compiler, location, text_en, searchable_text,
        provenance_ar, status, scholarly_note_ar, ingested_at_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const now = Date.now();
  db.exec('BEGIN');
  try {
    passages.forEach((text, i) => {
      insert.run(
        `${work.id}-${i + 1}`,
        work.id,
        work.title,
        work.compiler,
        `المقطع ${i + 1}`,
        text,
        text.toLowerCase(),
        work.provenanceAr,
        STATUS_UNCLASSIFIED,
        // No scholarly note, because no scholar's note was retrieved. An empty
        // column here is a fact about the Empire's sources, not an oversight.
        null,
        now,
      );
    });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `  ok       ${work.title.slice(0, 46).padEnd(48)} ${String(passages.length).padStart(5)} مقطعاً` +
    `  · أُسقط من الفهارس ${String(dropped).padStart(4)}  · ${seconds}s`,
  );
  return passages.length;
}

async function main() {
  const dbPath = resolveDbPath();
  console.log('\n== استيعاب التراث المنقول عن أهل الكتاب ==');
  console.log(`   المخزن: ${dbPath}\n`);

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(SCHEMA);
  db.exec(INDEX);

  let total = 0;
  for (const work of WORKS) {
    try {
      total += await ingestOne(db, work);
    } catch (err) {
      console.log(`  FAILED   ${work.title.slice(0, 46).padEnd(48)} ${String(err).slice(0, 60)}`);
    }
  }

  const held = db.prepare('SELECT COUNT(*) AS n FROM transmitted_reports').get();
  const classified = db
    .prepare("SELECT COUNT(*) AS n FROM transmitted_reports WHERE status <> 'UNCLASSIFIED'")
    .get();
  db.close();

  console.log(`\n   المحفوظ الآن: ${held.n} مقطعاً`);
  console.log(`   منها بتصنيفٍ شرعي منسوب: ${classified.n}`);
  console.log('   (التصنيف حكمٌ يُصدره أهل العلم، ولا تملك الإمبراطورية مصدراً يُصدره — فلا يُستنتج.)\n');

  process.exit(total > 0 ? 0 : 1);
}

await main();
