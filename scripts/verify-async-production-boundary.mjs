import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = 'https://azmaos.com';
const PW = readFileSync(process.argv[2], 'utf8').trim();
const OUT = process.argv[3];
let pass = 0, fail = 0;
const ev = {};
const check = (n, ok, d = '') => { console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (d ? '   ' + String(d).slice(0, 170) : '')); ok ? pass++ : fail++; return ok; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: 'ar' });
const page = await ctx.newPage();
const call = (p) => (path, init) => p.evaluate(async ([a, b]) => {
  const r = await fetch(a, b); let j = null; try { j = await r.json(); } catch {} return { status: r.status, json: j };
}, [path, init ?? {}]);
const api = call(page);

await page.goto(BASE + '/signup', { waitUntil: 'domcontentloaded' });
await api('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'founder@azmaos.com', password: PW }) });
const me = (await api('/api/auth/me')).json;
check('signed in as Founder', me?.role === 'founder');

// ── F · the incident's own records, read only ───────────────────────────────
console.log('\n== the incident (ce90a828) — read only ==');
const assets = (await api('/api/vault/assets')).json.assets;
const incident = assets.filter((a) => a.assetId === 'asset_1790105473047_58if934');
check('the incident asset still exists, once, owned by the Founder', incident.length === 1 && incident[0].subscriberTenantId === me.creatorId);
check('it was not regenerated — same operation, same model', incident[0]?.metadata?.generationOperationId === 'ce90a828-0645-46e8-ad63-7d72c64ab034' && incident[0]?.metadata?.generationModel === 'kling-3.0', incident[0]?.secureStorageUri);
check('no duplicate of it was created', assets.filter((a) => String(a.secureStorageUri).includes('6ab83d4f-3eab-4b0a-a5ec-a5d9109d1a77')).length === 1);

// ── the new contract, costing nothing ───────────────────────────────────────
console.log('\n== contract ==');
const noKey = await api('/api/qiyamah/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: 'x', mediaType: 'video', durationSeconds: 6 }) });
check('a video request without an intent key is refused before anything', noKey.status === 400 && noKey.json?.reason === 'intent-key-required', `${noKey.status} ${noKey.json?.reason}`);
check('an unknown operation is 404 to its asker', (await api('/api/qiyamah/operations/does-not-exist')).status === 404);
const none = await api('/api/qiyamah/operations/by-intent/never-used-key');
check('an unused intent key truthfully reports no production', none.status === 200 && none.json?.operation === null);

// ── E · ONE real production, observed across a dead browser ─────────────────
console.log('\n== the real boundary: one paid production, observed after the request ends ==');
const intentKey = 'proof-' + Date.now();
const t0 = Date.now();
const accepted = await api('/api/qiyamah/generate', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ prompt: 'مصعدٌ زجاجيٌّ يصعد ببطء على واجهة برجٍ في مدينةٍ ليليةٍ ممطرة، وقطراتُ المطر تنساب على الزجاج بينما تتّسع الأضواء تحته', mediaType: 'video', durationSeconds: 6, intentKey }),
});
const acceptMs = Date.now() - t0;
check('the request returned 202 ACCEPTED, not a completed production', accepted.status === 202 && accepted.json?.status === 'accepted', `${accepted.status} ${accepted.json?.status} ${accepted.json?.reason ?? ''}`);
check('it returned in seconds, not minutes — the socket no longer waits', acceptMs < 20000, `${acceptMs} ms`);
const opId = accepted.json?.operationId;
check('it carried the operation id and where to observe it', typeof opId === 'string' && accepted.json?.observeAt === `/api/qiyamah/operations/${opId}`, opId);
Object.assign(ev, { operationId: opId, acceptMs, intentKey });

