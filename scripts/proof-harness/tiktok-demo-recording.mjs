/**
 * AZMA OS — THE DEMO RECORDING TIKTOK ASKS FOR, AND NOTHING IT DOES NOT
 *
 * ─── WHY THIS EXISTS SEPARATELY FROM THE LIVE PROOF ─────────────────────────
 *
 *   TikTok will not let the app configuration SAVE until a demo video is
 *   attached, and it will not let the integration COMPLETE until the
 *   configuration is saved. That is a closed loop, and the only honest way out
 *   is a recording of everything that does work, ending at the door TikTok
 *   itself is holding shut.
 *
 * ─── WHAT IT SHOWS, AND WHAT IT REFUSES TO PRETEND ──────────────────────────
 *
 *   It shows the real site at the real domain the app declares: a Creator
 *   signing in, the chamber where distribution lives, a real video asset of
 *   their own in the Vault, that asset carried, the destination list naming
 *   TikTok, and the consent flow being opened by a real click.
 *
 *   It does NOT stage a published post, does not mock a provider answer, and
 *   does not cut away from a failure. If TikTok's own screen refuses the app,
 *   that refusal is in the recording — because a reviewer deciding whether to
 *   open the door should see exactly what stands behind it.
 *
 *   It runs unattended. The one step that needs a human — granting consent —
 *   is the step this recording cannot reach yet.
 */
import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';

const BASE = 'https://azmaos.com';
const OUT = 'scripts/proof-harness';
const ASSET_FILE = 'b2789ac5-fac2-41cb-9990-2ba4a3dd2e36';

/** Slow enough for a human reviewer to read what is on screen. */
const beat = (page, ms = 2500) => page.waitForTimeout(ms);

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({
  locale: 'ar-EG',
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: `${OUT}/tiktok-demo`, size: { width: 1280, height: 720 } },
});
const page = await ctx.newPage();

// ── 1 · the site, at the domain the app declares ─────────────────────────
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
const emailBox = page.locator('#email, input[type="email"]').first();
const pwBox = page.locator('#password, input[type="password"]').first();
await emailBox.waitFor({ state: 'visible', timeout: 45000 });
await beat(page, 3000);

// Hydration is measured by behaviour — see tiktok-live-proof.mjs for why.
const typeUntilItSticks = async (box, value) => {
  for (let i = 0; i < 25; i += 1) {
    await box.click({ timeout: 10000 }).catch(() => {});
    await box.fill('').catch(() => {});
    await box.pressSequentially(value, { delay: 55 }).catch(() => {});
    if ((await box.inputValue().catch(() => '')) === value) return true;
    await page.waitForTimeout(1000);
  }
  return false;
};
if (!await typeUntilItSticks(emailBox, process.env.AZMA_VERIFY_EMAIL ?? '')
  || !await typeUntilItSticks(pwBox, process.env.AZMA_VERIFY_PASSWORD ?? '')) {
  console.log('✗ FAILURE_STAGE=login-fields');
  await ctx.close(); await browser.close(); process.exit(1);
}
await beat(page, 1500);
await page.locator('button[type="submit"]').first().click();
try { await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 45000 }); }
catch { console.log('✗ FAILURE_STAGE=login'); await ctx.close(); await browser.close(); process.exit(1); }
console.log('١ · الدخول ظهر في التسجيل');
await beat(page, 3500);

// ── 2 · the chamber where a Creator distributes their work ───────────────
await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await beat(page, 9000);
const veil = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil.count()) { await veil.click({ force: true }).catch(() => {}); await beat(page, 2500); }

// ── 3 · the Creator's own video, in their own Vault ──────────────────────
const card = page.locator(`[data-testid="makman-vault-door"] button:has(img[src*="${ASSET_FILE}"])`).first();
if (!(await card.count())) {
  console.log('✗ FAILURE_STAGE=asset — الأصل ليس في الباب');
  await ctx.close(); await browser.close(); process.exit(1);
}
await card.scrollIntoViewIfNeeded();
await beat(page, 2500);
await card.click();
await beat(page, 5000);
console.log('٢ · الأصل المحمول:', (await page.locator('.makman-carried-name').allInnerTexts()).join('').slice(0, 90));

// ── 4 · the destination list, naming TikTok ──────────────────────────────
const tiktokRow = page.locator('.makman-cloud-state').filter({ hasText: /تيك توك/ }).first();
if (await tiktokRow.count()) {
  await tiktokRow.scrollIntoViewIfNeeded();
  console.log('٣ · حال الوجهة:', (await tiktokRow.innerText()).replace(/\s+/g, ' '));
}
await beat(page, 4000);

// ── 5 · the click that opens TikTok's own consent ────────────────────────
const connect = page.locator('a, button').filter({ hasText: /اربط تيك توك|اربط حساباً آخر — تيك توك/ }).first();
if (!(await connect.count())) {
  console.log('✗ FAILURE_STAGE=connect-affordance');
  await ctx.close(); await browser.close(); process.exit(1);
}
await connect.scrollIntoViewIfNeeded();
await beat(page, 2500);
console.log('٤ · أضغط:', (await connect.innerText()).trim());
await connect.click();

// Hold on whatever TikTok answers — consent screen or refusal. Both are true.
await beat(page, 12000);
console.log('٥ · ما ظهر بعد الضغط:', page.url().slice(0, 150));
await page.screenshot({ path: `${OUT}/tiktok-demo-last-frame.png` });

await ctx.close();
console.log('\n● التسجيل حُفظ في', `${OUT}/tiktok-demo/`);
await browser.close();
