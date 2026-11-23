/**
 * THE SUBSCRIPTION DOOR IS RETIRED — AND NOTHING CLAIMS A PURCHASE IT CANNOT
 * PROVE.
 *
 * ═══ THE RULING ═════════════════════════════════════════════════════════════
 *
 *   FOUNDER / CHIEF ARCHITECT, 2026-11-23, OPTION A:
 *   «/sovereign-balance is the sole authoritative purchase surface for creator
 *   credit packages.» `/subscribe` and `/subscribe/success` are retired by
 *   permanent redirect.
 *
 * ═══ WHAT /subscribe ACTUALLY WAS, MEASURED BEFORE THE RULING ══════════════
 *
 *   · It POSTed to /api/billing/checkout with NO `packId`, which that route
 *     requires — so every press answered 400, and the Creator read an English
 *     sentence naming `start / create / achieve`: three packages retired on
 *     2026-09-27 that were never sold.
 *   · Even with a packId it could not work: Paymob needs four environment
 *     variables and the production server has none. The live gateway is XPay.
 *   · It advertised «الاشتراك السيادي الشهري … بفوترة شهرية» while
 *     SOVEREIGN_PACKAGES declares `recurrence: 'one-time'`.
 *   · NOT ONE internal link pointed at it.
 *
 * ═══ THE ONE THAT MATTERS MOST ═════════════════════════════════════════════
 *
 *   The ruling: «Do not treat a browser visit or redirect as proof of
 *   payment.» /subscribe/success WAS that defect — it announced «يجري تفعيل
 *   اشتراكك» to anyone who opened it, consulting no transaction at all.
 *
 *   Section 3 below holds the property that makes the redirect safe: the
 *   destination asserts nothing about a purchase, and the only thing that can
 *   grant Balance is the signature-verified webhook.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const code = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const CONFIG = read('next.config.ts');
const CONFIG_CODE = code(CONFIG);

/* ═══ 1 · THE DOOR IS GONE, AND THE ADDRESS STILL LEADS SOMEWHERE REAL ═══ */

