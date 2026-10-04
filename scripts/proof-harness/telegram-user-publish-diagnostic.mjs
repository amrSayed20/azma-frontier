/**
 * AZMA OS — THE RAW ERROR BEHIND «unreachable»
 *
 * DIAGNOSTIC ONLY, 2026-10-05. One publication attempt, no repair, no retry.
 *
 * ─── WHY A CONSOLE CAPTURE WOULD HAVE FOUND NOTHING ─────────────────────────
 *
 *   `telegram-user-client.publish()` ends in a catch that classifies the error
 *   and returns a verdict. It does not log the original. So the raw exception
 *   never reaches the console at all, and the instrument that found the QR
 *   defect would come back empty here.
 *
 *   The exception must therefore be caught BEFORE the application's own catch
 *   swallows it. Chrome's debugger can do exactly that: `setPauseOnExceptions`
 *   with state «all» reports exceptions that are caught, with their stack, and
 *   the run is resumed immediately so nothing is altered.
 *
 *   It is switched on only for the publication click, because pausing on every
 *   exception from page load would bury the one that matters.
 *
 * ─── AND THE SECOND INSTRUMENT ──────────────────────────────────────────────
 *
 *   Every WebSocket frame to Telegram is counted. MTProto IS that socket, so
 *   the counts separate «the upload never began» from «it began and the send
 *   failed» — the distinction the directive asks for and that no stack trace
 *   can give on its own.
 *
 * ─── SECURITY ───────────────────────────────────────────────────────────────
 *
 *   `redact` runs over every string this file prints. Frame PAYLOADS are never
 *   read — only their direction and size — so no authorization material can
 *   pass through this instrument even in principle.
 */
import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'https://azmaos.com';
const OUT = 'scripts/proof-harness';
mkdirSync(OUT, { recursive: true });

const redact = (s) => String(s ?? '')
  .replace(/\b1[A-Za-z0-9+/_=-]{63,}\b/g, '<redacted>')
  .replace(/\b\d{5,}:[A-Za-z0-9_-]{20,}\b/g, '<redacted>');

const browser = await chromium.launch({ headless: false });
const setup = await browser.newContext();
const login = await setup.request.post(`${BASE}/api/auth/login`, {
  data: { email: process.env.AZMA_VERIFY_EMAIL, password: process.env.AZMA_VERIFY_PASSWORD }, timeout: 30000,
});
console.log('جلسة المؤسّس:', login.status());
const STATE = await setup.storageState();
await setup.close();

const ctx = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1366, height: 1100 }, storageState: STATE });
const page = await ctx.newPage();

// ── MTProto IS A WEBSOCKET; COUNT ITS FRAMES ─────────────────────────────
let wsOpened = 0, framesSent = 0, framesRecv = 0, bytesSent = 0, bytesRecv = 0;
let framesAtPublish = null;
page.on('websocket', (ws) => {
  wsOpened += 1;
  ws.on('framesent', (f) => { framesSent += 1; bytesSent += (f.payload?.length ?? 0); });
  ws.on('framereceived', (f) => { framesRecv += 1; bytesRecv += (f.payload?.length ?? 0); });
});

const consoleEvents = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') {
    const l = m.location();
    consoleEvents.push({ type: m.type(), text: redact(m.text()), url: l.url, line: l.lineNumber, col: l.columnNumber });
  }
});
page.on('pageerror', (e) => consoleEvents.push({ type: 'pageerror', text: redact(e.message), stack: redact(e.stack) }));

await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(9000);
const veil = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil.count()) { await veil.click({ force: true }).catch(() => {}); await page.waitForTimeout(2500); }

// ── 1 · authentication, only as far as the publication step requires ─────
await page.locator('[data-testid="makman-telegram-user-connect"]').click();
console.log('١ · امسح رمز QR من النافذة المفتوحة على شاشتك…');
const choice = page.locator('button', { hasText: /الرسائل المحفوظة|قناتك|أنت مشرفٌ فيها|مجموعةٌ تنشر فيها/ }).first();
try { await choice.waitFor({ timeout: 900000 }); }
catch { console.log('STAGE=authentication (لم يُمسح الرمز)'); await browser.close(); process.exit(1); }
console.log('٢ · المصادقة تمّت — الوجهات ظهرت');
await choice.click();
await page.waitForTimeout(5000);

