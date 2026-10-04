/**
 * AZMA OS — THE SINGLE LIVE ACCEPTANCE TEST FOR TELEGRAM-BY-THE-CREATOR
 *
 * AUTHORIZED TO EXECUTE, 2026-10-04. Run exactly once.
 *
 * ─── IT PROVES TWO THINGS, AND THE SECOND IS THE POINT ──────────────────────
 *
 *   A. the chain:  real Creator → real personal Telegram authorization →
 *      real identity → real eligible destination → real sovereign asset →
 *      real MTProto publication → real message id → persisted AZMA receipt
 *      that survives a reload.
 *
 *   B. the custody claim: that the session NEVER crossed to the AZMA server.
 *      Every request this page sends to AZMA — url, headers, body — is kept
 *      and searched two ways: for the EXACT session values this browser
 *      holds, and for the NAMES such material travels under. The first is the
 *      stronger test, because it finds the secret whatever it is called; the
 *      second catches a credential derived differently from the one stored.
 *
 * ─── WHAT IT MUST NOT CONFUSE ───────────────────────────────────────────────
 *
 *   A peer id, a channel title, a message id and an account label are
 *   ordinary routing and metadata. They are MEANT to cross. Only session and
 *   auth-key material is custody, and the name search below is scoped to that
 *   — a search that flagged the word «session» in a cookie name would produce
 *   a false breach, which is worse than no test at all.
 *
 * ─── WHAT IT CANNOT PROVE, SAID HERE SO NOBODY CLAIMS IT LATER ──────────────
 *
 *   That AZMA *could not* read the session. It can: this code is served from
 *   AZMA's origin, which is exactly the limit accepted in writing as PARTIAL
 *   ZERO-CUSTODY. What this proves is that it DOES NOT.
 */
import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'https://azmaos.com';
const SESSION_PREFIX = 'azma.telegram.user';
const OUT = 'scripts/proof-harness';
const QR_PATH = `${OUT}/tg-qr-live.png`;
mkdirSync(OUT, { recursive: true });

/** Names MTProto credential material travels under. Scoped deliberately. */
const CUSTODY_NAMES = [
  'authkey', 'auth_key', 'stringsession', 'storesession',
  'telegram.user', 'azma.telegram', 'dclist', 'dc_auth',
];

// ── THE WINDOW MUST BE VISIBLE, AND THAT IS NOT A DETAIL ─────────────────
//   MEASURED 2026-10-04/05: the QR was relayed as an image (it did not
//   render), as text (it wrapped on a phone), and as a tg:// link (Chrome
//   refuses the scheme from the address bar and the web client will not
//   linkify it). Every one of those tried to carry the code TO the phone —
//   and a phone cannot scan a code displayed on itself.
//
//   Telegram's own flow needs two devices: the code on a screen, the camera
//   in a hand. So the browser shows itself on the desktop, and the Creator
//   scans it exactly as they would scan Telegram Desktop.
const browser = await chromium.launch({ headless: false });
const setup = await browser.newContext();
const login = await setup.request.post(`${BASE}/api/auth/login`, {
  data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
  timeout: 30000,
});
console.log('جلسة المؤسّس:', login.status());
const STATE = await setup.storageState();
await setup.close();

const ctx = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1366, height: 1100 }, storageState: STATE });
const page = await ctx.newPage();

// ── EVERY BYTE THIS PAGE SENDS TO AZMA, KEPT FOR THE CUSTODY CHECK ────────
const sentToAzma = [];
page.on('request', (r) => {
  const url = r.url();
  if (!url.startsWith(BASE)) return;          // Telegram's own DCs are not AZMA
  let body = '';
  try { body = r.postData() ?? ''; } catch { /* no body */ }
  sentToAzma.push({ url, headers: JSON.stringify(r.headers()), body });
});
// ── AND EVERY ANSWER AZMA GIVES BACK ──────────────────────────────────────
const azmaResponses = [];
page.on('response', async (r) => {
  if (!r.url().startsWith(BASE)) return;
  let text = '';
  try { text = (await r.text()).slice(0, 200000); } catch { /* binary/stream */ }
  azmaResponses.push({ url: r.url(), status: r.status(), text });
});

await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(9000);
const veil = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil.count()) { await veil.click({ force: true }).catch(() => {}); await page.waitForTimeout(2500); }

