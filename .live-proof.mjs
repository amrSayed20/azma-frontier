/** Live Production Proof — the Creator's own path, witnessed end to end. */
import { createHash } from 'crypto';
const BASE = 'https://azmaos.com';
const sha = (b) => createHash('sha256').update(b).digest('hex');

function cookieFrom(res) {
  const c = (res.headers.getSetCookie?.() ?? []).find((x) => x.startsWith('azma_session='));
  return c ? c.split(';')[0] : null;
}

// 1 — a real Creator signs in
const login = await fetch(`${BASE}/api/auth/login`, {
  method:'POST', headers:{'Content-Type':'application/json'},
  body: JSON.stringify({ email: process.env.AZMA_EMAIL, password: process.env.AZMA_PASSWORD }),
});
const session = cookieFrom(login);
console.log(`١) دخول المُنشئ                 http=${login.status}`);

// 2 — a real asset they already own
const listed = await (await fetch(`${BASE}/api/vault/assets`, { headers:{Cookie:session} })).json();
const before = listed.assets.length;
const image = listed.assets.find((a) => a.capabilityTarget === 'VISUAL' && a.secureStorageUri?.startsWith('/uploads/'));
if (!image) { console.log('لا صورة مملوكة'); process.exit(1); }
console.log(`٢) أصلٌ يملكه فعلاً             ${image.assetId}`);
console.log(`   نسخته=${image.version} جذره=${String(image.rootAssetId).slice(0,20)} أبوه=${image.parentAssetId ?? 'لا أب'}`);

// 3 — its real bytes, as the Creator's own browser would fetch them
const parentRes = await fetch(`${BASE}${image.secureStorageUri}`, { headers:{Cookie:session} });
const parentBytes = Buffer.from(await parentRes.arrayBuffer());
const parentDigest = sha(parentBytes);
console.log(`٣) بايتات الأب                  ${parentBytes.length} بايت · ${parentDigest.slice(0,24)}`);

// 4 — the edit, through the Creator's own route
const t0 = Date.now();
const edit = await fetch(`${BASE}/api/vault/assets/${image.assetId}/edit`, {
  method:'POST', headers:{'Content-Type':'application/json', Cookie:session},
  body: JSON.stringify({ instruction: 'ضع إطاراً ذهبياً رفيعاً حول حواف الصورة، وأبقِ كلّ ما عداه كما هو تماماً.' }),
});
const result = await edit.json();
const ms = Date.now() - t0;
console.log(`٤) التعديل عبر مسار المُنشئ      http=${edit.status} · ${(ms/1000).toFixed(1)}ث`);
if (result.status !== 'succeeded') { console.log(`   ${JSON.stringify(result).slice(0,220)}`); process.exit(1); }

// 5 — the produced bytes
const outRes = await fetch(`${BASE}${result.asset.secureStorageUri}`, { headers:{Cookie:session} });
const outBytes = Buffer.from(await outRes.arrayBuffer());
const outDigest = sha(outBytes);
console.log(`٥) بايتات الناتج                ${outBytes.length} بايت · ${outDigest.slice(0,24)}`);
console.log(`   مختلفٌ عن الأب: ${parentDigest !== outDigest ? 'نعم ✓' : 'لا ✗'}`);

// 6 — the lineage the Empire recorded
const a = result.asset;
console.log(`٦) الأصل المشتقّ                ${a.assetId}`);
console.log(`   أبوه=${a.parentAssetId === image.assetId ? 'الأصل ✓' : 'خطأ ✗'} · جذره=${a.rootAssetId === image.rootAssetId ? 'موروث ✓' : 'خطأ ✗'} · نسخته=${a.version}`);
console.log(`   حجرته=${a.creationChamber} · مالكه=${a.subscriberTenantId === image.subscriberTenantId ? 'نفس المالك ✓' : 'خطأ ✗'}`);

// 7 — the Creator can select it
const after = await (await fetch(`${BASE}/api/vault/assets`, { headers:{Cookie:session} })).json();
const present = after.assets.some((x) => x.assetId === a.assetId);
const parentAlive = after.assets.some((x) => x.assetId === image.assetId);
console.log(`٧) في خزائنه                    ${present ? 'ظاهرٌ وقابلٌ للاختيار ✓' : 'غائب ✗'}`);
console.log(`   الأب باقٍ: ${parentAlive ? 'نعم ✓' : 'لا ✗'} · العدد ${before} → ${after.assets.length}`);

// 8 — sovereignty: nobody else reaches it
const anon = await fetch(`${BASE}${a.secureStorageUri}`);
console.log(`٨) غريبٌ يطلب الناتج            http=${anon.status} ${anon.status === 404 ? '✓ ممنوع' : '✗ مكشوف'}`);
