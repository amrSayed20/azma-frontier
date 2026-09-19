/** Live Production Proof — the Creator's own path, witnessed end to end. */
import { createHash } from 'crypto';
const BASE = 'https://azmaos.com';
const sha = (b) => createHash('sha256').update(b).digest('hex');
const cookieOf = (r) => (r.headers.getSetCookie?.() ?? []).find(c => c.startsWith('azma_session='))?.split(';')[0] ?? null;

async function json(label, res) {
  const raw = await res.text();
  try { return JSON.parse(raw); }
  catch {
    console.log(`   ✗ ${label}: http=${res.status} · ${res.headers.get('content-type')}`);
    console.log(`     ${raw.replace(/\s+/g, ' ').slice(0, 200)}`);
    return null;
  }
}

const login = await fetch(`${BASE}/api/auth/login`, {
  method:'POST', headers:{'Content-Type':'application/json'},
  body: JSON.stringify({ email: process.env.AZMA_EMAIL, password: process.env.AZMA_PASSWORD }) });
const session = cookieOf(login);
console.log(`١) دخول المُنشئ            http=${login.status}`);

const before = await json('list', await fetch(`${BASE}/api/vault/assets`, { headers:{Cookie:session} }));
const image = before.assets.find(a => a.capabilityTarget === 'VISUAL' && a.secureStorageUri?.startsWith('/uploads/'));
console.log(`٢) أصلٌ يملكه              ${image.assetId} · نسخة ${image.version}`);

const pb = Buffer.from(await (await fetch(`${BASE}${image.secureStorageUri}`, { headers:{Cookie:session} })).arrayBuffer());
const pd = sha(pb);
console.log(`٣) بايتات الأب             ${pb.length} بايت · ${pd.slice(0,24)}`);

const INSTR = 'ضع إطاراً ذهبياً رفيعاً حول حواف الصورة، وأبقِ كلّ ما عداه كما هو تماماً.';
async function tryEdit() {
  const t = Date.now();
  const res = await fetch(`${BASE}/api/vault/assets/${image.assetId}/edit`, {
    method:'POST', headers:{'Content-Type':'application/json', Cookie:session},
    body: JSON.stringify({ instruction: INSTR }) });
  return { res, body: await json('edit', res), secs: ((Date.now()-t)/1000).toFixed(1) };
}

let { res, body, secs } = await tryEdit();
if (body?.reason === 'requires-adoption') {
  const ad = await json('adopt', await fetch(`${BASE}/api/vault/assets/${image.assetId}/adopt`, { method:'POST', headers:{Cookie:session} }));
  console.log(`   اعتماد المالك (م ٥.٥): ${ad?.message ?? '—'}`);
  ({ res, body, secs } = await tryEdit());
}
console.log(`٤) التعديل عبر مسار المُنشئ http=${res.status} · ${secs}ث`);
if (!body) process.exit(1);
if (body.status !== 'succeeded') { console.log(`   ${JSON.stringify(body).slice(0,200)}`); process.exit(1); }

const ob = Buffer.from(await (await fetch(`${BASE}${body.asset.secureStorageUri}`, { headers:{Cookie:session} })).arrayBuffer());
const od = sha(ob);
const a = body.asset;
console.log(`٥) بايتات الناتج           ${ob.length} بايت · ${od.slice(0,24)}`);
console.log(`   مختلفٌ عن الأب: ${pd !== od ? 'نعم ✓' : 'لا ✗'}`);
console.log(`٦) الأصل المشتقّ           ${a.assetId}`);
console.log(`   أب=${a.parentAssetId === image.assetId ? '✓' : '✗'} جذر=${a.rootAssetId === image.rootAssetId ? '✓' : '✗'} نسخة=${a.version} حجرة=${a.creationChamber} مالك=${a.subscriberTenantId === image.subscriberTenantId ? '✓' : '✗'}`);

const after = await json('list2', await fetch(`${BASE}/api/vault/assets`, { headers:{Cookie:session} }));
console.log(`٧) في خزائنه               ${after.assets.some(x=>x.assetId===a.assetId) ? 'ظاهرٌ وقابلٌ للاختيار ✓' : '✗'} · الأب باقٍ ${after.assets.some(x=>x.assetId===image.assetId) ? '✓' : '✗'} · ${before.assets.length} → ${after.assets.length}`);

const anon = await fetch(`${BASE}${a.secureStorageUri}`);
console.log(`٨) غريبٌ يطلب الناتج       http=${anon.status} ${anon.status===404 ? '✓ ممنوع' : '✗ مكشوف'}`);