// ── 1 · the surface a hand can reach ─────────────────────────────────────
const connect = page.locator('[data-testid="makman-telegram-user-connect"]');
console.log('١ · زرّ ربط الحساب :', await connect.count() > 0 ? 'ظاهر' : '✕ غائب');
if (await connect.count() === 0) {
  console.log('FAILURE_STAGE=1-authentication (الزرّ غائب)');
  await page.screenshot({ path: `${OUT}/makman-telegram-user.png` });
  await browser.close(); process.exit(1);
}
await connect.click();

// ── 2 · relay the QR out of this machine, continuously ───────────────────
//   The Creator may be at another device entirely. Telegram's token expires
//   in well under a minute and GramJS reissues it, so the image is written
//   again every time it changes rather than captured once.
let shots = 0;
let lastUrl = '';
const relay = setInterval(async () => {
  try {
    const img = page.locator('.makman-tg-qr img').first();
    if (await img.count()) {
      await img.screenshot({ path: QR_PATH });
      shots += 1;
      writeFileSync(`${OUT}/tg-qr-live.txt`, String(shots));
      // ── AND THE SAME TOKEN AS TEXT ───────────────────────────────────
      //   MEASURED 2026-10-04: «لا يظهر لى» — the image reached the Creator
      //   and rendered nowhere. A channel that delivers only a picture is a
      //   channel that fails silently for anyone reading in text. The same
      //   token, written plainly, can be rendered as a terminal QR or
      //   tapped directly on a phone.
      const src = await img.getAttribute('src');
      if (src && src !== lastUrl) { lastUrl = src; writeFileSync(`${OUT}/tg-qr-live.dataurl.txt`, src); }
    }
  } catch { /* the element is mid-rerender; the next tick catches it */ }
}, 4000);

try {
  await page.locator('.makman-tg-qr img').waitFor({ timeout: 90000 });
  console.log('٢ · ظهر رمز QR — يُبثّ إلى', QR_PATH);
} catch {
  clearInterval(relay);
  console.log('FAILURE_STAGE=2-browser-mtproto (لم يظهر رمز QR)');
  console.log('BODY:', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 300));
  await page.screenshot({ path: `${OUT}/makman-telegram-user.png` });
  await browser.close(); process.exit(1);
}

// ── 3 · the Creator scans; destinations appear ───────────────────────────
const choice = page.locator('button', { hasText: /الرسائل المحفوظة|قناتك|أنت مشرفٌ فيها|مجموعةٌ تنشر فيها/ }).first();
try {
  await choice.waitFor({ timeout: 900000 });   // fifteen minutes for a hand
} catch {
  clearInterval(relay);
  console.log('FAILURE_STAGE=1-authentication (لم يُمسح الرمز)');
  await page.screenshot({ path: `${OUT}/makman-telegram-user.png` });
  await browser.close(); process.exit(1);
}
clearInterval(relay);
const destCount = await page.locator('button', { hasText: /الرسائل المحفوظة|قناتك|أنت مشرفٌ فيها|مجموعةٌ تنشر فيها/ }).count();
console.log('٣ · وجهاتٌ صالحة  :', destCount);
console.log('    أوّلها          :', (await choice.innerText()).trim());
await choice.click();
await page.waitForTimeout(5000);
console.log('٤ · حال الوجهات   :', (await page.locator('.makman-cloud-state').allInnerTexts()).join(' | '));
console.log('    اللافتة         :', (await page.locator('.makman-plan-row span').allInnerTexts()).join(' | ').slice(0, 160));

// ── 4 · one real sovereign asset, carried by pressing its card ───────────
const cards = page.locator('[data-testid="makman-vault-door"] button');
const assetCount = await cards.count();
console.log('٥ · أصول الخزانة  :', assetCount);
if (assetCount === 0) {
  console.log('FAILURE_STAGE=3-sovereign-asset-access (لا أصول)');
  await browser.close(); process.exit(1);
}
await cards.first().click();
await page.waitForTimeout(3000);
const carriedName = (await page.locator('.makman-carried-name').allInnerTexts()).join('');
console.log('    الأصل المحمول   :', carriedName.slice(0, 80));

