#!/usr/bin/env node
/**
 * AZMA OS — backup of everything a creator would lose with the server:
 * the SQLite database (accounts, balances, ledger, payments, projects)
 * and the media folders (uploads, generated assets, rendered films).
 *
 *   node scripts/backup.mjs [--out <dir>]
 *
 * The database is copied with `VACUUM INTO`, which writes one consistent
 * snapshot even while the server is running and writing (WAL mode), so
 * the server does not need to stop. Media folders are copied as they are.
 * Paths follow the server's own: AZMA_DB_PATH (default data/azma-os.db),
 * UPLOADS_DIR (default public/uploads, generated assets beside it) and
 * RENDERS_DIR (default public/renders).
 *
 * Keep the output somewhere other than this server's disk. Restore by
 * stopping the server, putting azma-os.db back at the database path and
 * copying the media folders back.
 */

import { DatabaseSync } from 'node:sqlite';
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const cwd = process.cwd();
const outFlag = process.argv.indexOf('--out');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = resolve(outFlag > -1 ? process.argv[outFlag + 1] : join(cwd, 'backups', stamp));

const dbPath = resolve(process.env.AZMA_DB_PATH ?? join(cwd, 'data', 'azma-os.db'));
const uploadsDir = process.env.UPLOADS_DIR;
const mediaDirs = {
  uploads: uploadsDir ?? join(cwd, 'public', 'uploads'),
  'generated-assets': uploadsDir ? join(uploadsDir, 'generated-assets') : join(cwd, 'public', 'generated-assets'),
  renders: process.env.RENDERS_DIR ?? join(cwd, 'public', 'renders'),
};

function sizeOf(path) {
  const stat = statSync(path);
  if (!stat.isDirectory()) return { files: 1, bytes: stat.size };
  return readdirSync(path).reduce((acc, name) => {
    const child = sizeOf(join(path, name));
    return { files: acc.files + child.files, bytes: acc.bytes + child.bytes };
  }, { files: 0, bytes: 0 });
}

if (!existsSync(dbPath)) {
  console.error(`No database at ${dbPath}. Set AZMA_DB_PATH or run from the app folder.`);
  process.exit(1);
}
if (existsSync(outDir) && readdirSync(outDir).length > 0) {
  console.error(`${outDir} is not empty; choose another --out.`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const manifest = { createdAt: new Date().toISOString(), database: null, media: {} };

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA busy_timeout=5000;');
const snapshot = join(outDir, 'azma-os.db');
db.prepare('VACUUM INTO ?').run(snapshot);
db.close();
const check = new DatabaseSync(snapshot, { readOnly: true });
const integrity = check.prepare('PRAGMA integrity_check').get();
const creators = check.prepare('SELECT COUNT(*) AS n FROM creators').get();
check.close();
manifest.database = { source: dbPath, bytes: statSync(snapshot).size, integrity: Object.values(integrity)[0], creators: creators.n };

for (const [name, dir] of Object.entries(mediaDirs)) {
  if (!existsSync(dir)) {
    manifest.media[name] = { source: dir, missing: true };
    continue;
  }
  cpSync(dir, join(outDir, name), { recursive: true, preserveTimestamps: true });
  manifest.media[name] = { source: dir, ...sizeOf(join(outDir, name)) };
}

writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ outDir, ...manifest }, null, 2));
if (manifest.database.integrity !== 'ok') {
  console.error('Integrity check of the snapshot failed.');
  process.exit(2);
}
