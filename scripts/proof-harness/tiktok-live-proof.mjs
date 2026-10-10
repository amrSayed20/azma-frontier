/**
 * AZMA OS — THE TIKTOK LIVE PROOF, AND THE REVIEW RECORDING IN ONE PASS
 *
 * ─── WHY THE BROWSER IS VISIBLE ─────────────────────────────────────────────
 *
 *   TikTok's consent cannot be automated and must not be: the account owner
 *   signs in with their own credentials and reads what they are granting. So
 *   the window opens on the Founder's screen and the harness WAITS.
 *
 * ─── AND WHY IT RECORDS FROM THE FIRST FRAME ────────────────────────────────
 *
 *   TikTok refuses to review an unapproved app without a demo video showing
 *   «the full integration flow from beginning to end», on «the website where
 *   the features will actually be integrated». That is the same journey this
 *   proof performs. Recording it separately would mean doing it twice and
 *   risking a recording of a run that differed from the one that passed.
 *
 * ─── WHAT IT REFUSES TO CALL SUCCESS ────────────────────────────────────────
 *
 *   Only a real answer from TikTok counts. Every response from the Empire's
 *   own routes is captured RAW and printed, and if the chain breaks the
 *   harness stops at the break rather than continuing and reporting the parts
 *   that worked. A draft in the creator's inbox is named a draft, never a
 *   publication — `video.upload` grants nothing more.
 */
import { chromium } from 'file:///C:/Users/Hp/azma-frontier/node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';

const BASE = 'https://azmaos.com';
const OUT = 'scripts/proof-harness';
/** The asset the Founder named. Targeted by its own file, not by position. */
const ASSET_FILE = 'b2789ac5-fac2-41cb-9990-2ba4a3dd2e36';
/** How long the Founder may take inside TikTok's own screens. */
const CONSENT_MS = 10 * 60 * 1000;

const stop = (stage, why) => {
  console.log(`\n✗ FAILURE_STAGE=${stage}`);
  console.log(`  ${why}`);
};

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({
  locale: 'ar-EG',
  viewport: { width: 1366, height: 820 },
  recordVideo: { dir: `${OUT}/tiktok-recording`, size: { width: 1366, height: 820 } },
});
const page = await ctx.newPage();

/** Every answer the Empire gave, raw. A summary is not evidence. */
const wire = [];
page.on('response', async (r) => {
  if (!r.url().startsWith(BASE)) return;
  if (!/\/api\/|\/cloud\//.test(r.url())) return;
  let body = '';
  try { body = (await r.text()).slice(0, 4000); } catch { body = '(binary)'; }
  wire.push({ status: r.status(), url: r.url(), body });
});
page.on('console', (m) => { if (m.type() === 'error') console.log('   [console.error]', m.text().slice(0, 200)); });

console.log('● التسجيل بدأ — النافذة مفتوحة على شاشتك\n');

// ── 1 · the Creator signs in, on camera ──────────────────────────────────
//
//   MEASURED 2026-10-09: filling 2.5s after `domcontentloaded` typed into the
//   DOM before React had hydrated. The inputs are controlled — `value={email}`
//   — so the characters were visible on screen and the component's state was
//   still empty. The form posted two blank fields and the Empire answered 401,
//   and the harness carried on into a chamber no session could open.
//
//   So: wait for hydration, then READ BACK what was typed. A field that did
//   not take the value is the defect, and it must be caught here rather than
//   three steps later wearing a different mask.
//   AND MEASURED MOMENTS LATER: `networkidle` never fires on this site at all.
//   The Empire is alive — HeartPulse, CoreThought and the awakenings keep
//   requests moving for as long as a page is open — so waiting for the network
//   to fall silent is waiting for something that never happens.
//
//   Hydration is therefore measured by BEHAVIOUR, not by a clock or a quiet
//   wire: type, read back, and repeat until the value sticks. That is the
//   actual property being waited on.
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
const emailBox = page.locator('#email, input[type="email"]').first();
const pwBox = page.locator('#password, input[type="password"]').first();
await emailBox.waitFor({ state: 'visible', timeout: 45000 });

const typeUntilItSticks = async (box, value) => {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    await box.click({ timeout: 10000 }).catch(() => {});
    await box.fill('').catch(() => {});
    await box.pressSequentially(value, { delay: 20 }).catch(() => {});
    if ((await box.inputValue().catch(() => '')) === value) return true;
    await page.waitForTimeout(1000);
  }
  return false;
};

