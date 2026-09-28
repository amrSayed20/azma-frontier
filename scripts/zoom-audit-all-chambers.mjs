/**
 * AZMA OS — «مشكلة zoom بالمتصفّح في أكثر من حجرة ومنهم رأس الأمر».
 *
 * رأس الأمر was measured and repaired. «أكثر من حجرة» was not, so this asks
 * the same question of every room: at a viewport browser zoom actually
 * produces, is anything clipped with no way to scroll to it?
 */
import { chromium } from 'playwright';
const BASE = process.argv[2] ?? 'https://azmaos.com';
const CHAMBERS = [
  ['قلب الإمبراطورية', '/imperial-foyer'],
  ['القيامة', '/qiyamah-chamber'],
  ['الحجّة الدامغة', '/hujjah-al-damighah'],
  ['قصر الخزانة', '/sovereign-vault-palace'],
  ['الخزانة', '/sovereign-vault'],
  ['مكمن الغاية', '/makman-al-ghayah'],
  ['المجلس الأعلى', '/sovereign-high-council'],
  ['ميزان القيمة', '/sovereign-balance'],
];
const b = await chromium.launch();

/**
 * One login, reused.
 *
 * The first version of this audit logged in once per viewport per chamber —
 * twenty-four times — over a link that had already dropped three deployments,
 * and it died on an ECONNRESET at the third. The measurement was sound; the
 * way it asked for permission to make it was not.
 */
async function signedInState() {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const c = await b.newContext();
    try {
      const r = await c.request.post(`${BASE}/api/auth/login`, {
        data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
        timeout: 30000,
      });
      if (r.ok()) { const state = await c.storageState(); await c.close(); return state; }
      console.log(`login attempt ${attempt} → HTTP ${r.status()}`);
    } catch (err) {
      console.log(`login attempt ${attempt} failed — ${String(err).slice(0, 70)}`);
    }
    await c.close();
    await new Promise((r) => setTimeout(r, attempt * 3000));
  }
  throw new Error('could not sign in after four attempts');
}
const STATE = await signedInState();
console.log('signed in once; the session is reused for every measurement');

for (const [name, path] of CHAMBERS) {
  const rows = [];
  for (const [label, w, h] of [['100%', 1440, 900], ['125%', 1152, 720], ['150%', 960, 600]]) {
    const c = await b.newContext({ locale: 'ar-EG', viewport: { width: w, height: h }, storageState: STATE });
    const p = await c.newPage();
    try {
      await p.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await p.waitForTimeout(5000);
      const e = p.locator('button', { hasText: 'ادخل الحجرة' });
      if (await e.count() > 0) { await e.first().click().catch(() => {}); await p.waitForTimeout(2500); }
      const m = await p.evaluate(() => {
        const de = document.documentElement;
        const pageScrolls = de.scrollHeight > window.innerHeight + 4;
        const trapped = [];
        for (const el of document.querySelectorAll('*')) {
          const over = el.scrollHeight - el.clientHeight;
          if (over < 24) continue;
          const s = getComputedStyle(el);
          if (['auto', 'scroll'].includes(s.overflowY)) continue;
          // CORRECTED: the root element always reports overflow when a page is
          // longer than the window, and it is the PAGE SCROLL that resolves it.
          // Reporting it as trapped named every ordinary long page a defect and
          // buried the three rooms that really are trapped.
          if ((el === de || el === document.body) && pageScrolls) continue;
          // A decorative layer carries no content a hand needs to reach.
          if (el.getAttribute('aria-hidden') === 'true') continue;
          if (s.pointerEvents === 'none' && (el.textContent || '').trim().length === 0) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 80 || r.height < 60) continue;
          // Only content actually inside the visible page counts.
          if (r.top > window.innerHeight || r.bottom < 0) continue;
          trapped.push({ sel: el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0], over });
        }
        trapped.sort((a, z) => z.over - a.over);
        return {
          pageScrolls: de.scrollHeight > window.innerHeight + 4
            && ['auto', 'scroll', 'visible'].includes(getComputedStyle(document.body).overflowY),
          bodyOverflow: getComputedStyle(document.body).overflowY,
          worst: trapped.slice(0, 3),
          trappedCount: trapped.length,
        };
      });
      rows.push({ label, ...m });
    } catch (err) {
      rows.push({ label, error: String(err).split('\n')[0].slice(0, 60) });
    }
    await c.close();
  }
  const bad = rows.filter(r => r.trappedCount > 0);
  console.log(`\n▣ ${name}  ${path}`);
  for (const r of rows) {
    if (r.error) { console.log(`   ${r.label}: ⚠ ${r.error}`); continue; }
    const worst = r.worst.map(w => `${w.sel} (${w.over}px)`).join(' · ');
    console.log(`   ${r.label}: ${r.trappedCount === 0 ? '▸ لا شيء محبوس' : `⚠ ${r.trappedCount} عنصراً محبوساً — ${worst}`}  · body:${r.bodyOverflow} · الصفحة ${r.pageScrolls ? 'تُمرَّر' : 'لا تُمرَّر'}`);
  }
  if (bad.length === 0) console.log('   ✓ سليمة عند كل مقاس');
}
await b.close();
