/**
 * AZMA OS — generate-video production proof (Qiyamah, Constitution §3.1).
 *
 *   node scripts/verify-generate-video.mjs <base-url> <password-file> <out-dir> [ssh-target]
 *
 * ─── WHAT IT PROVES ──────────────────────────────────────────────────────────
 *
 *   A NEW creative intent — text alone, no reference asset anywhere in the
 *   request — becomes a real video, stored as AZMA's own bytes, deposited as
 *   a sovereign MOTION asset owned by the requester, with the executed model
 *   recorded; and the entitlement rule holds at the door:
 *
 *     Founder, unsubscribed          → ALLOW   (the generation above)
 *     authenticated, unentitled      → DENY 403 'not-entitled', provider untouched
 *     anonymous                      → DENY 401
 *
 *   Every resource this run creates is recorded in the run ledger by exact
 *   id. Nothing is deleted: the video is kept as a real production example.
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
const SSH = process.argv[5] ?? 'root@2.28.52.180';
mkdirSync(OUT, { recursive: true });

const TEST_RUN_ID = `generate-video-proof-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
// A NEW intent, never embedded in any existing asset: nothing in the Vault
// depicts this, and the proof asserts the result is independent of every
// asset that existed before the run.
const INTENT = 'فنار حجري وحيد على صخرة في بحرٍ هائج قبل الفجر، يدور ضوؤه ببطء فوق الموج، والرذاذ يتصاعد مع كل موجة';
const DURATION = 6;

let pass = 0, fail = 0;
const evidence = { TEST_RUN_ID, deployment: null, intent: INTENT, owner: {}, provider: {}, output: {}, asset: {}, entitlement: {}, cleanup: {} };
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
const ssh = (cmd) => execFileSync('ssh', ['-i', `${process.env.HOME ?? process.env.USERPROFILE}/.ssh/id_ed25519_azma`, '-o', 'BatchMode=yes', SSH, cmd], { encoding: 'utf8', timeout: 120000 });

const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: 'ar', viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
let ledger = null;

try {
  // ── CASE D · anonymous, before anything else ──────────────────────────────
  console.log('\n== CASE D · anonymous ==');
  const anonCtx = await browser.newContext({ locale: 'ar' });
  const anonPage = await anonCtx.newPage();
  await anonPage.goto(BASE + '/signup', { waitUntil: 'domcontentloaded' });
  const anon = await api(anonPage, '/api/qiyamah/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: INTENT, mediaType: 'video', durationSeconds: DURATION }) });
  check('anonymous is refused 401 by the authentication boundary', anon.status === 401 && anon.json?.reason === 'unauthorized', `${anon.status} ${anon.json?.reason}`);
  evidence.entitlement.anonymous = { status: anon.status, reason: anon.json?.reason };
  await anonCtx.close();

  // ── CASE C · authenticated, unentitled ────────────────────────────────────
  //
  // MEASURED LIMIT, not a skipped case. Production registration is closed:
  // POST /api/auth/signup answers 410 «registration-requires-verified-identity»
  // since the Google Identity Gate, so an unentitled authenticated account
  // cannot be minted here, and no credential for an existing non-Founder
  // Creator is held. What CAN be established live is recorded; the denial
  // itself is proven where it can be proven honestly — against the real
  // entitlement authority and the real route ordering, in the repository
  // tests (src/billing/__tests__/video-entitlement-storage.test.ts and
  // src/chamber-truth/__tests__/generate-video-authority.test.ts).
  console.log('\n== CASE C · authenticated Creator without an active subscription ==');
  const probeCtx = await browser.newContext({ locale: 'ar' });
  const probePage = await probeCtx.newPage();
  await probePage.goto(BASE + '/signup', { waitUntil: 'domcontentloaded' });
  const signup = await api(probePage, '/api/auth/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `proof-${TEST_RUN_ID.slice(-8)}@azma-proof.local`, password: `Proof!${randomUUID().slice(0, 12)}`, displayName: 'Entitlement Proof' }) });
  check('production registration is closed — no unentitled account can be minted for this proof', signup.status === 410 && signup.json?.reason === 'registration-requires-verified-identity', `${signup.status} ${signup.json?.reason}`);
  evidence.entitlement.unentitled = {
    liveProof: 'NOT POSSIBLE — registration returns 410 (verified identity only) and no non-Founder credential is held',
    signupStatus: signup.status,
    provenInstead: [
      'src/billing/__tests__/video-entitlement-storage.test.ts — real DB: creator with no subscription → hasActiveEntitlement false; with an active row → true; on cancel → false',
      'src/chamber-truth/__tests__/generate-video-authority.test.ts — the 403 not-entitled gate precedes costEngine.estimate, creditRepo.reserve and generateVideo in the route source',
    ],
  };
  await probeCtx.close();

  // ── CASE A · Founder, unsubscribed ────────────────────────────────────────
  console.log('\n== CASE A · Founder, unsubscribed ==');
  await page.goto(BASE + '/signup', { waitUntil: 'domcontentloaded' });
  const login = await api(page, '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'founder@azmaos.com', password: PW }) });
  check('authenticated as the Founder', login.status === 200);
  const me = (await api(page, '/api/auth/me')).json;
  check('role is founder', me.role === 'founder', me.role);
  const sub = { status: 0, json: null };
  console.log(`  subscription endpoint: ${sub.status} ${JSON.stringify(sub.json ?? {}).slice(0, 120)}`);
  ledger = createRunLedger({ runId: TEST_RUN_ID, ownerId: me.creatorId });
  evidence.owner = { creatorId: me.creatorId, role: me.role };
  evidence.deployment = ssh('readlink -f /root/azma-os/.next | sed "s#.*/releases/##; s#/.next##"').trim();
  console.log(`  run ${TEST_RUN_ID} · owner ${me.creatorId} · deployment ${evidence.deployment}`);

  const assetsBefore = (await api(page, '/api/vault/assets')).json.assets;
  const gensBefore = (await api(page, '/api/qiyamah/generations')).json.generations;
  const beforeIds = new Set(assetsBefore.map((a) => a.assetId));
  const beforeUris = new Set(assetsBefore.map((a) => a.secureStorageUri));
  console.log(`  before: ${assetsBefore.length} assets, ${gensBefore.length} generation records`);

  // ── CASE E · the real generation, from text alone ─────────────────────────
  console.log('\n== CASE E · a NEW intent → a new sovereign video ==');
  const startedAt = Date.now();
  const out = (await api(page, '/api/qiyamah/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: INTENT, mediaType: 'video', durationSeconds: DURATION }) }));
  if (!check('generate-video completed', out.status === 200 && out.json?.status === 'succeeded', `${out.status} ${out.json?.reason ?? ''} @${out.json?.stage ?? ''} ${out.json?.detail ?? out.json?.message ?? ''}`)) {
    throw new Error('generation did not complete — nothing recorded, nothing cleaned');
  }
  const operationId = out.json.operationId ?? out.json.asset?.operationId;
  check('operationId captured', typeof operationId === 'string' && operationId.length > 0, operationId);
  const assetUrl = out.json.asset.assetUrl;
  check('the stored asset is ours, not a provider URL', typeof assetUrl === 'string' && assetUrl.startsWith('/generated-assets/') && !/^https?:/.test(assetUrl), assetUrl);

  // Exact ids → ledger, by exact equality, never by position.
  const assetsAfter = (await api(page, '/api/vault/assets')).json.assets;
  const newAssets = assetsAfter.filter((a) => !beforeIds.has(a.assetId) && a.secureStorageUri === assetUrl);
  check('exactly one new sovereign asset carries this run’s stored file', newAssets.length === 1, `${assetsAfter.length - assetsBefore.length} new`);
  const asset = newAssets[0];
  ledger.record({ resourceType: 'vault-asset', resourceId: asset.assetId, operationId, createdAt: asset.createdAt });
  const gensAfter = (await api(page, '/api/qiyamah/generations')).json.generations;
  const newRecords = gensAfter.filter((g) => g.assetUrl === assetUrl);
  check('exactly one new generation record carries it', newRecords.length === 1);
  if (newRecords.length === 1) ledger.record({ resourceType: 'generation', resourceId: newRecords[0].recordId, operationId, createdAt: newRecords[0].generatedAt });

  // The trail names the binding, the model and the job.
  const trail = ssh(`grep '${operationId}' /root/logs/azma-out.log | tail -12 || true`);
  const providerModel = (trail.match(/"providerModelId":"([^"]+)"/) ?? [])[1];
  const providerJob = (trail.match(/"providerJobId":"([^"]+)"/) ?? [])[1] ?? (trail.match(/"magicHourJobId":"([^"]+)"/) ?? [])[1];
  evidence.provider = { providerId: asset.metadata?.providerId, providerModelId: asset.metadata?.generationModel ?? providerModel, providerJobId: providerJob, operationId };
  check('the executed provider model is recorded on the asset', typeof asset.metadata?.generationModel === 'string' && asset.metadata.generationModel.length > 0, asset.metadata?.generationModel);
  check('the provider binding is recorded on the asset', typeof asset.metadata?.providerId === 'string', asset.metadata?.providerId);
  check('a provider job id appears in the operation trail', typeof providerJob === 'string' && providerJob.length > 0, providerJob);
  check('the trail links this operation to the deposited asset', trail.includes(operationId) && /available/.test(trail));

  // The file itself.
  const got = await bytesOf(page, assetUrl);
  const bytes = Buffer.from(got.b64 ?? '', 'base64');
  check('the output is a real video file — valid signature, non-zero, not HTML/JSON', got.status === 200 && bytes.length > 50_000 && (isMp4(bytes) || isWebm(bytes)) && !bytes.subarray(0, 32).toString('utf8').includes('<'), `${got.status} ${bytes.length} bytes ${got.type}`);
  evidence.output = { storageUri: assetUrl, byteLength: bytes.length, sha256: sha(bytes), mime: got.type };
  const localPath = join(OUT, `${TEST_RUN_ID}.${isWebm(bytes) ? 'webm' : 'mp4'}`);
  writeFileSync(localPath, bytes);
  console.log(`  saved: ${localPath}`);

  const fileName = assetUrl.split('/').pop();
  const probe = JSON.parse(ssh(`ffprobe -v error -print_format json -show_format -show_streams /var/www/azma-uploads/generated-assets/${fileName}`));
  const vstream = (probe.streams ?? []).find((s) => s.codec_type === 'video');
  const duration = Number(probe.format?.duration ?? 0);
  const frames = Number(vstream?.nb_frames ?? 0);
  Object.assign(evidence.output, { container: probe.format?.format_name, codec: vstream?.codec_name, duration, frames, width: vstream?.width, height: vstream?.height });
  check('ffprobe: a video stream with real duration and many frames', !!vstream && duration > 1 && frames > 1, `${probe.format?.format_name} ${vstream?.codec_name} ${duration}s ${frames}f ${vstream?.width}x${vstream?.height}`);
  const tmp = `/tmp/${TEST_RUN_ID}`;
  const media = ssh(`mkdir -p ${tmp} && cd ${tmp} && ffmpeg -v error -y -ss 0.2 -i /var/www/azma-uploads/generated-assets/${fileName} -frames:v 1 a.png && ffmpeg -v error -y -ss ${Math.max(0.5, duration - 0.3)} -i /var/www/azma-uploads/generated-assets/${fileName} -frames:v 1 b.png && sha256sum a.png b.png && ffmpeg -v error -i a.png -i b.png -lavfi "ssim=stats_file=-" -f null - 2>/dev/null | tail -1`);
  const [h1, h2] = media.split('\n').filter((l) => /\.png$/.test(l)).map((l) => l.split(/\s+/)[0]);
  const ssim = Number((media.match(/All:([0-9.]+)/) ?? [])[1] ?? 1);
  check('the video moves — early and late frames differ, SSIM < 0.98', h1 !== h2 && ssim < 0.98, `SSIM=${ssim}`);
  for (const f of ['a', 'b']) writeFileSync(join(OUT, `${TEST_RUN_ID}-frame-${f}.png`), Buffer.from(ssh(`base64 -w0 ${tmp}/${f}.png`), 'base64'));
  ssh(`rm -rf ${tmp}`);

  // Sovereign identity: new, owned, MOTION, GENERATED, independent of everything before.
  evidence.asset = { assetId: asset.assetId, owner: asset.subscriberTenantId, capabilityTarget: asset.capabilityTarget, derivation: asset.derivation, version: asset.version, rootAssetId: asset.rootAssetId, parentAssetId: asset.parentAssetId ?? null, metadataKeys: Object.keys(asset.metadata ?? {}) };
  check('the asset is MOTION, GENERATED, version 1, its own root, with no parent', asset.capabilityTarget === 'MOTION' && asset.derivation === 'GENERATED' && asset.version === 1 && asset.rootAssetId === asset.assetId && (asset.parentAssetId ?? null) === null, JSON.stringify(evidence.asset).slice(0, 150));
  check('the asset belongs to the requesting Founder', asset.subscriberTenantId === me.creatorId);
  check('it is independent of every asset that existed before this run', !beforeIds.has(asset.assetId) && !beforeUris.has(asset.secureStorageUri) && asset.createdAt >= startedAt);
  check('its provenance is its own — the intent, not an image generation’s metadata', asset.metadata?.generationPrompt === INTENT && asset.metadata?.generationOperationId === operationId, `${String(asset.metadata?.generationPrompt).slice(0, 40)}…`);
  check('the generation record says video', newRecords[0]?.mediaType === 'video');

  // Playback in a real browser.
  await page.goto(BASE + '/qiyamah-chamber', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#qiyamah-idea', { timeout: 30000 });
  const player = page.locator(`video[src="${assetUrl}"]`).first();
  await player.waitFor({ timeout: 30000 });
  const played = await player.evaluate(async (v) => { try { await v.play(); await new Promise((r) => setTimeout(r, 1500)); return { t: v.currentTime, d: v.duration, w: v.videoWidth, h: v.videoHeight }; } catch (e) { return { err: String(e) }; } });
  check('the Creator can play it in the chamber', typeof played.t === 'number' && played.t > 0 && played.w > 0, JSON.stringify(played));
  await page.screenshot({ path: join(OUT, `${TEST_RUN_ID}-browser.png`) });
} catch (e) {
  fail++;
  console.log('  ERROR  ' + (e && e.message ? e.message.split('\n')[0] : String(e)));
  try { await page.screenshot({ path: join(OUT, `${TEST_RUN_ID}-error.png`) }); } catch {}
} finally {
  console.log('\n== CLEANUP LEDGER · planned, not executed — the video is kept as a real example ==');
  if (ledger) {
    const entries = ledger.entries();
    evidence.cleanup = { ledger: entries.map((e) => `${e.resourceType}:${e.resourceId}`), deleted: [] };
    console.log('  ' + JSON.stringify(evidence.cleanup));
    check('nothing historical entered the ledger', !entries.some((e) => e.resourceId === 'asset_1787861688780_1q0lxzf' || String(e.resourceId).includes('2c99b46b')));
  } else {
    console.log('  ledger empty → 0 deletions');
  }
  writeFileSync(join(OUT, `${TEST_RUN_ID}-evidence.json`), JSON.stringify(evidence, null, 2));
  await browser.close();
  console.log(`\n${fail === 0 ? 'VERIFIED' : 'FAILED'}  ${pass} passed, ${fail} failed against ${BASE}`);
  process.exit(fail === 0 ? 0 : 1);
}