describe('١ · البابُ أُزيل، والعنوانُ يَصِل سطحًا حقيقيًّا', () => {
  it('the retired pages are REMOVED, not hidden behind a redirect', () => {
    // «يُزال لا يُغطّى» — a constitutional rule of this Empire. A page that
    // can never render is dead code that will one day be found and revived.
    for (const gone of ['app/subscribe/page.tsx', 'app/subscribe/SubscribeForm.tsx',
                        'app/subscribe/success/page.tsx']) {
      expect(existsSync(join(ROOT, gone))).toBe(false);
    }
  });

  it('both addresses redirect permanently to the sole purchase surface', () => {
    for (const source of ['/subscribe', '/subscribe/success']) {
      const entry = new RegExp(
        `source:\\s*'${source.replace('/', '\\/')}'\\s*,\\s*destination:\\s*'\\/sovereign-balance'\\s*,\\s*permanent:\\s*true`,
      );
      expect(CONFIG_CODE).toMatch(entry);
    }
  });

  it('and the destination exists, so the redirect cannot land on a wall', () => {
    expect(existsSync(join(ROOT, 'app/sovereign-balance/page.tsx'))).toBe(true);
  });

  it('no redirect loop can form', () => {
    // The destination must never itself be a redirect source, and the page
    // must not bounce an anonymous visitor back to a door.
    expect(CONFIG_CODE).not.toMatch(/source:\s*'\/sovereign-balance'/);
    const page = code(read('app/sovereign-balance/page.tsx'));
    expect(page).not.toMatch(/redirect\(/);
    // It admits an anonymous visitor rather than refusing them.
    expect(page).toContain('authenticated={!!session}');
  });
});

/* ═══ 2 · NO LINK, NO KEY AND NO CALLER IS LEFT POINTING AT THE DOOR ════ */

describe('٢ · لا رابطَ ولا مفتاحَ ولا مُستدعٍ بقيَ يُشير إلى الباب', () => {
  /** Every TS/TSX file under app/ and src/, excluding tests. */
  function sourceFiles(): string[] {
    const found: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(join(ROOT, dir))) {
        if (['node_modules', '.next', '.git', '__tests__'].includes(entry)) continue;
        const rel = join(dir, entry);
        if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
        else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) found.push(rel);
      }
    };
    walk('app');
    walk('src');
    return found;
  }

  it('nothing navigates to either retired address', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const src = code(read(file));
      if (/href=["']\/subscribe|to=["']\/subscribe|push\(['"]\/subscribe|goTo\(['"]\/subscribe|redirect\(['"]\/subscribe/.test(src)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('and the instrument really read the platform', () => {
    expect(sourceFiles().length).toBeGreaterThan(300);
  });

  it('every retired string is gone from BOTH dictionaries', () => {
    const AR = read('src/creator-language/dictionary/ar.ts');
    const EN = read('src/creator-language/dictionary/en.ts');
    for (const retired of ['subscribe.kicker', 'subscribe.title', 'subscribe.subtitle',
                           'subscribe.planName', 'subscribe.planDesc', 'subscribe.checkingStatus',
                           'subscribe.signInPrompt', 'subscribe.submitBusy',
                           'subscribe.errorUnreachable', 'subscribe.errorFallback',
                           'subscribeSuccess.kicker', 'subscribeSuccess.title',
                           'subscribeSuccess.subtitleNamed', 'subscribeSuccess.subtitleAnonymous',
                           'subscribeSuccess.enterButton']) {
      expect(AR).not.toContain(`'${retired}':`);
      expect(EN).not.toContain(`'${retired}':`);
    }
  });

  it('and no surface calls the Balance a monthly subscription any more', () => {
    // SOVEREIGN_PACKAGES: «NOTHING here is a subscription; nothing auto-renews.»
    // On the CODE, never the comments: the note above each dictionary's
    // retired block QUOTES the phrases to explain why they went. An
    // instrument that reads a comment is an instrument that lies — this
    // repository has paid for that lesson five times.
    const AR = code(read('src/creator-language/dictionary/ar.ts'));
    const EN = code(read('src/creator-language/dictionary/en.ts'));
    expect(AR).not.toContain('بفوترة شهرية');
    expect(AR).not.toContain('الاشتراك السيادي الشهري');
    expect(EN).not.toContain('billed monthly');
    expect(EN).not.toContain('Creator Monthly');
  });

  it('the three keys that remain are kept because a LIVE engine reads them', () => {
    // An engine with no caller is a connection debt, not a deletion. The
    // awareness engine's `subscribe` threshold has its own passing tests.
    const REGISTRY = read('src/button-engine/action-registry.ts');
    for (const kept of ['subscribe.signInLink', 'subscribe.submitIdle', 'subscribe.founderNotice']) {
      expect(REGISTRY).toContain(kept);
      expect(read('src/creator-language/dictionary/ar.ts')).toContain(`'${kept}':`);
      expect(read('src/creator-language/dictionary/en.ts')).toContain(`'${kept}':`);
    }
  });

  it('the dictionaries still agree key for key', () => {
    const keys = (src: string) =>
      [...src.matchAll(/'(subscribe(?:Success)?\.[a-zA-Z]+)':/g)].map((m) => m[1]!).sort();
    expect(keys(read('src/creator-language/dictionary/ar.ts')))
      .toEqual(keys(read('src/creator-language/dictionary/en.ts')));
  });
});

/* ═══ 3 · A PURCHASE IS PROVED BY A TRANSACTION, NEVER BY A VISIT ═══════ */

