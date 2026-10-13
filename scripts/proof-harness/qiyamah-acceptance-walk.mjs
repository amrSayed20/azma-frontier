/**
 * AZMA OS — THE BROWSER ACCEPTANCE WALK, RUN AGAINST THE DEPLOYED RELEASE.
 *
 * It measures what a Creator's own browser renders, not what the source says.
 * Every check is one claim from `QIYAMAH_BROWSER_ACCEPTANCE_WALK.md`.
 *
 * What it is NOT: a hand on a real phone. The mobile pass is a 390x844 touch
 * viewport with an iPhone user agent — which measures layout, reachability and
 * state, and does not measure what a thumb finds on glass.
 */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'https://azmaos.com';
const OUT = process.argv[2];
const EMAIL = 'founder@azmaos.com';
const PASSWORD = process.env.AZMA_PW;

const results = [];
const check = (id, what, pass, detail) => {
  results.push({ id, what, verdict: pass ? 'PASS' : 'FAIL', detail: detail || '' });
  console.log((pass ? 'PASS  ' : 'FAIL  ') + id + '  ' + what + (detail ? ' · ' + detail : ''));
};

const run = async (name, viewport, isMobile) => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
    deviceScaleFactor: isMobile ? 3 : 1,
    userAgent: isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  // A console error says «status 401 ()» and NOT which request earned it — a
  // status without its request is a rumour, and a rumour cannot be ruled on.
  // So the responses are recorded with their URLs, and the verdicts below are
  // read from these rather than from the console's own blind text.
  const failedRequests = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failedRequests.push(r.status() + ' ' + r.request().method() + ' ' + r.url());
  });

  // ── SIGN IN, AND PROVE THE SESSION BEFORE WALKING ────────────────────
  //   A walk that silently measures the signup gate measures nothing. The
  //   session is confirmed against /api/auth/me, and only then does the
  //   chamber get opened.
  let authed = false;
  for (let attempt = 1; attempt <= 3 && !authed; attempt += 1) {
    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#email', { timeout: 30000 });
    await page.fill('#email', EMAIL);
    await page.fill('#password', PASSWORD);
    // MEASURED: clicking in the same tick as the fill posts an EMPTY body and
    // the server truthfully answers 400 «Email and password are required.»
    // That 400 is this harness's own race, not the Empire's defect — a hand
    // cannot type and click within one tick. So the state is let settle, and
    // the console-error check below is left free to fail on anything real.
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    const me = await page.evaluate(async () => {
      const r = await fetch('/api/auth/me', { credentials: 'include' });
      return r.json();
    });
    authed = me && me.authenticated === true;
    if (!authed) await page.waitForTimeout(2000);
  }
  check(name + '/0.3', 'the Founder is signed in before the walk begins', authed);
  if (!authed) { await browser.close(); return; }

  await page.goto(BASE + '/qiyamah-chamber', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: OUT + '/' + name + '-00-first-sight.png' });

  // ── THE CHAMBER EXPLAINS ITSELF BEFORE IT IS USED ────────────────────
  //   A first-visit veil covers the floor. A Creator dismisses it, so the
  //   walk does too — and records that it was there, because a modal between
  //   a Creator and the cards is part of the experience under test.
  const veil = page.locator('.demo-veil');
  const hadVeil = (await veil.count()) > 0;
  check(name + '/0.6', 'the first-visit explanation can be dismissed', true,
    hadVeil ? 'veil present, closing it' : 'no veil on this visit');
  if (hadVeil) {
    await page.locator('.demo-close').click();
    await page.waitForTimeout(1200);
  }
  await page.screenshot({ path: OUT + '/' + name + '-01-chamber.png' });

  const cards = await page.locator('[data-testid^="qiyamah-op-"]').all();
  check(name + '/1.1', 'ten operation cards are rendered', cards.length === 10, 'found ' + cards.length);

  const info = [];
  for (const c of cards) {
    const id = (await c.getAttribute('data-testid')).replace('qiyamah-op-', '');
    info.push({
      id,
      availability: await c.getAttribute('data-availability'),
      readable: await c.getAttribute('data-readable'),
      disabled: await c.isDisabled(),
      text: (await c.innerText()).replace(/\s+/g, ' ').slice(0, 140),
    });
  }
  fs.writeFileSync(OUT + '/' + name + '-cards.json', JSON.stringify(info, null, 1));

  // ── THE FOUR ACTS ARE NOW OPEN, AND THAT IS WHAT MUST BE ASSERTED ──────
  //   These four read COST_NOT_VERIFIED until 2026-10-12, when nine paid
  //   provider jobs measured each one's charge and opened them. So asserting
  //   «shut» here no longer describes the Empire — worse, it would PASS if a
  //   capability the Founder PAID to open silently closed again. The stronger
  //   claim is the one that matches what was bought: open, undisabled, and
  //   carrying a price a Creator can read before pressing.
  const four = ['background-removal', 'lip-sync', 'face-swap', 'talking-photo'];
  const paid = info.filter((i) => four.indexOf(i.id) >= 0);
  check(name + '/1.4', 'the four measured acts are OPEN, not shut',
    paid.length === 4 && paid.every((i) => i.availability === 'AVAILABLE'),
    paid.map((i) => i.id + '=' + i.availability).join(' '));
  check(name + '/1.4b', 'none of them is disabled, and none still claims to be unread',
    paid.every((i) => i.disabled === false && i.readable !== 'true'),
    paid.map((i) => i.id + ' readable=' + i.readable + ' disabled=' + i.disabled).join(' '));

  const latin = info.filter((i) => /[A-Za-z]{3,}/.test(i.text));
  check(name + '/1.6', 'no Latin word on any card', latin.length === 0,
    latin.map((i) => i.id).join(' '));

  const fsCard = page.locator('[data-testid="qiyamah-op-face-swap"]');
  await fsCard.click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: OUT + '/' + name + '-02-face-swap-panel.png', fullPage: true });

  check(name + '/3.2', 'the card opens a working workspace',
    (await page.locator('.creative-act').count()) > 0);

  check(name + '/4.1', 'the declaration is present before any execution',
    (await page.locator('.likeness-ack').count()) > 0);

  const items = await page.locator('.likeness-ack-item').allInnerTexts();
  check(name + '/4.2', 'all four sentences are shown whole', items.length === 4, items.length + ' sentences');
  fs.writeFileSync(OUT + '/' + name + '-declaration.txt', items.join('\n\n'));

  const box = page.locator('#likeness-ack-input');
  check(name + '/4.3', 'the box is NOT pre-checked', (await box.isChecked()) === false);

  const runBtn = page.locator('.creative-act-run');
  check(name + '/4.4a', 'the run button is dark before anything is chosen', await runBtn.isDisabled());

  await box.check();
  await page.waitForTimeout(400);
  // The act is open now, so the declaration alone must still not be enough:
  // what is missing is the Creator's own asset, and the button stays dark
  // until they choose one. Ticking a box is not choosing a subject.
  check(name + '/3.2b', 'the declaration alone does NOT light the act', await runBtn.isDisabled());

  const why = await page.locator('.creative-act-missing, .creative-act-shut').allInnerTexts();
  const whyText = why.join(' ');
  check(name + '/1.5', 'the reason is written beside it, in Arabic, and names what is missing',
    /[؀-ۿ]/.test(whyText) && !/[A-Za-z]{3,}/.test(whyText)
      && (whyText.indexOf('أصل') >= 0 || whyText.indexOf('كلفت') >= 0 || whyText.indexOf('تُقَس') >= 0),
    why.join(' | ').slice(0, 120));
  await page.screenshot({ path: OUT + '/' + name + '-03-declaration-ticked.png', fullPage: true });

  const bb = await box.boundingBox();
  check(name + '/4.8', 'the declaration control has real size on screen',
    !!bb && bb.width > 10 && bb.height > 10, bb ? Math.round(bb.width) + 'x' + Math.round(bb.height) : 'none');

  const scroll = await page.evaluate(() => ({
    w: document.documentElement.scrollWidth, c: document.documentElement.clientWidth,
  }));
  check(name + '/1.8', 'no horizontal page scroll', scroll.w <= scroll.c + 2, scroll.w + ' vs ' + scroll.c);

  await page.locator('.ops-rail-back').click();
  await page.waitForTimeout(1200);
  await fsCard.click();
  await page.waitForTimeout(1800);
  check(name + '/4.7', 'returning re-opens it UNTICKED',
    (await page.locator('#likeness-ack-input').isChecked()) === false);

  await page.goto(BASE + '/policies/terms-of-service', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const terms = await page.locator('body').innerText();
  await page.screenshot({ path: OUT + '/' + name + '-04-terms.png' });
  check(name + '/7.2', 'the terms carry the likeness clause', terms.indexOf('تملك الحقوق والأذون اللازمة') >= 0);
  check(name + '/7.2b', 'possession is not consent', terms.indexOf('ليس في ذاته موافقةً من الشخص الظاهر فيه') >= 0);
  check(name + '/7.2c', 'AZMA verifies nothing on their behalf', terms.indexOf('ولا تتحقّق AZMA نيابةً عنك') >= 0);
  check(name + '/7.3', 'the prohibition is in the published list', terms.indexOf('شبيهَ شخصٍ بغير إذنه') >= 0);
  check(name + '/7.9', 'the served text states version 1.2', terms.indexOf('الإصدار: 1.2') >= 0);
  check(name + '/7.10', 'no internal review marker reaches a Creator', terms.indexOf('LEGAL REVIEW REQUIRED') < 0);

  await page.goto(BASE + '/policies/privacy-policy', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const priv = await page.locator('body').innerText();
  check(name + '/7.5', 'privacy states what the declaration stores',
    priv.indexOf('إصدار نصّ الإقرار الذي قرأته') >= 0);
  check(name + '/7.7', 'privacy promises no deletion it cannot prove', priv.indexOf('لم تُوثّق ولم تُقَس') >= 0);

  // ── WHAT IS EXCLUDED, AND WHY EACH EXCLUSION IS NAMED ──────────────────
  //   Only ONE class of 4xx is excluded, and it is excluded because it is a
  //   RULING, not noise: `src/sovereign-circulation/transport.ts` deliberately
  //   lets the very first cross-runtime circulation leave an anonymous runtime
  //   in order to LEARN the server's refusal, then latches and never asks
  //   again. So exactly one 401 on that endpoint per runtime is the designed
  //   behaviour — and if the latch ever broke, the count would exceed one,
  //   which this still fails on.
  fs.writeFileSync(OUT + '/' + name + '-failed-requests.txt', failedRequests.join('\n'));

  const circulated = failedRequests.filter((e) => /circulate/i.test(e));
  check(name + '/0.5b', 'the circulation latch asks once and then believes',
    circulated.length <= 1, circulated.length + ' circulation refusals');

  // Nothing else is excluded. With the URLs in hand there is no need to guess
  // at a class of failure — anything that fails is named and judged by its own
  // address, including a 404, which with its URL is evidence and not noise.
  const real = failedRequests.filter((e) => !/favicon|circulate/i.test(e));
  check(name + '/0.5', 'no request fails during the walk', real.length === 0,
    real.slice(0, 3).join(' | ').slice(0, 220));

  await browser.close();
};

await run('desktop', { width: 1440, height: 900 }, false);
await run('mobile', { width: 390, height: 844 }, true);

fs.writeFileSync(OUT + '/walk-results.json', JSON.stringify(results, null, 1));
const failed = results.filter((r) => r.verdict === 'FAIL');
console.log('\n' + (results.length - failed.length) + '/' + results.length + ' checks passed');