if (!await typeUntilItSticks(emailBox, process.env.AZMA_VERIFY_EMAIL ?? '')
  || !await typeUntilItSticks(pwBox, process.env.AZMA_VERIFY_PASSWORD ?? '')) {
  stop('login-fields', 'الحقول لم تُمسك بما كُتب فيها بعد ٢٥ محاولة — الصفحة لم تستيقظ.');
  await page.screenshot({ path: `${OUT}/tiktok-proof.png` });
  await ctx.close(); await browser.close(); process.exit(1);
}

await page.locator('button[type="submit"]').first().click();
try {
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 45000 });
} catch {
  const said = (await page.locator('.creator-access-card').innerText().catch(() => '')).replace(/\s+/g, ' ');
  stop('login', `بقي في صفحة الدخول. ما قالته الصفحة: «${said.slice(0, 240)}»`);
  await page.screenshot({ path: `${OUT}/tiktok-proof.png` });
  await ctx.close(); await browser.close(); process.exit(1);
}
await page.waitForTimeout(4000);
console.log('١ · الدخول:', page.url().replace(BASE, '') || '/');

// ── 2 · into the chamber where distribution lives ────────────────────────
// The first run's goto here was ABORTED because it raced the login's own
// client navigation. The cure is not a quieter wait — this site never goes
// quiet — but waiting for the login to LAND first, which `waitForURL` above
// now does.
await page.goto(`${BASE}/makman-al-ghayah`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(9000);
const veil = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil.count()) { await veil.click({ force: true }).catch(() => {}); await page.waitForTimeout(2500); }

const states = (await page.locator('.makman-cloud-state').allInnerTexts()).map((s) => s.replace(/\s+/g, ' '));
console.log('٢ · حال تيك توك:', states.find((s) => /تيك توك/.test(s)) ?? '(لا صفّ)');

// ── 3 · the Creator grants, by their own hand ────────────────────────────
const connect = page.locator('a, button').filter({ hasText: /اربط تيك توك|اربط حساباً آخر — تيك توك/ }).first();
if (!(await connect.count())) {
  stop('connect-affordance', 'لا زرّ ربطٍ لتيك توك في الحجرة — الوجهة غير معروضة.');
  await page.screenshot({ path: `${OUT}/tiktok-proof.png` });
  await ctx.close(); await browser.close(); process.exit(1);
}
console.log('٣ · أضغط:', (await connect.innerText()).trim());
await connect.click();

console.log('\n   ⟶ وافِق على شاشة تيك توك الآن. أنتظر حتى ١٠ دقائق.');
console.log('   ⟶ يجب أن ترى إذنين فقط. إن رأيت أكثر — لا توافق.\n');

const deadline = Date.now() + CONSENT_MS;
let returned = false;
while (Date.now() < deadline) {
  await page.waitForTimeout(3000);
  const url = page.url();
  if (url.startsWith(BASE)) { returned = true; break; }
}
if (!returned) {
  stop('consent', `لم يعد المتصفّح إلى ${BASE} خلال ١٠ دقائق. آخر عنوان: ${page.url().slice(0, 120)}`);
  await page.screenshot({ path: `${OUT}/tiktok-proof.png` });
  await ctx.close(); await browser.close(); process.exit(1);
}
const outcome = new URL(page.url()).searchParams.get('cloud');
console.log('٤ · عودة الموافقة — نتيجة الربط:', outcome ?? '(بلا وسم)');
if (outcome && outcome !== 'linked') {
  stop('link', `تيك توك أو الإمبراطورية ردّت: «${outcome}» — لا ربط، فلا رفع.`);
  for (const w of wire.filter((x) => /tiktok/.test(x.url))) console.log(`   ${w.status} ${w.url}\n   ${w.body.slice(0, 500)}`);
  await page.screenshot({ path: `${OUT}/tiktok-proof.png` });
  await ctx.close(); await browser.close(); process.exit(1);
}

