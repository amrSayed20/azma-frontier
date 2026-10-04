/**
 * AZMA OS — WHY THE QR NEVER RENDERED
 *
 * DIAGNOSTIC ONLY, 2026-10-04. It stops at the QR and never authenticates,
 * never publishes, and never touches the Vault.
 *
 * ─── WHY THIS FILE EXISTS ───────────────────────────────────────────────────
 *
 *   The live proof failed on `.makman-tg-qr img` after 90s, and the decisive
 *   error went to the BROWSER console, which that harness did not capture. So
 *   the cause could only have been guessed at — and a guess acted on is worse
 *   than no diagnosis.
 *
 *   Everything the browser says is captured here RAW: console of every type
 *   with its source location, uncaught page errors with stacks, unhandled
 *   rejections, and failed requests. Nothing is transformed and nothing is
 *   summarised away.
 *
 * ─── THE SECURITY BOUNDARY, WHICH HOLDS EVEN THOUGH NOTHING EXISTS YET ──────
 *
 *   This run stops BEFORE authentication, so there is no session, no auth key,
 *   no code and no password to capture. `redact` is here anyway: an instrument
 *   that would print a credential if one appeared is an instrument that
 *   eventually does.
 */
import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'https://azmaos.com';
const OUT = 'scripts/proof-harness';
mkdirSync(OUT, { recursive: true });

/** Never print credential material, even where none should exist. */
const redact = (s) => String(s ?? '')
  .replace(/\b1[A-Za-z0-9+/_=-]{63,}\b/g, '<redacted-session>')
  .replace(/\b\d{5,}:[A-Za-z0-9_-]{20,}\b/g, '<redacted-token>');

const events = [];
const note = (kind, data) => { events.push({ t: Date.now(), kind, ...data }); };

const browser = await chromium.launch({ headless: true });
const setup = await browser.newContext();
const login = await setup.request.post(`${BASE}/api/auth/login`, {
  data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD },
  timeout: 30000,
});
console.log('جلسة المؤسّس:', login.status());
const STATE = await setup.storageState();
await setup.close();

const ctx = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1366, height: 1100 }, storageState: STATE });
const page = await ctx.newPage();

// ── EVERYTHING THE BROWSER SAYS, BEFORE A SINGLE CLICK ───────────────────
page.on('console', (m) => {
  const loc = m.location();
  note('console', { type: m.type(), text: redact(m.text()), url: loc.url, line: loc.lineNumber, col: loc.columnNumber });
});
page.on('pageerror', (e) => {
  note('pageerror', { name: e.name, message: redact(e.message), stack: redact(e.stack) });
});
page.on('requestfailed', (r) => {
  note('requestfailed', { url: r.url(), failure: r.failure()?.errorText ?? '' });
});
page.on('response', (r) => {
  if (r.status() >= 400) note('http-error', { url: r.url(), status: r.status() });
});

// Unhandled rejections surface as pageerror only sometimes; catch them at source.
await page.addInitScript(() => {
  window.addEventListener('unhandledrejection', (ev) => {
    const r = ev.reason;
    // eslint-disable-next-line no-console
    console.error('[UNHANDLED_REJECTION]', r && r.stack ? r.stack : String(r));
  });
});

await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(9000);
const veil = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil.count()) { await veil.click({ force: true }).catch(() => {}); await page.waitForTimeout(2500); }

const before = events.length;
console.log('أحداثٌ قبل الضغط :', before);

const connect = page.locator('[data-testid="makman-telegram-user-connect"]');
if (await connect.count() === 0) {
  console.log('STOP: الزرّ غائب — لا تشخيصَ ممكن');
  await browser.close(); process.exit(1);
}

// ── THE EXACT FLOW THAT FAILED, AND NOTHING ELSE ─────────────────────────
console.log('يُضغط زرّ الربط…');
await connect.click();

// Watch for the QR and for the button's own state, so we know whether the
// handler finished (busy returns to false) or is still waiting.
let qrSeen = false;
for (let i = 0; i < 45; i += 1) {
  await page.waitForTimeout(2000);
  if (await page.locator('.makman-tg-qr img').count()) { qrSeen = true; break; }
}
console.log('رمزُ QR            :', qrSeen ? 'ظهر' : '✕ لم يظهر');
console.log('نصُّ الزرّ الآن     :', (await connect.innerText()).trim());
console.log('رسالةُ الحجرة      :', (await page.locator('.project-status').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 200));

// ── WHERE THE PATH STOPPED, FROM THE NETWORK'S OWN RECORD ────────────────
//   The chunk request tells us whether the dynamic import even began.
const asked = events.filter((e) => e.kind === 'requestfailed' || e.kind === 'http-error');
console.log('\n── أخطاءُ الشبكة ──', asked.length);
for (const e of asked.slice(0, 10)) console.log('  ', e.kind, e.status ?? e.failure, e.url.slice(0, 120));

const errs = events.slice(before).filter((e) => e.kind === 'pageerror' || (e.kind === 'console' && (e.type === 'error' || e.type === 'warning')));
console.log('\n── ما قاله المتصفّح بعد الضغط ──', errs.length);
for (const e of errs) {
  if (e.kind === 'pageerror') {
    console.log(`\n[PAGEERROR] ${e.name}: ${e.message}`);
    console.log(e.stack);
  } else {
    console.log(`\n[console.${e.type}] ${e.text}`);
    if (e.url) console.log(`    at ${e.url}:${e.line}:${e.col}`);
  }
}

writeFileSync(`${OUT}/tg-qr-diagnostic.json`, JSON.stringify(events, null, 1));
await page.screenshot({ path: `${OUT}/tg-qr-diagnostic.png` });
await browser.close();
console.log('\nكلُّ الأحداث محفوظةٌ في', `${OUT}/tg-qr-diagnostic.json`, `(${events.length})`);
