/**
 * AZMA OS — Qiyamah capability proof, against production, with exact ids.
 *
 *   node scripts/verify-qiyamah-capabilities.mjs <base-url> <password-file> <out-dir> [test]
 *
 *   test = infographic (default) | all
 *
 * ─── THE RULE THIS SCRIPT LIVES UNDER ────────────────────────────────────────
 *
 *   The proof of 2026-09-22 destroyed a Founder's asset because its cleanup
 *   guessed. This script guesses nothing. Every resource it may remove is
 *   recorded in a run ledger at the moment its exact id is known, and cleanup
 *   is planned by that ledger against what the system says is live now. If a
 *   step creates nothing, the ledger holds nothing, and nothing is removed.
 *   See scripts/proof-harness/run-ledger.js and its tests.
 *
 *   The ids the run receives:
 *     generation  — the generate route answers with asset.assetId (the file
 *                   id); the generation RECORD id is found by exact equality
 *                   of assetUrl in the Creator's own list — an exact key the
 *                   run was handed, never a position.
 *     vault asset — /api/vault/assets, exact equality of originatingOperationId
 *                   or of assetId the edit route returned.
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createRunLedger, executeCleanup } from './proof-harness/run-ledger.js';

const BASE = process.argv[2] ?? 'https://azmaos.com';
const PW = readFileSync(process.argv[3], 'utf8').trim();
const OUT = process.argv[4] ?? '.';
const WHICH = process.argv[5] ?? 'infographic';
mkdirSync(OUT, { recursive: true });

const TEST_RUN_ID = `qiyamah-proof-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
let pass = 0, fail = 0;
const check = (n, ok, d = '') => { console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (d ? '   ' + String(d).slice(0, 180) : '')); ok ? pass++ : fail++; };
const api = (page, path, init) => page.evaluate(async ([p, i]) => {
  const r = await fetch(p, i); let j = null; try { j = await r.json(); } catch {} return { status: r.status, json: j };
}, [path, init ?? {}]);
const bytesOf = (page, path) => page.evaluate(async (p) => {
  const r = await fetch(p); if (!r.ok) return { status: r.status, b64: null };
  const buf = new Uint8Array(await r.arrayBuffer()); let s = ''; for (const b of buf) s += String.fromCharCode(b);
  return { status: r.status, b64: btoa(s), type: r.headers.get('content-type') };
}, path);
const isPng = (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
const isJpeg = (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
const sha = async (b) => { const { createHash } = await import('node:crypto'); return createHash('sha256').update(b).digest('hex'); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: 'ar', viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
let ledger = null;

try {
  await page.goto(BASE + '/signup', { waitUntil: 'domcontentloaded' });
  const login = await api(page, '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'founder@azmaos.com', password: PW }) });
  check('signed in', login.status === 200);
  const me = (await api(page, '/api/auth/me')).json;
  ledger = createRunLedger({ runId: TEST_RUN_ID, ownerId: me.creatorId });
  console.log(`  run ${TEST_RUN_ID} owner ${me.creatorId}`);

  // ── TEST 1 · Nano Banana 2 — infographic through the real Qiyamah workflow ──
  console.log('\n== TEST 1 · infographic (Nano Banana 2) — browser: style, brief, expand, generate ==');
  const BRIEF = 'إنفوغرافيك يشرح ثلاث مراحل لصناعة القهوة: الزراعة ثم التحميص ثم التحضير، مع أيقونة وعنوان قصير لكل مرحلة';
  await page.goto(BASE + '/qiyamah-chamber', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#qiyamah-idea', { timeout: 30000 });
  await page.locator('.style-tile', { hasText: 'إنفوغرافيك' }).first().click();
  check('the infographic style is a real choice in the chamber', await page.locator('.style-tile--selected', { hasText: 'إنفوغرافيك' }).count() === 1);
  await page.locator('#qiyamah-idea').fill(BRIEF);
  await page.locator('.trigger-genesis-btn').first().click();
  await page.waitForSelector('.review-form', { timeout: 90000 });
  check('expand produced a prompt for review', true);

  // Catch the generate response as the browser receives it: the exact ids.
  const generateResponse = page.waitForResponse((r) => r.url().endsWith('/api/qiyamah/generate') && r.request().method() === 'POST', { timeout: 240000 });
  await page.locator('.review-form .trigger-genesis-btn').first().click();
  const gen = await (await generateResponse).json();
  const operationId = gen.operationId ?? gen.asset?.operationId;
  check('generate answered with an operation id', typeof operationId === 'string', operationId);
  if (gen.status !== 'succeeded') {
    check(`generation succeeded`, false, `${gen.status} ${gen.reason} @${gen.stage}: ${gen.detail ?? gen.message}`);
    throw new Error('generation failed — nothing recorded, nothing to clean');
  }
  check('generation succeeded', true, `asset ${gen.asset.assetId}`);
  {
    const first = await bytesOf(page, gen.asset.assetUrl);
    const b = Buffer.from(first.b64 ?? '', 'base64');
    if (b.length > 0) { const pth = join(OUT, `${TEST_RUN_ID}-infographic-raw.${isJpeg(b) ? 'jpg' : 'png'}`); writeFileSync(pth, b); console.log(`  saved for inspection: ${pth}`); }
  }
  check('the model executed is Nano Banana 2 — as the binding reported it', gen.asset.providerModelId === 'nano-banana-2', gen.asset.providerModelId);

  // Exact ids → ledger. The generation record by exact assetUrl; the vault asset by exact operation id.
  const gens = (await api(page, '/api/qiyamah/generations')).json.generations;
  const record = gens.filter((g) => g.assetUrl === gen.asset.assetUrl);
  check('exactly one generation record carries this run\'s assetUrl', record.length === 1);
  ledger.record({ resourceType: 'generation', resourceId: record[0].recordId, operationId, createdAt: record[0].generatedAt });
  const assets = (await api(page, '/api/vault/assets')).json.assets;
  const vaultRows = assets.filter((a) => a.originatingOperationId === gen.asset.assetId);
  check('exactly one Vault asset was deposited for it', vaultRows.length === 1);
  const infographic = vaultRows[0];
  check('Vault provenance: provider, executed model, operation', infographic.metadata?.providerId === 'magic-hour-image' && infographic.metadata?.generationModel === 'nano-banana-2' && infographic.metadata?.generationOperationId === operationId, JSON.stringify({ p: infographic.metadata?.providerId, m: infographic.metadata?.generationModel }));
  check('Vault lineage: root of its own line, version 1, GENERATED', infographic.parentAssetId == null && infographic.rootAssetId === infographic.assetId && infographic.version === 1 && infographic.derivation === 'GENERATED', `${infographic.version} ${infographic.derivation}`);

  // The file, the real one.
  const got = await bytesOf(page, gen.asset.assetUrl);
  const bytes = Buffer.from(got.b64 ?? '', 'base64');
  check('the output file exists and is an image', got.status === 200 && (isPng(bytes) || isJpeg(bytes)) && bytes.length > 10_000, `${got.status} ${bytes.length} bytes ${got.type}`);
  const infographicPath = join(OUT, `${TEST_RUN_ID}-infographic.${isJpeg(bytes) ? 'jpg' : 'png'}`);
  writeFileSync(infographicPath, bytes);
  console.log(`  saved for inspection: ${infographicPath}`);
  await page.waitForSelector('.master-preview', { timeout: 30000 });
  check('the Creator sees the result in the chamber', (await page.locator('.master-preview').getAttribute('src')) === gen.asset.assetUrl);
  const parentDigest = await sha(bytes);

  // ── TEST 1b · Nano Banana 2 — edit inside the new asset, a derived asset ──
  console.log('\n== TEST 1b · edit inside the infographic (Nano Banana 2) — derived asset with lineage ==');
  const edit = await api(page, `/api/vault/assets/${infographic.assetId}/edit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ instruction: 'اجعل خلفية الإنفوغرافيك زرقاء داكنة وأبقِ كل النصوص والأيقونات كما هي' }) });
  if (edit.status !== 200 || edit.json?.status !== 'succeeded') {
    check('edit succeeded', false, `${edit.status} ${edit.json?.reason}: ${edit.json?.message}`);
  } else {
    const d = edit.json;
    check('edit succeeded', true, `derived ${d.assetId ?? d.asset?.assetId}`);
    const derivedId = d.assetId ?? d.asset?.assetId;
    const after = (await api(page, '/api/vault/assets')).json.assets;
    const derived = after.filter((a) => a.assetId === derivedId);
    check('exactly one derived asset exists', derived.length === 1);
    if (derived.length === 1) {
      const dv = derived[0];
      ledger.record({ resourceType: 'vault-asset', resourceId: dv.assetId, operationId: dv.originatingOperationId ?? dv.assetId, createdAt: dv.createdAt });
      check('lineage: parent = source, root = source root, version 2, MODIFIED', dv.parentAssetId === infographic.assetId && dv.rootAssetId === infographic.rootAssetId && dv.version === 2 && dv.derivation === 'MODIFIED', `${dv.parentAssetId} ${dv.version} ${dv.derivation}`);
      check('provenance: the edit binding and the exact model executed', dv.metadata?.mutationProviderId === 'magic-hour-image-editor' && dv.metadata?.mutationProviderModelId === 'nano-banana-2' && typeof dv.metadata?.mutationProviderJobId === 'string', JSON.stringify({ p: dv.metadata?.mutationProviderId, m: dv.metadata?.mutationProviderModelId }));
      check('no false inheritance: the derived asset carries no generationModel/prompt of its parent', dv.metadata?.generationModel === undefined && dv.metadata?.generationPrompt === undefined && dv.metadata?.providerId === undefined);
      const dbytes = Buffer.from((await bytesOf(page, dv.secureStorageUri)).b64 ?? '', 'base64');
      check('the derived file exists, is an image, and differs from its parent', (isPng(dbytes) || isJpeg(dbytes)) && (await sha(dbytes)) !== parentDigest, `${dbytes.length} bytes`);
      writeFileSync(join(OUT, `${TEST_RUN_ID}-infographic-edited.${isJpeg(dbytes) ? 'jpg' : 'png'}`), dbytes);
      const pbytes = Buffer.from((await bytesOf(page, infographic.secureStorageUri)).b64 ?? '', 'base64');
      check('the source image is untouched (byte-identical)', (await sha(pbytes)) === parentDigest);
      const parentAfter = after.find((a) => a.assetId === infographic.assetId);
      check('the source record is untouched (still version 1, still the root)', parentAfter?.version === 1 && parentAfter?.rootAssetId === infographic.assetId);
    }
  }

  // ── Observability · a failed attempt explains itself ───────────────────────
  console.log('\n== observability · a refused attempt names its operation and stage ==');
  const refused = await api(page, '/api/qiyamah/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: 'x'.repeat(1001), style: 'infographic', mediaType: 'image' }) });
  check('a refused generation carries operationId + stage + reason', refused.status === 400 && typeof refused.json?.operationId === 'string' && typeof refused.json?.stage === 'string', JSON.stringify({ s: refused.status, op: refused.json?.operationId?.slice(0, 8), stage: refused.json?.stage, reason: refused.json?.reason }));
} catch (e) {
  fail++;
  console.log('  ERROR  ' + (e && e.message ? e.message.split('\n')[0] : String(e)));
  try { await page.screenshot({ path: join(OUT, `${TEST_RUN_ID}-error.png`) }); } catch {}
} finally {
  console.log('\n== cleanup · only what this run recorded, and only if the system agrees ==');
  if (!ledger || ledger.entries().length === 0) {
    console.log('  ledger empty → 0 deletions');
  } else {
    const gens = (await api(page, '/api/qiyamah/generations')).json?.generations ?? [];
    const assets = (await api(page, '/api/vault/assets')).json?.assets ?? [];
    const live = [
      ...gens.map((g) => ({ resourceType: 'generation', resourceId: g.recordId, createdAt: g.generatedAt, ownerId: ledger.ownerId })),
      ...assets.map((a) => ({ resourceType: 'vault-asset', resourceId: a.assetId, createdAt: a.createdAt, ownerId: a.subscriberTenantId ?? ledger.ownerId })),
    ];
    const plan = ledger.cleanupPlan(live);
    console.log(`  ledger ${ledger.entries().length} · deletable ${plan.deletable.length} · refused ${plan.refused.length}`);
    const result = await executeCleanup(plan, async (entry) => {
      const path = entry.resourceType === 'generation' ? `/api/qiyamah/generations/${entry.resourceId}` : `/api/vault/assets/${entry.resourceId}`;
      const r = await api(page, path, { method: 'DELETE' });
      return r.status;
    });
    for (const d of result.deleted) console.log(`  deleted ${d.entry.resourceType} ${d.entry.resourceId} → ${JSON.stringify(d.outcome)}`);
    for (const r of result.refused) console.log(`  refused ${r.entry.resourceType} ${r.entry.resourceId} (${r.reason})`);
  }
  await browser.close();
  console.log(`\n${fail === 0 ? 'VERIFIED' : 'FAILED'}  ${pass} passed, ${fail} failed against ${BASE}  [${WHICH}]`);
  process.exit(fail === 0 ? 0 : 1);
}
