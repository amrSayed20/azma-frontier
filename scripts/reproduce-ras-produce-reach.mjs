/**
 * AZMA OS — IS THE PRODUCE BUTTON REACHABLE FROM WHERE THE CREATOR SITS?
 *
 * Note ٣ («لا يوجد زرّ لإنتاج الأصل بعد ترتيبه») and note ٢ («الاسكرول متوقّف
 * وباقي القائمة أسفل الشاشة») may be one defect: «✦ أنتِج الفيلم» lives in the
 * left rail, and the left rail is `overflow: hidden`. A control below the fold
 * of a rail that cannot scroll is a control that does not exist.
 */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'https://azmaos.com';
const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ar-EG' });
const r = await context.request.post(`${BASE}/api/auth/login`, {
  data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
});
console.log(`login → HTTP ${r.status()}\n`);

for (const [label, width, height] of [
  ['100%  1440×900', 1440, 900],
  ['125%  1152×720', 1152, 720],
  ['150%   960×600', 960, 600],
  ['laptop 1366×768', 1366, 768],
]) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height });
  await page.goto(`${BASE}/ras-amr`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const enter = page.locator('button', { hasText: 'ادخل الحجرة' });
  if (await enter.count() > 0) { await enter.first().click(); await page.waitForTimeout(2000); }

  // Enter the production mode the way a Creator does.
  const prod = page.locator('button', { hasText: '✦ الإنتاج' });
  const switched = await prod.count() > 0;
  if (switched) { await prod.first().click(); await page.waitForTimeout(2000); }

  const m = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="rasamr-produce-scene-film-section"]');
    const rail = document.querySelector('.ras-panel-left');
    if (!btn || !rail) return { found: !!btn, rail: !!rail };
    const b = btn.getBoundingClientRect();
    const r = rail.getBoundingClientRect();
    return {
      found: true,
      rail: true,
      label: (btn.innerText || '').trim(),
      disabled: btn.disabled,
      buttonBottom: Math.round(b.bottom),
      railBottom: Math.round(r.bottom),
      viewportHeight: window.innerHeight,
      // Inside the rail's visible box?
      insideRail: b.top >= r.top && b.bottom <= r.bottom,
      onScreen: b.top >= 0 && b.bottom <= window.innerHeight,
      railClipped: rail.scrollHeight - rail.clientHeight,
      railCanScroll: ['auto', 'scroll'].includes(getComputedStyle(rail).overflowY),
      // The decisive question: can a Creator bring it into view at all?
      reachable: (b.top >= r.top && b.bottom <= r.bottom)
        || ['auto', 'scroll'].includes(getComputedStyle(rail).overflowY),
    };
  });

  console.log(`▣ ${label}  (تبويب الإنتاج: ${switched ? 'فُتح' : 'لم يوجد'})`);
  if (!m.found) { console.log('   ⚠ زرّ «أنتِج الفيلم» غير موجود في DOM أصلاً\n'); await page.close(); continue; }
  console.log(`   الزرّ: «${m.label}»${m.disabled ? ' · مُعطّل' : ''}`);
  console.log(`   أسفل الزرّ ${m.buttonBottom}px · أسفل الشريط ${m.railBottom}px · ارتفاع النافذة ${m.viewportHeight}px`);
  console.log(`   داخل الشريط المرئي: ${m.insideRail ? 'نعم' : '⚠ لا'} · داخل الشاشة: ${m.onScreen ? 'نعم' : '⚠ لا'}`);
  console.log(`   الشريط مقصوص ${m.railClipped}px · يُمرَّر: ${m.railCanScroll ? 'نعم' : '⚠ لا'}`);
  console.log(`   ${m.reachable ? '▸ يمكن الوصول إليه' : '⚠⚠ لا سبيل للوصول إليه — الزرّ موجود ولا يُرى ولا يُمرَّر إليه'}\n`);

  await page.screenshot({ path: `scripts/proof-harness/ras-produce-${width}x${height}.png` });
  await page.close();
}

await browser.close();
