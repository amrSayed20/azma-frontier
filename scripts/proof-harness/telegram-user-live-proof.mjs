/**
 * AZMA OS — THE SINGLE LIVE ACCEPTANCE TEST FOR TELEGRAM-BY-THE-CREATOR
 *
 * WRITTEN, NOT RUN. The Founder ruled on 2026-10-04: «Do NOT begin the live
 * acceptance test yet.» This file exists so that when it is run, what it
 * measures is fixed in advance rather than chosen afterwards to fit a result.
 *
 * ─── IT PROVES TWO THINGS AT ONCE, AND THE SECOND IS THE POINT ──────────────
 *
 *   1. the chain:  real Creator → real personal Telegram authorization →
 *      real identity → real eligible destination → real sovereign asset →
 *      real MTProto publication → real message id → persisted AZMA receipt
 *      that survives a reload.
 *
 *   2. the custody claim: that the session NEVER crossed to the AZMA server.
 *      Every request the page makes is captured — URL, headers and body —
 *      and searched for the session this browser holds. A publication that
 *      succeeded while leaking the session would be a failure, and this
 *      harness must be able to say so.
 *
 *   The second check is why the session is read OUT of localStorage here. It
 *   is never printed, and only ever compared.
 *
 * ─── WHAT IT CANNOT PROVE, SAID HERE SO NOBODY CLAIMS IT LATER ──────────────
 *
 *   That AZMA *could not* read the session. It can: this code is served from
 *   AZMA's origin, which is exactly the limit the Founder accepted in writing
 *   as PARTIAL ZERO-CUSTODY. What this proves is that it DOES NOT.
 *
 * Requires, at run time: a real Creator session, a real Telegram account
 * scanned by hand, and one real sovereign asset in that Creator's Vault.
 */
import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';

const BASE = 'https://azmaos.com';
const SESSION_PREFIX = 'azma.telegram.user';

const browser = await chromium.launch({ headless: false }); // a hand must scan
const setup = await browser.newContext();
const login = await setup.request.post(`${BASE}/api/auth/login`, {
  data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
  timeout: 30000,
});
console.log('جلسة المؤسّس:', login.status());
const STATE = await setup.storageState();
await setup.close();

const ctx = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1366, height: 1000 }, storageState: STATE });
const page = await ctx.newPage();

// ── EVERY BYTE THIS PAGE SENDS TO AZMA, KEPT FOR THE CUSTODY CHECK ────────
const sentToAzma = [];
page.on('request', (r) => {
  const url = r.url();
  if (!url.startsWith(BASE)) return;          // Telegram's own DCs are not AZMA
  let body = '';
  try { body = r.postData() ?? ''; } catch { /* no body */ }
  sentToAzma.push(`${url}\n${JSON.stringify(r.headers())}\n${body}`);
});

await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(9000);
const veil = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil.count()) { await veil.click({ force: true }).catch(() => {}); await page.waitForTimeout(2500); }

// ── 1 · the surface a hand can reach ─────────────────────────────────────
const connect = page.locator('[data-testid="makman-telegram-user-connect"]');
console.log('١ · زرّ ربط الحساب :', await connect.count() > 0 ? 'ظاهر' : '✕ غائب');
if (await connect.count() === 0) { await browser.close(); process.exit(1); }

await connect.click();
console.log('٢ · يُنتظر رمز QR…');
await page.locator('.makman-tg-qr img').waitFor({ timeout: 60000 });
console.log('٣ · ظهر الرمز — امسحه الآن من تطبيق تيليجرام (الإعدادات ← الأجهزة)');

// ── 2 · the Creator scans, and destinations appear ───────────────────────
const choice = page.locator('button', { hasText: /الرسائل المحفوظة|قناتك|أنت مشرفٌ فيها/ }).first();
await choice.waitFor({ timeout: 180000 });
console.log('٤ · وجهاتٌ صالحة  :', await page.locator('button', { hasText: /الرسائل المحفوظة|قناتك|مشرفٌ/ }).count());
console.log('    أوّلها          :', (await choice.innerText()).trim());
await choice.click();
await page.waitForTimeout(4000);
console.log('٥ · حال الوجهات   :', (await page.locator('.makman-cloud-state').allInnerTexts()).join(' | '));

// ── 3 · one real sovereign asset, carried by pressing its card ───────────
const cards = page.locator('[data-testid="makman-vault-door"] button');
console.log('٦ · أصول الخزانة  :', await cards.count());
await cards.first().click();
await page.waitForTimeout(2500);

const publish = page.locator('button', { hasText: /انشره بحسابك في/ }).first();
console.log('٧ · زرّ النشر     :', await publish.count() > 0 ? (await publish.innerText()).trim() : '✕ غائب');
if (await publish.count() === 0) { await browser.close(); process.exit(1); }
await publish.click();

for (let i = 0; i < 60; i += 1) {
  await page.waitForTimeout(2000);
  if (/نُشِر بحسابك|لم تُقبَل|لم نصل|انتهى إذن/.test(await page.locator('body').innerText())) break;
}
console.log('٨ · جواب النشر    :', (await page.locator('.project-status').allInnerTexts()).join(' | ').slice(0, 200));

const receipts = await page.locator('[data-testid="makman-receipts"]').allInnerTexts();
console.log('٩ · سجلّ التوزيع  :', receipts.join(' | ').replace(/\s+/g, ' ').slice(0, 240));

// ── 4 · the receipt is the database speaking, not a memory ───────────────
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const veil2 = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil2.count()) { await veil2.click({ force: true }).catch(() => {}); await page.waitForTimeout(2000); }
console.log('١٠ · بعد التحديث  :', (await page.locator('[data-testid="makman-receipts"]').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 240));

// ── 5 · THE CUSTODY CHECK ────────────────────────────────────────────────
const session = await page.evaluate((prefix) => {
  const parts = [];
  for (const k of Object.keys(window.localStorage)) {
    if (k.startsWith(prefix)) parts.push(window.localStorage.getItem(k) ?? '');
  }
  return parts.filter((p) => p.length >= 40);
}, SESSION_PREFIX);

console.log('١١ · إذنٌ في المتصفّح:', session.length > 0 ? `نعم (${session.length} مفتاحاً)` : '✕ لا شيء — الفحص بلا معنى');
if (session.length === 0) { await browser.close(); process.exit(1); }

const leaked = sentToAzma.filter((req) => session.some((s) => req.includes(s)));
console.log('١٢ · طلباتٌ إلى أزما:', sentToAzma.length);
console.log('١٣ · أيٌّ منها حمل الإذن؟', leaked.length === 0 ? '✓ لا واحد' : `✕ ${leaked.length} — خرقٌ للحكم`);
if (leaked.length > 0) console.log('     أوّلها:', leaked[0].split('\n')[0]);

await page.screenshot({ path: 'scripts/proof-harness/makman-telegram-user.png' });
await browser.close();
process.exit(leaked.length === 0 ? 0 : 1);
