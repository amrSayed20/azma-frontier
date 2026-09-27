/**
 * AZMA OS — WALKING رأس الأمر AS A CREATOR, AND WRITING DOWN WHAT IS THERE.
 *
 * Not a pass/fail gate: an INVENTORY. It walks the room on the live release
 * and reports what a Creator actually meets — every control, what it says,
 * what the console says back, and what is visibly empty.
 *
 *   AZMA_VERIFY_EMAIL=… AZMA_VERIFY_PASSWORD=… node scripts/measure-ras-al-amr.mjs [baseUrl]
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = process.argv[2] ?? 'https://azmaos.com';
const email = process.env.AZMA_VERIFY_EMAIL;
const password = process.env.AZMA_VERIFY_PASSWORD;

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1440, height: 900 } });

if (email && password) {
  const r = await context.request.post(`${BASE}/api/auth/login`, { data: { email, password } });
  console.log(`login → HTTP ${r.status()}`);
}

const page = await context.newPage();
const consoleErrors = [];
const failedRequests = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 220)); });
page.on('requestfailed', (r) => failedRequests.push(`${r.method()} ${r.url().slice(0, 140)} — ${r.failure()?.errorText}`));
page.on('response', (r) => { if (r.status() >= 400) failedRequests.push(`HTTP ${r.status()} ${r.url().slice(0, 140)}`); });

await page.goto(`${BASE}/ras-amr`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);

// The room opens behind a full-screen explainer. Record what it declares the
// chamber cannot do yet — that list is the chamber's own confession — then
// step through it and measure the working room.
const declared = await page.evaluate(() => {
  const out = {};
  for (const h of document.querySelectorAll('h3')) {
    const title = (h.innerText || '').trim();
    const items = [];
    let n = h.nextElementSibling;
    while (n && !/^H[123]$/.test(n.tagName)) {
      const t = (n.innerText || '').replace(/\s+/g, ' ').trim();
      if (t) items.push(t);
      n = n.nextElementSibling;
    }
    if (title) out[title] = items;
  }
  return out;
});
for (const [title, items] of Object.entries(declared)) {
  console.log(`
▣ ${title}`);
  for (const i of items) console.log(`    ${i.slice(0, 300)}`);
}
await page.screenshot({ path: 'scripts/proof-harness/ras-al-amr-explainer.png', fullPage: true });

const enter = page.locator('button', { hasText: 'ادخل الحجرة' });
if (await enter.count() > 0) { await enter.first().click(); await page.waitForTimeout(3000); }

const report = [];
const say = (line) => { report.push(line); console.log(line); };

say(`\n══ رأس الأمر · ${BASE}/ras-amr ══`);
say(`title: ${await page.title()}`);

// ── What a Creator can actually press ──────────────────────────────────────
const controls = await page.evaluate(() => {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  };
  const out = { buttons: [], disabled: [], links: [], inputs: [], headings: [], empties: [] };
  for (const b of document.querySelectorAll('button')) {
    if (!visible(b)) continue;
    const label = (b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    (b.disabled ? out.disabled : out.buttons).push(label || '(بلا نص)');
  }
  for (const a of document.querySelectorAll('a[href]')) {
    if (!visible(a)) continue;
    out.links.push(`${(a.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40)} → ${a.getAttribute('href')}`);
  }
  for (const i of document.querySelectorAll('input, textarea, select')) {
    if (!visible(i)) continue;
    out.inputs.push(`${i.tagName.toLowerCase()}${i.type ? `[${i.type}]` : ''} ${(i.placeholder || i.getAttribute('aria-label') || i.id || '').slice(0, 50)}`);
  }
  for (const h of document.querySelectorAll('h1, h2, h3')) {
    if (!visible(h)) continue;
    out.headings.push(`${h.tagName} ${(h.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60)}`);
  }
  // A section with a heading and nothing under it is the thing worth seeing.
  for (const s of document.querySelectorAll('section, [class*="panel"], [class*="ministry"]')) {
    if (!visible(s)) continue;
    const text = (s.innerText || '').replace(/\s+/g, ' ').trim();
    if (text.length > 0 && text.length < 40) out.empties.push(`${s.className.toString().slice(0, 50)} → «${text}»`);
  }
  return out;
});

say(`\n── العناوين (${controls.headings.length}) ──`);
for (const h of controls.headings) say(`   ${h}`);
say(`\n── أزرار حيّة (${controls.buttons.length}) ──`);
for (const b of controls.buttons) say(`   ▸ ${b}`);
say(`\n── أزرار مُعطّلة (${controls.disabled.length}) ──`);
for (const b of controls.disabled) say(`   ✕ ${b}`);
say(`\n── حقول (${controls.inputs.length}) ──`);
for (const i of controls.inputs) say(`   ▫ ${i}`);
say(`\n── روابط (${controls.links.length}) ──`);
for (const l of controls.links) say(`   → ${l}`);
say(`\n── أقسام شبه فارغة (${controls.empties.length}) ──`);
for (const e of controls.empties) say(`   ∅ ${e}`);

// ── English leaking to a Creator ───────────────────────────────────────────
const foreign = await page.evaluate(() => {
  const hits = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walk.nextNode())) {
    const t = (n.textContent || '').trim();
    // NOT `t.length < 3`: React renders <span>{tick}s</span> as TWO text
    // nodes — "0" and "s" — so the violation is a single character, and a
    // sweep that skips short strings skips the violation itself. The blind
    // spot was in the instrument twice over, and the room is unchanged by
    // either miss: it prints «ث» in its forms and a Latin «s» on its ruler.
    if (t.length === 0) continue;
    const el = n.parentElement;
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // Latin letters with no Arabic anywhere in the same run.
    // CORRECTED: this demanded FOUR Latin letters, so the timeline ruler's
    // «0s 5s 10s» — a Latin unit beside every number a Creator reads — walked
    // straight through the check that exists to catch exactly that. One Latin
    // letter is enough to be foreign.
    if (/[A-Za-z]/.test(t) && !/[؀-ۿ]/.test(t)) hits.push(t.slice(0, 70));
  }
  return [...new Set(hits)];
});
say(`\n── نصّ أجنبي ظاهر للخالق (${foreign.length}) ──`);
for (const f of foreign) say(`   ⚠ ${f}`);

// One room, one number system. Two is a room that cannot decide.
const digits = await page.evaluate(() => {
  const western = new Set(), arabic = new Set();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walk.nextNode())) {
    const t = (n.textContent || '').trim();
    const el = n.parentElement;
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (/[0-9]/.test(t)) western.add(t.slice(0, 40));
    if (/[٠-٩]/.test(t)) arabic.add(t.slice(0, 40));
  }
  // A field's VALUE is a number a Creator reads too, and it is not a text
  // node — the first sweep could not see the «٥» sitting in عدد المشاهد.
  for (const i of document.querySelectorAll('input, textarea')) {
    const v = `${i.value ?? ''}${i.placeholder ?? ''}`;
    if (/[0-9]/.test(v)) western.add(`[حقل] ${v.slice(0, 30)}`);
    if (/[٠-٩]/.test(v)) arabic.add(`[حقل] ${v.slice(0, 30)}`);
  }
  return { western: [...western], arabic: [...arabic] };
});
say(`\n── الأرقام: غربية (${digits.western.length}) · هندية (${digits.arabic.length}) ──`);
if (digits.arabic.length && digits.western.length) {
  say('   ⚠ نظاما أرقام في غرفة واحدة');
  for (const a of digits.arabic.slice(0, 10)) say(`   ٠١٢ ${a}`);
  for (const w of digits.western.slice(0, 10)) say(`   012 ${w}`);
}

say(`\n── أخطاء الطرفية (${consoleErrors.length}) ──`);
for (const e of [...new Set(consoleErrors)]) say(`   ✗ ${e}`);
say(`\n── طلبات فاشلة (${failedRequests.length}) ──`);
for (const f of [...new Set(failedRequests)]) say(`   ✗ ${f}`);

const height = await page.evaluate(() => document.documentElement.scrollHeight);
say(`\n── القياس ── ارتفاع الصفحة ${height}px · العرض 1440px`);

await page.screenshot({ path: 'scripts/proof-harness/ras-al-amr-full.png', fullPage: true });
await page.screenshot({ path: 'scripts/proof-harness/ras-al-amr-first-frame.png' });
writeFileSync('scripts/proof-harness/ras-al-amr-inventory.txt', report.join('\n'), 'utf8');

await browser.close();
console.log('\nwrote scripts/proof-harness/ras-al-amr-inventory.txt and two screenshots');
