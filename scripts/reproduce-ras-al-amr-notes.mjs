/**
 * AZMA OS — THE FOUNDER'S SIX NOTES ON رأس الأمر, REPRODUCED BEFORE REPAIR.
 *
 *   2026-09-28, verbatim:
 *     ١ مشكلة zoom بالمتصفّح في أكثر من حجرة ومنهم رأس الأمر
 *     ٢ القائمتان الجانبيتان الاسكرول متوقّف وباقي القائمة أسفل الشاشة
 *     ٣ لا يوجد زرّ لإنتاج الأصل بعد ترتيبه
 *     ٤ حقل توجيه المخرج لا يستجيب للكتابة
 *     ٥ خرجتُ من الحجّة الدامغة بمطالبة إنشاء ستوري بورد ولم أجدها في رأس الأمر
 *     ٦ أخذتُ أصلاً من الخزانة لأذهب به إلى رأس الأمر فلم يأتِ هناك
 *
 * Nothing is repaired here. This says which of them the running release
 * actually does, and at what size it starts doing it.
 *
 *   AZMA_VERIFY_EMAIL=… AZMA_VERIFY_PASSWORD=… node scripts/reproduce-ras-al-amr-notes.mjs [baseUrl]
 */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'https://azmaos.com';
const email = process.env.AZMA_VERIFY_EMAIL;
const password = process.env.AZMA_VERIFY_PASSWORD;

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1440, height: 900 } });
if (email && password) {
  const r = await context.request.post(`${BASE}/api/auth/login`, { data: { email, password } });
  console.log(`login → HTTP ${r.status()}\n`);
}

const say = (s) => console.log(s);
const open = async (page) => {
  await page.goto(`${BASE}/ras-amr`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const enter = page.locator('button', { hasText: 'ادخل الحجرة' });
  if (await enter.count() > 0) { await enter.first().click(); await page.waitForTimeout(2500); }
};

// ═══ NOTES ١ + ٢ · the rails clip, and nothing scrolls ════════════════════
// Browser zoom shrinks the CSS viewport: 125% on a 1440×900 screen IS a
// 1152×720 viewport. So zoom is measured by measuring smaller windows.
say('══ ملاحظة ١ + ٢ · الحواف المقصوصة والتمرير المتوقّف ══');
for (const [label, width, height] of [
  ['100% (1440×900)', 1440, 900],
  ['125% (1152×720)', 1152, 720],
  ['150% ( 960×600)',  960, 600],
  ['لابتوب 768',      1366, 768],
]) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height });
  await open(page);
  const m = await page.evaluate(() => {
    const read = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        clipped: el.scrollHeight - el.clientHeight,
        overflowY: s.overflowY,
        canScroll: (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight,
        h: el.clientHeight,
      };
    };
    return {
      left: read('.ras-panel-left'),
      right: read('.ras-panel-right'),
      centre: read('.ras-center'),
      bodyOverflow: getComputedStyle(document.body).overflowY,
      pageScrolls: document.documentElement.scrollHeight > window.innerHeight,
    };
  });
  const line = (name, r) => r
    ? `      ${name}: مقصوص ${r.clipped}px · overflow-y:${r.overflowY} · ${r.canScroll ? 'يُمرَّر' : (r.clipped > 0 ? '⚠ لا يُمرَّر' : 'لا قصّ')}`
    : `      ${name}: غير موجود`;
  say(`\n   ▣ ${label}   (body overflow-y: ${m.bodyOverflow} · الصفحة ${m.pageScrolls ? 'تُمرَّر' : 'لا تُمرَّر'})`);
  say(line('الشريط الأيمن (الأصول)', m.right));
  say(line('الشريط الأيسر (الأوامر)', m.left));
  say(line('الوسط', m.centre));
  if (width === 1152) await page.screenshot({ path: 'scripts/proof-harness/ras-zoom-125.png' });
  if (width === 960) await page.screenshot({ path: 'scripts/proof-harness/ras-zoom-150.png' });
  await page.close();
}

// ═══ NOTES ٣ + ٤ · the produce button, and the director's field ═══════════
const page = await context.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await open(page);