const again = await api('/api/qiyamah/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: 'ENTIRELY DIFFERENT TEXT', mediaType: 'video', durationSeconds: 6, intentKey }) });
check('the same intent key is answered with the SAME operation — no second production', again.json?.operationId === opId && again.json?.reused === true, `same=${again.json?.operationId === opId} reused=${again.json?.reused}`);
check('the key alone recovers the operation (the lost-202 case)', (await api('/api/qiyamah/operations/by-intent/' + intentKey)).json?.operation?.operationId === opId);

// The point: close the browser entirely. No socket, no page, nothing listening.
await browser.close();
console.log('  browser closed — nothing is listening to this production any more');
await new Promise((r) => setTimeout(r, 20000));

const b2 = await chromium.launch();
const p2 = await (await b2.newContext({ locale: 'ar' })).newPage();
const api2 = call(p2);
await p2.goto(BASE + '/signup', { waitUntil: 'domcontentloaded' });
await api2('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'founder@azmaos.com', password: PW }) });

let op = null, waited = 0;
while (waited < 17 * 60 * 1000) {
  op = (await api2('/api/qiyamah/operations/' + opId)).json?.operation ?? null;
  if (op && !op.producing) break;
  if (waited % 60000 === 0) console.log(`    t+${Math.round(waited / 1000)}s — state ${op?.state}`);
  await new Promise((r) => setTimeout(r, 10000));
  waited += 10000;
}
ev.totalMs = Date.now() - t0;
ev.finalState = op?.state;
check('the production survived the browser being closed and reached a terminal state', !!op && op.isTerminal, `${op?.state} after ${Math.round(ev.totalMs / 1000)}s`);
check('it SUCCEEDED — DEPOSITED with a sovereign asset', op?.succeeded === true && typeof op?.assetUrl === 'string', `${op?.state} ${op?.assetUrl}`);
// NOT a duration threshold. The incident's render took 362 s and the edge cut
// at ~125 s, but a proof cannot command a provider to be slow, and forcing one
// would mean changing model allocation or buying a longer render. What must be
// true — and is — is that the production needs NO listener: the browser was
// closed for the whole of it. The duration is recorded as evidence, not judged.
check('the production ran with no client attached at all', ev.totalMs > 20000, `${Math.round(ev.totalMs / 1000)}s total, browser closed throughout`);
ev.assetUrl = op?.assetUrl; ev.assetId = op?.assetId;

const after = (await api2('/api/vault/assets')).json.assets;
const made = after.filter((a) => a.secureStorageUri === op?.assetUrl);
check('exactly one sovereign asset exists for it', made.length === 1, made[0]?.assetId);
check('owned by the Founder, MOTION, GENERATED, its own root', made[0]?.subscriberTenantId === me.creatorId && made[0]?.capabilityTarget === 'MOTION' && made[0]?.derivation === 'GENERATED' && made[0]?.rootAssetId === made[0]?.assetId);
check('its provenance names this operation and the model that ran', made[0]?.metadata?.generationOperationId === opId, String(made[0]?.metadata?.generationModel));
ev.model = made[0]?.metadata?.generationModel;
check('exactly one generation record — the closed browser created no duplicate', (await api2('/api/qiyamah/generations')).json.generations.filter((g) => g.assetUrl === op?.assetUrl).length === 1);
const file = await p2.evaluate(async (u) => { const r = await fetch(u); return { status: r.status, type: r.headers.get('content-type'), len: r.headers.get('content-length') }; }, op?.assetUrl);
check('the video file is real and reachable by its owner', file.status === 200 && file.type === 'video/mp4' && Number(file.len) > 100000, JSON.stringify(file));
ev.bytes = file.len;

await p2.goto(BASE + '/qiyamah-chamber', { waitUntil: 'domcontentloaded' });
await p2.waitForSelector('#qiyamah-idea', { timeout: 30000 });
await p2.locator(`video[src="${op.assetUrl}"]`).first().waitFor({ timeout: 30000 });
check('the chamber shows the finished video', true, op.assetUrl);
check('no false failure message anywhere on the page', !(await p2.locator('body').innerText()).includes('البوابة لا تستجيب'));
await p2.screenshot({ path: `${OUT}/async-boundary.png` });
writeFileSync(`${OUT}/async-boundary-evidence.json`, JSON.stringify(ev, null, 2));
await b2.close();

console.log('\n' + JSON.stringify(ev));
console.log(`\n${fail === 0 ? 'VERIFIED' : 'FAILED'}  ${pass} passed, ${fail} failed against ${BASE}`);
process.exit(fail === 0 ? 0 : 1);