const publish = page.locator('button', { hasText: /انشره بحسابك في/ }).first();
console.log('٦ · زرّ النشر     :', await publish.count() > 0 ? (await publish.innerText()).trim() : '✕ غائب');
if (await publish.count() === 0) {
  console.log('FAILURE_STAGE=4-telegram-publication (لا زرّ نشر)');
  await page.screenshot({ path: `${OUT}/makman-telegram-user.png` });
  await browser.close(); process.exit(1);
}
await publish.click();

for (let i = 0; i < 90; i += 1) {
  await page.waitForTimeout(2000);
  if (/نُشِر بحسابك|لم تُقبَل|لم نصل|انتهى إذن|لم نجد بايتات|لم يصل معرّف/.test(await page.locator('body').innerText())) break;
}
const verdict = (await page.locator('.project-status').allInnerTexts()).join(' | ').replace(/\s+/g, ' ');
console.log('٧ · جواب النشر    :', verdict.slice(0, 220));

const receipts = await page.locator('[data-testid="makman-receipts"]').allInnerTexts();
console.log('٨ · سجلّ التوزيع  :', receipts.join(' | ').replace(/\s+/g, ' ').slice(0, 240));

// ── 5 · the receipt is the database speaking, not a memory ───────────────
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const veil2 = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil2.count()) { await veil2.click({ force: true }).catch(() => {}); await page.waitForTimeout(2000); }
console.log('٩ · بعد التحديث   :', (await page.locator('[data-testid="makman-receipts"]').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 240));

// ── 6 · THE CUSTODY CHECK ────────────────────────────────────────────────
const session = await page.evaluate((prefix) => {
  const out = [];
  for (const k of Object.keys(window.localStorage)) {
    if (k.startsWith(prefix)) out.push(window.localStorage.getItem(k) ?? '');
  }
  return out.filter((p) => p.length >= 32);
}, SESSION_PREFIX);

console.log('١٠ · إذنٌ في المتصفّح:', session.length > 0 ? `نعم (${session.length} قيمة)` : '✕ لا شيء — الفحص بلا معنى');

const haystack = (o) => `${o.url}\n${o.headers ?? ''}\n${o.body ?? o.text ?? ''}`;
const byValue = (list) => list.filter((o) => session.some((s) => s.length >= 32 && haystack(o).includes(s)));
const byName  = (list) => list.filter((o) => {
  const h = haystack(o).toLowerCase();
  return CUSTODY_NAMES.some((n) => h.includes(n));
});

const reqValue = byValue(sentToAzma), reqName = byName(sentToAzma);
const resValue = byValue(azmaResponses), resName = byName(azmaResponses);

console.log('١١ · طلباتٌ إلى أزما:', sentToAzma.length, '· أجوبةٌ منها:', azmaResponses.length);
console.log('١٢ · الجلسة في طلبٍ بالقيمة :', reqValue.length === 0 ? '✓ لا' : `✕ نعم (${reqValue.length})`);
console.log('١٣ · أو بالاسم              :', reqName.length === 0 ? '✓ لا' : `✕ نعم (${reqName.length})`);
console.log('١٤ · الجلسة في جوابٍ بالقيمة:', resValue.length === 0 ? '✓ لا' : `✕ نعم (${resValue.length})`);
console.log('١٥ · أو بالاسم              :', resName.length === 0 ? '✓ لا' : `✕ نعم (${resName.length})`);
for (const o of [...reqValue, ...reqName, ...resValue, ...resName].slice(0, 5)) console.log('     ↳', o.url);

writeFileSync(`${OUT}/tg-traffic-capture.json`, JSON.stringify({
  requestCount: sentToAzma.length,
  responseCount: azmaResponses.length,
  sessionValuesHeld: session.length,
  breachesByValue: reqValue.length + resValue.length,
  breachesByName: reqName.length + resName.length,
  urls: sentToAzma.map((r) => r.url),
}, null, 1));

await page.screenshot({ path: `${OUT}/makman-telegram-user.png` });
await browser.close();
const clean = session.length > 0 && reqValue.length === 0 && reqName.length === 0 && resValue.length === 0 && resName.length === 0;
console.log(clean ? 'CUSTODY=CLEAN' : 'CUSTODY=BREACH_OR_UNTESTABLE');
process.exit(clean ? 0 : 1);