describe('٣ · الشراءُ تُثبِته معاملةٌ لا زيارةُ متصفِّح', () => {
  const BALANCE_PAGE = code(read('app/sovereign-balance/page.tsx'));
  const BALANCE_CLIENT = code(read('app/sovereign-balance/SovereignBalanceClient.tsx'));
  const XPAY_CHECKOUT = code(read('app/api/sovereign/economy/xpay-checkout/route.ts'));
  const XPAY_WEBHOOK = code(read('app/api/sovereign/economy/xpay-webhook/route.ts'));

  it('the destination never announces a purchase from the URL it was opened with', () => {
    // THE DEFECT THAT WAS REMOVED: /subscribe/success said «يجري تفعيل
    // اشتراكك» to anyone who opened it. The Balance surface says nothing of
    // the kind — it does not even read the `paid` parameter.
    expect(BALANCE_CLIENT).not.toMatch(/searchParams|URLSearchParams|[?&]paid=/);
    expect(BALANCE_PAGE).not.toMatch(/[?&]paid/);
  });

  it('it shows a balance read from the database, not a claim', () => {
    expect(BALANCE_PAGE).toContain('availableUnits');
  });

  it('the live payment path never named the retired route', () => {
    // Audited as the ruling required, before anything was touched.
    expect(XPAY_CHECKOUT).not.toContain('subscribe');
    expect(XPAY_CHECKOUT).toContain("returnUrl(origin, '/sovereign-balance?paid=1')");
    expect(XPAY_CHECKOUT).toContain("returnUrl(origin, '/sovereign-balance')");
    expect(code(read('src/economy/payment/return-destination.ts')))
      .toContain("DEFAULT_RETURN_PATH = '/sovereign-vault-palace'");
  });

  it('and only a signature-verified webhook can grant Balance', () => {
    expect(XPAY_WEBHOOK).toContain("request.headers.get('xpay-signature')");
    expect(XPAY_WEBHOOK).toContain('handlePaymentWebhook');
    expect(XPAY_WEBHOOK).toContain("result.reason === 'signature_invalid'");
  });
});

/* ═══ 4 · THE PROTECTED SYSTEMS, UNTOUCHED ═════════════════════════════ */

describe('٤ · الأنظمةُ المحميّةُ لم تُمَسّ', () => {
  it('one pricing authority, with its four approved packages intact', () => {
    const PRICING = read('src/economy/pricing/sovereign-value-balance.ts');
    for (const line of [
      "packageId: 'asas',     nameAr: 'الأساس',   priceEgp: 99,    balanceUnits: 1_375",
      "packageId: 'irtiqaa',  nameAr: 'الارتقاء', priceEgp: 249,   balanceUnits: 3_450",
      "packageId: 'ihtiraf',  nameAr: 'الاحتراف', priceEgp: 499,   balanceUnits: 6_900",
      "packageId: 'riyada',   nameAr: 'الريادة',  priceEgp: 1_200, balanceUnits: 16_670",
    ]) {
      expect(PRICING).toContain(line);
    }
    expect(PRICING).toContain("recurrence: 'one-time'");
  });

  it('the payment boundary still adapts that one record rather than restating it', () => {
    const PACKS = read('src/economy/payment/credit-packs.ts');
    expect(PACKS).toContain('SOVEREIGN_PACKAGES.map');
    // No price typed a second time.
    expect(code(PACKS)).not.toMatch(/priceEgp:\s*\d/);
  });

  it('the entitlement semantics are unchanged', () => {
    expect(code(read('src/billing/entitlement-service.ts')))
      .toContain("subscription?.status === 'active'");
  });

  it('and no second purchase interface was created', () => {
    // The ruling: «Do not create a second purchase interface or a second
    // pricing authority.» EXACTLY ONE page in this Empire may open a
    // checkout. /subscribe was the second, and it is gone.
    //
    // The payment-simulation page is deliberately NOT in this list: it posts
    // to /api/sovereign/economy/simulate-payment, a rehearsal route that says
    // on its own face that no money moves — it opens no checkout.
    const callers: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(join(ROOT, dir))) {
        if (['node_modules', '.next', '.git', '__tests__', 'api'].includes(entry)) continue;
        const rel = join(dir, entry);
        if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
        else if (/\.tsx?$/.test(entry) && /xpay-checkout|billing\/checkout/.test(read(rel))) {
          callers.push(rel);
        }
      }
    };
    walk('app');
    expect(callers).toEqual([join('app', 'sovereign-balance', 'SovereignBalanceClient.tsx')]);
  });
});
