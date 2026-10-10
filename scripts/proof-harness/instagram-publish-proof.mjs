/**
 * AZMA OS — ONE REAL INSTAGRAM PUBLICATION
 *
 * Pre-publish forensics already passed on the server: the token carries
 * instagram_basic and instagram_content_publish (measured with debug_token,
 * not read from our own scopes column), the account is the real professional
 * @amrisaboretag (id 17841401607393629, distinct from the Page id), and the
 * 24-hour publishing quota reads 0 — so nothing published today, and one run
 * cannot be mistaken for a duplicate.
 *
 * It presses the Creator's own buttons. ONE asset, ONE destination, ONE pass.
 */
import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';

const BASE = 'https://azmaos.com';
const OUT = 'scripts/proof-harness';
/** The JPEG the Founder's vault actually holds, targeted by its own file. */
const ASSET_FILE = 'c796994c-db73-4a4e-a0e6-1e32019ded6b';

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1366, height: 820 } });
const page = await ctx.newPage();

/** Raw answers. `status` is a METHOD — calling it was the last harness's bug. */
const wire = [];
page.on('response', async (r) => {
  if (!r.url().startsWith(BASE) || !/\/api\//.test(r.url())) return;
  let b = ''; try { b = (await r.text()).slice(0, 2000); } catch { b = '(binary)'; }
  wire.push(`${r.status()} ${r.url().replace(BASE, '')}  ${b.replace(/\s+/g, ' ').slice(0, 300)}`);
});

const stop = async (stage, why) => {
  console.log(`\n✗ FAILURE_STAGE=${stage}\n  ${why}`);
  await page.screenshot({ path: `${OUT}/instagram-proof.png` }).catch(() => {});
  await ctx.close(); await browser.close(); process.exit(1);
};

await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
const email = page.locator('#email, input[type="email"]').first();
const pw = page.locator('#password, input[type="password"]').first();
await email.waitFor({ state: 'visible', timeout: 45000 });
const stick = async (box, v) => { for (let i = 0; i < 25; i += 1) {
  await box.click({ timeout: 10000 }).catch(() => {}); await box.fill('').catch(() => {});
  await box.pressSequentially(v, { delay: 20 }).catch(() => {});
  if ((await box.inputValue().catch(() => '')) === v) return true; await page.waitForTimeout(1000);
} return false; };
if (!await stick(email, process.env.AZMA_VERIFY_EMAIL ?? '') || !await stick(pw, process.env.AZMA_VERIFY_PASSWORD ?? '')) {
  await stop('login-fields', 'الحقول لم تُمسك بما كُتب فيها.');
}
await page.locator('button[type="submit"]').first().click();
try { await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 45000 }); }
catch { await stop('login', 'بقي في صفحة الدخول.'); }
console.log('١ · الدخول:', page.url().replace(BASE, ''));

await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(9000);
const veil = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil.count()) { await veil.click({ force: true }).catch(() => {}); await page.waitForTimeout(2500); }

const rows = (await page.locator('.makman-plan-row span').allInnerTexts()).filter((r) => /إنستجرام|@/.test(r));
console.log('٢ · وجهة إنستجرام في الحجرة:', rows.join(' | ').slice(0, 160) || '(لا صفّ)');

const card = page.locator(`[data-testid="makman-vault-door"] button:has(img[src*="${ASSET_FILE}"])`).first();
if (!(await card.count())) await stop('asset', `الأصل ${ASSET_FILE} ليس في باب الخزنة.`);
await card.scrollIntoViewIfNeeded(); await card.click(); await page.waitForTimeout(4500);
console.log('٣ · الأصل المحمول:', (await page.locator('.makman-carried-name').allInnerTexts()).join('').slice(0, 80));

const all = page.locator('button').filter({ hasText: /ارفعه إلى|انشره في/ });
const n = await all.count();
let target = null, label = '';
for (let i = 0; i < n; i += 1) {
  const t = (await all.nth(i).innerText()).trim();
  if (/إنستجرام|@amrisaboretag|◉/.test(t)) { target = all.nth(i); label = t; break; }
}
if (!target) {
  console.log('الأزرار المتاحة:');
  for (let i = 0; i < n; i += 1) console.log('   ·', (await all.nth(i).innerText()).trim().slice(0, 70));
  await stop('publish-affordance', 'لا زرّ نشرٍ إلى إنستجرام رغم أنّ الحساب مربوط.');
}
console.log('٤ · أضغط:', label);
await target.click();

for (let i = 0; i < 150; i += 1) {
  await page.waitForTimeout(2000);
  if (/نُشِر|وصل|لم تُقبَل|لم نصل|لم يُقبل|لم نجد بايتات|تعذّر|غير مهيّأ/.test(await page.locator('body').innerText())) break;
}
console.log('٥ · جواب الحجرة:', (await page.locator('.project-status').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 300));
console.log('\n٦ · الأسلاك:');
for (const w of wire.slice(-5)) console.log('   ' + w);
await page.screenshot({ path: `${OUT}/instagram-proof.png` });
await ctx.close(); await browser.close();
