/**
 * AZMA OS — «اختبر جميع الشاشات».
 *
 * Every room, on every screen the Empire can actually be opened on: real
 * phones portrait and landscape, a tablet both ways, the laptops people own,
 * the viewports browser zoom produces, and a full desktop.
 *
 * Three questions, and each is a thing a hand either can or cannot do:
 *
 *   ١ · is anything clipped with no way to scroll to it
 *   ٢ · is the page forced to scroll SIDEWAYS
 *   ٣ · is a control too small for a finger (44px, Apple's and Google's floor)
 *
 * The touch floor is only asked of touch screens: a mouse hits a 24px button
 * that a thumb cannot, and reporting it everywhere would bury the real ones.
 *
 *   AZMA_VERIFY_EMAIL=… AZMA_VERIFY_PASSWORD=… node scripts/screen-audit-all.mjs [baseUrl]
 */

import { chromium, devices } from 'playwright';

const BASE = process.argv[2] ?? 'https://azmaos.com';

const CHAMBERS = [
  ['البوّابة', '/'],
  ['قلب الإمبراطورية', '/imperial-foyer'],
  ['القيامة', '/qiyamah-chamber'],
  ['الحجّة الدامغة', '/hujjah-al-damighah'],
  ['رأس الأمر', '/ras-amr'],
  ['قصر الخزانة', '/sovereign-vault-palace'],
  ['الخزانة', '/sovereign-vault'],
  ['مكمن الغاية', '/makman-al-ghayah'],
  ['ميزان القيمة', '/sovereign-balance'],
];

