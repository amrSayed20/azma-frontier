/**
 * AZMA OS — مكمن الغاية walked by hand, 2026-09-29.
 *
 * The same instrument that walked رأس الأمر: nothing here reads a variable or
 * calls a function. Every check is a click, a keystroke, or a thing a Creator
 * would see afterwards — and a control that is present but does nothing FAILS.
 *
 * It spends nothing. An act that would commission a paid render is inspected
 * up to the point the Empire shows before spending, and the walk says so.
 */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'https://azmaos.com';
const results = [];
const say = (ok, what, detail = '') => {
  results.push({ ok, what });
  console.log(`${ok ? '▸' : '⚠'} ${what}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch();
const setup = await browser.newContext();
for (let i = 0; i < 5; i += 1) {
  try {
    const r = await setup.request.post(`${BASE}/api/auth/login`, {
      data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
      timeout: 30000,
    });
    if (r.ok()) break;
  } catch { await new Promise((r) => setTimeout(r, 4000)); }
}
const STATE = await setup.storageState();
await setup.close();

const ctx = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1366, height: 768 }, storageState: STATE });
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 150)); });

await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);

// ── The door ───────────────────────────────────────────────────────────────
const enter = page.getByRole('button', { name: /ادخل الحجرة|فهمت/ });
if (await enter.count() > 0) {
  await enter.first().click({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  say(!(await enter.first().isVisible().catch(() => false)), 'لوحة العرض تُغلق بالضغط');
}

// ── 1 · what a stranger is shown first ────────────────────────────────────
console.log('\n── ما يراه الغريب أوّلاً ──');
const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
say(body.length > 0, 'الحجرة تعرض شيئاً', `${body.slice(0, 70)}…`);
const btns = await page.locator('button:visible').allInnerTexts();
const clean = btns.map((b) => b.replace(/\s+/g, ' ').trim()).filter(Boolean);
say(clean.length > 0, 'أزرارٌ ظاهرةٌ ليدٍ تبدأ', `${clean.length}: ${clean.slice(0, 8).join(' · ')}`);
const fields = await page.locator('textarea:visible, input:visible, select:visible').count();
console.log(`   (حقولٌ ظاهرة: ${fields})`);

// ── 2 · the Purpose — the first thing this chamber asks for ───────────────
console.log('\n── الغاية ──');
const purposeOpen = page.locator('button', { hasText: /غايت|الغاية|اكتب|حدّد/ }).first();
if (await purposeOpen.count() === 0) say(false, 'لا زرّ يفتح تحرير الغاية');
else {
  const label = (await purposeOpen.innerText()).replace(/\s+/g, ' ').trim();
  await purposeOpen.click({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const ta = page.locator('textarea:visible').first();
  const opened = await ta.count() > 0;
  say(opened, `«${label.slice(0, 26)}» يفتح حقل الغاية`);
  if (opened) {
    const text = 'أن أُنتج مادّةً تعليميّةً تُفهَّم من أوّل مرّة';
    await ta.fill(text, { timeout: 8000 }).catch(() => {});
    const kept = await ta.inputValue().catch(() => '');
    say(kept === text, 'حقل الغاية يقبل الكتابة ويحتفظ بها', kept.slice(0, 30));
    const save = page.locator('button:visible', { hasText: /احفظ|تثبيت|اعتمد|تأكيد/ }).first();
    if (await save.count() === 0) say(false, 'لا زرّ يحفظ الغاية المكتوبة');
    else {
      await save.click({ timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3500);
      const still = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      say(still.includes(text.slice(0, 20)), 'الغاية المحفوظة تبقى معروضة بعد الحفظ');
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await page.waitForTimeout(6000);
      const after = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      say(after.includes(text.slice(0, 20)), 'الغاية تنجو من إعادة فتح الحجرة');
    }
  }
}

// ── 3 · every visible button pressed, and judged by what changed ──────────
console.log('\n── كلّ زرٍّ ظاهر، يُضغط ──');
const before = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
const spendWords = /أنتج|إنتاج|ولّد|انشر|نشر|ارفع/;
const all = page.locator('button:visible');
const total = await all.count();
for (let i = 0; i < total; i += 1) {
  const b = all.nth(i);
  const name = (await b.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  if (!name) continue;
  if (/خروج|قلب الإمبراطورية|الخزانة/.test(name)) { console.log(`   (تُرك: «${name.slice(0, 24)}» يغادر الحجرة)`); continue; }
  if (spendWords.test(name)) {
    const dis = await b.isDisabled().catch(() => true);
    const title = await b.getAttribute('title').catch(() => null);
    say(true, `«${name.slice(0, 28)}» حاضر`, dis ? `مُعطَّل: «${(title || '').slice(0, 40)}»` : 'مفعَّل — لم يُضغط، فهو يُنفق');
    continue;
  }
  const was = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  await b.click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1600);
  const now = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  say(now !== was, `«${name.slice(0, 30)}» يُغيّر شيئاً حين يُضغط`, now === was ? 'لم يتغيّر شيء على الشاشة' : '');
}

console.log(`\n── أخطاء الطرفية (${[...new Set(consoleErrors)].length}) ──`);
for (const e of [...new Set(consoleErrors)].slice(0, 8)) console.log(`   ✗ ${e}`);

await page.screenshot({ path: 'scripts/proof-harness/makman-walk.png' });
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} اجتازت · ${BASE}`);
for (const f of bad) console.log(`   ⚠ ${f.what}`);
await browser.close();
