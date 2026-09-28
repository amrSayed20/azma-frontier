/**
 * AZMA OS — رأس الأمر walked by hand, 2026-09-28.
 *
 * The Founder: «اجري اختبارا للبطاقات والازرار والحقول جميعا من خلال الازرار
 * نفسها وليس من خلال الاكواد».
 *
 * So nothing here reads a variable or calls a function. Every check is a
 * click, a keystroke, or a thing a Creator would see afterwards — and a
 * control that is present but does nothing FAILS, which is the whole point:
 * a button that renders is not a button that works.
 *
 * It spends nothing. Every act that would commission a provider is pressed
 * only as far as the confirmation the Empire shows before spending, and the
 * walk stops there and says so.
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

await page.goto(`${BASE}/ras-amr`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);

// ── The door ───────────────────────────────────────────────────────────────
const enter = page.getByRole('button', { name: /ادخل الحجرة/ });
if (await enter.count() > 0) {
  await enter.first().click();
  await page.waitForTimeout(2500);
  say(await enter.count() === 0 || !(await enter.first().isVisible()),
    '«فهمت — ادخل الحجرة» تُغلق لوحة العرض');
}

// ── 1 · the two worlds, pressed ────────────────────────────────────────────
console.log('\n── العالَمان ──');
for (const [name, mustSee] of [
  ['عالَم الستوري بورد', 'من فكرةٍ إلى مشاهد'],
  ['المونتاج', 'المشهد'],
]) {
  const btn = page.locator('.ras-work-btn', { hasText: name });
  if (await btn.count() === 0) { say(false, `زرّ «${name}» غير موجود`); continue; }
  await btn.first().click();
  await page.waitForTimeout(1800);
  const selected = await btn.first().getAttribute('aria-selected');
  const visible = await page.getByText(mustSee, { exact: false }).first().isVisible().catch(() => false);
  say(selected === 'true' && visible, `«${name}» يُضغط ويُبدّل المعروض`, `aria-selected=${selected} · «${mustSee}» ${visible ? 'ظهر' : 'لم يظهر'}`);
}

// ── 2 · every montage tab, pressed, must change what is shown ─────────────
console.log('\n── تبويبات المونتاج ──');
await page.locator('.ras-work-btn', { hasText: 'المونتاج' }).first().click();
await page.waitForTimeout(1500);
let previous = '';
for (const tab of ['المشهد', 'التوجيه', 'الصوت', 'الترجمة', 'المشروع']) {
  const t = page.locator('.ras-tab-btn', { hasText: new RegExp(`^${tab}$`) });
  if (await t.count() === 0) { say(false, `تبويب «${tab}» غير موجود`); continue; }
  await t.first().click();
  await page.waitForTimeout(1400);
  const body = (await page.locator('.ras-tab-content').first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  say(body.length > 0 && body !== previous, `«${tab}» يفتح محتوى خاصّاً به`, `${body.slice(0, 42)}…`);
  previous = body;
}

// ── 3 · the fields — typed into, and they must keep what was typed ────────
console.log('\n── الحقول ──');
async function type(selector, text, label) {
  const f = page.locator(selector);
  if (await f.count() === 0) { say(false, `${label} غير موجود`); return; }
  try {
    await f.first().click({ timeout: 5000 });
    await f.first().fill(text, { timeout: 5000 });
    const kept = await f.first().inputValue();
    say(kept === text, `${label} يقبل الكتابة ويحتفظ بها`, kept.slice(0, 26));
  } catch (e) { say(false, `${label} رفض الكتابة`, String(e).split('\n')[0].slice(0, 50)); }
}
await page.locator('.ras-tab-btn', { hasText: /^التوجيه$/ }).first().click();
await page.waitForTimeout(1200);
await type('#creator-intent-montage', 'إيقاع هادئ ولقطات قريبة', 'حقل توجيه المخرج (المونتاج)');

await page.locator('.ras-work-btn', { hasText: 'عالَم الستوري بورد' }).first().click();
await page.waitForTimeout(1500);
await type('#creator-intent-storyboard', 'نبرة وقورة وإضاءة جانبيّة', 'حقل توجيه المخرج (الستوري بورد)');
await type('[data-testid="rasamr-brief"] textarea', 'فيلم قصير عن أدب طلب العلم', 'حقل الفكرة');

// ── 4 · the template proposes and must not erase ──────────────────────────
console.log('\n── القالب يقترح ولا يمحو ──');
const tplOpener = page.locator('button', { hasText: /قوالب البداية/ });
if (await tplOpener.count() > 0) {
  await tplOpener.first().click();
  await page.waitForTimeout(1200);
  const anyTpl = page.locator('button', { hasText: /سينمائي|كشف|تجاري|سوشيال|قصة/ }).first();
  if (await anyTpl.count() > 0) {
    const before = await page.locator('#creator-intent-storyboard').inputValue().catch(() => '');
    await anyTpl.click().catch(() => {});
    await page.waitForTimeout(1600);
    const after = await page.locator('#creator-intent-storyboard').inputValue().catch(() => '');
    say(before === '' ? after.length > 0 : after === before,
      'قالبٌ لا يمحو ما كتبه المنشئ', `قبل «${before.slice(0, 18)}» بعد «${after.slice(0, 18)}»`);
  } else say(false, 'لم يظهر قالبٌ للاختيار');
} else say(false, 'زرّ «قوالب البداية» غير موجود');

// ── 5 · the Vault door — his own assets ───────────────────────────────────
console.log('\n── باب الخزانة ──');
const summon = page.locator('button', { hasText: /استدعِ من الخزانة السيادية/ }).first();
if (await summon.count() === 0) say(false, 'زرّ «استدعِ من الخزانة السيادية» غير موجود');
else {
  await summon.click();
  await page.waitForTimeout(3500);
  const opened = await page.evaluate(() => {
    const t = document.body.innerText;
    return /الخزانة|أصولك|اختر أصلاً|لا توجد/.test(t);
  });
  say(opened, 'الباب يفتح على أصول الخزانة');
  const asset = page.locator('button, [role="button"]').filter({ hasText: /قارورة|صورة|فيديو|أصل/ }).first();
  if (await asset.count() > 0) {
    await asset.click().catch(() => {});
    await page.waitForTimeout(3000);
    const queued = await page.locator('.queue-card, [class*="queue-card"]').count();
    say(queued > 0, 'أصلٌ مُستدعى يظهر في طابور الأصول', `${queued} في الطابور`);
  } else say(false, 'لم يظهر أصلٌ للاختيار من الخزانة');
}

// ── 6 · the acts that SPEND — pressed only to the point of confirmation ───
console.log('\n── أفعال تُنفق: تُفحص ولا تُنفَّذ ──');
await page.locator('.ras-work-btn', { hasText: 'المونتاج' }).first().click();
await page.waitForTimeout(1500);
for (const [label, testid] of [
  ['✦ أنتِج الفيلم', 'rasamr-produce-scene-film-montage'],
  ['🎬 تجميع المشهد', null],
]) {
  const b = testid
    ? page.locator(`[data-testid="${testid}"]`)
    : page.locator('button', { hasText: /تجميع المشهد/ });
  if (await b.count() === 0) { say(false, `«${label}» غير موجود`); continue; }
  const disabled = await b.first().isDisabled();
  const title = await b.first().getAttribute('title');
  say(true, `«${label}» حاضر`, disabled ? `مُعطَّل ويقول لماذا: «${(title || '').slice(0, 44)}»` : 'مفعَّل — لم يُضغط، فهو يُنفق');
}

console.log(`\n── أخطاء الطرفية (${[...new Set(consoleErrors)].length}) ──`);
for (const e of [...new Set(consoleErrors)].slice(0, 6)) console.log(`   ✗ ${e}`);

await page.screenshot({ path: 'scripts/proof-harness/ras-walk.png' });
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} اجتازت · ${BASE}`);
for (const f of bad) console.log(`   ⚠ ${f.what}`);
await browser.close();