const SCREENS = [
  // ── touch ────────────────────────────────────────────────────────────────
  ['هاتف صغير',      { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ['آيفون',          { ...devices['iPhone 13'] }],
  ['أندرويد',        { ...devices['Pixel 5'] }],
  ['هاتف بالعرض',    { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }],
  ['لوح بالطول',     { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ['لوح بالعرض',     { viewport: { width: 1180, height: 820 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  // ── pointer ──────────────────────────────────────────────────────────────
  ['لابتوب 768',     { viewport: { width: 1366, height: 768 } }],
  ['لابتوب 720',     { viewport: { width: 1280, height: 720 } }],
  ['مكتبي',          { viewport: { width: 1440, height: 900 } }],
  ['شاشة كبيرة',     { viewport: { width: 1920, height: 1080 } }],
  ['زوم ١٢٥٪',       { viewport: { width: 1152, height: 720 } }],
  ['زوم ١٥٠٪',       { viewport: { width: 960, height: 600 } }],
  ['زوم ١٧٥٪',       { viewport: { width: 823, height: 514 } }],
];

const TOUCH_FLOOR = 44;
const browser = await chromium.launch();

async function signedInState() {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const c = await browser.newContext();
    try {
      const r = await c.request.post(`${BASE}/api/auth/login`, {
        data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
        timeout: 30000,
      });
      if (r.ok()) { const s = await c.storageState(); await c.close(); return s; }
    } catch { /* the link drops; ask again */ }
    await c.close();
    await new Promise((r) => setTimeout(r, attempt * 3000));
  }
  throw new Error('could not sign in');
}
const STATE = await signedInState();
console.log(`signed in once · ${BASE}`);

const MEASURE = ({ floor, isTouch }) => {
  const de = document.documentElement;
  const pageScrolls = de.scrollHeight > window.innerHeight + 4;

  const trapped = [];
  for (const el of document.querySelectorAll('*')) {
    const over = el.scrollHeight - el.clientHeight;
    if (over < 24) continue;
    const s = getComputedStyle(el);
    if (['auto', 'scroll'].includes(s.overflowY)) continue;
    if ((el === de || el === document.body) && pageScrolls) continue;
    if (el.getAttribute('aria-hidden') === 'true') continue;
    if (s.pointerEvents === 'none' && (el.textContent || '').trim().length === 0) continue;
    const eb = el.getBoundingClientRect();
    const inFlowOverflows = [...el.children].some((k) => {
      if (getComputedStyle(k).position === 'absolute') return false;
      if ((k.textContent || '').trim().length === 0 && k.children.length === 0) return false;
      return k.getBoundingClientRect().bottom > eb.bottom + 2;
    });
    if (!inFlowOverflows) continue;
    if (eb.width < 80 || eb.height < 60) continue;
    if (eb.top > window.innerHeight || eb.bottom < 0) continue;
    trapped.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} (${over}px)`);
  }

  const sideways = Math.max(0, de.scrollWidth - de.clientWidth);
  const widest = [];
  if (sideways > 2) {
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.right > de.clientWidth + 2 && r.width > 40) {
        widest.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} (+${Math.round(r.right - de.clientWidth)}px)`);
      }
    }
  }

  const small = [];
  if (isTouch) {
    for (const el of document.querySelectorAll('button, a[href], input, select, textarea, [role="button"]')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.top > window.innerHeight || r.bottom < 0) continue;
      if (r.height >= floor && r.width >= floor) continue;
      const label = (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 20);
      small.push(`«${label || el.tagName.toLowerCase()}» ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
  }

  return {
    trapped: [...new Set(trapped)].slice(0, 3), trappedCount: trapped.length,
    sideways, widest: [...new Set(widest)].slice(0, 3),
    small: [...new Set(small)].slice(0, 3), smallCount: small.length,
  };
};

const findings = [];
/** Measurements that could not be made. A clean report may not be printed while this is non-empty. */
const failures = [];
let measured = 0;

for (const [screenName, screen] of SCREENS) {
  const isTouch = !!screen.hasTouch;
  const { width, height } = screen.viewport;
  console.log(`\n════ ${screenName} · ${width}×${height}${isTouch ? ' · لمس' : ''} ════`);
  const context = await browser.newContext({ ...screen, locale: 'ar-EG', storageState: STATE });
  const page = await context.newPage();
  for (const [name, path] of CHAMBERS) {
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(4500);
      const enter = page.locator('button', { hasText: 'ادخل الحجرة' });
      if (await enter.count() > 0) { await enter.first().click().catch(() => {}); await page.waitForTimeout(1800); }
      const m = await page.evaluate(MEASURE, { floor: TOUCH_FLOOR, isTouch });
      measured += 1;

      const problems = [];
      if (m.trappedCount > 0) problems.push(`محبوس (${m.trappedCount}): ${m.trapped.join(' · ')}`);
      if (m.sideways > 2) problems.push(`تمرير أفقي ${m.sideways}px: ${m.widest.join(' · ')}`);
      if (m.smallCount > 0) problems.push(`أصغر من ${TOUCH_FLOOR}px (${m.smallCount}): ${m.small.join(' · ')}`);

      if (problems.length === 0) console.log(`  ▸ ${name}`);
      else {
        console.log(`  ⚠ ${name}`);
        for (const pr of problems) console.log(`      ${pr}`);
        findings.push({ screen: screenName, name, problems });
      }
    } catch (err) {
      // COUNTED, not merely printed. The first run of this audit threw on
      // every single page — `page.evaluate` takes ONE argument and I passed
      // two — and then printed «كل الحجرات سليمة على كل الشاشات», because
      // `findings` stayed empty while nothing had been measured at all.
      // An instrument that reports success for a measurement it failed to
      // make is worse than no instrument: it closes the question.
      console.log(`  ‼ ${name} — ${String(err).split('\n')[0].slice(0, 70)}`);
      failures.push({ screen: screenName, name, error: String(err).split('\n')[0].slice(0, 90) });
    }
  }
  await context.close();
}

console.log('\n\n══════════ الخلاصة ══════════');
const expected = SCREENS.length * CHAMBERS.length;
console.log(`قِيست ${measured} من ${expected} · فشل القياس في ${failures.length}`);
if (failures.length > 0) {
  console.log('\n⚠⚠ هذه النتيجة لا تُقرأ سلامةً: قياساتٌ لم تتمّ.');
  for (const f of failures.slice(0, 12)) console.log(`   ‼ ${f.screen} · ${f.name} — ${f.error}`);
}
if (findings.length === 0 && failures.length === 0) console.log('\nكل الحجرات سليمة على كل الشاشات.');
else if (findings.length === 0) console.log('\nلم تُسجَّل ملاحظة — لكنّ القياس ناقص، فلا حكم.');
else {
  const byRoom = new Map();
  for (const f of findings) {
    if (!byRoom.has(f.name)) byRoom.set(f.name, []);
    byRoom.get(f.name).push(f);
  }
  for (const [room, list] of byRoom) {
    console.log(`\n▣ ${room} — ${list.length} شاشة`);
    for (const f of list) console.log(`   ${f.screen}: ${f.problems.join(' | ')}`);
  }
}
await browser.close();
