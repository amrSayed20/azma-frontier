/**
 * AZMA OS — DOES WHAT CROSSES THE DOOR ARRIVE WHERE THE CREATOR IS LOOKING?
 *
 * Notes ٥ and ٦ reproduced by writing the exact envelopes the two senders
 * write — الحُجّة الدامغة's storyboard crossing and the Palace's treasure —
 * and then opening the Chamber the way a Creator arrives after the crossing.
 */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'https://azmaos.com';
const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1440, height: 900 } });
const r = await context.request.post(`${BASE}/api/auth/login`, {
  data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
});
console.log(`login → HTTP ${r.status()}\n`);

const say = (s) => console.log(s);

async function crossing(label, writes, thenLook) {
  const page = await context.newPage();
  // Land on the Chamber's own origin first so sessionStorage is writable,
  // then write exactly what the sender writes and re-enter as a crossing does.
  await page.goto(`${BASE}/ras-amr`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const enter = page.locator('button', { hasText: 'ادخل الحجرة' });
  if (await enter.count() > 0) { await enter.first().click(); await page.waitForTimeout(1500); }

  await page.evaluate((w) => {
    for (const [k, v] of Object.entries(w)) sessionStorage.setItem(k, v);
    // The Chamber keeps its own copy of a storyboard; clear it so this
    // measures the CROSSING and not a leftover.
    if (!('azma.rasamr.storyboard' in w)) sessionStorage.removeItem('azma.rasamr.storyboard');
  }, writes);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const enter2 = page.locator('button', { hasText: 'ادخل الحجرة' });
  if (await enter2.count() > 0) { await enter2.first().click(); await page.waitForTimeout(2500); }

  say(`\n══ ${label} ══`);
  const seen = await page.evaluate(thenLook);
  for (const [k, v] of Object.entries(seen)) say(`   ${v === true ? '▸' : v === false ? '⚠' : '·'} ${k}: ${v}`);
  await page.screenshot({ path: `scripts/proof-harness/ras-arrival-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png` });
  await page.close();
  return seen;
}

// ── NOTE ٥ · the storyboard from الحُجّة الدامغة ───────────────────────────
await crossing('storyboard crossing', {
  'azma.transfer.storyboard': JSON.stringify({
    storyboardId: 'sb_probe_reproduction',
    sceneCount: 5,
    questionAr: 'اختبار وصول المشاهد',
  }),
}, () => {
  const panel = document.querySelector('[data-testid="rasamr-storyboard"]');
  const vis = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const onScreen = (el) => {
    if (!vis(el)) return false;
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.top < window.innerHeight;
  };
  const activeTab = [...document.querySelectorAll('button')]
    .filter((b) => b.className.includes('active') || b.getAttribute('aria-selected') === 'true')
    .map((b) => (b.innerText || '').trim()).join(' · ');
  return {
    'اللوحة موجودة في DOM': !!panel,
    'اللوحة مرئية': vis(panel),
    'اللوحة داخل الشاشة': onScreen(panel),
    'التبويبات النشطة': activeTab || '(لا شيء)',
    'نصّ اللوحة': panel ? (panel.innerText || '').replace(/\s+/g, ' ').slice(0, 90) : '—',
  };
});

// ── NOTE ٦ · the treasure from the Palace, complete and incomplete ────────
const complete = {
  id: 'probe_treasure_1', titleAr: 'أصل اختبار', preview: '', origin: 'القصر السيادي',
  vaultId: 'v1', secureStorageUri: '/generated-assets/probe.png',
  assetFamily: 'VISUAL', capabilityTarget: 'VISUAL',
};
const look = () => {
  const items = [...document.querySelectorAll('button, li, div')]
    .filter((e) => (e.innerText || '').includes('أصل اختبار'));
  const visible = items.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
  return {
    'الأصل ظهر في الطابور': visible.length > 0,
    // CORRECTED after the repair: the room now has ONE arrival line, and a
    // check that hunts for a phrase anywhere in the document reports on
    // whatever the page happens to contain. It reads the line itself.
    'الحجرة قالت ما حدث': (() => {
      const n = document.querySelector('.ras-arrival-notice');
      return n ? (n.innerText || '').replace(/\s+/g, ' ').replace(/✕$/, '').trim().slice(0, 110) : false;
    })(),
  };
};

await crossing('treasure complete', {
  'azma.transfer.treasure': JSON.stringify(complete),
  'azma.transfer.origin': 'palace',
}, look);

// The Palace's own type marks mediaUrl, assetFamily and capabilityTarget as
// OPTIONAL. Any one of them missing makes the reader's four-part condition
// false — and the reader has no else branch.
for (const missing of ['secureStorageUri', 'assetFamily', 'capabilityTarget']) {
  const partial = { ...complete };
  delete partial[missing];
  await crossing(`treasure without ${missing}`, {
    'azma.transfer.treasure': JSON.stringify(partial),
    'azma.transfer.origin': 'palace',
  }, look);
}

await browser.close();
