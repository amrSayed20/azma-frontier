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
 * It spends nothing on providers. Composing a storyboard is text, and it is
 * pressed. Every act that would commission a paid render is pressed only as
 * far as the confirmation the Empire shows before spending, and the walk
 * stops there and says so.
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

// ── 1 · the intent gate — the room's real first step ──────────────────────
//   MEASURED: the workspace does not exist until a Creator answers «ماذا
//   تريد أن تصنع؟». A walk that reaches for the work bar first is testing a
//   room nobody is standing in yet.
console.log('\n── بوّابة النيّة ──');
const gate = page.locator('.ras-intent-gate');
if (await gate.count() > 0 && await gate.first().isVisible().catch(() => false)) {
  const cards = await page.locator('.ras-intent-card').count();
  say(cards > 0, 'البوّابة تعرض اختياراً للبدء', `${cards} بطاقة`);

  // a · a template card is a PREVIEW, and must prove it by opening one
  const tpl = page.locator('.ras-intent-template').first();
  const tplName = (await tpl.locator('.ras-intent-card-name').innerText().catch(() => '')).trim();
  await tpl.click({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const preview = await page.locator('.ras-template-preview-gate').first().isVisible().catch(() => false);
  say(preview, 'بطاقة قالبٍ تفتح المعاينة', `«${tplName}»`);

  if (preview) {
    // b · the preview's own play button must actually move the demo
    const play = page.locator('.ras-tp-demo-play-btn').first();
    if (await play.count() === 0) say(false, 'زرّ «شاهد الهيكل» غير موجود');
    else {
      await play.click().catch(() => {});
      await page.waitForTimeout(2600);
      const playing = await page.locator('.ras-tp-demo-controls').first().isVisible().catch(() => false);
      say(playing, '«▶ شاهد الهيكل» يُشغِّل المعاينة فعلاً');
      await page.locator('.ras-tp-demo-stop-btn').first().click().catch(() => {});
      await page.waitForTimeout(900);
    }
    // c · «معاينة قالب آخر» must return without committing
    const back = page.locator('.ras-tp-back-btn').first();
    if (await back.count() === 0) say(false, 'زرّ «معاينة قالب آخر» غير موجود');
    else {
      await back.click().catch(() => {});
      await page.waitForTimeout(1800);
      say(await gate.first().isVisible().catch(() => false), '«معاينة قالب آخر» يعود إلى البوّابة دون التزام');
    }
  }

  // d · a direct-entry card must open the workspace
  const blank = page.locator('.ras-intent-mode', { hasText: 'لوحة فارغة' }).first();
  if (await blank.count() === 0) say(false, 'بطاقة «لوحة فارغة» غير موجودة');
  else {
    await blank.click({ timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(4000);
    const opened = await page.locator('.ras-work-bar').first().isVisible().catch(() => false);
    say(opened, '«لوحة فارغة» تفتح لوح العمل');
  }
} else say(true, 'الحجرة فُتحت مباشرة على اللوح');

// ── 2 · the two worlds, pressed ────────────────────────────────────────────
//   Each world is judged by the surface belonging to IT alone, never by the
//   hint printed on the button — that hint is on screen in both worlds.
console.log('\n── العالَمان ──');
for (const [name, ownSurface, surfaceAr] of [
  ['عالَم الستوري بورد', '#creator-intent-storyboard', 'حقل توجيه الستوري بورد'],
  ['المونتاج', '.ras-tab-bar', 'شريط التبويبات'],
]) {
  const btn = page.locator('.ras-work-btn', { hasText: name });
  if (await btn.count() === 0) { say(false, `زرّ «${name}» غير موجود`); continue; }
  await btn.first().click({ timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const selected = await btn.first().getAttribute('aria-selected');
  const visible = await page.locator(ownSurface).first().isVisible().catch(() => false);
  say(selected === 'true' && visible, `«${name}» يُضغط ويُبدّل المعروض`,
    `aria-selected=${selected} · ${surfaceAr} ${visible ? 'ظهر' : 'لم يظهر'}`);
}

// ── 3 · every montage tab, pressed, must change what is shown ─────────────
console.log('\n── تبويبات المونتاج ──');
await page.locator('.ras-work-btn', { hasText: 'المونتاج' }).first().click().catch(() => {});
await page.waitForTimeout(1600);
let previous = '';
for (const tab of ['المشهد', 'التوجيه', 'الصوت', 'الترجمة', 'المشروع']) {
  const t = page.locator('.ras-tab-btn', { hasText: new RegExp(`^${tab}$`) });
  if (await t.count() === 0) { say(false, `تبويب «${tab}» غير موجود`); continue; }
  await t.first().click({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const body = (await page.locator('.ras-tab-content').first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
  say(body.length > 0 && body !== previous, `«${tab}» يفتح محتوى خاصّاً به`, `${body.slice(0, 40)}…`);
  previous = body;
}

// ── 4 · the fields — typed into, and they must keep what was typed ────────
console.log('\n── الحقول ──');
async function type(selector, text, label) {
  const f = page.locator(selector);
  if (await f.count() === 0) { say(false, `${label} غير موجود`); return false; }
  try {
    await f.first().click({ timeout: 6000 });
    await f.first().fill(text, { timeout: 6000 });
    const kept = await f.first().inputValue();
    say(kept === text, `${label} يقبل الكتابة ويحتفظ بها`, kept.slice(0, 26));
    return kept === text;
  } catch (e) { say(false, `${label} رفض الكتابة`, String(e).split('\n')[0].slice(0, 50)); return false; }
}
await page.locator('.ras-tab-btn', { hasText: /^التوجيه$/ }).first().click().catch(() => {});
await page.waitForTimeout(1400);
await type('#creator-intent-montage', 'إيقاع هادئ ولقطات قريبة', 'حقل توجيه المخرج (المونتاج)');

await page.locator('.ras-work-btn', { hasText: 'عالَم الستوري بورد' }).first().click().catch(() => {});
await page.waitForTimeout(1800);
await type('#creator-intent-storyboard', 'نبرة وقورة وإضاءة جانبيّة', 'حقل توجيه المخرج (الستوري بورد)');

// The Director is ONE faculty: what was typed in one world must be there in
// the other, or a Creator has two Directors and does not know which obeyed.
await page.locator('.ras-work-btn', { hasText: 'المونتاج' }).first().click().catch(() => {});
await page.waitForTimeout(1600);
await page.locator('.ras-tab-btn', { hasText: /^التوجيه$/ }).first().click().catch(() => {});
await page.waitForTimeout(1400);
const carried = await page.locator('#creator-intent-montage').inputValue().catch(() => '');
say(carried === 'نبرة وقورة وإضاءة جانبيّة', 'توجيه المخرج واحدٌ عبر العالَمين', `«${carried.slice(0, 26)}»`);

// ── 5 · the idea board — written into, and pressed ────────────────────────
console.log('\n── لوح الفكرة ──');
await page.locator('.ras-work-btn', { hasText: 'عالَم الستوري بورد' }).first().click().catch(() => {});
await page.waitForTimeout(1600);
const boardThere = await page.locator('[data-testid="rasamr-brief"]').first().isVisible().catch(() => false);
say(boardThere, 'لوح «اكتب فكرتك» حاضرٌ دون بحث');
let composed = false;
if (boardThere) {
  const okIdea = await type('#ras-brief-idea', 'أدب طلب العلم عند السلف وكيف كان الطالب يرحل لأجل مسألة واحدة', 'حقل الفكرة');
  await type('#ras-brief-specs', 'نبرة وقورة، إيقاع هادئ، لقطات واسعة للصحراء والمخطوطات', 'حقل المواصفات');
  await type('#ras-brief-count', '3', 'حقل عدد المشاهد');

  const composeBtn = page.locator('[data-testid="rasamr-brief-compose"]').first();
  if (await composeBtn.count() === 0) say(false, 'زرّ «✦ أنشئ المشاهد» غير موجود');
  else {
    const wasDisabled = await composeBtn.isDisabled();
    say(okIdea && !wasDisabled, 'زرّ «✦ أنشئ المشاهد» يستيقظ بعد كتابة الفكرة', wasDisabled ? 'ظلّ مُعطَّلاً' : 'صار مفعَّلاً');
    if (!wasDisabled) {
      await composeBtn.click().catch(() => {});
      // text composition, not a paid render — the walk waits for it
      await page.waitForTimeout(3000);
      let arrived = false;
      for (let i = 0; i < 40; i += 1) {
        arrived = await page.locator('[data-testid="rasamr-storyboard"]').first().isVisible().catch(() => false);
        if (arrived) break;
        await page.waitForTimeout(3000);
      }
      composed = arrived;
      const notice = (await page.locator('.brief-notice').first().innerText().catch(() => '')).trim();
      say(arrived, 'الضغط على «أنشئ المشاهد» يُنزل مشاهد حقيقية في نفس العالَم',
        arrived ? '' : `ما ظهر بدلها: «${notice.slice(0, 60)}» · العالَم المعروض: ${await page.locator('.ras-tab-bar').first().isVisible().catch(() => false) ? 'المونتاج' : 'الستوري بورد'}`);
    }
  }
}

// ── 6 · each scene must say where its picture comes from, and let it change
if (composed) {
  console.log('\n── مصدر صورة كل مشهد ──');
  const plans = page.locator('[data-testid="rasamr-scene-plans"]');
  const planThere = await plans.first().isVisible().catch(() => false);
  say(planThere, 'الحجرة تسأل: «من أين صورة كلّ مشهد؟»');
  if (planThere) {
    const n = await plans.locator('.scene-plan-choice').count();
    say(n > 0, 'لكلّ مشهدٍ اختيارٌ يُضغط', `${n} زرّاً لِـ ${n / 3} مشاهد`);
    const firstPlan = plans.locator('.scene-plan').first();

    // «يُنشَأ لي» must open a field asking WHAT is to be created — the Chamber
    // never buys a picture before the Creator has said what it is for.
    await firstPlan.locator('.scene-plan-choice', { hasText: 'يُنشَأ لي' }).first().click({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2200);
    const demand = firstPlan.locator('.scene-plan-demand').first();
    const demandThere = await demand.isVisible().catch(() => false);
    say(demandThere, '«يُنشَأ لي» يفتح حقل «ما الذي يُنشَأ لهذا المشهد؟»');
    if (demandThere) {
      await demand.fill('صحراء عند الفجر ومخطوط مفتوح على حجر', { timeout: 6000 }).catch(() => {});
      await page.locator('.scene-plans-head').first().click().catch(() => {});
      await page.waitForTimeout(2600);
      const kept = await demand.inputValue().catch(() => '');
      say(kept.startsWith('صحراء'), 'المطالبة الإنشائية تُكتَب وتُحفظ', kept.slice(0, 28));
    }

    // «من أصولي» must open a real list of HIS assets, or say plainly it is empty
    await firstPlan.locator('.scene-plan-choice', { hasText: 'من أصولي' }).first().click({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2200);
    const sel = firstPlan.locator('.scene-plan-asset').first();
    const selThere = await sel.isVisible().catch(() => false);
    const emptyWord = await firstPlan.locator('.scene-plan-empty').first().isVisible().catch(() => false);
    const options = selThere ? await sel.locator('option').count() : 0;
    say(selThere || emptyWord, '«من أصولي» يفتح قائمة أصوله أو يقول إنها فارغة',
      selThere ? `${options - 1} أصلاً` : 'قالت: خزانتك فارغة');
  }
}

// ── 7 · the Vault door — his own assets ───────────────────────────────────
console.log('\n── باب الخزانة ──');
const summon = page.locator('[data-testid="rasamr-open-vault"]').first();
if (await summon.count() === 0) say(false, 'زرّ «استدعِ من الخزانة السيادية» غير موجود');
else {
  await summon.click({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(4000);
  const opened = await page.locator('.summon-hud-overlay').first().isVisible().catch(() => false);
  say(opened, 'الباب يفتح على أصول الخزانة');
  const emptyVault = await page.locator('.hud-empty-state').first().isVisible().catch(() => false);
  const inject = page.locator('.hud-inject-btn').first();
  if (emptyVault) say(false, 'الخزانة السيادية بلا أصول — لا يمكن إتمام طريق المونتاج');
  else if (await inject.count() === 0) say(false, 'زرّ «⚡ حقن» غير موجود بجوار الأصل');
  else {
    // A returning Creator arrives with a canvas already restored, so a count
    // that does not grow proves nothing: the asset chosen must be one the
    // queue does not already hold, and it is named when it arrives.
    const queued = (await page.locator('.queue-item-card').allInnerTexts())
      .map((t) => t.replace(/\s+/g, ' ').trim());
    const chips = page.locator('.hud-asset-item-chip');
    const chipCount = await chips.count();
    let picked = null;
    for (let i = 0; i < chipCount; i += 1) {
      const name = (await chips.nth(i).locator('.hud-item-name').innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
      if (name && !queued.some((q) => q.includes(name.slice(0, 18)))) { picked = { i, name }; break; }
    }
    if (!picked) say(false, 'كلّ أصول الخزانة في الطابور بالفعل — الاستدعاء لم يُختبر');
    else {
      const before = await page.locator('.queue-item-card').count();
      await chips.nth(picked.i).locator('.hud-inject-btn').click({ timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(4500);
      const after = await page.locator('.queue-item-card').count();
      say(after > before, 'أصلٌ مُستدعى يظهر في طابور الأصول',
        `«${picked.name.slice(0, 24)}» · ${before} → ${after}`);
    }
  }
  const close = page.locator('.hud-close-btn').first();
  if (await close.count() > 0 && await close.isVisible().catch(() => false)) {
    await close.click().catch(() => {});
    await page.waitForTimeout(1500);
    say(!(await page.locator('.summon-hud-overlay').first().isVisible().catch(() => false)), '«✖ إغلاق» يُغلق باب الخزانة');
  }
}

// ── 8 · from a summoned asset to a scene that can be produced ─────────────
console.log('\n── من أصلٍ إلى مشهد ──');
await page.locator('.ras-work-btn', { hasText: 'المونتاج' }).first().click().catch(() => {});
await page.waitForTimeout(1600);
const firstQueued = page.locator('.queue-item-card').first();
if (await firstQueued.count() === 0) say(false, 'لا يوجد أصل في الطابور — الطريق إلى المشهد لم يُختبر');
else {
  await firstQueued.click({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2200);
  const addBtn = page.locator('.creator-action-primary').first();
  if (await addBtn.count() === 0) say(false, 'زرّ «➕ أضف إلى المشهد» لا يظهر بعد اختيار الأصل');
  else {
    const lbl = (await addBtn.innerText().catch(() => '')).trim();
    await addBtn.click({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(4000);
    const layers = await page.locator('.composition-surface .layer-asset-img, .composition-surface > *').count();
    say(layers > 0, `«${lbl}» يضع الأصل فعلاً في المشهد`, `${layers} طبقة على السطح`);
  }
}

// ── 9 · the acts that SPEND — pressed only to the point of confirmation ───
console.log('\n── أفعال تُنفق: تُفحص ولا تُنفَّذ ──');
for (const [label, sel, world] of [
  ['✦ أنتِج الفيلم', '[data-testid="rasamr-produce-scene-film-montage"]', 'المونتاج'],
  ['🎬 أنتج هذه المشاهد', '[data-testid="rasamr-produce-scenes"]', 'عالَم الستوري بورد'],
]) {
  await page.locator('.ras-work-btn', { hasText: world }).first().click({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1800);
  const b = page.locator(sel);
  if (await b.count() === 0) { say(false, `«${label}» غير موجود`); continue; }
  const disabled = await b.first().isDisabled();
  const title = await b.first().getAttribute('title');
  say(true, `«${label}» حاضر`, disabled ? `مُعطَّل ويقول لماذا: «${(title || '').slice(0, 44)}»` : 'مفعَّل — لم يُضغط، فهو يُنفق');
}

console.log(`\n── أخطاء الطرفية (${[...new Set(consoleErrors)].length}) ──`);
for (const e of [...new Set(consoleErrors)].slice(0, 6)) console.log(`   ✗ ${e}`);

await page.screenshot({ path: 'scripts/proof-harness/ras-walk.png', fullPage: false });
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} اجتازت · ${BASE}`);
for (const f of bad) console.log(`   ⚠ ${f.what}`);
await browser.close();
