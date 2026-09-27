/**
 * AZMA OS — NOTE ٤: «حقل توجيه المخرج لا يستجيب للكتابة».
 *
 * Every tab of the montage workspace is opened, every field in it is listed,
 * and every one of them is actually typed into. A field that refuses is named
 * with the reason the browser gives.
 *
 * Note ٣ is answered in the same pass: whether a produce control exists in
 * المونتاج, where a Creator arranges — not only in ✦ الإنتاج, which they must
 * already know to open.
 */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'https://azmaos.com';
const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1440, height: 900 } });
const r = await context.request.post(`${BASE}/api/auth/login`, {
  data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
});
console.log(`login → HTTP ${r.status()}\n`);

const page = await context.newPage();
await page.goto(`${BASE}/ras-amr`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
const enter = page.locator('button', { hasText: 'ادخل الحجرة' });
if (await enter.count() > 0) { await enter.first().click(); await page.waitForTimeout(2000); }

// ── NOTE ٣ · what المونتاج offers once something is arranged ───────────────
const montageProduce = await page.evaluate(() => {
  const want = ['أنتِج', 'أنتج', 'إنتاج', 'اعتمد', 'صدّر', 'جمّع', 'تجميع'];
  return [...document.querySelectorAll('button')]
    .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
    .map((b) => (b.innerText || '').replace(/\s+/g, ' ').trim())
    .filter((t) => want.some((w) => t.includes(w)));
});
console.log('══ ملاحظة ٣ · ما يعرضه وضع ✂ المونتاج من أفعال الإنتاج ══');
console.log(montageProduce.length ? montageProduce.map((t) => `   ▸ ${t}`).join('\n') : '   ⚠ لا شيء — لا فعل إنتاج واحد حيث يُرتَّب العمل');

// ── NOTE ٤ · every field in every tab ──────────────────────────────────────
console.log('\n\n══ ملاحظة ٤ · كل حقل في كل تبويب ══');
for (const tab of ['المشهد', 'التوجيه', 'الصوت', 'الترجمة', 'المشروع']) {
  const t = page.locator('button', { hasText: new RegExp(`^${tab}$`) });
  if (await t.count() === 0) { console.log(`\n▣ ${tab}: ⚠ التبويب غير موجود`); continue; }
  await t.first().click();
  await page.waitForTimeout(1500);

  const fields = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('input[type="text"], input:not([type]), textarea')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const s = getComputedStyle(el);
      const centre = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      out.push({
        name: (el.placeholder || el.getAttribute('aria-label') || el.id || '(بلا اسم)').slice(0, 50),
        readOnly: el.readOnly,
        disabled: el.disabled,
        pointerEvents: s.pointerEvents,
        covered: centre !== el,
        coveredBy: centre === el ? '' : `${centre?.tagName?.toLowerCase() ?? '?'}.${(centre?.className || '').toString().split(' ')[0]}`,
        onScreen: r.top >= 0 && r.bottom <= window.innerHeight,
      });
    }
    return out;
  });

  console.log(`\n▣ ${tab} — ${fields.length} حقل`);
  for (const f of fields) {
    const flags = [
      f.readOnly ? 'readOnly' : '', f.disabled ? 'disabled' : '',
      f.pointerEvents === 'none' ? 'pointer-events:none' : '',
      f.covered ? `مُغطّى بـ ${f.coveredBy}` : '',
      f.onScreen ? '' : 'خارج الشاشة',
    ].filter(Boolean);
    console.log(`   ${flags.length ? '⚠' : '▫'} «${f.name}»${flags.length ? ' · ' + flags.join(' · ') : ''}`);
  }

  // And actually type.
  const typables = await page.locator('input[type="text"]:visible, textarea:visible').all();
  for (const el of typables) {
    const name = (await el.getAttribute('placeholder')) || (await el.getAttribute('aria-label')) || (await el.getAttribute('id')) || '(بلا اسم)';
    let outcome;
    try {
      await el.click({ timeout: 2500 });
      await el.type('اختبار', { timeout: 3000 });
      const v = await el.inputValue();
      outcome = v.includes('اختبار') ? 'يستجيب' : `⚠ لا يحتفظ بما كُتب (القيمة: «${v.slice(0, 20)}»)`;
    } catch (e) {
      outcome = `⚠ رفض — ${String(e).split('\n')[0].slice(0, 90)}`;
    }
    console.log(`      ${outcome.startsWith('⚠') ? '⚠' : '▸'} كتابة في «${name.slice(0, 40)}» → ${outcome}`);
  }
  await page.screenshot({ path: `scripts/proof-harness/ras-tab-${tab}.png` });
}

await browser.close();