say('\n\n══ ملاحظة ٣ · زرّ الإنتاج بعد الترتيب ══');
const prodTab = page.locator('button', { hasText: 'الإنتاج' }).first();
if (await prodTab.count() > 0) { await prodTab.click(); await page.waitForTimeout(2000); }
const produce = await page.evaluate(() => {
  const words = ['أنتج', 'إنتاج', 'اعتمد', 'صدّر', 'جمّع', 'ابدأ الترميز', 'أودِع'];
  const out = [];
  for (const b of document.querySelectorAll('button')) {
    const r = b.getBoundingClientRect();
    const t = (b.innerText || '').replace(/\s+/g, ' ').trim();
    if (!t) continue;
    if (!words.some((w) => t.includes(w))) continue;
    out.push({
      label: t.slice(0, 50),
      disabled: b.disabled,
      visible: r.width > 0 && r.height > 0,
      // Is it inside the part of the screen a Creator can actually see?
      onScreen: r.top >= 0 && r.bottom <= window.innerHeight,
      top: Math.round(r.top),
    });
  }
  return out;
});
if (produce.length === 0) say('   ⚠ لا يوجد أي زرّ يحمل معنى الإنتاج في تبويب ✦ الإنتاج');
for (const p of produce) {
  say(`   ${p.disabled ? '✕' : '▸'} «${p.label}» · ${p.visible ? 'ظاهر' : 'مخفي'} · ${p.onScreen ? 'داخل الشاشة' : `⚠ خارج الشاشة (top=${p.top}px)`}${p.disabled ? ' · مُعطّل' : ''}`);
}

say('\n══ ملاحظة ٤ · حقل توجيه المخرج ══');
const fields = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('input[type="text"], textarea')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const s = getComputedStyle(el);
    out.push({
      tag: el.tagName.toLowerCase(),
      label: (el.placeholder || el.getAttribute('aria-label') || el.id || '').slice(0, 55),
      readOnly: el.readOnly,
      disabled: el.disabled,
      pointerEvents: s.pointerEvents,
      // A control covered by something else takes no keystrokes either.
      topElementIsSelf: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === el,
    });
  }
  return out;
});
for (const f of fields) {
  const suspect = f.readOnly || f.disabled || f.pointerEvents === 'none' || !f.topElementIsSelf;
  say(`   ${suspect ? '⚠' : '▫'} ${f.tag} «${f.label}»${f.readOnly ? ' readOnly' : ''}${f.disabled ? ' disabled' : ''}${f.pointerEvents === 'none' ? ' pointer-events:none' : ''}${f.topElementIsSelf ? '' : ' ⚠ مُغطّى بعنصر آخر'}`);
}
// And actually try to type into each one.
say('\n   — تجربة كتابة فعلية —');
const typables = await page.locator('input[type="text"]:visible, textarea:visible').all();
for (const el of typables) {
  const name = (await el.getAttribute('placeholder')) || (await el.getAttribute('aria-label')) || (await el.getAttribute('id')) || '(بلا اسم)';
  let outcome;
  try {
    await el.fill('اختبار', { timeout: 3000 });
    outcome = (await el.inputValue()) === 'اختبار' ? 'يستجيب' : '⚠ لا يحتفظ بما كُتب';
  } catch (e) {
    outcome = `⚠ رفض الكتابة — ${String(e).split('\n')[0].slice(0, 80)}`;
  }
  say(`   ${outcome.startsWith('⚠') ? '⚠' : '▸'} «${name.slice(0, 45)}» → ${outcome}`);
}

// ═══ NOTES ٥ + ٦ · what arrives from elsewhere ════════════════════════════
say('\n\n══ ملاحظة ٥ + ٦ · ما يصل من الحجّة الدامغة ومن الخزانة ══');
const arrivals = await page.evaluate(() => {
  const keys = [];
  for (const store of [sessionStorage, localStorage]) {
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (!k) continue;
      const v = store.getItem(k) ?? '';
      keys.push(`${store === sessionStorage ? 'session' : 'local'}:${k} = ${v.slice(0, 90)}`);
    }
  }
  return keys;
});
say(`   مفاتيح الحالة المحفوظة (${arrivals.length}):`);
for (const a of arrivals) say(`      · ${a}`);

// Does the room read a handoff at all?
const handoff = await page.evaluate(() => {
  const params = new URL(location.href).searchParams;
  return [...params.entries()].map(([k, v]) => `${k}=${v}`);
});
say(`   وسائط العنوان: ${handoff.length ? handoff.join(' · ') : '(لا شيء)'}`);

await page.screenshot({ path: 'scripts/proof-harness/ras-production-tab.png', fullPage: false });
await browser.close();
