/**
 * NOTE ٤ in the Founder's own state: arriving from الحُجّة الدامغة with a
 * storyboard, at browser zoom — not in an empty room at 100%.
 */
import { chromium } from 'playwright';
const BASE = process.argv[2] ?? 'https://azmaos.com';
const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ar-EG' });
await context.request.post(`${BASE}/api/auth/login`, {
  data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
});
for (const [label, w, h] of [['100%', 1440, 900], ['125%', 1152, 720], ['150%', 960, 600]]) {
  const page = await context.newPage();
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`${BASE}/ras-amr`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  let e = page.locator('button', { hasText: 'ادخل الحجرة' });
  if (await e.count() > 0) { await e.first().click(); await page.waitForTimeout(1200); }
  await page.evaluate(() => {
    sessionStorage.setItem('azma.transfer.storyboard', JSON.stringify({
      storyboardId: 'sb_probe_note4', sceneCount: 5, questionAr: 'اختبار حالة المؤسس',
    }));
    sessionStorage.removeItem('azma.rasamr.storyboard');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  e = page.locator('button', { hasText: 'ادخل الحجرة' });
  if (await e.count() > 0) { await e.first().click(); await page.waitForTimeout(2000); }

  const m = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('input[type="text"], textarea')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const centre = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      out.push({
        name: (el.placeholder || el.id || '(بلا اسم)').slice(0, 45),
        onScreen: r.top >= 0 && r.bottom <= window.innerHeight,
        covered: centre !== el,
        by: centre === el ? '' : `${centre?.tagName?.toLowerCase()}.${(centre?.className||'').toString().split(' ')[0]}`,
        top: Math.round(r.top), bottom: Math.round(r.bottom),
      });
    }
    const panel = document.querySelector('[data-testid="rasamr-storyboard"]');
    const pr = panel?.getBoundingClientRect();
    return { fields: out, storyboardOnScreen: pr ? pr.top >= 0 && pr.top < window.innerHeight : null,
             storyboardTop: pr ? Math.round(pr.top) : null, vh: window.innerHeight };
  });
  console.log(`\n▣ ${label} (${w}×${h})  لوحة المشاهد: ${m.storyboardOnScreen === null ? 'غير موجودة' : m.storyboardOnScreen ? `داخل الشاشة (top=${m.storyboardTop})` : `⚠ خارج الشاشة (top=${m.storyboardTop} / ${m.vh})`}`);
  for (const f of m.fields) {
    const bad = !f.onScreen || f.covered;
    console.log(`   ${bad ? '⚠' : '▫'} «${f.name}» top=${f.top} bottom=${f.bottom}${f.onScreen ? '' : ' · خارج الشاشة'}${f.covered ? ` · مُغطّى بـ ${f.by}` : ''}`);
  }
  for (const el of await page.locator('input[type="text"]:visible, textarea:visible').all()) {
    const n = (await el.getAttribute('placeholder')) || (await el.getAttribute('id')) || '(بلا اسم)';
    try {
      await el.click({ timeout: 2500 });
      await el.type('اختبار', { timeout: 2500 });
      const v = await el.inputValue();
      console.log(`      ${v.includes('اختبار') ? '▸' : '⚠'} «${n.slice(0,35)}» → ${v.includes('اختبار') ? 'يستجيب' : 'لا يحتفظ'}`);
    } catch (err) {
      console.log(`      ⚠ «${n.slice(0,35)}» → رفض: ${String(err).split('\n')[0].slice(0,80)}`);
    }
  }
  await page.screenshot({ path: `scripts/proof-harness/ras-note4-${w}x${h}.png` });
  await page.close();
}
await browser.close();
