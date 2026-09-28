/**
 * AZMA OS — THE FOUNDER'S OWN CROSSING, WALKED.
 *
 * The Founder, 2026-09-28: «خرجتُ من الحجّة الدامغة بمطالبة إنشاء ستوري بورد
 * ولم أجدها في رأس الأمر» — and, asked which door: «تفكيك».
 *
 * So this presses «⟡ فكّك الموضوع إلى مشاهد» on a REAL investigation and
 * follows where it goes. Writing the envelope by hand already proved the
 * receiving side works; what that cannot prove is whether the envelope is
 * ever written, and what the Creator sees between the two rooms.
 *
 * It produces NOTHING: no picture is commissioned, no film is rendered. It
 * asks a question, decomposes it, and crosses.
 *
 *   AZMA_VERIFY_EMAIL=… AZMA_VERIFY_PASSWORD=… node scripts/walk-hujjah-to-ras-amr.mjs [baseUrl] [zoom]
 */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'https://azmaos.com';
// A 1440×900 screen at 125% IS a 1152×720 viewport — the Founder's own.
const [W, H] = (process.argv[3] === '100') ? [1440, 900] : [1152, 720];

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ar-EG', viewport: { width: W, height: H } });
const login = await context.request.post(`${BASE}/api/auth/login`, {
  data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
});
console.log(`login → HTTP ${login.status()} · viewport ${W}×${H}\n`);

const page = await context.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 180)); });
page.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url().slice(0, 120)}`); });

const step = (s) => console.log(`\n── ${s} ──`);
const envelope = () => page.evaluate(() => ({
  storyboard: sessionStorage.getItem('azma.transfer.storyboard'),
  demand: sessionStorage.getItem('azma.transfer.demand'),
  held: sessionStorage.getItem('azma.rasamr.storyboard'),
}));

// ── 1 · ask ────────────────────────────────────────────────────────────────
step('الحجّة الدامغة — سؤال حقيقي');
await page.goto(`${BASE}/hujjah-al-damighah`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
// The room opens behind its demonstration, and then asks HOW the Creator
// wishes to speak to it before it offers anything to write in.
const dismiss = page.locator('button', { hasText: 'ادخل الحجرة' });
if (await dismiss.count() > 0) { await dismiss.first().click(); await page.waitForTimeout(1500); }
const writing = page.locator('button', { hasText: 'كتابة' });
if (await writing.count() > 0) { await writing.first().click(); await page.waitForTimeout(2500); }

const input = page.locator('#hujjah-input');
if (await input.count() === 0) {
  console.log('⚠ حقل السؤال غير موجود. الأزرار الظاهرة:');
  const btns = await page.evaluate(() => [...document.querySelectorAll('button')]
    .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
    .map((b) => (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50)));
  for (const b of btns) console.log(`   ▸ ${b}`);
  await page.screenshot({ path: 'scripts/proof-harness/walk-0-no-input.png', fullPage: true });
  await browser.close();
  process.exit(1);
}
// The chamber has NO default domain — it is a constitutional rule here, and
// each domain carries its own evidence. So one is chosen, as a Creator must.
const domain = page.locator('button', { hasText: /^ديني$/ });
if (await domain.count() > 0) { await domain.first().click(); await page.waitForTimeout(1200); console.log('   المجال: ديني'); }

await input.fill('آداب طلب العلم');
console.log('   السؤال: آداب طلب العلم');
// «Ctrl+↵ للاستقصاء» is what the room itself prints beside the board.
await input.press('Control+Enter');

console.log('   الاستقصاء جارٍ… (قد يطول)');
await page.waitForSelector('[data-testid="hujjah-scenes"]', { timeout: 300000 }).catch(() => {});
const sceneBtn = page.locator('[data-testid="hujjah-scenes"]');
if (await sceneBtn.count() === 0) {
  console.log('⚠ لم يظهر زرّ «فكّك الموضوع إلى مشاهد» — لم يكتمل الاستقصاء.');
  console.log('   ما ظهر على الصفحة:', (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 400));
  await page.screenshot({ path: 'scripts/proof-harness/walk-1-no-result.png', fullPage: true });
  await browser.close();
  process.exit(1);
}
console.log('   ▸ اكتمل الاستقصاء، والزرّ ظاهر');
await page.screenshot({ path: 'scripts/proof-harness/walk-1-result.png' });

// ── 2 · decompose ──────────────────────────────────────────────────────────
step('«⟡ فكّك الموضوع إلى مشاهد» — الباب الذي سلكه المؤسس');
console.log('   قبل الضغط:', JSON.stringify(await envelope()));
await sceneBtn.click();

// Either it crosses, or it says why it did not.
const crossed = await page.waitForURL(/\/ras-amr/, { timeout: 300000 }).then(() => true).catch(() => false);
if (!crossed) {
  const notice = await page.locator('.inv-demand-notice').innerText().catch(() => '');
  console.log(`   ⚠ لم يعبر. ما قالته الحجرة: «${notice.replace(/\s+/g, ' ').trim() || '(لا شيء — وهذا أسوأ)'}»`);
  console.log('   الظرف:', JSON.stringify(await envelope()));
  await page.screenshot({ path: 'scripts/proof-harness/walk-2-did-not-cross.png', fullPage: true });
  await browser.close();
  process.exit(1);
}
console.log('   ▸ عبر إلى رأس الأمر');

// ── 3 · what رأس الأمر shows ───────────────────────────────────────────────
step('رأس الأمر — ما يراه المنشئ فعلاً');
await page.waitForTimeout(8000);
const enter = page.locator('button', { hasText: 'ادخل الحجرة' });
if (await enter.count() > 0) { await enter.first().click(); await page.waitForTimeout(3000); }
await page.waitForTimeout(4000);

console.log('   الظرف بعد الوصول:', JSON.stringify(await envelope()));

const seen = await page.evaluate(() => {
  const panel = document.querySelector('[data-testid="rasamr-storyboard"]');
  const rail = document.querySelector('.ras-panel-right');
  if (!panel) return { present: false, mode: null };
  const r = panel.getBoundingClientRect();
  const railBox = rail?.getBoundingClientRect();
  return {
    present: true,
    text: (panel.innerText || '').replace(/\s+/g, ' ').slice(0, 140),
    top: Math.round(r.top),
    vh: window.innerHeight,
    onScreenNow: r.top >= 0 && r.top < window.innerHeight,
    insideRailView: railBox ? r.top >= railBox.top && r.bottom <= railBox.bottom : null,
    railScrolls: rail ? getComputedStyle(rail).overflowY : null,
    railClipped: rail ? rail.scrollHeight - rail.clientHeight : null,
  };
});
console.log('   لوحة المشاهد:', JSON.stringify(seen, null, 2).replace(/\n/g, '\n   '));

if (seen.present && !seen.onScreenNow) {
  const reached = await page.evaluate(() => {
    const p = document.querySelector('[data-testid="rasamr-storyboard"]');
    p.scrollIntoView({ block: 'center' });
    const r = p.getBoundingClientRect();
    return { top: Math.round(r.top), visible: r.top >= 0 && r.bottom <= window.innerHeight };
  });
  console.log('   بعد التمرير:', JSON.stringify(reached));
}

await page.screenshot({ path: 'scripts/proof-harness/walk-3-ras-amr.png' });
console.log(`\n── أخطاء (${errors.length}) ──`);
for (const e of [...new Set(errors)].slice(0, 10)) console.log(`   ✗ ${e}`);
await browser.close();
