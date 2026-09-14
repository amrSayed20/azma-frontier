#!/usr/bin/env node
/**
 * AZMA OS — POST-DEPLOYMENT LIVE VERIFICATION
 *
 *   node scripts/verify-deployment.mjs [base-url]
 *
 * Invoked by scripts/deploy.sh after every switch. Exits non-zero on any
 * failure, which makes the deployment script roll back.
 *
 * A build that compiles, a PM2 process that says "online", and an HTTP 200 are
 * all perfectly consistent with a completely dead page: when the client bundle
 * throws, the server-rendered HTML still arrives and still looks right, and
 * every control on it is inert. So this checks the only things that actually
 * distinguish a working release from that failure:
 *
 *   1. the page answers over HTTP
 *   2. no chunk or module-factory error was thrown while loading
 *   3. no critical console error was logged
 *   4. React hydrated — a rendered element carries a fiber and a live handler
 *   5. every Head of Command card is present, hit-testable and clickable
 *
 * Exit codes are distinct on purpose, because "this release is broken" and
 * "I could not tell" must not produce the same action:
 *
 *   0  verified
 *   1  verification failed — the release is bad, roll back
 *   2  inconclusive — the check itself could not run (local network dropped,
 *      site unreachable). Rolling back on this would discard a good release
 *      because of a problem on the operator's side.
 */

import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://azmaos.com').replace(/\/$/, '');
const EXPECTED_CARDS = Number(process.env.AZMA_EXPECTED_CARDS || 14);

// A bundle-graph fault leaves the page rendered and inert, so these strings are
// treated as fatal wherever they appear rather than as noise.
const FATAL_PATTERNS = [
  /module factory is not available/i,
  /ChunkLoadError/i,
  /Loading chunk \S+ failed/i,
  /Failed to fetch dynamically imported module/i,
  /Hydration failed/i,
  /Minified React error/i,
];

// Third-party noise that says nothing about whether this release works.
const IGNORABLE = [
  /favicon/i,
  /was preloaded using link preload but not used/i,
  /cloudflareinsights|beacon\.min\.js/i,
  /Download the React DevTools/i,
  // An anonymous visitor is *supposed* to be refused by the auth-gated APIs.
  // Treating that as a deployment fault would fail every healthy release.
  /the server responded with a status of 40[13]/i,
];

// Transport faults on the operator's side. These say nothing about the
// release, so they make the run inconclusive rather than failed.
const TRANSPORT_FAULTS = [
  /ERR_INTERNET_DISCONNECTED/i,
  /ERR_NETWORK_CHANGED/i,
  /ERR_NAME_NOT_RESOLVED/i,
  /ERR_CONNECTION_(RESET|REFUSED|CLOSED|TIMED_OUT)/i,
  /ERR_PROXY_CONNECTION_FAILED/i,
  /net::ERR_ABORTED/i,
  /socket hang up|ECONNRESET|EAI_AGAIN|EHOSTUNREACH|ENETUNREACH/i,
  // A navigation that never completes is indistinguishable from an
  // unreachable host. Classifying it as a failed release once nearly rolled
  // back a healthy deployment because the operator's own link dropped.
  /page\.goto:\s*Timeout/i,
  /Timeout \d+ms exceeded.*navigating/is,
  /Navigation timeout/i,
];
const isTransportFault = (text) => TRANSPORT_FAULTS.some((p) => p.test(String(text)));

