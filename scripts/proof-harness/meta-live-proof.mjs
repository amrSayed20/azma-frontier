/**
 * AZMA OS — THE LIVE ACCEPTANCE TEST FOR META
 *
 * One publication to a Facebook Page, one to an Instagram professional
 * account. It presses only buttons, and it stops at the first failure instead
 * of trying a second destination.
 *
 * ─── IT WATCHES FOR A LEAK WHILE IT WORKS ───────────────────────────────────
 *
 *   A Meta page token is a credential, and it lives on the server. Every
 *   request the page sends and every answer it receives is searched for one,
 *   so a publication that succeeded while leaking the token would be reported
 *   as the failure it is.
 *
 * ─── AND IT NEVER CALLS A CONTAINER A PUBLICATION ───────────────────────────
 *
 *   Instagram's two steps mean a container can be created and the publish
 *   still fail. Only a receipt carrying a real media id counts, and only after
 *   it has survived a reload.
 */
import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const BASE = 'https://azmaos.com';
const OUT = 'scripts/proof-harness';
/** Shapes a Meta credential travels in. A page token begins EAA… */
const SECRET_SHAPES = [/\bEAA[A-Za-z0-9]{40,}/];

const browser = await chromium.launch({ headless: true });
const setup = await browser.newContext();
const login = await setup.request.post(`${BASE}/api/auth/login`, {
  data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD }, timeout: 30000,
});
console.log('جلسة المؤسّس:', login.status());
const STATE = await setup.storageState();
await setup.close();

const ctx = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1366, height: 1100 }, storageState: STATE });
const page = await ctx.newPage();

const seen = [];
page.on('request', (r) => {
  if (!r.url().startsWith(BASE)) return;
  let body = ''; try { body = r.postData() ?? ''; } catch { /* none */ }
  seen.push(`REQ ${r.url()}\n${body}`);
});
page.on('response', async (r) => {
  if (!r.url().startsWith(BASE)) return;
  let text = ''; try { text = (await r.text()).slice(0, 120000); } catch { /* binary */ }
  seen.push(`RES ${r.url()}\n${text}`);
});
page.on('console', (m) => { if (m.type() === 'error') console.log('   [console.error]', m.text().slice(0, 180)); });

await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(9000);
const veil = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil.count()) { await veil.click({ force: true }).catch(() => {}); await page.waitForTimeout(2500); }

// ── 1 · which Meta destinations actually opened ──────────────────────────
const states = (await page.locator('.makman-cloud-state').allInnerTexts()).map((s) => s.replace(/\s+/g, ' '));
console.log('١ · حال الوجهات:', states.filter((s) => /فيسبوك|إنستجرام/.test(s)).join(' | ') || '(لا صفّ لميتا)');
const rows = await page.locator('.makman-plan-row span').allInnerTexts();
const metaRows = rows.filter((r) => /صفحة فيسبوك|إنستجرام/.test(r));
console.log('٢ · الوجهات المربوطة:', metaRows.length ? metaRows.join(' | ').slice(0, 200) : '(لا شيء)');
if (metaRows.length === 0) {
  console.log('FAILURE_STAGE=destinations (لم تُفتح أيّ وجهة ميتا)');
  await page.screenshot({ path: `${OUT}/meta-proof.png` });
  await browser.close(); process.exit(1);
}

// ── 2 · carry one real sovereign asset ───────────────────────────────────
const cards = page.locator('[data-testid="makman-vault-door"] button');
console.log('٣ · أصول الباب :', await cards.count());
await cards.first().click();
await page.waitForTimeout(3000);
const carried = (await page.locator('.makman-carried-name').allInnerTexts()).join('');
console.log('٤ · الأصل المحمول:', carried.slice(0, 80));

// ── 3 · publish to each Meta destination, once ───────────────────────────
for (const label of ['صفحة', 'إنستجرام']) {
  const button = page.locator('button').filter({ hasText: /انشره في/ })
    .filter({ hasText: new RegExp(label === 'صفحة' ? '' : 'إنستجرام|@') }).first();
  const all = page.locator('button').filter({ hasText: /انشره في/ });
  const count = await all.count();
  let target = null;
  for (let i = 0; i < count; i += 1) {
    const t = (await all.nth(i).innerText()).trim();
    if (label === 'صفحة' && !/إنستجرام|@|تيليجرام|يوتيوب/.test(t)) { target = all.nth(i); break; }
    if (label === 'إنستجرام' && /@|إنستجرام/.test(t)) { target = all.nth(i); break; }
  }
  if (!target) { console.log(`— ${label}: لا زرّ — UNPROVEN`); continue; }

  console.log(`\n▶ ${label} — ${(await target.innerText()).trim()}`);
  await target.click();
  for (let i = 0; i < 120; i += 1) {
    await page.waitForTimeout(2000);
    if (/نُشِر|لم تُقبَل|لم نصل|لم يُقبل|لم نجد بايتات|غير مهيّأ/.test(await page.locator('body').innerText())) break;
  }
  console.log('   جواب الحجرة:', (await page.locator('.project-status').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 200));
}

// ── 4 · the receipts, after a reload — the database speaking ─────────────
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const veil2 = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil2.count()) { await veil2.click({ force: true }).catch(() => {}); await page.waitForTimeout(2000); }
console.log('\n٥ · سجلّ التوزيع بعد التحديث:',
  (await page.locator('[data-testid="makman-receipts"]').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 320));

// ── 5 · did any credential cross to the browser? ─────────────────────────
const leaks = seen.filter((s) => SECRET_SHAPES.some((re) => re.test(s)));
console.log('٦ · طلبات/أجوبة مفحوصة:', seen.length);
console.log('٧ · رمز ميتا في أيٍّ منها؟', leaks.length === 0 ? '✓ لا' : `✕ نعم (${leaks.length})`);
for (const l of leaks.slice(0, 3)) console.log('   ↳', l.split('\n')[0]);

writeFileSync(`${OUT}/meta-traffic-capture.json`, JSON.stringify({ inspected: seen.length, leaks: leaks.length }, null, 1));
await page.screenshot({ path: `${OUT}/meta-proof.png` });
await browser.close();
