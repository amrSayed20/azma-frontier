/**
 * AZMA OS — ONE REAL FACEBOOK PAGE PUBLICATION, AND ITS RECEIPT
 *
 * No recording, no consent: the Page is already linked. This presses the
 * Creator's own buttons and then asks the database what survived.
 */
import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';

const BASE = 'https://azmaos.com';
const OUT = 'scripts/proof-harness';
const ASSET_FILE = process.env.ASSET_FILE ?? '';

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1366, height: 820 } });
const page = await ctx.newPage();
const wire = [];
page.on('response', async (r) => {
  if (!r.url().startsWith(BASE) || !/\/api\//.test(r.url())) return;
  let b = ''; try { b = (await r.text()).slice(0, 3000); } catch { b = '(binary)'; }
  wire.push(`${r.status} ${r.url().replace(BASE, '')}  ${b.replace(/\s+/g, ' ').slice(0, 400)}`);
});

await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
const email = page.locator('#email, input[type="email"]').first();
const pw = page.locator('#password, input[type="password"]').first();
await email.waitFor({ state: 'visible', timeout: 45000 });
const stick = async (box, v) => { for (let i = 0; i < 25; i += 1) {
  await box.click({ timeout: 10000 }).catch(() => {}); await box.fill('').catch(() => {});
  await box.pressSequentially(v, { delay: 20 }).catch(() => {});
  if ((await box.inputValue().catch(() => '')) === v) return true; await page.waitForTimeout(1000);
} return false; };
await stick(email, process.env.AZMA_VERIFY_EMAIL ?? '');
await stick(pw, process.env.AZMA_VERIFY_PASSWORD ?? '');
await page.locator('button[type="submit"]').first().click();
await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 45000 });

await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(9000);
const veil = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil.count()) { await veil.click({ force: true }).catch(() => {}); await page.waitForTimeout(2500); }

const cards = page.locator('[data-testid="makman-vault-door"] button');
const card = ASSET_FILE ? page.locator(`[data-testid="makman-vault-door"] button:has(img[src*="${ASSET_FILE}"])`).first() : cards.first();
if (!(await card.count())) { console.log('✗ FAILURE_STAGE=asset'); await ctx.close(); await browser.close(); process.exit(1); }
await card.scrollIntoViewIfNeeded(); await card.click(); await page.waitForTimeout(4500);
console.log('١ · الأصل المحمول:', (await page.locator('.makman-carried-name').allInnerTexts()).join('').slice(0, 80));

const all = page.locator('button').filter({ hasText: /ارفعه إلى|انشره في/ });
const n = await all.count();
let target = null, label = '';
for (let i = 0; i < n; i += 1) {
  const t = (await all.nth(i).innerText()).trim();
  if (/شوف عظمه|❖/.test(t) && !/@|إنستجرام/.test(t)) { target = all.nth(i); label = t; break; }
}
if (!target) {
  console.log('✗ FAILURE_STAGE=publish-affordance — الأزرار المتاحة:');
  for (let i = 0; i < n; i += 1) console.log('   ·', (await all.nth(i).innerText()).trim().slice(0, 70));
  await ctx.close(); await browser.close(); process.exit(1);
}
console.log('٢ · أضغط:', label);
await target.click();
for (let i = 0; i < 120; i += 1) {
  await page.waitForTimeout(2000);
  if (/نُشِر|وصل|لم تُقبَل|لم نصل|لم يُقبل|لم نجد بايتات|تعذّر|غير مهيّأ/.test(await page.locator('body').innerText())) break;
}
console.log('٣ · جواب الحجرة:', (await page.locator('.project-status').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 300));
console.log('\n٤ · الأسلاك:');
for (const w of wire.slice(-6)) console.log('   ' + w);
await page.screenshot({ path: `${OUT}/meta-fb-proof.png` });
await ctx.close(); await browser.close();