// ── 2 · a real sovereign asset, carried by pressing its card ─────────────
const cards = page.locator('[data-testid="makman-vault-door"] button');
if (await cards.count() === 0) { console.log('STAGE=asset-access (لا أصول)'); await browser.close(); process.exit(1); }
await cards.first().click();
await page.waitForTimeout(3000);
const publish = page.locator('button', { hasText: /انشره بحسابك في/ }).first();
if (await publish.count() === 0) { console.log('STAGE=asset-access (لا زرّ نشر)'); await browser.close(); process.exit(1); }
console.log('٣ · الأصل محمول، وزرّ النشر حاضر');

// ── 3 · THE INSTRUMENT THAT SEES A CAUGHT EXCEPTION ──────────────────────
const caught = [];
const cdp = await ctx.newCDPSession(page);
await cdp.send('Debugger.enable');
await cdp.send('Debugger.setPauseOnExceptions', { state: 'all' });
cdp.on('Debugger.paused', async (ev) => {
  try {
    if (ev.reason === 'exception' || ev.reason === 'promiseRejection') {
      const d = ev.data ?? {};
      caught.push({
        className: d.className ?? null,
        description: redact(d.description ?? d.value ?? ''),
        frames: (ev.callFrames ?? []).slice(0, 8).map((f) => ({
          fn: f.functionName || '(anonymous)',
          url: f.url, line: f.location?.lineNumber, col: f.location?.columnNumber,
        })),
      });
    }
  } finally {
    await cdp.send('Debugger.resume').catch(() => {});
  }
});

const framesBefore = { framesSent, framesRecv, bytesSent, bytesRecv };
console.log('٤ · أُشعل مُراقب الاستثناءات — يُضغط النشر مرّةً واحدة');
await publish.click();

for (let i = 0; i < 75; i += 1) {
  await page.waitForTimeout(2000);
  const t = await page.locator('body').innerText();
  if (/نُشِر بحسابك|لم تُقبَل|لم نصل|انتهى إذن|لم نجد بايتات|لم يصل معرّف/.test(t)) break;
}
framesAtPublish = { framesSent: framesSent - framesBefore.framesSent, framesRecv: framesRecv - framesBefore.framesRecv,
                    bytesSent: bytesSent - framesBefore.bytesSent, bytesRecv: bytesRecv - framesBefore.bytesRecv };
await cdp.send('Debugger.setPauseOnExceptions', { state: 'none' }).catch(() => {});

console.log('\n٥ · حكم الحجرة :', (await page.locator('.project-status').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 200));
console.log('٦ · مقابس WebSocket المفتوحة:', wsOpened);
console.log('٧ · إطاراتٌ أثناء النشر — صادرة:', framesAtPublish.framesSent, `(${framesAtPublish.bytesSent} بايت)`,
            '· واردة:', framesAtPublish.framesRecv, `(${framesAtPublish.bytesRecv} بايت)`);

console.log('\n── الاستثناءات الملتقطة (حتّى المبتلَعة) ──', caught.length);
for (const [i, c] of caught.entries()) {
  console.log(`\n[${i + 1}] ${c.className ?? ''}`);
  console.log(c.description.split('\n').slice(0, 14).join('\n'));
  for (const f of c.frames) console.log(`      at ${f.fn} (${f.url}:${f.line}:${f.col})`);
}

console.log('\n── console errors/warnings ──');
for (const e of consoleEvents.filter((e) => e.type !== 'warning').slice(-10)) {
  console.log(`[${e.type}] ${e.text}`);
  if (e.stack) console.log(e.stack.split('\n').slice(0, 8).join('\n'));
  else if (e.url) console.log(`    at ${e.url}:${e.line}:${e.col}`);
}

writeFileSync(`${OUT}/tg-publish-diagnostic.json`, JSON.stringify({ caught, consoleEvents, framesAtPublish, wsOpened }, null, 1));
await page.screenshot({ path: `${OUT}/tg-publish-diagnostic.png` });
await browser.close();
