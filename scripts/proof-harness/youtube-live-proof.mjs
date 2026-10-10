/**
 * AZMA OS — THE SINGLE LIVE ACCEPTANCE TEST FOR YOUTUBE
 *
 * It presses only buttons. The Creator has already linked their channel from
 * their own browser, because a YouTube grant lives in the Empire's vault on
 * the server — so unlike Telegram, the browser that links need not be the
 * browser that publishes.
 *
 * ─── WHAT IT WILL NOT DO ────────────────────────────────────────────────────
 *
 *   It carries a VIDEO, because YouTube publishes nothing else, and it stops
 *   at the first failure instead of trying a second asset. One publication,
 *   one verdict.
 */
import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';

const BASE = 'https://azmaos.com';
const OUT = 'scripts/proof-harness';

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
page.on('console', (m) => {
  if (m.type() === 'error') console.log('   [console.error]', m.text().slice(0, 200));
});

await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(9000);
const veil = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil.count()) { await veil.click({ force: true }).catch(() => {}); await page.waitForTimeout(2500); }

// ── 1 · the channel is linked, and the Chamber says so ───────────────────
const states = await page.locator('.makman-cloud-state').allInnerTexts();
const youtubeState = states.find((s) => s.includes('يوتيوب')) ?? '(غائب)';
console.log('١ · حال يوتيوب   :', youtubeState.replace(/\s+/g, ' '));
if (!youtubeState.includes('مرتبط') || youtubeState.includes('غير مرتبط')) {
  console.log('FAILURE_STAGE=account (القناة غير مرتبطة)');
  await page.screenshot({ path: `${OUT}/youtube-proof.png` });
  await browser.close(); process.exit(1);
}

// ── 2 · carry a REAL VIDEO — YouTube publishes nothing else ──────────────
const cards = page.locator('[data-testid="makman-vault-door"] button');
const total = await cards.count();
console.log('٢ · أصول الباب   :', total);

let carried = false;
for (let i = 0; i < total && !carried; i += 1) {
  const card = cards.nth(i);
  const img = card.locator('img').first();
  const src = (await img.count()) ? (await img.getAttribute('src')) ?? '' : '';
  if (!/\.mp4$|\.mov$/i.test(src)) continue;
  await card.click();
  await page.waitForTimeout(2500);
  const name = (await page.locator('.makman-carried-name').allInnerTexts()).join('');
  if (name) { carried = true; console.log('٣ · الفيديو المحمول:', src.split('/').pop()); }
}
if (!carried) {
  console.log('FAILURE_STAGE=asset (لا فيديو في الباب)');
  await page.screenshot({ path: `${OUT}/youtube-proof.png` });
  await browser.close(); process.exit(1);
}

// ── 3 · one publication, to the channel ──────────────────────────────────
const publish = page.locator('button', { hasText: /انشره في.*@|▶ انشره/ }).first();
const anyPublish = (await publish.count()) ? publish
  : page.locator('button').filter({ hasText: /انشره في/ }).first();
if (await anyPublish.count() === 0) {
  console.log('FAILURE_STAGE=destination (لا زرّ نشرٍ ليوتيوب)');
  await page.screenshot({ path: `${OUT}/youtube-proof.png` });
  await browser.close(); process.exit(1);
}
console.log('٤ · زرّ النشر    :', (await anyPublish.innerText()).trim());
await anyPublish.click();

for (let i = 0; i < 120; i += 1) {
  await page.waitForTimeout(2000);
  const t = await page.locator('body').innerText();
  if (/نُشِر|رُفِع|لم تُقبَل|لم نصل|لم يُقبل|لم نجد بايتات|غير متاح/.test(t)) break;
}
console.log('٥ · جواب الحجرة  :', (await page.locator('.project-status').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 220));
console.log('٦ · سجلّ التوزيع :', (await page.locator('[data-testid="makman-receipts"]').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 240));

// ── 4 · the receipt is the database speaking, not a memory ───────────────
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const veil2 = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil2.count()) { await veil2.click({ force: true }).catch(() => {}); await page.waitForTimeout(2000); }
console.log('٧ · بعد التحديث  :', (await page.locator('[data-testid="makman-receipts"]').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 240));

await page.screenshot({ path: `${OUT}/youtube-proof.png` });
await browser.close();
