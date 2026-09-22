/**
 * AZMA OS — Seedance image→video production proof (animate-asset).
 *
 *   node scripts/verify-seedance-animate.mjs <base-url> <password-file> <out-dir> <SOURCE_ASSET_ID> [ssh-target]
 *
 * ─── WHAT IT PROVES, AND HOW ─────────────────────────────────────────────────
 *
 *   «I took THIS sovereign image, owned by THIS creator, sent THIS image with
 *   THIS motion instruction to THIS Seedance model through THIS provider
 *   binding, received THIS real video, stored THESE exact bytes as THIS new
 *   sovereign derived asset, preserved THIS exact original image unchanged,
 *   and recorded the complete lineage.»
 *
 *   The source is named by EXACT id on the command line — never latest, never
 *   a position. Every resource this run creates is recorded in the run ledger
 *   at the moment its exact id is known. The source is never recorded, so it
 *   can never be planned for deletion. Media facts (container, codec,
 *   duration, frames, temporal change) are read with ffprobe/ffmpeg on the
 *   server, against the stored file, into /tmp only.
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRunLedger } from './proof-harness/run-ledger.js';

const BASE = process.argv[2] ?? 'https://azmaos.com';
const PW = readFileSync(process.argv[3], 'utf8').trim();
const OUT = process.argv[4] ?? '.';
const SOURCE_ASSET_ID = process.argv[5];
const SSH = process.argv[6] ?? 'root@2.28.52.180';
if (!SOURCE_ASSET_ID) { console.error('SOURCE_ASSET_ID is required — by exact id, decided by a person'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

const TEST_RUN_ID = `seedance-proof-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
const REQUESTED_MODEL_ID = 'seedance-2-0';            // AZMA fleet id the Creator chooses
const VERIFIED_PROVIDER_MODEL = 'seedance-2.0';      // the exact enum value the binding must send
const INSTRUCTION = 'أبقِ الشخص والتكوين كما هما بينما تتقدّم الكاميرا ببطء إلى الأمام، مع حركة طبيعية خفيفة في الضوء والظلال والعناصر المحيطة';

let pass = 0, fail = 0;
const evidence = { TEST_RUN_ID, deployment: null, ownerId: null, source: {}, provider: {}, output: {}, lineage: {}, ownership: {}, temporal: {}, cleanup: {} };
const check = (n, ok, d = '') => { console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (d ? '   ' + String(d).slice(0, 200) : '')); ok ? pass++ : fail++; return ok; };
const api = (page, path, init) => page.evaluate(async ([p, i]) => { const r = await fetch(p, i); let j = null; try { j = await r.json(); } catch {} return { status: r.status, json: j }; }, [path, init ?? {}]);
const bytesOf = (page, path) => page.evaluate(async (p) => {
  const r = await fetch(p); if (!r.ok) return { status: r.status, b64: null, type: null };
  const buf = new Uint8Array(await r.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return { status: r.status, b64: btoa(s), type: r.headers.get('content-type') };
}, path);
const sha = (b) => createHash('sha256').update(b).digest('hex');
const isMp4 = (b) => b.length > 12 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70;
const isWebm = (b) => b.length > 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3;
const isImage = (b) => (b[0] === 0x89 && b[1] === 0x50) || (b[0] === 0xff && b[1] === 0xd8) || (b[0] === 0x52 && b[1] === 0x49);
const ssh = (cmd) => execFileSync('ssh', ['-i', `${process.env.HOME ?? process.env.USERPROFILE}/.ssh/id_ed25519_azma`, '-o', 'BatchMode=yes', SSH, cmd], { encoding: 'utf8', timeout: 120000 });

const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: 'ar', viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
let ledger = null;

try {
  await page.goto(BASE + '/signup', { waitUntil: 'domcontentloaded' });
  const login = await api(page, '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'founder@azmaos.com', password: PW }) });
  check('authenticated as the proof owner', login.status === 200);
  const me = (await api(page, '/api/auth/me')).json;
  evidence.ownerId = me.creatorId;
  ledger = createRunLedger({ runId: TEST_RUN_ID, ownerId: me.creatorId });
  evidence.deployment = ssh('readlink -f /root/azma-os/.next | sed "s#.*/releases/##; s#/.next##"').trim();
  console.log(`  run ${TEST_RUN_ID} · owner ${me.creatorId} · deployment ${evidence.deployment}`);

  // ── §3–5 · the source, by exact id, through the owner-scoped boundary ──────
  console.log('\n== SOURCE · exact id, ownership, immutable baseline ==');
  const listBefore = (await api(page, '/api/vault/assets')).json.assets;
  const sources = listBefore.filter((a) => a.assetId === SOURCE_ASSET_ID);
  if (!check('the source is exactly one asset in the authenticated owner\'s Vault list', sources.length === 1, SOURCE_ASSET_ID)) throw new Error('source not owned — stop before any provider call');
  const src = sources[0];
  check('the source is a visual asset', src.capabilityTarget === 'VISUAL');
  check('the source is not the excluded proof asset', !String(src.secureStorageUri).includes('2c99b46b-33d6-4083-93ff-885f7256e3a9'));
  const srcGot = await bytesOf(page, src.secureStorageUri);
  const srcBytes = Buffer.from(srcGot.b64 ?? '', 'base64');
  check('the source file is readable, valid image bytes', srcGot.status === 200 && isImage(srcBytes) && srcBytes.length > 1000, `${srcGot.status} ${srcBytes.length} bytes ${srcGot.type}`);
  evidence.source = { assetId: src.assetId, ownerId: src.subscriberTenantId, storageUri: src.secureStorageUri, byteLength: srcBytes.length, sha256Before: sha(srcBytes), mime: srcGot.type, version: src.version, rootAssetId: src.rootAssetId, parentAssetId: src.parentAssetId ?? null, derivation: src.derivation };
  console.log('  ' + JSON.stringify(evidence.source));
  writeFileSync(join(OUT, `${TEST_RUN_ID}-source.${srcGot.type?.includes('png') ? 'png' : 'jpg'}`), srcBytes);
  const generationsBefore = ((await api(page, '/api/qiyamah/generations')).json.generations ?? []).length;
  console.log(`  snapshot: ${listBefore.length} assets, ${generationsBefore} generation records (counted, never used to choose)`);

  // ── §6 · the model the request will name, and what the binding must send ──
  // Read from the fleet SOURCE at the deployed commit (the release id carries
  // it), never from a minified chunk: the first draft grepped the chunk,
  // found nothing, and failed a proof whose facts were sound.
  const deployedCommit = (evidence.deployment.match(/-([0-9a-f]{7})$/) ?? [])[1];
  const fleetSource = execFileSync('git', ['show', `${deployedCommit}:src/sovereign-model-selection/video-model-fleet.ts`], { encoding: 'utf8' });
  const seedanceEntry = fleetSource.slice(fleetSource.indexOf("modelId: 'seedance-2-0'"));
  const mapped = (seedanceEntry.match(/providerModelId:\s*'([^']+)'/) ?? [])[1];
  check(`the deployed fleet (${deployedCommit}) maps seedance-2-0 → the verified provider identifier`, mapped === VERIFIED_PROVIDER_MODEL, mapped);

  // ── §24 · the browser journey ─────────────────────────────────────────────
  console.log('\n== BROWSER · Qiyamah → the source\'s card → animate → Seedance → instruction → run ==');
  await page.goto(BASE + '/qiyamah-chamber', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#qiyamah-idea', { timeout: 30000 });
  const card = page.locator('.generation-card', { has: page.locator(`img.generation-thumb[src="${src.secureStorageUri}"]`) }).first();
  await card.waitFor({ timeout: 30000 });
  check('the source image is the one on the card (exact stored URI)', (await card.locator('img.generation-thumb').getAttribute('src')) === src.secureStorageUri);
  await card.locator('.gallery-animate-btn').click();
  await card.locator('.asset-animate-panel').waitFor({ timeout: 20000 });
  const modelLine = (await card.locator('.asset-animate-model').textContent())?.trim();
  check('the interface offers Seedance 2.0 as the model — stated, not a menu of futures', modelLine?.includes('Seedance 2.0') === true, modelLine);
  await card.locator('.asset-edit-input').fill(INSTRUCTION);

  const animateRequest = page.waitForRequest((r) => r.url().includes('/animate') && r.method() === 'POST', { timeout: 30000 });
  const animateResponse = page.waitForResponse((r) => r.url().includes('/animate') && r.request().method() === 'POST', { timeout: 900000 });
  await card.locator('.asset-animate-run').click();
  const req = await animateRequest;
  const reqBody = JSON.parse(req.postData() ?? '{}');
  check('the request names the source by its exact id and Seedance by its fleet id', req.url().includes(`/api/vault/assets/${src.assetId}/animate`) && reqBody.modelId === REQUESTED_MODEL_ID, `${reqBody.modelId} @${req.url().split('/assets/')[1]}`);
  const res = await animateResponse;
  const out = await res.json();
  if (!check('animate-asset completed (route answered succeeded)', res.status() === 200 && out.status === 'succeeded', `${res.status()} ${out.reason ?? ''} @${out.stage ?? ''} ${out.message ?? ''}`)) {
    throw new Error('generation did not complete — nothing recorded, nothing searched, nothing cleaned');
  }

  // ── §8–9 · exact ids; provider execution ──────────────────────────────────
  check('operationId captured', typeof out.operationId === 'string' && out.operationId.length > 0, out.operationId);
  evidence.provider = { requestedModelId: reqBody.modelId, providerBindingId: out.provider?.providerId, actualProviderModelId: out.provider?.providerModelId, providerJobId: out.provider?.providerJobId, operationId: out.operationId, fps: out.provider?.fps, width: out.provider?.width, height: out.provider?.height };
  console.log('  ' + JSON.stringify(evidence.provider));
  check('provider job id captured', typeof out.provider?.providerJobId === 'string' && out.provider.providerJobId.length > 0);
  check('binding is the Magic Hour image-to-video binding', out.provider?.providerId === 'magic-hour-image-to-video');
  check('requested == executed == verified Seedance identifier', out.provider?.providerModelId === VERIFIED_PROVIDER_MODEL, `${reqBody.modelId} → ${out.provider?.providerModelId}`);

  const derivedId = out.asset?.assetId;
  check('a NEW derived asset id, different from the source', typeof derivedId === 'string' && derivedId !== src.assetId, derivedId);
  ledger.record({ resourceType: 'vault-asset', resourceId: derivedId, operationId: out.operationId, createdAt: out.asset.createdAt ?? Date.now() });

  // ── §24 · the UI shows the stored video only after the asset exists ───────
  await card.locator('.asset-animate-video').waitFor({ timeout: 30000 });
  const shownSrc = await card.locator('.asset-animate-video').getAttribute('src');
  check('the browser opens the resulting video from its stored URI', shownSrc === out.asset.secureStorageUri, shownSrc);
  const played = await card.locator('.asset-animate-video').evaluate(async (v) => { try { await v.play(); await new Promise((r) => setTimeout(r, 1500)); return { t: v.currentTime, d: v.duration, w: v.videoWidth, h: v.videoHeight }; } catch (e) { return { err: String(e) }; } });
  check('the browser can play it (time advances, dimensions decoded)', typeof played.t === 'number' && played.t > 0 && played.w > 0 && played.h > 0, JSON.stringify(played));
  await page.screenshot({ path: join(OUT, `${TEST_RUN_ID}-browser.png`) });

  // ── §10 · the output file ─────────────────────────────────────────────────
  console.log('\n== OUTPUT · our bytes, a real container ==');
  const outGot = await bytesOf(page, out.asset.secureStorageUri);
  const outBytes = Buffer.from(outGot.b64 ?? '', 'base64');
  check('output stored under our own path, not a provider URL', typeof out.asset.secureStorageUri === 'string' && out.asset.secureStorageUri.startsWith('/generated-assets/'), out.asset.secureStorageUri);
  check('output file exists, readable, non-zero, valid MP4/WebM signature, not HTML/JSON', outGot.status === 200 && outBytes.length > 50_000 && (isMp4(outBytes) || isWebm(outBytes)) && !outBytes.subarray(0, 32).toString('utf8').includes('<') && !outBytes.subarray(0, 8).toString('utf8').includes('{'), `${outGot.status} ${outBytes.length} bytes ${outGot.type}`);
  evidence.output = { derivedAssetId: derivedId, storageUri: out.asset.secureStorageUri, byteLength: outBytes.length, sha256: sha(outBytes), mime: outGot.type };
  const localVideo = join(OUT, `${TEST_RUN_ID}-animated.${isWebm(outBytes) ? 'webm' : 'mp4'}`);
  writeFileSync(localVideo, outBytes);
  console.log('  ' + JSON.stringify(evidence.output) + `\n  saved: ${localVideo}`);

  // ── §11–12 · real video, real motion — measured on the stored file ────────
  console.log('\n== MEDIA · ffprobe on the stored file; early vs late frame ==');
  const fileName = out.asset.secureStorageUri.split('/').pop();
  const probe = JSON.parse(ssh(`ffprobe -v error -print_format json -show_format -show_streams /var/www/azma-uploads/generated-assets/${fileName}`));
  const vstream = (probe.streams ?? []).find((s) => s.codec_type === 'video');
  const duration = Number(probe.format?.duration ?? 0);
  const frames = Number(vstream?.nb_frames ?? 0) || Math.round(duration * (Number((vstream?.avg_frame_rate ?? '0/1').split('/')[0]) / Number((vstream?.avg_frame_rate ?? '0/1').split('/')[1] || 1)));
  evidence.output.duration = duration; evidence.output.width = vstream?.width; evidence.output.height = vstream?.height; evidence.output.codec = vstream?.codec_name; evidence.output.frames = frames; evidence.output.container = probe.format?.format_name;
  check('valid container with a video stream', !!vstream && typeof probe.format?.format_name === 'string', `${probe.format?.format_name} ${vstream?.codec_name}`);
  check('non-zero duration and more than one frame', duration > 0.5 && frames > 1, `${duration}s ${frames} frames ${vstream?.width}x${vstream?.height}`);
  const early = 0.2, late = Math.max(0.4, duration - 0.2);
  const tmp = `/tmp/${TEST_RUN_ID}`;
  const media = ssh(`mkdir -p ${tmp} && cd ${tmp} && ffmpeg -v error -y -ss ${early} -i /var/www/azma-uploads/generated-assets/${fileName} -frames:v 1 early.png && ffmpeg -v error -y -ss ${late} -i /var/www/azma-uploads/generated-assets/${fileName} -frames:v 1 late.png && sha256sum early.png late.png && ffmpeg -v error -i early.png -i late.png -lavfi "ssim=stats_file=-" -f null - 2>/dev/null | tail -1`);
  const [h1, h2] = media.split('\n').filter((l) => /\.png$/.test(l)).map((l) => l.split(/\s+/)[0]);
  const ssimLine = media.split('\n').find((l) => /All:/.test(l)) ?? '';
  const ssimAll = Number((ssimLine.match(/All:([0-9.]+)/) ?? [])[1] ?? 1);
  evidence.temporal = { earlyFrameSha256: h1, lateFrameSha256: h2, ssimEarlyVsLate: ssimAll, earlyAt: early, lateAt: late };
  check('early and late frames differ (distinct hashes)', !!h1 && !!h2 && h1 !== h2, `${h1?.slice(0, 12)} vs ${h2?.slice(0, 12)}`);
  check('temporal change is material (SSIM early↔late < 0.98)', ssimAll < 0.98, `SSIM=${ssimAll}`);
  // Bring the two frames home for inspection.
  for (const f of ['early', 'late']) { const b64 = ssh(`base64 -w0 ${tmp}/${f}.png`); writeFileSync(join(OUT, `${TEST_RUN_ID}-${f}.png`), Buffer.from(b64, 'base64')); }
  ssh(`rm -rf ${tmp}`);

  // ── §13 · the source, untouched ───────────────────────────────────────────
  console.log('\n== IMMUTABILITY · the source after ==');
  const listAfter = (await api(page, '/api/vault/assets')).json.assets;
  const srcAfter = listAfter.find((a) => a.assetId === src.assetId);
  const srcGot2 = await bytesOf(page, src.secureStorageUri);
  const srcBytes2 = Buffer.from(srcGot2.b64 ?? '', 'base64');
  evidence.source.sha256After = sha(srcBytes2);
  check('source SHA256 identical before/after', evidence.source.sha256After === evidence.source.sha256Before, evidence.source.sha256After.slice(0, 16));
  check('source byte length, version, root, id unchanged; file present and viewable', srcGot2.status === 200 && srcBytes2.length === srcBytes.length && srcAfter?.version === src.version && srcAfter?.rootAssetId === src.rootAssetId && srcAfter?.assetId === src.assetId);

  // ── §14–17 · the derived asset, from the persisted record ─────────────────
  console.log('\n== LINEAGE · read from the Vault, not from memory ==');
  const derivedRows = listAfter.filter((a) => a.assetId === derivedId);
  check('exactly one derived asset row', derivedRows.length === 1);
  const d = derivedRows[0] ?? {};
  evidence.lineage = { source: src.assetId, derived: d.assetId, parentAssetId: d.parentAssetId, rootAssetId: d.rootAssetId, sourceRoot: src.rootAssetId, derivation: d.derivation, capabilityTarget: d.capabilityTarget, version: d.version, mutationProviderId: d.metadata?.mutationProviderId, mutationProviderModelId: d.metadata?.mutationProviderModelId, mutationProviderJobId: d.metadata?.mutationProviderJobId, mutationOperationId: d.metadata?.mutationOperationId };
  console.log('  ' + JSON.stringify(evidence.lineage));
  check('Y.parentAssetId = X', d.parentAssetId === src.assetId);
  check('Y.rootAssetId = X.rootAssetId', d.rootAssetId === src.rootAssetId);
  check('derivation = ANIMATED', d.derivation === 'ANIMATED');
  check('capability target = MOTION', d.capabilityTarget === 'MOTION');
  check('provenance: binding + exact Seedance model + job id, persisted', d.metadata?.mutationProviderId === 'magic-hour-image-to-video' && d.metadata?.mutationProviderModelId === VERIFIED_PROVIDER_MODEL && typeof d.metadata?.mutationProviderJobId === 'string');
  check('no generation metadata inherited from the source (providerId/generationPrompt/generationModel/generationOperationId absent)', d.metadata?.providerId === undefined && d.metadata?.generationPrompt === undefined && d.metadata?.generationModel === undefined && d.metadata?.generationOperationId === undefined, JSON.stringify(Object.keys(d.metadata ?? {})));
  check('the animation instruction is recorded on the derived asset', d.metadata?.mutationInstructionAr === INSTRUCTION);
  evidence.ownership = { sourceOwner: src.subscriberTenantId, derivedOwner: d.subscriberTenantId, proofOwner: me.creatorId };
  check('source.owner == derived.owner == authenticated proof owner', src.subscriberTenantId === me.creatorId && d.subscriberTenantId === me.creatorId);

  // ── §15 · the generation record describes the animation ───────────────────
  const gensAfter = (await api(page, '/api/qiyamah/generations')).json.generations ?? [];
  const rec = gensAfter.filter((g) => g.assetUrl === out.asset.secureStorageUri);
  check('exactly one generation record for the derived file (exact assetUrl)', rec.length === 1);
  if (rec.length === 1) {
    ledger.record({ resourceType: 'generation', resourceId: rec[0].recordId, operationId: out.operationId, createdAt: rec[0].generatedAt });
    check('generation record: mediaType video, style animate-asset, prompt = the instruction', rec[0].mediaType === 'video' && rec[0].style === 'animate-asset' && rec[0].prompt === INSTRUCTION);
    evidence.lineage.generationRecordId = rec[0].recordId;
  }

  // ── §18–19 · refusals that never reach the provider ───────────────────────
  console.log('\n== REFUSALS ==');
  const foreign = await api(page, `/api/vault/assets/not-owned-by-this-creator-0000/animate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ instruction: INSTRUCTION, modelId: REQUESTED_MODEL_ID, durationSeconds: 5 }) });
  check('an asset id this creator does not own is refused at the ownership stage, before any provider call', foreign.status === 404 && foreign.json?.stage === 'ownership', `${foreign.status} ${foreign.json?.reason} @${foreign.json?.stage}`);
  const anonCtx = await browser.newContext(); const anonPage = await anonCtx.newPage();
  await anonPage.goto(BASE + '/signup', { waitUntil: 'domcontentloaded' });
  const anon = await api(anonPage, `/api/vault/assets/${src.assetId}/animate`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ instruction: INSTRUCTION, modelId: REQUESTED_MODEL_ID }) });
  check('anonymous is refused with 401 before anything', anon.status === 401 && anon.json?.reason === 'unauthorized');
  await anonCtx.close();
  const listFinal = (await api(page, '/api/vault/assets')).json.assets;
  const gensFinal = (await api(page, '/api/qiyamah/generations')).json.generations ?? [];
  check('the refusals created no asset and no generation record', listFinal.length === listAfter.length && gensFinal.length === gensAfter.length, `${listAfter.length}→${listFinal.length} assets, ${gensAfter.length}→${gensFinal.length} records`);
  evidence.ownership.foreignRefusal = { status: foreign.status, reason: foreign.json?.reason, stage: foreign.json?.stage };
  evidence.ownership.anonymousRefusal = { status: anon.status, reason: anon.json?.reason };
} catch (e) {
  fail++;
  console.log('  ERROR  ' + (e && e.message ? e.message.split('\n')[0] : String(e)));
  try { await page.screenshot({ path: join(OUT, `${TEST_RUN_ID}-error.png`) }); } catch {}
} finally {
  // ── §20–21 · the ledger: what COULD be cleaned. The derived video is kept
  // as a real production example; nothing is deleted under this proof. ──────
  console.log('\n== CLEANUP LEDGER · planned, not executed — the derived video stays as a real example ==');
  if (ledger) {
    const entries = ledger.entries();
    const live = [
      ...(((await api(page, '/api/qiyamah/generations')).json?.generations) ?? []).map((g) => ({ resourceType: 'generation', resourceId: g.recordId, createdAt: g.generatedAt, ownerId: ledger.ownerId })),
      ...(((await api(page, '/api/vault/assets')).json?.assets) ?? []).map((a) => ({ resourceType: 'vault-asset', resourceId: a.assetId, createdAt: a.createdAt, ownerId: a.subscriberTenantId })),
    ];
    const plan = ledger.cleanupPlan(live);
    evidence.cleanup = { ledger: entries.map((e) => `${e.resourceType}:${e.resourceId}`), deletable: plan.deletable.map((e) => `${e.resourceType}:${e.resourceId}`), refused: plan.refused.map((r) => `${r.entry.resourceId} (${r.reason})`), deleted: [], sourceInLedger: entries.some((e) => e.resourceId === SOURCE_ASSET_ID), historicalInLedger: entries.some((e) => e.resourceId === 'asset_1787861688780_1q0lxzf') };
    console.log('  ' + JSON.stringify(evidence.cleanup));
    check('the source is not in the ledger and cannot be planned for deletion', !evidence.cleanup.sourceInLedger && !plan.deletable.some((e) => e.resourceId === SOURCE_ASSET_ID));
    check('no historical asset is in the ledger', !evidence.cleanup.historicalInLedger);
    console.log('  deletions executed: 0 (kept as a permanent real production example)');
  }
  writeFileSync(join(OUT, `${TEST_RUN_ID}-evidence.json`), JSON.stringify(evidence, null, 2));
  await browser.close();
  console.log(`\n${fail === 0 ? 'VERIFIED' : 'FAILED'}  ${pass} passed, ${fail} failed against ${BASE}`);
  process.exit(fail === 0 ? 0 : 1);
}