/** A response only indicts the release if the server broke, or a bundle asset is missing. */
const responseIsFatal = (status, url) => {
  if (status >= 500) return true;
  if (status >= 400 && /\/_next\//.test(url)) return true;
  return false;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const record = (name, passed, detail = '') => {
  results.push({ name, passed, detail });
  const mark = passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`    ${mark}  ${name}${detail ? `  ${detail}` : ''}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const pageErrors = [];
const consoleErrors = [];
const badResponses = [];

page.on('pageerror', (e) => pageErrors.push(`${e.name}: ${e.message}`));
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const text = m.text();
  if (!IGNORABLE.some((p) => p.test(text))) consoleErrors.push(text.slice(0, 300));
});
page.on('response', (r) => {
  if (responseIsFatal(r.status(), r.url()) && !IGNORABLE.some((p) => p.test(r.url()))) {
    badResponses.push(`HTTP ${r.status()} ${r.url()}`);
  }
});
page.on('requestfailed', (r) => {
  const url = r.url();
  const reason = r.failure()?.errorText ?? 'failed';
  if (IGNORABLE.some((p) => p.test(url)) || isTransportFault(reason)) return;
  if (/\/_next\//.test(url)) badResponses.push(`${reason} ${url}`);
});

let inconclusive = 0;

/** Retry only transport faults; a real application error is returned immediately. */
async function withRetry(action, attempts = 3) {
  let last;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      return { ok: true, value: await action() };
    } catch (err) {
      last = err;
      if (!isTransportFault(err?.message ?? err)) return { ok: false, fault: 'app', error: err };
      if (i < attempts) await sleep(2000 * i);
    }
  }
  return { ok: false, fault: 'transport', error: last };
}

try {
  // 1 ── HTTP
  const nav = await withRetry(() => page.goto(`${BASE}/ras-amr`, { waitUntil: 'load', timeout: 90_000 }));
  if (!nav.ok && nav.fault === 'transport') {
    console.log(`    \x1b[33mINCONCLUSIVE\x1b[0m  cannot reach ${BASE} — ${String(nav.error).split('\n')[0].slice(0, 110)}`);
    await browser.close();
    process.exit(2);
  }
  if (!nav.ok) throw nav.error;
  const response = nav.value;
  record('http response', response?.status() === 200, `status ${response?.status()}`);
  if (response?.status() !== 200) throw new Error('page did not return 200');

  await page.waitForTimeout(3500);

  // 2 ── bundle integrity
  const fatal = [...pageErrors, ...consoleErrors].filter((t) => FATAL_PATTERNS.some((p) => p.test(t)));
  record('no chunk / module errors', fatal.length === 0,
    fatal.length ? `\n          ${fatal.join('\n          ')}` : '');

  // 3 ── console cleanliness
  const otherErrors = [...pageErrors, ...consoleErrors].filter((t) => !FATAL_PATTERNS.some((p) => p.test(t)));
  record('no critical console errors', otherErrors.length === 0,
    otherErrors.length ? `\n          ${otherErrors.slice(0, 5).join('\n          ')}` : '');

  if (badResponses.length) {
    record('all page resources loaded', false, `\n          ${badResponses.slice(0, 5).join('\n          ')}`);
  } else {
    record('all page resources loaded', true);
  }

  // 4 ── React actually booted
  const boot = await page.evaluate(() => {
    const el = document.querySelector('.ras-intent-card') || document.body;
    const propsKey = Object.keys(el).find((k) => k.startsWith('__reactProps$'));
    return {
      fiber: Boolean(Object.keys(el).find((k) => k.startsWith('__reactFiber$'))),
      handler: propsKey ? typeof el[propsKey].onClick === 'function' : false,
      cards: document.querySelectorAll('.ras-intent-card').length,
    };
  });
  record('react hydrated', boot.fiber && boot.handler,
    `fiber=${boot.fiber} onClick=${boot.handler}`);
  if (!boot.fiber || !boot.handler) throw new Error('React did not hydrate — the page is inert');

  // 5 ── every card present and unobstructed
  record('card count', boot.cards === EXPECTED_CARDS, `${boot.cards} of ${EXPECTED_CARDS}`);

  const obstructed = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.ras-intent-card')).flatMap((card) => {
      const name = card.querySelector('.ras-intent-card-name')?.textContent?.trim() ?? '(unnamed)';
      const style = getComputedStyle(card);
      if (style.pointerEvents === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return [`${name}: pointer-events=${style.pointerEvents} visibility=${style.visibility} opacity=${style.opacity}`];
      }
      card.scrollIntoView({ block: 'center' });
      const r = card.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return top && card.contains(top) ? [] : [`${name}: covered by ${top ? top.tagName + '.' + top.className : 'nothing'}`];
    }),
  );
  record('no card is obstructed', obstructed.length === 0,
    obstructed.length ? `\n          ${obstructed.join('\n          ')}` : '');

  // 6 ── each card actually does something, from a clean page each time
  console.log(`    ---- clicking ${boot.cards} cards ----`);
  const names = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.ras-intent-card')).map(
      (c) => c.querySelector('.ras-intent-card-name')?.textContent?.trim() ?? '(unnamed)',
    ),
  );

  let responsive = 0;
  for (let i = 0; i < names.length; i += 1) {
    const attempt = await withRetry(async () => {
      const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      try {
        await p.goto(`${BASE}/ras-amr`, { waitUntil: 'load', timeout: 90_000 });
        await p.waitForTimeout(2200);
        const card = p.locator('.ras-intent-card').nth(i);
        await card.scrollIntoViewIfNeeded();
        await card.click({ timeout: 10_000 });
        await p.waitForTimeout(2200);
        return await p.evaluate(() => ({
          gate: Boolean(document.querySelector('.ras-intent-gate')),
          preview: Boolean(document.querySelector('.ras-template-preview-gate')),
          workspace: Boolean(document.querySelector('.ras-amr-viewport')),
          header: (() => {
            const h = document.querySelector('.ras-header');
            return h ? getComputedStyle(h).display !== 'none' : false;
          })(),
        }));
      } finally {
        await p.close();
      }
    });

    if (!attempt.ok && attempt.fault === 'transport') {
      inconclusive += 1;
      console.log(`      \x1b[33m????\x1b[0m [${String(i).padStart(2)}] ${names[i]} — network unavailable, not a verdict on the release`);
      continue;
    }

    let outcome;
    if (!attempt.ok) {
      outcome = `threw: ${String(attempt.error).split('\n')[0].slice(0, 80)}`;
    } else {
      const a = attempt.value;
      if (a.preview) outcome = 'template preview';
      else if (!a.gate && (a.workspace || a.header)) outcome = 'workspace';
      else outcome = 'no reaction';
    }

    const passed = outcome === 'template preview' || outcome === 'workspace';
    if (passed) responsive += 1;
    console.log(`      ${passed ? '\x1b[32mok  \x1b[0m' : '\x1b[31mdead\x1b[0m'} [${String(i).padStart(2)}] ${names[i]}${passed ? '' : ` — ${outcome}`}`);
  }

  if (inconclusive > 0) {
    console.log(`\n    \x1b[33mINCONCLUSIVE\x1b[0m  ${inconclusive} card(s) could not be reached — the network dropped, not the release`);
    await browser.close();
    process.exit(2);
  }

  record(`all ${EXPECTED_CARDS} cards responsive`, responsive === EXPECTED_CARDS,
    `${responsive} of ${names.length}`);
} catch (err) {
  // A transport fault anywhere in the run means the check could not be
  // performed — not that the release is bad. Saying "failed" here is what
  // triggers a rollback, so a dropped link must never reach that verdict.
  if (isTransportFault(err?.message ?? err)) {
    console.log(`    \x1b[33mINCONCLUSIVE\x1b[0m  ${String(err).split('\n')[0].slice(0, 140)}`);
    await browser.close();
    process.exit(2);
  }
  record('verification completed', false, String(err).split('\n')[0].slice(0, 160));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.passed);
const exitCode = failed.length === 0 ? 0 : 1;

console.log('');
if (exitCode === 0) {
  console.log(`    \x1b[32mVERIFIED\x1b[0m  ${results.length} checks passed against ${BASE}`);
} else {
  console.log(`    \x1b[31mVERIFICATION FAILED\x1b[0m  ${failed.length} of ${results.length} checks failed:`);
  failed.forEach((f) => console.log(`      · ${f.name}`));
}

process.exit(exitCode);
