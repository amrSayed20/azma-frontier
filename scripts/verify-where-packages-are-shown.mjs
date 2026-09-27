/**
 * AZMA OS — MEASURE AND LOOK, TOGETHER.
 *
 * Proves, against a RUNNING release, the two things the Founder ordered:
 *
 *   1. The packages are shown at the END of the visitor's journey — on the
 *      gate itself, to someone who has not logged in — and the gift is told.
 *   2. Every paid step in القيامة states its cost before it is spent, and a
 *      clip's figure MOVES with the seconds the Creator chose.
 *
 * It also proves the negative that matters most: the Empire's cost truth —
 * provider credit rates, the dollar acquisition cost, the FX rate — is in NO
 * bundle the browser downloads.
 *
 *   node scripts/verify-where-packages-are-shown.mjs [baseUrl]
 */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'https://azmaos.com';

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ar-EG' });
const page = await context.newPage();

// Every script the page actually downloads, so the leak check reads what a
// visitor's browser really received rather than what the repository intends.
const scriptBodies = [];
page.on('response', async (res) => {
  const url = res.url();
  if (!url.includes('/_next/static/')) return;
  if (!url.endsWith('.js')) return;
  try { scriptBodies.push(await res.text()); } catch { /* streamed away */ }
});

// ── 1 · THE END OF THE VISITOR'S JOURNEY ───────────────────────────────────
// NOT 'networkidle': the gate keeps a presence channel open, so the network
// never goes quiet and the wait times out on a page that loaded perfectly.
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
// The closing beat appears once the ceremony has finished speaking.
await page.waitForSelector('.arrival-value', { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(7000);

const beat = page.locator('.arrival-value');
check('the closing beat exists on the gate', await beat.count() === 1);

const names = await page.locator('.arrival-value-name').allInnerTexts();
check('all four approved packages are named', names.length === 4, names.join(' · '));

const prices = await page.locator('.arrival-value-price').allInnerTexts();
const units = await page.locator('.arrival-value-units').allInnerTexts();
check('each carries a price and a Balance', prices.length === 4 && units.length === 4,
  prices.map((p, i) => `${p.replace(/\s+/g, ' ')} → ${units[i]}`).join(' · '));

const gift = (await page.locator('.arrival-value-gift').innerText().catch(() => '')).trim();
check('the gift is told as a discretion', gift.includes('قد تمنح') && gift.includes('تفضّلٌ لا استحقاق'), gift.slice(0, 60));
check('the gift promises no amount', !/[0-9٠-٩]/.test(gift));

// Visible without logging in — that is the whole point of the placement.
check('a visitor sees it with no session', !(await page.context().cookies()).some((c) => c.name === 'azma_session'));

// It is BELOW the one path forward, and carries no purchase control.
const thresholdBox = await page.locator('.arrival-threshold').boundingBox().catch(() => null);
const beatBox = await beat.boundingBox().catch(() => null);
check('it sits below the threshold', !!thresholdBox && !!beatBox && beatBox.y > thresholdBox.y,
  thresholdBox && beatBox ? `threshold ${Math.round(thresholdBox.y)} → beat ${Math.round(beatBox.y)}` : 'not measurable');
check('it offers a visitor no purchase button', await beat.locator('button').count() === 0);

// The switcher must not land on the prices now that the page is taller.
const lang = await page.locator('.arrival-language').boundingBox().catch(() => null);
const overlaps = lang && beatBox
  && lang.y < beatBox.y + beatBox.height && lang.y + lang.height > beatBox.y
  && lang.x < beatBox.x + beatBox.width && lang.x + lang.width > beatBox.x;
// CORRECTED after LOOKING at the first deployed screenshot: this checked only
// the package rows, and the switcher was resting on the SECOND LINE OF THE
// GIFT SENTENCE — a collision the guard was built to miss. It now measures
// every piece of text in the beat.
const hits = [];
for (const sel of ['.arrival-value-package', '.arrival-value-gift', '.arrival-value-title']) {
  const boxes = await page.locator(sel).all();
  for (const el of boxes) {
    const b = await el.boundingBox().catch(() => null);
    if (!b || !lang) continue;
    if (lang.y < b.y + b.height && lang.y + lang.height > b.y
      && lang.x < b.x + b.width && lang.x + lang.width > b.x) hits.push(sel);
  }
}
check('the language switcher covers nothing the beat says', hits.length === 0,
  hits.length ? `COVERS: ${[...new Set(hits)].join(', ')}` : (overlaps ? 'inside the beat’s box, clear of its text' : 'clear'));

// ── 2 · THE COST TRUTH IS IN NO BUNDLE ─────────────────────────────────────
const leaked = [];
for (const body of scriptBodies) {
  for (const needle of ['14000', '14_000', '51.83', 'magic-hour-credits', 'nano-banana', 'minimax', 'veo-3', 'seedance', 'usdToEgp', 'creditsReceived']) {
    if (body.includes(needle)) leaked.push(needle);
  }
}
check('no cost-truth figure or provider name in any downloaded script',
  leaked.length === 0, leaked.length ? `LEAKED: ${[...new Set(leaked)].join(', ')}` : `${scriptBodies.length} scripts read`);

await page.screenshot({ path: 'scripts/proof-harness/gate-closing-beat.png', fullPage: true });

// ── 3 · THE BALANCE SURFACE, READ BY A VISITOR ─────────────────────────────
await page.goto(`${BASE}/sovereign-balance`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.balance-packages', { timeout: 20000 }).catch(() => {});
check('the Balance surface answers a visitor', await page.locator('.balance-packages').count() === 1);
check('it names four packages', await page.locator('.balance-package').count() === 4);
const shut = await page.locator('.balance-package-shut').allInnerTexts();
check('it offers no button it cannot honour', shut.length === 4 && await page.locator('.balance-package-buy').count() === 0,
  shut[0]?.replace(/\s+/g, ' ').slice(0, 50));
check('and the room has a door out of it', await page.locator('.balance-exit a').count() === 1,
  (await page.locator('.balance-exit a').innerText().catch(() => '')).trim());
const rules = (await page.locator('.balance-rules').innerText().catch(() => '')).replace(/\s+/g, ' ');
check('it states the 28-day rule in both halves',
  rules.includes('ثمانية وعشرون يوماً') && rules.includes('لا يُردّ المتبقّي نقداً') && rules.includes('وإن لم تشترِ'));
check('it denies being a subscription', rules.includes('وليس هذا اشتراكاً'));
check('it states الريادة’s own ending', rules.includes('ستّة أشهر') && rules.includes('ثلث'));
await page.screenshot({ path: 'scripts/proof-harness/sovereign-balance.png', fullPage: true });

// ── 4 · EVERY PAID STEP STATES ITS PRICE ───────────────────────────────────
const email = process.env.AZMA_VERIFY_EMAIL;
const password = process.env.AZMA_VERIFY_PASSWORD;
if (!email || !password) {
  console.log('\nSKIPPED the Chamber steps: no AZMA_VERIFY_EMAIL / AZMA_VERIFY_PASSWORD in the environment.');
  console.log('Set them to measure the per-step cost lines as a real Creator.');
} else {
  const login = await context.request.post(`${BASE}/api/auth/login`, {
    data: { email, password },
  });
  check('the Creator is admitted', login.ok(), `HTTP ${login.status()}`);

  // Ask the door directly, for each step and for two different durations —
  // the figure a Creator is shown must be the figure of the seconds chosen.
  const quote = async (step, quantity) => {
    const res = await context.request.post(`${BASE}/api/sovereign/economy/estimate`, {
      data: { step, quantity },
    });
    return res.ok() ? res.json() : { error: res.status() };
  };

  for (const step of ['IMAGE_GENERATION', 'INFOGRAPHIC', 'IMAGE_EDIT', 'UPSCALE_2X']) {
    const q = await quote(step, 1);
    check(`${step} is quoted a number`, typeof q.estimatedAzmaUnits === 'number' && q.priced === true,
      `${q.workAr ?? ''} → ${q.estimatedAzmaUnits}`);
  }

  const six = await quote('VIDEO_GENERATION', 6);
  const ten = await quote('VIDEO_GENERATION', 10);
  check('a clip is quoted on the seconds requested',
    six.estimatedAzmaUnits !== ten.estimatedAzmaUnits
    && ten.estimatedAzmaUnits === (six.estimatedAzmaUnits / 6) * 10,
    `6s → ${six.estimatedAzmaUnits} · 10s → ${ten.estimatedAzmaUnits}`);
  check('and the quote names the seconds it used', six.quantity === 6 && six.perSecond === true);

  const motion = await quote('MOTION', 5);
  check('MOTION is quoted under its own rule', typeof motion.estimatedAzmaUnits === 'number' && motion.priced === true,
    `${motion.workAr} → ${motion.estimatedAzmaUnits} (${motion.quantity}s)`);

  // A browser cannot quote itself a cheaper step than it will ask to run.
  const negative = await quote('VIDEO_GENERATION', -50);
  check('a negative duration cannot buy a cheaper quote', negative.quantity === 1,
    `quantity clamped to ${negative.quantity}`);
  const huge = await quote('VIDEO_GENERATION', 99999);
  check('an absurd duration is clamped, not honoured', huge.quantity === 600, `quantity ${huge.quantity}`);

  // A step nobody approved is refused rather than priced at zero.
  const unknown = await quote('MP4_PRODUCTION', 1);
  check('a step the Chamber does not own is refused', unknown.error === 400, `HTTP ${unknown.error}`);

  // And the checkout door refuses without proven identity or a gateway.
  const checkout = await context.request.post(`${BASE}/api/sovereign/economy/xpay-checkout`, {
    data: { packId: 'asas' },
  });
  check('checkout refuses rather than opening an unproven purchase',
    checkout.status() === 403 || checkout.status() === 503, `HTTP ${checkout.status()}`);
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed against ${BASE}`);
if (failed.length) {
  console.log('FAILED:');
  for (const f of failed) console.log(`  · ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
  process.exit(1);
}