// ── 4 · the link, as the database reports it after a reload ──────────────
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const veil2 = page.locator('.demo-veil button, .demo-close-btn').first();
if (await veil2.count()) { await veil2.click({ force: true }).catch(() => {}); await page.waitForTimeout(2000); }
const rows = (await page.locator('.makman-plan-row span').allInnerTexts()).filter((r) => /تيك توك/.test(r));
console.log('٥ · الحساب المربوط:', rows.join(' | ') || '(لا صفّ — الربط لم يُحفظ)');
if (rows.length === 0) {
  stop('persistence', 'الموافقة تمّت والربط لم يظهر بعد التحديث — لم يُحفظ.');
  await page.screenshot({ path: `${OUT}/tiktok-proof.png` });
  await ctx.close(); await browser.close(); process.exit(1);
}

// ── 5 · carry THE asset the Founder named ────────────────────────────────
const card = page.locator(`[data-testid="makman-vault-door"] button:has(img[src*="${ASSET_FILE}"])`).first();
if (!(await card.count())) {
  stop('asset', `الأصل ${ASSET_FILE} ليس في باب الخزنة — لن أرفع أصلاً آخر مكانه.`);
  await page.screenshot({ path: `${OUT}/tiktok-proof.png` });
  await ctx.close(); await browser.close(); process.exit(1);
}
await card.scrollIntoViewIfNeeded();
await card.click();
await page.waitForTimeout(4000);
console.log('٦ · الأصل المحمول:', (await page.locator('.makman-carried-name').allInnerTexts()).join('').slice(0, 90));

// ── 6 · the upload itself ────────────────────────────────────────────────
const all = page.locator('button').filter({ hasText: /ارفعه إلى|انشره في/ });
let target = null;
for (let i = 0; i < await all.count(); i += 1) {
  const t = (await all.nth(i).innerText()).trim();
  if (/تيك توك|♪/.test(t)) { target = all.nth(i); break; }
}
if (!target) {
  stop('publish-affordance', 'لا زرّ رفعٍ إلى تيك توك رغم أنّ الحساب مربوط والأصل محمول.');
  await page.screenshot({ path: `${OUT}/tiktok-proof.png` });
  await ctx.close(); await browser.close(); process.exit(1);
}
console.log('٧ · أضغط:', (await target.innerText()).trim());
await target.click();

for (let i = 0; i < 150; i += 1) {
  await page.waitForTimeout(2000);
  if (/نُشِر|وصل|مسوّدة|لم تُقبَل|لم نصل|لم يُقبل|لم نجد بايتات|غير مهيّأ|تعذّر/.test(await page.locator('body').innerText())) break;
}
console.log('٨ · جواب الحجرة:', (await page.locator('.project-status').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 300));

// ── 7 · what TikTok actually said, raw ───────────────────────────────────
console.log('\n٩ · ما ردّت به الأسلاك — خاماً:');
for (const w of wire.filter((x) => /tiktok|distribut|upload/i.test(x.url)).slice(-8)) {
  console.log(`   ${w.status}  ${w.url.replace(BASE, '')}`);
  if (w.body) console.log(`      ${w.body.replace(/\s+/g, ' ').slice(0, 400)}`);
}

await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
console.log('\n١٠ · سجلّ التوزيع بعد التحديث:',
  (await page.locator('[data-testid="makman-receipts"]').allInnerTexts()).join(' | ').replace(/\s+/g, ' ').slice(0, 320));

await page.screenshot({ path: `${OUT}/tiktok-proof.png` });
writeFileSync(`${OUT}/tiktok-wire.json`, JSON.stringify(wire, null, 1));
await ctx.close();
console.log('\n● التسجيل حُفظ في', `${OUT}/tiktok-recording/`);
await browser.close();
